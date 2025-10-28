// components/wizard/WizardRouter.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useWizardState } from '@/lib/stores/useWizardState';

type Chapter = { id: string; title: string; Comp: React.ComponentType<any> };
type Props = { activeId?: string; onChange?: (id: string) => void };

function lazy<T = {}>(imp: () => Promise<any>, name?: string) {
  return dynamic<T>(imp, {
    ssr: false,
    loading: () => (
      <div className="text-sm text-gray-500">
        Hoofdstuk{name ? ` ${name}` : ''} laden…
      </div>
    ),
  });
}

const CHAPTERS: Chapter[] = [
  { id: 'basis',        title: 'Basisgegevens', Comp: lazy(() => import('@/components/chapters/Basis'), 'Basis') },
  { id: 'wensen',       title: 'Wensen',        Comp: lazy(() => import('@/components/chapters/Wensen'), 'Wensen') },
  { id: 'budget',       title: 'Budget',        Comp: lazy(() => import('@/components/chapters/Budget'), 'Budget') },
  { id: 'ruimtes',      title: 'Ruimtes',       Comp: lazy(() => import('@/components/chapters/Ruimtes'), 'Ruimtes') },
  { id: 'techniek',     title: 'Techniek',      Comp: lazy(() => import('@/components/chapters/Techniek'), 'Techniek') },
  { id: 'duurzaamheid', title: 'Duurzaamheid',  Comp: lazy(() => import('@/components/chapters/Duurzaamheid'), 'Duurzaamheid') },
  { id: 'risico',       title: "Risico's",      Comp: lazy(() => import('@/components/chapters/Risico'), 'Risico') },
  { id: 'preview',      title: 'Preview',       Comp: lazy(() => import('@/components/chapters/Preview'), 'Preview') },
];

function ChapterErrorBoundary({ children }: { children: React.ReactNode }) {
  const [err, setErr] = useState<Error | null>(null);
  if (err) {
    return (
      <div className="text-sm text-red-600">
        Dit hoofdstuk kon niet geladen worden.
        <pre className="mt-2 whitespace-pre-wrap text-xs text-red-700">{String(err?.message || err)}</pre>
      </div>
    );
  }
  return <ErrorCatcher onError={setErr}>{children}</ErrorCatcher>;
}

class ErrorCatcher extends React.Component<{ onError: (e: Error) => void }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    this.props.onError(error);
  }
  render() {
    return this.state.hasError ? null : this.props.children as React.ReactNode;
  }
}

export default function WizardRouter({ activeId, onChange }: Props) {
  const chapterFlow = useWizardState((s) => s.chapterFlow);
  const currentChapter = useWizardState((s) => s.currentChapter);
  const goToChapter = useWizardState((s) => s.goToChapter);

  const ids = useMemo(() => (Array.isArray(chapterFlow) && chapterFlow.length ? chapterFlow : CHAPTERS.map(c => c.id)), [chapterFlow]);
  const idSet = useMemo(() => new Set(ids), [ids]);
  const firstId = ids[0] ?? 'basis';

  // sync externe activeId naar store (indien geldig)
  useEffect(() => {
    if (activeId && idSet.has(activeId) && activeId !== currentChapter) {
      goToChapter(activeId as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, idSet]);

  const effective = useMemo< string>(() => {
    if (activeId && idSet.has(activeId)) return activeId;
    if (currentChapter && idSet.has(currentChapter)) return currentChapter;
    return firstId;
  }, [activeId, currentChapter, idSet, firstId]);

  const setActive = (id: string) => {
    if (!idSet.has(id)) return;
    goToChapter(id as any);
    try { onChange?.(id); } catch {}
  };

  return (
    <div className="space-y-3">
      {CHAPTERS.filter(c => idSet.has(c.id)).map((c, i) => {
        const open = c.id === effective;
        const Comp = c.Comp;

        return (
          <section key={c.id} className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => setActive(c.id)}
              className={[
                'w-full flex items-center justify-between gap-3 px-4 md:px-5 py-3 md:py-4 text-left transition-colors',
                open ? 'bg-[#eef8f8]' : 'bg-white hover:bg-[#f9fafb]',
              ].join(' ')}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{i + 1}</span>
                <h3 className="text-sm md:text-base font-semibold text-gray-900">{c.title}</h3>
              </div>
              <span className="text-sm text-gray-500">{open ? '▲' : '▼'}</span>
            </button>

            {open && (
              <div className="px-4 md:px-5 pb-4 md:pb-5">
                <div className="rounded-xl border border-[var(--brx-ring)] bg-white shadow-[0_8px_24px_rgba(16,125,130,.08)]">
                  <div className="p-4 md:p-5">
                    <ChapterErrorBoundary>
                      <Comp />
                    </ChapterErrorBoundary>
                  </div>
                </div>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
