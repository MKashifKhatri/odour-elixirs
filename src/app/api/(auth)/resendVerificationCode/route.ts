import { createAdminClient } from "@/lib/supabase/server";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { error, success } from "@/helpers/apiResponseWrapper";

export async function POST(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return Response.json(error(400, "id is required"));
    }

    const supabase = createAdminClient();

    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !profile) {
      return Response.json(error(404, "User not found with this email"));
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    // Send verification email
    const emailResponse = await sendVerificationEmail({
      email: profile.email,
      id,
      name: profile.name,
      verifyCode,
    });

    if (!emailResponse.success) {
      return Response.json(error(500, emailResponse.message));
    }

    // Update verify code in profile
    await supabase
      .from("profiles")
      .update({
        verify_code: verifyCode,
        verify_code_expiry: expiryDate.toISOString(),
      })
      .eq("id", id);

    return Response.json(
      success(201, {
        message: "Email Send Successfully. Please verify your email",
      })
    );
  } catch (err) {
    console.error("Error in resend verification code:", err);
    return Response.json(error(500, "Something went wrong"));
  }
}
