import { Calendar } from 'lucide-react';
import type { IntakeFormData } from '../types';

interface Step2Props {
  data: IntakeFormData;
  onChange: (updates: Partial<IntakeFormData>) => void;
}

const TIMELINE_OPTIONS = [
  { value: '<3mnd' as const, label: 'Direct', sub: 'Z.S.M.' },
  { value: '3-6mnd' as const, label: 'Kwartaal', sub: '3 Mnd' },
  { value: '6-12mnd' as const, label: 'Half Jaar', sub: '6 Mnd' },
  { value: '>12mnd' as const, label: '2025+', sub: 'Lang' },
  { value: 'onzeker' as const, label: 'Onzeker', sub: '?' },
];

const EXPERIENCE_LEVELS = [
  { value: 'starter' as const, label: 'Eerste keer' },
  { value: 'enigszins' as const, label: 'Enige ervaring' },
  { value: 'ervaren' as const, label: 'Ervaren' },
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
            const isActive = data.urgency === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ urgency: option.value })}
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
            const isActive = data.ervaring === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ ervaring: option.value })}
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

      {/* Budget Range */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Budget Indicatie
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: '€100k - €250k' as const, label: '€100k - €250k' },
            { value: '€250k - €500k' as const, label: '€250k - €500k' },
            { value: '€500k - €1M' as const, label: '€500k - €1M' },
            { value: '€1M+' as const, label: '€1M+' },
          ].map((option) => {
            const isActive = data.budgetRange === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ budgetRange: option.value })}
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
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          Een globale indicatie is voldoende. Dit helpt ons uw project beter te adviseren.
        </p>
        <textarea
          value={data.budgetOpmerking}
          onChange={(e) => onChange({ budgetOpmerking: e.target.value })}
          placeholder="Eventuele toelichting bij budget..."
          rows={2}
          className="glass-input w-full text-sm"
        />
      </div>
    </div>
  );
}
