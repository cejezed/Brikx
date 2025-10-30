// app/api/expert/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { queryRag } from "@/lib/ai/rag";
import { serverLog } from "@/lib/server/log"; // 👈 Hier de fix

export async function POST(req: Request) {
  try {
    const { chapter, fieldId, mode = "preview" } = await req.json();
    const q = `Korte, feitelijke tips voor hoofdstuk "${chapter}", veld "${fieldId}" in woning-(ver)bouw. Max 3 bullets.`;

    const allow = mode === "premium";
    const text = await queryRag(q, allow);

    const lines = (text ?? "")
      .split(/\n+/)
      .map((s) => s.replace(/^[-*\s•]+/, "").trim())
      .filter(Boolean)
      .slice(0, 3);

 await serverLog({
  event: "expert.response",
  payload: {
    chapter,
    fieldId,
    premium: mode === "premium",
  }
});

    return NextResponse.json({ snippets: lines });
  } catch (e) {
    await serverLog("expert.response", { ok: false, error: String(e) });
    return NextResponse.json({ snippets: [] }, { status: 200 });
  }
}