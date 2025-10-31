// /app/api/generate-pdf/route.ts
import { NextRequest } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { PveDocument, type PveTemplateProps } from "@/lib/pdf/PveTemplate";

export const runtime = "nodejs";

type GeneratePdfBody = {
  chapterAnswers?: Record<string, unknown>;
  triage?: Record<string, unknown>;
  projectName?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as GeneratePdfBody;

    const chapterAnswers = body.chapterAnswers ?? {};
    const projectName =
      body.projectName ||
      ((chapterAnswers?.["basis"] as any)?.projectNaam as string) ||
      "Mijn PvE";

    // >>> Belangrijk: render een <Document />, geen arbitrary component
    const pdfElement = (
      <PveDocument
        chapterAnswers={chapterAnswers}
        triage={body.triage ?? {}}
        projectName={projectName}
      />
    );

    const stream = await renderToStream(pdfElement);

    const timestamp = new Date().toISOString().split("T")[0];
    const safeName = projectName.replace(/[^\p{L}\p{N}\s_-]/gu, "").trim() || "Mijn-PvE";
    const filename = `PvE - ${safeName} - ${timestamp}.pdf`;

    return new Response(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: String(e),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Optioneel: GET voor snelle test (zonder body)
// curl -X GET https://.../api/generate-pdf
export async function GET() {
  const demoAnswers = {
    basis: { projectNaam: "Demo Project", locatie: "—", oppervlakteM2: "—" },
  };
  const element = (
    <PveDocument chapterAnswers={demoAnswers} triage={{}} projectName="Demo Project" />
  );
  const stream = await renderToStream(element);
  return new Response(stream as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="PvE-Demo.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
