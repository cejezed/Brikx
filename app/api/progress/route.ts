// app/api/progress/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY!; // server-only

// TABEL: progress (email text PK, data jsonb, updated_at timestamptz)
const TABLE = "progress";

export async function POST(req: Request) {
  try {
    const { email, data } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "email is verplicht" }, { status: 400 });
    }
    // simpele validatie
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "ongeldig e-mailadres" }, { status: 400 });
    }

    if (!SUPABASE_URL || !SERVICE_KEY) {
      return NextResponse.json({ error: "Supabase niet geconfigureerd" }, { status: 500 });
    }

    const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
    const payload = { email: email.toLowerCase(), data, updated_at: new Date().toISOString() };

    const { error } = await sb.from(TABLE).upsert(payload, { onConflict: "email" });
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "server error" }, { status: 500 });
  }
}
