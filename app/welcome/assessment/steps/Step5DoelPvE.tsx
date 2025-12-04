import type { IntakeFormData } from '../types';
import { PVE_DOELEN } from '../types';

interface Step5Props {
  data: IntakeFormData;
  onChange: (updates: Partial<IntakeFormData>) => void;
}

export default function Step5DoelPvE({ data, onChange }: Step5Props) {
  const togglePveDoel = (doel: string) => {
    if (data.pveDoelen.includes(doel)) {
      onChange({ pveDoelen: data.pveDoelen.filter((d) => d !== doel) });
    } else {
      onChange({ pveDoelen: [...data.pveDoelen, doel] });
    }
  };

  const hasAnders = data.pveDoelen.includes('Anders');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-serif font-bold text-stone-800 mb-2">
          Doel van het PvE
        </h2>
        <p className="text-stone-600">
          Waarvoor gaat u het Programma van Eisen gebruiken?
        </p>
      </div>

      {/* PvE Goals */}
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-3">
          Selecteer uw doelen <span className="text-red-500">*</span>
          <span className="ml-1 text-xs font-normal text-stone-500">
            (minimaal 1, meerdere mogelijk)
          </span>
        </label>
        <div className="space-y-3">
          {PVE_DOELEN.map((doel) => {
            const isSelected = data.pveDoelen.includes(doel);
            return (
              <label
                key={doel}
                className={`
                  flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => togglePveDoel(doel)}
                  className="mt-0.5 w-5 h-5 text-emerald-600 border-stone-300 rounded focus:ring-emerald-500"
                />
                <span className="ml-3 text-stone-800 font-medium">{doel}</span>
              </label>
            );
          })}
        </div>

        {/* Anders text field */}
        {hasAnders && (
          <div className="mt-4">
            <input
              type="text"
              value={data.pveAndersDoel}
              onChange={(e) => onChange({ pveAndersDoel: e.target.value })}
              placeholder="Beschrijf uw doel"
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
            />
          </div>
        )}
      </div>

      {/* Extra Wensen */}
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-3">
          Extra wensen of zorgen
          <span className="ml-1 text-xs font-normal text-stone-500">(optioneel)</span>
        </label>
        <textarea
          value={data.extraWensen}
          onChange={(e) => onChange({ extraWensen: e.target.value })}
          placeholder="Heeft u nog specifieke wensen, zorgen of vragen die belangrijk zijn voor uw PvE?"
          rows={4}
          className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all resize-none"
        />
      </div>
    </div>
  );
}
