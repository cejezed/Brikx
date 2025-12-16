import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email || "").trim();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const resendKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const toEmail = process.env.WIZARD_WAITLIST_EMAIL || process.env.RESEND_FROM_EMAIL;

    if (resendKey && toEmail) {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: fromEmail,
        to: toEmail,
        subject: "Nieuwe wizard-waitlist aanmelding",
        html: `<p>Een gebruiker wil bericht als de wizard live is.</p><p><strong>Email:</strong> ${email}</p>`,
      });
    } else {
      console.warn("[wizard-waitlist] Missing RESEND_API_KEY or target email. Captured:", email);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[wizard-waitlist] Failed to register", err);
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}
