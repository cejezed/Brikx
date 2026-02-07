'use client';

import React from 'react';
import type { ProposalItem } from '@/lib/stores/useChatStore';
import { useWizardState } from '@/lib/stores/useWizardState';

type Props = {
  proposals: ProposalItem[];
  onApply: (proposalId: string) => void;
  onDismiss: (proposalId: string) => void;
  variant?: 'desktop' | 'mobile';
};

function labelForProposal(p: ProposalItem): string {
  const chapter = p.patch.chapter;
  const path = p.patch.delta?.path || 'veld';
  const op = p.patch.delta?.operation || 'set';

  if (chapter === 'budget' && path === 'budgetTotaal') {
    return 'Budgettotaal aanpassen';
  }
  if (chapter === 'budget' && path === 'bandbreedte') {
    return 'Budgetbandbreedte aanpassen';
  }
  if (chapter === 'budget' && path === 'eigenInbreng') {
    return 'Eigen inbreng aanpassen';
  }
  if (chapter === 'budget' && path === 'contingency') {
    return 'Onvoorzien aanpassen';
  }
  if (chapter === 'risico' && path === 'overallRisk') {
    return 'Risiconiveau bijstellen';
  }
  if (chapter === 'risico' && path === 'risks' && op === 'append') {
    return 'Nieuw risico toevoegen';
  }
  if (chapter === 'ruimtes' && path === 'rooms' && op === 'append') {
    return 'Ruimte toevoegen';
  }
  if (chapter === 'wensen' && path === 'wishes' && op === 'append') {
    return 'Wens toevoegen';
  }
  if (chapter === 'techniek' && path === 'aiAttentionPoints' && op === 'append') {
    return 'Technisch aandachtspunt toevoegen';
  }
  if (chapter === 'techniek' && path === 'aiAssumptions' && op === 'append') {
    return 'Technische aanname toevoegen';
  }
  if (chapter === 'duurzaam' && path === 'aiIdeas' && op === 'append') {
    return 'Duurzaam idee toevoegen';
  }
  if (chapter === 'duurzaam' && path === 'aiMeasures' && op === 'append') {
    return 'Duurzaamheidsmaatregel toevoegen';
  }
  if (chapter === 'basis' && path === 'aiNotes' && op === 'append') {
    return 'Notitie toevoegen';
  }
  if (path.includes('draft') && op === 'append') {
    return 'Voorstel in concept toevoegen';
  }
  if (op === 'append') {
    return `Toevoegen aan ${chapter}`;
  }
  if (op === 'set') {
    return `Aanpassen: ${chapter}.${path}`;
  }
  return `Voorstel voor ${chapter}.${path}`;
}

function previewForProposal(p: ProposalItem): string | null {
  const op = p.patch.delta?.operation;
  const value = (p.patch.delta as any)?.value;
  if (value === undefined) return null;

  if (op === 'set') {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return `-> ${String(value)}`;
    }
  }

  if (op === 'append') {
    if (typeof value === 'string') {
      return value.slice(0, 60);
    }
    try {
      const json = JSON.stringify(value);
      return json.length > 60 ? `${json.slice(0, 57)}...` : json;
    } catch {
      return null;
    }
  }

  return null;
}

export default function ProposalsPanel({ proposals, onApply, onDismiss, variant = 'desktop' }: Props) {
  const isMobile = variant === 'mobile';
  const chapterAnswers = useWizardState((s) => s.chapterAnswers) as Record<string, any> | undefined;

  const visibleProposals = proposals.filter((p) => {
    const op = p.patch.delta?.operation;
    const path = p.patch.delta?.path;
    if (!path) return true;
    const chapter = p.patch.chapter;
    const currentChapter = chapterAnswers?.[chapter] ?? {};
    const currentValue = (currentChapter as any)?.[path];
    const nextValue = (p.patch.delta as any)?.value;

    if (op === 'set') {
      try {
        return JSON.stringify(currentValue) !== JSON.stringify(nextValue);
      } catch {
        return true;
      }
    }

    if (op === 'append' && Array.isArray(currentValue)) {
      try {
        const nextJson = JSON.stringify(nextValue);
        return !currentValue.some((v: any) => {
          try {
            return JSON.stringify(v) === nextJson;
          } catch {
            return false;
          }
        });
      } catch {
        return true;
      }
    }

    return true;
  });

  if (visibleProposals.length === 0) {
    return null;
  }
  return (
    <div
      className={[
        'rounded-2xl border border-slate-200 bg-white/80 text-slate-700 shadow-sm',
        isMobile ? 'p-2 text-[12px]' : 'p-3 text-xs',
      ].join(' ')}
    >
      <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
        Voorstellen
      </div>
      <div className="space-y-2">
        {visibleProposals.map((p) => (
          (() => {
            const preview = previewForProposal(p);
            return (
          <div
            key={p.id}
            className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"
          >
            <div className="min-w-0">
              <div className="truncate font-medium text-slate-800">
                {labelForProposal(p)}
              </div>
              {preview && (
                <div className="mt-0.5 truncate text-[11px] text-slate-500">
                  {preview}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onApply(p.id)}
                className={[
                  'rounded-lg bg-emerald-600 font-semibold text-white hover:bg-emerald-700',
                  isMobile ? 'px-3 py-2 text-xs' : 'px-2.5 py-1 text-[11px]',
                ].join(' ')}
              >
                Toepassen
              </button>
              <button
                type="button"
                onClick={() => onDismiss(p.id)}
                className={[
                  'rounded-lg border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50',
                  isMobile ? 'px-3 py-2 text-xs' : 'px-2.5 py-1 text-[11px]',
                ].join(' ')}
              >
                Negeren
              </button>
            </div>
          </div>
            );
          })()
        ))}
      </div>
    </div>
  );
}
