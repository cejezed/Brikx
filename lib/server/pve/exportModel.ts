// Build a normalized export model for PvE PDF rendering
import type { ChapterKey } from "@/types/project";

export type PveWish = {
  text: string;
  category?: string;
  priority?: string;
};

export type PveRoom = {
  name: string;
  count: number;
  area?: number;
  notes?: string;
};

export type PveRisk = {
  type: string;
  description: string;
  consequence?: string;
  mitigation?: string;
};

export type PveBudget = {
  total?: number;
  range?: [number?, number?];
  ownContribution?: number;
  contingency?: number;
  notes?: string;
};

export type PveTechEntry = {
  label: string;
  value: string;
};

export type PveExportModel = {
  projectName: string;
  projectType?: string;
  location?: string;
  date: string;
  templateVersion: string;
  context: {
    description: string;
    experience: string;
    planning: string;
  };
  summaryWishes: string[];
  rooms: PveRoom[];
  wishes: PveWish[];
  budget: PveBudget;
  techniek: PveTechEntry[];
  duurzaam: PveTechEntry[];
  risks: PveRisk[];
  nextSteps: string[];
};

const safeString = (v: unknown, fallback = ""): string =>
  typeof v === "string" && v.trim().length > 0 ? v.trim() : fallback;

const toNumber = (v: unknown): number | undefined => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const asArray = <T = unknown>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

export function buildPveExportModel(opts: {
  chapterAnswers?: Record<string, any>;
  triage?: Record<string, any>;
  projectName?: string;
}): PveExportModel {
  const chapterAnswers = opts.chapterAnswers ?? {};
  const basis = chapterAnswers.basis ?? {};
  const wensenRaw = chapterAnswers.wensen ?? {};
  const ruimtesRaw = chapterAnswers.ruimtes ?? {};
  const budgetRaw = chapterAnswers.budget ?? {};
  const techniekRaw = chapterAnswers.techniek ?? {};
  const duurzaamRaw = chapterAnswers.duurzaam ?? {};
  const risicoRaw = chapterAnswers.risico ?? {};

  const projectName =
    safeString(opts.projectName) ||
    safeString(basis.projectNaam) ||
    "Mijn Project";

  const summaryWishes: string[] = asArray<any>(wensenRaw.wishes)
    .map((w) => {
      if (typeof w === "string") return w;
      if (w && typeof w === "object") {
        return safeString(w.text) || safeString(w.description) || safeString((w as any).wish);
      }
      return "";
    })
    .filter(Boolean)
    .slice(0, 5);

  const rooms: PveRoom[] = asArray<any>(ruimtesRaw.rooms).map((r, idx) => ({
    name: safeString(r?.name) || safeString(r?.title) || `Ruimte ${idx + 1}`,
    count: typeof r?.count === "number" ? r.count : 1,
    area: toNumber(r?.m2) ?? toNumber(r?.area),
    notes: safeString(r?.notes) || safeString(r?.description) || undefined,
  }));

  const wishes: PveWish[] = asArray<any>(wensenRaw.wishes).map((w) => {
    if (typeof w === "string") return { text: w };
    return {
      text:
        safeString(w?.text) ||
        safeString(w?.description) ||
        safeString((w as any)?.wish) ||
        "Niet ingevuld",
      category: safeString(w?.category),
      priority: safeString(w?.priority),
    };
  });

  const budget: PveBudget = {
    total: toNumber(budgetRaw.budgetTotaal),
    range:
      Array.isArray(budgetRaw.bandbreedte) && budgetRaw.bandbreedte.length >= 2
        ? [toNumber(budgetRaw.bandbreedte[0]), toNumber(budgetRaw.bandbreedte[1])]
        : undefined,
    ownContribution: toNumber(budgetRaw.eigenInbreng),
    contingency: toNumber(budgetRaw.contingency),
    notes: safeString(budgetRaw.notes) || undefined,
  };

  const techniek: PveTechEntry[] = Object.entries(techniekRaw).map(([k, v]) => ({
    label: k,
    value: safeString(v, String(v ?? "")) || "Niet ingevuld",
  }));

  const duurzaam: PveTechEntry[] = Object.entries(duurzamRaw).map(([k, v]) => ({
    label: k,
    value: safeString(v, String(v ?? "")) || "Niet ingevuld",
  }));

  const risks: PveRisk[] = asArray<any>(risicoRaw.risks).map((r) => ({
    type: safeString(r?.type) || "Risico",
    description: safeString(r?.description) || safeString(r?.text) || "Niet ingevuld",
    consequence: safeString(r?.consequence) || safeString(r?.impact) || undefined,
    mitigation: safeString(r?.mitigation) || safeString(r?.action) || undefined,
  }));

  const projectType = safeString(opts.triage?.projectType) || safeString(basis.projectType);

  return {
    projectName,
    projectType: projectType || "Niet ingevuld",
    location: safeString(basis.locatie) || "Niet ingevuld",
    date: new Date().toLocaleDateString("nl-NL"),
    templateVersion: "PvE v2.0",
    context: {
      description: safeString(basis.toelichting) || "Nog niet gespecificeerd.",
      experience: safeString(basis.ervaring) || "Niet ingevuld",
      planning: safeString(basis.urgency) || "Niet ingevuld",
    },
    summaryWishes,
    rooms,
    wishes,
    budget,
    techniek,
    duurzaam,
    risks,
    nextSteps: [
      "Werk het schetsontwerp uit op basis van deze uitgangspunten.",
      "Laat een kostenraming opstellen en valideer het budgetbereik.",
      "Check vergunningsplicht en benodigde onderzoeken.",
    ],
  };
}
