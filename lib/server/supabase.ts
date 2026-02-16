// lib/server/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Use NEXT_PUBLIC_ prefix so it works in both server and client contexts
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
if (!anonKey) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { headers: { 'X-Client-Info': 'brikx-api-anon' } },
});
