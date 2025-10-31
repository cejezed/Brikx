// /lib/ai/ProModel.ts
import type { PatchEvent } from "@/types/chat";

// Parse bedragen zoals "250k", "€250.000", "250000"
function parseEuro(n: string): number | null {
  const k = /k/i.test(n);
  const digits = n.replace(/[^\d]/g, "");
  if (!digits) return null;
  const base = Number(digits);
  return k ? base * 1000 : base;
}

// Eerste getal uit tekst (ook "30,5")
function extractFirstNumber(txt: string): number | null {
  const m = txt.match(/(\d+(?:[.,]\d+)?)/);
  if (!m) return null;
  const val = Number(m[1].replace(",", "."));
  return Number.isFinite(val) ? val : null;
}

// m²-waarde nabij een keyword (woonkamer, keuken, ...)
function extractM2NearKeyword(full: string, keyword: string): number | undefined {
  const s = full.toLowerCase();
  const k = keyword.toLowerCase();
  const idx = s.indexOf(k);
  if (idx === -1) return undefined;
  const start = Math.max(0, idx - 25);
  const end = Math.min(s.length, idx + k.length + 25);
  const window = s.slice(start, end);

  // "30 m2", "30m2", "30 m²", "30m²"
  const m = window.match(/(\d+(?:[.,]\d+)?)\s*m(?:[\^]?\s*2|2|²)?/);
  const n = m ? Number(m[1].replace(",", ".")) : extractFirstNumber(window);
  if (n == null || !Number.isFinite(n)) return undefined;
  return Math.round(n);
}

function mkRoom(name: string, m2?: number) {
  return {
    name,
    type: name.toLowerCase(),
    group: "",
    m2: typeof m2 === "number" ? m2 : "",
    wensen: [] as string[],
  };
}

type NavigateChapter =
  | "basis" | "budget" | "ruimtes" | "wensen" | "techniek" | "duurzaamheid" | "risico" | "preview";

function chapterFromQuery(q: string): NavigateChapter | null {
  if (q.includes("basis")) return "basis";
  if (q.includes("budget")) return "budget";
  if (q.includes("ruimte")) return "ruimtes";
  if (q.includes("wens")) return "wensen";
  if (q.includes("techniek")) return "techniek";
  if (q.includes("duurzaam")) return "duurzaamheid";
  if (q.includes("risico")) return "risico";
  if (q.includes("preview") || q.includes("overzicht")) return "preview";
  return null;
}

// Herkent vrije m² invoer: "200", "200m2", "200 m²", "±200"
function looksLikeAreaOnly(q: string): number | null {
  const clean = q.trim().toLowerCase();
  // exact alleen getal of getal met m2/² en optioneel ±
  const onlyNum = clean.match(/^±?\s*(\d+(?:[.,]\d+)?)\s*$/i);
  const withM2  = clean.match(/^±?\s*(\d+(?:[.,]\d+)?)\s*m(?:[\^]?\s*2|2|²)?\s*$/i);
  const g = (withM2 || onlyNum);
  if (!g) return null;
  const n = Number(g[1].replace(",", "."));
  if (!Number.isFinite(n)) return null;
  return Math.round(n);
}

export class ProModel {
  static async classify(query: string, _context: any) {
    const q = query.toLowerCase().trim();

    // ✅ vrije m² invoer (200, 200m2, 200 m²)
    if (looksLikeAreaOnly(q) != null) {
      return { intent: "VULLEN_DATA", confidence: 0.98, tokensUsed: 0 };
    }

    // expliciete data-commando’s
    if (
      q.startsWith("projectnaam ") ||
      /^budget\s+/.test(q) ||
      /^bandbreedte\s+/.test(q) ||
      /^eigen\s*inbreng\s+/.test(q) ||
      /^locatie\s+/.test(q) ||
      /^adres\s+/.test(q) ||
      /^oppervlakte\s+/.test(q) ||
      /^bewoners?\s+/.test(q) ||
      q.includes("slaapkamer") ||
      q.includes("woonkamer") ||
      q.includes("keuken") ||
      q.includes("badkamer") ||
      q.includes("daglicht") ||
      q.includes("licht") ||
      q.includes("lichtkoepel") ||
      q.includes("raam")
    ) {
      return { intent: "VULLEN_DATA", confidence: 0.96, tokensUsed: 0 };
    }

    if (q.startsWith("ga naar") || q.startsWith("open ") || q.includes("ga naar ")) {
      return { intent: "NAVIGATIE", confidence: 0.95, tokensUsed: 0 };
    }

    if (q.includes("hoe") || q.includes("waarom") || q.startsWith("wat ")) {
      return { intent: "ADVIES_VRAAG", confidence: 0.75, tokensUsed: 0 };
    }

    return { intent: "SMALLTALK", confidence: 0.6, tokensUsed: 0 };
  }

  static extractNavigation(query: string): NavigateChapter | null {
    return chapterFromQuery(query.toLowerCase().trim());
  }

