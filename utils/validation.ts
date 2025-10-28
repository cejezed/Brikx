// Eenvoudige validatie per hoofdstuk voor de Brikx Wizard
import type { ChapterKey, TriageData } from "@/types/wizard";
import type { Space, WishItem, TechnicalPrefs, SustainabilityPrefs } from "@/types/project";

export type ChapterStatus = Record<ChapterKey, boolean>;

function hasText(v: unknown) {
  return typeof v === "string" && v.trim().length > 0;
}

function basisComplete(triage: TriageData): boolean {
  return (
    !!triage &&
    ["projectType", "ervaring", "intent", "urgentie"].every((k) => !!(triage as any)[k]) &&
    Number.isFinite(triage.budget) &&
    triage.budget >= 0
  );
}

function ruimtesComplete(answers: Record<string, any>): boolean {
  const arr = (answers["ruimtes"] as Space[]) ?? [];
  if (arr.length < 1) return false;
  return arr.every((r) => hasText(r.type));
}

function wensenComplete(answers: Record<string, any>): boolean {
  const arr = (answers["wensen"] as WishItem[]) ?? [];
  return arr.length >= 1;
}

function budgetComplete(triage: TriageData): boolean {
  return Number.isFinite(triage.budget) && triage.budget > 0;
}

function techniekComplete(answers: Record<string, any>): boolean {
  const t = (answers["techniek"] as TechnicalPrefs | undefined) ?? undefined;
  if (!t) return false;
  return !!t.buildMethod && !!t.heating && !!t.ventilation;
}

function duurzaamheidComplete(answers: Record<string, any>): boolean {
  const d = (answers["duurzaamheid"] as SustainabilityPrefs | undefined) ?? undefined;
  if (!d) return false;
  return !!d.focus && !!d.materials && !!d.rainwater && !!d.greenRoof;
}

// Voor nu: risico & preview hoeven niet "compleet" te zijn om door te kunnen
function risicoComplete(): boolean { return true; }
function previewComplete(): boolean { return true; }

export function computeChapterStatus(args: {
  flow: ChapterKey[];
  triage: TriageData;
  answers: Record<string, any>;
}): ChapterStatus {
  const { triage, answers, flow } = args;

  const statusAll: Record<ChapterKey, boolean> = {
    basis: basisComplete(triage),
    ruimtes: ruimtesComplete(answers),
    wensen: wensenComplete(answers),
    budget: budgetComplete(triage),
    techniek: techniekComplete(answers),
    duurzaamheid: duurzaamheidComplete(answers),
    risico: risicoComplete(),
    preview: previewComplete(),
  };

  const filtered = {} as ChapterStatus;
  flow.forEach((k) => (filtered[k] = statusAll[k]));
  return filtered;
}
