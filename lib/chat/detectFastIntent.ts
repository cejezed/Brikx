// lib/chat/detectFastIntent.ts
// Build v2.0: losse coupling — geen type import uit "@/types/chat".

// Minimale, gedeelde vorm die ChatRequest verwacht (zie jouw types/chat.ts > ChatRequest.clientFastIntent)
export type ClientFastIntent = {
  type: string; // bv. "NAVIGATIE" | "BUDGET" | "RUIMTE"
  confidence: number; // 0..1
  action?: string; // bv. "NAVIGATE" | "PATCH"
  chapter?: string; // bv. "techniek"
  field?: string; // bv. "budget"
  // je kunt hier later extra velden toevoegen zonder breuk
};

const chapterMap: Record<string, string> = {
  budget: "budget",
  wensen: "wensen",
  ruimtes: "ruimtes",
  techniek: "techniek",
  duurzaamheid: "duurzaamheid",
  risico: "risico",
  preview: "preview",
  export: "export",
};

// Helpers
const norm = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/\s+/g, " ").trim();

// Herken getallen met k/m, euro, punten/komma's
// Voorbeelden: "250k", "€ 250.000", "300.000", "1,2m", "120000"
const BUDGET_RE =
  /(?:^|\s)(?:€\s*)?(\d{1,3}(?:[.\s]\d{3})+|\d+(?:[.,]\d+)?)(\s*[km])?(?=\s*([a-z]|$))/i;

function parseBudgetNumber(rawNum: string, suffix?: string | null): number | null {
  // Strip thousand separators (., space), convert comma to dot
  const s = rawNum.replace(/[.\s]/g, "").replace(",", ".");
  const n = Number(s);
  if (!isFinite(n)) return null;

  const suf = (suffix || "").toLowerCase().trim();
  if (suf === "k") return Math.round(n * 1_000);
  if (suf === "m") return Math.round(n * 1_000_000);
  return Math.round(n);
}

// Navigatiezinnen
const NAVI_HINTS: Array<[RegExp, string]> = [
  [/techniek|installatie|ventilatie|warmtepomp/, "techniek"],
  [/duurzaam|duurzaamheid|epc|beng|groen/, "duurzaamheid"],
  [/risico|kadastraal|vergunning|welstand/, "risico"],
  [/wens(en)?|prioriteit|moscow/, "wensen"],
  [/ruimte(n)?|kamer(s)?|plattegrond|indeling/, "ruimtes"],
  [/budget|kosten|prijs/, "budget"],
  [/preview|overzicht|samenvatting|pve/i, "preview"],
  [/export|pdf|json|opslaan/, "export"],
];

// Robuuste patronen voor "ruimte toevoegen"
const ADD_ROOM_VARIANTS: RegExp[] = [
  // "voeg ... toe" varianten
  /\bvoeg\s+.*\s+toe\b.*\b(kamer|slaapkamer|badkamer|keuken|berging|werkplek)\b/,
  // "toevoegen ..." varianten
  /\btoevoegen\b.*\b(kamer|slaapkamer|badkamer|keuken|berging|werkplek)\b/,
  // "erbij zetten ..." varianten
  /\berbij\s+zetten\b.*\b(kamer|slaapkamer|badkamer|keuken|berging|werkplek)\b/,
  // "extra ..." varianten
  /\bextra\b.*\b(kamer|slaapkamer|badkamer|keuken|berging|werkplek)\b/,
  // "[ruimte] erbij" (bv. "slaapkamer erbij")
  /\b(kamer|slaapkamer|badkamer|keuken|berging|werkplek)\b.*\berbij\b/,
];

// Snelle detectie voor intent; geef null als niets matcht
export default function detectFastIntent(input: string): ClientFastIntent | null {
  const q = norm(input);

  // 1) Budget intent — "budget 250k", "€250.000", "budget = 180000"
  if (/budget|€|\bk\b|\bm\b/.test(q)) {
    const m = q.match(BUDGET_RE);
    if (m) {
      const num = parseBudgetNumber(m[1], m[2]);
      if (num && num > 0 && num < 20_000_000) {
        return {
          type: "BUDGET",
          confidence: 0.92,
          action: "PATCH",
          chapter: "budget",
          field: "budget",
        };
      }
    }
  }

  // 2) Navigatie — "ga naar techniek", "open wensen", "toon preview"
  if (/ga naar|open|naar|toon|bekijk|switch naar/.test(q)) {
    for (const [re, ch] of NAVI_HINTS) {
      if (re.test(q)) {
        return {
          type: "NAVIGATIE",
          confidence: 0.88,
          action: "NAVIGATE",
          chapter: chapterMap[ch] ?? ch,
        };
      }
    }
  }

  // 3) Ruimte toevoegen — "voeg slaapkamer toe", "badkamer erbij"
  if (ADD_ROOM_VARIANTS.some((re) => re.test(q))) {
    return {
      type: "RUIMTE",
      confidence: 0.8,
      action: "PATCH",
      chapter: "ruimtes",
      field: "addRoom",
    };
  }

  // 4) Wensen — "zet vloerverwarming als must", "prioriteit ramen = nice"
  if (/wens|wensen|must|nice|toekomst|prioriteit/.test(q)) {
    return {
      type: "WENSEN",
      confidence: 0.75,
      action: "PATCH",
      chapter: "wensen",
      field: "wishEdit",
    };
  }

  // 5) Fallback: geen snelle intent
  return null;
}
