// /lib/ai/ProModel.ts
// ✅ v3.3 Gecorrigeerd: Lokaal type 'GeneratePatchResult' verwijderd.

import type {
  WizardState,
  ChapterKey,
  PatchDelta,
  PatchEvent,
  GeneratePatchResult, // ✅ v3.3: Correct geïmporteerd
  BasisData,
} from "@/types/project";

// ... (alle bestaande types behouden: ProIntent, ProPolicy, ClassifyResult, RAGDoc, RAGContext, GenerateOptions)

export type ProIntent =
  | "VULLEN_DATA"
  | "ADVIES_VRAAG"
  | "NAVIGATIE"
  | "SMALLTALK"
  | "OUT_OF_SCOPE";

export type ProPolicy =
  | "APPLY_OPTIMISTIC"
  | "APPLY_WITH_INLINE_VERIFY"
  | "ASK_CLARIFY"
  | "JUST_ANSWER"
  | "JUST_NUDGE"
  | "IGNORE";

export interface ClassifyResult {
  intent: ProIntent;
  confidence: number;
  reason?: string;
  tokensUsed?: number;
}

// ⚠️ FIX: Dit lokale type is VERWIJDERD omdat het nu wordt geïmporteerd.
// export interface GeneratePatchResult { ... }

export interface RAGDoc {
  id?: string;
  text: string;
  source?: string;
}

export interface RAGContext {
  topicId: string;
  docs: RAGDoc[];
  cacheHit: boolean;
}

type HistoryItem = {
  role: "user" | "assistant";
  content: string;
};

export interface GenerateOptions {
  mode: "PREVIEW" | "PREMIUM";
  wizardState: WizardState;
  ragContext?: RAGContext | null;
  history?: HistoryItem[];
}

// ... (helpers behouden)

const asLower = (s: string) => (s ?? "").toLowerCase().trim();

const VALID_CHAPTERS: ChapterKey[] = [
  "basis",
  "ruimtes",
  "wensen",
  "budget",
  "techniek",
  "duurzaam",
  "risico",
];

const VALID_OPS: PatchDelta["operation"][] = ["set", "append", "remove"];

function deriveContext(wizardState: WizardState): {
  projectName: string;
  projectType: string;
  activeChapter: ChapterKey;
} {
  const basis = (wizardState.chapterAnswers?.basis ?? {}) as Partial<BasisData>;

  const projectName =
    (basis.projectNaam && basis.projectNaam.trim()) || "uw project";

  // ✅ v3.3: Leest 'projectType' uit 'basis' (Grondwet) en 'triage' (fallback)
  const projectTypeFromBasis = basis.projectType;
  const projectTypeFromTriage = wizardState.triage?.projectType;
  const projectType =
    projectTypeFromBasis || projectTypeFromTriage || "onbekend";

  const activeChapter =
    (wizardState.currentChapter &&
    VALID_CHAPTERS.includes(wizardState.currentChapter)
      ? wizardState.currentChapter
      : "basis");

  return { projectName, projectType, activeChapter };
}

