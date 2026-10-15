export const dynamic = "force-dynamic";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { error, success } from "@/helpers/apiResponseWrapper";

export async function GET(request: Request) {
  try {
    const supabase = createClient();

    // Get current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json(error(401, "Token Expired"));
    }

    // Get profile data
    const adminSupabase = createAdminClient();
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return Response.json(error(404, "User not found"));
    }

    // Get addresses
    const { data: addresses } = await adminSupabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id);

    return Response.json(
      success(200, {
        user: {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          is_admin: profile.is_admin || false,
          is_verified: profile.is_verified,
          addresses: (addresses || []).map((addr) => ({
            id: addr.id,
            address: addr.address,
            city: addr.city,
            state: addr.state,
            country: addr.country,
            zip_code: addr.zip_code,
            phone_number: addr.phone_number,
            is_default: addr.is_default,
          })),
        },
      })
    );
  } catch (err) {
    console.error("Error in /auth/me:", err);
    return Response.json(error(500, "Something went wrong"));
  }
}
