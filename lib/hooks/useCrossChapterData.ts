// lib/hooks/useCrossChapterData.ts
/**
 * Cross-chapter data sharing hook
 * 
 * ✅ Doel: Zorgen dat Budget-info in Basis zichtbaar is, Basis-info in Budget, etc.
 * ✅ Single source of truth: Alle data via useWizardState
 * ✅ Bidirectioneel: Wijzigingen synchroniseren automatisch
 * 
 * Gebruik in ANY component:
 *   const ctx = useCrossChapterData();
 *   ctx.basis.projectNaam  // ← Altijd actueel
 *   ctx.budget.totaal      // ← Altijd actueel
 *   ctx.updateBudget(250000) // ← Schrijft naar beide chapters
 */

import { useWizardState } from '@/lib/stores/useWizardState';
import { useMemo, useCallback } from 'react';

export type CrossChapterContext = {
  // ===== BASIS-GEGEVENS (geldig in alle chapters) =====
  basis: {
    projectNaam?: string;
    locatie?: string;
    oppervlakteM2?: number | null;
    bewonersAantal?: number | null;
    startMaand?: string;
    toelichting?: string;
  };

  // ===== BUDGET-GEGEVENS (geldig in alle chapters) =====
  budget: {
    totaal?: number | null;
    bandbreedte?: [number | null, number | null] | null;
    eigenInbreng?: number | null;
    /** Berekend: totaal - eigenInbreng */
    financieringBehoefte?: number | null;
  };

  // ===== TRIAGE-CONTEXT (altijd beschikbaar) =====
  triage: {
    projectType?: string;
    projectSize?: string;
    urgentie?: string;
    budget?: number | null;
    ervaring?: string;
    intent?: string[];
  };

  // ===== RUIMTES-SAMENVATTING =====
  ruimtes: {
    count: number;
    totalM2?: number;
  };

  // ===== METHODS: Bidirectionele updates =====
  updateBasis: (patch: Partial<CrossChapterContext['basis']>) => void;
  updateBudget: (patch: Partial<CrossChapterContext['budget']>) => void;
  updateProjectName: (name: string) => void;
  updateLocation: (loc: string) => void;
  updateBudgetTotal: (euro: number | null) => void;
};

/**
 * Hook: Lees en schrijf cross-chapter data
 */
export function useCrossChapterData(): CrossChapterContext {
  const chapterAnswers = useWizardState((s) => s.chapterAnswers) as Record<string, any>;
  const triage = useWizardState((s) => s.triage);
  const setChapterAnswers = useWizardState((s) => s.setChapterAnswers);
  const patchChapterAnswer = useWizardState((s) => s.patchChapterAnswer);

  // ===== MEMOIZED GETTERS =====
  const basis = useMemo(() => {
    const raw = chapterAnswers?.basis ?? {};
    return {
      projectNaam: raw.projectNaam,
      locatie: raw.locatie,
      oppervlakteM2: raw.oppervlakteM2 ?? null,
      bewonersAantal: raw.bewonersAantal ?? null,
      startMaand: raw.startMaand,
      toelichting: raw.toelichting,
    };
  }, [chapterAnswers?.basis]);

  const budget = useMemo(() => {
    const raw = chapterAnswers?.budget ?? {};
    const totaal = raw.budgetTotaal ?? raw.bedrag ?? null;
    const eigenInbreng = raw.eigenInbreng ?? null;
    const financieringBehoefte =
      totaal && eigenInbreng ? totaal - eigenInbreng : totaal;

    return {
      totaal,
      bandbreedte: raw.bandbreedte ?? null,
      eigenInbreng,
      financieringBehoefte,
    };
  }, [chapterAnswers?.budget]);

  const triageData = useMemo(() => {
    return {
      projectType: (triage as any)?.projectType ?? (triage as any)?.project_type,
      projectSize: (triage as any)?.projectSize ?? (triage as any)?.project_size,
      urgentie: (triage as any)?.urgentie,
      budget: budget.totaal,
      ervaring: (triage as any)?.ervaring,
      intent: Array.isArray((triage as any)?.intent)
        ? (triage as any).intent
        : (triage as any)?.intent
          ? [(triage as any).intent]
          : [],
    };
  }, [triage, budget.totaal]);

  const ruimtes = useMemo(() => {
    const list = Array.isArray(chapterAnswers?.ruimtes) ? chapterAnswers.ruimtes : [];
    const totalM2 = list.reduce((sum: number, r: any) => sum + (r.m2 || r.oppM2 || 0), 0);
    return {
      count: list.length,
      totalM2: totalM2 > 0 ? totalM2 : undefined,
    };
  }, [chapterAnswers?.ruimtes]);

  // ===== BIDIRECTIONAL WRITERS =====
  const updateBasis = useCallback(
    (patch: Partial<CrossChapterContext['basis']>) => {
      patchChapterAnswer('basis', patch);
    },
    [patchChapterAnswer]
  );

  const updateBudget = useCallback(
    (patch: Partial<CrossChapterContext['budget']>) => {
      // Spiegel naar basis.budgetIndicatie als totaal verandert
      const nextBudget = {
        ...(chapterAnswers?.budget ?? {}),
        budgetTotaal: patch.totaal !== undefined ? patch.totaal : (chapterAnswers?.budget?.budgetTotaal ?? null),
        bandbreedte: patch.bandbreedte !== undefined ? patch.bandbreedte : (chapterAnswers?.budget?.bandbreedte ?? null),
        eigenInbreng: patch.eigenInbreng !== undefined ? patch.eigenInbreng : (chapterAnswers?.budget?.eigenInbreng ?? null),
      };

      // Als totaal verandert, spiegel ook naar basis.budgetIndicatie
      const nextBasis = {
        ...(chapterAnswers?.basis ?? {}),
        budgetIndicatie: patch.totaal !== undefined ? patch.totaal : (chapterAnswers?.basis?.budgetIndicatie ?? null),
      };

      setChapterAnswers({
        ...chapterAnswers,
        budget: nextBudget,
        basis: nextBasis,
      });
    },
    [chapterAnswers, setChapterAnswers]
  );

  const updateProjectName = useCallback(
    (name: string) => {
      updateBasis({ projectNaam: name });
    },
    [updateBasis]
  );

  const updateLocation = useCallback(
    (loc: string) => {
      updateBasis({ locatie: loc });
    },
    [updateBasis]
  );

  const updateBudgetTotal = useCallback(
    (euro: number | null) => {
      updateBudget({ totaal: euro });
    },
    [updateBudget]
  );

  return {
    basis,
    budget,
    triage: triageData,
    ruimtes,
    updateBasis,
    updateBudget,
    updateProjectName,
    updateLocation,
    updateBudgetTotal,
  };
}

export default useCrossChapterData;