function buildSystemPrompt(wizardState: WizardState): string {
  const { projectName, projectType, activeChapter } = deriveContext(wizardState);

  // ✅ v3.4 Systeemprompt met expliciete data schemas
  return `
U bent "Jules", de vaste digitale bouwcoach van Brikx.

CONTEXT OVER DIT PROJECT:
- Projectnaam: ${projectName}
- Projecttype: ${projectType}
- Actief hoofdstuk in de wizard: ${activeChapter}

ROL & KADERS:
- U werkt strikt binnen de bestaande Brikx-wizardstructuur.
- Alle wijzigingen aan de data verlopen via PatchEvent-array.
- Toegestane chapters: ["basis","ruimtes","wensen","budget","techniek","duurzaam","risico"].
- Toegestane operations: "set", "append", "remove".
- Gebruik "append" uitsluitend op velden die arrays zijn.
- Waarden moeten realistisch, concreet en intern consistent zijn.
- U spreekt de gebruiker altijd aan met "u" en "uw".

KRITIEKE DATA SCHEMAS:

1. CHAPTER "basis": Simpele velden (gebruik operation="set")
   Structuur: { projectType: string, projectNaam?: string, locatie?: string, projectSize?: string, urgency?: string, budget?: number, ... }
   - projectType (VERPLICHT): "nieuwbouw" | "verbouwing" | "bijgebouw" | "hybride" | "anders"
   - projectSize: "<75m2" | "75-150m2" | "150-250m2" | ">250m2"
   - urgency: "<3mnd" | "3-6mnd" | "6-12mnd" | ">12mnd" | "onzeker"
   Voorbeeld patch:
   { "chapter": "basis", "delta": { "path": "projectNaam", "operation": "set", "value": "Villa Zonneduin" } }

2. CHAPTER "ruimtes": Array van Room objecten (gebruik operation="append" voor nieuwe ruimtes)
   Structuur: { rooms: Room[] }
   Room object: { id: string, name: string, type: string, group?: string, m2?: number | "", wensen?: string[], count?: number }
   - id: VERPLICHT, unieke string (UUID-formaat)
   - name: VERPLICHT, naam van de ruimte (bijv. "Grote woonkamer")
   - type: VERPLICHT, type ruimte (bijv. "woonkamer", "keuken", "slaapkamer", "badkamer")
   - group: optioneel (bijv. "wonen", "koken", "slapen")
   - m2: optioneel, oppervlakte in vierkante meters
   Voorbeeld patch voor "ik wil een grote keuken":
   {
     "chapter": "ruimtes",
     "delta": {
       "path": "rooms",
       "operation": "append",
       "value": {
         "id": "550e8400-e29b-41d4-a716-446655440000",
         "name": "Grote keuken",
         "type": "keuken",
         "group": "koken"
       }
     }
   }

3. CHAPTER "wensen": Array van Wish objecten (gebruik operation="append" voor nieuwe wensen)
   Structuur: { wishes: Wish[] }
   Wish object: { id: string, text: string, category?: string, priority?: string }
   - id: VERPLICHT, unieke string (UUID-formaat)
   - text: VERPLICHT, de wens in tekst
   - category: optioneel, "comfort" | "style" | "function" | "other"
   - priority: optioneel, "must" | "nice" | "optional"
   Voorbeeld patch voor "ik wil veel daglicht":
   {
     "chapter": "wensen",
     "delta": {
       "path": "wishes",
       "operation": "append",
       "value": {
         "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
         "text": "Veel daglicht in de woonruimtes",
         "category": "comfort",
         "priority": "must"
       }
     }
   }

4. CHAPTER "budget": Simpele velden (gebruik operation="set")
   Structuur: { budgetTotaal?: number, eigenInbreng?: number, contingency?: number, bandbreedte?: [number|null, number|null], notes?: string }
   Voorbeeld patch voor "mijn budget is 500000 euro":
   { "chapter": "budget", "delta": { "path": "budgetTotaal", "operation": "set", "value": 500000 } }

BELANGRIJKE REGELS:
1. Genereer ALTIJD een UNIEKE UUID voor nieuwe array items (rooms, wishes, risks)
   - GEBRUIK crypto.randomUUID() OF een andere methode voor echte unieke IDs
   - Gebruik NOOIT dezelfde UUID twee keer, zelfs niet in verschillende patches
   - Format: "550e8400-e29b-41d4-a716-446655440000" (lowercase, met hyphens)
2. Voor arrays gebruik je ALTIJD operation="append" met een VOLLEDIG object als value
3. Voor simpele velden gebruik je operation="set" met een directe waarde
4. BEVESTIGING: Als u 1 of meer patches genereert, MOET uw "followUpQuestion" beginnen met een korte, duidelijke bevestiging van wat u heeft gedaan.
   - GOED: "Oké, ik heb 'Grote keuken' toegevoegd aan Ruimtes. Heeft u nog meer ruimtes?"
   - GOED: "Genoteerd (budget: 500.000). Wilt u ook de technische installaties bespreken?"
   - FOUT: "Heeft u nog meer ruimtes?" (mist de bevestiging)
5. Als je twijfelt: laat "patches" leeg en stel een vervolgvraag

✅ OUTPUTFORMAAT (ENKEL DIT JSON-OBJECT, GEEN EXTRA TEKST):
{
  "patches": [
    {
      "chapter": "basis" | "ruimtes" | "wensen" | "budget" | "techniek" | "duurzaam" | "risico",
      "delta": {
        "path": "veldNaam",
        "operation": "set" | "append" | "remove",
        "value": <waarde>
      }
    }
  ],
  "followUpQuestion": "Korte vervolgvraag in het Nederlands, u-vorm, of lege string"
}

RICHTLIJNEN VOOR MEERDERE PATCHES:
- Gebruik "patches" array: 0 tot N patches per utterance.
- Zet patches in logische volgorde: basis → ruimtes → wensen → budget → techniek.
- Valideer: elke patch moet onafhankelijk correct zijn.
- Stop na eerste invalide patch (server-zijde validatie zal reject).
`.trim();
}

