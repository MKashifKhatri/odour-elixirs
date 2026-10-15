import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Use direct URL in middleware (server-side, avoids self-referencing proxy)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  const supabase = createServerClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not write any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make your app
  // vulnerable to security issues.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    // Missing session is expected for logged-out users on public routes.
    if (error.message !== "Auth session missing!") {
      console.error("Middleware getUser failed:", error.message);
    }
    return { user: null, supabaseResponse };
  }

  return { user, supabaseResponse };
}
