// app/api/log/route.ts
import { NextResponse } from "next/server";
import { logEvent } from "@/lib/logging/logEvent";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { event, source, payload } = body as any;

    if (!event || !source) {
      return NextResponse.json(
        { ok: false, error: "Missing event or source" },
        { status: 400 }
      );
    }

    // Pass the entire object - logEvent now handles both formats
    const res = await logEvent({
      event,
      source,
      payload,
    });

    return NextResponse.json(
      { ok: res.ok, via: res.via, error: res.error },
      { status: res.ok ? 200 : 500 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}