// lib/ai/helpers/chapterTemplates.ts
// Week 2, Day 10 - Chapter Opening Templates
// Purpose: Provide contextual chapter opening messages

import type { ChapterKey } from '@/types/project';

/**
 * Template context for generating chapter opening messages.
 */
export interface TemplateContext {
  chapter: ChapterKey;
  userExperience?: 'starter' | 'enigszins' | 'ervaren';
  hasConflict: boolean;
  hasAnticipation: boolean;
}

/**
 * Get chapter opening message based on context.
 *
 * @param context - Template context with chapter and scenario info
 * @returns Contextual opening message in Dutch
 */
export function getChapterOpeningMessage(context: TemplateContext): string {
  const { chapter, userExperience, hasConflict, hasAnticipation } = context;

  // Conflict scenario takes priority
  if (hasConflict) {
    return getConflictMessage(chapter, userExperience);
  }

  // Anticipation scenario
  if (hasAnticipation) {
    return getAnticipationMessage(chapter, userExperience);
  }

  // Normal scenario
  return getNormalMessage(chapter, userExperience);
}

/**
 * Get normal opening message for a chapter.
 * @private
 */
function getNormalMessage(
  chapter: ChapterKey,
  userExperience?: 'starter' | 'enigszins' | 'ervaren'
): string {
  const isStarter = userExperience === 'starter';
  const isExpert = userExperience === 'ervaren';

  switch (chapter) {
    case 'basis':
      if (isStarter) {
        return 'Welkom bij de Brikx wizard! We gaan samen je project helder krijgen. Vertel me eerst: waar denk je aan? Een nieuwbouw, verbouwing, of misschien een aanbouw?';
      }
      return 'Welkom! Laten we beginnen met de basis van je project. Wat voor type project heb je in gedachten?';

    case 'ruimtes':
      if (isStarter) {
        return 'Nu gaan we kijken naar de ruimtes in je project. Geen zorgen als je nog niet alles precies weet - we verkennen dit samen stap voor stap. Welke ruimtes wil je aanpakken?';
      }
      return 'Laten we de ruimtes doorlopen. Welke ruimtes wil je realiseren of aanpassen?';

    case 'wensen':
      if (isStarter) {
        return 'Tijd voor het leukste deel: je wensen! Vertel me wat je graag zou willen - denk aan comfort, stijl, of functionaliteit. Er zijn geen rare wensen, alles mag op tafel.';
      }
      if (isExpert) {
        return 'Wat zijn de must-haves voor dit project? En welke nice-to-haves heb je in gedachten?';
      }
      return 'Laten we je wensen in kaart brengen. Wat is belangrijk voor jou in dit project?';

    case 'budget':
      if (isStarter) {
        return 'Laten we het hebben over budget. Ik snap dat dit spannend kan zijn, maar het is belangrijk om een realistisch beeld te krijgen. Wat heb je ongeveer in gedachten?';
      }
      if (isExpert) {
        return 'Wat is je beschikbare budget voor dit project?';
      }
      return 'Nu het financiële plaatje. Wat is je budgetkader voor dit project?';

    case 'techniek':
      if (isStarter) {
        return 'We gaan nu in op de technische kant. Maak je geen zorgen als dit complex lijkt - ik leg het graag uit. Denk aan verwarming, ventilatie en elektra. Waar wil je mee beginnen?';
      }
      if (isExpert) {
        return 'Laten we de technische installaties bespreken. Wat zijn je voorkeuren voor verwarming, ventilatie en installaties?';
      }
      return 'Tijd voor de technische aspecten. Laten we kijken naar installaties en systemen. Heb je al ideeën over verwarming of ventilatie?';

    case 'duurzaam':
      if (isStarter) {
        return 'Duurzaamheid kan veel vormen hebben - van zonnepanelen tot isolatie. Wat spreekt jou aan? En wat past bij je budget en wensen?';
      }
      if (isExpert) {
        return 'Wat zijn je duurzaamheidsdoelstellingen voor dit project?';
      }
      return 'Laten we kijken naar duurzaamheid. Wat is belangrijk voor jou: energiebesparing, milieu-impact, of toekomstbestendigheid?';

    case 'risico':
      if (isStarter) {
        return 'Tot slot kijken we naar mogelijke uitdagingen en risico\'s. Dit helpt om verrassingen te voorkomen. Maak je geen zorgen - we gaan dit goed voorbereiden.';
      }
      if (isExpert) {
        return 'Laten we potentiële risico\'s en aandachtspunten inventariseren voor je project.';
      }
      return 'Nu kijken we naar risico\'s en aandachtspunten. Dit helpt om voorbereid te zijn op mogelijke uitdagingen.';

    default:
      return 'Laten we aan de slag gaan met dit onderdeel van je project.';
  }
}

