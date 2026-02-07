// /lib/ai/autoTurn.ts
// Shared helpers for auto-turn queries and contract enforcement

import type { ArchitectEvent } from "./ArchitectTriggers";

const INFORMAL_REGEX = /\b(je|jij|jullie|jou)\b/gi;
const INFORMAL_POSSESSIVE_REGEX = /\bjouw\b/gi;
const EMOJI_REGEX = /[\u{1F300}-\u{1FAFF}\u{1F600}-\u{1F64F}\u{2600}-\u{27BF}]/gu;

function enforceSingleQuestion(content: string): string {
  const first = content.indexOf("?");
  if (first === -1) return content;
  return content.slice(0, first + 1).trim();
}

function sanitizeLanguage(content: string): string {
  let out = content.replace(EMOJI_REGEX, "");
  out = out.replace(INFORMAL_POSSESSIVE_REGEX, "uw");
  out = out.replace(INFORMAL_REGEX, "u");
  return out;
}

function hasStructureBlocks(content: string): boolean {
  const idxC = content.indexOf("Context:");
  const idxI = content.indexOf("Inzicht:");
  const idxA = content.indexOf("Actie:");
  return idxC !== -1 && idxI !== -1 && idxA !== -1 && idxC < idxI && idxI < idxA;
}

export function buildAutoTurnFallback(evt: ArchitectEvent): string {
  const prefix = "[AUTO_TRIGGER]";
  const baseContext = (() => {
    switch (evt.type) {
      case "chapter_entered":
        return `U bent bij hoofdstuk ${evt.chapter ?? "onbekend"}.`;
      case "budget_edited":
        return `Uw budget is aangepast naar ${evt.payload?.newBudget ?? "onbekend"}.`;
      case "room_added":
        return "Er is een ruimte toegevoegd.";
      case "risk_increased":
        return "Er is een nieuw risico gedetecteerd.";
      case "chapter_completed":
        return `Hoofdstuk ${evt.chapter ?? "onbekend"} is afgerond.`;
      case "wizard_idle":
        return "Er is even geen input geweest.";
      default:
        return "Er is een wijziging gedetecteerd.";
    }
  })();

  const baseInsight = (() => {
    switch (evt.type) {
      case "chapter_entered":
        return "Dit hoofdstuk is belangrijk voor de volgende stappen.";
      case "budget_edited":
        return "Dit kan invloed hebben op haalbaarheid en prioriteiten.";
      case "room_added":
        return "Meer ruimtes beinvloeden oppervlak, routing en kosten.";
      case "risk_increased":
        return "Dit kan comfort, kosten of haalbaarheid raken.";
      case "chapter_completed":
        return "Mooi, laten we gericht doorpakken naar de volgende stap.";
      case "wizard_idle":
        return "Een kleine stap nu helpt u verder.";
      default:
        return "Dit is relevant voor uw plan.";
    }
  })();

  const baseAction = (() => {
    switch (evt.type) {
      case "chapter_entered":
        return "Welke kernvraag heeft u in dit hoofdstuk?";
      case "budget_edited":
        return "Wilt u dit budget bevestigen of prioriteiten herzien?";
      case "room_added":
        return "Wat is het doel of de prioriteit van deze nieuwe ruimte?";
      case "risk_increased":
        return "Hoe wilt u met dit risico omgaan?";
      case "chapter_completed":
        return "Zal ik de volgende stap voor u openen?";
      case "wizard_idle":
        return "Zal ik u helpen met de volgende stap?";
      default:
        return "Wat wilt u als volgende stap?";
    }
  })();

  return `${prefix}\nContext: ${baseContext}\nInzicht: ${baseInsight}\nActie: ${baseAction}`;
}

export function enforceAutoTurnContract(evt: ArchitectEvent, content: string): string {
  let text = sanitizeLanguage(content || "");
  text = enforceSingleQuestion(text);
  if (!hasStructureBlocks(text)) {
    text = buildAutoTurnFallback(evt);
  }
  return text.trim();
}

export type AutoTurnContractCheck = {
  ok: boolean;
  sanitized: string;
  reasons: string[];
};

