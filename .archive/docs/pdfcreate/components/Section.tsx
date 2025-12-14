import React from 'react';

export const SectionHeader: React.FC<{ title: string; number?: string }> = ({ title, number }) => (
  <div className="flex items-center gap-4 mb-8 mt-10 print:mt-6 group">
    {number && (
      <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-brikx-600 text-white font-bold text-lg rounded-sm shadow-sm group-print:bg-brikx-600 group-print:text-white">
        {number}
      </div>
    )}
    <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex-grow">
      {title}
    </h2>
    <div className="w-12 h-1 bg-brikx-200 rounded-full hidden sm:block"></div>
  </div>
);

export const SubSectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center gap-2 mt-6 mb-3">
    <div className="w-1 h-4 bg-brikx-400 rounded-full"></div>
    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
      {title}
    </h3>
  </div>
);

export const Paragraph: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-slate-600 leading-relaxed text-sm mb-4 font-normal text-justify">
    {children}
  </p>
);

export const BulletList: React.FC<{ items: string[] }> = ({ items }) => (
  <ul className="list-none space-y-3 mb-6">
    {items.map((item, idx) => (
      <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
        <div className="w-1.5 h-1.5 rounded-full bg-brikx-500 mt-2 flex-shrink-0 ring-4 ring-brikx-50"></div>
        <span className="leading-relaxed">{item}</span>
      </li>
    ))}
  </ul>
);

export const PriorityBadge: React.FC<{ level: 'Must' | 'Nice' | 'Optioneel' }> = ({ level }) => {
  const styles = {
    Must: 'bg-brikx-600 text-white border-brikx-600',
    Nice: 'bg-white text-brikx-700 border-brikx-200',
    Optioneel: 'bg-slate-50 text-slate-400 border-slate-100',
  };
  return (
    <span className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider shadow-sm ${styles[level]}`}>
      {level}
    </span>
  );
};