// ============================================================================
// ProModel Class (v3.3)
// ============================================================================

export class ProModel {
  // 1) Intent-classificatie (ONGEWIJZIGD)
  static async classify(
    query: string,
    _context: Partial<WizardState>
  ): Promise<ClassifyResult> {
    const q = asLower(query);

    if (!q) {
      return {
        intent: "OUT_OF_SCOPE",
        confidence: 0.2,
        reason: "Lege invoer",
      };
    }

    if (q.startsWith("ga naar ") || q.startsWith("open ")) {
      return {
        intent: "NAVIGATIE",
        confidence: 0.98,
        reason: "Directe navigatie-opdracht",
      };
    }

    if (
      q.startsWith("hoe ") ||
      q.startsWith("wat ") ||
      q.startsWith("waarom ") ||
      q.includes("?")
    ) {
      return {
        intent: "ADVIES_VRAAG",
        confidence: 0.85,
        reason: "Vraagvorm duidt op informatie- of adviesvraag",
      };
    }

    if (
      /^(hallo|hoi|hey|goedemorgen|goedemiddag|goedenavond|bedankt|dank u|dankuwel)\b/.test(
        q
      )
    ) {
      return {
        intent: "SMALLTALK",
        confidence: 0.8,
        reason: "Korte sociale boodschap",
      };
    }

    return {
      intent: "VULLEN_DATA",
      confidence: 0.9,
      reason: "Interpretatie als invoer voor het vullen van de wizard",
    };
  }

  // 2) ✅ v3.3: Patches genereren (GEWIJZIGD: Array in plaats van single)
  static async generatePatch(
    query: string,
    wizardState: WizardState,
    history?: HistoryItem[]
  ): Promise<GeneratePatchResult> { // ✅ Gebruikt geïmporteerd type
    try {
      const systemPrompt = buildSystemPrompt(wizardState);

      const userPrompt = `
Gebruikersinvoer: "${query}"

TAKEN:
- Bepaal welke wizard-mutaties (0 tot N) veilig kunnen worden toegepast.
- Retourneer een array van PatchEvent-objecten in het JSON-formaat.
- Als u twijfelt: laat "patches" leeg en stel een korte vervolgvraag.
- Zet patches in logische volgorde: basis eerst, daarna afgeleiden (ruimtes, budget).
`.trim();

      // Build messages array dynamically
      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: systemPrompt },
      ];

      if (history && history.length > 0) {
        messages.push(...history);
      }

