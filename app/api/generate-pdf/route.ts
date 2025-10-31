// app/api/generate-pdf/route.ts
import { NextRequest } from "next/server";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { PveDocument } from "@/lib/server/pdf"; // <-- bestaand pad, zie file #2

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const chapterAnswers = body?.chapterAnswers ?? {};
  const triage = body?.triage ?? {};
  const projectName = body?.projectName ?? "";

  // GEEN JSX in .ts files: createElement gebruiken
  const element = React.createElement(PveDocument, {
    chapterAnswers,
    triage,
    projectName,
  });

  const pdfBuffer = await renderToBuffer(element);

  return new Response(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="pve.pdf"`,
    },
  });
}
