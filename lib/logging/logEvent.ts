// lib/logging/logEvent.ts
export async function logEvent(event: string, payload: any = {}) {
  try {
    await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, payload }),
      keepalive: true,
    });
  } catch (e) {
    console.warn("[logEvent] failed", e);
  }
}
