import { Home, Hammer, Scaling, Layers, HelpCircle } from 'lucide-react';
import type { IntakeFormData } from '../types';

interface Step1Props {
  data: IntakeFormData;
  onChange: (updates: Partial<IntakeFormData>) => void;
}

const PROJECT_TYPES = [
  { value: 'nieuwbouw', label: 'Nieuwbouw', icon: Home },
  { value: 'verbouwing', label: 'Verbouwing', icon: Hammer },
  { value: 'bijgebouw', label: 'Bijgebouw', icon: Scaling },
  { value: 'hybride', label: 'Hybride', icon: Layers },
  { value: 'anders', label: 'Anders', icon: HelpCircle },
];

export default function Step1ProjectEssentials({ data, onChange }: Step1Props) {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <header>
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight mb-3 text-slate-900 dark:text-slate-100">
          Project Essentials
        </h1>
        <p className="text-lg leading-relaxed max-w-2xl text-slate-500 dark:text-slate-400">
          Laten we beginnen met de basis van uw project.
        </p>
      </header>

      {/* Project Type */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Wat voor project wilt u uitwerken?
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {PROJECT_TYPES.map((option) => {
            const Icon = option.icon;
            const isActive = data.projectType === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ projectType: option.value })}
                className={[
                  "flex flex-col items-center justify-center gap-3 p-4 aspect-square",
                  "rounded-2xl border-2 transition-all duration-300",
                  isActive
                    ? "bg-brikx-500 border-brikx-500 text-white shadow-lg shadow-brikx-500/30 scale-105"
                    : "bg-white/40 border-white/60 backdrop-blur-xl text-slate-600 hover:border-brikx-400 hover:text-brikx-600 hover:bg-white/60 shadow-sm dark:bg-white/5 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10",
                ].join(" ")}
              >
                <Icon size={32} className={isActive ? "text-white" : "text-slate-500 dark:text-slate-400"} />
                <span className="text-xs font-bold text-center leading-tight">
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Project Name & Location */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Projectnaam
          </label>
          <input
            className="glass-input w-full"
            value={data.projectNaam || ''}
            onChange={(e) => onChange({ projectNaam: e.target.value })}
            placeholder="Bijv. Uitbouw Serre"
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Locatie
          </label>
          <input
            className="glass-input w-full"
            value={data.locatie}
            onChange={(e) => onChange({ locatie: e.target.value })}
            disabled={data.locatieOnbekend}
            placeholder="Bijv. Amsterdam"
          />
          <label className="flex items-center mt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.locatieOnbekend}
              onChange={(e) => onChange({
                locatieOnbekend: e.target.checked,
                locatie: e.target.checked ? '' : data.locatie,
              })}
              className="w-4 h-4 text-brikx-600 border-slate-300 rounded focus:ring-brikx-500 dark:border-slate-600"
            />
            <span className="ml-2 text-xs text-slate-600 dark:text-slate-400">
              Locatie nog niet bekend
            </span>
          </label>
        </div>
      </div>

      {/* Square Meters */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Oppervlakte (m²)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { value: '<75m2', label: '< 75 m²' },
            { value: '75-150m2', label: '75–150 m²' },
            { value: '150-250m2', label: '150–250 m²' },
            { value: '>250m2', label: '> 250 m²' },
          ].map((option) => {
            const isActive = data.projectSize === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({
                  projectSize: option.value,
                  sqMeters: option.value === '<75m2' ? 50 : option.value === '75-150m2' ? 100 : option.value === '150-250m2' ? 200 : 300
                })}
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
