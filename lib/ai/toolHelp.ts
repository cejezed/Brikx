// lib/ai/toolHelp.ts
// v3.x: META_TOOLING - Fixed responses voor tool-gerelateerde vragen

import type { ChapterKey } from "@/types/project";

export type ToolHelpResponse = {
  answer: string;
  quickReplies?: string[];
};

// ============================================================================
// WIZARD UITLEG
// ============================================================================

const WIZARD_EXPLANATION = `**De Brikx Wizard helpt u in 7 stappen naar een compleet Programma van Eisen (PvE):**

1. **Basis** – Projecttype, locatie, leefprofiel
2. **Ruimtes** – Welke ruimtes heeft u nodig? (m², wensen per ruimte)
3. **Wensen** – Must-haves, nice-to-haves en won't-haves
4. **Budget** – Totaalbudget, bandbreedte, eigen inbreng
5. **Techniek** – Installaties, domotica, beveiliging, netwerk
6. **Duurzaam** – Energie, isolatie, materialen, water
7. **Risico** – Mogelijke knelpunten en hoe u die mitigeert

Elk hoofdstuk vult u in via:
- **Directe velden** in de wizard zelf
- **Chat** – stel vragen, deel context, laat de AI u helpen invullen
- **Premium tips** – op basis van uw situatie (alleen Premium)

Aan het eind krijgt u een **professioneel PvE-rapport** (PDF) dat u kunt delen met architecten of aannemers.

**Waarmee kan ik u helpen? U kunt me vertellen over uw project, budget, ruimtes of wensen.**`;

// ============================================================================
// HOE TE GEBRUIKEN
// ============================================================================

const HOW_TO_USE = `**U kunt de chat op 3 manieren gebruiken:**

1. **Hoofdstukken invullen** – "Ik wil 3 slaapkamers en een open keuken" → vult automatisch Ruimtes in
2. **Advies vragen** – "Hoe isoleer ik mijn dak?" → haalt kennis op uit de Brikx kennisbank
3. **Navigeren** – "Ga naar Techniek" of "Wat moet ik nu doen?" → stuurt u naar de juiste stap

**Tips:**
- Vertel in uw eigen woorden uw plannen, budget en zorgen
- De chat vult de wizard automatisch aan waar mogelijk
- U kunt altijd handmatig bijsturen in de wizard zelf
- Premium-mode geeft uitgebreidere antwoorden en analyses

**Waarmee kan ik u helpen? Wilt u iets invullen, of heeft u een vraag over uw project?**`;

// ============================================================================
// CHAPTER-SPECIFIEKE HELP
// ============================================================================

