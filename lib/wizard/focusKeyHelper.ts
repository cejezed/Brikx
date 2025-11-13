// lib/wizard/focusKeyHelper.ts
// Helper to create type-safe focus keys with wildcard pattern support

import type { ChapterKey } from '@/types/project';

/**
 * Create a focus key string safely
 * 
 * @example
 * const key = createFocusKey('ruimtes', 'rooms[0].m2');
 * // Returns: "ruimtes:rooms[0].m2"
 */
export function createFocusKey(
  chapter: ChapterKey,
  fieldId: string
): `${ChapterKey}:${string}` {
  return `${chapter}:${fieldId}` as const;
}

/**
 * Parse a focus key into chapter and fieldId
 * 
 * @example
 * const { chapter, fieldId } = parseFocusKey('ruimtes:rooms[0].m2');
 * // chapter = 'ruimtes'
 * // fieldId = 'rooms[0].m2'
 */
export function parseFocusKey(key: string | null) {
  if (!key) return null;
  
  const [chapter, ...rest] = key.split(':');
  const fieldId = rest.join(':'); // In case fieldId contains ':'
  
  return {
    chapter: chapter as ChapterKey,
    fieldId,
  };
}

/**
 * Check if focus is on a specific field (with wildcard pattern support)
 * 
 * Supports:
 * - Exact match: 'rooms[0].m2' matches 'rooms[0].m2'
 * - Wildcard pattern: 'room.*.m2' matches 'rooms[0].m2', 'rooms[1].m2', etc.
 * 
 * @example
 * isFocusedOn('ruimtes:rooms[0].m2', 'ruimtes', 'room.*.m2') → true
 * isFocusedOn('ruimtes:rooms[0].m2', 'ruimtes', 'rooms[0].m2') → true
 * isFocusedOn('ruimtes:rooms[0].m2', 'ruimtes', 'rooms[1].m2') → false
 */
export function isFocusedOn(
  currentFocusKey: string | null,
  chapter: ChapterKey,
  fieldPattern: string
): boolean {
  if (!currentFocusKey) return false;

  const parsed = parseFocusKey(currentFocusKey);
  if (!parsed) return false;

  // Chapter must match
  if (parsed.chapter !== chapter) return false;

  // Exact match (fast path)
  if (parsed.fieldId === fieldPattern) return true;

  // Wildcard match: "room.*.m2" → matches "rooms[0].m2", "rooms[1].m2", etc.
  const regexPattern = fieldPattern
    .replace(/\./g, '\\.')        // Escape dots: . → \.
    .replace(/\[/g, '\\[')        // Escape brackets: [ → \[
    .replace(/\]/g, '\\]')        // Escape brackets: ] → \]
    .replace(/\*/g, '[^.]+');     // Wildcard: * → [^.]+ (any non-dot chars)

  return new RegExp(`^${regexPattern}$`).test(parsed.fieldId);
}