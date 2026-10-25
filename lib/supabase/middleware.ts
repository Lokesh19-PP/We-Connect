import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  try {
    supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
    const parsed = new URL(supabaseUrl);
    if (!parsed.protocol.startsWith('http') || supabaseUrl.includes('<')) {
      supabaseUrl = 'https://placeholder.supabase.co';
    }
  } catch {
    supabaseUrl = 'https://placeholder.supabase.co';
  }

  if (supabaseAnonKey.includes('<')) {
    supabaseAnonKey = 'placeholder-anon-key';
  }


  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh user session.
  // IMPORTANT: Avoid writing logic between createServerClient and getUser to prevent desync.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user, supabase };
}
