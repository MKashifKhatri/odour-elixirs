import nodemailer from "nodemailer";
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

  try {
    // Generate a reset token
    const resetToken = crypto.randomUUID();
    const expiry = new Date(Date.now() + 3600000); // 1 hour from now

    const supabase = createAdminClient();
    await supabase
      .from("profiles")
      .update({
        forgot_password_token: resetToken,
        forgot_password_token_expiry: expiry.toISOString(),
      })
      .eq("id", userId);

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
      from: "message.sender17@gmail.com",
      to: email,
      subject: `Reset Password | Ecommerce`,
      html: `<html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>Reset Password</title>
        </head>
        <body>
          <div style="padding: 20px; background-color: #f5f5f5; border-radius: 4px;">
            <h2>Hello, ${username},</h2>
            <p>Please use the following Link to Reset Password:</p>
            <p>Click <a href="${process.env.DOMAIN}/updatePassword?token=${resetToken}">here</a> to Reset your password
            or copy and paste the link in your browser:<br> ${process.env.DOMAIN}/updatePassword?token=${resetToken}</p>
            <p>If you did not request for reset password, please ignore this email.</p>
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