/**
 * Get anticipation-aware opening message.
 * @private
 */
function getAnticipationMessage(
  chapter: ChapterKey,
  userExperience?: 'starter' | 'enigszins' | 'ervaren'
): string {
  const isStarter = userExperience === 'starter';

  switch (chapter) {
    case 'basis':
      return 'Welkom! Voordat we beginnen, wil ik je helpen met een paar belangrijke keuzes die impact hebben op je project. Laten we starten met je projecttype.';

    case 'ruimtes':
      if (isStarter) {
        return 'Bij het ontwerpen van ruimtes zijn er een paar slimme keuzes die veel verschil maken. Laten we samen kijken wat goed bij jouw situatie past.';
      }
      return 'Laten we de ruimtes strategisch aanpakken. Ik zie al een paar interessante mogelijkheden op basis van je eerdere keuzes.';

    case 'wensen':
      return 'Voordat je je wensen deelt, wil ik je graag wijzen op een paar overwegingen die later belangrijk kunnen zijn. Zo kunnen we je wensen beter prioriteren.';

    case 'budget':
      if (isStarter) {
        return 'Budget is cruciaal, en ik zie al een paar punten waar we scherp op moeten letten. Laten we realistisch kijken naar wat mogelijk is.';
      }
      return 'Op basis van je wensen zie ik enkele budgettaire aandachtspunten. Laten we dit goed doornemen.';

    case 'techniek':
      return 'Bij technische installaties zijn er keuzes die je later niet meer makkelijk kunt veranderen. Laat me je door de belangrijkste opties leiden.';

    case 'duurzaam':
      return 'Er zijn duurzame keuzes die perfect aansluiten bij je project. Laten we kijken wat slim is om nu te doen.';

    case 'risico':
      return 'Ik zie al een paar aandachtspunten die belangrijk zijn voor jouw project. Laten we die goed inventariseren.';

    default:
      return 'Laten we dit onderdeel doornemen. Ik heb al een paar suggesties voor je.';
  }
}

/**
 * Get conflict-aware opening message.
 * @private
 */
function getConflictMessage(
  chapter: ChapterKey,
  userExperience?: 'starter' | 'enigszins' | 'ervaren'
): string {
  const isStarter = userExperience === 'starter';

  switch (chapter) {
    case 'basis':
      return 'Welkom! Ik zie dat er een paar dingen zijn die we eerst moeten uitzoeken voordat we verder gaan. Laten we dit stap voor stap aanpakken.';

    case 'ruimtes':
      if (isStarter) {
        return 'Bij het plannen van je ruimtes zie ik een paar uitdagingen. Geen paniek - we gaan dit samen oplossen. Laten we kijken hoe we dit praktisch kunnen maken.';
      }
      return 'Er zijn een paar aandachtspunten bij je ruimte-indeling die we moeten bespreken voordat we verder gaan.';

    case 'wensen':
      return 'Ik zie dat sommige wensen mogelijk conflicteren met je budget of andere randvoorwaarden. Laten we dit goed doornemen en prioriteren.';

    case 'budget':
      if (isStarter) {
        return 'Bij het bekijken van je budget en wensen zie ik een paar dingen die niet helemaal kloppen. Laten we samen kijken hoe we dit kunnen oplossen - er zijn altijd mogelijkheden.';
      }
      return 'Er is een discrepantie tussen je budget en de must-have wensen. Laten we kijken naar realistische opties.';

    case 'techniek':
      return 'Bij de technische keuzes zie ik een paar aandachtspunten die we moeten bespreken om problemen later te voorkomen.';

    case 'duurzaam':
      return 'Er zijn duurzaamheidskeuzes die mogelijk conflicteren met je budget of wensen. Laten we kijken naar wat wel kan.';

    case 'risico':
      return 'Er zijn significante risico\'s geïdentificeerd die we moeten adresseren. Laten we deze samen doornemen.';

    default:
      return 'Er zijn een paar aandachtspunten die we moeten bespreken voordat we verder gaan.';
  }
}
