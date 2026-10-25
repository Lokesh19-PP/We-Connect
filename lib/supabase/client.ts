import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
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

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

