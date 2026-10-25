import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static files and internal routes bypass
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/design') ||
    pathname.match(/\.(?:svg|png|jpg|jpeg|gif|webp|pdf|mp4)$/)
  ) {
    return NextResponse.next();
  }

  // Refresh session using Supabase SSR helper
  const { response, user, supabase } = await updateSession(request);

  // If using sample data or placeholder keys during offline development, allow access
  const isSampleMode = process.env.NEXT_PUBLIC_USE_SAMPLE === 'true';
  const hasSupabaseConfig =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';

  if (isSampleMode || !hasSupabaseConfig) {
    return response;
  }

  const isLoginPage = pathname === '/login';

  // Unauthenticated user attempting to access protected route
  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Authenticated user attempting to access login page
  if (user && isLoginPage) {
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      const role = profile?.role;
      const isWorkshop = role === 'workshop_owner' || role === 'workshop_staff';

      const url = request.nextUrl.clone();
      url.pathname = isWorkshop ? '/workshop' : '/';
      return NextResponse.redirect(url);
    } catch {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