  static async generatePatch(query: string, _wizardState: any): Promise<PatchEvent | PatchEvent[] | null> {
    const raw = query.trim();
    const q = raw.toLowerCase();

    // ✅ vrije m² invoer → Basis.oppervlakteM2
    const freeM2 = looksLikeAreaOnly(q);
    if (freeM2 != null) {
      return { chapter: "basis", delta: { path: "oppervlakteM2", operation: "set", value: freeM2 } };
    }

    // ===== BASIS =====
    if (q.startsWith("projectnaam ")) {
      const name = raw.slice("projectnaam ".length).trim();
      if (name) return { chapter: "basis", delta: { path: "projectNaam", operation: "set", value: name } };
      return null;
    }
    if (q.startsWith("locatie ") || q.startsWith("adres ")) {
      const val = raw.replace(/^(locatie|adres)\s+/i, "").trim();
      if (val) return { chapter: "basis", delta: { path: "locatie", operation: "set", value: val } };
      return null;
    }
    if (q.startsWith("oppervlakte ")) {
      const num = extractFirstNumber(raw.replace(/^oppervlakte\s+/i, ""));
      if (num != null) return { chapter: "basis", delta: { path: "oppervlakteM2", operation: "set", value: Math.round(num) } };
      return null;
    }
    if (/^bewoners?\s+/.test(q)) {
      const num = extractFirstNumber(raw.replace(/^bewoners?\s+/i, ""));
      if (num != null) return { chapter: "basis", delta: { path: "bewonersAantal", operation: "set", value: Math.round(num) } };
      return null;
    }

    // ===== BUDGET =====
    if (/^budget\s+/.test(q)) {
      const num = parseEuro(raw.replace(/^budget\s+/i, ""));
      if (num != null) return { chapter: "budget", delta: { path: "budgetTotaal", operation: "set", value: num } };
      return null;
    }
    if (/^bandbreedte\s+/.test(q)) {
      const rest = raw.replace(/^bandbreedte\s+/i, "");
      const parts = rest.split(/[–-]|tot/i).map((s) => s.trim()).filter(Boolean);
      if (parts.length >= 2) {
        const min = parseEuro(parts[0]);
        const max = parseEuro(parts[1]);
        if (min != null || max != null) {
          return { chapter: "budget", delta: { path: "bandbreedte", operation: "set", value: [min ?? null, max ?? null] } };
        }
      }
      return null;
    }
    if (/^eigen\s*inbreng\s+/.test(q)) {
      const num = parseEuro(raw.replace(/^eigen\s*inbreng\s+/i, ""));
      return { chapter: "budget", delta: { path: "eigenInbreng", operation: "set", value: num } };
    }

    // ===== RUIMTES =====
    if (q.includes("slaapkamer")) {
      const mCount = q.match(/(\d+)\s*sl[aá]apkamer/);
      const count = mCount ? Math.max(1, parseInt(mCount[1], 10)) : 1;
      const patches: PatchEvent[] = [];
      for (let i = 0; i < count; i++) {
        patches.push({ chapter: "ruimtes", delta: { path: "", operation: "add", value: mkRoom("Slaapkamer") } });
      }
      return patches;
    }

    if (q.includes("woonkamer")) {
      const m2 = extractM2NearKeyword(raw, "woonkamer");
      return { chapter: "ruimtes", delta: { path: "", operation: "add", value: mkRoom("Woonkamer", m2) } };
    }
    if (q.includes("keuken")) {
      // wens (daglicht/raam/koepel) → voeg toe aan Keuken.wensen
      if (q.includes("daglicht") || q.includes("licht") || q.includes("lichtkoepel") || q.includes("raam")) {
        const wish = /lichtkoepel/.test(q) ? 'Lichtkoepel'
          : /daglicht/.test(q) ? 'Daglicht'
          : /raam/.test(q) ? 'Extra raam'
          : 'Meer daglicht';
        return { chapter: "ruimtes", delta: { path: "byName:Keuken.wensen", operation: "add", value: wish } };
      }
      const m2 = extractM2NearKeyword(raw, "keuken");
      return { chapter: "ruimtes", delta: { path: "", operation: "add", value: mkRoom("Keuken", m2) } };
    }
    if (q.includes("badkamer")) {
      const m2 = extractM2NearKeyword(raw, "badkamer");
      return { chapter: "ruimtes", delta: { path: "", operation: "add", value: mkRoom("Badkamer", m2) } };
    }

    // Generiek: "daglicht in de <ruimte>"
    if ((q.includes("daglicht") || q.includes("licht") || q.includes("lichtkoepel") || q.includes("raam")) && /in de\s+(\w+)/.test(q)) {
      const room = (q.match(/in de\s+([a-zà-ÿ]+)/)![1] || '').toLowerCase();
      const canonical = room.charAt(0).toUpperCase() + room.slice(1);
      const wish = /lichtkoepel/.test(q) ? 'Lichtkoepel'
        : /daglicht/.test(q) ? 'Daglicht'
        : /raam/.test(q) ? 'Extra raam'
        : 'Meer daglicht';
      return { chapter: "ruimtes", delta: { path: `byName:${canonical}.wensen`, operation: "add", value: wish } };
    }

    return null;
  }

  static async generateResponse(query: string) {
    return `Ik heb je input ontvangen: "${query}".`;
  }
}
