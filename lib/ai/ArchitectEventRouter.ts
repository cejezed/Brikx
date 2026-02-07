// ArchitectEventRouter v1.1 - route architect events to orchestrateTurn (auto-mode)

import type { ArchitectEvent } from "./ArchitectTriggers";
import { orchestrateTurn, type OrchestrateTurnInput } from "./orchestrateTurn";
import type { WizardState } from "@/types/project";
import type { FlushMeta } from "./ArchitectEventQueue";
import {
  buildAutoTurnFallback,
  buildAutoTurnQuery,
  enforceAutoTurnContract,
  mapAutoTurnTriggerType,
  validateAutoTurnContract,
} from "./autoTurn";

type RouterContext = {
  wizardState: WizardState;
  projectId: string;
  userId?: string;
  awaitingUserInput?: boolean;
  queueMeta?: FlushMeta;
};

const chapterCapMax = 3;
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

    const query = buildAutoTurnQuery(evt);
    const triggerType = mapAutoTurnTriggerType(evt.type);
    if (!query) {
      this.lastResponse = null;
      this.lastPatches = [];
      return false;
    }

    const baseInput: OrchestrateTurnInput = {
      query,
      wizardState: ctx.wizardState,
      projectId: ctx.projectId,
      userId: ctx.userId || "auto",
      currentChapter: evt.chapter,
      mode: "PREMIUM" as const,
      interactionMode: "auto",
      triggerType,
      triggerId: evt.id,
      skipAnticipation: false,
      skipConflictDetection: false,
    };

    const result = await orchestrateTurn(baseInput);

    let finalResponse = result?.response ?? "";
    let check = validateAutoTurnContract(evt, finalResponse);

    // Retry once with hard format guard if structure invalid
    if (!check.ok) {
      const correctionQuery = `${query}\n[FORMAT_GUARD]\nGebruik exact Context:/Inzicht:/Actie: en maximaal 1 vraag. Schrijf formeel Nederlands (u/uw), geen emoji's.`;
      const retryResult = await orchestrateTurn({ ...baseInput, query: correctionQuery });
      finalResponse = retryResult?.response ?? finalResponse;
      check = validateAutoTurnContract(evt, finalResponse);
    }

    const safeResponse = check.ok ? enforceAutoTurnContract(evt, finalResponse) : buildAutoTurnFallback(evt);

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
}
