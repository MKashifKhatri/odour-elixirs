import { success, error } from "@/helpers/apiResponseWrapper";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = createClient();

    // Supabase handles session refresh automatically via cookies
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return Response.json(error(401, "Refresh Token is required"));
    }

    // Refresh the session
    const { data, error: refreshError } = await supabase.auth.refreshSession();

    if (refreshError || !data.session) {
      return Response.json(error(401, "Invalid Refresh token"));
    }

    return Response.json(
      success(201, { accessToken: data.session.access_token })
    );
  } catch (e) {
    console.error("Refresh token error:", e);
    return Response.json(error(401, "Invalid Refresh token"));
  }
}
