// components/wizard/ChapterTabs.tsx
'use client';

import React from 'react';

export type ChapterTab = { id: string; title: string };

export default function ChapterTabs({
  tabs,
  activeId,
  onChange,
}: {
  tabs: ChapterTab[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  if (!tabs?.length) return null;

  return (
    <nav aria-label="Hoofdstukken" className="w-full">
      <ul
        className={[
          // Alle tabs binnen de middenkolom zichtbaar
          'flex flex-wrap items-center gap-2',
          // compacte look
          'py-2',
        ].join(' ')}
      >
        {tabs.map((t, i) => {
          const active = t.id === activeId;
          return (
            <li key={t.id} className="shrink-0">
              <button
                type="button"
                onClick={() => onChange(t.id)}
                title={`${i + 1}. ${t.title}`}
                className={[
                  'brx-chip',                        // jouw chip-styling
                  active ? 'brx-chip-active' : 'brx-chip-idle',
                  // compacter + nette truncatie
                  'text-sm max-w-[12rem] truncate',
                  // kleine verticale ruimte zodat twee rijen mooi vallen
                  'leading-6',
                ].join(' ')}
              >
                {i + 1}. {t.title}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
