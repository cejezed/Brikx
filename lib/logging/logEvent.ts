// /lib/logging/logEvent.ts

export async function logEvent(
  requestId: string,
  event: string,
  data: any = {}
) {
  try {
    // Voor nu: console-log (Week 2 → naar Supabase t_api_log)
    // Houd het compact om CI ruis te vermijden
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ requestId, event, data }));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[logEvent] failed", e);
  }
}