      messages.push({ role: "user", content: userPrompt });

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // ✅ Use mini voor snelheid
          messages: messages,
          temperature: 0.0,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `[ProModel] LLM HTTP ${response.status}: ${errorText}`
        );
      }

      const data = await response.json();
      const raw = data.choices?.[0]?.message?.content?.trim();
      if (!raw) {
        throw new Error("[ProModel] Lege LLM-respons");
      }

      const parsed = safeParsePatchesResult(raw); // ✅ CHANGED: nu patches array

      // Valideer alle patches
      if (parsed.patches && Array.isArray(parsed.patches)) {
        parsed.patches = parsed.patches.filter((p) => {
          const valid = isValidPatchEvent(p);
          if (!valid) {
            console.warn(
              "[ProModel] Ongeldige patch uit LLM, genegeerd:",
              p
            );
          }
          return valid;
        });
      }

      if (!parsed.followUpQuestion) {
        parsed.followUpQuestion =
          parsed.patches?.length === 0
            ? "Kunt u iets concreter aangeven wat u in uw project wilt wijzigen?"
            : "";
      }

      return parsed;
    } catch (err) {
      console.error("[ProModel] generatePatch error:", err);
      return {
        patches: [], // ✅ Leeg array in plaats van null
        followUpQuestion:
          "Dat heb ik niet helemaal goed kunnen plaatsen. Kunt u in één zin aangeven welke wijziging u precies bedoelt?",
      };
    }
  }

  // 3) Antwoord genereren (ONGEWIJZIGD: overloads werken al)
  static async generateResponse(
    query: string,
    options: GenerateOptions
  ): Promise<string>;
  static async generateResponse(
    query: string,
    ragContext: RAGContext | null,
    options: GenerateOptions
  ): Promise<string>;
  static async generateResponse(
    query: string,
    arg2: GenerateOptions | RAGContext | null,
    arg3?: GenerateOptions
  ): Promise<string> {
    // Normaliseer naar (opts: GenerateOptions)
    let opts: GenerateOptions;
    if (arg3) {
      // Aangeroepen als (query, ragContext, options)
      const rag = (arg2 as RAGContext) ?? null;
      opts = { ...arg3, ragContext: rag };
    } else {
      // Aangeroepen als (query, options)
      opts = arg2 as GenerateOptions;
    }

    const q = asLower(query);
    const mode = opts.mode;
    const ragCtx = opts.ragContext ?? null;
    const history = opts.history ?? [];

    // Groet
    if (/^(hallo|hoi|hey|goedemorgen|goedemiddag|goedenavond)\b/.test(q)) {
      return "Hallo, ik ben Jules van Brikx. Waar wilt u mee beginnen: de basis, uw ruimtes, het budget of de technische keuzes?";
    }

    // Budget in PREVIEW
    if (/(kosten|prijs|budget|euro|€)/.test(q) && mode === "PREVIEW") {
      return "Ik kan u in deze Preview-fase globaal helpen uw budget te kaderen. Als u een bandbreedte deelt (bijvoorbeeld tussen 250.000 en 300.000 euro), kan ik meedenken welke keuzes daarbij passen.";
    }

    // Algemene budgetvraag
    if (/(budget|financieel)/.test(q)) {
      return "Een realistisch budget is cruciaal. Kunt u aangeven welke bandbreedte u ongeveer in gedachten heeft? Dan help ik u uw wensen en risico's daarmee in lijn te brengen.";
    }

    // RAG-context gebruiken indien aanwezig
    if (ragCtx && ragCtx.docs && ragCtx.docs.length > 0) {
      return summarizeRAG(ragCtx, query, mode);
    }

    // Fallback: gebruik LLM met history
    try {
      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        {
          role: "system",
          content: "U bent Jules, digitale bouwcoach van Brikx. Antwoord kort, beleefd, in het Nederlands.",
        },
      ];

      if (history && history.length > 0) {
        messages.push(...history);
      }

      messages.push({ role: "user", content: query });

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: messages,
          temperature: 0.5,
          max_tokens: 200,
        }),
      });

      if (!response.ok) {
        throw new Error(`LLM error: ${response.status}`);
      }

      const data = await response.json();
      return (
        data.choices?.[0]?.message?.content ||
        "Ik weet niet zeker hoe ik daarop moet reageren."
      );
    } catch (error) {
      console.error("[ProModel.generateResponse] LLM error:", error);
      return "Ik weet niet zeker hoe ik daarop moet reageren.";
    }
  }

  // 4) PvE-samenvatting (ONGEWIJZIGD)
  static async synthesizePvE(
    wizardState: WizardState,
    { mode }: { mode: "PREVIEW" | "PREMIUM" }
  ): Promise<string> {
    const { projectName, projectType } = deriveContext(wizardState);

    const prompt = `
Maak een korte, professionele Programma-van-Eisen samenvatting (5-7 zinnen) voor een particulier bouw- of verbouwproject.

Gebruik deze gegevens als uitgangspunt:
- Projectnaam: ${projectName}
- Projecttype: ${projectType}

Schrijf in helder Nederlands, in de u-vorm. Wees concreet en vermijd loze marketingtaal. Als gegevens ontbreken, formuleer neutraal en zonder dingen te verzinnen.
`.trim();

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: mode === "PREMIUM" ? "gpt-4" : "gpt-4-mini",
          messages: [
            {
              role: "system",
              content:
                "U bent een bouwkundig adviseur. U schrijft kort, concreet, consistent en altijd in de u-vorm.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.4,
          max_tokens: 320,
        }),
      });

      if (!response.ok) {
        throw new Error(`[ProModel] LLM HTTP ${response.status}`);
      }

      const data = await response.json();
      const content: string =
        data.choices?.[0]?.message?.content ||
        "Het Programma van Eisen wordt op basis van uw ingevulde gegevens samengesteld.";
      return content.trim();
    } catch (err) {
      console.error("[ProModel] synthesizePvE error:", err);
      return "Het Programma van Eisen wordt op basis van uw ingevulde gegevens samengesteld.";
    }
  }

  // 5) Topic-detectie voor RAG (ONGEWIJZIGD)
  static detectTopic(query: string): {
    topicId: string;
    enableRAG: boolean;
  } {
    const q = asLower(query);

    const topicMap: Record<string, { topicId: string; enableRAG: boolean }> = {
      daglicht: { topicId: "natural_light", enableRAG: true },
      licht: { topicId: "natural_light", enableRAG: true },
      raam: { topicId: "natural_light", enableRAG: true },
      geluid: { topicId: "soundproofing", enableRAG: true },
      akoestiek: { topicId: "soundproofing", enableRAG: true },
      warmte: { topicId: "thermal_comfort", enableRAG: true },
      energie: { topicId: "thermal_comfort", enableRAG: true },
      kosten: { topicId: "budget_estimation", enableRAG: true },
      prijs: { topicId: "budget_estimation", enableRAG: true },
      budget: { topicId: "budget_estimation", enableRAG: true },
      vergunning: { topicId: "permits_regulation", enableRAG: true },
      gemeente: { topicId: "permits_regulation", enableRAG: true },
      hout: { topicId: "materials", enableRAG: true },
      steen: { topicId: "materials", enableRAG: true },
      beton: { topicId: "materials", enableRAG: true },
      pve: { topicId: "pve_meta", enableRAG: false },
    };

    for (const [key, info] of Object.entries(topicMap)) {
      if (q.includes(key)) return info;
    }

    return { topicId: "general", enableRAG: false };
  }
}

