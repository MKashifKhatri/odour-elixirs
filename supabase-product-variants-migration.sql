-- Backward-compatible product catalog fields for ESHOPY.
-- Existing size/color/quantity columns remain intact for older app versions.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS brand TEXT,
  ADD COLUMN IF NOT EXISTS subcategory TEXT,
  ADD COLUMN IF NOT EXISTS sizes TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS compare_at_price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS warranty TEXT,
  ADD COLUMN IF NOT EXISTS variants JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Preserve all existing size text as a normalized array without replacing the legacy field.
UPDATE public.products
SET sizes = regexp_split_to_array(btrim(size), '\s+')
WHERE cardinality(sizes) = 0 AND NULLIF(btrim(size), '') IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products (brand);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON public.products (subcategory);
