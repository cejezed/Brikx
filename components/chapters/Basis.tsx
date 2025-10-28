// components/chapters/Basis.tsx
'use client';

import { useEffect, useMemo } from 'react';
import { useWizardState } from '@/lib/stores/useWizardState';
import FocusTarget from '@/components/wizard/FocusTarget';
import { useUiStore } from '@/lib/stores/useUiStore';

type BasisAnswers = {
  projectNaam?: string;
  locatie?: string;
  oppervlakteM2?: number | '';
  bewonersAantal?: number | '';
  startMaand?: string; // YYYY-MM
  toelichting?: string;
  /** Optioneel: budget op de Basis-tab (gespiegeld naar budget.budgetTotaal) */
  budgetIndicatie?: number | null;
};

export default function ChapterBasis() {
  // — state uit store
  const chapterAnswers = useWizardState((s) => s.chapterAnswers) as Record<string, any>;
  const setChapterAnswers = useWizardState((s) => (s as any).setChapterAnswers); // (all: object) compat
  const triage = useWizardState((s) => s.triage);

  // — UI-store (alleen currentChapter bijhouden)
  const setCurrentChapter = useUiStore((s) => s.setCurrentChapter);
  useEffect(() => {
    setCurrentChapter('basis');
  }, [setCurrentChapter]);

  // — veilige view van basis
  const basis: BasisAnswers = useMemo(() => ({ ...(chapterAnswers?.basis ?? {}) }), [chapterAnswers?.basis]);

  // — helpers
  const safeAll = () => ({ ...(chapterAnswers ?? {}), basis: { ...(basis ?? {}) } });

  /** Schrijf alleen basis-velden */
  function update<K extends keyof BasisAnswers>(key: K, value: BasisAnswers[K]) {
    const nextBasis = { ...(basis ?? {}), [key]: value };
    const nextAll = { ...(chapterAnswers ?? {}), basis: nextBasis };
    setChapterAnswers(nextAll); // 1-arg variant: hele chapterAnswers opslaan
  }

  /** Schrijf budget en spiegel naar budget.budgetTotaal */
  function updateBudget(val: number | null) {
    const nextBasis = { ...(basis ?? {}), budgetIndicatie: val };
    const nextAll = {
      ...(chapterAnswers ?? {}),
      basis: nextBasis,
      budget: {
        ...((chapterAnswers ?? {}).budget ?? {}),
        budgetTotaal: val,
      },
    };
    setChapterAnswers(nextAll); // 1-arg variant
  }

  // — labels
  const projectTypeLabel = useMemo(() => {
    const map: Record<string, string> = {
      nieuwbouw: 'Nieuwbouw',
      verbouwing: 'Verbouwing',
      hybride: 'Hybride / combinatie',
      nieuwbouw_woning: 'Nieuwbouw',
      complete_renovatie: 'Renovatie',
      bijgebouw: 'Bijgebouw',
      verbouwing_zolder: 'Zolderverbouwing',
      hybride_project: 'Hybride',
    };
    const raw = (triage as any)?.projectType ?? (triage as any)?.project_type;
    return map[String(raw)] ?? '—';
  }, [triage]);

  return (
    <section className="space-y-6 max-w-3xl">
      {/* top-anker voor spotlight */}
      <FocusTarget chapter="basis" fieldId="__chapterTop">
        <div />
      </FocusTarget>

      {/* Contextkaartje – intake-samenvatting (veilig) */}
      <div className="rounded-xl border border-neutral-200 p-4 bg-neutral-50">
        <p className="text-sm text-neutral-700">
          <span className="font-medium">Intake-overzicht:</span>{' '}
          Projecttype <span className="font-medium">{projectTypeLabel}</span>,{' '}
          Ervaring <span className="font-medium">{(triage as any)?.ervaring ?? '—'}</span>,{' '}
          Urgentie <span className="font-medium">{triage?.urgentie ?? '—'}</span>,{' '}
          Budget{' '}
          <span className="font-medium">
            €
            {Number(
              // toon uit budget.budgetTotaal → anders basis.budgetIndicatie → anders triage.budget
              (chapterAnswers?.budget?.budgetTotaal ??
                basis?.budgetIndicatie ??
                (triage as any)?.budget ??
                0) as number
            ).toLocaleString('nl-NL')}
          </span>
          .
        </p>
        <p className="text-xs text-neutral-500 mt-1">
          Wijzigingen aan Intake kan u in het tabblad <em>Intake</em> doen; Basis gaat over de kerngegevens van uw
          dossier.
        </p>
      </div>

      {/* Projectnaam */}
      <FocusTarget chapter="basis" fieldId="projectNaam">
        <label className="block">
          <span className="block text-sm font-medium mb-1">Projectnaam</span>
          <input
            className="w-full border rounded px-3 py-2"
            value={basis.projectNaam ?? ''}
            onChange={(e) => update('projectNaam', e.target.value)}
            placeholder="Bijv. Renovatie woning Van Dijk"
          />
        </label>
      </FocusTarget>

      {/* Locatie */}
      <FocusTarget chapter="basis" fieldId="locatie">
        <label className="block">
          <span className="block text-sm font-medium mb-1">Locatie / adres</span>
          <input
            className="w-full border rounded px-3 py-2"
            value={basis.locatie ?? ''}
            onChange={(e) => update('locatie', e.target.value)}
            placeholder="Straat + plaats (optioneel in deze fase)"
          />
        </label>
      </FocusTarget>

      {/* Oppervlakte + bewoners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FocusTarget chapter="basis" fieldId="oppervlakteM2">
          <label className="block">
            <span className="block text-sm font-medium mb-1">Oppervlakte (m², indicatie)</span>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full border rounded px-3 py-2"
              value={basis.oppervlakteM2 ?? ''}
              onChange={(e) =>
                update(
                  'oppervlakteM2',
                  e.target.value === '' ? '' : Number(e.target.value.replace(/\D+/g, ''))
                )
              }
              placeholder="bijv. 120"
            />
          </label>
        </FocusTarget>

        <FocusTarget chapter="basis" fieldId="bewonersAantal">
          <label className="block">
            <span className="block text-sm font-medium mb-1">Aantal bewoners (indicatie)</span>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full border rounded px-3 py-2"
              value={basis.bewonersAantal ?? ''}
              onChange={(e) =>
                update(
                  'bewonersAantal',
                  e.target.value === '' ? '' : Number(e.target.value.replace(/\D+/g, ''))
                )
              }
              placeholder="bijv. 4"
            />
          </label>
        </FocusTarget>
      </div>

      {/* Start maand */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FocusTarget chapter="basis" fieldId="startMaand">
          <label className="block">
            <span className="block text-sm font-medium mb-1">Gewenste start (maand)</span>
            <input
              type="month"
              className="w-full border rounded px-3 py-2"
              value={basis.startMaand ?? ''}
              onChange={(e) => update('startMaand', e.target.value)}
            />
          </label>
        </FocusTarget>

        {/* Budget (optioneel) – gespiegeld naar budget.budgetTotaal */}
        <FocusTarget chapter="basis" fieldId="budgetIndicatie">
          <label className="block">
            <span className="block text-sm font-medium mb-1">Budget (indicatie)</span>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full border rounded px-3 py-2"
              value={(() => {
                const v =
                  chapterAnswers?.budget?.budgetTotaal ??
                  basis?.budgetIndicatie ??
                  null;
                return v === null || v === undefined ? '' : String(v);
              })()}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D+/g, '');
                updateBudget(raw === '' ? null : Number(raw));
              }}
              placeholder="bijv. 250000"
            />
            <span className="block text-xs text-neutral-500 mt-1">
              Wordt automatisch gespiegeld naar het tabblad <em>Budget</em>.
            </span>
          </label>
        </FocusTarget>
      </div>

      {/* Toelichting */}
      <FocusTarget chapter="basis" fieldId="toelichting">
        <label className="block">
          <span className="block text-sm font-medium mb-1">Korte toelichting</span>
          <textarea
            className="w-full border rounded px-3 py-2 min-h-28"
            value={basis.toelichting ?? ''}
            onChange={(e) => update('toelichting', e.target.value)}
            placeholder="Beschrijf in uw eigen woorden wat u wilt bereiken…"
          />
          <span className="block text-xs text-neutral-500 mt-1">
            U mag dit beknopt houden; details volgen in de volgende hoofdstukken.
          </span>
        </label>
      </FocusTarget>
    </section>
  );
}
