import { createAdminClient } from "@/lib/supabase/server";
import { error, success } from "@/helpers/apiResponseWrapper";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const token = typeof body === "object" && body !== null && "token" in body && typeof body.token === "string"
      ? body.token
      : "";
    const password = typeof body === "object" && body !== null && "password" in body && typeof body.password === "string"
      ? body.password
      : "";

    if (!token || password.length < 8) {
      return Response.json(error(400, "Use a valid reset link and a password with at least 8 characters"), { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: profile, error: lookupError } = await supabase
      .from("profiles")
      .select("id, forgot_password_token_expiry")
      .eq("forgot_password_token", token)
      .maybeSingle();

    if (lookupError) {
      console.error("Password reset token lookup failed:", lookupError);
      return Response.json(error(500, "Could not reset your password"), { status: 500 });
    }

    if (!profile || !profile.forgot_password_token_expiry || new Date(profile.forgot_password_token_expiry) <= new Date()) {
      return Response.json(error(400, "This password reset link is invalid or has expired. Request a new one."), { status: 400 });
    }

    const { data: consumedToken, error: consumeError } = await supabase
      .from("profiles")
      .update({ forgot_password_token: null, forgot_password_token_expiry: null })
      .eq("id", profile.id)
      .eq("forgot_password_token", token)
      .gt("forgot_password_token_expiry", new Date().toISOString())
      .select("id")
      .maybeSingle();

    if (consumeError) {
      console.error("Password reset token could not be consumed:", consumeError);
      return Response.json(error(500, "Could not reset your password"), { status: 500 });
    }
    if (!consumedToken) {
      return Response.json(error(400, "This password reset link is invalid or has expired. Request a new one."), { status: 400 });
    }

    const { error: passwordError } = await supabase.auth.admin.updateUserById(profile.id, { password });
    if (passwordError) {
      console.error("Supabase password update failed:", passwordError);
      return Response.json(error(500, "Could not update your password. Request a new reset link."), { status: 500 });
    }

    return Response.json(success(200, { message: "Password updated. You can now sign in." }));
  } catch (err) {
    console.error("Password reset failed:", err);
    return Response.json(error(500, "Could not reset your password"), { status: 500 });
  }
}
