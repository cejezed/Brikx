import { ChapterKey, type ChapterDataMap } from "@/types/project";

export type ChapterStatus = "empty" | "partial" | "complete";

type ChapterProgress = {
  status: ChapterStatus;
  completion: number; // 0-100
};

const REQUIRED_FIELDS: Record<ChapterKey, string[]> = {
  basis: ["projectType", "projectNaam", "locatie"],
  ruimtes: ["rooms"],
  wensen: ["wishes"],
  budget: ["budgetTotaal"],
  techniek: ["heatingAmbition", "ventilationAmbition", "pvAmbition"],
  duurzaam: ["energievoorziening", "energieLabel"],
  risico: ["risks"],
};

function hasValue(value: any): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  if (typeof value === "number") return true;
  if (typeof value === "boolean") return true;
  return !!value;
}

export function computeChapterProgress(
  chapter: ChapterKey,
  answers: Partial<ChapterDataMap>
): ChapterProgress {
  const required = REQUIRED_FIELDS[chapter] ?? [];
  if (required.length === 0) return { status: "empty", completion: 0 };

  const data = (answers as any)?.[chapter] || {};
  let filled = 0;

  for (const field of required) {
    const val = (data as any)[field];
    if (hasValue(val)) filled += 1;
  }

  const completion = Math.round((filled / required.length) * 100);
  const status: ChapterStatus =
    filled === 0
      ? "empty"
      : filled >= required.length
      ? "complete"
      : "partial";

  return { status, completion };
}

export function computeGlobalProgress(answers: Partial<ChapterDataMap>): number {
  const chapters: ChapterKey[] = ["basis", "ruimtes", "wensen", "budget", "techniek", "duurzaam", "risico"];
  const total = chapters.length;
  const sum = chapters.reduce((acc, ch) => acc + computeChapterProgress(ch, answers).completion, 0);
  return Math.max(0, Math.min(100, Math.round(sum / total)));
}
