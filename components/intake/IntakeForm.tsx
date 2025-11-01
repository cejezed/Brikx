// components/intake/IntakeForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardState } from '@/lib/stores/useWizardState';
import { generateChapters } from '@/lib/wizard/generateChapters';
import type {
  TriageData,
  ProjectType,
  ProjectSize,
  Urgency,
  HulpVraag,
  ChapterKey,
  StijlVoorkeur,
  Document as WizardDocument,
} from '@/types/wizard';

/**
 * Build v2.0 conform:
 * - Pijler 1: geen AI-calls of nudge logic in UI; Intake levert schone TriageData.
 * - Pijler 2: generateChapters beslist; UI zet alleen current chapter.
 * - Pijler 3: geen RAG in UI.
 * - Pijler 4: budget = number | undefined (export-consistent).
 */

// ---- Budget mapping: radios -> numeric presets (bewuste midpoints) ----
type BudgetKey = 'lt100k' | '100-250k' | '250-500k' | 'gt500k';

const BUDGET_LABELS: Record<BudgetKey, string> = {
  lt100k: 'Minder dan €100.000',
  '100-250k': '€100.000 – €250.000',
  '250-500k': '€250.000 – €500.000',
  gt500k: 'Meer dan €500.000',
};

const BUDGET_PRESETS: Record<BudgetKey, number> = {
  lt100k: 90_000,
  '100-250k': 175_000,
  '250-500k': 375_000,
  gt500k: 600_000,
};

function budgetKeyFromNumber(n: number): BudgetKey {
  if (n < 100_000) return 'lt100k';
  if (n < 250_000) return '100-250k';
  if (n < 500_000) return '250-500k';
  return 'gt500k';
}

// ---- Whitelists (los van union; validatie via guards) ----
const STIJL_OPTIONS = [
  'modern',
  'tijdloos',
  'industrieel',
  'landelijk',
  'scandinavisch',
  'klassiek',
  'retro',
] as const;

function isStijlVoorkeur(x: unknown): x is StijlVoorkeur {
  return typeof x === 'string' && (STIJL_OPTIONS as readonly string[]).includes(x);
}

const HULPVRAAG_OPTIONS = [
  'pve_maken',
  'architect',
  'aannemer',
  'interieur',
  'kosten',
  'oriënteren',
] as const;

function isHulpVraag(x: unknown): x is HulpVraag {
  return typeof x === 'string' && (HULPVRAAG_OPTIONS as readonly string[]).includes(x);
}

const DOCUMENT_OPTIONS = ['fotos', 'bouwtekeningen', 'ontwerp', 'geen'] as const;

function isWizardDocument(x: unknown): x is WizardDocument {
  return typeof x === 'string' && (DOCUMENT_OPTIONS as readonly string[]).includes(x);
}

