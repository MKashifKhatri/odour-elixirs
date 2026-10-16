import { createAdminClient } from "@/lib/supabase/server";
import { sendResetPasswordEmail } from "@/helpers/sendResetPasswordEmail";
import { error, success } from "@/helpers/apiResponseWrapper";

const genericResponse = () =>
  success(200, {
    message: "If an account exists for that email, password reset instructions will be sent.",
  });

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const email =
      typeof body === "object" && body !== null && "email" in body && typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(error(400, "Enter a valid email address"), { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: profile, error: lookupError } = await supabase
      .from("profiles")
      .select("id, name, email, is_verified")
      .eq("email", email)
      .maybeSingle();

    if (lookupError) {
      console.error("Password reset account lookup failed:", lookupError);
      return Response.json(error(500, "Could not process your request"), { status: 500 });
    }

    if (profile?.is_verified) {
      const result = await sendResetPasswordEmail(profile.email, profile.name, profile.id);
      if (!result.success) {
        console.error("Password reset email could not be sent");
      }
    }

    return Response.json(genericResponse(), { status: 200 });
  } catch (err) {
    console.error("Forgot password request failed:", err);
    return Response.json(error(500, "Could not process your request"), { status: 500 });
  }
}
