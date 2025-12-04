import type { IntakeFormData } from '../types';
import { BUDGET_RANGES } from '../types';

interface Step3Props {
  data: IntakeFormData;
  onChange: (updates: Partial<IntakeFormData>) => void;
}

export default function Step3Budget({ data, onChange }: Step3Props) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-serif font-bold text-stone-800 mb-2">
          Budget
        </h2>
        <p className="text-stone-600">
          Wat is uw budgetrange voor dit project?
        </p>
      </div>

      {/* Budget Range */}
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-3">
          Budgetrange <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {BUDGET_RANGES.map((range) => {
            const isSelected = data.budgetRange === range;
            return (
              <button
                key={range}
                type="button"
                onClick={() => onChange({ budgetRange: range })}
                className={`
                  px-4 py-4 rounded-lg border-2 font-semibold transition-all
                  ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                  }
                `}
              >
                {range}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-stone-500">
          Een indicatie is voldoende. Dit helpt ons een realistische PvE op te stellen.
        </p>
      </div>

      {/* Budget Remarks */}
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-3">
          Extra opmerking over budget
          <span className="ml-1 text-xs font-normal text-stone-500">(optioneel)</span>
        </label>
        <textarea
          value={data.budgetOpmerking}
          onChange={(e) => onChange({ budgetOpmerking: e.target.value })}
          placeholder="Bijv. flexibel afhankelijk van uitkomst, nog in onderhandeling met bank, etc."
          rows={3}
          className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all resize-none"
        />
      </div>
    </div>
  );
}
