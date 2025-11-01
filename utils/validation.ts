// /utils/validation.ts
// Type-safe validators voor triage (Build v2.0)

import type { TriageData } from "@/types/chat";

/** Budget is een geldig getal en ≥ 0 */
export function isBudgetValid(triage?: TriageData): boolean {
  if (!triage) return false;
  const raw = triage.budget;
  const isNum = typeof raw === "number" && Number.isFinite(raw);
  return isNum && (raw as number) >= 0;
}

/** Haal canonieke & legacy sleutels op zonder TS-gezeur */
function readErvaring(triage?: TriageData): string | undefined {
  return (triage as any)?.ervaring as string | undefined;
}
function readUrgentie(triage?: TriageData): string | undefined {
  // Ondersteun legacy 'urgency' als alias
  return (triage as any)?.urgentie ?? (triage as any)?.urgency;
}

/** Minimale essentials aanwezig (zonder budget-waarde te valideren) */
export function isTriageEssentialsFilled(triage?: TriageData): boolean {
  if (!triage) return false;
  const ervaring = readErvaring(triage);
  const urgentie = readUrgentie(triage);
  const hasIntent = Array.isArray(triage.intent) ? triage.intent.length > 0 : !!triage.intent;
  return Boolean(triage.projectType && ervaring && urgentie && hasIntent);
}

/** Complete triage volgens Build v2.0 (essentials + budget geldig) */
export function isTriageComplete(triage?: TriageData): boolean {
  if (!isTriageEssentialsFilled(triage)) return false;
  return isBudgetValid(triage);
}

/** Welke essentials ontbreken (handig voor UI badges) */
export function getMissingTriageEssentials(triage?: TriageData): string[] {
  const missing: string[] = [];
  if (!triage?.projectType) missing.push("projectType");
  if (!readErvaring(triage)) missing.push("ervaring");
  if (!readUrgentie(triage)) missing.push("urgentie");
  const hasIntent = Array.isArray(triage?.intent)
    ? (triage?.intent?.length ?? 0) > 0
    : !!triage?.intent;
  if (!hasIntent) missing.push("intent");
  if (!isBudgetValid(triage)) missing.push("budget");
  return missing;
}
