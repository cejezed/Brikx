// lib/server/pdf.tsx
import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  type DocumentProps,
} from "@react-pdf/renderer";

export type PveProps = {
  chapterAnswers: Record<string, any>;
  triage: Record<string, any>;
  projectName: string;
};

const styles = StyleSheet.create({
  page: { padding: 32 },
  title: { fontSize: 18, marginBottom: 16 },
  h2: { fontSize: 14, marginTop: 12, marginBottom: 8 },
  p: { fontSize: 10, marginBottom: 6 },
  box: { marginBottom: 10, padding: 8, borderWidth: 1, borderColor: "#ddd" },
});

export function PveContent({ chapterAnswers, triage, projectName }: PveProps) {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Programma van Eisen – {projectName}</Text>

      <View style={styles.box}>
        <Text style={styles.h2}>Samenvatting</Text>
        <Text style={styles.p}>Triagestatus: {JSON.stringify(triage)}</Text>
      </View>

      <View style={styles.box}>
        <Text style={styles.h2}>Antwoorden per hoofdstuk</Text>
        <Text style={styles.p}>{JSON.stringify(chapterAnswers, null, 2)}</Text>
      </View>
    </Page>
  );
}

// Belangrijk: dit component heeft <Document /> als root en is getypt als Document
export type PveDocumentProps = DocumentProps & PveProps;

export const PveDocument: React.FC<PveDocumentProps> = ({
  chapterAnswers,
  triage,
  projectName,
  ...docProps
}) => {
  return (
    <Document {...docProps}>
      <PveContent
        chapterAnswers={chapterAnswers}
        triage={triage}
        projectName={projectName}
      />
    </Document>
  );
};
