import { createClient, createAdminClient } from "@/lib/supabase/server";
import { success, error } from "@/helpers/apiResponseWrapper";
import { NextRequest } from "next/server";

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json(error(401, "Token Expired"), { status: 401 });

    const body: unknown = await request.json();
    const name = typeof body === "object" && body !== null && "name" in body && typeof body.name === "string"
      ? body.name.trim()
      : "";
    if (!name || name.length > 100) {
      return Response.json(error(400, "Enter a name between 1 and 100 characters"), { status: 400 });
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
      const { error: updateError } = await adminSupabase
        .from("profiles")
        .update({ name })
        .eq("id", user.id);
      if (updateError) {
        console.error("Profile name update failed:", updateError);
        return Response.json(error(500, "Could not update your name"), { status: 500 });
      }
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
