import type { IntakeFormData } from '../types';
import { DESIGN_STYLES } from '../types';

interface Step4Props {
  data: IntakeFormData;
  onChange: (updates: Partial<IntakeFormData>) => void;
}

export default function Step4StijlEnToelichting({ data, onChange }: Step4Props) {
  const toggleDesignStyle = (style: string) => {
    if (data.designStyles.includes(style)) {
      onChange({ designStyles: data.designStyles.filter((s) => s !== style) });
    } else {
      onChange({ designStyles: [...data.designStyles, style] });
    }
  };

  const hasAnders = data.designStyles.includes('Anders');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-serif font-bold text-stone-800 mb-2">
          Stijl & toelichting
        </h2>
        <p className="text-stone-600">
          Heeft u een voorkeur voor een bepaalde stijl? (Alles is optioneel)
        </p>
      </div>

      {/* Design Styles */}
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-3">
          Voorkeursstijl(en)
          <span className="ml-1 text-xs font-normal text-stone-500">
            (optioneel, meerdere mogelijk)
          </span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {DESIGN_STYLES.map((style) => {
            const isSelected = data.designStyles.includes(style);
            return (
              <button
                key={style}
                type="button"
                onClick={() => toggleDesignStyle(style)}
                className={`
                  relative px-4 py-3 rounded-lg border-2 font-medium transition-all
                  ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
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
                {style}
              </button>
            );
          })}
        </div>

        {/* Anders text field */}
        {hasAnders && (
          <div className="mt-4">
            <input
              type="text"
              value={data.designStyleAnders}
              onChange={(e) => onChange({ designStyleAnders: e.target.value })}
              placeholder="Beschrijf uw gewenste stijl"
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
            />
          </div>
        )}
      </div>

      {/* Free Text */}
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-3">
          Vrije toelichting
          <span className="ml-1 text-xs font-normal text-stone-500">(optioneel)</span>
        </label>
        <textarea
          value={data.vrijeToelichting}
          onChange={(e) => onChange({ vrijeToelichting: e.target.value })}
          placeholder="Deel eventuele extra wensen, gedachten of bijzonderheden over uw project..."
          rows={4}
          className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all resize-none"
        />
      </div>
    </div>
  );
}
