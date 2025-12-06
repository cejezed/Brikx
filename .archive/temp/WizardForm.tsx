import React from 'react';
import { FormData } from '../types';
import { HelpCircle, MapPin, Tag, Home, Calendar, CheckCircle2 } from 'lucide-react';

interface WizardFormProps {
  formData: FormData;
  onChange: (field: keyof FormData, value: string) => void;
  onTriggerAI: (context: string) => void;
  theme: 'light' | 'dark';
}

export const WizardForm: React.FC<WizardFormProps> = ({ formData, onChange, onTriggerAI, theme }) => {
  const isDark = theme === 'dark';
  
  const sizeOptions = [
    { value: 'small', label: 'Compact', detail: '< 50 m²', icon: 'S' },
    { value: 'medium', label: 'Medium', detail: '50-150 m²', icon: 'M' },
    { value: 'large', label: 'Ruim', detail: '150-250 m²', icon: 'L' },
    { value: 'xl', label: 'Groot', detail: '> 250 m²', icon: 'XL' },
  ];

  const timelineOptions = [
    { value: 'asap', label: 'Direct', sub: 'Z.S.M.' },
    { value: '3months', label: 'Kwartaal', sub: '3 Mnd' },
    { value: '6months', label: 'Half Jaar', sub: '6 Mnd' },
    { value: 'year', label: '2025+', sub: 'Lang' },
  ];

  // Dynamic Classes
  const labelClass = `text-xs font-bold uppercase ml-1 tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-500'}`;
  
  // Input: Glass effect in both modes
  const inputClass = `w-full border-2 rounded-xl px-5 py-4 font-bold placeholder:font-normal focus:ring-4 transition-all outline-none backdrop-blur-sm 
    ${isDark 
        ? 'bg-white/5 border-white/5 text-white placeholder:text-slate-600 focus:bg-white/10 focus:border-brikx-500/50 focus:ring-brikx-500/10' 
        : 'bg-white/40 border-white/50 text-slate-800 placeholder:text-slate-400 focus:bg-white/80 focus:border-brikx-400 focus:ring-brikx-400/20 shadow-sm'}`;
  
  const iconClass = `absolute right-5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-brikx-500 ${isDark ? 'text-slate-600' : 'text-slate-400'}`;

  // Currency Formatter
  const handleBudgetBlur = () => {
    if (!formData.budget) return;
    const number = parseInt(formData.budget.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(number)) {
      const formatted = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(number);
      onChange('budget', formatted);
    }
  };

  const handleBudgetFocus = () => {
    if (!formData.budget) return;
    const raw = formData.budget.replace(/[^0-9]/g, '');
    onChange('budget', raw);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div>
        <h1 className={`text-3xl lg:text-4xl font-black tracking-tight mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          De Basis.
        </h1>
        <p className={`text-lg leading-relaxed max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Laten we de fundering leggen. Jules gebruikt deze data om de technische vereisten te berekenen.
        </p>
      </div>

      <div className="space-y-10">
        
        {/* Row 1: Inputs */}
        <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className={labelClass}>Projectnaam</label>
              <div className="relative group">
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => onChange('projectName', e.target.value)}
                  placeholder="Bijv. Uitbouw Serre"
                  className={inputClass}
                />
                 <Tag size={18} className={iconClass} />
              </div>
            </div>

            <div className="space-y-3">
              <label className={labelClass}>Locatie</label>
              <div className="relative group">
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => onChange('location', e.target.value)}
                  placeholder="Postcode + Huisnr."
                  className={inputClass}
                />
                <MapPin size={18} className={iconClass} />
              </div>
            </div>
        </div>

        {/* Row 2: Selection Grid */}
        <div className="space-y-3">
            <label className={`flex items-center gap-2 ${labelClass}`}>
                <Home size={14} className="text-brikx-500" />
                Projectomvang
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {sizeOptions.map((option) => {
                    const isSelected = formData.size === option.value;
                    return (
                        <button
                            key={option.value}
                            onClick={() => onChange('size', option.value)}
                            className={`relative p-5 rounded-2xl text-left transition-all duration-300 group backdrop-blur-sm ${
                                isSelected 
                                ? (isDark 
                                    ? 'bg-brikx-500 text-white shadow-xl shadow-brikx-500/20 scale-[1.02]' 
                                    : 'bg-brikx-500/90 border-2 border-brikx-500 text-white shadow-lg shadow-brikx-500/30 scale-[1.02]') 
                                : isDark 
                                    ? 'bg-white/5 border-2 border-transparent hover:border-white/10 hover:bg-white/10' 
                                    : 'bg-white/40 border-2 border-white/50 hover:border-brikx-300 hover:bg-white/80 shadow-sm'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className={`text-2xl font-black ${
                                    isSelected 
                                    ? 'text-white' 
                                    : (isDark ? 'text-slate-600 group-hover:text-slate-400' : 'text-slate-400 group-hover:text-brikx-500')
                                }`}>{option.icon}</span>
                                {isSelected && <CheckCircle2 size={20} className="text-white" />}
                            </div>
                            <div className={`text-base font-bold ${
                                isSelected 
                                ? 'text-white' 
                                : (isDark ? 'text-slate-300' : 'text-slate-700')
                            }`}>{option.label}</div>
                            <div className={`text-xs mt-1 ${
                                isSelected 
                                ? 'text-brikx-100' 
                                : (isDark ? 'text-slate-500' : 'text-slate-500')
                            }`}>{option.detail}</div>
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Row 3: Budget */}
        <div className="space-y-3">
             <div className="flex justify-between items-end">
                <label className={labelClass}>Budget Indicatie</label>
             </div>
             <div className={`relative rounded-2xl p-2 border-2 focus-within:ring-4 transition-all backdrop-blur-sm ${
                 isDark 
                 ? 'bg-white/5 border-white/5 focus-within:border-brikx-500/50 focus-within:ring-brikx-500/10' 
                 : 'bg-white/40 border-white/50 focus-within:border-brikx-400 focus-within:ring-brikx-400/20 shadow-sm'
             }`}>
                 <input
                    type="text"
                    value={formData.budget}
                    onChange={(e) => onChange('budget', e.target.value)}
                    onBlur={handleBudgetBlur}
                    onFocus={handleBudgetFocus}
                    placeholder="€ 0"
                    className={`w-full text-4xl font-black tracking-tight bg-transparent px-6 py-4 focus:outline-none placeholder:text-slate-700 ${
                        isDark ? 'text-white' : 'text-slate-900'
                    }`}
                />
                <button 
                    onClick={() => onTriggerAI('budget_help')}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-colors border shadow-sm ${
                        isDark 
                        ? 'bg-white/10 hover:bg-brikx-500/20 text-slate-400 hover:text-brikx-300 border-white/5' 
                        : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border-emerald-200' 
                    }`}
                >
                    <HelpCircle size={14} /> 
                    <span>Hulp nodig?</span>
                </button>
             </div>
        </div>

        {/* Row 4: Timeline */}
        <div className="space-y-3">
            <label className={`flex items-center gap-2 ${labelClass}`}>
                <Calendar size={14} className="text-brikx-500" />
                Planning
            </label>
            <div className="flex flex-wrap gap-3">
                {timelineOptions.map((option) => {
                    const isSelected = formData.timeline === option.value;
                    return (
                        <button
                            key={option.value}
                            onClick={() => {
                                onChange('timeline', option.value);
                                if(option.value === 'asap') onTriggerAI('timeline_urgent');
                            }}
                            className={`px-6 py-3 rounded-xl text-sm font-bold border-2 transition-all backdrop-blur-sm ${
                                isSelected 
                                ? 'bg-brikx-500 border-brikx-500 text-white shadow-lg shadow-brikx-500/30 transform scale-105' 
                                : isDark
                                    ? 'bg-transparent text-slate-400 border-slate-700 hover:border-white/30 hover:text-white'
                                    : 'bg-white/40 text-slate-600 border-white/50 hover:border-brikx-400 hover:text-brikx-600 hover:bg-white/80 shadow-sm'
                            }`}
                        >
                            {option.label}
                        </button>
                    )
                })}
            </div>
        </div>

      </div>
    </div>
  );
};