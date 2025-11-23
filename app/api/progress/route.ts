// app/api/progress/route.ts
// ✅ GEHEEL VERVANGEN (v3.5 - Beveiligde Authenticatie)

import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
// Zorg dat dit type bestaat (gegenereerd door Supabase CLI `npx supabase gen types typescript > ...`)
// import type { Database } from "@/types/supabase";

// Gebruik een specifiek type voor de database client als 'Database' niet beschikbaar is
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

const TABLE = "user_progress"; // De NIEUWE, RLS-beveiligde tabel

export async function POST(req: Request) {
  try {
    // Verfijning: Hernoem 'data' naar 'wizardDataPayload' voor duidelijkheid
    const { data: wizardDataPayload } = await req.json();

    if (!wizardDataPayload) {
       return NextResponse.json({ error: "Geen data opgegeven" }, { status: 400 });
    }

    // 1. Maak een Supabase client die de sessie van de gebruiker leest
    const cookieStore = cookies();
    // Verfijning: Gebruik de { cookies } shorthand
    const supabase = createRouteHandlerClient<SupabaseClient>({ cookies });

    // 2. Haal de ingelogde gebruiker op
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) throw sessionError;
    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd. Log opnieuw in." }, { status: 401 });
    }

    const userId = session.user.id;
    if (!userId) {
       return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 401 });
    }

    // 3. Data opslaan in de NIEUWE tabel (user_progress)
    const payloadToUpsert = {
      user_id: userId,
      data: wizardDataPayload, // Gebruik de hernoemde variabele
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from(TABLE)
      .upsert(payloadToUpsert, { onConflict: "user_id" }); // Upsert op user_id, niet op email

    if (error) throw error;

    return NextResponse.json({ ok: true, message: "Voortgang opgeslagen" });

  } catch (e: any) {
    console.error("[/api/progress] Fout bij opslaan:", e);
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    // 1. Maak een Supabase client die de sessie van de gebruiker leest
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<SupabaseClient>({ cookies });

    // 2. Haal de ingelogde gebruiker op
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) throw sessionError;
    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    // 3. Haal de opgeslagen voortgang op uit de user_progress tabel
    const { data: progressData, error: selectError } = await supabase
      .from(TABLE)
      .select("data")
      .eq("user_id", session.user.id)
      .single();

    // Supabase error code 'PGRST116' = geen rijen gevonden (404-equivalent)
    if (selectError && selectError.code !== 'PGRST116') {
      throw selectError;
    }

    // Als geen data gevonden, return 404
    if (!progressData) {
      return NextResponse.json(null, { status: 404 });
    }

    // Return de wizard data
    return NextResponse.json(progressData.data);

  } catch (e: any) {
    console.error("[/api/progress GET] Fout bij laden:", e);
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
