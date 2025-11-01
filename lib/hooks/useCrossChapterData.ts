// lib/hooks/useCrossChapterData.ts
// Build v2.0 — cross-chapter helpers zonder setChapterAnswers (delta-only via patchChapterAnswer)

import { useMemo, useCallback } from "react";
import { useWizardState } from "@/lib/stores/useWizardState";
import type { ChapterKey } from "@/types/wizard";

/**
 * Kleine util om veilig geneste paden te lezen uit een object.
 * Voorbeeld: getByPath(obj, "wensen.items.0.label")
 */
function getByPath<T = any>(obj: any, path: string | string[], fallback?: T): T {
  if (!obj) return fallback as T;
  const parts = Array.isArray(path) ? path : String(path).split(".");
  let cur: any = obj;
  for (const k of parts) {
    if (cur == null) return fallback as T;
    cur = cur[k];
  }
  return (cur === undefined ? (fallback as T) : (cur as T));
}

/**
 * Haal subset van een object op.
 */
function pick<T extends Record<string, any>>(obj: T | undefined, keys: string[]): Partial<T> {
  const out: Partial<T> = {};
  if (!obj) return out;
  for (const k of keys) {
    if (k in obj) (out as any)[k] = (obj as any)[k];
  }
  return out;
}

/**
 * Cross-chapter hook
 * - Leest triage en chapterAnswers defensief.
 * - Biedt helpers om waardes op te halen en meerdere hoofdstukken in één keer te patchen.
 */
export function useCrossChapterData() {
  const chapterAnswers = useWizardState((s) => s.chapterAnswers) as Record<string, any> | undefined;
  const triage = useWizardState((s) => s.triage);
  const patchChapterAnswer = useWizardState((s: any) => s.patchChapterAnswer);

  // ===== MEMOIZED GETTERS =====

  /** Hele chapter payload (of {} als niet gezet). */
  const getChapter = useCallback(
    <T = Record<string, any>>(chapter: ChapterKey): T =>
      ((chapterAnswers?.[chapter] as T) ?? ({} as T)),
    [chapterAnswers]
  );

  /** Specifiek veld uit een chapter via pad-string. */
  const get = useCallback(
    <T = any>(chapter: ChapterKey, path: string, fallback?: T): T =>
      getByPath<T>(getChapter<Record<string, any>>(chapter), path, fallback),
    [getChapter]
  );

  /** Check of een chapter een niet-lege waarde heeft op pad. */
  const has = useCallback(
    (chapter: ChapterKey, path: string): boolean => {
      const v = get<any>(chapter, path, undefined);
      if (Array.isArray(v)) return v.length > 0;
      if (v && typeof v === "object") return Object.keys(v).length > 0;
      return v !== undefined && v !== null && v !== "";
    },
    [get]
  );

  /** Meerdere sleutels uit één chapter ophalen. */
  const pickFromChapter = useCallback(
    <T extends Record<string, any>>(chapter: ChapterKey, keys: string[]): Partial<T> =>
      pick<T>(getChapter<T>(chapter), keys),
    [getChapter]
  );

  // ===== WRITERS (delta-only) =====

  /**
   * Merge delta's in meerdere chapters.
   * Voorbeeld:
   *   mergeIntoChapters({
   *     wensen: { items: [...] },
   *     ruimtes: { list: [...] },
   *     techniek: { heating: "warmtepomp" }
   *   })
   */
  const mergeIntoChapters = useCallback(
    (deltas: Partial<Record<ChapterKey, Record<string, any>>> | Record<string, any>) => {
      if (!deltas || typeof deltas !== "object") return;

      const entries = Object.entries(deltas) as Array<[ChapterKey, Record<string, any>]>;
      for (const [chapter, delta] of entries) {
        if (delta && typeof delta === "object") {
          // v2.0: delta-patch per hoofdstuk
          patchChapterAnswer?.(chapter, delta);
        }
      }
    },
    [patchChapterAnswer]
  );

  return useMemo(
    () => ({
      triage,
      chapterAnswers: chapterAnswers ?? ({} as Record<string, any>),
      getChapter,
      get,
      has,
      pickFromChapter,
      mergeIntoChapters,
    }),
    [triage, chapterAnswers, getChapter, get, has, pickFromChapter, mergeIntoChapters]
  );
}

export default useCrossChapterData;
