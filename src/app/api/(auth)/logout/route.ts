export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { error, success } from "@/helpers/apiResponseWrapper";

async function logout() {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();

    return Response.json(success(200, { message: "You're now logged out." }));
  } catch (e: any) {
    console.error("Logout error:", e);
    return Response.json(error(500, "Something went wrong"));
  }
}

export const GET = logout;
export const POST = logout;
