// lib/ai/intent.ts
export type SmartAction =
  | { type: "add_room"; room: "woonkamer" | "keuken" | "slaapkamer" | "badkamer" }
  | { type: "focus"; chapter: string; fieldId: string }
  | { type: "set_triage"; key: "projectType" | "intent" | "urgentie" | "budget"; value: string | number }
  | { type: "set_basis"; key: "projectNaam" | "locatie"; value: string }
  | { type: "none" };

const ROOM_SYNONYMS: Record<string, SmartAction["room"]> = {
  woonkamer: "woonkamer",
  living: "woonkamer",
  livingroom: "woonkamer",
  zitkamer: "woonkamer",
  salon: "woonkamer",
  keuken: "keuken",
  slaapkamer: "slaapkamer",
  badkamer: "badkamer",
};

const PROJECT_TYPES = ["nieuwbouw", "verbouwing", "hybride"] as const;
const INTENTS = ["architect_start", "contractor_quote", "scenario_exploration"] as const;
const URG = ["laag", "normaal", "dringend"] as const;

function parseNumberFromText(t: string): number | null {
  const m2 = t.match(/(\d{2,6})\s*(?:euro|€|k\b|k\+|\b)/i);
  if (m2) {
    const raw = m2[1];
    const n = Number(raw);
    if (Number.isFinite(n)) return n;
  }
  const k = t.match(/(\d{1,3})\s*k\b/i);
  if (k) {
    const n = Number(k[1]) * 1000;
    if (Number.isFinite(n)) return n;
  }
  const euro = t.match(/€\s*([\d\.]+)/);
  if (euro) {
    const n = Number(euro[1].replace(/\./g, ""));
    if (Number.isFinite(n)) return n;
  }
  return null;
}

export function detectSmartActions(text: string): SmartAction[] {
  const t = (text || "").toLowerCase().trim();
  const acc: SmartAction[] = [];

  // 1) Kamers
  for (const [k, v] of Object.entries(ROOM_SYNONYMS)) {
    if (t.includes(k)) {
      acc.push({ type: "add_room", room: v });
      // na toevoegen ook direct focus op naam/oppervlakte via ChatPanel
      return acc;
    }
  }

  // 2) Triage: projecttype
  for (const pt of PROJECT_TYPES) {
    if (t.includes(pt)) acc.push({ type: "set_triage", key: "projectType", value: pt });
  }

  // 3) Triage: intentie (grof mappen)
  if (t.includes("architect")) acc.push({ type: "set_triage", key: "intent", value: "architect_start" });
  if (t.includes("offerte") || t.includes("aannemer"))
    acc.push({ type: "set_triage", key: "intent", value: "contractor_quote" });
  if (t.includes("scenario") || t.includes("haalbaar"))
    acc.push({ type: "set_triage", key: "intent", value: "scenario_exploration" });

  // 4) Triage: urgentie
  if (t.includes("dringend") || t.includes("spoed")) acc.push({ type: "set_triage", key: "urgentie", value: "dringend" });
  if (t.includes("geen haast") || t.includes("rustig")) acc.push({ type: "set_triage", key: "urgentie", value: "laag" });

  // 5) Triage: budget
  if (t.includes("budget") || t.includes("kosten") || t.includes("prijs")) {
    const n = parseNumberFromText(t);
    if (n) acc.push({ type: "set_triage", key: "budget", value: n });
    acc.push({ type: "focus", chapter: "budget", fieldId: "totaalBudget" });
  }

  // 6) Basis
  if (t.startsWith("projectnaam ") || t.includes("projectnaam:")) {
    const v = t.replace(/^.*projectnaam[:\s]*/i, "").trim();
    if (v) acc.push({ type: "set_basis", key: "projectNaam", value: v });
  }
  if (t.startsWith("locatie ") || t.includes("locatie:") || t.includes("adres ")) {
    const v = t.replace(/^.*(locatie|adres)[:\s]*/i, "").trim();
    if (v) acc.push({ type: "set_basis", key: "locatie", value: v });
  }

  // 7) Navigatie hints
  if (t.includes("ga naar intake") || t.includes("naar intake")) acc.push({ type: "focus", chapter: "intake", fieldId: "__chapterTop" });
  if (t.includes("ga naar basis") || t.includes("naar basis")) acc.push({ type: "focus", chapter: "basis", fieldId: "__chapterTop" });
  if (t.includes("ga naar techniek") || t.includes("naar techniek")) acc.push({ type: "focus", chapter: "techniek", fieldId: "__chapterTop" });

  return acc.length ? acc : [{ type: "none" }];
}
