// components/wizard/PatchBridge.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useWizardState } from '@/lib/stores/useWizardState';
import { useUiStore } from '@/lib/stores/useUiStore';
import type { PatchEvent } from '@/lib/chat/patchTypes';

const log = (...a: any[]) => {
  if (process.env.NODE_ENV !== 'production') console.debug('[PatchBridge]', ...a);
};

export default function PatchBridge() {
  const localBusy = useRef(false);

  useEffect(() => {
    const applyFlexible = (patch: PatchEvent) => {
      const store = useWizardState.getState() as any;
      const ui = useUiStore.getState() as any;

      const patchTriage = store?.patchTriage;
      const patchChapterAnswer = store?.patchChapterAnswer;
      const goToChapter = store?.goToChapter;
      const setBudget = store?.setBudget;
      const applyServerPatch = store?.applyServerPatch; // optioneel, als aanwezig
      const setFocusedField = ui?.setFocusedField;

      // 0) Speciale keys bovenop (bv. budget)
      if (Object.prototype.hasOwnProperty.call(patch as any, 'budget') && typeof setBudget === 'function') {
        const nextBudget = (patch as any).budget ?? null;
        log('setBudget', nextBudget);
        setBudget(nextBudget);
      }

      // 1) Als store een native applicator heeft, eerst die proberen
      if (typeof applyServerPatch === 'function' && (patch as any)?.chapter && (patch as any)?.delta) {
        log('applyServerPatch', patch);
        try { applyServerPatch(patch); return; } catch (e) { console.warn('applyServerPatch failed, fallback', e); }
      }

      // 2) Target/payload patroon
      const d: any = patch;
      if (d?.target === 'triage' && d?.payload && typeof patchTriage === 'function') {
        patchTriage(d.payload);
      } else if (d?.target === 'chapterAnswers' && d?.payload && typeof patchChapterAnswer === 'function') {
        for (const [chapter, delta] of Object.entries(d.payload as Record<string, any>)) {
          patchChapterAnswer(chapter, delta);
        }
      } else if (d?.target === 'ui' && d?.payload && typeof ui?.setUi === 'function') {
        ui.setUi(d.payload);
      }

      // 3) Root-level kortsluiting
      if (d?.triage && typeof patchTriage === 'function') {
        patchTriage(d.triage);
      }
      if (d?.chapterAnswers && typeof patchChapterAnswer === 'function') {
        for (const [chapter, delta] of Object.entries(d.chapterAnswers as Record<string, any>)) {
          patchChapterAnswer(chapter, delta);
        }
      }

      // 4) Navigatie/focus (indien aanwezig in patch)
      if (typeof d?.navigate === 'string' && typeof goToChapter === 'function') {
        goToChapter(d.navigate);
      }
      if (typeof d?.focus === 'string' && typeof setFocusedField === 'function') {
        setFocusedField(d.focus);
      }
    };

    const onPatch = (e: Event) => {
      const { patch, source } = (e as CustomEvent).detail || {};
      if (source !== 'chat') return;
      if (!patch || typeof patch !== 'object') return;

      if (localBusy.current) return;
      localBusy.current = true;

      try {
        applyFlexible(patch as PatchEvent);
      } catch (err) {
        console.error('[PatchBridge] Error applying patch:', err);
      } finally {
        localBusy.current = false;
      }
    };

    const onFocus = (e: Event) => {
      const { target, source } = (e as CustomEvent).detail || {};
      if (source !== 'chat') return;
      if (!target || typeof target !== 'string') return;

      const { goToChapter } = useWizardState.getState() as any;
      const { setFocusedField } = useUiStore.getState() as any;

      // tab-aliasen
      if (target === 'tab:risico') {
        log('goToChapter: risico');
        return typeof goToChapter === 'function' && goToChapter('risico');
      }
      if (target === 'tab:preview') {
        log('goToChapter: preview');
        return typeof goToChapter === 'function' && goToChapter('preview');
      }

      // chapter:fieldId
      if (target.includes(':') && typeof setFocusedField === 'function') {
        log('setFocusedField', target);
        setFocusedField(target as `${string}:${string}`);
      } else {
        log('setFocusedField - invalid format, skipping:', target);
      }
    };

    const onHandoff = (e: Event) => {
      const { source } = (e as CustomEvent).detail || {};
      if (source !== 'chat') return;
      log('handoff event received (no handler implemented yet)');
      // Hier eventueel je HumanHandoffModal triggeren
    };

    window.addEventListener('wizard:patch', onPatch as EventListener);
    window.addEventListener('ui:focus', onFocus as EventListener);
    window.addEventListener('ui:handoff', onHandoff as EventListener);
    log('mounted');

    return () => {
      window.removeEventListener('wizard:patch', onPatch as EventListener);
      window.removeEventListener('ui:focus', onFocus as EventListener);
      window.removeEventListener('ui:handoff', onHandoff as EventListener);
      log('unmounted');
    };
  }, []);

  return null;
}
