// app/api/generate-pdf/route.ts
import { renderToBuffer } from "@react-pdf/renderer";
import { PveDocument, type PveDocumentProps } from "@/lib/server/pdf";
import { requireAuth } from "@/lib/server/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // SECURITY: Require authentication
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return authResult.error;
  }

  try {
    const body = await req.json().catch(() => ({} as any));

    const {
      chapterAnswers = {},
      triage = {},
      projectName = "Mijn Project",
    } = body ?? {};

    // Render the PveDocument component directly
    const pdfBuffer = await renderToBuffer(
      PveDocument({
        chapterAnswers,
        triage,
        projectName,
      })
    );

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
  } catch (error) {
    console.error("[PDF Generation Error]", error);
    return new Response(
      JSON.stringify({
        error: "PDF generation failed",
        message: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}