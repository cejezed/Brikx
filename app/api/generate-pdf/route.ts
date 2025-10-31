// app/api/generate-pdf/route.ts
import { NextRequest } from "next/server";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import PveDocument from "@/lib/export/PveDocument"; // pas aan naar jouw pad

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const chapterAnswers = body?.chapterAnswers ?? {};
  const projectName = body?.projectName ?? "";

  // ❌ geen JSX in .ts; ✅ gebruik createElement
  const pdfElement = React.createElement(PveDocument, {
    chapterAnswers,
    triage: body?.triage ?? {},
    projectName,
  });

  const pdfBuffer = await renderToBuffer(pdfElement);

  return new Response(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="pve.pdf"`,
    },
  });
}
