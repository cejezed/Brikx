// ArchitectEventRouter v1.1 - route architect events to orchestrateTurn (auto-mode)

import type { ArchitectEvent } from "./ArchitectTriggers";
import { orchestrateTurn } from "./orchestrateTurn";
import type { WizardState } from "@/types/project";

type RouterContext = {
  wizardState: WizardState;
  projectId: string;
  userId?: string;
};

const chapterCapMax = 3;

function enforceSingleQuestion(content: string): string {
  const first = content.indexOf("?");
  if (first === -1) return content;
  return content.slice(0, first + 1).trim();
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

    const result = await orchestrateTurn({
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
    });

    const safeResponse = result?.response ? enforceSingleQuestion(result.response) : null;
    this.lastResponse = safeResponse;
    // Guardrail: auto mode patches must be stripped
    this.lastPatches = [];
    return !!safeResponse;
  }

  private buildQuery(evt: ArchitectEvent): string {
    const prefix = "[AUTO_TRIGGER]";
    if (evt.type === "chapter_entered") {
      const chapterName = evt.chapter ? `hoofdstuk ${evt.chapter}` : "het volgende hoofdstuk";
      return `${prefix}\nU bent zojuist naar ${chapterName} genavigeerd.\nGeef een korte introductie en stel één duidelijke vraag om te starten.`;
    }

    switch (evt.type) {
      case "budget_edited":
        return `${prefix}\nBudget is aangepast.\nNieuw budget: ${evt.payload?.newBudget ?? "onbekend"}.\nControleer budget vs wensen en benoem risico's.`;
      case "room_added":
        return `${prefix}\nEr is een nieuwe ruimte toegevoegd. Vraag naar gebruik en prioriteiten.`;
      case "risk_increased":
        return `${prefix}\nEr is een nieuw risico gedetecteerd. Licht dit toe en vraag om keuze of bevestiging.`;
      case "chapter_completed":
        return `${prefix}\nHoofdstuk ${evt.chapter} is compleet. Stel één vervolgstap of bevestiging voor.`;
      case "wizard_idle":
        return `${prefix}\nDe wizard is even stil. Doe één voorstel of vraag om verder te gaan.`;
      default:
        return `${prefix}\nEr is een wijziging gedetecteerd (${evt.type}). Geef een korte reflectie en max 1 vraag.`;
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
