// components/wizard/ChapterNav.tsx
'use client';
import React, { useEffect, useRef, useState } from 'react';

export type ChapterItem = { key: string; title: string; status?: 'done' | 'inprogress' | 'todo' };

export default function ChapterNav({
  chapters,
  activeKey,
  onSelect,
}: {
  chapters: ChapterItem[];
  activeKey: string | null;
  onSelect: (key: string) => void;
}) {
  const ref = useRef<HTMLUListElement | null>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handle = () => {
      setScrollLeft(el.scrollLeft);
      setMaxScroll(el.scrollWidth - el.clientWidth);
    };
    handle();
    el.addEventListener('scroll', handle);
    const ro = new ResizeObserver(handle);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', handle);
      ro.disconnect();
    };
  }, []);

  const scrollBy = (dx: number) => ref.current?.scrollBy({ left: dx, behavior: 'smooth' });

  useEffect(() => {
    const el = ref.current;
    if (!el || !activeKey) return;
    const btn = el.querySelector<HTMLButtonElement>(`button[data-key="${CSS.escape(activeKey)}"]`);
    btn?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [activeKey]);

  const showLeft = scrollLeft > 10;
  const showRight = scrollLeft < maxScroll - 10;

  return (
    <nav className="relative">
      {showLeft && (
        <button
          onClick={() => scrollBy(-240)}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-20 bg-white border border-gray-200 rounded-md px-2 py-1 shadow hover:bg-gray-50"
        >
          ‹
        </button>
      )}
      {showRight && (
        <button
          onClick={() => scrollBy(240)}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-20 bg-white border border-gray-200 rounded-md px-2 py-1 shadow hover:bg-gray-50"
        >
          ›
        </button>
      )}

      <ul
        ref={ref}
        className="flex gap-2 overflow-x-auto whitespace-nowrap scroll-smooth pr-8 pl-8 scrollbar-thin"
      >
        {chapters.map((c) => {
          const active = c.key === activeKey;
          return (
            <li key={c.key} className="shrink-0">
              <button
                data-key={c.key}
                type="button"
                onClick={() => onSelect(c.key)}
                className={[
                  'brx-chip',
                  active ? 'brx-chip-active' : 'brx-chip-idle',
                  'max-w-[14rem] truncate',
                ].join(' ')}
                title={c.title}
              >
                {c.title}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
