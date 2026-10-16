import nodemailer from "nodemailer";
import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/server";

interface ApiResponse {
  success: boolean;
  message: string;
}

export async function sendResetPasswordEmail(
  email: string,
  username: string,
  userId: string
): Promise<ApiResponse> {
  const myEmail = process.env.EMAIL;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.DOMAIN || "http://localhost:3000").replace(/\/$/, "");
  const safeUsername = username.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  }[character] || character));

  if (!myEmail || !emailPassword) {
    console.error("Password reset email is not configured");
    return { success: false, message: "Password reset email is not configured" };
  }

  try {
    const resetToken = randomUUID();
    const expiry = new Date(Date.now() + 3600000); // 1 hour from now

    const supabase = createAdminClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        forgot_password_token: resetToken,
        forgot_password_token_expiry: expiry.toISOString(),
      })
      .eq("id", userId);
    if (updateError) throw updateError;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: myEmail,
        pass: emailPassword,
      },
    });

    const mailOption = {
      from: myEmail,
      to: email,
      subject: "Reset your Odour Elixirs password",
      html: `<html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>Reset Password</title>
        </head>
        <body>
          <div style="max-width: 520px; margin: 24px auto; padding: 32px; background: #f6f2ea; border: 1px solid #ddd1c1; border-radius: 18px; color: #211814; font-family: Arial, sans-serif;">
            <p style="font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #75685f;">Odour Elixirs</p>
            <h2>Hello, ${safeUsername}</h2>
            <p>Use the link below to choose a new password. This link expires in one hour.</p>
            <p><a href="${siteUrl}/updatePassword?token=${resetToken}" style="display: inline-block; padding: 12px 20px; background: #211814; color: #fffaf2; text-decoration: none; border-radius: 999px;">Reset password</a></p>
            <p>If you did not request this change, you can ignore this email.</p>
          </div>
        </body>
      </html>`,
    };

    await transporter.sendMail(mailOption);
    return { success: true, message: "Reset password email sent successfully" };
  } catch (emailError) {
    console.error("Error sending reset password email:", emailError);
    return { success: false, message: "Failed to send reset password email" };
  }
}
