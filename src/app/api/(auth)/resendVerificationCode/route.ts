import { randomInt } from "node:crypto";
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
    if (profile.is_verified) {
      return Response.json(error(409, "This account is already verified"));
    }

    const verifyCode = randomInt(100000, 1000000).toString();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        verify_code: verifyCode,
        verify_code_expiry: expiryDate.toISOString(),
      })
      .eq("id", id);
    if (updateError) {
      console.error("Error updating verification code:", updateError);
      return Response.json(error(500, "Could not prepare a new verification code"));
    }

    const emailResponse = await sendVerificationEmail({
      email: profile.email,
      id,
      name: profile.name,
      verifyCode,
    });

    if (!emailResponse.success) {
      return Response.json(error(502, emailResponse.message), { status: 502 });
    }

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
