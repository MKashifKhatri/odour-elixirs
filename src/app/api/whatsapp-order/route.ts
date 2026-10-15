import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { supabaseErrorMessage } from "@/lib/supabase/errorMessage";

const orderSchema = z.object({
  customer: z.object({ name: z.string().trim().min(2).max(120), phone: z.string().trim().min(10).max(24), email: z.string().email().optional().or(z.literal("")), address: z.string().trim().min(4).max(300), city: z.string().trim().min(2).max(100), state: z.string().trim().min(2).max(100), postal_code: z.string().trim().min(4).max(12), note: z.string().max(1000).optional(), source: z.literal("website") }),
  items: z.array(z.object({ id: z.string().uuid(), variant_id: z.string().uuid().optional(), name: z.string().trim().min(1).max(160), slug: z.string().max(180).optional(), price: z.number().nonnegative().max(1000000), quantity: z.number().int().min(1).max(50), size: z.string().max(50).optional() })).min(1).max(40),
  total: z.number().nonnegative().max(10000000),
});

export async function POST(request: NextRequest) {
  const parsed = orderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, message: "Please check your contact and order details." }, { status: 400 });
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ success: false, saved: false, message: "Customer database is not connected yet." }, { status: 503 });
  }

  try {
    const session = createClient();
    const { data: { user } } = await session.auth.getUser();
    const db = createAdminClient() as any;
    const customerInput = parsed.data.customer;
    const ids = parsed.data.items.map((item) => item.id);
    const { data: catalog, error: catalogError } = await db.from("products").select("id,name,slug,price,cost_price,quantity,is_active,variants").in("id", ids);
    if (catalogError) throw catalogError;
    const productsById = new Map<string, any>((catalog || []).map((product: any) => [product.id, product] as [string, any]));
    const itemRows: Array<Record<string, unknown>> = [];
    for (const item of parsed.data.items) {
      const product = productsById.get(item.id);
      if (!product || !product.is_active) {
        return NextResponse.json({ success: false, message: `${item.name} is no longer available.` }, { status: 409 });
      }
      const variants = Array.isArray(product.variants) ? product.variants as Record<string, any>[] : [];
      let variant: Record<string, any> | undefined;
      if (variants.length) {
        variant = variants.find((candidate) => candidate.id === item.variant_id);
        if (!item.variant_id || !variant || variant.is_active === false) {
          return NextResponse.json({ success: false, message: `Choose an active size for ${product.name}.` }, { status: 409 });
        }
      } else if (item.variant_id) {
        return NextResponse.json({ success: false, message: `The selected size for ${product.name} has changed. Refresh the product page.` }, { status: 409 });
      }

      const available = Math.max(0, Number(variant?.stock_quantity ?? variant?.stock ?? product.quantity ?? 0) || 0);
      if (item.quantity > available) {
        return NextResponse.json({ success: false, message: available > 0 ? `Only ${available} ${variant?.size || "unit"}${available === 1 ? "" : "s"} of ${product.name} available.` : `${product.name} is out of stock.` }, { status: 409 });
      }
      const sellingPrice = Number(variant?.selling_price ?? variant?.price ?? product.price);
      if (!Number.isFinite(sellingPrice) || sellingPrice <= 0) {
        return NextResponse.json({ success: false, message: `The price for ${product.name} is unavailable.` }, { status: 409 });
      }
      itemRows.push({
        product_id: product.id,
        variant_id: variant?.id || null,
        product_name_snapshot: product.name,
        product_slug_snapshot: product.slug,
        quantity: item.quantity,
        requested_unit_price: sellingPrice,
        size_snapshot: variant?.size || item.size || null,
      });
    }

    const normalizedPhone = customerInput.phone.replace(/\D/g, "");
    const { data: existing, error: findError } = await db.from("customers").select("id,auth_user_id").eq("phone", normalizedPhone).maybeSingle();
    if (findError) throw findError;

    let customerId = existing?.id;
    if (customerId) {
      const update: Record<string, unknown> = { name: customerInput.name, email: customerInput.email || null, address: customerInput.address, city: customerInput.city, state: customerInput.state, postal_code: customerInput.postal_code, updated_at: new Date().toISOString() };
      if (user && !existing.auth_user_id) update.auth_user_id = user.id;
      const { error: updateError } = await db.from("customers").update(update).eq("id", customerId);
      if (updateError) throw updateError;
    } else {
      const { data: created, error: createError } = await db.from("customers").insert({ auth_user_id: user?.id || null, name: customerInput.name, phone: normalizedPhone, email: customerInput.email || null, address: customerInput.address, city: customerInput.city, state: customerInput.state, postal_code: customerInput.postal_code, source: "website" }).select("id").single();
      if (createError) throw createError;
      customerId = created.id;
    }

    const estimate = itemRows.reduce((sum, item) => sum + Number(item.requested_unit_price) * Number(item.quantity), 0);
    const { data: order, error: orderError } = await db.from("customer_orders").insert({ customer_id: customerId, channel: "whatsapp", status: "new", payment_status: "unpaid", estimated_total: estimate, customer_note: customerInput.note || null }).select("id").single();
    if (orderError) throw orderError;
    const { error: itemsError } = await db.from("customer_order_items").insert(itemRows.map((item) => ({ ...item, order_id: order.id })));
    if (itemsError) {
      await db.from("customer_orders").delete().eq("id", order.id);
      throw itemsError;
    }
    return NextResponse.json({ success: true, saved: true, orderId: order.id });
  } catch (error) {
    console.error("Could not save WhatsApp inquiry:", error);
    return NextResponse.json({ success: false, saved: false, message: supabaseErrorMessage(error as { code?: string; message?: string }, "Your WhatsApp message is ready, but this inquiry could not be saved. Please try again.") }, { status: 503 });
  }
}
