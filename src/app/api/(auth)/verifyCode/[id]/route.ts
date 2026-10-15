import { createAdminClient } from "@/lib/supabase/server";
import { error, success } from "@/helpers/apiResponseWrapper";

interface Params {
  id?: string;
}

export async function POST(request: Request, { params }: { params: Params }) {
  try {
    const { code } = await request.json();
    const id = params.id;

    if (!id || !code) {
      return Response.json(error(400, "Please enter all fields"));
    }

    const supabase = createAdminClient();

    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !profile) {
      return Response.json(error(404, "User not found"));
    }

    const isCodeValid = profile.verify_code === code;
    const isCodeNotExpired = profile.verify_code_expiry
      ? new Date(profile.verify_code_expiry) > new Date()
      : false;

    if (isCodeValid && isCodeNotExpired) {
      // Update profile verification status
      await supabase
        .from("profiles")
        .update({ is_verified: true })
        .eq("id", id);

      // Also confirm email in Supabase Auth so user can log in
      await supabase.auth.admin.updateUserById(id, {
        email_confirm: true,
      });

      return Response.json(success(200, { message: "Account Verified Successfully" }));
    } else if (!isCodeNotExpired) {
      return Response.json(
        error(400, "Verification code has expired, please request a new code")
      );
    } else {
      return Response.json(error(400, "Incorrect Verification code"));
    }
  } catch (err) {
    console.error("Error verifying user", err);
    return Response.json(error(500, "Error verifying user"));
  }
}
