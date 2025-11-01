// lib/preview/buildPreview.ts
// Build v2.0 – defensieve preview builder zonder niet-bestaande triage-velden te vereisen.

export type BuildPreviewInput = {
  triage: {
    projectType: string[];          // v2.0: altijd array
    projectSize?: string;
    urgency?: string;
    budget?: number;
  };
  chapterAnswers: Record<string, any>;
};

export type BuildPreview = {
  summary: {
    projectType: string;
    ervaring: string;     // evt. placeholder/samenvatting uit triage of rules
    intent: string;       // idem
    urgentie: string;
    budget: string;
  };
  ruimtes: Array<{ id: string; type?: string; tag?: string }>;
  wensen: Array<{ id: string; label: string; priority?: string }>;
  techniek?: Record<string, any> | null;
  duurzaamheid?: Record<string, any> | null;
  remarks: string[];
};

const asArray = <T = any>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : v ? [v as T] : []);
const safeTrim = (v: unknown): string | null => {
  if (typeof v === "string") {
    const s = v.trim();
    return s ? s : null;
  }
  return null;
};

function formatBudget(n?: number): string {
  if (typeof n !== "number" || !isFinite(n) || n <= 0) return "—";
  try {
    return `€ ${Math.round(n).toLocaleString("nl-NL")}`;
  } catch {
    return `€ ${Math.round(n)}`;
  }
}

/**
 * Bouwt een lichtgewicht preview van de PvE-gegevens.
 * V2.0: geen harde aannames over optionele velden; lees alles defensief.
 */
export function buildPreview(input: BuildPreviewInput): BuildPreview {
  const triage = input?.triage ?? { projectType: [] };
  const answers = input?.chapterAnswers ?? {};

  // ===== Basis samenvatting =====
  const projectType = asArray<string>(triage.projectType).join(", ") || "—";
  const urgentie = triage.urgency ?? "—";
  const budgetTxt = formatBudget(triage.budget);

  // Eventuele, toekomstige velden – zet placeholders of afleidingen:
  const ervaring = "—"; // (ruimte voor toekomstige logica)
  const intent = "—";   // (ruimte voor toekomstige logica)

  // ===== Ruimtes =====
  const ruimtesSrc = answers.ruimtes;
  const ruimtesList: Array<{ id: string; type?: string; tag?: string }> = Array.isArray(ruimtesSrc?.list)
    ? (ruimtesSrc.list as any[]).map((r) => ({
        id: String(r?.id ?? cryptoRandom()),
        type: typeof r?.type === "string" ? r.type : r?.naam,
        tag: typeof r?.tag === "string" ? r.tag : undefined,
      }))
    : [];

  // ===== Wensen =====
  const wensenSrc = answers.wensen;
  const wensenList: Array<{ id: string; label: string; priority?: string }> = Array.isArray(wensenSrc?.items)
    ? (wensenSrc.items as any[]).map((w) => ({
        id: String(w?.id ?? cryptoRandom()),
        label:
          typeof w === "string"
            ? w
            : typeof w?.label === "string"
            ? w.label
            : typeof w?.text === "string"
            ? w.text
            : "—",
        priority:
          typeof w?.priority === "string"
            ? w.priority
            : typeof w?.prio === "string"
            ? w.prio
            : undefined,
      }))
    : [];

  // ===== Techniek & Duurzaamheid (optioneel) =====
  const techniek = answers.techniek && typeof answers.techniek === "object" ? answers.techniek : null;
  const duurzaamheid =
    answers.duurzaamheid && typeof answers.duurzaamheid === "object" ? answers.duurzaamheid : null;

  // ===== Remarks – verzamel losse notities als ze bestaan =====
  const remarks: string[] = [];

  // triage had geen 'extra' in de types; lees optioneel/defensief:
  const triageExtra = safeTrim((triage as any)?.extra ?? (triage as any)?.notes);
  if (triageExtra) remarks.push(triageExtra);

  const techniekNotes = safeTrim(techniek?.notes);
  if (techniekNotes) remarks.push(techniekNotes);

  const duurzaamNotes = safeTrim(duurzaamheid?.notes);
  if (duurzaamNotes) remarks.push(duurzaamNotes);

  return {
    summary: {
      projectType,
      ervaring,
      intent,
      urgentie,
      budget: budgetTxt,
    },
    ruimtes: ruimtesList,
    wensen: wensenList,
    techniek: techniek ?? undefined,
    duurzaamheid: duurzaamheid ?? undefined,
    remarks,
  };
}

// ===== Klein hulpfunctietje voor ids wanneer er geen id aanwezig is =====
function cryptoRandom() {
  // val terug op een simpele random string als crypto niet beschikbaar is (SSR/PDF)
  try {
    // @ts-ignore
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {}
  return "id_" + Math.random().toString(36).slice(2, 10);
}

export default buildPreview;