const CHAPTER_HELP: Record<ChapterKey, string> = {
  basis: `**Hoofdstuk Basis** gaat over de fundamenten van uw project:
- Projecttype (nieuwbouw, verbouwing, aanbouw)
- Locatie en leefprofiel (gezin, thuiswerken, hobby's)
- Urgentie (wanneer wilt u starten?)

**Wat u kunt vertellen:**
- "Ik wil een aanbouw van 30m²"
- "We zijn een gezin met 2 jonge kinderen, ik werk vaak thuis"
- "We willen binnen 6 maanden beginnen"

**Wilt u de basisgegevens invullen, of heeft u een vraag?**`,

  ruimtes: `**Hoofdstuk Ruimtes** gaat over de ruimtelijke indeling:
- Welke kamers heeft u nodig? (woonkamer, slaapkamers, badkamer, etc.)
- Hoeveel m² per ruimte?
- Specifieke wensen per ruimte

**Wat u kunt vertellen:**
- "3 slaapkamers, 1 badkamer, open keuken-woonkamer"
- "Woonkamer minimaal 35m² met veel licht"
- "Master bedroom met ensuite badkamer"

**Welke ruimtes heeft u nodig? U kunt ze in één keer noemen of één voor één toevoegen.**`,

  wensen: `**Hoofdstuk Wensen** gaat over prioriteiten:
- **Must-haves** – absoluut noodzakelijk
- **Nice-to-haves** – graag, maar niet essentieel
- **Optional** – mooie bonus
- **Won't-haves** – expliciet NIET gewenst

**Wat u kunt vertellen:**
- "Vloerverwarming is een must"
- "Een kookeiland zou mooi zijn, maar geen dealbreaker"
- "We willen absoluut geen open trap"

**Wat zijn uw belangrijkste wensen? Begin met de must-haves.**`,

  budget: `**Hoofdstuk Budget** gaat over financiën:
- Totaalbudget (incl. of excl. BTW/architect/vergunning)
- Bandbreedte (min-max range)
- Eigen inbreng (schilderen, tuinaanleg, etc.)
- Contingency buffer

**Wat u kunt vertellen:**
- "Budget is €150.000 tot €180.000"
- "We doen zelf schilderen en afbouw"
- "Ik wil 10% buffer aanhouden"

**Wat is uw totaalbudget? U kunt een bedrag of een bandbreedte opgeven.**`,

  techniek: `**Hoofdstuk Techniek** gaat over installaties en systemen:
- Verwarming (warmtepomp, hybride, gas)
- Ventilatie (mechanisch, WTW)
- Koeling, PV-panelen, laadpaal
- Domotica, beveiliging, netwerk

**Wat u kunt vertellen:**
- "We willen van het gas af, all-electric warmtepomp"
- "Vloerverwarming met mechanische ventilatie"
- "Slimme verlichting in woonkamer en keuken"

**Heeft u al ideeën over verwarming, ventilatie of andere technische installaties?**`,

  duurzaam: `**Hoofdstuk Duurzaam** gaat over duurzaamheid en comfort:
- Energielabel ambitie (A++, A+++, etc.)
- Isolatiewaarden (Rc gevel/dak/vloer, U-glas)
- Luchtkwaliteit (CO₂, ventilatieklasse)
- Materialen (biobased, circulair)
- Daglicht, akoestiek, water

**Wat u kunt vertellen:**
- "We willen minimaal energielabel A++"
- "Triple glas en Rc 6.0 in het dak"
- "Regenwaterhergebruik voor tuin en toilet"

**Welke duurzaamheidsambitie heeft u? Wilt u een hoog energielabel, of specifieke isolatie-eisen?**`,

  risico: `**Hoofdstuk Risico** gaat over mogelijke knelpunten:
- Planning risico's (vergunning, leveringstijd)
- Budget risico's (kostenoverschrijding)
- Technische risico's (fundering, draagmuur)
- Kwaliteit risico's (aannemer, materiaal)

**Wat u kunt vertellen:**
- "Ik maak me zorgen over de fundering"
- "Wat zijn de grootste valkuilen bij een aanbouw?"
- "Hoe voorkom ik budgetoverschrijding?"

**Zijn er specifieke risico's waar u zich zorgen over maakt, of wilt u advies over mogelijke valkuilen?**`,
};

// ============================================================================
// QUICK REPLIES PER CHAPTER
// ============================================================================

