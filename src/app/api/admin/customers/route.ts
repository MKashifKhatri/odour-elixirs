import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/helpers/requireUser";
import { createAdminClient } from "@/lib/supabase/server";
import { supabaseErrorMessage } from "@/lib/supabase/errorMessage";

export const dynamic = "force-dynamic";

const customerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(10).max(24),
  email: z.string().trim().email().optional().or(z.literal("")),
  address: z.string().trim().max(500).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  postal_code: z.string().trim().max(20).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export async function GET() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ success: false, message: "Connect Supabase to manage customer records." }, { status: 503 });
  const profile = await requireAdmin();
  if (!profile) return NextResponse.json({ success: false, message: "Admin access is required." }, { status: 403 });
  const db = createAdminClient() as any;
  const { data, error } = await db.from("customers").select("*").order("created_at", { ascending: false }).limit(500);
  if (error) return NextResponse.json({ success: false, message: supabaseErrorMessage(error, "Could not load customers. Please try again.") }, { status: 500 });
  return NextResponse.json({ success: true, customers: data || [] });
}

export async function POST(request: NextRequest) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ success: false, message: "Connect Supabase to save customer records." }, { status: 503 });
  const profile = await requireAdmin();
  if (!profile) return NextResponse.json({ success: false, message: "Admin access is required." }, { status: 403 });
  const parsed = customerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, message: "Check the customer details and try again." }, { status: 400 });
  const phone = parsed.data.phone.replace(/\D/g, "");
  if (phone.length < 10 || phone.length > 15) return NextResponse.json({ success: false, message: "Enter a valid phone number with country code if needed." }, { status: 400 });
  const db = createAdminClient() as any;
  const fields = { ...parsed.data, phone, email: parsed.data.email || null, source: "manual", updated_at: new Date().toISOString() };
  const { data: existing } = await db.from("customers").select("id").eq("phone", phone).maybeSingle();
  const result = existing
    ? await db.from("customers").update(fields).eq("id", existing.id).select("*").single()
    : await db.from("customers").insert({ ...fields, status: "active" }).select("*").single();
  if (result.error) return NextResponse.json({ success: false, message: supabaseErrorMessage(result.error, "Could not save this customer. Please try again.") }, { status: 500 });
  return NextResponse.json({ success: true, customer: result.data });
}
