'use client';

import { useWizardState } from '@/lib/stores/useWizardState';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { TriageData, ProjectType, ProjectSize, Urgency, HulpVraag } from '@/types/wizard';
import { generateChapters } from '@/lib/wizard/generateChapters';

export default function IntakeForm() {
  const router = useRouter();
  const triage = useWizardState((s) => s.triage);
  const patchTriage = useWizardState((s) => s.patchTriage);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (patch: Record<string, any>) => {
    patchTriage(patch);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!triage.projectType || (Array.isArray(triage.projectType) && triage.projectType.length === 0)) {
      newErrors.projectType = 'Selecteer minstens één projecttype';
    }

    if (!triage.projectSize) {
      newErrors.projectSize = 'Selecteer een schaal';
    }

    if (!triage.urgency) {
      newErrors.urgency = 'Selecteer een starttijdstip';
    }

    if (!triage.hulpvraag || (Array.isArray(triage.hulpvraag) && triage.hulpvraag.length === 0)) {
      newErrors.hulpvraag = 'Selecteer minstens één hulpvraag';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit button clicked');
    
    if (!validateForm()) {
      console.log('Validation failed');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Creating triageData...');
      const triageData: TriageData = {
        projectType: Array.isArray(triage.projectType) 
          ? (triage.projectType as ProjectType[])
          : triage.projectType 
            ? [triage.projectType as ProjectType]
            : [],
        projectSize: triage.projectSize as ProjectSize,
        urgency: triage.urgency as Urgency,
        budget: triage.budget as any,
        budgetCustom: triage.budgetCustom,
        stijlvoorkeur: triage.stijlvoorkeur as any,
        moodboardUrl: triage.moodboardUrl,
        bestaandeDocumenten: triage.bestaandeDocumenten as any,
        hulpvraag: (triage.hulpvraag as HulpVraag[]) || [],
      };

      console.log('Triage data:', triageData);

      const result = generateChapters(triageData as any);
      console.log('Generated chapters:', result.chapters);
      console.log('Mode:', result.mode);
      console.log('Reasoning:', result.reasoning);

      useWizardState.setState({
        triage: triageData,
        chapterFlow: result.chapters as any,
        mode: result.mode as any,
      });

      console.log('Redirecting to /wizard');
      router.push('/wizard');
    } catch (error) {
      console.error('Intake error:', error);
      setErrors({ 
        submit: error instanceof Error 
          ? error.message 
          : 'Er ging iets mis. Probeer opnieuw.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
          1️⃣ Wat voor project(en) hebt u? <span className="text-red-600">*</span>
        </legend>
        <p className="text-sm text-gray-600 mb-4">Meerdere opties mogelijk</p>

        <div className="space-y-3">
          {[
            { id: 'interieur', label: 'Interieur (styling/restyle)' },
            { id: 'verbouwing_binnen', label: 'Verbouwing binnenhuis' },
            { id: 'uitbouw', label: 'Uitbouw (toevoeging)' },
            { id: 'nieuwbouw', label: 'Nieuwbouw' },
            { id: 'bijgebouw', label: 'Bijgebouw (aparte ruimte)' },
            { id: 'renovatie', label: 'Renovatie / Restauratie' },
          ].map((type) => {
            const current = Array.isArray(triage.projectType) ? triage.projectType : [];
            const checked = current.includes(type.id);

            return (
              <label key={type.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const updated = e.target.checked
                      ? [...current, type.id]
                      : current.filter((t) => t !== type.id);
                    updateField({ projectType: updated });
                  }}
                  className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-700">{type.label}</span>
              </label>
            );
          })}
        </div>

        {errors.projectType && (
          <p className="text-red-600 text-sm mt-3 font-semibold">{errors.projectType}</p>
        )}
      </fieldset>

      {/* 2️⃣ SCHAAL */}
      <div>
        <label className="block">
          <span className="block text-lg font-bold mb-2 text-gray-900">
            2️⃣ Hoe groot is het project? <span className="text-red-600">*</span>
          </span>
          <select
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-[#0d3d4d] focus:border-transparent"
            value={triage.projectSize ?? ''}
            onChange={(e) => updateField({ projectSize: e.target.value || null })}
          >
            <option value="">– Kies een grootte –</option>
            <option value="klein">Klein (minder dan 50 m²)</option>
            <option value="middel">Middel (50 tot 200 m²)</option>
            <option value="groot">Groot (meer dan 200 m²)</option>
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
            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-[#0d3d4d] focus:border-transparent"
            value={triage.urgency ?? ''}
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
          {[
            { id: 'lt100k', label: 'Minder dan EUR 100.000' },
            { id: '100-250k', label: 'EUR 100.000 tot EUR 250.000' },
            { id: '250-500k', label: 'EUR 250.000 tot EUR 500.000' },
            { id: 'gt500k', label: 'Meer dan EUR 500.000' },
          ].map((option) => (
            <label key={option.id} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="budgetOption"
                checked={(triage.budget ?? '') === option.id}
                onChange={() => updateField({ budget: option.id })}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>

        <div className="border-t pt-4">
          <label className="block">
            <span className="text-sm font-medium mb-2 block">Of vul uw eigen bedrag in:</span>
            <div className="flex gap-2">
              <span className="text-gray-600 py-2">EUR</span>
              <input
                type="number"
                className="flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#0d3d4d] focus:border-transparent"
                value={triage.budgetCustom ?? ''}
                onChange={(e) => updateField({ budgetCustom: e.target.value ? Number(e.target.value) : null })}
                placeholder="bijv. 150000"
              />
            </div>
          </label>
        </div>
      </fieldset>

      {/* 5️⃣ VISUAL CONTEXT */}
      <fieldset className="border border-gray-300 rounded-lg p-6 bg-gray-50">
        <legend className="text-lg font-bold mb-4 text-gray-900">
          5️⃣ Visuele Context <span className="text-gray-500 text-sm">(optioneel)</span>
        </legend>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            5A. Welke woonstijl(en) spreken u aan?
          </h3>
          <div className="space-y-2">
            {[
              { id: 'modern', label: 'Modern en Strak' },
              { id: 'landelijk', label: 'Landelijk en Warm' },
              { id: 'industrieel', label: 'Industrieel en Robuust' },
              { id: 'scandinavisch', label: 'Scandinavisch en Licht' },
              { id: 'klassiek', label: 'Klassiek en Elegant' },
              { id: 'onbekend', label: 'Weet ik nog niet / Anders' },
            ].map((style) => {
              const current = Array.isArray(triage.stijlvoorkeur) ? triage.stijlvoorkeur : [];
              const checked = current.includes(style.id);

              return (
                <label key={style.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const updated = e.target.checked
                        ? [...current, style.id]
                        : current.filter((s) => s !== style.id);
                      updateField({ stijlvoorkeur: updated });
                    }}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">{style.label}</span>
                </label>
              );
            })}
          </div>

          <div className="mt-4">
            <label className="block">
              <span className="text-sm font-medium mb-2 block text-gray-900">
                Heeft u al een online moodboard? (bv. Pinterest)
              </span>
              <input
                type="url"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#0d3d4d] focus:border-transparent text-sm"
                value={triage.moodboardUrl ?? ''}
                onChange={(e) => updateField({ moodboardUrl: e.target.value || null })}
                placeholder="https://pinterest.com/..."
              />
            </label>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            5B. Welke documenten hebt u al?
          </h3>
          <div className="space-y-2">
            {[
              { id: 'fotos', label: "Foto's van de huidige situatie" },
              { id: 'bouwtekeningen', label: 'Bouwtekeningen (oud of nieuw)' },
              { id: 'ontwerp', label: 'Een (schets)ontwerp' },
              { id: 'geen', label: 'Ik heb nog geen documenten' },
            ].map((doc) => {
              const current = Array.isArray(triage.bestaandeDocumenten) ? triage.bestaandeDocumenten : [];
              const checked = current.includes(doc.id);

              return (
                <label key={doc.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const updated = e.target.checked
                        ? [...current, doc.id]
                        : current.filter((d) => d !== doc.id);
                      updateField({ bestaandeDocumenten: updated });
                    }}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">{doc.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </fieldset>

      {/* 6️⃣ HULPVRAAG */}
      <fieldset className="border border-[#0d3d4d] rounded-lg p-6 bg-blue-50">
        <legend className="text-lg font-bold mb-4 text-gray-900">
          6️⃣ Waar zoekt u op dit moment hulp bij? <span className="text-red-600">*</span>
        </legend>
        <p className="text-sm text-gray-600 mb-4">Meerdere opties mogelijk</p>

        <div className="space-y-3">
          {[
            { id: 'pve_maken', label: 'Mijn wensen en eisen op een rij zetten (een PvE maken)' },
            { id: 'architect', label: 'Ik zoek een architect of tekenbureau' },
            { id: 'aannemer', label: 'Ik zoek een aannemer of vakmensen' },
            { id: 'interieur', label: 'Ik zoek interieur- of stylingadvies' },
            { id: 'kosten', label: 'Ik wil inzicht in kosten en subsidies' },
            { id: 'oriënteren', label: 'Ik oriënteer mij nog breed' },
          ].map((help) => {
            const current = Array.isArray(triage.hulpvraag) ? triage.hulpvraag : [];
            const checked = current.includes(help.id);

            return (
              <label key={help.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const updated = e.target.checked
                      ? [...current, help.id]
                      : current.filter((h) => h !== help.id);
                    updateField({ hulpvraag: updated });
                  }}
                  className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-700">{help.label}</span>
              </label>
            );
          })}
        </div>

        {errors.hulpvraag && (
          <p className="text-red-600 text-sm mt-3 font-semibold">{errors.hulpvraag}</p>
        )}
      </fieldset>

      {/* SUBMIT */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-[#0d3d4d] text-white font-bold py-3 rounded-lg hover:bg-[#0a2a37] disabled:opacity-50 transition"
        >
          {isSubmitting ? 'Laden...' : '→ Begin met uw PvE'}
        </button>
      </div>
    </form>
  );
}