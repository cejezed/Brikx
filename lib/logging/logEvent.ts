// lib/logging/logEvent.ts

export interface LogEventResult {
  ok: boolean;
  via: string;
  error: string | null;
}

/**
 * Log an event to the backend logging system
 * @param eventName - The name of the event (e.g., "health.read", "chat.classify")
 * @param payload - JSON string or data to log (optional)
 */
export async function logEvent(
  eventName: string | Record<string, any>,
  payload?: string | Record<string, any>
): Promise<LogEventResult> {
  try {
    // Handle both old and new calling conventions
    let actualEventName = "";
    let actualPayload: any = {};

    if (typeof eventName === "string") {
      // New convention: logEvent(eventName, payload)
      actualEventName = eventName;
      actualPayload = payload;
    } else {
      // Old convention: logEvent({ event, source, payload })
      actualEventName = eventName.event || "unknown";
      actualPayload = eventName;
    }

    // Convert payload to string if it's an object
    const payloadStr =
      typeof actualPayload === "string"
        ? actualPayload
        : JSON.stringify(actualPayload);

    // Log to console
    console.log(`[${actualEventName}]`, payloadStr);

    // TODO: Send to Supabase t_api_log table in Week 2
    // Example:
    // await supabase.from("t_api_log").insert({
    //   event_name: actualEventName,
    //   payload: payloadStr,
    //   created_at: new Date().toISOString(),
    // });

    return {
      ok: true,
      via: "console",
      error: null,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[logEvent error]`, errorMsg);

    return {
      ok: false,
      via: "error",
      error: errorMsg,
    };
  }
}