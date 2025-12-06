// Reusable form elements with /temp WizardForm styling
// Light mode only as per user requirements

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

// Label styling
export const FormLabel: React.FC<{ children: React.ReactNode; icon?: React.ReactNode }> = ({ children, icon }) => (
  <label className={`text-xs font-bold uppercase tracking-wider text-slate-500 ${icon ? 'flex items-center gap-2' : ''}`}>
    {icon}
    {children}
  </label>
);

// Text input with icon wrapper
export const FormInputWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative group">
    {children}
  </div>
);

// Input icon positioning
export const InputIcon: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="absolute right-5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-brikx-500 text-slate-400">
    {children}
  </div>
);

// Selection card button (for grid options)
interface SelectionCardProps {
  selected: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  detail: string;
  children?: React.ReactNode;
}

export const SelectionCard: React.FC<SelectionCardProps> = ({ selected, onClick, icon, label, detail }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative p-5 rounded-2xl text-left transition-all duration-300 group backdrop-blur-sm ${
      selected
        ? 'bg-brikx-500/90 border-2 border-brikx-500 text-white shadow-lg shadow-brikx-500/30 scale-[1.02]'
        : 'bg-white/40 border-2 border-white/50 hover:border-brikx-300 hover:bg-white/80 shadow-sm'
    }`}
  >
    <div className="flex justify-between items-start mb-3">
      <span className={`text-2xl font-black ${
        selected ? 'text-white' : 'text-slate-400 group-hover:text-brikx-500'
      }`}>
        {icon}
      </span>
      {selected && <CheckCircle2 size={20} className="text-white" />}
    </div>
    <div className={`text-base font-bold ${selected ? 'text-white' : 'text-slate-700'}`}>
      {label}
    </div>
    <div className={`text-xs mt-1 ${selected ? 'text-brikx-100' : 'text-slate-500'}`}>
      {detail}
    </div>
  </button>
);

// Inline selection button (for horizontal lists)
interface InlineButtonProps {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export const InlineButton: React.FC<InlineButtonProps> = ({ selected, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-6 py-3 rounded-xl text-sm font-bold border-2 transition-all backdrop-blur-sm ${
      selected
        ? 'bg-brikx-500 border-brikx-500 text-white shadow-lg shadow-brikx-500/30 transform scale-105'
        : 'bg-white/40 text-slate-600 border-white/50 hover:border-brikx-400 hover:text-brikx-600 hover:bg-white/80 shadow-sm'
    }`}
  >
    {children}
  </button>
);

// Navigation buttons (bottom of form)
interface NavButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant: 'primary' | 'secondary';
  children: React.ReactNode;
}

export const NavButton: React.FC<NavButtonProps> = ({ onClick, disabled, variant, children }) => {
  const isPrimary = variant === 'primary';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-8 py-4 rounded-2xl text-base font-bold transition-all duration-200 ${
        isPrimary
          ? 'bg-gradient-to-r from-brikx-500 to-emerald-500 hover:from-brikx-600 hover:to-emerald-600 text-white shadow-xl shadow-brikx-500/30 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed'
          : 'bg-white/60 hover:bg-white/80 text-slate-700 border-2 border-white/50 hover:border-slate-300 shadow-sm backdrop-blur-sm'
      }`}
    >
      {children}
    </button>
  );
};
