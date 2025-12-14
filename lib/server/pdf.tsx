import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import {
  formatWishPriorityLabel,
  formatWishCategoryLabel,
  getPriorityColor,
} from "@/lib/pve/wishPriority";

type ChapterAnswers = Record<string, any>;

export type PveDocumentProps = {
  chapterAnswers?: ChapterAnswers;
  triage?: Record<string, any>;
  projectName?: string;
};

type Wish = {
  text: string;
  category?: string;
  priority?: string;
};

type Room = {
  name?: string;
  count?: number;
  area?: number;
  notes?: string;
};

type Risk = {
  type?: string;
  description?: string;
  consequence?: string;
  mitigation?: string;
};

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 10,
    lineHeight: 1.35,
    color: "#0f172a",
    fontWeight: 400,
  },
  h1: { fontSize: 22, fontWeight: 800, marginBottom: 6 },
  h2: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 8,
    marginTop: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  h3: { fontSize: 11, fontWeight: 700, marginBottom: 4 },
  p: { marginBottom: 6 },
  small: { fontSize: 9, color: "#475569" },
  row: { flexDirection: "row", justifyContent: "space-between" },
  card: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  badge: {
    fontSize: 9,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: "#e2e8f0",
    color: "#0f172a",
  },
  sectionBox: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  chip: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#0ea5e9",
  },
  muted: { color: "#64748b" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    color: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  col: { paddingRight: 6 },
});

const formatCurrency = (value?: number) => {
  if (typeof value !== "number") return "";
  return `€ ${value.toLocaleString("nl-NL")}`;
};

const formatRange = (range?: number[]) => {
  if (!Array.isArray(range) || range.length < 2) return "";
  return `${formatCurrency(range[0])} - ${formatCurrency(range[1])}`;
};

const safeString = (v: any) => (typeof v === "string" ? v : "");

const extractWishes = (raw: any): Wish[] => {
  if (!raw?.wishes || !Array.isArray(raw.wishes)) return [];
  return raw.wishes.map((w: any) => {
    if (typeof w === "string") return { text: w };
    return {
      text:
        safeString(w?.text) ||
        safeString(w?.description) ||
        safeString((w as any)?.wish) ||
        String(w ?? ""),
      category: safeString(w?.category),
      priority: safeString(w?.priority),
    };
  });
};

const extractRooms = (raw: any): Room[] => {
  const list = Array.isArray(raw?.rooms) ? raw.rooms : [];
  return list.map((r: any) => ({
    name: safeString(r?.name) || safeString(r?.title),
    count: typeof r?.count === "number" ? r.count : 1,
    area:
      typeof r?.m2 === "number"
        ? r.m2
        : typeof r?.area === "number"
          ? r.area
          : undefined,
    notes: safeString(r?.notes) || safeString(r?.description),
  }));
};

const extractRisks = (raw: any): Risk[] => {
  if (!raw?.risks || !Array.isArray(raw.risks)) return [];
  return raw.risks.map((r: any) => ({
    type: safeString(r?.type) || safeString(r?.label),
    description: safeString(r?.description) || safeString(r?.text),
    consequence: safeString(r?.consequence) || safeString(r?.impact),
    mitigation: safeString(r?.mitigation) || safeString(r?.action),
  }));
};

function WishRow({ wish }: { wish: Wish }) {
  const colors = getPriorityColor(wish.priority);
  return (
    <View style={styles.tableRow}>
      <View
        style={[
          styles.col,
          {
            width: "18%",
            backgroundColor: colors.bg,
            paddingVertical: 4,
            paddingHorizontal: 6,
          },
        ]}
      >
        <Text style={{ fontSize: 9, color: colors.text, fontWeight: 700 }}>
          {formatWishPriorityLabel(wish.priority)}
        </Text>
      </View>
      <View style={[styles.col, { width: "20%" }]}>
        <Text style={[styles.small, { fontWeight: 700 }]}>
          {formatWishCategoryLabel(wish.category)}
        </Text>
      </View>
      <View style={{ width: "62%" }}>
        <Text>{wish.text}</Text>
      </View>
    </View>
  );
}

