import type { IntakeFormData } from '../types';
import { PROJECT_TYPES } from '../types';

interface Step1Props {
  data: IntakeFormData;
  onChange: (updates: Partial<IntakeFormData>) => void;
}

export default function Step1ProjectContext({ data, onChange }: Step1Props) {
  return (
    <div className="space-y-5 sm:space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-3xl font-serif font-bold text-stone-800 mb-2">
          Vertel ons over uw project
        </h2>
        <p className="text-sm sm:text-base text-stone-600">
          We beginnen met de basis: wat voor project heeft u in gedachten?
        </p>
      </div>

      {/* Project Type */}
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-3">
          Type project <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {PROJECT_TYPES.map((type) => {
            const isSelected = data.projectType === type.value;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => onChange({ projectType: type.value })}
                className={`
                  relative p-4 sm:p-6 rounded-lg border-2 transition-all
                  ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 shadow-md'
                      : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'
                  }
                `}
              >
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 text-white"
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
                <div className="text-2xl sm:text-4xl mb-1 sm:mb-2">{type.icon}</div>
                <div className="text-sm sm:text-base font-semibold text-stone-800 capitalize">
                  {type.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-2 sm:mb-3">
          Locatie van uw project <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.locatie}
          onChange={(e) => onChange({ locatie: e.target.value })}
          disabled={data.locatieOnbekend}
          placeholder="Bijv. Amsterdam, Rotterdam"
          className={`
            w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg transition-all text-sm sm:text-base
            ${
              data.locatieOnbekend
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : 'border-stone-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'
            }
          `}
        />
        <label className="flex items-center mt-2 sm:mt-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.locatieOnbekend}
            onChange={(e) => {
              onChange({
                locatieOnbekend: e.target.checked,
                locatie: e.target.checked ? '' : data.locatie,
              });
            }}
            className="w-4 h-4 text-emerald-600 border-stone-300 rounded focus:ring-emerald-500"
          />
          <span className="ml-2 text-xs sm:text-sm text-stone-600">
            Locatie nog niet bekend
          </span>
        </label>
      </div>

      {/* Square Meters */}
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-2 sm:mb-3">
          Oppervlakte (m²) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min="1"
          step="1"
          value={data.sqMeters}
          onChange={(e) => onChange({ sqMeters: parseInt(e.target.value, 10) || 0 })}
          placeholder="Bijv. 150"
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-sm sm:text-base"
        />
        <p className="mt-1.5 sm:mt-2 text-xs text-stone-500">
          Schatting is voldoende. Dit helpt ons de schaal van uw project te begrijpen.
        </p>
      </div>
    </div>
  );
}
