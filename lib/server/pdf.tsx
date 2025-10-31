// lib/server/pdf.tsx
import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

type PveProps = {
  chapterAnswers: Record<string, any>;
  triage: Record<string, any>;
  projectName: string;
};

// Basistyles – simpel houden; kan later stylen volgens v2.0 spec
const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11 },
  h1: { fontSize: 18, marginBottom: 8 },
  h2: { fontSize: 14, marginTop: 16, marginBottom: 6 },
  p: { marginBottom: 4, lineHeight: 1.3 },
  block: { marginTop: 12 },
  row: { flexDirection: "row", gap: 8 },
  key: { width: 160, fontWeight: 700 },
  val: { flex: 1 },
});

export function PveContent({
  chapterAnswers,
  triage,
  projectName,
}: PveProps) {
  const kv = Object.entries(chapterAnswers ?? {});
  return (
    <Page size="A4" style={styles.page}>
      <View>
        <Text style={styles.h1}>Programma van Eisen</Text>
        <Text style={styles.p}>{projectName || "Projectnaam onbekend"}</Text>
      </View>

      <View style={styles.block}>
        <Text style={styles.h2}>Samenvatting</Text>
        <Text style={styles.p}>
          Triagemodus: {(triage && triage.mode) ? String(triage.mode) : "n.v.t."}
        </Text>
      </View>

      <View style={styles.block}>
        <Text style={styles.h2}>Antwoorden per hoofdstuk</Text>
        {kv.length === 0 ? (
          <Text style={styles.p}>Nog geen antwoorden gevonden.</Text>
        ) : (
          kv.map(([key, value]) => (
            <View key={key} style={styles.row}>
              <Text style={styles.key}>{key}</Text>
              <Text style={styles.val}>
                {typeof value === "string"
                  ? value
                  : JSON.stringify(value, null, 2)}
              </Text>
            </View>
          ))
        )}
      </View>
    </Page>
  );
}

export function PveDocument(props: PveProps) {
  return (
    <Document>
      <PveContent {...props} />
    </Document>
  );
}
