import { NextResponse } from "next/server";
import { renderPvePdfBuffer } from "@/lib/server/pve/render";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { chapterAnswers = {}, triage = {}, projectName = "Mijn Project" } = body ?? {};

    const buffer = await renderPvePdfBuffer({ chapterAnswers, triage, projectName });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("[/api/pve/pdf] error", error);
    return NextResponse.json(
      { error: error?.message || "PDF generation failed" },
      { status: 500 }
    );
  }
}