const QUICK_REPLIES: Record<ChapterKey, string[]> = {
  basis: [
    "Wat moet ik hier invullen?",
    "Ik wil een aanbouw van 30m²",
    "We zijn een gezin met 2 kinderen",
    "Budget is ongeveer €100.000",
  ],
  ruimtes: [
    "Wat zijn typische ruimtes?",
    "3 slaapkamers en 1 badkamer",
    "Open keuken-woonkamer van 50m²",
    "Welke m² zijn gebruikelijk?",
  ],
  wensen: [
    "Wat zijn must-haves?",
    "Vloerverwarming is essentieel",
    "We willen geen open trap",
    "Hoe prioriteer ik mijn wensen?",
  ],
  budget: [
    "Hoe bereken ik mijn budget?",
    "Budget is €150k tot €180k",
    "Wat zijn verborgen kosten?",
    "Hoeveel buffer moet ik aanhouden?",
  ],
  techniek: [
    "Wat moet ik hier invullen?",
    "We willen van het gas af",
    "All-electric warmtepomp met vloerverwarming",
    "Wat is een WTW-installatie?",
  ],
  duurzaam: [
    "Wat is een realistisch energielabel?",
    "We willen A++ halen",
    "Welke isolatiewaarden zijn verstandig?",
    "Zonnepanelen: hoeveel heb ik nodig?",
  ],
  risico: [
    "Wat zijn typische risico's?",
    "Hoe voorkom ik budgetoverschrijding?",
    "Wat kan er misgaan bij een aanbouw?",
    "Hoe mitigeer ik planningrisico's?",
  ],
};

// ============================================================================
// CHAPTER LABELS
// ============================================================================

export function getChapterLabel(chapter: ChapterKey): string {
  const labels: Record<ChapterKey, string> = {
    basis: "Basis",
    ruimtes: "Ruimtes",
    wensen: "Wensen",
    budget: "Budget",
    techniek: "Techniek",
    duurzaam: "Duurzaamheid",
    risico: "Risico's",
  };
  return labels[chapter];
}

// ============================================================================
// MAIN HELP FUNCTION
// ============================================================================

export function getToolHelp(
  query: string,
  context: { currentChapter: ChapterKey }
): ToolHelpResponse {
  const q = query.toLowerCase();

  // Wizard algemene uitleg
  if (
    q.includes("hoe werkt") ||
    q.includes("wat is deze wizard") ||
    q.includes("wat doet deze tool")
  ) {
    return {
      answer: WIZARD_EXPLANATION,
      quickReplies: ["Hoe gebruik ik de chat?", "Wat moet ik invullen?"],
    };
  }

  // Hoe te gebruiken
  if (
    q.includes("hoe gebruik") ||
    q.includes("wat moet ik") ||
    q.includes("hoe werkt de chat")
  ) {
    return {
      answer: HOW_TO_USE,
      quickReplies: [
        "Vertel me meer over de wizard",
        `Wat moet ik invullen bij ${getChapterLabel(context.currentChapter)}?`,
      ],
    };
  }

  // Chapter-specifieke help
  if (q.includes("wat moet ik invullen") || q.includes("waar ben ik")) {
    const chapterHelp = CHAPTER_HELP[context.currentChapter];
    return {
      answer: chapterHelp,
      quickReplies: QUICK_REPLIES[context.currentChapter].slice(0, 3),
    };
  }

  // Default: combineer wizard + chapter
  return {
    answer: `${HOW_TO_USE}\n\n---\n\n**Je bent nu bij: ${getChapterLabel(context.currentChapter)}**\n\n${CHAPTER_HELP[context.currentChapter]}`,
    quickReplies: QUICK_REPLIES[context.currentChapter].slice(0, 3),
  };
}

// ============================================================================
// ONBOARDING MESSAGE
// ============================================================================

export function getOnboardingMessage(
  currentChapter: ChapterKey
): ToolHelpResponse {
  return {
    answer: `Hoi! Ik ben **Jules**, je digitale bouwcoach.

Ik help je stap voor stap naar een professioneel **Programma van Eisen (PvE)** voor je bouwproject.

**Je bent nu bij:** ${getChapterLabel(currentChapter)}

Vertel in je eigen woorden je budget, ruimtes, wensen en zorgen – ik vul de wizard automatisch mee en stuur je naar de juiste stap.`,
    quickReplies: QUICK_REPLIES[currentChapter].slice(0, 4),
  };
}

// ============================================================================
// QUICK REPLIES FOR CHAPTER
// ============================================================================

export function getQuickRepliesForChapter(chapter: ChapterKey): string[] {
  return QUICK_REPLIES[chapter] || [];
}
