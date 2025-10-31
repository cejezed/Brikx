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

  // PveDocument *is* een Document-root; voldoet aan renderToBuffer types
  const element: ReactElement<DocumentProps> = React.createElement(
    PveDocument as React.FC<PveDocumentProps>,
    {
      chapterAnswers,
      triage,
      projectName,
    } as PveDocumentProps
  );

  const pdfBuffer = await renderToBuffer(element);

  // Fix voor TypeScript: Response verwacht BodyInit → gebruik Blob
  const blob = new Blob([pdfBuffer], { type: "application/pdf" });

  return new Response(blob, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      // inline tonen; pas 'attachment' aan als je forced download wilt
      "Content-Disposition": 'inline; filename="pve.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
