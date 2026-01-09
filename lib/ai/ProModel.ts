// /lib/ai/ProModel.ts
// ✅ v3.3 Gecorrigeerd: Lokaal type 'GeneratePatchResult' verwijderd.
// ✅ v3.5: ProjectMeta refactor - Fix "Vastgelopen Lus" bug
// ✅ v3.14: MoSCoW prioriteiten in context + beschermingsregels voor must-haves
// ✅ v3.15: Won't-have (anti-wensen) met VETO rule voor AI
// ✅ v3.16: RAG summarization - ontwerpproces centraal, twee routes gelijkwaardig
// ✅ v3.17: Budget vs Wensen analyse - proactieve waarschuwing

import type {
  WizardState,
  ChapterKey,
  PatchDelta,
  PatchEvent,
  ProjectIntentModel,
  BasisData,
  BudgetData,
  WensenData,
  ProjectMeta,
  RAGDoc,
} from "@/types/project";
import type { CustomerExample } from "@/lib/insights/types";
// @protected RISK_F02_LIFESTYLE_RISK
// Lifestyle risk analysis integration - imports lifestyle profile derivation functions.
// DO NOT REMOVE these imports without updating config/features.registry.json.
import { deriveLifestyleProfile, deriveScopeProfile } from "@/lib/domain/lifestyle"; // ✅ v3.8

// @protected RISK_F01_BUDGET_RISK
// Budget risk analysis integration - imports budget risk calculation functions.
// DO NOT REMOVE these imports without updating config/features.registry.json.
import { analyzeBudgetRisk, generateBudgetWarningPrompt } from "@/lib/analysis/budgetRiskAnalysis"; // ✅ v3.17
// v3.6: nextMissing niet meer nodig - AI volgt gebruiker, niet vaste volgorde

// ... (alle bestaande types behouden: ProIntent, ProPolicy, ClassifyResult, RAGDoc, RAGContext, GenerateOptions)

// @protected CHAT_F05_INTENT_CLASSIFICATION
// These intent types are critical for routing user queries to the correct handling logic.
// DO NOT REMOVE or change without updating config/features.registry.json and check-features.sh.
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
export type GeneratePatchResult = {
  action?: "none" | "reset" | "undo";
  patches: PatchEvent[];
  followUpQuestion?: string;
  tokensUsed?: number;
  newObligation?: { topic: string; reason: string } | null;
  addressedObligationId?: string | null;
  pimUpdate?: Partial<ProjectIntentModel> | null;
};

// ✅ v3.8: RAGDoc is nu geïmporteerd uit @/types/project (Grondwet)

