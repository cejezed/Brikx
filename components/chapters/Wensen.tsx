// components/chapters/Wensen.tsx
'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import FocusTarget from '@/components/wizard/FocusTarget';
import { useWizardState } from '@/lib/stores/useWizardState';
import { useUiStore } from '@/lib/stores/useUiStore';
import type { ChapterKey } from '@/types/wizard';
import type { WishItem, WishPriority } from '@/types/project';

const CHAPTER_KEY: ChapterKey = 'wensen';

const PRIORITIES: { value: WishPriority; label: string; hint: string }[] = [
  { value: 'unknown', label: 'Weet ik nog niet / n.v.t.', hint: 'Later prioriteren is prima.' },
  { value: 'must',    label: 'Must-have',                 hint: 'Moet erin, kern voor succes.' },
  { value: 'nice',    label: 'Nice-to-have',              hint: 'Gewenst, maar niet cruciaal.' },
  { value: 'future',  label: 'Toekomst-optie',            hint: 'Kan in fase 2 / later.' },
];

export default function Wensen() {
  const uid = useId();

  // Houd huidige tab bij (consistent met Ruimtes/Basis)
  const setCurrentChapter = useUiStore((s) => s.setCurrentChapter);
  useEffect(() => { setCurrentChapter?.('wensen'); }, [setCurrentChapter]);

  // Store-koppeling
  const answers = useWizardState((s) => s.chapterAnswers[CHAPTER_KEY] as WishItem[] | undefined);
  const setAnswer = useWizardState((s) => s.setChapterAnswer);

  // Lokale werkbuffer zodat je tijdens typen geen jitter krijgt
  const [wishes, setWishes] = useState<WishItem[]>(Array.isArray(answers) ? answers : []);

  // Als store verandert elders, sync éénmalig in (bij mount of wanneer answers wisselt)
  useEffect(() => {
    if (Array.isArray(answers)) setWishes(answers);
  }, [answers]);

  const commit = (next: WishItem[]) => {
    setWishes(next);
    setAnswer(CHAPTER_KEY, next);
  };

  const addWish = () => {
    commit([
      ...wishes,
      { id: `${uid}-${wishes.length + 1}`, label: '', confirmed: false, priority: 'unknown' },
    ]);
  };

  const updateWish = (idx: number, patch: Partial<WishItem>) => {
    commit(wishes.map((w, i) => (i === idx ? { ...w, ...patch } : w)));
  };

  const removeWish = (idx: number) => {
    commit(wishes.filter((_, i) => i !== idx));
  };

  const currentHint = (prio: WishPriority | undefined) =>
    PRIORITIES.find((p) => p.value === (prio ?? 'unknown'))?.hint ?? '';

  return (
    <section className="space-y-5 max-w-3xl">
      {/* Header zoals Ruimtes: titel + primaire actie rechtsboven */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm md:text-base font-semibold text-gray-900">Wensen</h2>
          <p className="text-xs text-gray-600">
            Voeg concrete wensen toe (kort omschreven) en kies een <em>prioriteit</em> (MoSCoW).
            Onzeker? Kies “Weet ik nog niet / n.v.t.” — prioriteren kan later.
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

      {/* Lijst */}
      <div className="space-y-3">
        {wishes.map((w, i) => (
          <div
            key={w.id}
            className="rounded-xl border border-[var(--brx-ring)] bg-white shadow-[0_8px_24px_rgba(16,125,130,.08)] p-4 md:p-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FocusTarget chapter="wensen" fieldId={`label_${w.id}`}>
                <div>
                  <label className="block text-xs mb-1 text-gray-600">Omschrijving</label>
                  <input
                    className="w-full border rounded px-2 py-1.5"
                    value={w.label}
                    onChange={(e) => updateWish(i, { label: e.target.value })}
                    placeholder="bv. kookeiland, lichtstraat, schuifpui"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">Houd het kort en concreet.</p>
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

              <div className="flex items-end justify-end">
                <div className="flex gap-3">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!w.confirmed}
                      onChange={(e) => updateWish(i, { confirmed: e.target.checked })}
                    />
                    <span className="text-sm">Bevestigd</span>
                  </label>
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
          </div>
        ))}

        {wishes.length === 0 && (
          <div className="border rounded p-4 text-sm text-gray-600 bg-gray-50">
            Nog geen wensen toegevoegd. Klik op <em>+ Wens</em> om te beginnen.
          </div>
        )}
      </div>

      {/* GEEN “Opslaan & Verder” meer — knop werkt nu exact als bij Ruimtes */}
    </section>
  );
}
