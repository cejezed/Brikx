// /app/api/expert/route.ts
import { NextResponse } from "next/server";
import { serverLog } from "@/lib/server/log";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const q = String(body?.query ?? "").trim();

    // Dummy extractor: split op regels → non-empty → top 10
    const lines =
      q.length > 0
        ? q
            .split(/\r?\n+/g)
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 10)
        : [];

    await serverLog("expert.response", { ok: true, count: lines.length });

    return NextResponse.json({ snippets: lines });
  } catch (e: unknown) {
    await serverLog("expert.response", { ok: false, error: String(e) });
    // Belangrijk: API blijft 200 teruggeven met lege lijst (zoals je eerdere route deed)
    return NextResponse.json({ snippets: [] }, { status: 200 });
  }
}