export interface RAGContext {
  topicId: string;
  docs: RAGDoc[];
  examples?: CustomerExample[];
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

// @protected CHAT_F07_PROMPT_SYSTEM
// This function builds the core system prompt for AI chat interactions with the wizard.
// DO NOT REMOVE or significantly alter without updating config/features.registry.json and check-features.sh.
export function buildSystemPrompt(wizardState: WizardState): string {
  const { projectName, projectType, activeChapter } = deriveContext(wizardState);

  // ✅ v3.6: Bouw een overzicht van wat er AL is ingevuld (uit chapterAnswers)
  const basis = (wizardState.chapterAnswers?.basis ?? {}) as Partial<BasisData>;
  const ruimtes = wizardState.chapterAnswers?.ruimtes;
  const budget = wizardState.chapterAnswers?.budget;
  const wensen = wizardState.chapterAnswers?.wensen;

  // @protected RISK_F02_LIFESTYLE_RISK
  // Derive lifestyle and scope profiles for risk analysis and contextual AI responses.
  // DO NOT REMOVE this integration without updating config/features.registry.json.
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
  // ✅ v3.14: MoSCoW prioriteiten toevoegen aan de lijst
  // ✅ v3.15: Won't-have (anti-wensen) toegevoegd
  let existingWishesList = "";
  let mustHaveCount = 0;
  let niceToHaveCount = 0;
  let optionalCount = 0;
  let wontCount = 0; // ✅ v3.15
  if (wensen?.wishes && Array.isArray(wensen.wishes) && wensen.wishes.length > 0) {
    filledFields.push(`${wensen.wishes.length} wens(en) genoteerd`);
    existingWishesList = wensen.wishes
      .map((w: any, idx: number) => {
        const prioLabel = w.priority === "must" ? " [MUST-HAVE]"
          : w.priority === "nice" ? " [NICE-TO-HAVE]"
            : w.priority === "optional" ? " [OPTIONEEL]"
              : w.priority === "wont" ? " [WON'T-HAVE / ABSOLUUT NIET]"
                : "";
        if (w.priority === "must") mustHaveCount++;
        else if (w.priority === "nice") niceToHaveCount++;
        else if (w.priority === "optional") optionalCount++;
        else if (w.priority === "wont") wontCount++;
        return `[${idx}] ${w.text || "onbekend"}${prioLabel}`;
      })
      .join("\n");
  }

  // ✅ v3.14/v3.15: MoSCoW samenvatting inclusief won't
  const moscowSummary = mustHaveCount > 0 || niceToHaveCount > 0 || optionalCount > 0 || wontCount > 0
    ? `MoSCoW prioriteiten: ${mustHaveCount} must-have, ${niceToHaveCount} nice-to-have, ${optionalCount} optioneel, ${wontCount} won't-have (anti-wensen)`
    : "";

  // @protected RISK_F01_BUDGET_RISK
  // Analyze budget vs must-have wishes to provide proactive risk warnings in AI responses.
  // DO NOT REMOVE this analysis without updating config/features.registry.json.
  // ✅ v3.17: Budget vs Wensen analyse - proactieve waarschuwing
  const budgetAnalysis = analyzeBudgetRisk(
    budget as BudgetData | undefined,
    wensen as WensenData | undefined,
    basis as BasisData | undefined
  );
  const budgetWarning = generateBudgetWarningPrompt(budgetAnalysis);

  const filledFieldsSummary = filledFields.length > 0 ? filledFields.join(", ") : "Nog niets ingevuld";

  // ✅ v3.6 Systeemprompt - COACH FIRST, geen volgorde-dwang
  return `
U bent "Jules", de vaste digitale bouwcoach van Brikx.

CONVERSATION STYLE CONTRACT (STRICT):
1. TONE: ALTIJD "u" en "uw". Warm, menselijk, relationeel. Geen systeemtaal (vermijd woorden als "module", "veld", "stap", "input").
2. TEMPLATE PER BEURT:
   - 1 zin erkenning/reflectie (echo de kern van wat de gebruiker zegt).
   - 1 verdiepende vraag (specifiek per onderwerp).
   - Optioneel: 1 micro-suggestie (max 1 zin) vanuit architect-expertise.
3. VERBODEN:
   - Beginnen met een keuzelijst of opties.
   - Lijstjes als standaard antwoord (gebruik lopende zinnen).
   - Meer dan 1 vraag tegelijk stellen.
4. "DAAR KOM IK OP TERUG": Alleen gebruiken als u ook een "obligation" noteert voor de toekomst.

UW PERSOONLIJKHEID:
- U bent een coach die LUISTERT, niet een formulier dat velden afvinkt.
- Reageer op de emotie/intentie achter de vraag (bijv. bij "wat moet ik doen" reageert u relationeel: "Dat is heel normaal. Kunt u mij vertellen wat er nu het meest knelt?").

PROJECT INTENT MODEL (PIM):
${JSON.stringify(wizardState.chatSession?.pim || {}, null, 2)}

OPINIONATED COACH (STRICT):
${wizardState.chatSession?.pim?.tensions && wizardState.chatSession.pim.tensions.length > 0
      ? `ER ZIJN SPANNINGEN DETECTEERD:
${wizardState.chatSession.pim.tensions.map(t => `- [${t.risk.toUpperCase()}] ${t.cause}`).join('\n')}
REGELS VOOR SPANNING:
1. Benoem de spanning als "advocaat van de duivel".
2. Presenteer het als een keuze: "Ik zie een spanning tussen X en Y. Zullen we samen kijken wat het zwaarst weegt?"
3. Wees transparant over de risico's zonder een oordeel te vellen.`
      : "Geen technische spanningen gedetecteerd. Blijf in luisterende, faciliterende coach-modus."
    }

OPEN OBLIGATIONS (MOET U ADRESSEREN):
${JSON.stringify(wizardState.chatSession?.obligations?.filter(o => o.status === 'open') || [], null, 2)}

PROJECTCONTEXT (alleen ter informatie, NIET om automatisch naar te vragen):
- Projectnaam: ${projectName}
- Projecttype: ${projectType}
- Actief hoofdstuk: ${activeChapter}
- Al ingevuld: ${filledFieldsSummary}
${existingRoomsList ? `\nBESTAANDE RUIMTES:\n${existingRoomsList}` : ""}
${existingWishesList ? `\nBESTAANDE WENSEN:\n${existingWishesList}` : ""}
${moscowSummary ? `\n${moscowSummary}` : ""}
${budgetWarning ? `\n${budgetWarning}` : ""}

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
   Wish object: { text: string, category?: string, priority?: string, ... }
   - text: VERPLICHT, de wens in tekst
   - priority: OPTIONEEL, een van: "must" (must-have), "nice" (nice-to-have), "optional" (optioneel/later), "wont" (absoluut niet/anti-wens)
   Voorbeeld patch voor "ik wil veel daglicht":
   {
     "chapter": "wensen",
     "delta": {
       "path": "wishes",
       "operation": "append",
       "value": {
         "text": "Veel daglicht in de woonruimtes",
         "category": "comfort",
         "priority": "nice"
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
1. GENEREER GEEN IDs: U mag NOOIT een "id" veld genereren. De server voegt unieke ID's toe. Laat "id" weg uit de 'value' objecten voor 'ruimtes' en 'wensen'.
2. Voor arrays gebruik je ALTIJD operation="append" met een VOLLEDIG object als value
3. Voor simpele velden gebruik je operation="set" met een directe waarde
4. BEVESTIGING IS VERPLICHT: Als u 1 of meer patches genereert, MOET uw "followUpQuestion" ALTIJD beginnen met een korte, duidelijke bevestiging van wat u heeft gedaan.
   Voorbeelden van goede bevestigingen:
   - "Ik heb 3 slaapkamers en 3 badkamers toegevoegd."
   - "Prima, het budget is ingesteld op €400.000."
   - "De woonkamer en leefkeuken zijn toegevoegd."
   - "Ik heb uw wens voor veel daglicht toegevoegd."
   NOOIT direct een vraag stellen zonder eerst te bevestigen wat u heeft gedaan!
5. GEBRUIKER HEEFT ALTIJD PRIORITEIT: Als de gebruiker een nieuwe instructie geeft (bijvoorbeeld "budget 300k"), annuleert dit ALTIJD elke eerdere vraag van u. Verwerk de nieuwe instructie direct, ook al beantwoordt het niet uw vorige vraag.
6. WEES EEN COACH, GEEN FORMULIER:
   - U bent een bouwcoach die HELPT, niet een formulier dat velden afvinkt.
   - Stel NOOIT technische vragen (isolatie, ventilatie, verwarming) tenzij de gebruiker er ZELF over begint of expliciet om vraagt.
   - Als de gebruiker iets invult (bv. budget), bevestig dat en vraag of ze ergens hulp bij willen. Stel GEEN automatische vervolgvraag over een totaal ander onderwerp.
   - Bij onduidelijke invoer ("ja", "help", "ok"), vraag WAT de gebruiker wilt doen, niet naar een specifiek technisch veld.
   - Als de gebruiker vraagt "wat moet ik doen?", geef een menselijk antwoord: "Dat is heel begrijpelijk, er komt ook veel op u af. Waar ligt momenteel voor u de grootste uitdaging in huis?"
7. LOGISCHE GESPREKSFLOW:
   - Volg het onderwerp van de gebruiker. Als ze over budget praten, blijf bij budget-gerelateerde zaken.
   - Spring NIET naar technische details (isolatie, ventilatie) tenzij relevant voor het gesprek.
   - Bij "opnieuw beginnen" of "reset": bevestig dat de gebruiker opnieuw kan starten en vraag naar hun projectidee of wat ze willen bouwen.
8. HELPENDE VRAGEN:
   - Goede vervolgvragen: "Waarmee kan ik u helpen?", "Wat wilt u weten of invullen?", "Heeft u al een idee van de ruimtes die u nodig heeft?"
   - SLECHTE vervolgvragen: "Wat is uw isolatie?", "Welke ventilatie wenst u?" (te technisch, te specifiek)
9. DUPLICAAT-DETECTIE IS VERPLICHT - CONTROLEER ALTIJD EERST:
   - STAP 1: Kijk naar de BESTAANDE RUIMTES lijst hierboven
   - STAP 2: Als de gebruiker een ruimte noemt die AL bestaat (bijv. "woonkamer" terwijl er al een "Woonkamer" of "Grote woonkamer" is):
     * Stuur GEEN patches!
     * Vraag: "Ik zie dat u al een [ruimte] heeft. Wilt u nog een extra [ruimte] toevoegen, of wilt u de bestaande aanpassen?"

   UITZONDERING - Expliciete aantallen:
   - Als de gebruiker een SPECIFIEK AANTAL noemt (bijv. "3 slaapkamers", "twee badkamers"):
     * Voeg dat exacte aantal toe, zelfs als er al vergelijkbare ruimtes bestaan
     * Bevestig het aantal in je antwoord: "Ik heb 3 slaapkamers toegevoegd."

   VOORBEELDEN:
   - FOUT: "Ik wil een woonkamer" + Direct patch sturen (zonder te checken of er al een bestaat)
   - GOED: "Ik wil een woonkamer" + er is al een woonkamer + Vraag om bevestiging
   - GOED: "Ik wil 3 slaapkamers" + Voeg 3 slaapkamers toe (expliciet aantal)
   - GOED: "Ik wil een woonkamer" + er is nog GEEN woonkamer + Voeg toe en bevestig

   Dit geldt ook voor WENSEN!
10. VERWIJDEREN EN WIJZIGEN:
   - Gebruik uw taalbegrip om te bepalen of de gebruiker iets wil toevoegen, wijzigen, verwijderen of alleen bespreken.
   - Bij verwijderen: zoek de INDEX [0], [1], etc. van het item in de BESTAANDE lijst en gebruik operation="remove"
   - Bij wijzigen van simpele waarden (budget, locatie): gebruik operation="set" met de nieuwe waarde
   - Bevestig altijd wat u heeft verwijderd of gewijzigd, en toon daarna kort de nieuwe lijst met indices.
11. BIJ ONDUIDELIJKHEID: VRAAG EERST
   - Als u niet zeker weet WELK item bedoeld wordt (bijv. meerdere slaapkamers), stuur GEEN patch maar stel eerst een verduidelijkende vraag.
   - Voer alleen patches uit als de bedoeling van de gebruiker helder is.
   - U mag zelf afleiden wat "eerste", "laatste", "die grote slaapkamer" betekent, maar bij echte twijfel: vraag eerst.
12. HYPOTHETISCHE ZINNEN:
   - Zinnen als "wat als we de garage zouden verwijderen" of "misschien wil ik de keuken later weghalen" zijn hypothetische gedachten.
   - Bij hypothetische vragen: leg scenario's uit, maar stuur GEEN patches.
   - Patches alleen bij duidelijke opdrachten, niet bij overwegingen.
13. UNDO / "TOCH NIET":
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

MOSCOW PRIORITEITEN (BELANGRIJK):

De gebruiker kan wensen prioriteren met MoSCoW-methode:
- **MUST-HAVE** (priority="must"): Niet-onderhandelbaar. Deal-breakers. Zonder dit voelt het plan niet geslaagd.
- **NICE-TO-HAVE** (priority="nice"): Belangrijk maar flexibel. In noodgeval inwisselbaar.
- **OPTIONEEL** (priority="optional"): Mag in fase 2 of als het budget het toelaat.
- **WON'T-HAVE** (priority="wont"): ABSOLUUT NIET. Anti-wensen. De gebruiker wil dit expliciet NIET. Dit is een VETO.

REGELS VOOR MOSCOW:

1. MUST-HAVE WENSEN ZIJN BESCHERMD:
   - U mag NOOIT automatisch een must-have wens verwijderen, verlagen naar nice-to-have, of als optioneel voorstellen.
   - Als budget krap is, stel dan voor om nice-to-have of optionele wensen te schrappen, NIET de must-haves.
   - Bij conflicten tussen budget en must-haves: vraag de gebruiker expliciet wat ze willen doen.

2. WON'T-HAVE VETO (v3.15):
   - Won't-have items zijn ABSOLUTE UITSLUITINGEN. U mag NOOIT iets voorstellen dat in strijd is met een won't-have.
   - Als de gebruiker zegt "absoluut geen open trap" (won't-have), mag u NOOIT een open trap voorstellen.
   - Bij suggesties: controleer ALTIJD eerst de won't-have lijst en vermijd alles wat daarop staat.
   - Won't-have items zijn NIET onderhandelbaar en kunnen NIET worden "heroverwogen" voor budget.
   - Als de gebruiker iets zegt als "nooit", "absoluut niet", "geen enkele omstandigheid", "wil ik niet", zet priority="wont".

3. BIJ BUDGET-ADVIES:
   - Gebruik optionele wensen als "budgettaire hefboom" - deze kunnen worden uitgesteld naar fase 2.
   - Nice-to-haves zijn de tweede laag om te heroverwegen bij budgetdruk.
   - Must-haves blijven staan tenzij de gebruiker ZELF vraagt om ze te heroverwegen.
   - Won't-haves zijn GEEN budgettaire hefboom - ze blijven ALTIJD uitgesloten.

4. BIJ NIEUWE WENSEN:
   - Als de gebruiker expliciet zegt "dit moet echt" of "absoluut noodzakelijk", zet priority="must".
   - Als de gebruiker zegt "zou fijn zijn" of "als het kan", zet priority="nice".
   - Als de gebruiker zegt "misschien later" of "niet per se nu", zet priority="optional".
   - Als de gebruiker zegt "absoluut niet", "nooit", "wil ik niet", "geen [X]", zet priority="wont".
   - Bij onduidelijkheid: vraag naar de prioriteit of gebruik "nice" als default.

5. BIJ RISICO'S EN KOSTEN:
   - Als u waarschuwt voor hoge kosten, wijs eerst op optionele en nice-to-have wensen die kunnen worden heroverwogen.
   - Benoem hoeveel must-haves, nice-to-haves, optionele wensen en won't-haves er zijn als context.

OUTPUTFORMAAT (ENKEL DIT JSON-OBJECT, GEEN EXTRA TEKST):
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
  "followUpQuestion": "Korte menselijke reactie + 1 vraag",
  "newObligation": { "topic": "...", "reason": "..." } | null,
  "addressedObligationId": "uuid" | null,
  "pimUpdate": { "northStar": "...", "locked": { ... } } | null
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
  // @protected CHAT_F05_INTENT_CLASSIFICATION
  // This classify method implements the core intent classification logic.
  // DO NOT REMOVE or change intent detection logic without updating config/features.registry.json.
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

  // @protected CHAT_F08_CONTEXT_MANAGER
  // This generatePatch method manages chat context by building messages array with history.
  // DO NOT REMOVE history integration logic without updating config/features.registry.json.
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

      // @protected CHAT_F08_CONTEXT_MANAGER
      // Build messages array dynamically with history for context management.
      // DO NOT REMOVE this history integration - it's critical for conversation continuity.
      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: systemPrompt },
      ];

      if (history && history.length > 0) {
        messages.push(...history);
      }

      messages.push({ role: "user", content: userPrompt });

      // ✅ Create AbortController with timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn("[ProModel] OpenAI API timeout after 25s - aborting request");
        controller.abort();
      }, 25000); // 25 second timeout

