import { NextResponse } from "next/server";
import { Resend } from "resend";
import { renderPvePdfBuffer } from "@/lib/server/pve/render";

export const runtime = "nodejs";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const slugify = (v: string) =>
  v
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "project";

export async function POST(req: Request) {
  try {
    const textBody = await req.text();
    if (textBody.length > 2_000_000) {
      return NextResponse.json({ error: "Payload te groot" }, { status: 413 });
    }
    const body = textBody ? JSON.parse(textBody) : {};
    const { email, projectName = "Mijn Project", chapterAnswers = {}, triage = {} } = body ?? {};

    if (!email || typeof email !== "string" || !emailRegex.test(email)) {
      return NextResponse.json({ error: "Ongeldig e-mailadres" }, { status: 400 });
    }

    const resendKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM || process.env.EMAIL_FROM || "noreply@example.com";
    if (!resendKey) {
      return NextResponse.json({ error: "RESEND_API_KEY ontbreekt" }, { status: 500 });
    }

    const pdfBuffer = await renderPvePdfBuffer({ chapterAnswers, triage, projectName });
    const resend = new Resend(resendKey);
    const filename = `pve-${slugify(projectName)}.pdf`;

    const subject = "Uw Programma van Eisen (PvE)";
    const html = `
      <p>Beste,</p>
      <p>In de bijlage vindt u uw Programma van Eisen (PvE) op basis van de ingevulde wizard.</p>
      <p>Template versie: PvE v2.0<br/>Project: ${projectName}</p>
      <p>Met vriendelijke groet,<br/>Brikx</p>
      <p style="font-size:12px; color:#64748b;">Disclaimer: dit document is indicatief; er kunnen geen rechten aan worden ontleend.</p>
    `;

    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject,
      html,
      attachments: [
        {
          filename,
          // Resend ondersteunt raw Buffer als content
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[/api/pve/send] error", error);
    return NextResponse.json(
      { error: error?.message || "Verzenden mislukt" },
      { status: 500 }
    );
  }
}
