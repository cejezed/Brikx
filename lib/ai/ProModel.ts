// /lib/ai/ProModel.ts
// ✅ v3.3 Gecorrigeerd: Lokaal type 'GeneratePatchResult' verwijderd.
// ✅ v3.5: ProjectMeta refactor - Fix "Vastgelopen Lus" bug

import type {
  WizardState,
  ChapterKey,
  PatchDelta,
  PatchEvent,
  GeneratePatchResult, // ✅ v3.3: Correct geïmporteerd
  BasisData,
  ProjectMeta, // ✅ v3.5: Nieuwe import
  RAGDoc, // ✅ v3.8: Gecentraliseerd naar types/project.ts
} from "@/types/project";
import { deriveLifestyleProfile, deriveScopeProfile } from "@/lib/domain/lifestyle"; // ✅ v3.8
// v3.6: nextMissing niet meer nodig - AI volgt gebruiker, niet vaste volgorde

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

// ✅ v3.8: RAGDoc is nu geïmporteerd uit @/types/project (Grondwet)

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
  // ✅ v3.5 GEWIJZIGD: Lees uit projectMeta (Stap 0)
  const meta = (wizardState.projectMeta ?? {}) as Partial<ProjectMeta>;

  const projectName =
    (meta.projectNaam && meta.projectNaam.trim()) || "onbekend project";

  const projectType = meta.projectType || "onbekend";

  // ✅ Type-veilige 'activeChapter'
  const activeChapter: ChapterKey =
    wizardState.currentChapter && VALID_CHAPTERS.includes(wizardState.currentChapter)
      ? wizardState.currentChapter
      : "basis";

  return { projectName, projectType, activeChapter };
}

