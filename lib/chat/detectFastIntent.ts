// /lib/chat/detectFastIntent.ts
// 💡 STRUCTUREEL AANGEPAST: 'value' toegevoegd en complexe taken (RUIMTE/WENSEN) verwijderd 
//    om de "slimme" ProModel LLM zijn werk te laten doen.

// Minimale, gedeelde vorm die ChatRequest verwacht
export type ClientFastIntent = {
  type: string; // bv. "NAVIGATIE" | "BUDGET"
  confidence: number; // 0..1
  action?: string; // bv. "NAVIGATE" | "PATCH"
  chapter?: string; // bv. "techniek" | "triage"
  field?: string; // bv. "budget"
  value?: any; // 💡 FIX: De waarde die moet worden opgeslagen
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
const BUDGET_RE =
  /(?:^|\s)(?:€\s*)?(\d{1,3}(?:[.\s]\d{3})+|\d+(?:[.,]\d+)?)(\s*[km])?(?=\s*([a-z]|$))/i;

function parseBudgetNumber(rawNum: string, suffix?: string | null): number | null {
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

// 💡 VERWIJDERD: ADD_ROOM_VARIANTS. 
// Dit is complex taalbegrip (bijv. "3 slaapkamers") en MOET
// door de "slimme" LLM (ProModel.generatePatch) worden afgehandeld, niet door "domme" regex.

// Snelle detectie voor intent; geef null als niets matcht
export default function detectFastIntent(input: string): ClientFastIntent | null {
  const q = norm(input);

  // 1) Budget intent — "budget 250k", "€250.000", "budget = 180000"
  // Dit is een simpele, niet-dubbelzinnige 'set'-actie.
  if (/budget|€|\bk\b|\bm\b/.test(q)) {
    const m = q.match(BUDGET_RE);
    if (m) {
      const num = parseBudgetNumber(m[1], m[2]);
      if (num && num > 0 && num < 20_000_000) {
        return {
          type: "BUDGET",
          confidence: 0.92,
          action: "PATCH",
          // 💡 FIX: Dit moet matchen met useWizardState.ts -> setBudgetValue -> triage.budget
          chapter: "triage", 
          field: "budget",
          value: num, // 💡 FIX: De waarde (het bedrag) wordt nu meegestuurd
        };
      }
    }
  }

  // 2) Navigatie — "ga naar techniek", "open wensen", "toon preview"
  // Dit is een simpele, niet-dubbelzinnige 'navigate'-actie.
  if (/ga naar|open|naar|toon|bekijk|switch naar/.test(q)) {
    for (const [re, ch] of NAVI_HINTS) {
      if (re.test(q)) {
        return {
          type: "NAVIGATIE",
          confidence: 0.88,
          action: "NAVIGATE",
          chapter: chapterMap[ch] ?? ch,
          // Geen 'field' of 'value' nodig
        };
      }
    }
  }

  // 💡 VERWIJDERD: De 'RUIMTE' en 'WENSEN' checks.
  // Dit zijn complexe queries die naar de server (LLM) MOETEN
  // om correct geïnterpreteerd te worden (bijv. "3 woonkamers" vs "grote woonkamer").

  // 5) Fallback: geen snelle intent
  return null;
}