export function validateAutoTurnContract(evt: ArchitectEvent, content: string): AutoTurnContractCheck {
  const reasons: string[] = [];
  let sanitized = sanitizeLanguage(content);

  const hasEmoji = EMOJI_REGEX.test(content);
  if (hasEmoji) reasons.push("emoji_detected");

  const informal = INFORMAL_REGEX.test(content);
  if (informal) reasons.push("informal_language");

  const questionMarks = (sanitized.match(/\?/g) || []).length;
  if (questionMarks > 1) reasons.push("multiple_questions");
  sanitized = enforceSingleQuestion(sanitized);

  if (!hasStructureBlocks(sanitized)) {
    reasons.push("missing_structure");
  }

  return { ok: reasons.length === 0, sanitized: sanitized.trim(), reasons };
}

export function buildAutoTurnQuery(evt: ArchitectEvent): string {
  const prefix = "[AUTO_TRIGGER]";
  const ensureFormal = "Schrijf formeel Nederlands (u/uw), geen emoji's.";
  const structureHint = "Volg strikt: Context -> Inzicht -> Actie (exact 1 vraag).";

  if (evt.type === "chapter_entered") {
    const chapterName = evt.chapter ? `hoofdstuk ${evt.chapter}` : "het volgende hoofdstuk";
      return `${prefix}\n${ensureFormal}\n${structureHint}\nContext: U bent zojuist naar ${chapterName} genavigeerd. Dit hoofdstuk is belangrijk voor de vervolgstappen.\nInzicht: Licht kort toe waarom dit hoofdstuk cruciaal is en welke valkuilen vaak voorkomen.\nActie: Stel een vraag om gericht te starten.`;
  }

  switch (evt.type) {
    case "budget_edited":
      return `${prefix}\n${ensureFormal}\n${structureHint}\nContext: Het budget is aangepast (nieuw: ${evt.payload?.newBudget ?? "onbekend"}).\nInzicht: Geef een korte realiteitscheck versus wensen/ruimtes.\nActie: Stel een vraag om de haalbaarheid of prioriteiten te verduidelijken.`;
    case "room_added":
      return `${prefix}\n${ensureFormal}\n${structureHint}\nContext: Er is een nieuwe ruimte toegevoegd.\nInzicht: Benoem kort hoe deze ruimte het plan beinvloedt.\nActie: Stel een vraag over gebruik/prioriteit van deze ruimte.`;
    case "risk_increased":
      return `${prefix}\n${ensureFormal}\n${structureHint}\nContext: Er is een nieuw risico gedetecteerd.\nInzicht: Benoem het risico en waarom het relevant is.\nActie: Stel een vraag voor keuze of bevestiging van de aanpak.`;
    case "chapter_completed":
      return `${prefix}\n${ensureFormal}\n${structureHint}\nContext: Hoofdstuk ${evt.chapter} is afgerond.\nInzicht: Benoem kort de voortgang en eventuele aandachtspunten voor vervolg.\nActie: Stel een vervolgvraag of bevestiging voor de volgende stap.`;
    case "wizard_idle":
      return `${prefix}\n${ensureFormal}\n${structureHint}\nContext: De wizard is 30 seconden inactief.\nInzicht: Herinner kort aan de huidige stap/doel.\nActie: Stel een vraag of voorstel om verder te gaan.`;
    default:
      return `${prefix}\n${ensureFormal}\n${structureHint}\nContext: Er is een wijziging gedetecteerd (${evt.type}).\nInzicht: Geef kort aan waarom dit relevant is.\nActie: Stel een vraag.`;
  }
}

export function mapAutoTurnTriggerType(
  type: ArchitectEvent["type"]
): "chapter_start" | "chapter_completed" | "budget_change" | "room_added" | "risk_increased" | "wizard_idle" {
  switch (type) {
    case "chapter_entered":
      return "chapter_start";
    case "chapter_completed":
      return "chapter_completed";
    case "budget_edited":
      return "budget_change";
    case "room_added":
      return "room_added";
    case "wizard_idle":
      return "wizard_idle";
    case "risk_increased":
    default:
      return "risk_increased";
  }
}
