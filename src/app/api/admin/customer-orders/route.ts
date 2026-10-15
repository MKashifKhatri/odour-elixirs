import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/helpers/requireUser";
import { createAdminClient } from "@/lib/supabase/server";
import { supabaseErrorMessage } from "@/lib/supabase/errorMessage";

export const dynamic = "force-dynamic";
const statuses = ["new", "contacted", "confirmed", "processing", "shipped", "delivered", "cancelled"] as const;

export async function GET() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ success: false, message: "Connect Supabase to view order inquiries." }, { status: 503 });
  if (!(await requireAdmin())) return NextResponse.json({ success: false, message: "Admin access is required." }, { status: 403 });
  const db = createAdminClient() as any;
  const { data, error } = await db.from("customer_orders").select("*, customer:customers(name,phone,email), items:customer_order_items(product_name_snapshot,quantity,requested_unit_price,size_snapshot,variant_id)").order("created_at", { ascending: false }).limit(300);
  if (error) return NextResponse.json({ success: false, message: supabaseErrorMessage(error, "Could not load order inquiries. Please try again.") }, { status: 500 });
  return NextResponse.json({ success: true, orders: data || [] });
}

export async function PATCH(request: NextRequest) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ success: false, message: "Connect Supabase to update order inquiries." }, { status: 503 });
  if (!(await requireAdmin())) return NextResponse.json({ success: false, message: "Admin access is required." }, { status: 403 });
  const parsed = z.object({ id: z.string().uuid(), status: z.enum(statuses) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, message: "Invalid order update." }, { status: 400 });
  const db = createAdminClient() as any;
  const { error } = await db.rpc("update_customer_order_status", { p_order_id: parsed.data.id, p_status: parsed.data.status });
  if (error) {
    const status = error.code === "P0001" ? 409 : 500;
    return NextResponse.json({ success: false, message: supabaseErrorMessage(error, "Could not update this order inquiry. Please try again.") }, { status });
  }
  return NextResponse.json({ success: true });
}
