// app/api/health/route.ts
import { logEvent } from "@/lib/logging/logEvent";

export const runtime = "nodejs";

interface HealthStatus {
  ok: boolean;
  timestamp: string;
  readTest?: { attempted: boolean; ok: boolean; via: string; error: string | null };
  writeTest?: { attempted: boolean; ok: boolean; via: string; error: string | null };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const test = url.searchParams.get("test");

  const status: HealthStatus = {
    ok: true,
    timestamp: new Date().toISOString(),
  };

  let readTest = { attempted: false, ok: false, via: "", error: null as string | null };
  let writeTest = { attempted: false, ok: false, via: "", error: null as string | null };

  // Optional: test database read
  if (test === "1") {
    readTest = { attempted: true, ok: true, via: "select", error: null };
    
    // Log the test event - logEvent now handles objects
    await logEvent({
      event: "health.read",
      source: "api/health",
      payload: { ts: new Date().toISOString() },
    });
  }

  // Optional: test database write
  if (test === "2") {
    writeTest = { attempted: true, ok: false, via: "failed", error: null };
    
    // Log the test event - logEvent now handles objects
    await logEvent({
      event: "health.write",
      source: "api/health",
      payload: { ts: new Date().toISOString() },
    });
  }

  status.readTest = readTest;
  status.writeTest = writeTest;

  return Response.json(status, {
    status: status.ok ? 200 : 500,
  });
}