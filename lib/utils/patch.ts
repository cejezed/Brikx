// lib/utils/patch.ts
// Type-safe patch transformation utilities for v3.0

import type { PatchDelta, PatchEvent, ChapterKey, ChapterDataMap } from "@/types/project";

/**
 * Normalize patch delta operations
 * Converts 'add' to 'append' (v3.0 only uses: set | append | remove)
 */
export function normalizePatchDelta(delta: PatchDelta): PatchDelta {
  if (delta.operation === "add") {
    console.warn("[patch] Normalizing 'add' operation to 'append'");
    return {
      ...delta,
      operation: "append",
    };
  }
  return delta;
}

/**
 * Normalize patch event (chapter + delta)
 * Ensures all patch operations are valid (set | append | remove)
 */
export function normalizePatchEvent(event: PatchEvent): PatchEvent {
  return {
    chapter: event.chapter,
    delta: normalizePatchDelta(event.delta),
  };
}

/**
 * Transform data by applying a delta
 * Handles: set (scalar), append (array), remove (array)
 */
export function transformWithDelta<T extends Record<string, any>>(
  prev: T,
  delta: PatchDelta
): T {
  const { path, operation, value } = delta;

  switch (operation) {
    case "set": {
      // ✅ Set scalar value
      return {
        ...prev,
        [path]: value,
      };
    }

    case "append": {
      // ✅ Append to array
      const array = prev[path] ?? [];
      if (!Array.isArray(array)) {
        console.warn(
          `[patch] Cannot append to non-array at ${path}, creating new array`
        );
        return {
          ...prev,
          [path]: [value],
        };
      }
      return {
        ...prev,
        [path]: [...array, value],
      };
    }

    case "remove": {
      // ✅ Remove by index
      const array = prev[path] ?? [];
      if (!Array.isArray(array)) {
        console.warn(`[patch] Cannot remove from non-array at ${path}`);
        return prev;
      }
      if (typeof value?.index !== "number") {
        console.warn(
          `[patch] Remove operation requires { index: number }, got:`,
          value
        );
        return prev;
      }
      return {
        ...prev,
        [path]: array.filter((_, i) => i !== value.index),
      };
    }

    default: {
      console.error(`[patch] Unknown operation: ${(operation as any)}`);
      return prev;
    }
  }
}

/**
 * Apply a patch delta to chapter data
 * Helper for components that need to update specific chapters
 */
export function applyDeltaToChapter<K extends ChapterKey>(
  chapter: K,
  prev: ChapterDataMap[K],
  delta: PatchDelta
): ChapterDataMap[K] {
  return transformWithDelta(prev as any, delta) as ChapterDataMap[K];
}