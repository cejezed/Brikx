import { Calendar } from 'lucide-react';
import type { IntakeFormData } from '../types';

interface Step2Props {
  data: IntakeFormData;
  onChange: (updates: Partial<IntakeFormData>) => void;
}

const TIMELINE_OPTIONS = [
  { value: 'asap', label: 'Direct', sub: 'Z.S.M.' },
  { value: '3months', label: 'Kwartaal', sub: '3 Mnd' },
  { value: '6months', label: 'Half Jaar', sub: '6 Mnd' },
  { value: 'year', label: '2025+', sub: 'Lang' },
];

const EXPERIENCE_LEVELS = [
  { value: 'first', label: 'Eerste keer' },
  { value: 'some', label: 'Enige ervaring' },
  { value: 'experienced', label: 'Ervaren' },
];

export default function Step2PlanningBudget({ data, onChange }: Step2Props) {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <header>
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight mb-3 text-slate-900 dark:text-slate-100">
          Planning & Budget
        </h1>
        <p className="text-lg leading-relaxed max-w-2xl text-slate-500 dark:text-slate-400">
          Wanneer wilt u starten en wat is uw budget?
        </p>
      </header>

      {/* Timeline */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <Calendar size={14} className="text-brikx-500" />
          Wanneer wilt u starten?
        </label>
        <div className="flex flex-wrap gap-3">
          {TIMELINE_OPTIONS.map((option) => {
            const isActive = data.timeline === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ timeline: option.value })}
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

      {/* Experience */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Heeft u eerder een bouwproject gedaan?
        </label>
        <div className="grid grid-cols-3 gap-3">
          {EXPERIENCE_LEVELS.map((option) => {
            const isActive = data.experience === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ experience: option.value })}
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

      {/* Budget */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Budget Indicatie
        </label>
        <div className="relative rounded-2xl p-2 border-2 focus-within:ring-4 transition-all backdrop-blur-sm bg-white/40 border-white/50 focus-within:border-brikx-400 focus-within:ring-brikx-400/20 shadow-sm dark:bg-white/5 dark:border-white/10">
          <input
            type="text"
            inputMode="numeric"
            value={data.budget ? `€ ${Number(data.budget).toLocaleString('nl-NL')}` : ''}
            onFocus={(e) => {
              if (data.budget) {
                e.target.value = String(data.budget);
              }
            }}
            onBlur={(e) => {
              if (e.target.value) {
                const num = Number(e.target.value.replace(/\D/g, ''));
                e.target.value = `€ ${num.toLocaleString('nl-NL')}`;
              }
            }}
            onChange={(e) => onChange({ budget: Number(e.target.value.replace(/\D/g, '')) || 0 })}
            placeholder="€ 0"
            className="w-full text-4xl font-black tracking-tight bg-transparent px-6 py-4 focus:outline-none placeholder:text-slate-400 text-slate-900 dark:text-white"
          />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Een globale indicatie is voldoende. Dit helpt ons uw project beter te adviseren.
        </p>
        <label className="flex items-center mt-2 cursor-pointer">
          <input
            type="checkbox"
            checked={data.budgetOnbekend}
            onChange={(e) => onChange({
              budgetOnbekend: e.target.checked,
              budget: e.target.checked ? 0 : data.budget,
            })}
            className="w-4 h-4 text-brikx-600 border-slate-300 rounded focus:ring-brikx-500 dark:border-slate-600"
          />
          <span className="ml-2 text-xs text-slate-600 dark:text-slate-400">
            Budget nog niet bekend
          </span>
        </label>
      </div>
    </div>
  );
}
