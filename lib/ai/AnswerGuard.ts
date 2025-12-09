// /lib/ai/AnswerGuard.ts
// ✅ v4.0: GENERIEKE ANSWER GUARD LAAG
// Valideert AI-antwoorden op relevantie, duidelijkheid en het voorkomen van hallucinaties

import type { ProIntent } from "./ProModel";

/**
 * Input voor de AnswerGuard validator
 */
export interface AnswerGuardInput {
  /** De oorspronkelijke vraag van de gebruiker */
  userQuery: string;

  /** Het gedetecteerde intent (ADVIES_VRAAG, VULLEN_DATA, etc.) */
  intent: ProIntent;

  /** Het huidige actieve hoofdstuk (optioneel) */
  activeChapter?: string | null;

  /** Het concept-antwoord dat naar de gebruiker zou gaan */
  draftAnswer: string;

  /** RAG metadata (optioneel) - gebruiken we om te checken of er kennisbank-hits waren */
  ragMeta?: {
    topicId: string;
    docsFound: number;
    cacheHit: boolean;
  };
}

/**
 * Verdict types van de AnswerGuard
 */
export type AnswerGuardVerdict =
  | "OK"                    // Antwoord is relevant en goed
  | "NEEDS_CLARIFICATION"   // Vraag is te vaag/algemeen
  | "IRRELEVANT";           // Antwoord is niet relevant voor de vraag

/**
 * Resultaat van de AnswerGuard validatie
 */
export interface AnswerGuardResult {
  /** Het verdict van de validator */
  verdict: AnswerGuardVerdict;

  /** Redenen waarom dit verdict is gegeven */
  reasons: string[];

  /** Suggesties voor een verbeterde tweede poging */
  suggestions: string[];

  /** Optioneel: confidence score (0-1) */
  confidence?: number;
}

/**
 * LLM-gebaseerde validator die controleert of een antwoord:
 * 1. Relevant is voor de vraag
 * 2. Niet doet alsof het dingen zeker weet die eigenlijk onduidelijk zijn
 * 3. Geen hallucinaties bevat (verzonnen feiten, cijfers, regels)
 *
 * @param input - De input voor de validator (vraag, intent, antwoord)
 * @param callLLM - Functie die een LLM-call uitvoert
 * @returns Promise met het validatie-resultaat
 */
export async function runAnswerGuard(
  input: AnswerGuardInput,
  callLLM: (opts: { system: string; user: string }) => Promise<string>
): Promise<AnswerGuardResult> {
  const { userQuery, intent, activeChapter, draftAnswer, ragMeta } = input;

  // Build system prompt voor de validator
  const systemPrompt = buildValidatorSystemPrompt();

  // Build user prompt met context
  const userPrompt = buildValidatorUserPrompt({
    userQuery,
    intent,
    activeChapter,
    draftAnswer,
    ragMeta,
  });

  try {
    // Roep LLM aan voor validatie
    const rawResponse = await callLLM({
      system: systemPrompt,
      user: userPrompt,
    });

    // Parse JSON response
    const result = parseValidatorResponse(rawResponse);

    // Log het verdict (niet de volledige inhoud vanwege privacy)
    if (result.verdict !== "OK") {
      console.warn(`[AnswerGuard] Verdict: ${result.verdict}`, {
        intent,
        activeChapter,
        reasonsCount: result.reasons.length,
      });
    } else {
      console.log(`[AnswerGuard] Verdict: OK (intent: ${intent})`);
    }

    return result;
  } catch (error) {
    console.error("[AnswerGuard] Validation error:", error);

    // Bij fout: assume OK (fail-open in plaats van fail-closed)
    return {
      verdict: "OK",
      reasons: [],
      suggestions: [],
      confidence: 0.5,
    };
  }
}

/**
 * Bouwt de system prompt voor de validator
 */
