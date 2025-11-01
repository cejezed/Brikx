// /lib/ai/ProModel.ts
// BRIKX Build v2.0 — Pro-model (server-side AI-first triage)
// - classify(): intent + confidence (+ policy hints in route.ts)
// - generatePatch(): deterministische extractie → PatchEvent
// - generateResponse(): (optioneel RAG-context) → streaming tekst
// - synthesizePvE(): gedeelde “brain” voor export
//
// NOTE: Deze module bevat géén SSE of request/response code.
//       Streaming gebeurt in /app/api/chat/route.ts (createSSEStream()).

import type { WizardState, ChatRequest } from "@/types/chat";
import type { PatchEvent as PatchFromContract } from "@/types/chat";

// ---------- Types ----------
export type PatchEvent = PatchFromContract;

type Intent =
  | "VULLEN_DATA"
  | "ADVIES_VRAAG"
  | "NAVIGATIE"
  | "SMALLTALK"
  | "OUT_OF_SCOPE";

type ClassifyResult = {
  intent: Intent;
  confidence: number; // 0..1
  reason?: string;
  tokensUsed?: number; // telemetry hook
};

type RAGContext = {
  topicId: string;
  docs: Array<{ id?: string; text: string; source?: string }>;
  cacheHit: boolean;
} | null;

type GenerateOptions = {
  mode: "PREVIEW" | "PREMIUM";
  wizardState: WizardState;
};

// ============================================================================
// Utilities (deterministic parsing, Dutch locale helpers)
// ============================================================================
const asLower = (s: string) => String(s ?? "").toLowerCase().trim();

function parseEuro(input: string): number | null {
  // supports: "250k", "€250.000", "250.000", "250000", "250 K"
  const k = /k/i.test(input);
  const digits = input.replace(/[^\d]/g, "");
  if (!digits) return null;
  const base = Number(digits);
  if (!Number.isFinite(base)) return null;
  return k ? base * 1000 : base;
}

