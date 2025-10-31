// /lib/pdf/PveTemplate.tsx
// Minimale, type-veilige PDF structuur met een Document-wrapper.
// Je bestaande inhoud kun je plaatsen in <PveContent /> onderaan.

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// ---- Types ---------------------------------------------------------------

export type PveTemplateProps = {
  /** Alle wizard-antwoorden, gegroepeerd per chapter (intake/basis/etc.) */
  chapterAnswers: Record<string, unknown>;
  /** (Optioneel) triage/AI metadata voor de preview */
  triage?: Record<string, unknown>;
  /** (Optioneel) projectnaam en metadata voor titel/filename */
  projectName?: string;
};

// ---- Styles (voorbeeld) --------------------------------------------------

const styles = StyleSheet.create({
  page: { padding: 32 },
  h1: { fontSize: 18, marginBottom: 8 },
  h2: { fontSize: 14, marginTop: 16, marginBottom: 6 },
  p: { fontSize: 10, lineHeight: 1.4 },
  block: { marginBottom: 12 },
});

// ---- Content-only component ---------------------------------------------
// Zet hier jouw bestaande PVE-inhoud. Deze retourneert GEEN <Document/>,
// maar alleen de Page/Views/Texts die binnen een Document passen.

export function PveContent({ chapterAnswers }: PveTemplateProps) {
  const basis = (chapterAnswers?.["basis"] ?? {}) as Record<string, any>;
  const projectNaam: string =
    basis?.projectNaam || basis?.projectnaam || "Mijn PvE";

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.block}>
        <Text style={styles.h1}>Programma van Eisen</Text>
        <Text style={styles.p}>{projectNaam}</Text>
      </View>

      <View style={styles.block}>
        <Text style={styles.h2}>Samenvatting</Text>
        <Text style={styles.p}>
          Dit is een voorlopige export. De volledige layout/secties van jouw
          PVE kun je hier invullen met data uit chapterAnswers.
        </Text>
      </View>

      {/* Voorbeeld: basisgegevens */}
      <View style={styles.block}>
        <Text style={styles.h2}>Basisgegevens</Text>
        <Text style={styles.p}>
          Locatie: {basis?.locatie || "—"}{"\n"}
          Oppervlakte (indicatief): {basis?.oppervlakteM2 ?? "—"} m²
        </Text>
      </View>
    </Page>
  );
}

// ---- Document wrapper (belangrijk!) --------------------------------------
// Dit is het element dat je aan renderToStream() moet geven.

export function PveDocument(props: PveTemplateProps) {
  const title =
    props.projectName ||
    (props.chapterAnswers?.["basis"] as any)?.projectNaam ||
    "Mijn PvE";
  return (
    <Document title={`PvE – ${title}`}>
      <PveContent {...props} />
    </Document>
  );
}

// Eventueel: default export laten verwijzen naar content (niet verplicht)
export default PveContent;