// ============================================================================
// Interne helpers (ONGEWIJZIGD, behalve safeParse)
// ============================================================================

// ✅ CHANGED: Parse patches array in plaats van single patch
function safeParsePatchesResult(raw: string): GeneratePatchResult {
  try {
    const cleaned = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned) as Partial<GeneratePatchResult>;

    return {
      patches: Array.isArray(parsed.patches) ? parsed.patches : [],
      followUpQuestion: parsed.followUpQuestion ?? "",
    };
  } catch (e) {
    console.warn("[ProModel] Kon LLM-output niet parsen als JSON:", e);
    return {
      patches: [], // Empty array, niet null
      followUpQuestion:
        "Kunt u iets specifieker aangeven welke gegevens u wilt laten aanpassen in uw project?",
    };
  }
}

function isValidPatchEvent(patch: PatchEvent): boolean {
  if (!patch || typeof patch !== "object") return false;
  if (!VALID_CHAPTERS.includes(patch.chapter)) return false;
  if (!patch.delta) return false;

  const { path, operation } = patch.delta;

  if (!VALID_OPS.includes(operation)) return false;
  if (!path || typeof path !== "string") return false;

  return true;
}

function summarizeRAG(
  ctx: RAGContext,
  _query: string,
  mode: "PREVIEW" | "PREMIUM"
): string {
  if (!ctx.docs || ctx.docs.length === 0) {
    return "Ik heb geen directe kennisbankinformatie gevonden die hier goed op aansluit. Kunt u uw vraag iets specifieker formuleren, zodat ik u gerichter kan helpen?";
  }

  const maxDocs = mode === "PREMIUM" ? 4 : 2;
  const picked = ctx.docs.slice(0, maxDocs);

  const bullets = picked
    .map((d) => `- ${d.text}`)
    .join("\n");

  return `
Op basis van de Brikx-kennisbank zie ik de volgende punten die relevant kunnen zijn voor uw situatie:

${bullets}

Als u wilt, kan ik deze aandachtspunten direct vertalen naar concrete keuzes in uw Programma van Eisen, bijvoorbeeld in de hoofdstukken techniek, duurzaamheid of risico.
  `.trim();
}