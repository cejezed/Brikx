// lib/server/pdf.tsx
import React from "react";
import { Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11 },
  block: { marginTop: 12 },
  h1: { fontSize: 18, marginBottom: 8 },
  p: { marginBottom: 4, lineHeight: 1.3 },
});

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