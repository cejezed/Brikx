// components/wizard/PatchBridge.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useWizardState } from '@/lib/stores/useWizardState';

type Room = { name: string; area?: number | null };

declare global { interface Window { __BRIKX_PATCH_LOCK__?: boolean } }

const N = (s: string) => s.trim().toLowerCase();
const log = (...a:any[]) => { if (process.env.NODE_ENV!=='production') console.debug('[PatchBridge]', ...a); };

function roomsEqual(a: Room[], b: Room[]) {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (N(a[i].name) !== N(b[i].name)) return false;
    if ((a[i].area ?? null) !== (b[i].area ?? null)) return false;
  }
  return true;
}
function upsertRooms(current: Room[], patchRooms: Room[]) {
  const map = new Map(current.map(r => [N(r.name), { ...r }]));
  for (const r of patchRooms) {
    if (!r?.name) continue;
    const key = N(r.name);
    const prev = map.get(key) || { name: r.name, area: null as number | null };
    map.set(key, { ...prev, ...r, area: r.area ?? prev.area ?? null });
  }
  return Array.from(map.values());
}

export default function PatchBridge() {
  const localBusy = useRef(false);

  useEffect(() => {
    const onPatch = (e: Event) => {
      const { patch, source } = (e as CustomEvent).detail || {};
      if (source !== 'chat') return;
      if (!patch || typeof patch !== 'object') return;

      if (window.__BRIKX_PATCH_LOCK__ || localBusy.current) return;
      window.__BRIKX_PATCH_LOCK__ = true;
      localBusy.current = true;

      try {
        const state = useWizardState.getState();
        const { setBudget, setRooms, patchField } = state as any;

        if (Object.prototype.hasOwnProperty.call(patch, 'budget')) {
          const nextBudget = patch.budget ?? null;
          const currBudget = (state as any).budget ?? null;
          if (nextBudget !== currBudget) {
            if (typeof setBudget === 'function') {
              log('setBudget', nextBudget);
              setBudget(nextBudget);
            } else if (typeof patchField === 'function') {
              log('patchField(fallback: budget.globalBudget)', nextBudget);
              patchField('budget.globalBudget', String(nextBudget));
            } else {
              log('setState(budget)', nextBudget);
              useWizardState.setState({ budget: nextBudget });
            }
          }
        }

        if (Array.isArray(patch.rooms) && patch.rooms.length > 0) {
          const currRooms: Room[] = Array.isArray((state as any).rooms) ? (state as any).rooms : [];
          const nextRooms = upsertRooms(currRooms, patch.rooms as Room[]);
          if (!roomsEqual(currRooms, nextRooms)) {
            if (typeof setRooms === 'function') {
              log('setRooms', nextRooms);
              setRooms(nextRooms);
            } else if (typeof patchField === 'function') {
              const total = nextRooms.reduce((s, r) => s + (r.area || 0), 0);
              log('patchField(fallback: requirements.roomsTotal)', total);
              patchField('requirements.roomsTotal', String(total));
            } else {
              log('setState(rooms)', nextRooms);
              useWizardState.setState({ rooms: nextRooms });
            }
          }
        }
      } finally {
        setTimeout(() => { window.__BRIKX_PATCH_LOCK__ = false; }, 0);
        localBusy.current = false;
      }
    };

    const onFocus = (e: Event) => {
      const { target, source } = (e as CustomEvent).detail || {};
      if (source !== 'chat') return;
      if (!target || typeof target !== 'string') return;

      const state = useWizardState.getState();
      const { goToChapter, setFocusedField } = state as any;

      if (target === 'tab:risicos' && typeof goToChapter === 'function') return void goToChapter('chapter_risicos');
      if (target === 'tab:preview' && typeof goToChapter === 'function') return void goToChapter('chapter_preview');

      if (typeof setFocusedField === 'function') {
        log('setFocusedField', target);
        setFocusedField(target);
      } else {
        log('setState(focusedField)', target);
        useWizardState.setState({ focusedField: target });
      }
    };

    const onHandoff = (e: Event) => {
      const { source } = (e as CustomEvent).detail || {};
      if (source !== 'chat') return;
      const state = useWizardState.getState();
      if (typeof (state as any).openHandoff === 'function') (state as any).openHandoff();
    };

    window.addEventListener('wizard:patch', onPatch as EventListener);
    window.addEventListener('ui:focus', onFocus as EventListener);
    window.addEventListener('ui:handoff', onHandoff as EventListener);
    log('mounted');

    return () => {
      window.removeEventListener('wizard:patch', onPatch as EventListener);
      window.removeEventListener('ui:focus', onFocus as EventListener);
      window.removeEventListener('ui:handoff', onHandoff as EventListener);
      log('unmounted');
    };
  }, []);

  return null;
}
