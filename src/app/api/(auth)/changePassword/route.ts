import { createClient, createAdminClient } from "@/lib/supabase/server";
import { error, success } from "@/helpers/apiResponseWrapper";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user?.email) {
      return Response.json(error(401, "Please sign in again to change your password"), { status: 401 });
    }

    const body: unknown = await request.json();
    const currentPassword = typeof body === "object" && body !== null && "currentPassword" in body && typeof body.currentPassword === "string"
      ? body.currentPassword
      : "";
    const newPassword = typeof body === "object" && body !== null && "newPassword" in body && typeof body.newPassword === "string"
      ? body.newPassword
      : "";

    if (!currentPassword || newPassword.length < 8) {
      return Response.json(error(400, "Enter your current password and choose a new password with at least 8 characters"), { status: 400 });
    }
    if (currentPassword === newPassword) {
      return Response.json(error(400, "Choose a password different from your current one"), { status: 400 });
    }

    const { error: currentPasswordError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (currentPasswordError) {
      return Response.json(error(400, "Your current password is incorrect"), { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const { error: updateError } = await adminSupabase.auth.admin.updateUserById(user.id, { password: newPassword });
    if (updateError) {
      console.error("Password change failed:", updateError);
      return Response.json(error(500, "Could not change your password"), { status: 500 });
    }

    return Response.json(success(200, { message: "Password changed successfully" }));
  } catch (err) {
    console.error("Password change request failed:", err);
    return Response.json(error(500, "Could not change your password"), { status: 500 });
  }
}
