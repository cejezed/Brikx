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

const CHAPTER_WEIGHTS: Record<ChapterKey, number> = {
  basis: 20,
  ruimtes: 20,
  wensen: 15,
  budget: 20,
  techniek: 10,
  duurzaam: 10,
  risico: 5,
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
  // Special handling for ruimtes: minimaal 2 benoemde ruimtes voor "complete"
  if (chapter === "ruimtes") {
    const data = (answers as any)?.ruimtes;
    const rooms = Array.isArray(data?.rooms) ? data.rooms : [];
    const namedCount = rooms.filter((r: any) => r?.name && String(r.name).trim().length > 0).length;
    if (rooms.length === 0) return { status: "empty", completion: 0 };
    if (namedCount >= 2) return { status: "complete", completion: 100 };
    const completion = Math.min(80, Math.max(20, Math.round((namedCount / 2) * 80))); // partial boost
    return { status: "partial", completion };
  }

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
  const totalWeight = chapters.reduce((acc, ch) => acc + (CHAPTER_WEIGHTS[ch] ?? 0), 0);

  const weightedSum = chapters.reduce((acc, ch) => {
    const comp = computeChapterProgress(ch, answers).completion;
    const w = CHAPTER_WEIGHTS[ch] ?? 0;
    return acc + (comp * w) / 100;
  }, 0);

  const pct = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0;
  return Math.max(0, Math.min(100, Math.round(pct)));
}
