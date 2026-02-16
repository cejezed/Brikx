"use client";

import { createClient } from "@supabase/supabase-js";

// Single Supabase instance - uses safe defaults for tests if env vars are missing
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost";
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "public-anon-key";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
