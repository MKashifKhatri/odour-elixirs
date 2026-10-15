import { createClient, createAdminClient } from "@/lib/supabase/server";
import { error, success } from "@/helpers/apiResponseWrapper";
import { NextRequest } from "next/server";

export const dynamic = 'force-dynamic';

export interface ExtendedNextRequest extends NextRequest {
  user?: {
    is_admin: boolean;
    id: string;
  };
}

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

    let query = adminSupabase.from("profiles").select("*, addresses(*), orders(id, total, status, payment_status, created_at)");

    if (search) {
      query = query.ilike("name", `${search}%`);
    }

    const { data: users, error: fetchError } = await query.order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching users:", fetchError);
      return Response.json(error(500, "Something went wrong"));
    }

    return Response.json(success(200, users));
  } catch (err) {
    console.error("getAllUsers error:", err);
    return Response.json(error(500, "Something went wrong"));
  }
}
