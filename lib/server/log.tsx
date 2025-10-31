// lib/server/log.ts
export async function logEvent(event: string, payload: any = {}) {
  try {
    console.info("[logEvent]", event, payload);
    return { ok: true };
  } catch (err) {
    console.warn("[logEvent] failed:", err);
    return { ok: false, error: String(err) };
  }
}

export async function serverLog(message: string, extra: any = {}) {
  try {
    console.info("[serverLog]", message, extra);
    return { ok: true };
  } catch (err) {
    console.warn("[serverLog] failed:", err);
    return { ok: false, error: String(err) };
  }
}