ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (cost_price >= 0),
  ADD COLUMN IF NOT EXISTS variants JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.customer_order_items
  ADD COLUMN IF NOT EXISTS variant_id UUID;

ALTER TABLE public.inventory_movements
  ADD COLUMN IF NOT EXISTS variant_id UUID;

CREATE TABLE IF NOT EXISTS public.customer_order_item_costs (
  order_item_id UUID PRIMARY KEY REFERENCES public.customer_order_items(id) ON DELETE CASCADE,
  variant_id UUID,
  cost_price_snapshot NUMERIC(12,2) NOT NULL CHECK (cost_price_snapshot >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.customer_order_item_costs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.customer_order_item_costs FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.customer_order_item_costs TO service_role;

CREATE INDEX IF NOT EXISTS customer_order_items_variant_idx
  ON public.customer_order_items(variant_id) WHERE variant_id IS NOT NULL;

-- Convert legacy { size, color, stock } JSON variants and product-level stock
-- into stable variant IDs without discarding existing prices or inventory.
UPDATE public.products AS p
SET variants = CASE
  WHEN jsonb_typeof(p.variants) = 'array' AND jsonb_array_length(p.variants) > 0 THEN (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', CASE
          WHEN COALESCE(v.variant->>'id', '') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN v.variant->>'id'
          ELSE gen_random_uuid()::text
        END,
        'size', COALESCE(NULLIF(v.variant->>'size', ''), NULLIF(v.variant->>'size_ml', '') || ' ml', NULLIF(p.size, ''), 'One size'),
        'size_ml', CASE
          WHEN COALESCE(NULLIF(v.variant->>'size_ml', ''), NULLIF(v.variant->>'size', ''), NULLIF(p.size, '')) ~ '^[0-9]+(\.[0-9]+)?\s*(ml)?$'
          THEN regexp_replace(COALESCE(NULLIF(v.variant->>'size_ml', ''), NULLIF(v.variant->>'size', ''), p.size), '[^0-9.]', '', 'g')::NUMERIC
          ELSE NULL
        END,
        'color', COALESCE(v.variant->>'color', ''),
        'cost_price', GREATEST(0, COALESCE(NULLIF(v.variant->>'cost_price', '')::NUMERIC, p.cost_price, 0)),
        'selling_price', GREATEST(0, COALESCE(NULLIF(v.variant->>'selling_price', '')::NUMERIC, NULLIF(v.variant->>'price', '')::NUMERIC, p.price)),
        'stock_quantity', GREATEST(0, COALESCE(NULLIF(v.variant->>'stock_quantity', '')::INTEGER, NULLIF(v.variant->>'stock', '')::INTEGER, p.quantity, 0)),
        'sku', COALESCE(v.variant->>'sku', ''),
        'is_active', p.is_active AND CASE WHEN v.variant ? 'is_active' THEN COALESCE((v.variant->>'is_active')::BOOLEAN, TRUE) ELSE TRUE END
      ) ORDER BY v.ordinality
    )
    FROM jsonb_array_elements(p.variants) WITH ORDINALITY AS v(variant, ordinality)
  )
  ELSE jsonb_build_array(jsonb_build_object(
    'id', gen_random_uuid()::text,
    'size', COALESCE(NULLIF(p.size, ''), 'One size'),
    'size_ml', CASE
      WHEN COALESCE(p.size, '') ~ '^[0-9]+(\.[0-9]+)?\s*(ml)?$'
      THEN regexp_replace(p.size, '[^0-9.]', '', 'g')::NUMERIC
      ELSE NULL
    END,
    'color', '',
    'cost_price', GREATEST(0, COALESCE(p.cost_price, 0)),
    'selling_price', GREATEST(0, p.price),
    'stock_quantity', GREATEST(0, p.quantity),
    'sku', '',
    'is_active', p.is_active
  ))
END;

