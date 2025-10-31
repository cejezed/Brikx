// /lib/server/log.ts

export type ServerLogPrimitive = string | number | boolean | null | undefined;
export type ServerLogPayload = Record<string, unknown> | ServerLogPrimitive;

/**
 * Server-side logging helper.
 * Gebruik als: serverLog("event", { ...payload })
 * Backwards-compat: we exporteren ook `logEvent` als alias.
 */
export async function serverLog(event: string, payload: ServerLogPayload = {}): Promise<void> {
  try {
    // Minimalistische sink — later evt. vervangen door externe logging of /api/log.
    if (
      payload === undefined ||
      payload === null ||
      (typeof payload === "object" && Object.keys(payload as object).length === 0)
    ) {
      console.log(`[serverLog] ${event}`);
    } else {
      console.log(`[serverLog] ${event}`, payload);
    }
  } catch {
    // Logger mag nooit throwen
  }
}

// Backwards compat: oude code die `logEvent` importeert blijft werken
export const logEvent = serverLog;

// (optioneel) default export voor extra compatibiliteit
export default serverLog;
