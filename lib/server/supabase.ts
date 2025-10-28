// lib/server/supabase.ts
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // ok server & client

if (!url) throw new Error('Missing SUPABASE_URL');
if (!anonKey) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { headers: { 'X-Client-Info': 'brikx-api-anon' } },
});
