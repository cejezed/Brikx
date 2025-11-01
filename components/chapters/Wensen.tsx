'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import FocusTarget from '@/components/wizard/FocusTarget';
import { useWizardState } from '@/lib/stores/useWizardState';
import { useUiStore } from '@/lib/stores/useUiStore';
import type { ChapterKey } from "@/types/wizard";

import type { WishItem, WishPriority } from '@/types/project';

const CHAPTER_KEY: ChapterKey = 'wensen';

// 🔸 1. Uitgebreide prioriteitenlijst incl. "Absoluut niet"
const PRIORITIES: { value: WishPriority; label: string; hint: string }[] = [
  { value: 'unknown', label: 'Weet ik nog niet / n.v.t.', hint: 'Later prioriteren is prima.' },
  { value: 'must', label: 'Must-have', hint: 'Moet erin, kern voor succes.' },
  { value: 'nice', label: 'Nice-to-have', hint: 'Gewenst, maar niet cruciaal.' },
  { value: 'future', label: 'Toekomst-optie', hint: 'Kan in fase 2 / later.' },
];

export default function Wensen() {
  const uid = useId();
  const { setCurrentChapter, focusedField, setFocusedField } = useUiStore();

  // 🔹 Synchroniseer hoofdstuk bij laden
  useEffect(() => setCurrentChapter?.('wensen'), [setCurrentChapter]);

  // 🔹 Koppeling aan wizardstate
  // @ts-ignore - accepts dynamic state updates at runtime
  const getState = useWizardState.getState;
  const answers = useWizardState((s) => {
    // @ts-ignore - chapterAnswers indexing
    return s.chapterAnswers[CHAPTER_KEY] as WishItem[] | undefined;
  });
  const setAnswer = useWizardState((s) => s.setChapterAnswer);

  const [wishes, setWishes] = useState<WishItem[]>(Array.isArray(answers) ? answers : []);

  useEffect(() => {
    if (Array.isArray(answers)) setWishes(answers);
  }, [answers]);

  // 🔸 Betrouwbare commit via store
  const commit = (next: WishItem[]) => {
    setWishes(next);
    setAnswer(CHAPTER_KEY, next);
  };

  // 🔸 3. "Spotlight-lus" bij toevoegen
  const addWish = () => {
    const id = `${uid}-${Date.now()}`;
    // @ts-ignore - chapterAnswers indexing
    const existing = getState().chapterAnswers[CHAPTER_KEY] ?? [];
    const next = [
      ...existing,
      { id, label: '', confirmed: false, priority: 'unknown' as WishPriority },
    ];
    commit(next);
    // focus direct op nieuwe wens
    setTimeout(() => setFocusedField?.({ chapter: 'wensen', fieldId: `label_${id}` } as any), 50);
  };

  // 🔸 5. State-management zonder stale state
  const updateWish = (idx: number, patch: Partial<WishItem>) => {
    // @ts-ignore - chapterAnswers indexing
    const current = getState().chapterAnswers[CHAPTER_KEY] as WishItem[] || [];
    const next = current.map((w, i) => (i === idx ? { ...w, ...patch } : w));
    commit(next);
  };

  const removeWish = (idx: number) => {
    // @ts-ignore - chapterAnswers indexing
    const current = getState().chapterAnswers[CHAPTER_KEY] as WishItem[] || [];
    const next = current.filter((_, i) => i !== idx);
    commit(next);
  };

  const currentHint = (prio: WishPriority | undefined) =>
    PRIORITIES.find((p) => p.value === (prio ?? 'unknown'))?.hint ?? '';

  // 🔹 Render
  return (
    <section className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm md:text-base font-semibold text-gray-900">Wensen & Anti-wensen</h2>
          <p className="text-xs text-gray-600">
            Beschrijf wat u belangrijk vindt — en ook wat u juist <strong>niet</strong> wilt.
            Jules herkent zo tegenstrijdigheden en helpt u prioriteiten stellen.
          </p>
        </div>
        <button
          type="button"
          onClick={addWish}
          className="rounded-lg bg-[#107d82] text-white px-3 py-1.5 hover:opacity-90"
        >
          + Wens
        </button>
      </div>

      {/* Lijst van wensen */}
      <div className="space-y-3">
        {wishes.map((w, i) => (
          <div
            key={w.id}
            className="rounded-xl border border-[var(--brx-ring)] bg-white shadow-[0_8px_24px_rgba(16,125,130,.08)] p-4 md:p-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 🔸 2. textarea i.p.v. input */}
              <FocusTarget chapter="wensen" fieldId={`label_${w.id}`}>
                <div>
                  <label className="block text-xs mb-1 text-gray-600">Omschrijving</label>
                  <textarea
                    className="w-full border rounded px-2 py-1.5 min-h-[60px]"
                    value={w.label}
                    onChange={(e) => updateWish(i, { label: e.target.value })}
                    placeholder="bv. kookeiland, lichtstraat, schuifpui, géén open keuken..."
                  />
                  <p className="text-[11px] text-gray-500 mt-1">Omschrijf kort en natuurlijk.</p>
                </div>
              </FocusTarget>

              <FocusTarget chapter="wensen" fieldId={`priority_${w.id}`}>
                <div>
                  <label className="block text-xs mb-1 text-gray-600">Prioriteit</label>
                  <select
                    className="w-full border rounded px-2 py-1.5"
                    value={w.priority ?? 'unknown'}
                    onChange={(e) => updateWish(i, { priority: e.target.value as WishPriority })}
                    aria-label="Prioriteit van de wens"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-gray-500 mt-1">{currentHint(w.priority)}</p>
                </div>
              </FocusTarget>

              {/* Acties */}
              <div className="flex items-end justify-end">
                <button
                  type="button"
                  className="text-sm text-red-600 hover:underline"
                  onClick={() => removeWish(i)}
                >
                  Verwijderen
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* 🔸 4. Versterkte lege staat met Jules-koppeling */}
        {wishes.length === 0 && (
          <div className="border rounded p-4 text-sm text-gray-600 bg-gray-50">
            Nog geen wensen toegevoegd.<br />
            Klik op <em>+ Wens</em> om te beginnen of typ gewoon in de chat:<br />
            <span className="italic text-gray-500">“Ik wil een licht huis maar géén grote ramen.”</span>
          </div>
        )}
      </div>
    </section>
  );
}