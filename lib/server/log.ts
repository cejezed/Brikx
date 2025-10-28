// lib/server/log.ts
import { supabaseAdmin } from '@/lib/server/supabaseAdmin';

type LogInput = {
  event: string;
  source?: string | null;
  payload?: Record<string, any> | null;
};
type LogResult = { ok: boolean; via: 'admin' | 'failed'; error: any | null };

export async function logEvent(input: LogInput): Promise<LogResult> {
  const row = { event: input.event, source: input.source ?? null, payload: input.payload ?? null };
  let { error } = await supabaseAdmin.from('t_api_log').insert(row);

  if (error && String(error.code) === '42703') {
    const retry = await supabaseAdmin.from('t_api_log').insert({ event: input.event, payload: input.payload ?? null });
    return { ok: !retry.error, via: 'admin', error: retry.error ?? null };
    }
  return { ok: !error, via: 'admin', error: error ?? null };
}
