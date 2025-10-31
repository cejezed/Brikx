// app/api/generate-pdf/route.ts
import { NextRequest } from "next/server";
import React, { type ReactElement } from "react";
import { Document, type DocumentProps, renderToBuffer } from "@react-pdf/renderer";
import { PveContent } from "@/lib/server/pdf";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const chapterAnswers = body?.chapterAnswers ?? {};
  const triage = body?.triage ?? {};
  const projectName = body?.projectName ?? "";

  // Maak expliciet een <Document> element (juiste type voor renderToBuffer)
  const element: ReactElement<DocumentProps> = React.createElement(
    Document,
    null,
    React.createElement(PveContent, { chapterAnswers, triage, projectName })
  );

  const pdfBuffer = await renderToBuffer(element);

  return new Response(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="pve.pdf"`,
    },
  });
}