function buildValidatorSystemPrompt(): string {
  return `
U bent een kwaliteitscontroleur voor AI-antwoorden in de Brikx bouwwizard.

CONTEXT OVER BRIKX:
- Brikx is een AI-gestuurde wizard voor het maken van een Programma van Eisen (PvE) voor bouwprojecten
- Gebruikers zijn particulieren die hun huis willen (ver)bouwen
- De wizard helpt ze stap voor stap om hun wensen, budget, ruimtes en technische eisen te formuleren
- Er is een AI-coach "Jules" die vragen beantwoordt en data helpt invullen

UW TAAK:
U controleert of een AI-antwoord voldoet aan kwaliteitseisen:

1. RELEVANTIE CHECK:
   - Beantwoordt het antwoord de gestelde vraag?
   - Of praat het antwoord langs de vraag heen?
   - Kiest het antwoord willekeurig één interpretatie terwijl de vraag meerdere interpretaties heeft?

2. VRAAG DUIDELIJKHEID CHECK:
   - Is de vraag voldoende specifiek om een zinvol antwoord te geven?
   - Of is de vraag te vaag/algemeen en moet er eerst doorgevraagd worden?
   - Voorbeelden van te vage vragen:
     * "Hoeveel kost verbouwen?" (welk soort verbouwing? hoeveel m2? welke locatie?)
     * "Wat moet ik doen?" (te algemeen)
     * "Is dit goed?" (zonder context)

3. HALLUCINATIE CHECK - VERBIED:
   - Het verzinnen van specifieke cijfers/bedragen zonder bron
   - Het verzinnen van concrete juridische regels zonder bron
   - Het verzinnen van exacte normen/afmetingen zonder bron
   - Het doen alsof iets "zeker" is terwijl het onzeker is

   TOEGESTAAN:
   - Grove bandbreedtes/ranges als duidelijk als voorbeeld gepresenteerd
   - Algemene richtlijnen die expliciet als "vuistregel" worden benoemd
   - Informatie die expliciet uit een kennisbank komt (zie RAG metadata)

4. GEDRAG BIJ AMBIGUÏTEIT:
   - Als de vraag meerdere interpretaties heeft en het antwoord kiest er maar één zonder dit te benoemen → "NEEDS_CLARIFICATION"
   - Bij twijfel: liever "NEEDS_CLARIFICATION" dan een gok

5. STRENGHEID PER DOMEIN:
   - EXTRA STRENG bij: budget/kosten, regelgeving, constructie/veiligheid
   - Normale strengheid bij: algemene adviesvragen, navigatie, smalltalk

OUTPUT FORMAAT:
U geeft ALTIJD een JSON-object terug met deze structuur:
{
  "verdict": "OK" | "NEEDS_CLARIFICATION" | "IRRELEVANT",
  "reasons": ["reden 1", "reden 2", ...],
  "suggestions": ["suggestie 1", "suggestie 2", ...],
  "confidence": 0.0 - 1.0
}

RICHTLIJNEN VOOR VERDICTS:

"OK" - Gebruik dit wanneer:
- Het antwoord de vraag duidelijk beantwoordt
- De vraag voldoende specifiek was
- Het antwoord geen hallucinaties bevat
- Het antwoord eerlijk is over onzekerheden

"NEEDS_CLARIFICATION" - Gebruik dit wanneer:
- De vraag te vaag/algemeen is om zinvol te beantwoorden
- De vraag meerdere interpretaties heeft en het antwoord maar één route kiest
- Het antwoord zich voordoet alsof het specifieke dingen weet die eigenlijk onduidelijk zijn
- Er kritieke informatie ontbreekt (bij kosten/budget-vragen: m2, type project, locatie, etc.)

"IRRELEVANT" - Gebruik dit wanneer:
- Het antwoord duidelijk een andere kant opgaat dan de vraag
- Het antwoord de kernvraag niet adresseert
- Het antwoord over iets anders praat dan waar de gebruiker naar vroeg

SUGGESTIES:
- Bij "NEEDS_CLARIFICATION": geef 2-3 concrete vragen die gesteld moeten worden
- Bij "IRRELEVANT": geef hints over wat het antwoord WEL had moeten adresseren
- Wees specifiek en actionable

CONFIDENCE:
- 1.0 = zeer zeker van het verdict
- 0.7-0.9 = redelijk zeker
- 0.5-0.7 = enige twijfel
- < 0.5 = veel onzekerheid
`.trim();
}

/**
 * Bouwt de user prompt voor de validator
 */
