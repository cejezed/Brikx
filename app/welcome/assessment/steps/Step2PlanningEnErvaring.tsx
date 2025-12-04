import type { IntakeFormData } from '../types';
import { URGENCY_OPTIONS, ERVARING_OPTIONS } from '../types';

interface Step2Props {
  data: IntakeFormData;
  onChange: (updates: Partial<IntakeFormData>) => void;
}

export default function Step2PlanningEnErvaring({ data, onChange }: Step2Props) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-serif font-bold text-stone-800 mb-2">
          Planning & ervaring
        </h2>
        <p className="text-stone-600">
          Wanneer wilt u starten en hoeveel ervaring heeft u met bouwprojecten?
        </p>
      </div>

      {/* Project Name */}
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-3">
          Projectnaam <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.projectNaam}
          onChange={(e) => onChange({ projectNaam: e.target.value })}
          placeholder="Bijv. Verbouwing Grachtenpand, Nieuwbouw Villa"
          className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
        />
        <p className="mt-2 text-xs text-stone-500">
          Dit helpt u later uw project gemakkelijk terug te vinden.
        </p>
      </div>

      {/* Timeline / Urgency */}
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-3">
          Gewenste tijdlijn <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {URGENCY_OPTIONS.map((option) => {
            const isSelected = data.urgency === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ urgency: option.value })}
                className={`
                  px-4 py-3 rounded-lg border-2 font-medium transition-all text-sm
                  ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                  }
                `}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Experience Level */}
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-3">
          Uw ervaring met bouwprojecten
          <span className="ml-1 text-xs font-normal text-stone-500">(optioneel)</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ERVARING_OPTIONS.map((option) => {
            const isSelected = data.ervaring === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  onChange({
                    ervaring: isSelected ? null : option.value,
                  })
                }
                className={`
                  relative p-4 rounded-lg border-2 transition-all text-left
                  ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }
                `}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
                <div className="font-semibold text-stone-800 mb-1">
                  {option.label}
                </div>
                <div className="text-xs text-stone-600">{option.description}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
