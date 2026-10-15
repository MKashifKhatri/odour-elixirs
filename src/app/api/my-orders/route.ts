import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { error, success } from "@/helpers/apiResponseWrapper";
import { requireUser } from "@/helpers/requireUser";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();

    if (!user?.id) {
      return NextResponse.json(error(401, "Unauthorized | Token expired"), {
        status: 401,
      });
    }

    const adminSupabase = createAdminClient();
    const { data: orders, error: fetchError } = await adminSupabase
      .from("orders")
      .select("id, products, shipping_info, total, status, payment_status, payment_method, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching user orders:", fetchError);
      return NextResponse.json(error(500, "Something went wrong while fetching orders"));
    }

    return NextResponse.json(success(200, orders || []));
  } catch (err) {
    console.error("Error in my-orders GET:", err);
    return NextResponse.json(error(500, "Something went wrong while fetching orders"));
  }
}
