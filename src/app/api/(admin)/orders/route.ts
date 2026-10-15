import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { error, success } from "@/helpers/apiResponseWrapper";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json(error(401, "Unauthorized | Token expired"));

    const adminSupabase = createAdminClient();
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json(error(403, "You are not authorized to view orders"));
    }

    // Get all orders with user info and payment info
    const { data: orders, error: fetchError } = await adminSupabase
      .from("orders")
      .select("*, user:profiles(name, email), payments(*)")
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching orders:", fetchError);
      return NextResponse.json(error(500, "Something went wrong"));
    }

    return NextResponse.json(success(200, orders));
  } catch (err) {
    console.error("Error fetching orders:", err);
    return NextResponse.json(error(500, "Something went wrong while fetching orders"));
  }
}
