import type { IntakeFormData } from '../types';

interface Step3Props {
  data: IntakeFormData;
  onChange: (updates: Partial<IntakeFormData>) => void;
}

const STYLE_OPTIONS = [
  { value: 'modern', label: 'Modern', emoji: '🏢' },
  { value: 'traditional', label: 'Traditioneel', emoji: '🏠' },
  { value: 'industrial', label: 'Industrieel', emoji: '🏭' },
  { value: 'minimalist', label: 'Minimalistisch', emoji: '⬜' },
  { value: 'eclectic', label: 'Eclectisch', emoji: '🎨' },
];

const DOEL_OPTIONS = [
  { value: 'budgettering', label: 'Budgettering' },
  { value: 'vergunning', label: 'Vergunning aanvragen' },
  { value: 'realisatie', label: 'Daadwerkelijk realiseren' },
  { value: 'verkoop', label: 'Verkoop voorbereiden' },
];

export default function Step3DetailsDoelen({ data, onChange }: Step3Props) {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <header>
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight mb-3 text-slate-900 dark:text-slate-100">
          Details & Doelen
        </h1>
        <p className="text-lg leading-relaxed max-w-2xl text-slate-500 dark:text-slate-400">
          Tot slot, wat is uw stijl en doel met dit project?
        </p>
      </header>

      {/* Design Styles (multi-select) */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Gewenste stijl (meerdere mogelijk)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {STYLE_OPTIONS.map((option) => {
            const isActive = data.designStyles.includes(option.label);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  const newStyles = isActive
                    ? data.designStyles.filter(s => s !== option.label)
                    : [...data.designStyles, option.label];
                  onChange({ designStyles: newStyles });
                }}
                className={[
                  "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all backdrop-blur-sm",
                  isActive
                    ? "bg-brikx-500 border-brikx-500 text-white shadow-lg shadow-brikx-500/30 scale-105"
                    : "bg-white/40 text-slate-600 border-white/50 hover:border-brikx-400 hover:text-brikx-600 hover:bg-white/80 shadow-sm dark:bg-white/5 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10",
                ].join(" ")}
              >
                <span className="text-3xl">{option.emoji}</span>
                <span className="text-xs font-bold text-center">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Vrije toelichting */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Omschrijving van uw project
        </label>
        <textarea
          value={data.vrijeToelichting}
          onChange={(e) => onChange({ vrijeToelichting: e.target.value })}
          placeholder="Beschrijf in eigen woorden wat u voor ogen heeft..."
          rows={5}
          className="glass-textarea w-full resize-none"
        />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Hoe meer detail, hoe beter we uw wensen kunnen meenemen.
        </p>
      </div>

      {/* PvE Doelen (multi-select) */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Wat is uw doel met dit PvE? (meerdere mogelijk)
        </label>
        <div className="grid grid-cols-2 gap-3">
          {DOEL_OPTIONS.map((option) => {
            const isActive = data.pveDoelen.includes(option.label);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  const newDoelen = isActive
                    ? data.pveDoelen.filter(d => d !== option.label)
                    : [...data.pveDoelen, option.label];
                  onChange({ pveDoelen: newDoelen });
                }}
                className={[
                  "px-6 py-3 rounded-xl text-sm font-bold border-2 transition-all backdrop-blur-sm",
                  isActive
                    ? "bg-brikx-500 border-brikx-500 text-white shadow-lg shadow-brikx-500/30 transform scale-105"
                    : "bg-white/40 text-slate-600 border-white/50 hover:border-brikx-400 hover:text-brikx-600 hover:bg-white/80 shadow-sm dark:bg-white/5 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10",
                ].join(" ")}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
