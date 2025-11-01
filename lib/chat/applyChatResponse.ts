// lib/chat/applyChatResponse.ts
// Build v2.0: losjes gekoppelde types (geen harde afhankelijkheid van "@/types/chat").

import type { PatchEvent } from '@/lib/chat/patchTypes';

export type ApplyResult = { applied: boolean; reason?: string };

// Minimale, tolerante staat die we nodig hebben om patches te kunnen toepassen
export type WizardStateLite = {
  stateVersion?: number;
  triage?: Record<string, any> | undefined;
  chapterAnswers?: Record<string, any> | undefined;
};

// Minimale, tolerante chat-respons (stream/patch/navigate)
export type ChatResponseLite = {
  event?: 'metadata' | 'patch' | 'navigate' | 'stream' | 'error' | 'done';
  // Veel backends sturen "patch" of "delta" of root-level keys
  patch?: PatchEvent;
  delta?: PatchEvent;
  triage?: Record<string, any>;
  chapterAnswers?: Record<string, any>;
  navigate?: { chapter?: string } | { to?: string } | string;
  text?: string;
  message?: string;
};

type Appliers = {
  // Store-functies (optioneel): we vallen defensief terug als iets ontbreekt
  patchTriage?: (delta: Record<string, any>) => void;
  patchChapterAnswer?: (chapter: string, delta: Record<string, any>) => void;
  goToChapter?: (ch: string) => void;
  appendStream?: (t: string) => void;
};

/**
 * Past een (soepele) chat-respons toe op de wizard via aangeleverde appliers.
 * - Ondersteunt meerdere varianten van patches (patch/delta/root-level).
 * - Ondersteunt navigatie (navigate).
 * - Ondersteunt streaming-tekst (stream/text/message).
 */
export default function applyChatResponse(
  _ws: WizardStateLite | undefined,
  res: ChatResponseLite | undefined,
  appliers: Appliers
): ApplyResult {
  if (!res) return { applied: false, reason: 'no response' };

  let applied = false;

  // 1) PATCHES
  const patch: PatchEvent | undefined =
    (res.patch as PatchEvent) ||
    (res.delta as PatchEvent) ||
    (res.triage || res.chapterAnswers
      ? ({ triage: res.triage, chapterAnswers: res.chapterAnswers } as PatchEvent)
      : undefined);

  if (patch) {
    // target/payload
    const d: any = patch;

    if (d?.target === 'triage' && d?.payload && appliers.patchTriage) {
      appliers.patchTriage(d.payload);
      applied = true;
    }

    if (d?.target === 'chapterAnswers' && d?.payload && appliers.patchChapterAnswer) {
      for (const [chapter, delta] of Object.entries(d.payload as Record<string, any>)) {
        appliers.patchChapterAnswer(chapter, delta as Record<string, any>);
      }
      applied = true;
    }

    // root-level triage/answers
    if (d?.triage && appliers.patchTriage) {
      appliers.patchTriage(d.triage as Record<string, any>);
      applied = true;
    }
    if (d?.chapterAnswers && appliers.patchChapterAnswer) {
      for (const [chapter, delta] of Object.entries(d.chapterAnswers as Record<string, any>)) {
        appliers.patchChapterAnswer(chapter, delta as Record<string, any>);
      }
      applied = true;
    }
  }

  // 2) NAVIGATE
  const nav = res.navigate;
  if (nav && appliers.goToChapter) {
    let chapter: string | undefined;

    if (typeof nav === 'string') chapter = nav;
    else chapter = (nav as any)?.chapter ?? (nav as any)?.to;

    if (chapter && typeof chapter === 'string') {
      appliers.goToChapter(chapter);
      applied = true;
    }
  }

  // 3) STREAM / TEXT
  const t = typeof res.text === 'string' ? res.text : typeof res.message === 'string' ? res.message : '';
  if (t && appliers.appendStream) {
    appliers.appendStream(t);
    applied = true;
  }

  return applied ? { applied } : { applied, reason: 'no-op' };
}
