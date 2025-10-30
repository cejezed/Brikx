// lib/logging/logEvent.ts

export type LogLevel = 'info' | 'warn' | 'error';
export type LogArgs = {
  event: string;
  payload?: any;
  level?: LogLevel;
};

function toEntry(arg1: string | LogArgs, payload: any, level: LogLevel): LogArgs {
  if (typeof arg1 === 'string') {
    return { event: arg1, payload, level };
  }
  return { event: arg1.event, payload: arg1.payload, level: arg1.level ?? level };
}

/**
 * logEvent
 * - Backwards compatible:
 *    logEvent('chat.intent.navigation', { chapter: 'basis' })
 *    logEvent({ event: 'chat.intent.navigation', payload: { chapter: 'basis' }, level: 'info' })
 */
export async function logEvent(
  arg1: string | LogArgs,
  payload: any = {},
  level: LogLevel = 'info'
) {
  const entry = toEntry(arg1, payload, level);

  // Verrijk met timestamp & bron
  const body = {
    event: entry.event,
    payload: entry.payload ?? {},
    level: entry.level ?? level,
    ts: new Date().toISOString(),
    source: 'client',
  };

  try {
    await fetch('/api/log', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch (e) {
    // In prod stil; in dev mag je dit zichtbaar maken.
    // eslint-disable-next-line no-console
    console.warn('[logEvent] failed', e);
  }
}

export default logEvent;
