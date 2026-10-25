import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

function getSanitizedEnv() {
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
  let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key';

  try {
    const parsed = new URL(supabaseUrl);
    if (!parsed.protocol.startsWith('http') || supabaseUrl.includes('<')) {
      supabaseUrl = 'https://placeholder.supabase.co';
    }
  } catch {
    supabaseUrl = 'https://placeholder.supabase.co';
  }

  if (supabaseAnonKey.includes('<')) supabaseAnonKey = 'placeholder-anon-key';
  if (serviceRoleKey.includes('<')) serviceRoleKey = 'placeholder-service-role-key';

  return { supabaseUrl, supabaseAnonKey, serviceRoleKey };
}

/**
 * Standard server client scoped to the current user's cookies (respects RLS).
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { supabaseUrl, supabaseAnonKey } = getSanitizedEnv();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
}

/**
 * Service role admin client — SERVER-ONLY.
 * Bypasses Row-Level Security. Use ONLY for admin seeding, background jobs, or system tasks.
 * Never expose or return this client to the browser.
 */
export function createAdminClient() {
  const { supabaseUrl, serviceRoleKey } = getSanitizedEnv();

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

