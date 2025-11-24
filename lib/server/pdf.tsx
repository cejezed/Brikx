// lib/server/pdf.tsx
// ✅ v3.14: MoSCoW priorities in Wensen sectie
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import {
  formatWishPriorityLabel,
  formatWishCategoryLabel,
  getPriorityColor
} from "@/lib/pve/wishPriority";

const styles = StyleSheet.create({
  document: {},
  page: { padding: 32, fontSize: 11, lineHeight: 1.5 },
  block: { marginBottom: 16 },
  section: { marginBottom: 12 },
  h1: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  h2: { fontSize: 14, fontWeight: "bold", marginBottom: 6, marginTop: 8 },
  p: { marginBottom: 4, lineHeight: 1.3, textAlign: "justify" as const },
  bullet: { marginLeft: 12, marginBottom: 3 },
  label: { fontSize: 10, fontWeight: "bold", marginTop: 6 },
  value: { fontSize: 11, marginBottom: 4 },
  // ✅ v3.14: MoSCoW Wensen tabel styles
  wishTableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#CBD5E1",
    paddingVertical: 4,
    marginBottom: 4,
    backgroundColor: "#F8FAFC",
  },
  wishTableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  wishColPriority: {
    width: "24%",
    fontSize: 9,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  wishColCategory: {
    width: "18%",
    fontSize: 9,
    color: "#64748B",
  },
  wishColText: {
    width: "58%",
    fontSize: 10,
    color: "#1E293B",
  },
});

export type PveDocumentProps = {
  chapterAnswers?: Record<string, any>;
  triage?: Record<string, any>;
  projectName?: string;
};

/**
 * PveDocument - Returns a <Document> component for PDF rendering
 * This is a simple function that returns JSX, which renderToBuffer can accept
 */
export function PveDocument({
  chapterAnswers = {},
  triage = {},
  projectName = "Mijn Project",
}: PveDocumentProps) {
  const basis = chapterAnswers.basis || {};
  const ruimtes = chapterAnswers.ruimtes || {};
  const wensen = chapterAnswers.wensen || {};
  const budget = chapterAnswers.budget || {};
  const techniek = chapterAnswers.techniek || {};

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Title */}
        <View style={styles.block}>
          <Text style={styles.h1}>Programma van Eisen (PvE)</Text>
          <Text style={styles.p}>{projectName}</Text>
        </View>

        {/* Basis Info */}
        <View style={styles.section}>
          <Text style={styles.h2}>Projectgegevens</Text>
          {basis.projectNaam && (
            <View>
              <Text style={styles.label}>Projectnaam</Text>
              <Text style={styles.value}>{basis.projectNaam}</Text>
            </View>
          )}
          {basis.locatie && (
            <View>
              <Text style={styles.label}>Locatie</Text>
              <Text style={styles.value}>{basis.locatie}</Text>
            </View>
          )}
          {triage?.projectType && (
            <View>
              <Text style={styles.label}>Projecttype</Text>
              <Text style={styles.value}>{triage.projectType}</Text>
            </View>
          )}
        </View>

        {/* Ruimtes */}
        {ruimtes && Object.keys(ruimtes).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.h2}>Ruimten</Text>
            {Array.isArray(ruimtes.rooms) && ruimtes.rooms.length > 0 ? (
              ruimtes.rooms.map((room: any, idx: number) => (
                <View key={idx} style={styles.block}>
                  <Text style={styles.label}>
                    {room.name || `Ruimte ${idx + 1}`}
                  </Text>
                  {room.m2 && (
                    <Text style={styles.value}>
                      Oppervlakte: {room.m2} m²
                    </Text>
                  )}
                  {room.wishes &&
                    Array.isArray(room.wishes) &&
                    room.wishes.length > 0 && (
                      <View>
                        <Text style={styles.label}>Wensen:</Text>
                        {room.wishes.map((wish: string, widx: number) => (
                          <View key={widx} style={styles.bullet}>
                            <Text style={styles.p}>• {wish}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                </View>
              ))
            ) : (
              <Text style={styles.p}>Geen ruimten gespecificeerd.</Text>
            )}
          </View>
        )}

        {/* Wensen met MoSCoW prioriteiten */}
        {wensen?.wishes &&
          Array.isArray(wensen.wishes) &&
          wensen.wishes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.h2}>Wensen & Prioriteiten (MoSCoW)</Text>

              {/* Table header */}
              <View style={styles.wishTableHeader}>
                <Text style={styles.wishColPriority}>Prioriteit</Text>
                <Text style={styles.wishColCategory}>Categorie</Text>
                <Text style={styles.wishColText}>Beschrijving</Text>
              </View>

              {/* Table rows */}
              {wensen.wishes.map((wish: any, idx: number) => {
                const priority = typeof wish === 'object' ? wish?.priority : undefined;
                const category = typeof wish === 'object' ? wish?.category : undefined;
                const text = typeof wish === 'string' ? wish : wish?.text || String(wish);
                const colors = getPriorityColor(priority);

                return (
                  <View key={idx} style={styles.wishTableRow}>
                    <View style={[styles.wishColPriority, { backgroundColor: colors.bg }]}>
                      <Text style={{ color: colors.text, fontSize: 9 }}>
                        {formatWishPriorityLabel(priority)}
                      </Text>
                    </View>
                    <Text style={styles.wishColCategory}>
                      {formatWishCategoryLabel(category)}
                    </Text>
                    <Text style={styles.wishColText}>{text}</Text>
                  </View>
                );
              })}
            </View>
          )}

        {/* Budget */}
        {budget && Object.keys(budget).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.h2}>Budget</Text>
            {budget.klasse && (
              <View>
                <Text style={styles.label}>Budgetklasse</Text>
                <Text style={styles.value}>{budget.klasse}</Text>
              </View>
            )}
            {budget.amount && (
              <View>
                <Text style={styles.label}>Budgetbedrag</Text>
                <Text style={styles.value}>
                  € {budget.amount.toLocaleString("nl-NL")}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Techniek */}
        {techniek && Object.keys(techniek).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.h2}>Technische Eisen</Text>
            {techniek.isolatie && (
              <View>
                <Text style={styles.label}>Isolatie</Text>
                <Text style={styles.value}>{techniek.isolatie}</Text>
              </View>
            )}
            {techniek.ventilation && (
              <View>
                <Text style={styles.label}>Ventilatie</Text>
                <Text style={styles.value}>{techniek.ventilation}</Text>
              </View>
            )}
            {techniek.heating && (
              <View>
                <Text style={styles.label}>Verwarming</Text>
                <Text style={styles.value}>{techniek.heating}</Text>
              </View>
            )}
          </View>
        )}
      </Page>
    </Document>
  );
}

// Alias for backward compatibility
export const PveContent = PveDocument;