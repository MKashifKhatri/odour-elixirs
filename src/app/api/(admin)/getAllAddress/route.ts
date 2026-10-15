import { createClient, createAdminClient } from "@/lib/supabase/server";
import { error, success } from "@/helpers/apiResponseWrapper";
import { NextRequest } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json(error(401, "Token Expired"), { status: 401 });

    const adminSupabase = createAdminClient();
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single() as { data: { is_admin: boolean } | null };

    if (!profile?.is_admin) {
      return Response.json(error(401, "Your not Admin"), { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let query = adminSupabase.from("addresses").select("*");

    if (search) {
      query = query.ilike("address", `${search}%`);
    }

    const { data: addresses, error: fetchError } = await query;

    if (fetchError) {
      console.error("Error fetching addresses:", fetchError);
      return Response.json(error(500, "Something went wrong"));
    }

    return Response.json(success(200, addresses));
  } catch (err) {
    console.error("getAllAddress error:", err);
    return Response.json(error(500, "Something went wrong"));
  }
}
