import { randomInt } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/server";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { error, success } from "@/helpers/apiResponseWrapper";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedName || !normalizedEmail || typeof password !== "string") {
      return Response.json(error(400, "Please fill all the fields"), { status: 400 });
    }
    if (password.length < 8) {
      return Response.json(error(400, "Password must be at least 8 characters"), { status: 400 });
    }
    if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD) {
      return Response.json(
        error(503, "Email verification is not configured. Please contact the store team."),
        { status: 503 }
      );
    }

    const supabase = createAdminClient();

    const { data: existingProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (profileError) {
      console.error("Supabase profile lookup error:", profileError);
      return Response.json(error(500, "Could not check this email. Please try again."), { status: 500 });
    }
    if (existingProfile) {
      return Response.json(error(409, "User already exists with this email"), { status: 409 });
    }

    const verifyCode = randomInt(100000, 1000000).toString();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: false,
      user_metadata: {
        name: normalizedName,
        verify_code: verifyCode,
        verify_code_expiry: expiryDate.toISOString(),
      },
    });

    if (authError) {
      console.error("Supabase auth error:", authError);
      const status = authError.message.toLowerCase().includes("already") ? 409 : 400;
      const message = status === 409
        ? "User already exists with this email"
        : "Could not create your account. Please check your details and try again.";
      return Response.json(error(status, message), { status });
    }

    // Send verification email
    const emailResponse = await sendVerificationEmail({
      email: normalizedEmail,
      id: authData.user.id,
      name: normalizedName,
      verifyCode,
    });

    if (!emailResponse.success) {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id);
      if (deleteError) console.error("Could not remove unverified user after email failure:", deleteError);
      return Response.json(
        error(502, "We couldn't send the verification email. Please try again or contact the store team."),
        { status: 502 }
      );
    }

    return Response.json(
      success(201, {
        id: authData.user.id,
        message: "User registered successfully. Please verify your email",
      }),
      { status: 201 }
    );
  } catch (err) {
    console.error("Error in saving user data:", err);
    return Response.json(error(500, "Something went wrong. Please try again."), { status: 500 });
  }
}
