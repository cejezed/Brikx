// lib/chat/applyChatResponse.ts
'use client';

import { useWizardState } from '@/lib/stores/useWizardState';
import { useUiStore } from '@/lib/stores/useUiStore';

export type Action =
  | { type: 'goto'; chapter: 'basis' | 'wensen' | 'budget' | 'ruimtes' | 'techniek' | 'duurzaamheid' | 'risico' | 'preview' }
  | { type: 'focus'; key: string } // "chapter:field"
  | { type: 'set'; chapter: string; value: any }
  | { type: 'patch'; chapter: string; patch: any }
  | { type: 'add_room'; room: { type: 'woonkamer' | 'keuken' | 'slaapkamer' | 'badkamer' | 'overig'; naam?: string; oppM2?: number; wensen?: string[] } }
  | { type: 'add_wens'; label: string }
  | { type: 'remove_wens'; label: string };

export type ChatApiResponse = {
  reply: string;
  actions: Action[];
};

function uuid() {
  // @ts-ignore
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

function toArray<T = any>(v: any): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

export function applyChatResponse(resp: ChatApiResponse | null | undefined) {
  if (!resp || !Array.isArray(resp.actions)) return;

  const ws = useWizardState.getState();
  const ui = useUiStore.getState();

  for (const a of resp.actions) {
    try {
      switch (a.type) {
        case 'goto': {
          ws.goToChapter(a.chapter);
          break;
        }
        case 'focus': {
          ui.setFocusedField(a.key);
          break;
        }
        case 'set': {
          ws.setChapterAnswer(a.chapter as any, a.value);
          break;
        }
        case 'patch': {
          ws.patchChapterAnswer(a.chapter as any, a.patch);
          break;
        }
        case 'add_room': {
          const cur = toArray(ws.getChapterAnswer('ruimtes'));
          const next = [
            ...cur,
            {
              id: uuid(),
              type: a.room.type,
              naam: a.room.naam ?? a.room.type,
              oppM2: a.room.oppM2,
              wensen: toArray(a.room.wensen),
            },
          ];
          ws.setChapterAnswer('ruimtes' as any, next);
          ui.setFocusedField('ruimtes:naam');
          break;
        }
        case 'add_wens': {
          const cur = toArray(ws.getChapterAnswer('wensen'));
          const next = [...cur, { id: uuid(), label: a.label }];
          ws.setChapterAnswer('wensen' as any, next);
          break;
        }
        case 'remove_wens': {
          const cur = toArray<{ id?: string; label?: string }>(ws.getChapterAnswer('wensen'));
          const next = cur.filter((w) => w.label !== a.label);
          ws.setChapterAnswer('wensen' as any, next);
          break;
        }
        default:
          // eslint-disable-next-line no-console
          console.warn('[applyChatResponse] Unknown action ignored:', a);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[applyChatResponse] Action failed:', a, err);
    }
  }
}

export default applyChatResponse;
