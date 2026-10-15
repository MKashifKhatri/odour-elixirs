import { createClient, createAdminClient } from "@/lib/supabase/server";
import { error } from "./apiResponseWrapper";

/**
 * Verify the current user from Supabase session.
 * Returns the user profile or null.
 */
export async function requireUser() {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const adminSupabase = createAdminClient();
  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}

/**
 * Require admin access. Returns profile if admin, null otherwise.
 */
export async function requireAdmin() {
  const profile = await requireUser();

  if (!profile || !profile.is_admin) {
    return null;
  }

  return profile;
}