function buildValidatorUserPrompt(ctx: {
  userQuery: string;
  intent: ProIntent;
  activeChapter?: string | null;
  draftAnswer: string;
  ragMeta?: {
    topicId: string;
    docsFound: number;
    cacheHit: boolean;
  };
}): string {
  const { userQuery, intent, activeChapter, draftAnswer, ragMeta } = ctx;

  const ragInfo = ragMeta
    ? `
RAG METADATA (kennisbank):
- Topic: ${ragMeta.topicId}
- Documenten gevonden: ${ragMeta.docsFound}
- Cache hit: ${ragMeta.cacheHit ? "ja" : "nee"}
${ragMeta.docsFound > 0 ? "→ Dit antwoord is gebaseerd op kennisbank-informatie" : "→ Geen kennisbank-informatie beschikbaar"}
`
    : "\nGeen RAG metadata beschikbaar (geen kennisbank gebruikt)";

  return `
GEBRUIKERSVRAAG:
"${userQuery}"

GEDETECTEERD INTENT:
${intent}

ACTIEF HOOFDSTUK:
${activeChapter || "geen"}

${ragInfo}

CONCEPT-ANTWOORD DAT GEVALIDEERD MOET WORDEN:
---
${draftAnswer}
---

VALIDEER DIT ANTWOORD:
Bepaal of dit antwoord voldoet aan de kwaliteitseisen (zie system prompt).

Let EXTRA op bij intent "ADVIES_VRAAG" en onderwerpen over budget/kosten:
- Is de vraag specifiek genoeg?
- Worden er geen bedragen verzonnen?
- Wordt er niet gedaan alsof het antwoord "zeker" weet wat het kost terwijl dat afhangt van veel factoren?

Geef uw beoordeling als JSON.
`.trim();
}

/**
 * Parsed de LLM response naar een AnswerGuardResult
 */
function parseValidatorResponse(raw: string): AnswerGuardResult {
  try {
    // Clean markdown code blocks
    const cleaned = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned) as Partial<AnswerGuardResult>;

    // Validate verdict
    const verdict: AnswerGuardVerdict =
      parsed.verdict === "OK" ||
      parsed.verdict === "NEEDS_CLARIFICATION" ||
      parsed.verdict === "IRRELEVANT"
        ? parsed.verdict
        : "OK"; // default to OK bij parse-fout

    return {
      verdict,
      reasons: Array.isArray(parsed.reasons) ? parsed.reasons : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.8,
    };
  } catch (error) {
    console.error("[AnswerGuard] Failed to parse validator response:", error);

    // Fallback: assume OK
    return {
      verdict: "OK",
      reasons: ["Parser fout - assume OK"],
      suggestions: [],
      confidence: 0.5,
    };
  }
}

/**
 * Bouwt een verbeterde system prompt voor een tweede LLM-poging na een "NEEDS_CLARIFICATION" verdict
 */
export function buildClarificationPrompt(
  originalQuery: string,
  suggestions: string[]
): string {
  const suggestionsText = suggestions.join("\n");

  return `
De gebruiker stelde: "${originalQuery}"

Deze vraag is te algemeen of mist kritieke informatie om een zinvol antwoord te geven.

U MOET:
1. Eerlijk uitleggen dat de vraag nog niet specifiek genoeg is
2. 2-3 concrete verduidelijkingsvragen stellen om de juiste informatie te krijgen
3. GEEN valse zekerheid suggereren
4. GEEN specifieke bedragen of regels verzinnen

WELKE INFORMATIE ONTBREEKT:
${suggestionsText}

GEEF EEN KORT, VRIENDELIJK ANTWOORD (max 150 woorden) waarin u:
- Kort uitlegt waarom u meer info nodig heeft
- De verduidelijkingsvragen stelt
- De gebruiker helpt om de vraag te concretiseren
`.trim();
}

/**
 * Bouwt een verbeterde system prompt voor een tweede LLM-poging na een "IRRELEVANT" verdict
 */
export function buildRelevancePrompt(
  originalQuery: string,
  suggestions: string[]
): string {
  const suggestionsText = suggestions.join("\n");

  return `
De gebruiker stelde: "${originalQuery}"

Het eerste antwoord was NIET relevant voor deze vraag.

U MOET:
1. De kernvraag DIRECT adresseren
2. Kort en to-the-point antwoorden
3. Geen zijpaden of irrelevante informatie
4. Focussen op wat de gebruiker ECHT vroeg

WAT HET ANTWOORD WEL HAD MOETEN ADRESSEREN:
${suggestionsText}

GEEF EEN KORT, RELEVANT ANTWOORD (max 200 woorden) dat:
- Direct ingaat op de vraag
- Geen irrelevante informatie bevat
- Concreet en actionable is
`.trim();
}
