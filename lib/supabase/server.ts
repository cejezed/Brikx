// lib/supabase/server.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Lazy, fail-soft Supabase factory voor server gebruik.
 * Keert null terug als env mist i.p.v. te throwen tijdens module-evaluatie.
 */
export function tryCreateServerSupabase(): SupabaseClient | null {
  // Gebruik eerst server-keys als ze bestaan, anders public anon.
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
