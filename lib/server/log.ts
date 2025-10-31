// /lib/server/log.ts

export type ServerLogPrimitive = string | number | boolean | null | undefined;
export type ServerLogPayload =
  | Record<string, unknown>
  | ServerLogPrimitive;

/**
 * Server-side logging helper.
 * Accepts either a single string (event) or event + payload.
 * Safe to use in API routes (no throw).
 */
export async function serverLog(event: string, payload: ServerLogPayload = {}): Promise<void> {
  try {
    // Keep it simple for now: console log.
    // If you later want to forward to /api/log or an external sink, do it here.
    if (payload === undefined || payload === null || (typeof payload === "object" && Object.keys(payload as object).length === 0)) {
      console.log(`[serverLog] ${event}`);
    } else {
      console.log(`[serverLog] ${event}`, payload);
    }
  } catch {
    // Never throw from logger
  }
}
