import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { error, success } from "@/helpers/apiResponseWrapper";

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json(error(401, "Unauthorized"));

    const adminSupabase = createAdminClient();
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json(error(403, "Unauthorized"));
    }

    const { data: order, error: fetchError } = await adminSupabase
      .from("orders")
      .select("*, user:profiles(name, email), payments(*)")
      .eq("id", params.orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(error(404, "Order not found"));
    }

    return NextResponse.json(success(200, order));
  } catch (err) {
    console.error("GET Order Error:", err);
    return NextResponse.json(error(500, "Internal server error"));
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json(error(401, "Unauthorized"));

    const adminSupabase = createAdminClient();
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json(error(403, "Unauthorized"));
    }

    const { status } = await request.json();
    const validStatuses = ["pending", "shipped", "delivered"];

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(error(400, "Invalid status. Must be one of: pending, shipped, delivered"));
    }

    const { data: updatedOrder, error: updateError } = await adminSupabase
      .from("orders")
      .update({ status })
      .eq("id", params.orderId)
      .select("*, user:profiles(name, email), payments(*)")
      .single();

    if (updateError) {
      console.error("Error updating order status:", updateError);
      return NextResponse.json(error(500, "Failed to update order status"));
    }

    return NextResponse.json(success(200, updatedOrder));
  } catch (err) {
    console.error("PUT Order Error:", err);
    return NextResponse.json(error(500, "Internal server error"));
  }
}
