// components/chapters/Budget.tsx — ROBUUST + JULES-ERVARING
'use client';

import React, { useEffect, useMemo } from 'react';
import FocusTarget from '@/components/wizard/FocusTarget';
import { useWizardState } from '@/lib/stores/useWizardState';
import { useUiStore } from '@/lib/stores/useUiStore';

type Band = [number | null, number | null];

export default function Budget() {
  // ──────────────────────────────────────────────────────────────
  // State-koppeling
  // ──────────────────────────────────────────────────────────────
  const chapterAnswers = useWizardState((s) => s.chapterAnswers) as Record<string, any>;
  const setChapterAnswer = useWizardState((s) => s.setChapterAnswer);
  const getState = useWizardState.getState;

  const setCurrentChapter = useUiStore((s) => s.setCurrentChapter);
  useEffect(() => { setCurrentChapter?.('budget'); }, [setCurrentChapter]);

  // ──────────────────────────────────────────────────────────────
  // Lezen huidige waarden
  // ──────────────────────────────────────────────────────────────
  const budgetTotaal = useMemo<number | null>(() => {
    return chapterAnswers?.budget?.budgetTotaal ?? null;
  }, [chapterAnswers?.budget?.budgetTotaal]);

  const bandbreedte = useMemo<Band | null>(() => {
    return chapterAnswers?.budget?.bandbreedte ?? null;
  }, [chapterAnswers?.budget?.bandbreedte]);

  const eigenInbreng = useMemo<number | null>(() => {
    return chapterAnswers?.budget?.eigenInbreng ?? null;
  }, [chapterAnswers?.budget?.eigenInbreng]);

  // Context uit Basis
  const projectNaam = useMemo<string>(() => {
    return chapterAnswers?.basis?.projectNaam ?? '';
  }, [chapterAnswers?.basis?.projectNaam]);

  const oppervlakte = useMemo<number | null>(() => {
    return chapterAnswers?.basis?.oppervlakteM2 ?? null;
  }, [chapterAnswers?.basis?.oppervlakteM2]);

  // Afgeleide waarde
  const financieringBehoefte = useMemo<number | null>(() => {
    if (budgetTotaal == null) return null;
    if (eigenInbreng == null) return budgetTotaal;
    return budgetTotaal - eigenInbreng;
  }, [budgetTotaal, eigenInbreng]);

  const allesLeeg = useMemo(() => {
    return budgetTotaal == null && (!Array.isArray(bandbreedte) || (bandbreedte[0] == null && bandbreedte[1] == null)) && eigenInbreng == null;
  }, [budgetTotaal, bandbreedte, eigenInbreng]);

  // ──────────────────────────────────────────────────────────────
  // Robuuste commit zonder stale state
  // ──────────────────────────────────────────────────────────────
  function commitBudget(patch: Partial<{ budgetTotaal: number | null; bandbreedte: Band | null; eigenInbreng: number | null }>) {
    const state = getState();
    const prevBudget = (state.chapterAnswers?.budget ?? {}) as Record<string, any>;
    const nextBudget = { ...prevBudget, ...patch };

    // schrijf Budget
    setChapterAnswer('budget', nextBudget);

    // sync naar Basis.budgetIndicatie zodra budgetTotaal meegegeven is
    if (Object.prototype.hasOwnProperty.call(patch, 'budgetTotaal')) {
      const prevBasis = (state.chapterAnswers?.basis ?? {}) as Record<string, any>;
      const nextBasis = { ...prevBasis, budgetIndicatie: patch.budgetTotaal ?? null };
      setChapterAnswer('basis', nextBasis);
    }
  }

  // Updaters (getState + setChapterAnswer i.p.v. patchChapterAnswer)
  function updateBudgetTotal(n: number | null) {
    commitBudget({ budgetTotaal: n });
  }

  function setBandbreedte(pos: 'min' | 'max', val: string) {
    const clean: number | null = val === '' ? null : Number(val);
    const state = getState();
    const prev = (state.chapterAnswers?.budget?.bandbreedte ?? [null, null]) as Band;
    const next: Band = pos === 'min' ? [clean, prev[1] ?? null] : [prev[0] ?? null, clean];
    commitBudget({ bandbreedte: next });
  }

  function setEigenInbreng(val: string) {
    commitBudget({ eigenInbreng: val === '' ? null : Number(val) });
  }

  // ──────────────────────────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────────────────────────
  const formatEuro = (n: number | null | undefined) => {
    if (n == null) return '—';
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
    }).format(n);
  };

  // ──────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────
  return (
    <div data-spotlight-scope className="space-y-5 max-w-3xl">
      {/* ── Jules-ervaring / Tip-balk (altijd zichtbaar) ───────────────────── */}
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-xs font-medium text-emerald-900 mb-2">💡 Tip — werk sneller via de chat</p>
        <ul className="text-sm text-emerald-900 list-disc pl-5 space-y-1">
          <li>Zeg <span className="font-semibold">“budget 250k”</span> — dan vul ik het totaalbudget voor u in.</li>
          <li>Zeg <span className="font-semibold">“bandbreedte 200k–300k”</span> — ik zet de minimum en maximum direct goed.</li>
          <li>Zeg <span className="font-semibold">“eigen inbreng 50k”</span> — ik bereken de financieringsbehoefte.</li>
        </ul>
      </div>

      {/* ── Context vanuit Basis ───────────────────────────────────────────── */}
      {projectNaam && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-xs font-medium text-blue-900 mb-2">📋 Context vanuit Basis-tabblad</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-blue-700 font-medium">Project:</span>
              <p className="text-blue-900">{projectNaam}</p>
            </div>
            {oppervlakte != null && (
              <div>
                <span className="text-blue-700 font-medium">Oppervlakte:</span>
                <p className="text-blue-900">{oppervlakte} m²</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Lege staat die Jules-ervaring benadrukt ───────────────────────── */}
      {allesLeeg && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm text-gray-800">
            Nog geen budget ingevuld. U kunt beginnen met de velden hieronder, of gewoon in de chat typen:
          </p>
          <p className="text-sm text-gray-600 mt-1 italic">
            “budget 250k”, “bandbreedte 200k–300k”, “eigen inbreng 50k”
          </p>
        </div>
      )}

      {/* ── Totaalbudget ──────────────────────────────────────────────────── */}
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
            Wordt ook als <em>budgetIndicatie</em> gesynchroniseerd in Basis.
          </span>
        </label>
      </FocusTarget>

      {/* ── Bandbreedte ───────────────────────────────────────────────────── */}
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

      {/* ── Eigen inbreng ─────────────────────────────────────────────────── */}
      <FocusTarget chapter="budget" fieldId="eigen_inbreng">
        <label className="block">
          <span className="block text-sm font-medium mb-1">Eigen inbreng (€)</span>
          <input
            type="number"
            inputMode="numeric"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:border-[#4db8ba]"
            value={eigenInbreng == null ? '' : eigenInbreng}
            onChange={(e) => setEigenInbreng(e.target.value)}
            placeholder="optioneel"
          />
        </label>
      </FocusTarget>

      {/* ── Berekend: Financieringsbehoefte ───────────────────────────────── */}
      {financieringBehoefte != null && (
        <div className="rounded-lg border border-purple-300 bg-purple-50 p-4">
          <p className="text-xs font-medium text-purple-900">Financieringsbehoefte (berekend)</p>
          <p className="text-lg font-bold text-purple-900 mt-2">{formatEuro(financieringBehoefte)}</p>
          <p className="text-[11px] text-purple-700 mt-2">= Totaal budget − Eigen inbreng</p>
        </div>
      )}
    </div>
  );
}
