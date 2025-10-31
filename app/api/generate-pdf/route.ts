// app/api/generate-pdf/route.ts
import React, { type ReactElement } from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { PveDocument, type PveDocumentProps } from "@/lib/server/pdf";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as any));

  const {
    chapterAnswers = {},
    triage = {},
    projectName = "Mijn Project",
  } = body ?? {};

  const element: ReactElement<DocumentProps> = React.createElement(
    PveDocument as React.FC<PveDocumentProps>,
    {
      chapterAnswers,
      triage,
      projectName,
    } as PveDocumentProps
  );

  const pdfBuffer = await renderToBuffer(element);

  // ✅ Convert Buffer → Uint8Array → Blob
  const uint8 = new Uint8Array(pdfBuffer);
  const blob = new Blob([uint8], { type: "application/pdf" });

  return new Response(blob, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="pve.pdf"',
      "Cache-Control": "no-store",
    },
  });
}