UPDATE public.customer_order_items AS item
SET variant_id = matched.variant_id
FROM LATERAL (
  SELECT (variant.value->>'id')::UUID AS variant_id
  FROM public.products AS product
  CROSS JOIN LATERAL jsonb_array_elements(COALESCE(product.variants, '[]'::jsonb)) AS variant(value)
  WHERE product.id = item.product_id
    AND (
      regexp_replace(lower(COALESCE(variant.value->>'size', '')), '\s+', '', 'g') = regexp_replace(lower(COALESCE(item.size_snapshot, '')), '\s+', '', 'g')
      OR (NULLIF(item.size_snapshot, '') IS NULL AND jsonb_array_length(product.variants) = 1)
    )
  ORDER BY variant.value->>'id'
  LIMIT 1
) AS matched
WHERE item.variant_id IS NULL AND item.product_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.update_customer_order_status(p_order_id UUID, p_status TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order public.customer_orders%ROWTYPE;
  v_product public.products%ROWTYPE;
  v_item RECORD;
  v_variant JSONB;
  v_variants JSONB;
  v_stock INTEGER;
  v_total_stock INTEGER;
  v_cost NUMERIC(12,2);
  v_reserves_inventory BOOLEAN;
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'Admin access is required' USING ERRCODE = '42501';
  END IF;
  IF p_status NOT IN ('new', 'contacted', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid order status' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_order FROM public.customer_orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found' USING ERRCODE = 'P0002'; END IF;
  IF v_order.status = p_status THEN RETURN; END IF;
  IF v_order.status IN ('shipped', 'delivered') AND p_status = 'cancelled' THEN
    RAISE EXCEPTION 'A shipped or delivered order cannot be cancelled for stock release' USING ERRCODE = 'P0001';
  END IF;

  v_reserves_inventory := p_status IN ('confirmed', 'processing', 'shipped', 'delivered');
  IF v_reserves_inventory AND v_order.status NOT IN ('confirmed', 'processing', 'shipped', 'delivered') THEN
    FOR v_item IN
      SELECT product_id, variant_id, SUM(quantity)::INTEGER AS quantity
      FROM public.customer_order_items
      WHERE order_id = p_order_id
      GROUP BY product_id, variant_id
    LOOP
      IF v_item.product_id IS NULL THEN CONTINUE; END IF;
      SELECT * INTO v_product FROM public.products WHERE id = v_item.product_id FOR UPDATE;
      IF NOT FOUND THEN RAISE EXCEPTION 'A requested product no longer exists' USING ERRCODE = 'P0001'; END IF;

      IF v_item.variant_id IS NOT NULL THEN
        SELECT entry.variant INTO v_variant
        FROM jsonb_array_elements(COALESCE(v_product.variants, '[]'::jsonb)) AS entry(variant)
        WHERE entry.variant->>'id' = v_item.variant_id::TEXT
        LIMIT 1;
        IF v_variant IS NULL THEN RAISE EXCEPTION 'A requested size is no longer available' USING ERRCODE = 'P0001'; END IF;
        IF NOT COALESCE((v_variant->>'is_active')::BOOLEAN, TRUE) THEN RAISE EXCEPTION 'A requested size is inactive' USING ERRCODE = 'P0001'; END IF;
        v_stock := GREATEST(0, COALESCE(NULLIF(v_variant->>'stock_quantity', '')::INTEGER, NULLIF(v_variant->>'stock', '')::INTEGER, 0));
        IF v_stock < v_item.quantity THEN RAISE EXCEPTION 'Only % of the requested size remain', v_stock USING ERRCODE = 'P0001'; END IF;
        v_cost := GREATEST(0, COALESCE(NULLIF(v_variant->>'cost_price', '')::NUMERIC, v_product.cost_price, 0));
        SELECT jsonb_agg(
          CASE WHEN entry.variant->>'id' = v_item.variant_id::TEXT
            THEN (entry.variant - 'stock') || jsonb_build_object('stock_quantity', v_stock - v_item.quantity)
            ELSE entry.variant
          END ORDER BY entry.ordinality
        ) INTO v_variants
        FROM jsonb_array_elements(COALESCE(v_product.variants, '[]'::jsonb)) WITH ORDINALITY AS entry(variant, ordinality);
        SELECT COALESCE(SUM(GREATEST(0, COALESCE(NULLIF(entry.variant->>'stock_quantity', '')::INTEGER, 0))), 0)::INTEGER
        INTO v_total_stock FROM jsonb_array_elements(v_variants) AS entry(variant);
        UPDATE public.products SET variants = v_variants, quantity = v_total_stock WHERE id = v_item.product_id;
      ELSE
        IF jsonb_typeof(v_product.variants) = 'array' AND jsonb_array_length(v_product.variants) > 0 THEN
          RAISE EXCEPTION 'A size must be selected for this product' USING ERRCODE = 'P0001';
        END IF;
        UPDATE public.products SET quantity = quantity - v_item.quantity
        WHERE id = v_item.product_id AND quantity >= v_item.quantity
        RETURNING cost_price INTO v_cost;
        IF NOT FOUND THEN RAISE EXCEPTION 'Product stock is no longer available' USING ERRCODE = 'P0001'; END IF;
        v_cost := GREATEST(0, COALESCE(v_cost, 0));
      END IF;

      INSERT INTO public.customer_order_item_costs (order_item_id, variant_id, cost_price_snapshot)
      SELECT item.id, item.variant_id, v_cost
      FROM public.customer_order_items AS item
      WHERE item.order_id = p_order_id AND item.product_id = v_item.product_id
        AND item.variant_id IS NOT DISTINCT FROM v_item.variant_id
      ON CONFLICT (order_item_id) DO NOTHING;

      INSERT INTO public.inventory_movements (product_id, variant_id, quantity_change, reason, order_id)
      VALUES (v_item.product_id, v_item.variant_id, -v_item.quantity, 'customer_order_confirmed', p_order_id);
    END LOOP;
  ELSIF p_status = 'cancelled' AND v_order.status IN ('confirmed', 'processing') THEN
    FOR v_item IN
      SELECT product_id, variant_id, SUM(quantity)::INTEGER AS quantity
      FROM public.customer_order_items
      WHERE order_id = p_order_id
      GROUP BY product_id, variant_id
    LOOP
      IF v_item.product_id IS NULL THEN CONTINUE; END IF;
      SELECT * INTO v_product FROM public.products WHERE id = v_item.product_id FOR UPDATE;
      IF NOT FOUND THEN RAISE EXCEPTION 'A requested product no longer exists' USING ERRCODE = 'P0001'; END IF;

      IF v_item.variant_id IS NOT NULL THEN
        SELECT entry.variant INTO v_variant
        FROM jsonb_array_elements(COALESCE(v_product.variants, '[]'::jsonb)) AS entry(variant)
        WHERE entry.variant->>'id' = v_item.variant_id::TEXT
        LIMIT 1;
        IF v_variant IS NULL THEN RAISE EXCEPTION 'A requested size no longer exists' USING ERRCODE = 'P0001'; END IF;
        v_stock := GREATEST(0, COALESCE(NULLIF(v_variant->>'stock_quantity', '')::INTEGER, 0));
        SELECT jsonb_agg(
          CASE WHEN entry.variant->>'id' = v_item.variant_id::TEXT
            THEN (entry.variant - 'stock') || jsonb_build_object('stock_quantity', v_stock + v_item.quantity)
            ELSE entry.variant
          END ORDER BY entry.ordinality
        ) INTO v_variants
        FROM jsonb_array_elements(COALESCE(v_product.variants, '[]'::jsonb)) WITH ORDINALITY AS entry(variant, ordinality);
        SELECT COALESCE(SUM(GREATEST(0, COALESCE(NULLIF(entry.variant->>'stock_quantity', '')::INTEGER, 0))), 0)::INTEGER
        INTO v_total_stock FROM jsonb_array_elements(v_variants) AS entry(variant);
        UPDATE public.products SET variants = v_variants, quantity = v_total_stock WHERE id = v_item.product_id;
      ELSE
        UPDATE public.products SET quantity = quantity + v_item.quantity WHERE id = v_item.product_id;
      END IF;
      INSERT INTO public.inventory_movements (product_id, variant_id, quantity_change, reason, order_id)
      VALUES (v_item.product_id, v_item.variant_id, v_item.quantity, 'customer_order_cancelled', p_order_id);
    END LOOP;
  END IF;

  UPDATE public.customer_orders SET status = p_status, updated_at = NOW() WHERE id = p_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.update_customer_order_status(UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_customer_order_status(UUID, TEXT) TO service_role;

NOTIFY pgrst, 'reload schema';