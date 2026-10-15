import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { error, success } from "@/helpers/apiResponseWrapper";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json(error(400, "Please enter all fields"));
    }

    const supabase = createClient();

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      // Check if the error is due to unconfirmed email
      if (authError.message?.includes("Email not confirmed")) {
        return Response.json(
          error(403, "Please verify your email before logging in", {
            isVerified: false,
          })
        );
      }
      return Response.json(error(403, "Invalid Email or Password"));
    }

    // Get profile data
    const adminSupabase = createAdminClient();
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single() as { data: { id: string; name: string; email: string; is_verified: boolean; is_admin: boolean } | null };

    if (!profile) {
      return Response.json(error(404, "User profile not found"));
    }

    // Check if profile is verified
    if (!profile.is_verified) {
      return Response.json(
        error(403, "Please verify your email before logging in", {
          isVerified: false,
        })
      );
    }

    return Response.json(
      success(200, {
        isVerified: profile.is_verified,
        accessToken: authData.session.access_token,
        user: {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          is_admin: profile.is_admin || false,
        },
        message: "Login Successfully",
      })
    );
  } catch (err) {
    console.error("Error in login:", err);
    return Response.json(error(500, "Something went wrong"));
  }
}
