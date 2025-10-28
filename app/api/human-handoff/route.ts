import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY!; // server-only
const TABLE = "handoff_requests";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question, name, email, phone, context } = body || {};
    if (!question || !email) {
      return NextResponse.json({ error: "question en email zijn verplicht" }, { status: 400 });
    }
    if (!SUPABASE_URL || !SERVICE_KEY) {
      // geen supabase → loggen en “ok” terug (dev fallback)
      console.warn("[human-handoff] Supabase niet geconfigureerd");
      return NextResponse.json({ ok: true, fallback: true });
    }

    const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
    const payload = {
      id: crypto.randomUUID(),
      email: String(email).toLowerCase(),
      name: name ?? null,
      phone: phone ?? null,
      question,
      context: context ?? {},
      created_at: new Date().toISOString(),
    };

    const { error } = await sb.from(TABLE).insert(payload);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "server error" }, { status: 500 });
  }
}