export function PveDocument({
  chapterAnswers = {},
  triage = {},
  projectName = "Mijn Project",
}: PveDocumentProps) {
  const basis = chapterAnswers.basis || {};
  const budget = chapterAnswers.budget || {};
  const ruimtes = extractRooms(chapterAnswers.ruimtes);
  const wishes = extractWishes(chapterAnswers.wensen);
  const techniek = chapterAnswers.techniek || {};
  const duurzaam = chapterAnswers.duurzaam || {};
  const risico = extractRisks(chapterAnswers.risico);

  const budgetRange = formatRange(budget.bandbreedte);
  const budgetTotal =
    typeof budget.budgetTotaal === "number"
      ? formatCurrency(budget.budgetTotaal)
      : "";
  const hasBudget =
    budgetRange || budgetTotal || budget.eigenInbreng || budget.contingency || budget.notes;

  const projectType = triage?.projectType || basis.projectType;
  const date = new Date().toLocaleDateString("nl-NL");

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Cover */}
        <View
          style={{
            marginBottom: 12,
            borderBottomWidth: 2,
            borderBottomColor: "#0f172a",
            paddingBottom: 10,
          }}
        >
          <Text style={styles.chip}>Architectuurdossier</Text>
          <Text style={[styles.h1, { marginTop: 6 }]}>Programma van Eisen</Text>
          <Text style={{ fontSize: 12, color: "#0ea5e9", fontWeight: 700 }}>
            {projectName}
          </Text>
          <View style={{ marginTop: 10 }}>
            <View style={styles.row}>
              <Text style={styles.small}>Projecttype</Text>
              <Text style={styles.small}>{projectType || "Niet opgegeven"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.small}>Locatie</Text>
              <Text style={styles.small}>{basis.locatie || "Niet opgegeven"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.small}>Datum</Text>
              <Text style={styles.small}>{date}</Text>
            </View>
          </View>
        </View>

        {/* Projectcontext */}
        <Text style={styles.h2}>01. Projectcontext</Text>
        <View style={styles.sectionBox}>
          <Text style={styles.p}>
            {basis.toelichting || "Geen beschrijving ingevuld."}
          </Text>
          <View style={[styles.row, { marginTop: 6 }]}>
            <View style={{ width: "48%" }}>
              <Text style={styles.small}>Ervaring</Text>
              <Text>{basis.ervaring || "Onbekend"}</Text>
            </View>
            <View style={{ width: "48%" }}>
              <Text style={styles.small}>Planning</Text>
              <Text>{basis.urgency || "Onbekend"}</Text>
            </View>
          </View>
        </View>

        {/* Ambities / Wensen samenvatting */}
        <Text style={styles.h2}>02. Uitgangspunten & Ambities</Text>
        <View style={styles.sectionBox}>
          <Text style={styles.h3}>Persoonlijk / gezin</Text>
          <Text style={styles.small}>Belangrijkste wensen samengevat</Text>
          {wishes.length === 0 && (
            <Text style={[styles.p, styles.muted]}>Nog geen wensen ingevuld.</Text>
          )}
          {wishes.slice(0, 4).map((w, idx) => (
            <Text key={idx} style={styles.p}>
              • {w.text}
            </Text>
          ))}
        </View>

        {/* Ruimtelijk programma */}
        <Text style={styles.h2}>03. Ruimtelijk Programma</Text>
        {ruimtes.length === 0 ? (
          <Text style={[styles.p, styles.muted]}>Geen ruimtes ingevuld.</Text>
        ) : (
          <View
            style={{
              borderWidth: 1,
              borderColor: "#e2e8f0",
              borderRadius: 6,
              marginBottom: 12,
            }}
          >
            <View style={styles.tableHeader}>
              <View style={[styles.col, { width: "38%" }]}>
                <Text style={{ fontSize: 9, fontWeight: 700 }}>Ruimte</Text>
              </View>
              <View style={[styles.col, { width: "14%" }]}>
                <Text style={{ fontSize: 9, fontWeight: 700, textAlign: "center" }}>
                  Aantal
                </Text>
              </View>
              <View style={[styles.col, { width: "18%" }]}>
                <Text style={{ fontSize: 9, fontWeight: 700, textAlign: "right" }}>
                  Opp. (m2)
                </Text>
              </View>
              <View style={{ width: "30%" }}>
                <Text style={{ fontSize: 9, fontWeight: 700 }}>Bijzonderheden</Text>
              </View>
            </View>
            {ruimtes.map((room, idx) => (
              <View key={idx} style={styles.tableRow}>
                <View style={[styles.col, { width: "38%" }]}>
                  <Text style={{ fontWeight: 700 }}>
                    {room.name || `Ruimte ${idx + 1}`}
                  </Text>
                </View>
                <View style={[styles.col, { width: "14%" }]}>
                  <Text style={{ textAlign: "center" }}>{room.count ?? 1}</Text>
                </View>
                <View style={[styles.col, { width: "18%" }]}>
                  <Text style={{ textAlign: "right" }}>
                    {room.area ? `${room.area}` : "-"}
                  </Text>
                </View>
                <View style={{ width: "30%" }}>
                  <Text style={styles.small}>{room.notes || "-"}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Wensen */}
        <Text style={styles.h2}>04. Functionele Wensen (MoSCoW)</Text>
        {wishes.length === 0 ? (
          <Text style={[styles.p, styles.muted]}>Nog geen wensen ingevuld.</Text>
        ) : (
          <View
            style={{
              borderWidth: 1,
              borderColor: "#e2e8f0",
              borderRadius: 6,
              marginBottom: 12,
            }}
          >
            <View style={styles.tableHeader}>
              <View style={[styles.col, { width: "18%" }]}>
                <Text style={{ fontSize: 9, fontWeight: 700 }}>Prioriteit</Text>
              </View>
              <View style={[styles.col, { width: "20%" }]}>
                <Text style={{ fontSize: 9, fontWeight: 700 }}>Categorie</Text>
              </View>
              <View style={{ width: "62%" }}>
                <Text style={{ fontSize: 9, fontWeight: 700 }}>Beschrijving</Text>
              </View>
            </View>
            {wishes.map((wish, idx) => (
              <WishRow key={idx} wish={wish} />
            ))}
          </View>
        )}

        {/* Budget */}
        <Text style={styles.h2}>05. Budget & Randvoorwaarden</Text>
        {hasBudget ? (
          <View style={styles.card}>
            {budgetTotal && (
              <View style={{ marginBottom: 4 }}>
                <Text style={styles.small}>Totaalbudget</Text>
                <Text style={{ fontSize: 16, fontWeight: 800 }}>{budgetTotal}</Text>
              </View>
            )}
            {budgetRange && (
              <View style={{ marginBottom: 4 }}>
                <Text style={styles.small}>Bandbreedte</Text>
                <Text>{budgetRange}</Text>
              </View>
            )}
            {budget.eigenInbreng && (
              <Text style={styles.p}>
                Eigen inbreng: {formatCurrency(budget.eigenInbreng)}
              </Text>
            )}
            {budget.contingency && (
              <Text style={styles.p}>
                Buffer: {formatCurrency(budget.contingency)}
              </Text>
            )}
            {budget.notes && <Text style={styles.p}>{budget.notes}</Text>}
          </View>
        ) : (
          <Text style={[styles.p, styles.muted]}>Nog geen budget ingevuld.</Text>
        )}

        {/* Techniek & Duurzaamheid */}
        <Text style={styles.h2}>06. Techniek & Duurzaamheid</Text>
        <View style={styles.sectionBox}>
          {Object.keys(techniek).length === 0 &&
            Object.keys(duurzaam).length === 0 && (
              <Text style={[styles.p, styles.muted]}>
                Nog geen techniek/duurzaam ingevuld.
              </Text>
            )}
          {Object.keys(techniek).length > 0 && (
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.h3}>Techniek</Text>
              {Object.entries(techniek).map(([k, v]) => (
                <Text key={k} style={styles.p}>
                  • {k}: {String(v)}
                </Text>
              ))}
            </View>
          )}
          {Object.keys(duurzaam).length > 0 && (
            <View>
              <Text style={styles.h3}>Duurzaamheid</Text>
              {Object.entries(duurzaam).map(([k, v]) => (
                <Text key={k} style={styles.p}>
                  • {k}: {String(v)}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Risico's */}
        <Text style={styles.h2}>07. Risico's & Aandachtspunten</Text>
        {risico.length === 0 ? (
          <Text style={[styles.p, styles.muted]}>Geen risico's ingevuld.</Text>
        ) : (
          risico.map((r, idx) => (
            <View key={idx} style={styles.card}>
              <View style={styles.row}>
                <Text style={{ fontWeight: 700 }}>{r.type || "Risico"}</Text>
                <Text style={styles.badge}>Risico</Text>
              </View>
              <Text style={styles.p}>{r.description}</Text>
              {r.consequence && (
                <Text style={styles.small}>Gevolg: {r.consequence}</Text>
              )}
              {r.mitigation && (
                <Text style={styles.small}>Mitigatie: {r.mitigation}</Text>
              )}
            </View>
          ))
        )}

        {/* Vervolg */}
        <Text style={styles.h2}>08. Samenvatting & Vervolg</Text>
        <View style={styles.card}>
          <Text style={styles.p}>
            Dit document vormt de basis voor het PvE. Gebruik het als
            vertrekpunt voor schetsontwerp, raming en vergunning. Update
            regelmatig naarmate keuzes concreter worden.
          </Text>
          <Text style={[styles.small, { marginTop: 4 }]}>
            Disclaimer: indicatief; geen rechten aan te ontlenen.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

// Backwards compat
export const PveContent = PveDocument;
