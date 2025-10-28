// components/chapters/Budget.tsx
'use client';

import React, { useEffect } from 'react';
import FocusTarget from '@/components/wizard/FocusTarget';
import { useWizardState } from '@/lib/stores/useWizardState';
import { useUiStore } from '@/lib/stores/useUiStore';

export default function Budget() {
  // Router hint (optioneel, consistent met Basis.tsx)
  const setCurrentChapter = useUiStore((s) => s.setCurrentChapter);
  useEffect(() => { setCurrentChapter?.('budget'); }, [setCurrentChapter]);

  // ---- Store-koppeling (enige bron van truth) ----
  const budget = useWizardState((s) => s.getBudgetValue());
  const setBudget = useWizardState((s) => s.setBudgetValue);
  const patchChapter = useWizardState((s) => s.patchChapterAnswer);

  // Extra velden onder budget (vrij van vorm)
  const chapterBudget = useWizardState((s) => s.chapterAnswers?.budget ?? {});
  const eigenInbreng = chapterBudget?.eigenInbreng ?? '';
  const bandbreedte = chapterBudget?.bandbreedte ?? null; // [min,max] | null

  const setEigenInbreng = (val: string) => {
    patchChapter('budget', { eigenInbreng: val === '' ? null : Number(val) });
  };

  const setBandbreedte = (pos: 'min' | 'max', val: string) => {
    const clean = val === '' ? null : Number(val);
    const prev: [number | null, number | null] =
      Array.isArray(bandbreedte) ? bandbreedte : [null, null];
    const next: [number | null, number | null] =
      pos === 'min' ? [clean, prev[1] ?? null] : [prev[0] ?? null, clean];
    patchChapter('budget', { bandbreedte: next as any });
  };

  return (
    <div data-spotlight-scope className="space-y-5 max-w-3xl">
      <FocusTarget chapter="budget" fieldId="totaal_budget">
        <label className="block">
          <span className="block text-sm font-medium mb-1">Totaal budget (€)</span>
          <input
            type="number"
            inputMode="numeric"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:border-[#4db8ba]"
            value={budget ?? ''}
            onChange={(e) => {
              const raw = e.target.value;
              setBudget(raw === '' ? null : Number(raw));
            }}
            placeholder="bijv. 250000"
          />
          <span className="block text-xs text-neutral-500 mt-1">
            Wordt automatisch gespiegeld met <em>Basis → Budget (indicatie)</em>.
          </span>
        </label>
      </FocusTarget>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FocusTarget chapter="budget" fieldId="bandbreedte_min">
          <label className="block">
            <span className="block text-sm font-medium mb-1">Bandbreedte — Min (€)</span>
            <input
              type="number"
              inputMode="numeric"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:border-[#4db8ba]"
              value={Array.isArray(bandbreedte) ? (bandbreedte[0] ?? '') : ''}
              onChange={(e) => setBandbreedte('min', e.target.value)}
              placeholder="bijv. 200000"
            />
          </label>
        </FocusTarget>

        <FocusTarget chapter="budget" fieldId="bandbreedte_max">
          <label className="block">
            <span className="block text-sm font-medium mb-1">Bandbreedte — Max (€)</span>
            <input
              type="number"
              inputMode="numeric"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:border-[#4db8ba]"
              value={Array.isArray(bandbreedte) ? (bandbreedte[1] ?? '') : ''}
              onChange={(e) => setBandbreedte('max', e.target.value)}
              placeholder="bijv. 300000"
            />
          </label>
        </FocusTarget>
      </div>

      <FocusTarget chapter="budget" fieldId="eigen_inbreng">
        <label className="block">
          <span className="block text-sm font-medium mb-1">Eigen inbreng (€)</span>
          <input
            type="number"
            inputMode="numeric"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:border-[#4db8ba]"
            value={eigenInbreng === null ? '' : eigenInbreng}
            onChange={(e) => setEigenInbreng(e.target.value)}
            placeholder="optioneel"
          />
        </label>
      </FocusTarget>
    </div>
  );
}
