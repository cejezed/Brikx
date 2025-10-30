// lib/server/log.ts
/**
 * Server-side logging helper using Supabase Service Role
 * 
 * Duurzaam design: beide `logEvent` en `serverLog` exports
 * - logEvent = primaire functie (jouw huidige code)
 * - serverLog = alias (backward compatibility + toekomstige code)
 */

import { supabaseAdmin } from '@/lib/server/supabaseAdmin';

export type LogInput = {
  event: string;
  source?: string | null;
  payload?: Record<string, any> | null;
};

export type LogResult = { 
  ok: boolean; 
  via: 'admin' | 'failed'; 
  error: any | null 
};

/**
 * Primary logging function
 * Logs events to Supabase t_api_log table via Service Role (bypass RLS)
 * 
 * @param input - { event, source?, payload? }
 * @returns { ok, via, error }
 * 
 * @example
 *   const result = await logEvent({ 
 *     event: 'chat.request',
 *     source: 'chat-panel',
 *     payload: { question: '...', mode: 'premium' }
 *   });
 */
export async function logEvent(input: LogInput): Promise<LogResult> {
  const row = { 
    event: input.event, 
    source: input.source ?? null, 
    payload: input.payload ?? null 
  };
  
  let { error } = await supabaseAdmin
    .from('t_api_log')
    .insert(row);

  // Retry without source if column error (RLS issue)
  if (error && String(error.code) === '42703') {
    const retry = await supabaseAdmin
      .from('t_api_log')
      .insert({ 
        event: input.event, 
        payload: input.payload ?? null 
      });
    return { 
      ok: !retry.error, 
      via: 'admin', 
      error: retry.error ?? null 
    };
  }

  return { 
    ok: !error, 
    via: 'admin', 
    error: error ?? null 
  };
}

/**
 * Alias for backward compatibility and flexibility
 * Use this when you want to be explicit about server-side logging
 * 
 * @example
 *   await serverLog({ event: 'expert.response', payload: {...} });
 */
export const serverLog = logEvent;

/**
 * Helper: Quick log without return type (fire & forget)
 * Useful in middleware or non-critical logging
 * 
 * @example
 *   void logEventAsync({ event: 'page.view', source: 'preview' });
 */
export async function logEventAsync(input: LogInput): Promise<void> {
  try {
    await logEvent(input);
  } catch (err) {
    console.error('[logEventAsync] Error:', err);
  }
}