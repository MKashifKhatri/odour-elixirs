import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const adminSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET_PATH?.trim();
  const isAdminNamespace = path === '/admin' || path.startsWith('/admin/');

  if (isAdminNamespace && !adminSecret) {
    return new NextResponse('Admin access is not configured.', { status: 503 });
  }

  const adminBasePath = adminSecret ? `/admin/${adminSecret}` : '';
  const isAdminRoute = Boolean(adminBasePath && (path === adminBasePath || path.startsWith(`${adminBasePath}/`)));
  const isAdminLogin = path === `${adminBasePath}/login`;
  const isPublicAuthPage = path === '/login' || path === '/signup';

  if (isAdminNamespace && !isAdminRoute) {
    return new NextResponse(null, { status: 404 });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (isAdminNamespace) return new NextResponse('Admin sign-in is unavailable until Supabase is configured.', { status: 503 });
    return NextResponse.next();
  }

  // Refresh supabase session
  const { user, supabaseResponse } = await updateSession(request);

  // Check if user is admin from Supabase profile
  let isAdmin = false;
  if (user && isAdminRoute) {
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
          },
        },
      }
    );
    // console.log(isAdmin)
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      isAdmin = profile?.is_admin === true;
    } catch (error) {
      console.error('Middleware admin check failed:', error);
      isAdmin = false;
    }
  }

  // Redirect to dashboard if already admin and on admin login
  if (user && isAdminLogin && isAdmin) {
    return NextResponse.redirect(new URL(`${adminBasePath}/dashboard`, request.url));
  }

  // Block accessing /login or /signup if already logged in
  if (user && isPublicAuthPage) {
    return NextResponse.redirect(new URL('/cart', request.url));
  }

  // Let admin login page load
  if (isAdminLogin) {
    return supabaseResponse;
  }

  // Redirect if trying to access admin route without being logged in
  if (isAdminRoute && !user) {
    return NextResponse.redirect(new URL(`${adminBasePath}/login`, request.url));
  }

  // Redirect if logged in but not admin
  if (isAdminRoute && user && !isAdmin) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/login', '/signup', '/admin/:path*'],
};
