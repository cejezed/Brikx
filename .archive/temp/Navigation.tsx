import React from 'react';
import { StepId, Step, ExpertTip } from '../types';
import { Check, Lightbulb, ChevronRight, AlertCircle } from 'lucide-react';

interface NavigationProps {
  steps: Step[];
  currentStepId: StepId;
  onStepClick: (id: StepId) => void;
  tips: ExpertTip[];
  theme: 'light' | 'dark';
}

export const Navigation: React.FC<NavigationProps> = ({ steps, currentStepId, onStepClick, tips, theme }) => {
  const isDark = theme === 'dark';

  return (
    <div className="h-full flex flex-col relative py-8">
      
      {/* Header */}
      <div className="px-6 mb-6">
        <h3 className={`text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Overzicht</h3>
      </div>

      {/* Scrollable List - No Scrollbar */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-1.5 pr-2">
          {steps.map((step, index) => {
            const isActive = step.id === currentStepId;
            const isCompleted = steps.findIndex(s => s.id === currentStepId) > index;

            // Light Mode: Glass tile with Teal accent
            const lightActiveClasses = 'bg-white/60 border-l-4 border-brikx-500 text-slate-900 shadow-sm backdrop-blur-md';
            const lightInactiveClasses = 'hover:bg-white/40 border-l-4 border-transparent text-slate-500 hover:text-slate-700';

            const darkActiveClasses = 'bg-slate-900/60 rounded-l-2xl shadow-[-4px_4px_15px_-5px_rgba(0,0,0,0.5)] border-y border-l border-white/5 text-white scale-[1.02] origin-right';
            const darkInactiveClasses = 'hover:bg-white/5 rounded-l-2xl border border-transparent text-slate-500 hover:text-slate-300 mx-2 w-auto';

            return (
              <div key={step.id} className="relative">
                  {/* Active Connector (Dark Mode only) */}
                  {isActive && isDark && (
                    <div className="absolute right-0 top-0 bottom-0 w-6 translate-x-full z-20 backdrop-blur-[0px] bg-slate-900/60"></div>
                  )}
                  
                  <button
                    onClick={() => onStepClick(step.id)}
                    className={`relative w-full flex items-center gap-3 px-6 py-3.5 text-left transition-all duration-300 group ${
                        isActive 
                        ? (isDark ? darkActiveClasses : lightActiveClasses)
                        : (isDark ? darkInactiveClasses : lightInactiveClasses)
                    }`}
                  >
                     {/* Step Indicator */}
                     {isCompleted ? (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            isDark 
                                ? (isActive ? 'bg-brikx-500 text-white' : 'bg-slate-800 text-brikx-400')
                                : 'bg-brikx-100 text-brikx-600' // Green checkmark on light
                        }`}>
                            <Check size={10} strokeWidth={3} />
                        </div>
                     ) : isActive ? (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                            isDark 
                                ? 'bg-white text-slate-900 shadow-white/10' 
                                : 'bg-brikx-500 text-white shadow-brikx-200'
                        }`}>
                            <span className="text-[9px] font-bold">{index + 1}</span>
                        </div>
                     ) : (
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                            isDark 
                            ? 'border-white/10 text-white/20 group-hover:border-white/30 group-hover:text-white/60' 
                            : 'border-slate-300 text-slate-400 group-hover:border-brikx-300 group-hover:text-brikx-500'
                        }`}>
                            <span className="text-[9px] font-bold">{index + 1}</span>
                        </div>
                     )}
                     
                     {/* Label */}
                     <div className="min-w-0 flex-1">
                         <div className="text-sm font-bold truncate transition-colors">
                            {step.label}
                         </div>
                     </div>

                     {/* Arrow for Active */}
                     {isActive && <ChevronRight size={14} className={`animate-in slide-in-from-left-2 fade-in duration-500 ${isDark ? 'text-white' : 'text-brikx-600'}`} />}
                  </button>
              </div>
            );
          })}
      </div>

      {/* Expert Tips */}
      <div className="px-4 pb-6 mt-4 relative z-20">
         {tips.length > 0 ? (
            <div className="animate-in slide-in-from-bottom-4 fade-in duration-700">
                <div className={`border rounded-2xl p-5 shadow-sm relative overflow-hidden group backdrop-blur-sm ${
                    isDark 
                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-white/10 shadow-lg' 
                    : 'bg-emerald-50/80 border-emerald-100' // Mint bubble style glass
                }`}>
                    {/* Glowing effect */}
                    <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700 ${isDark ? 'bg-brikx-500/20' : 'bg-emerald-200/50'}`}></div>
                    
                    <div className="flex items-center gap-2 mb-3 relative z-10">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm ${
                            isDark 
                            ? 'bg-slate-700 text-brikx-300' 
                            : 'bg-emerald-600 text-white' // Dark green icon circle
                        }`}>
                            <Lightbulb size={14} fill="currentColor" />
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-emerald-800'}`}>Expert Tip</span>
                    </div>
                    
                    <p className={`text-xs leading-relaxed font-medium relative z-10 ${isDark ? 'text-slate-300' : 'text-emerald-900'}`}>
                        {tips[0].content}
                    </p>
                </div>
            </div>
         ) : (
            <div className={`border rounded-2xl p-5 text-center backdrop-blur-sm ${isDark ? 'bg-white/5 border-white/5' : 'bg-white/30 border-slate-200'}`}>
                 <div className={`inline-flex justify-center items-center w-8 h-8 rounded-full mb-2 ${isDark ? 'bg-white/5' : 'bg-white border border-slate-200'}`}>
                    <AlertCircle size={14} className={isDark ? 'text-slate-600' : 'text-slate-400'} />
                 </div>
                 <p className={`text-[10px] ${isDark ? 'text-slate-600' : 'text-slate-500'}`}>Geen specifieke tips voor dit onderdeel.</p>
            </div>
         )}
      </div>
    </div>
  );
};