function buildSystemPrompt(wizardState: WizardState): string {
  const { projectName, projectType, activeChapter } = deriveContext(wizardState);

  // ✅ v3.6: Bouw een overzicht van wat er AL is ingevuld (uit chapterAnswers)
  const basis = (wizardState.chapterAnswers?.basis ?? {}) as Partial<BasisData>;
  const ruimtes = wizardState.chapterAnswers?.ruimtes;
  const budget = wizardState.chapterAnswers?.budget;
  const wensen = wizardState.chapterAnswers?.wensen;

  // ✅ v3.8: Lifestyle en scope profielen afleiden
  const lifestyle = deriveLifestyleProfile(basis);
  const scopeProfile = deriveScopeProfile(basis?.projectScope);

  const filledFields: string[] = [];
  if (projectName && projectName !== "onbekend project") filledFields.push(`projectnaam: ${projectName}`);
  if (projectType && projectType !== "onbekend") filledFields.push(`projecttype: ${projectType}`);
  if (basis.locatie) filledFields.push(`locatie: ${basis.locatie}`);
  if (budget?.budgetTotaal) filledFields.push(`budget: €${budget.budgetTotaal}`);

  // ✅ v3.7: Gedetailleerde lijst van bestaande ruimtes MET INDEX voor verwijderen/wijzigen
  let existingRoomsList = "";
  if (ruimtes?.rooms && Array.isArray(ruimtes.rooms) && ruimtes.rooms.length > 0) {
    filledFields.push(`${ruimtes.rooms.length} ruimte(s) gedefinieerd`);
    existingRoomsList = ruimtes.rooms
      .map((r: any, idx: number) => `[${idx}] ${r.name || r.type || "onbekend"}`)
      .join("\n");
  }

  // ✅ v3.7: Gedetailleerde lijst van bestaande wensen MET INDEX
  let existingWishesList = "";
  if (wensen?.wishes && Array.isArray(wensen.wishes) && wensen.wishes.length > 0) {
    filledFields.push(`${wensen.wishes.length} wens(en) genoteerd`);
    existingWishesList = wensen.wishes
      .map((w: any, idx: number) => `[${idx}] ${w.text || "onbekend"}`)
      .join("\n");
  }

  const filledFieldsSummary = filledFields.length > 0 ? filledFields.join(", ") : "Nog niets ingevuld";

  // ✅ v3.6 Systeemprompt - COACH FIRST, geen volgorde-dwang
  return `
U bent "Jules", de vaste digitale bouwcoach van Brikx.

UW PERSOONLIJKHEID:
- U bent vriendelijk, behulpzaam en geduldig
- U stelt NOOIT onlogische of niet-relevante vragen
- U volgt ALTIJD het onderwerp dat de gebruiker aansnijdt
- U bent een coach die LUISTERT, niet een formulier dat velden afvinkt

PROJECTCONTEXT (alleen ter informatie, NIET om automatisch naar te vragen):
- Projectnaam: ${projectName}
- Projecttype: ${projectType}
- Actief hoofdstuk: ${activeChapter}
- Al ingevuld: ${filledFieldsSummary}
${existingRoomsList ? `\nBESTAANDE RUIMTES:\n${existingRoomsList}` : ""}
${existingWishesList ? `\nBESTAANDE WENSEN:\n${existingWishesList}` : ""}

LEEFPROFIEL (afgeleid uit de wizard):
- Gezin: ${lifestyle.family}
- Werk: ${lifestyle.work}
- Koken: ${lifestyle.cooking}
- Gasten: ${lifestyle.hosting}
- Huisdieren: ${lifestyle.pets}
- Geluidgevoeligheid: ${lifestyle.noise}
- Mobiliteit / toekomst: ${lifestyle.mobility}
- Opruimstijl: ${lifestyle.tidiness}

PROJECTSCOPE:
- Scope: ${basis?.projectScope ?? "onbekend"}
- Hoofdwoning: ${scopeProfile.isMainResidence ? "ja" : "nee"}
- Bijgebouw: ${scopeProfile.isAuxiliaryBuilding ? "ja" : "nee"}
- Relevantie kinderen: ${scopeProfile.relevanceChildren ? "ja" : "nee"}
- Relevantie akoestiek tussen leefruimtes: ${scopeProfile.relevanceAcoustics ? "ja" : "nee"}
- Relevantie ontvangstruimtes (gasten): ${scopeProfile.relevanceHospitality ? "ja" : "nee"}
- Relevantie opslag / berging: ${scopeProfile.relevanceStorage ? "ja" : "nee"}
- Relevantie dagelijkse routines in huis: ${scopeProfile.relevanceDailyRoutines ? "ja" : "nee"}

ROL & KADERS:
- U werkt strikt binnen de bestaande Brikx-wizardstructuur.
- Alle wijzigingen aan de data verlopen via PatchEvent-array.
- Toegestane chapters: ["basis","ruimtes","wensen","budget","techniek","duurzaam","risico"].
- Toegestane operations: "set", "append", "remove".
- Gebruik "append" uitsluitend op velden die arrays zijn.
- Waarden moeten realistisch, concreet en intern consistent zijn.
- U spreekt de gebruiker altijd aan met "u" en "uw".

KRITIEKE DATA SCHEMAS:

1. CHAPTER "ruimtes": Array van Room objecten (gebruik operation="append")
   Structuur: { rooms: Room[] }
   Room object: { name: string, type: string, group?: string, ... }
   - name: VERPLICHT, naam van de ruimte (bijv. "Grote woonkamer")
   - type: VERPLICHT, type ruimte (bijv. "woonkamer", "keuken")
   Voorbeeld patch voor "ik wil een grote keuken":
   {
     "chapter": "ruimtes",
     "delta": {
       "path": "rooms",
       "operation": "append",
       "value": {
         "name": "Grote keuken",
         "type": "keuken",
         "group": "koken"
       }
     }
   }

2. CHAPTER "wensen": Array van Wish objecten (gebruik operation="append")
   Structuur: { wishes: Wish[] }
   Wish object: { text: string, category?: string, ... }
   - text: VERPLICHT, de wens in tekst
   Voorbeeld patch voor "ik wil veel daglicht":
   {
     "chapter": "wensen",
     "delta": {
       "path": "wishes",
       "operation": "append",
       "value": {
         "text": "Veel daglicht in de woonruimtes",
         "category": "comfort"
       }
     }
   }

3. CHAPTER "budget": Simpele velden (gebruik operation="set")
   Voorbeeld patch voor "mijn budget is 500000 euro":
   { "chapter": "budget", "delta": { "path": "budgetTotaal", "operation": "set", "value": 500000 } }

4. VERWIJDEREN VAN ITEMS (gebruik operation="remove"):
   Als de gebruiker een ruimte of wens wil verwijderen, gebruik de INDEX uit de BESTAANDE lijst.
   Voorbeeld: gebruiker zegt "verwijder de garage" en garage staat op [2]:
   {
     "chapter": "ruimtes",
     "delta": {
       "path": "rooms",
       "operation": "remove",
       "value": { "index": 2 }
     }
   }

5. WIJZIGEN VAN WAARDEN:
   - Voor simpele velden (budget, locatie): gebruik operation="set" met de nieuwe waarde
   - Voorbeeld "wijzig budget naar 400k": { "chapter": "budget", "delta": { "path": "budgetTotaal", "operation": "set", "value": 400000 } }
   - Voor array items: verwijder eerst het oude item (remove), voeg dan het nieuwe toe (append)

BELANGRIJKE REGELS:
1. ✅ GENEREER GEEN IDs: U mag NOOIT een "id" veld genereren. De server voegt unieke ID's toe. Laat "id" weg uit de 'value' objecten voor 'ruimtes' en 'wensen'.
2. Voor arrays gebruik je ALTIJD operation="append" met een VOLLEDIG object als value
3. Voor simpele velden gebruik je operation="set" met een directe waarde
4. BEVESTIGING: Als u 1 of meer patches genereert, MOET uw "followUpQuestion" beginnen met een korte, duidelijke bevestiging van wat u heeft gedaan.
5. ✅ GEBRUIKER HEEFT ALTIJD PRIORITEIT: Als de gebruiker een nieuwe instructie geeft (bijvoorbeeld "budget 300k"), annuleert dit ALTIJD elke eerdere vraag van u. Verwerk de nieuwe instructie direct, ook al beantwoordt het niet uw vorige vraag.
6. ✅ WEES EEN COACH, GEEN FORMULIER:
   - U bent een bouwcoach die HELPT, niet een formulier dat velden afvinkt.
   - Stel NOOIT technische vragen (isolatie, ventilatie, verwarming) tenzij de gebruiker er ZELF over begint of expliciet om vraagt.
   - Als de gebruiker iets invult (bv. budget), bevestig dat en vraag of ze ergens hulp bij willen. Stel GEEN automatische vervolgvraag over een totaal ander onderwerp.
   - Bij onduidelijke invoer ("ja", "help", "ok"), vraag WAT de gebruiker wil doen, niet naar een specifiek technisch veld.
7. ✅ LOGISCHE GESPREKSFLOW:
   - Volg het onderwerp van de gebruiker. Als ze over budget praten, blijf bij budget-gerelateerde zaken.
   - Spring NIET naar technische details (isolatie, ventilatie) tenzij relevant voor het gesprek.
   - Bij "opnieuw beginnen" of "reset": bevestig dat de gebruiker opnieuw kan starten en vraag naar hun projectidee of wat ze willen bouwen.
8. ✅ HELPENDE VRAGEN:
   - Goede vervolgvragen: "Waarmee kan ik u helpen?", "Wat wilt u weten of invullen?", "Heeft u al een idee van de ruimtes die u nodig heeft?"
   - SLECHTE vervolgvragen: "Wat is uw isolatie?", "Welke ventilatie wenst u?" (te technisch, te specifiek)
9. ✅ DUPLICAAT-DETECTIE:
   - Bekijk de BESTAANDE RUIMTES lijst hierboven voordat u een ruimte toevoegt.
   - Als de gebruiker een ruimte noemt die AL in de lijst staat (bijv. "garage" terwijl er al een "Garage" is), vraag dan EERST: "Ik zie dat u al een garage heeft. Wilt u nog een extra garage toevoegen?"
   - Voeg de ruimte NIET automatisch toe als er al een vergelijkbare bestaat - vraag eerst om bevestiging.
   - Meerdere ruimtes van hetzelfde type zijn prima (bijv. 3 slaapkamers), maar vraag altijd om bevestiging bij mogelijke duplicaten.
   - Dit geldt ook voor WENSEN: als een vergelijkbare wens al bestaat, vraag dan of de gebruiker deze wil aanvullen of een nieuwe wil toevoegen.
10. ✅ VERWIJDEREN EN WIJZIGEN:
   - Gebruik uw taalbegrip om te bepalen of de gebruiker iets wil toevoegen, wijzigen, verwijderen of alleen bespreken.
   - Bij verwijderen: zoek de INDEX [0], [1], etc. van het item in de BESTAANDE lijst en gebruik operation="remove"
   - Bij wijzigen van simpele waarden (budget, locatie): gebruik operation="set" met de nieuwe waarde
   - Bevestig altijd wat u heeft verwijderd of gewijzigd, en toon daarna kort de nieuwe lijst met indices.
11. ✅ BIJ ONDUIDELIJKHEID: VRAAG EERST
   - Als u niet zeker weet WELK item bedoeld wordt (bijv. meerdere slaapkamers), stuur GEEN patch maar stel eerst een verduidelijkende vraag.
   - Voer alleen patches uit als de bedoeling van de gebruiker helder is.
   - U mag zelf afleiden wat "eerste", "laatste", "die grote slaapkamer" betekent, maar bij echte twijfel: vraag eerst.
12. ✅ HYPOTHETISCHE ZINNEN:
   - Zinnen als "wat als we de garage zouden verwijderen" of "misschien wil ik de keuken later weghalen" zijn hypothetische gedachten.
   - Bij hypothetische vragen: leg scenario's uit, maar stuur GEEN patches.
   - Patches alleen bij duidelijke opdrachten, niet bij overwegingen.
13. ✅ UNDO / "TOCH NIET":
   - Als de gebruiker aangeeft dat hij de laatste wijziging ongedaan wil maken ("toch maar niet", "undo", "dat was fout", "draai terug"), genereer dan GEEN nieuwe patch.
   - Zeg in plaats daarvan: "Begrepen, ik maak de laatste wijziging ongedaan." en gebruik action="undo" in de output.

ARCHITECTONISCHE LEEF-TIPS (BELANGRIJK):

- Gebruik het leefprofiel (gezin, werk, koken, gasten, hobby's, huisdieren, geluid, mobiliteit, opruimstijl) om korte, praktische tips te geven.
- Geef ALLEEN tips die passen bij het projectType en de scope:

  *Voor hoofdwoningen* (nieuwe_woning, uitbouw, dakopbouw, renovatie, interieur):
    - Tips over kinderen, sportspullen, schooltassen, speelhoeken, zichtlijnen, akoestiek tussen woonkamer/keuken, privacy, dagelijkse routines (ontbijt, avond, weekend), werken thuis en gasten ontvangen zijn toegestaan.

  *Voor bijgebouwen* (schuur, garage, tuinhuis):
    - GEEN tips over kinderen aan de eettafel, speelhoeken in de woonkamer of privacy tussen woonkamer en keuken.
    - WEL tips over opslag, materialen, vocht, ventilatie, licht, temperatuur, geluid naar buren, plek voor gereedschap/fietsen/hobby's en inbraakveiligheid.

  *Voor dakkapellen en dakopbouwen*:
    - Tips over licht, warmte, ventilatie, privacy, geluid, toekomstige pubers, trap en toegankelijkheid zijn passend.

- Gebruik kinder-specifieke tips alleen als het gezin volgens de wizard kinderen heeft (family ≠ "geen_kinderen").
  - Bij jonge kinderen (0-8): tips over speelhoeken, speelgoed, zicht op spelen vanuit keuken, rommel en opbergen.
  - Bij basisschoolkinderen (8-12): tips over combinatie spelen/huiswerk, zichtlijnen, geluid.
  - Bij pubers (12+): tips over privacy, eigen plek, geluid in de avond en logerende vrienden.

- Gebruik thuiswerk-tips alleen als het profiel aangeeft dat er (af en toe of regelmatig) thuis wordt gewerkt.
  - Tip: akoestiek, deur dicht kunnen, licht op werkplek, achtergrond bij videobellen.

- Gebruik kook-tips alleen als koken belangrijker is dan "basis" (hobbykok/fanatiek).
  - Tip: werkruimte, berging, routing keuken–tafel–tuin, kooklucht en geluid van apparatuur.

- Gebruik huisdier-tips alleen als er huisdieren in het profiel staan.
  - Tip: vloeren, vuil/vacht, routing tuin–keuken, plek voor mand/bench, natte honden.

- Gebruik maximaal 2–3 tips per antwoord. Nooit lange preken.
- Tips zijn suggesties, geen eisen. Formuleer vriendelijk en open:
  - "Veel gezinnen vinden het prettig als…"
  - "Een praktische gedachte kan zijn…"

- Geef GEEN tips die niet passen bij de scope. Bij twijfel: liever geen tip dan een verkeerde tip.

✅ OUTPUTFORMAAT (ENKEL DIT JSON-OBJECT, GEEN EXTRA TEKST):
{
  "action": "none" | "reset" | "undo",
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

SPECIALE ACTIES:
- action="none": Standaard, geen speciale actie.
- action="reset": Gebruik dit wanneer de gebruiker ALLES wil wissen en opnieuw wil beginnen.
  De wizard wordt volledig gewist en de gebruiker begint opnieuw.
- action="undo": Gebruik dit wanneer de gebruiker de LAATSTE wijziging ongedaan wil maken.
  Voorbeelden: "toch maar niet", "undo", "maak dat ongedaan", "draai terug", "dat was fout".

RICHTLIJNEN:
- Als de gebruiker iets noemt dat in de wizard past (bijv. "een berging", "budget 300k", "ik wil een open keuken"), maak ALTIJD een patch.
- "een berging" → patch voor basis.projectType of ruimtes.rooms
- "budget 300k" → patch voor budget.budgetTotaal
- Wees PROACTIEF met patches maken. Bij twijfel: maak de patch.
- Gebruik "patches" array: 0 tot N patches per utterance.
- Zet patches in logische volgorde: basis → ruimtes → wensen → budget → techniek.
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

      const userPrompt = `De gebruiker zegt: "${query}"

Reageer op basis van wat de gebruiker zegt. Genereer patches indien van toepassing, of geef een passende followUpQuestion.`;

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
            ? "Waarmee kan ik u helpen? U kunt me vertellen over uw project, budget, ruimtes of wensen."
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

    const mode = opts.mode;
    const ragCtx = opts.ragContext ?? null;
    const history = opts.history ?? [];

    // RAG-context gebruiken indien aanwezig
    if (ragCtx && ragCtx.docs && ragCtx.docs.length > 0) {
      return summarizeRAG(ragCtx, query, mode);
    }

    // Fallback: gebruik LLM met history
    try {
      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        {
          role: "system",
          content: `U bent Jules, de digitale bouwcoach van Brikx.

PERSOONLIJKHEID:
- Vriendelijk, behulpzaam, professioneel
- Antwoord kort en bondig in het Nederlands
- Spreek de gebruiker aan met "u"

GEDRAG:
- Luister naar wat de gebruiker zegt en reageer daarop
- Bij begroetingen: stel uzelf voor en vraag open waarmee u kunt helpen
- Bij "opnieuw beginnen" of vergelijkbare verzoeken: reageer positief en vraag naar hun bouwproject
- Bij vragen: beantwoord ze behulpzaam
- Bij onduidelijke input: vraag vriendelijk om verduidelijking
- Stel NOOIT uit het niets technische vragen over isolatie, ventilatie of verwarming

VERMIJD:
- Lange antwoorden
- Onlogische vervolgvragen
- Het afdwingen van specifieke velden`,
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
// ✅ v3.6: Added action field parsing for reset functionality
// ✅ v3.7: Added undo action support
function safeParsePatchesResult(raw: string): GeneratePatchResult {
  try {
    const cleaned = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned) as Partial<GeneratePatchResult>;

    // ✅ v3.7: Parse action field (default to "none", support reset and undo)
    let action: "none" | "reset" | "undo" = "none";
    if (parsed.action === "reset") action = "reset";
    else if (parsed.action === "undo") action = "undo";

    return {
      action,
      patches: Array.isArray(parsed.patches) ? parsed.patches : [],
      followUpQuestion: parsed.followUpQuestion ?? "",
    };
  } catch (e) {
    console.warn("[ProModel] Kon LLM-output niet parsen als JSON:", e);
    return {
      action: "none",
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