// ---- Component ----
export default function IntakeForm() {
  const router = useRouter();

  // Store API: alleen wat je aantoonbaar hebt
  const triage = useWizardState((s) => s.triage);
  const patchTriage = useWizardState((s) => s.patchTriage);
  const goToChapter = useWizardState((s: any) => s.goToChapter);

  // triage kan (deels) ontbreken tijdens hydration; lees defensief
  const t: any = triage ?? {};

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (patch: Record<string, any>) => {
    // Zustand patch accepteert dynamische keys
    // @ts-ignore
    patchTriage?.(patch);
  };

  const validate = () => {
    const next: Record<string, string> = {};

    const pt = Array.isArray(t.projectType)
      ? (t.projectType as ProjectType[])
      : t.projectType
      ? [t.projectType as ProjectType]
      : [];
    if (pt.length === 0) next.projectType = 'Kies minimaal één projecttype.';

    if (!t.projectSize) next.projectSize = 'Kies een projectgrootte.';
    if (!t.urgency) next.urgency = 'Geef aan hoe snel u wilt starten.';

    return next;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Normaliseer naar strikt getypeerde velden
      const stijlList: StijlVoorkeur[] = Array.isArray(t.stijlvoorkeur)
        ? (t.stijlvoorkeur as unknown[]).filter(isStijlVoorkeur)
        : [];

      const docList: WizardDocument[] = Array.isArray(t.bestaandeDocumenten)
        ? (t.bestaandeDocumenten as unknown[]).filter(isWizardDocument)
        : [];

      const hulpList: HulpVraag[] = Array.isArray(t.hulpvraag)
        ? (t.hulpvraag as unknown[]).filter(isHulpVraag)
        : [];

      const triageData: TriageData = {
        projectType: Array.isArray(t.projectType)
          ? (t.projectType as ProjectType[])
          : t.projectType
          ? [t.projectType as ProjectType]
          : [],
        projectSize: (t.projectSize as ProjectSize) || 'middel',
        urgency: (t.urgency as Urgency) || 'middel',

        // Spec Pijler 4: number | undefined
        budget:
          typeof t.budget === 'number'
            ? t.budget
            : typeof t.budgetCustom === 'number'
            ? t.budgetCustom
            : undefined,

        budgetCustom: typeof t.budgetCustom === 'number' ? t.budgetCustom : undefined,

        stijlvoorkeur: stijlList,
        moodboardUrl: typeof t.moodboardUrl === 'string' ? t.moodboardUrl : undefined,
        bestaandeDocumenten: docList,
        hulpvraag: hulpList,
      };

      // Pijler 2: centraal beslismodel
      // @ts-ignore: result type kan variëren; we gebruiken alleen chapters
      const result = generateChapters(triageData);

      // Kies eerste chapter als current, met fallback
      const firstChapter: ChapterKey = (result.chapters as ChapterKey[])[0] ?? 'basis';
      goToChapter?.(firstChapter);

      // Route naar juiste stap
      router.push(`/wizard?step=${firstChapter}`);
    } catch (err) {
      console.error(err);
      setErrors((prev) => ({
        ...prev,
        submit:
          'Er ging iets mis bij het starten van de wizard. Probeer het opnieuw of neem contact op.',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Huidige radio-afleiding o.b.v. numeric store
  const selectedBudgetKey: BudgetKey | undefined =
    typeof t.budget === 'number' ? budgetKeyFromNumber(t.budget) : undefined;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {errors.submit}
        </div>
      )}

      {/* 1️⃣ PROJECTTYPE */}
      <fieldset className="border border-gray-300 rounded-lg p-6 bg-gray-50">
        <legend className="text-lg font-bold mb-4 text-gray-900">
          1️⃣ Wat voor project heeft u? <span className="text-red-600">*</span>
        </legend>

        <div className="space-y-3">
          {([
            { id: 'nieuwbouw', label: 'Nieuwbouw woning' },
            { id: 'verbouwing', label: 'Verbouwing' },
            { id: 'aanbouw', label: 'Aanbouw / Uitbouw / Dakkapel' },
            { id: 'renovatie', label: 'Renovatie' },
            { id: 'interieur', label: 'Interieur / Herindeling' },
          ] as { id: ProjectType; label: string }[]).map((opt) => {
            const checked = Array.isArray(t.projectType)
              ? (t.projectType as ProjectType[]).includes(opt.id)
              : t.projectType === opt.id;

            return (
              <label key={opt.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!checked}
                  onChange={(e) => {
                    const current: ProjectType[] = Array.isArray(t.projectType)
                      ? (t.projectType as ProjectType[])
                      : t.projectType
                      ? [t.projectType as ProjectType]
                      : [];
                    if (e.target.checked) {
                      updateField({ projectType: [...current, opt.id] });
                    } else {
                      updateField({ projectType: current.filter((x) => x !== opt.id) });
                    }
                  }}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            );
          })}
        </div>

        {errors.projectType && (
          <p className="text-red-600 text-sm mt-2 font-semibold">{errors.projectType}</p>
        )}
      </fieldset>

      {/* 2️⃣ PROJECTGROOTTE */}
      <div>
        <label className="block">
          <span className="block text-lg font-bold mb-2 text-gray-900">
            2️⃣ Hoe groot is het project? <span className="text-red-600">*</span>
          </span>
          <select
            className="w-full border border-gray-300 rounded-md p-2 bg-white focus:ring-2 focus:ring-[#0d3d4d] focus:border-transparent"
            value={t.projectSize ?? ''}
            onChange={(e) => updateField({ projectSize: (e.target.value || null) as ProjectSize })}
          >
            <option value="">– Kies een grootte –</option>
            <option value="klein">Klein</option>
            <option value="middel">Middel</option>
            <option value="groot">Groot</option>
          </select>
          {errors.projectSize && (
            <p className="text-red-600 text-sm mt-2 font-semibold">{errors.projectSize}</p>
          )}
        </label>
      </div>

      {/* 3️⃣ URGENCY */}
      <div>
        <label className="block">
          <span className="block text-lg font-bold mb-2 text-gray-900">
            3️⃣ Hoe snel wilt u starten? <span className="text-red-600">*</span>
          </span>
          <select
            className="w-full border border-gray-300 rounded-md p-2 bg-white focus:ring-2 focus:ring-[#0d3d4d] focus:border-transparent"
            value={t.urgency ?? ''}
            onChange={(e) => updateField({ urgency: e.target.value || null })}
          >
            <option value="">– Kies een starttijdstip –</option>
            <option value="laag">Nog veel tijd (meer dan 6 maanden)</option>
            <option value="middel">Normaal tempo (3 tot 6 maanden)</option>
            <option value="hoog">Snel graag (minder dan 3 maanden)</option>
          </select>
          {errors.urgency && (
            <p className="text-red-600 text-sm mt-2 font-semibold">{errors.urgency}</p>
          )}
        </label>
      </div>

      {/* 4️⃣ BUDGET */}
      <fieldset className="border border-gray-300 rounded-lg p-6 bg-gray-50">
        <legend className="text-lg font-bold mb-4 text-gray-900">
          4️⃣ Wat is uw budget? <span className="text-gray-500 text-sm">(optioneel)</span>
        </legend>

        <div className="space-y-3">
          {(Object.keys(BUDGET_LABELS) as BudgetKey[]).map((id) => (
            <label key={id} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="budgetOption"
                checked={selectedBudgetKey === id}
                onChange={() => updateField({ budget: BUDGET_PRESETS[id] })}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-sm text-gray-700">{BUDGET_LABELS[id]}</span>
            </label>
          ))}
        </div>

        <div className="mt-4">
          <label className="block">
            <span className="text-sm font-medium mb-2 block">Of vul uw eigen bedrag in:</span>
            <div className="flex gap-2">
              <span className="text-gray-600 py-2">EUR</span>
              <input
                type="number"
                className="flex-1 border border-gray-300 rounded-md p-2 bg-white focus:ring-2 focus:ring-[#0d3d4d] focus:border-transparent"
                value={typeof t.budgetCustom === 'number' ? t.budgetCustom : ''}
                onChange={(e) =>
                  updateField({
                    budgetCustom: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="bijv. 150000"
              />
            </div>
          </label>
        </div>
      </fieldset>

      {/* 5️⃣ VISUELE CONTEXT */}
      <fieldset className="border border-gray-300 rounded-lg p-6 bg-gray-50">
        <legend className="text-lg font-bold mb-4 text-gray-900">
          5️⃣ Visuele Context <span className="text-gray-500 text-sm">(optioneel)</span>
        </legend>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            5A. Welke woonstijl(en) spreken u aan?
          </h3>
          <div className="space-y-2">
            {STIJL_OPTIONS.map((stijl) => {
              const selected = Array.isArray(t.stijlvoorkeur)
                ? (t.stijlvoorkeur as unknown[]).some((s) => s === stijl)
                : false;
              return (
                <label key={stijl} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={(e) => {
                      const current: string[] = Array.isArray(t.stijlvoorkeur)
                        ? (t.stijlvoorkeur as string[])
                        : [];
                      if (e.target.checked) {
                        updateField({ stijlvoorkeur: [...current, stijl] });
                      } else {
                        updateField({ stijlvoorkeur: current.filter((s) => s !== stijl) });
                      }
                    }}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 capitalize">{stijl}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">5B. Moodboard link</h3>
          <input
            type="url"
            className="w-full border border-gray-300 rounded-md p-2 bg-white focus:ring-2 focus:ring-[#0d3d4d] focus:border-transparent"
            placeholder="Plak hier een link naar uw Pinterest/beeldcollectie (optioneel)"
            value={typeof t.moodboardUrl === 'string' ? t.moodboardUrl : ''}
            onChange={(e) => updateField({ moodboardUrl: e.target.value || undefined })}
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">5C. Bestaande documenten</h3>
          <div className="space-y-2">
            {DOCUMENT_OPTIONS.map((doc) => {
              const selected = Array.isArray(t.bestaandeDocumenten)
                ? (t.bestaandeDocumenten as unknown[]).some((d) => d === doc)
                : false;
              return (
                <label key={doc} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={(e) => {
                      const current: string[] = Array.isArray(t.bestaandeDocumenten)
                        ? (t.bestaandeDocumenten as string[])
                        : [];
                      if (e.target.checked) {
                        updateField({ bestaandeDocumenten: [...current, doc] });
                      } else {
                        updateField({
                          bestaandeDocumenten: current.filter((d) => d !== doc),
                        });
                      }
                    }}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">
                    {
                      {
                        fotos: 'Foto’s / Inspiratiebeelden',
                        bouwtekeningen: 'Bouwtekeningen',
                        ontwerp: 'Bestaand ontwerp',
                        geen: 'Geen documenten',
                      }[doc]
                    }
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </fieldset>

      {/* 6️⃣ HULPVRAAG */}
      <fieldset className="border border-gray-300 rounded-lg p-6 bg-gray-50">
        <legend className="text-lg font-bold mb-4 text-gray-900">
          6️⃣ Waarmee kunnen we u helpen? <span className="text-gray-500 text-sm">(optioneel)</span>
        </legend>
        <div className="space-y-2">
          {HULPVRAAG_OPTIONS.map((hv) => {
            const selected = Array.isArray(t.hulpvraag)
              ? (t.hulpvraag as unknown[]).some((x) => x === hv)
              : false;
            return (
              <label key={hv} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={(e) => {
                    const current: string[] = Array.isArray(t.hulpvraag)
                      ? (t.hulpvraag as string[])
                      : [];
                    if (e.target.checked) {
                      updateField({ hulpvraag: [...current, hv] });
                    } else {
                      updateField({ hulpvraag: current.filter((h) => h !== hv) });
                    }
                  }}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="text-sm text-gray-700">
                  {
                    {
                      pve_maken: 'Programma van Eisen (PvE) opstellen',
                      architect: 'Architect/ontwerp',
                      aannemer: 'Aannemer / Bouwbegeleiding',
                      interieur: 'Interieuradvies',
                      kosten: 'Kostenraming / Budgetadvies',
                      oriënteren: 'Oriënterend gesprek',
                    }[hv]
                  }
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-[#0d3d4d] text-white font-semibold shadow hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting ? 'Bezig met starten…' : 'Start mijn Wizard'}
        </button>
      </div>
    </form>
  );
}
