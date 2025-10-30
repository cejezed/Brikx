// components/chapters/Budget.tsx - FIXED
'use client';

import React, { useEffect, useMemo } from 'react';
import FocusTarget from '@/components/wizard/FocusTarget';
import { useWizardState } from '@/lib/stores/useWizardState';
import { useUiStore } from '@/lib/stores/useUiStore';

export default function Budget() {
  const chapterAnswers = useWizardState((s) => s.chapterAnswers) as Record<string, any>;
  const patchChapterAnswer = useWizardState((s) => s.patchChapterAnswer);
  const setCurrentChapter = useUiStore((s) => s.setCurrentChapter);

  useEffect(() => {
    setCurrentChapter?.('budget');
  }, [setCurrentChapter]);

  // ===== LEES BUDGET WAARDEN =====
  const budgetTotaal = useMemo(() => {
    return chapterAnswers?.budget?.budgetTotaal ?? null;
  }, [chapterAnswers?.budget?.budgetTotaal]);

  const bandbreedte = useMemo(() => {
    return chapterAnswers?.budget?.bandbreedte ?? null;
  }, [chapterAnswers?.budget?.bandbreedte]);

  const eigenInbreng = useMemo(() => {
    return chapterAnswers?.budget?.eigenInbreng ?? null;
  }, [chapterAnswers?.budget?.eigenInbreng]);

  // ===== LEES CONTEXT VAN ANDERE CHAPTERS =====
  const projectNaam = useMemo(() => {
    return chapterAnswers?.basis?.projectNaam ?? '';
  }, [chapterAnswers?.basis?.projectNaam]);

  const oppervlakte = useMemo(() => {
    return chapterAnswers?.basis?.oppervlakteM2 ?? null;
  }, [chapterAnswers?.basis?.oppervlakteM2]);

  // ===== BEREKENDE VELDEN =====
  const financieringBehoefte = useMemo(() => {
    if (budgetTotaal && eigenInbreng) {
      return budgetTotaal - eigenInbreng;
    }
    return budgetTotaal;
  }, [budgetTotaal, eigenInbreng]);

  // ===== UPDATERS =====
  function updateBudgetTotal(val: number | null) {
    patchChapterAnswer('budget', { budgetTotaal: val });
    // SYNC naar basis
    patchChapterAnswer('basis', { budgetIndicatie: val });
  }

  function setBandbreedte(pos: 'min' | 'max', val: string) {
    const clean = val === '' ? null : Number(val);
    const prev: [number | null, number | null] = Array.isArray(bandbreedte)
      ? bandbreedte
      : [null, null];
    const next: [number | null, number | null] =
      pos === 'min' ? [clean, prev[1] ?? null] : [prev[0] ?? null, clean];
    patchChapterAnswer('budget', { bandbreedte: next as any });
  }

  function setEigenInbreng(val: string) {
    patchChapterAnswer('budget', { eigenInbreng: val === '' ? null : Number(val) });
  }

  const formatEuro = (n: number | null | undefined) => {
    if (!n) return '—';
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(n);
  };

  return (
    <div data-spotlight-scope className="space-y-5 max-w-3xl">
      {/* CONTEXT VAN BASIS */}
      {projectNaam && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-xs font-medium text-blue-900 mb-2">📋 Context vanuit Basis-tabblad</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-blue-700 font-medium">Project:</span>
              <p className="text-blue-900">{projectNaam}</p>
            </div>
            {oppervlakte && (
              <div>
                <span className="text-blue-700 font-medium">Oppervlakte:</span>
                <p className="text-blue-900">{oppervlakte} m²</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOTAAL BUDGET */}
      <FocusTarget chapter="budget" fieldId="totaal_budget">
        <label className="block">
          <span className="block text-sm font-medium mb-1">Totaal budget (€)</span>
          <input
            type="number"
            inputMode="numeric"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:border-[#4db8ba]"
            value={budgetTotaal ?? ''}
            onChange={(e) => {
              const raw = e.target.value;
              updateBudgetTotal(raw === '' ? null : Number(raw));
            }}
            placeholder="bijv. 250000"
          />
          <span className="block text-xs text-neutral-500 mt-1">
            Gesynced met Basis-tabblad.
          </span>
        </label>
      </FocusTarget>

      {/* BANDBREEDTE */}
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

      {/* EIGEN INBRENG */}
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

      {/* CALCULATED: FINANCING NEED */}
      {financieringBehoefte !== undefined && (
        <div className="rounded-lg border border-purple-300 bg-purple-50 p-4">
          <p className="text-xs font-medium text-purple-900">Financieringsbehoefte (berekend)</p>
          <p className="text-lg font-bold text-purple-900 mt-2">{formatEuro(financieringBehoefte)}</p>
          <p className="text-[11px] text-purple-700 mt-2">
            = Totaal budget − Eigen inbreng
          </p>
        </div>
      )}
    </div>
  );
}