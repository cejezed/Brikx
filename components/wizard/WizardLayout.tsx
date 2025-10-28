// components/wizard/WizardLayout.tsx
'use client';

import { ReactNode, useEffect } from 'react';
import PatchBridge from './PatchBridge';
import { useWizardState } from '@/lib/stores/useWizardState';

type Props = {
  children?: ReactNode;
  left?: ReactNode;
  middle?: ReactNode;
  right?: ReactNode;
  top?: ReactNode;
  className?: string;
};

function FocusRouteBinder() {
  useEffect(() => {
    const onFocus = (e: Event) => {
      const { target, source } = (e as CustomEvent).detail || {};
      if (source !== 'chat') return;
      if (!target || typeof target !== 'string') return;

      const state = useWizardState.getState();
      if (target === 'tab:risicos' && typeof state.goToChapter === 'function') return void state.goToChapter('chapter_risicos');
      if (target === 'tab:preview' && typeof state.goToChapter === 'function') return void state.goToChapter('chapter_preview');

      if (typeof state.setFocusedField === 'function') state.setFocusedField(target);
      else useWizardState.setState({ focusedField: target });
    };

    window.addEventListener('ui:focus', onFocus as EventListener);
    return () => window.removeEventListener('ui:focus', onFocus as EventListener);
  }, []);

  return null;
}

export default function WizardLayout({ children, left, middle, right, top, className = '' }: Props) {
  const useThreeCols = left || middle || right;

  return (
    <main data-brikx-ui-version="2025-10-28" className={`min-h-[100dvh] bg-[#f6f8f9] ${className}`}>
      <PatchBridge />
      <FocusRouteBinder />
      <div className="mx-auto max-w-[1500px] px-4 md:px-6 lg:px-8 py-4 md:py-6 space-y-4">
        {top && <div className="sticky top-0 z-[40] bg-[#f6f8f9] pb-2">{top}</div>}
        <div className="grid grid-cols-12 gap-4 md:gap-6 items-start">
          {useThreeCols ? (
            <>
              <section aria-label="Gids – Chat" className="col-span-12 lg:col-span-4 bg-white rounded-2xl shadow-sm ring-1 ring-black/5">
                <div className="p-3 md:p-4">{left}</div>
              </section>
              <section aria-label="Canvas – Wizard" className="col-span-12 lg:col-span-6 bg-white rounded-2xl shadow-sm ring-1 ring-black/5 min-h-[60dvh]">
                <div className="p-4 md:p-6">{middle}</div>
              </section>
              <aside aria-label="Adviseur – Expert Corner" className="col-span-12 lg:col-span-2 bg-white rounded-2xl shadow-sm ring-1 ring-black/5">
                <div className="p-3 md:p-4">{right}</div>
              </aside>
            </>
          ) : (
            <section aria-label="Wizard" className="col-span-12 bg-white rounded-2xl shadow-sm ring-1 ring-black/5 min-h-[60dvh]">
              <div className="p-4 md:p-6">{children}</div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
