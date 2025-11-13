'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  section?: string;
  isOpen?: boolean;
  onToggle?: (section: string) => void;
  children: React.ReactNode;
}

export default function CollapsibleSection({
  title,
  section,
  isOpen = false,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  const handleClick = () => {
    if (section && onToggle) {
      onToggle(section);
    }
  };

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
      <button
        onClick={handleClick}
        className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && <div className="p-4 bg-white">{children}</div>}
    </div>
  );
}