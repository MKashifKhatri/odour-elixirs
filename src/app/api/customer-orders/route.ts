import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { supabaseErrorMessage } from "@/lib/supabase/errorMessage";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ success: false, message: "Customer order history is not connected yet." }, { status: 503 });
  try {
    const session = createClient();
    const { data: { user } } = await session.auth.getUser();
    if (!user) return NextResponse.json({ success: false, message: "Sign in to view your saved order inquiries." }, { status: 401 });
    const db = createAdminClient() as any;
    const { data: customer, error: customerError } = await db.from("customers").select("id").eq("auth_user_id", user.id).maybeSingle();
    if (customerError) throw customerError;
    if (!customer) return NextResponse.json({ success: true, orders: [] });
    const { data: orders, error } = await db.from("customer_orders").select("*, items:customer_order_items(product_name_snapshot,quantity,requested_unit_price,size_snapshot,variant_id)").eq("customer_id", customer.id).order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ success: true, orders: orders || [] });
  } catch (error) {
    console.error("Customer order history lookup failed:", error);
    return NextResponse.json({ success: false, message: supabaseErrorMessage(error as { code?: string; message?: string }, "Could not load your order inquiries.") }, { status: 500 });
  }
}
