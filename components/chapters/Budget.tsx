// /components/chapters/Budget.tsx
'use client';

import React, { useMemo } from 'react';
import useWizardState from '@/lib/stores/useWizardState';
import type { ChapterKey } from '@/types/chat';

const CHAPTER: ChapterKey = 'budget';

type BudgetState = {
  budgetTotaal?: number;
  bandbreedte?: [number | null, number | null];
  eigenInbreng?: number | null;
};

export default function ChapterBudget() {
  const chapterAnswers = useWizardState((s) => s.chapterAnswers) as Record<string, any>;
  const setChapterAnswer = useWizardState((s) => s.setChapterAnswer);
  const getBudgetValue = useWizardState((s) => s.getBudgetValue);

  const state: BudgetState = useMemo(
    () => ({ ...(chapterAnswers?.[CHAPTER] ?? {}) }),
    [chapterAnswers]
  );

  const update = (patch: Partial<BudgetState>) => {
    const next: BudgetState = { ...state, ...patch };
    setChapterAnswer(CHAPTER, next);
  };

  const budgetTotaal = state.budgetTotaal ?? getBudgetValue() ?? undefined;
  const [minBand, maxBand] = state.bandbreedte ?? [null, null];

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-[#1A3E4C]">Budget</h2>
        <p className="text-sm text-gray-600">Indicatief budget en bandbreedte.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="block">
          <span className="text-sm text-gray-700">Totaalbudget (€)</span>
          <input
            type="number"
            className="mt-1 w-full rounded-md border-gray-300"
            value={budgetTotaal ?? ''}
            onChange={(e) => update({ budgetTotaal: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="250000"
          />
        </label>

        <label className="block">
          <span className="text-sm text-gray-700">Bandbreedte min (€)</span>
          <input
            type="number"
            className="mt-1 w-full rounded-md border-gray-300"
            value={minBand ?? ''}
            onChange={(e) =>
              update({
                bandbreedte: [
                  e.target.value ? Number(e.target.value) : null,
                  state.bandbreedte?.[1] ?? null,
                ],
              })
            }
            placeholder="200000"
          />
        </label>

        <label className="block">
          <span className="text-sm text-gray-700">Bandbreedte max (€)</span>
          <input
            type="number"
            className="mt-1 w-full rounded-md border-gray-300"
            value={maxBand ?? ''}
            onChange={(e) =>
              update({
                bandbreedte: [
                  state.bandbreedte?.[0] ?? null,
                  e.target.value ? Number(e.target.value) : null,
                ],
              })
            }
            placeholder="300000"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm text-gray-700">Eigen inbreng (€)</span>
        <input
          type="number"
          className="mt-1 w-full rounded-md border-gray-300"
          value={state.eigenInbreng ?? ''}
          onChange={(e) => update({ eigenInbreng: e.target.value ? Number(e.target.value) : null })}
          placeholder="50000"
        />
      </label>
    </section>
  );
}