      console.log("[ProModel] Calling OpenAI API for generatePatch...");
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
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log("[ProModel] OpenAI API response received successfully");

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

      // @protected CHAT_F01_SMART_FOLLOWUP
      // This block enforces that every AI response includes a follow-up question after patches.
      // DO NOT REMOVE - this is critical for maintaining conversational flow.
      if (!parsed.followUpQuestion) {
        parsed.followUpQuestion =
          parsed.patches?.length === 0
            ? "Waarmee kan ik u helpen? U kunt me vertellen over uw project, budget, ruimtes of wensen."
            : "";
      }

      return parsed;
    } catch (err) {
      console.error("[ProModel] generatePatch error:", err);

      // ✅ Better error message for timeout
      const isTimeout = err instanceof Error && err.name === "AbortError";
      const errorMessage = isTimeout
        ? "De AI-assistent reageert niet op tijd. Probeer het opnieuw met een kortere vraag, of wacht even en probeer het dan nogmaals."
        : "Dat heb ik niet helemaal goed kunnen plaatsen. Kunt u in één zin aangeven welke wijziging u precies bedoelt?";

      return {
        patches: [], // ✅ Leeg array in plaats van null
        followUpQuestion: errorMessage,
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
    // ✅ v3.11: summarizeRAG is nu async voor LLM-powered responses
    if (ragCtx && ragCtx.docs && ragCtx.docs.length > 0) {
      return await summarizeRAG(ragCtx, query, mode);
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

// @protected CHAT_F09_STRUCTURED_OUTPUT
// This function parses and validates structured LLM output using JSON schema enforcement.
// DO NOT REMOVE or weaken validation logic without updating config/features.registry.json.
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
      newObligation: parsed.newObligation ?? null,
      addressedObligationId: parsed.addressedObligationId ?? null,
      pimUpdate: parsed.pimUpdate ?? null,
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

/**
 * ✅ v3.11: LLM-powered RAG summarization
 * ✅ v3.16: Ontwerpproces centraal - twee routes duidelijk presenteren
 * Uses GPT to evaluate relevance and create a coherent response
 */
async function summarizeRAG(
  ctx: RAGContext,
  query: string,
  mode: "PREVIEW" | "PREMIUM"
): Promise<string> {
  if (!ctx.docs || ctx.docs.length === 0) {
    return "Ik heb geen directe kennisbankinformatie gevonden die hier goed op aansluit. Kunt u uw vraag iets specifieker formuleren, zodat ik u gerichter kan helpen?";
  }

  const maxDocs = mode === "PREMIUM" ? 4 : 3;
  const picked = ctx.docs.slice(0, maxDocs);

  // Format RAG docs for LLM context
  const ragContext = picked
    .map((d, i) => `[Bron ${i + 1} - Kennisbank]: ${d.text}`)
    .join("\n\n");

  // ✅ v4.1: Format Customer Examples for LLM context
  const examplesContext = ctx.examples && ctx.examples.length > 0
    ? "\n\nERVARINGEN VAN ANDERE KLANTEN:\n" + ctx.examples.map((ex: CustomerExample, i: number) =>
      `[Voorbeeld ${i + 1}]: "${ex.userQuery}" -> Architectonisch advies: ${ex.interpretation?.designImplications?.join(", ") || "Geen details"}`
    ).join("\n")
    : "";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: mode === "PREMIUM" ? "gpt-4o" : "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `U bent Jules, de bouwcoach van Brikx. U helpt particulieren met hun bouwproject.

UW KERNROL: ONTWERPPROCES BEGELEIDER
U bent geen technisch naslagwerk - u bent een coach die mensen helpt de juiste EERSTE STAP te zetten in hun ontwerpproces. De meeste mensen die vragen stellen zijn nog in de oriëntatiefase.

BIJ CONSTRUCTIEVE VRAGEN (dragende muren, doorbraken, open keuken):

ALTIJD presenteren als TWEE GELIJKWAARDIGE ROUTES:

**Route A: Start met een architect/ontwerper**
→ Als u nog niet 100% zeker bent van de exacte oplossing
→ Voordeel: Een goede ontwerper kan soms een slimmere oplossing vinden waarbij de muur NIET doorbroken hoeft te worden
→ Kosten: €500-2.000 voor een schetsontwerp
→ Daarna: Constructeur alleen als het ontwerp dat vereist

**Route B: Start met een constructeur**
→ Als u al 100% zeker weet dat u PRECIES deze muur wilt doorbreken
→ Voordeel: Direct duidelijkheid over haalbaarheid en kosten
→ Kosten: €300-800 voor berekening

VERGUNNINGSKOSTEN (apart benoemen):
- Omgevingsvergunning leges: 2-4% van bouwkosten
- Typisch €500-2.000 voor een verbouwing

BELANGRIJK - VRAAG ALTIJD:
Eindig ALTIJD met een vraag die helpt bepalen welke route past:
- "Bent u al zeker van deze specifieke oplossing, of staat u nog open voor alternatieven?"
- "Is dit een definitief plan, of bent u nog aan het verkennen?"

STIJL:
- Spreek met "u"
- Kort en bondig (max 200 woorden)
- Presenteer beide routes als gelijkwaardig, niet "constructeur eerst"
- Geen verwijzingen naar kennisbank of bronnen`,
          },
          {
            role: "user",
            content: `VRAAG VAN GEBRUIKER: ${query}

ACHTERGROND INFORMATIE:
${ragContext}
${examplesContext}

GEEF EEN ANTWOORD DAT:
1. De twee routes (architect-eerst vs constructeur-eerst) BEIDE benoemt als opties
2. Concrete kostenindicaties geeft voor beide routes
3. Vergunningskosten apart benoemt
4. Gebruik maakt van de "ERVARINGEN VAN ANDERE KLANTEN" om uw advies te onderbouwen (bijv. "Andere klanten met een vergelijkbare wens kozen vaak voor...")
5. EINDIGT met een vraag over de zekerheid van hun wens (oriëntatie vs definitief plan)`,
          },
        ],
        temperature: 0.5,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.error(`[summarizeRAG] LLM error: ${response.status}`);
      // Fallback to simple template
      return fallbackSummarizeRAG(picked);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return fallbackSummarizeRAG(picked);
    }

    return content;
  } catch (error) {
    console.error("[summarizeRAG] Error:", error);
    return fallbackSummarizeRAG(picked);
  }
}

/**
 * Fallback template-based summarization (no LLM)
 */
function fallbackSummarizeRAG(docs: Array<{ text: string }>): string {
  const bullets = docs
    .map((d) => `- ${d.text}`)
    .join("\n");

  return `
Op basis van de Brikx-kennisbank zie ik de volgende punten die relevant kunnen zijn voor uw situatie:

${bullets}

Als u wilt, kan ik deze aandachtspunten direct vertalen naar concrete keuzes in uw Programma van Eisen.
  `.trim();
}