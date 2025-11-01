'use client';

import React from 'react';
import type { ChapterKey } from '@/types/wizard';

export type ChapterTab = { id: ChapterKey; title: string };

export default function ChapterTabs({
  tabs,
  activeId,
  onChange,
}: {
  tabs: ChapterTab[];
  activeId: ChapterKey;
  onChange: (id: ChapterKey) => void;
}) {
  if (!tabs?.length) return null;

  return (
    <nav aria-label="Hoofdstukken" className="w-full">
      <ul className={['flex flex-wrap items-center gap-2', 'py-2'].join(' ')}>
        {tabs.map((t, i) => {
          const active = t.id === activeId;
          return (
            <li key={t.id} className="shrink-0">
              <button
                type="button"
                onClick={() => onChange(t.id)}
                title={`${i + 1}. ${t.title}`}
                className={[
                  'brx-chip',
                  active ? 'brx-chip-active' : 'brx-chip-idle',
                  'text-sm max-w-[12rem] truncate',
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
