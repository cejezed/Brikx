// ArchitectEventRouter v1.1 - route architect events to orchestrateTurn (auto-mode)

import type { ArchitectEvent } from "./ArchitectTriggers";
import { orchestrateTurn } from "./orchestrateTurn";
import type { WizardState } from "@/types/project";
import type { FlushMeta } from "./ArchitectEventQueue";

type RouterContext = {
  wizardState: WizardState;
  projectId: string;
  userId?: string;
  awaitingUserInput?: boolean;
  queueMeta?: FlushMeta;
};

const chapterCapMax = 3;

function enforceSingleQuestion(content: string): string {
  const first = content.indexOf("?");
  if (first === -1) return content;
  return content.slice(0, first + 1).trim();
}

const INFORMAL_REGEX = /\b(je|jij|jullie|jou)\b/gi;
const INFORMAL_POSSESSIVE_REGEX = /\bjouw\b/gi;
const EMOJI_REGEX = /[\u{1F300}-\u{1FAFF}\u{1F600}-\u{1F64F}\u{2600}-\u{27BF}]/gu;

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

function buildFallback(evt: ArchitectEvent): string {
  const prefix = "[AUTO_TRIGGER]";
  const ensureFormal = "Schrijf formeel Nederlands (u/uw), geen emoji's.";
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
        return "Meer ruimtes beïnvloeden oppervlak, routing en kosten.";
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

function enforceAutoTurnContract(evt: ArchitectEvent, content: string): string {
  let text = sanitizeLanguage(content || "");
  text = enforceSingleQuestion(text);
  if (!hasStructureBlocks(text)) {
    text = buildFallback(evt);
  }
  return text.trim();
}

type ContractCheck = {
  ok: boolean;
  sanitized: string;
  reasons: string[];
};

function validateContract(evt: ArchitectEvent, content: string): ContractCheck {
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

  // structure check on original ensures order; sanitized preserves labels
  const ok = reasons.length === 0;
  return { ok, sanitized: sanitized.trim(), reasons };
}

export class ArchitectEventRouter {
  public lastResponse: string | null = null;
  public lastPatches: any[] = [];
  private chapterCapPerChapter = new Map<string, number>();

  constructor(private readonly projectId: string) {}

  reset() {
    this.lastResponse = null;
    this.lastPatches = [];
    this.chapterCapPerChapter.clear();
  }

  async processEvent(evt: ArchitectEvent, ctx: RouterContext): Promise<boolean> {
    const chapterKey = evt.chapter || "global";
    const used = this.chapterCapPerChapter.get(chapterKey) ?? 0;
    if (used >= chapterCapMax) {
      return false;
    }
    this.chapterCapPerChapter.set(chapterKey, used + 1);

    const query = this.buildQuery(evt);
    const triggerType = this.mapTriggerType(evt.type);
    if (!query) {
      this.lastResponse = null;
      this.lastPatches = [];
      return false;
    }

    const baseInput = {
      query,
      wizardState: ctx.wizardState,
      projectId: ctx.projectId,
      userId: ctx.userId || "auto",
      currentChapter: evt.chapter,
      mode: "PREMIUM",
      interactionMode: "auto",
      triggerType,
      triggerId: evt.id,
      skipAnticipation: false,
      skipConflictDetection: false,
    };

    const result = await orchestrateTurn(baseInput);

    let finalResponse = result?.response ?? "";
    let check = validateContract(evt, finalResponse);

    // Retry once with hard format guard if structure invalid
    if (!check.ok) {
      const correctionQuery = `${query}\n[FORMAT_GUARD]\nGebruik exact Context:/Inzicht:/Actie: en maximaal 1 vraag. Schrijf formeel Nederlands (u/uw), geen emoji's.`;
      const retryResult = await orchestrateTurn({ ...baseInput, query: correctionQuery });
      finalResponse = retryResult?.response ?? finalResponse;
      check = validateContract(evt, finalResponse);
    }

    const safeResponse = check.ok ? enforceAutoTurnContract(evt, finalResponse) : buildFallback(evt);

    this.lastResponse = safeResponse;
    // Guardrail: auto mode patches must be stripped
    this.lastPatches = [];

    const telemetry = {
      interactionMode: "auto",
      triggerType,
      triggerId: evt.id,
      chapter: evt.chapter ?? null,
      projectId: ctx.projectId,
      queueEnqueueTs: ctx.queueMeta?.enqueueTs ?? null,
      queueFlushTs: ctx.queueMeta?.flushTs ?? Date.now(),
      awaitingUserInput: ctx.awaitingUserInput ?? false,
      contractOk: check.ok,
      contractReasons: check.reasons ?? [],
    };
    console.log("[ArchitectEventRouter] auto-turn telemetry", telemetry);
    return !!safeResponse;
  }

  private buildQuery(evt: ArchitectEvent): string {
    const prefix = "[AUTO_TRIGGER]";
    const ensureFormal = "Schrijf formeel Nederlands (u/uw), geen emoji's.";
    const structureHint = "Volg strikt: Context -> Inzicht -> Actie (exact 1 vraag).";

    if (evt.type === "chapter_entered") {
      const chapterName = evt.chapter ? `hoofdstuk ${evt.chapter}` : "het volgende hoofdstuk";
      return `${prefix}\n${ensureFormal}\n${structureHint}\nContext: U bent zojuist naar ${chapterName} genavigeerd. Dit hoofdstuk is belangrijk voor de vervolgstappen.\nInzicht: Licht kort toe waarom dit hoofdstuk cruciaal is en welke valkuilen vaak voorkomen.\nActie: Stel één vraag om gericht te starten.`;
    }

    switch (evt.type) {
      case "budget_edited":
        return `${prefix}\n${ensureFormal}\n${structureHint}\nContext: Het budget is aangepast (nieuw: ${evt.payload?.newBudget ?? "onbekend"}).\nInzicht: Geef een korte realiteitscheck versus wensen/ruimtes.\nActie: Stel één vraag om de haalbaarheid of prioriteiten te verduidelijken.`;
      case "room_added":
        return `${prefix}\n${ensureFormal}\n${structureHint}\nContext: Er is een nieuwe ruimte toegevoegd.\nInzicht: Benoem kort hoe deze ruimte het plan beïnvloedt.\nActie: Stel één vraag over gebruik/prioriteit van deze ruimte.`;
      case "risk_increased":
        return `${prefix}\n${ensureFormal}\n${structureHint}\nContext: Er is een nieuw risico gedetecteerd.\nInzicht: Benoem het risico en waarom het relevant is.\nActie: Stel één vraag voor keuze of bevestiging van de aanpak.`;
      case "chapter_completed":
        return `${prefix}\n${ensureFormal}\n${structureHint}\nContext: Hoofdstuk ${evt.chapter} is afgerond.\nInzicht: Benoem kort de voortgang en eventuele aandachtspunten voor vervolg.\nActie: Stel één vervolgvraag of bevestiging voor de volgende stap.`;
      case "wizard_idle":
        return `${prefix}\n${ensureFormal}\n${structureHint}\nContext: De wizard is 30 seconden inactief.\nInzicht: Herinner kort aan de huidige stap/doel.\nActie: Stel één vraag of voorstel om verder te gaan.`;
      default:
        return `${prefix}\n${ensureFormal}\n${structureHint}\nContext: Er is een wijziging gedetecteerd (${evt.type}).\nInzicht: Geef kort aan waarom dit relevant is.\nActie: Stel één vraag.`;
    }
  }

  private mapTriggerType(
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
}
