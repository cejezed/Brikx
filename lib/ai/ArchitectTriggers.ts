// ArchitectTriggers v1.0
// Purpose: pure, synchronous detection of meaningful wizard changes (user-originated only)

import type { WizardState, ChapterKey, BudgetData, RuimtesData } from "@/types/project";
import { groupMissingByChapter } from "@/lib/ai/missing";

export type ArchitectEventType =
  | "chapter_entered"
  | "chapter_completed"
  | "room_added"
  | "budget_edited"
  | "risk_increased"
  | "wizard_idle";

export interface ArchitectEvent {
  id: string;
  type: ArchitectEventType;
  source: "user_input" | "wizard_navigation" | "system_analysis";
  projectId?: string;
  userId?: string;
  timestamp: string;
  priority: "low" | "medium" | "high";
  chapter?: ChapterKey;
  fieldPath?: string;
  payload?: Record<string, any>;
}

export interface TriggerContext {
  mode?: "user" | "auto";
  lastChangeSource?: "user" | "ai" | "system";
  projectId?: string;
  userId?: string;
  isStreaming?: boolean;
}

const severityRank: Record<string, number> = { info: 1, warning: 2, blocking: 3 };

function isChapterComplete(state: WizardState, chapter: ChapterKey): boolean {
  const grouped = groupMissingByChapter(state);
  return !grouped[chapter] || grouped[chapter].length === 0;
}

function id(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `evt_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function detectArchitectEvents(
  prev: WizardState,
  next: WizardState,
  ctx?: TriggerContext
): ArchitectEvent[] {
  // Anti-loop: alleen user-originated
  if (ctx?.mode === "auto" || ctx?.lastChangeSource && ctx.lastChangeSource !== "user") {
    return [];
  }

  const events: ArchitectEvent[] = [];
  const now = new Date().toISOString();

  // Chapter entered
  if (prev.currentChapter !== next.currentChapter && next.currentChapter) {
    events.push({
      id: id(),
      type: "chapter_entered",
      source: "wizard_navigation",
      projectId: ctx?.projectId,
      userId: ctx?.userId,
      timestamp: now,
      priority: "low",
      chapter: next.currentChapter as ChapterKey,
    });
  }

  // Chapter completed (required fields basis) - compare per chapter
  const chapters: ChapterKey[] = ["basis", "ruimtes", "wensen", "budget", "techniek", "duurzaam", "risico"];
  for (const ch of chapters) {
    const wasComplete = isChapterComplete(prev, ch);
    const isNowComplete = isChapterComplete(next, ch);
    if (!wasComplete && isNowComplete) {
      events.push({
        id: id(),
        type: "chapter_completed",
        source: "user_input",
        projectId: ctx?.projectId,
        userId: ctx?.userId,
        timestamp: now,
        priority: "medium",
        chapter: ch,
      });
    }
  }

  // Budget edited >5% or > 5000
  const prevBudget = (prev.chapterAnswers?.budget as BudgetData | undefined)?.budgetTotaal;
  const nextBudget = (next.chapterAnswers?.budget as BudgetData | undefined)?.budgetTotaal;
  if (typeof nextBudget === "number") {
    const hasPrev = typeof prevBudget === "number";
    const diff = hasPrev ? Math.abs(nextBudget - (prevBudget as number)) : nextBudget;
    const pct = hasPrev && prevBudget ? diff / Math.max(1, Math.abs(prevBudget)) : 1;
    if ((hasPrev && (pct > 0.05 || diff > 5000)) || (!hasPrev && nextBudget > 0)) {
      events.push({
        id: id(),
        type: "budget_edited",
        source: "user_input",
        projectId: ctx?.projectId,
        userId: ctx?.userId,
        timestamp: now,
        priority: "medium",
        chapter: "budget",
        payload: { newBudget: nextBudget, previousBudget: prevBudget },
      });
    }
  }

  // Room added (length increase)
  const prevRooms = ((prev.chapterAnswers?.ruimtes as RuimtesData | undefined)?.rooms ?? []) as any[];
  const nextRooms = ((next.chapterAnswers?.ruimtes as RuimtesData | undefined)?.rooms ?? []) as any[];
  if (nextRooms.length > prevRooms.length) {
    events.push({
      id: id(),
      type: "room_added",
      source: "user_input",
      projectId: ctx?.projectId,
      userId: ctx?.userId,
      timestamp: now,
      priority: "low",
      chapter: "ruimtes",
      payload: { roomsCount: nextRooms.length },
    });
  }

  // Risk increased (normalized conflicts)
  const prevConflicts = Array.isArray((prev as any).conflicts) ? (prev as any).conflicts : [];
  const nextConflicts = Array.isArray((next as any).conflicts) ? (next as any).conflicts : [];
  const prevMax = Math.max(0, ...prevConflicts.map((c: any) => severityRank[c?.severity] || 0));
  const nextMax = Math.max(0, ...nextConflicts.map((c: any) => severityRank[c?.severity] || 0));
  if (nextConflicts.length > prevConflicts.length || nextMax > prevMax) {
    events.push({
      id: id(),
      type: "risk_increased",
      source: "system_analysis",
      projectId: ctx?.projectId,
      userId: ctx?.userId,
      timestamp: now,
      priority: nextMax >= 3 ? "high" : "medium",
    });
  }

  return events;
}
