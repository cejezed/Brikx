// lib/server/log.tsx
import React from "react";
import { Page, Text, View, StyleSheet } from "@react-pdf/renderer";

/** ======== LOGGING FUNCTIES (verwacht door /api/health en /api/log) ======== */

export async function logEvent(event: string, payload: any = {}) {
  try {
    // Minimal server logging; kan je later vervangen door Supabase insert
    // Voorbeeld (optioneel):
    // const { supabaseAdmin } = await import("@/lib/server/supabaseAdmin");
    // await supabaseAdmin.from("event_logs").insert({ event, payload });

    // Fallback: console
    console.info("[logEvent]", event, payload);
    return { ok: true };
  } catch (err) {
    console.warn("[logEvent] failed:", err);
    return { ok: false, error: String(err) };
  }
}

export async function serverLog(message: string, extra: any = {}) {
  try {
    console.info("[serverLog]", message, extra);
    return { ok: true };
  } catch (err) {
    console.warn("[serverLog] failed:", err);
    return { ok: false, error: String(err) };
  }
}

/** ======== (OPTIONEEL) PDF CONTENT DIE HIER AL BESTOND ======== */

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11 },
  block: { marginTop: 12 },
  h1: { fontSize: 18, marginBottom: 8 },
  p: { marginBottom: 4, lineHeight: 1.3 },
});

/** Sommige codebase-delen importeerden PveContent uit deze module.
 *  We laten ’m bestaan (re-export) om breken te voorkomen.
 */
export function PveContent({
  projectNaam,
}: {
  projectNaam?: string;
}) {
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.block}>
        <Text style={styles.h1}>Programma van Eisen</Text>
        <Text style={styles.p}>{projectNaam ?? "Projectnaam onbekend"}</Text>
      </View>
    </Page>
  );
}