function firstNumber(txt: string): number | null {
  const m = String(txt).match(/(\d+(?:[.,]\d+)?)/);
  if (!m) return null;
  const n = Number(m[1].replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function looksLikeAreaOnly(raw: string): number | null {
  const clean = asLower(raw);
  const onlyNum = clean.match(/^±?\s*(\d+(?:[.,]\d+)?)\s*$/);
  const withM2 = clean.match(/^±?\s*(\d+(?:[.,]\d+)?)\s*m(?:[\^]?\s*2|2|²)?\s*$/);
  const g = withM2 || onlyNum;
  if (!g) return null;
  const n = Number(g[1].replace(",", "."));
  if (!Number.isFinite(n)) return null;
  return Math.round(n);
}

function extractM2NearKeyword(full: string, keyword: string): number | undefined {
  const s = asLower(full);
  const k = asLower(keyword);
  const idx = s.indexOf(k);
  if (idx === -1) return undefined;
  const start = Math.max(0, idx - 25);
  const end = Math.min(s.length, idx + k.length + 25);
  const window = s.slice(start, end);
  const m = window.match(/(\d+(?:[.,]\d+)?)\s*m(?:[\^]?\s*2|2|²)?/);
  const n = m ? Number(m[1].replace(",", ".")) : firstNumber(window);
  if (n == null || !Number.isFinite(n)) return undefined;
  return Math.round(n);
}

function mkRoom(name: string, m2?: number) {
  return {
    name,
    type: asLower(name),
    group: "",
    m2: typeof m2 === "number" ? m2 : "",
    wensen: [] as string[],
  };
}

// ============================================================================
// ProModel — server-side “shared brain”
// ============================================================================
export class ProModel {
  // --------------------------------------------------------------------------
  // 1) Intent classification (regex-first; LLM later plug-in)
  // --------------------------------------------------------------------------
  static async classify(query: string, context: Partial<WizardState>): Promise<ClassifyResult> {
    const q = asLower(query);

    // NAVIGATIE
    if (q.startsWith("ga naar ") || q.startsWith("open ")) {
      return {
        intent: "NAVIGATIE",
        confidence: 0.98,
        reason: "Directe navigatie-instructie",
        tokensUsed: 0,
      };
    }

    // VULLEN_DATA (basis/budget/ruimtes/wensen)
    const isData =
      /^projectnaam\s+/.test(query) ||
      /^locatie\s+|^adres\s+/i.test(query) ||
      /^bewoners?\s+/i.test(query) ||
      /^oppervlakte\s+/i.test(query) ||
      /^budget\s+/i.test(query) ||
      /^bandbreedte\s+/i.test(query) ||
      /^eigen\s*inbreng\s+/i.test(query) ||
      /\bsl[aá]apkamer/.test(q) ||
      /\bwoonkamer\b/.test(q) ||
      /\bkeuken\b/.test(q) ||
      /\bbadkamer\b/.test(q) ||
      /\b(\d+)\s*(m2|m²)\b/.test(q) ||
      /^\s*±?\s*\d+(?:[.,]\d+)?\s*(m2|m²)?\s*$/.test(query.trim());

    if (isData) {
      return {
        intent: "VULLEN_DATA",
        confidence: 0.9, // heuristisch; policy beslissen we in route.ts
        reason: "Herkenbare datacommand of kamerverwijzing",
        tokensUsed: 0,
      };
    }

    // ADVIES_VRAAG
    if (q.startsWith("hoe ") || q.startsWith("waarom ") || q.startsWith("wat ")) {
      return {
        intent: "ADVIES_VRAAG",
        confidence: 0.8,
        reason: "Vorm van informatieve vraag",
        tokensUsed: 0,
      };
    }

    // SMALLTALK
    if (/^(hallo|hoi|bedankt|dank je|dank u|goedem|hey)\b/.test(q)) {
      return {
        intent: "SMALLTALK",
        confidence: 0.7,
        reason: "Casuale begroeting/bedankje",
        tokensUsed: 0,
      };
    }

    // OUT_OF_SCOPE
    const oos = /(website|wiskunde|ai model|crypto|auto onderhoud|belasting aangifte)/.test(q);
    if (oos) {
      return {
        intent: "OUT_OF_SCOPE",
        confidence: 0.9,
        reason: "Onderwerp valt buiten PvE-domein",
        tokensUsed: 0,
      };
    }

    // Default
    return { intent: "SMALLTALK", confidence: 0.55, reason: "Onzeker", tokensUsed: 0 };
  }

  // --------------------------------------------------------------------------
  // 2) Patch generation (deterministisch; LLM-fallback optioneel later)
  // --------------------------------------------------------------------------
  static async generatePatch(query: string, wizardState: WizardState): Promise<PatchEvent | null> {
    const raw = String(query);
    const q = asLower(raw);

    // Basis: vrije m² invoer (alleen getal of getal+m2)
    const freeM2 = looksLikeAreaOnly(raw);
    if (freeM2 != null) {
      return {
        chapter: "basis",
        delta: { path: "oppervlakteM2", operation: "set", value: freeM2 },
      };
    }

    // Basis: projectnaam
    if (/^projectnaam\s+/i.test(raw)) {
      const v = raw.replace(/^projectnaam\s+/i, "").trim();
      if (v) {
        return {
          chapter: "basis",
          delta: { path: "projectNaam", operation: "set", value: v },
        };
      }
    }

    // Basis: locatie/adres
    if (/^(locatie|adres)\s+/i.test(raw)) {
      const v = raw.replace(/^(locatie|adres)\s+/i, "").trim();
      if (v) {
        return {
          chapter: "basis",
          delta: { path: "locatie", operation: "set", value: v },
        };
      }
    }

    // Basis: oppervlakte expliciet “oppervlakte 120”
    if (/^oppervlakte\s+/i.test(raw)) {
      const n = firstNumber(raw.replace(/^oppervlakte\s+/i, ""));
      if (n != null) {
        return {
          chapter: "basis",
          delta: { path: "oppervlakteM2", operation: "set", value: Math.round(n) },
        };
      }
    }

    // Basis: bewoners
    if (/^bewoners?\s+/i.test(raw)) {
      const n = firstNumber(raw.replace(/^bewoners?\s+/i, ""));
      if (n != null) {
        return {
          chapter: "basis",
          delta: { path: "bewonersAantal", operation: "set", value: Math.round(n) },
        };
      }
    }

    // Budget
    if (/^budget\s+/i.test(raw)) {
      const n = parseEuro(raw.replace(/^budget\s+/i, ""));
      if (n != null) {
        return {
          chapter: "budget",
          delta: { path: "budgetTotaal", operation: "set", value: n },
        };
      }
    }

    if (/^bandbreedte\s+/i.test(raw)) {
      const rest = raw.replace(/^bandbreedte\s+/i, "");
      const parts = rest
        .split(/[–-]|tot/i)
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts.length >= 2) {
        const min = parseEuro(parts[0]);
        const max = parseEuro(parts[1]);
        if (min != null || max != null) {
          return {
            chapter: "budget",
            delta: {
              path: "bandbreedte",
              operation: "set",
              value: [min ?? null, max ?? null],
            },
          };
        }
      }
    }

    if (/^eigen\s*inbreng\s+/i.test(raw)) {
      const n = parseEuro(raw.replace(/^eigen\s*inbreng\s+/i, ""));
      return {
        chapter: "budget",
        delta: { path: "eigenInbreng", operation: "set", value: n },
      };
    }

    // Ruimtes
    const addRoom = (room: ReturnType<typeof mkRoom>): PatchEvent => ({
      chapter: "ruimtes",
      delta: { path: "", operation: "add", value: room },
    });

    // slaapkamers (aantal)
    const mBed = q.match(/(\d+)\s*sl[aá]apkamer/);
    if (mBed) {
      const count = Math.max(1, parseInt(mBed[1], 10));
      // In dit model sturen we per keer één "add"; client mag dit idempotent verwerken
      // of de server kan dit n keren sturen. We kiezen één keer, met meta "count".
      return {
        chapter: "ruimtes",
        delta: {
          path: "",
          operation: "add",
          value: { ...mkRoom("Slaapkamer"), count },
        } as any,
      };
    }

    if (q.includes("woonkamer")) {
      const m2 = extractM2NearKeyword(raw, "woonkamer");
      return addRoom(mkRoom("Woonkamer", m2));
    }

    if (q.includes("keuken")) {
      if (q.includes("lichtkoepel") || q.includes("daglicht") || q.includes("licht") || q.includes("raam")) {
        const wish =
          /lichtkoepel/.test(q)
            ? "Lichtkoepel"
            : /daglicht/.test(q)
            ? "Daglicht"
            : /raam/.test(q)
            ? "Extra raam"
            : "Meer daglicht";
        return {
          chapter: "ruimtes",
          delta: { path: "byName:Keuken.wensen", operation: "add", value: wish },
        };
      }
      const m2 = extractM2NearKeyword(raw, "keuken");
      return addRoom(mkRoom("Keuken", m2));
    }

    if (q.includes("badkamer")) {
      const m2 = extractM2NearKeyword(raw, "badkamer");
      return addRoom(mkRoom("Badkamer", m2));
    }

    // Geen deterministische match → null (route.ts laat policy bepalen en kan om verduidelijking vragen)
    return null;
  }

  // --------------------------------------------------------------------------
  // 3) Text generation (advies/smalltalk; RAG optioneel meegegeven)
  // --------------------------------------------------------------------------
  static async generateResponse(
    query: string,
    ragContext: RAGContext,
    options: GenerateOptions
  ): Promise<string> {
    const { mode } = options;
    const q = asLower(query);

    // ADVIES-templates (super beknopt, professioneel; ‘u/uw’)
    if (/(daglicht|licht|raam|glas|lichtkoepel)/.test(q)) {
      const base =
        "Voor veel daglicht let u op oriëntatie (zuid/zuid-west), grotere gevelopeningen met goede U-/g-waarden en voldoende zonwering. Breng daglicht diep in de plattegrond via open verbindingen of daklicht.";
      const rag =
        ragContext && ragContext.docs.length > 0
          ? " Ik heb aanvullende referenties geraadpleegd en kan dit verder toespitsen op uw situatie wanneer gewenst."
          : "";
      return `${base}${rag}`;
    }

    if (/(geluid|akoestiek|stil|stilte)/.test(q)) {
      const base =
        "Plaats gevoelige ruimten aan de rustige gevel, kies kierdichte deuren en overweeg akoestische scheidingswanden/vloeronderlagen. Ventilatie moet fluisterstil zijn (±25 dB(A) in verblijfsruimten).";
      const rag =
        ragContext && ragContext.docs.length > 0
          ? " Op basis van de geraadpleegde documenten kan ik u voorbeelden geven van beproefde oplossingen per ruimte."
          : "";
      return `${base}${rag}`;
    }

    // SMALLTALK / fallback
    if (/^(hallo|hoi|hey|goedem)/.test(q)) {
      return "Goedemiddag! Waarmee zal ik beginnen: basis, budget of ruimtes?";
    }

    // Kosten in PREVIEW vermijden
    if (/(kosten|prijs|euro|€)/.test(q) && mode === "PREVIEW") {
      return "In de Preview-modus deel ik geen bedragen. Wilt u richtwaarden en keuzes in context, dan kan ik dat in de Premium-modus toelichten.";
    }

    // Default neutraal
    return `Ik heb "${query}" ontvangen. Zal ik gegevens invullen (bv. ‘woonkamer 30 m²’) of wenst u advies over een onderwerp?`;
  }

  // --------------------------------------------------------------------------
  // 4) PvE Synthesis (gedeeld door chat/export)
  // --------------------------------------------------------------------------
  static async synthesizePvE(
    pveData: any,
    options: { mode: "PREVIEW" | "PREMIUM"; ragContext?: RAGContext }
  ): Promise<string> {
    // Lightweight, deterministic skeleton (LLM later pluggable).
    // Houd het kort en professioneel; geen kosten in PREVIEW.
    const mode = options.mode;
    const hasRooms = !!pveData?.ruimtes?.length || !!pveData?.chapterAnswers?.ruimtes;

    const projecten = pveData?.basis?.projectNaam ?? pveData?.chapterAnswers?.basis?.projectNaam ?? "het project";
    const samenvatting = `Dit PvE geeft de functionele uitgangspunten en ruimteverhoudingen weer voor ${projecten}.`;

    const functioneel: string[] = [];
    const basis = pveData?.basis ?? pveData?.chapterAnswers?.basis ?? {};
    if (basis?.bewonersAantal) functioneel.push(`Aantal bewoners: ${basis.bewonersAantal}.`);
    if (basis?.oppervlakteM2) functioneel.push(`Indicatieve gebruiksoppervlakte: ${basis.oppervlakteM2} m².`);

    const ruimtenote = hasRooms ? "Belangrijke ruimten zijn benoemd; let op samenhang (daglicht, looproutes, privacy)." : "Belangrijke ruimten worden later specifiek gemaakt.";

    const aandacht = [
      "Controleer spanningen tussen wensen, budget en locatie.",
      "Borg daglicht, akoestiek en energieprestaties in het voorlopig ontwerp.",
    ];

    const lines: string[] = [
      "—",
      "PROJECTSAMENVATTING",
      samenvatting,
      "",
      "FUNCTIONELE EISEN",
      ...(functioneel.length ? functioneel : ["(Nog beperkte gegevens beschikbaar)."]),
      "",
      "RUIMTEVERHOUDINGEN",
      ruimtenote,
      "",
      "AANDACHTSPUNTEN",
      ...aandacht,
      "",
      "VOLGENDE STAP",
      "Werk het voorlopig ontwerp uit en vul ontbrekende basisgegevens (projectnaam/locatie/bandbreedte) aan.",
      "—",
    ];

    if (mode === "PREMIUM") {
      // Premium: little extra context text, still deterministic
      lines.push(
        "",
        "DISCLAIMER_PREMIUM:",
        "Let op: dit is indicatief en geen formeel advies. Bespreek dit met uw architect/gemeente/aannemer voordat u actie onderneemt."
      );
    }

    return lines.join("\n");
  }

  // --------------------------------------------------------------------------
  // (Optioneel) Topic detectie helper voor RAG (route kan ook Kennisbank.query gebruiken)
  // --------------------------------------------------------------------------
  static detectTopic(query: string): string {
    const q = asLower(query);
    if (/(licht|raam|glas|daglicht)/.test(q)) return "natural_light";
    if (/(geluid|akoestiek|stil)/.test(q)) return "soundproofing";
    if (/(warm|koud|therm|isolatie|energie)/.test(q)) return "thermal_comfort";
    if (/(kosten|prijs|budget|euro|€)/.test(q)) return "budget_estimation";
    if (/(vergunning|bestemmingsplan|gemeente|regel)/.test(q)) return "permits_regulation";
    return "general";
  }
}

// ============================================================================
// Minimal inline tests (dev-time sanity), tree-shaken in prod
// ============================================================================
if (process.env.NODE_ENV === "development") {
  // Quick sanity: patch extraction
  (async () => {
    const p = await ProModel.generatePatch("budget 250k", { stateVersion: 1 } as any);
    if (p?.chapter !== "budget") {
      // eslint-disable-next-line no-console
      console.warn("[ProModel] Sanity check failed for 'budget 250k'");
    }
  })();
}
