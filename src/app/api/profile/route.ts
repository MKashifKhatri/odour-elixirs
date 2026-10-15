import { createClient, createAdminClient } from "@/lib/supabase/server";
import { success, error } from "@/helpers/apiResponseWrapper";
import { NextRequest } from "next/server";

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json(error(401, "Token Expired"), { status: 401 });

    const { name } = await request.json();
    if (!name || typeof name !== "string") {
      return Response.json(error(400, "Invalid name"));
    }

    const adminSupabase = createAdminClient();

    const { data: profile, error: fetchError } = await adminSupabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (fetchError || !profile) {
      return Response.json(error(404, "User not found"));
    }

    if (profile.name !== name) {
      await adminSupabase
        .from("profiles")
        .update({ name })
        .eq("id", user.id);
    }

    return Response.json(
      success(200, {
        user: { id: profile.id, name, email: profile.email },
        message: "Name updated successfully",
      })
    );
  } catch (err) {
    console.error("Profile update error:", err);
    return Response.json(error(500, "Something went wrong"));
  }
}
