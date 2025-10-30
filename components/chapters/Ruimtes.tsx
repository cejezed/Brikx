// components/chapters/Ruimtes.tsx
'use client';

import React, { useEffect, useMemo } from 'react';
import FocusTarget from '@/components/wizard/FocusTarget';
import { useWizardState } from '@/lib/stores/useWizardState';
import { useUiStore } from '@/lib/stores/useUiStore';

type Room = {
  id?: string;       // kan ontbreken bij oude data
  name?: string;
  type?: string;     // interne metadata (verborgen)
  group?: string;    // Groep / Verdieping
  m2?: number | '';
  wensen?: string[];
};

const safeId = () =>
  (globalThis as any)?.crypto?.randomUUID?.() ??
  `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

// Helper: structure-clone fallback
const clone = <T,>(x: T): T =>
  typeof structuredClone === 'function' ? structuredClone(x) : JSON.parse(JSON.stringify(x));

export default function Ruimtes() {
  const setCurrentChapter = useUiStore((s) => s.setCurrentChapter);
  const setFocusedField = useUiStore((s) => s.setFocusedField);
  const chapterAnswers = useWizardState((s) => s.chapterAnswers) as Record<string, any> | undefined;

  useEffect(() => {
    setCurrentChapter?.('ruimtes');
  }, [setCurrentChapter]);

  // Init + migratie (id's toevoegen) – altijd via functionele setState
  useEffect(() => {
    useWizardState.setState((s: any) => {
      const raw = s.chapterAnswers?.ruimtes;
      let list: Room[] = Array.isArray(raw) ? raw : [];
      // migreer ontbrekende id's
      let changed = !Array.isArray(raw);
      if (list.some((r) => !r?.id)) {
        list = list.map((r) => (r?.id ? r : { ...r, id: safeId() }));
        changed = true;
      }
      return changed
        ? { chapterAnswers: { ...(s.chapterAnswers ?? {}), ruimtes: list } }
        : s;
    });
  }, []);

  const list: Room[] = useMemo(
    () => (Array.isArray(chapterAnswers?.ruimtes) ? chapterAnswers!.ruimtes : []),
    [chapterAnswers?.ruimtes]
  );

  // Closure-safe writers: altijd functionele updates
  const addRoom = () => {
    const newId = safeId();
    useWizardState.setState((s: any) => {
      const prev: Room[] = Array.isArray(s.chapterAnswers?.ruimtes) ? s.chapterAnswers.ruimtes : [];
      const next = clone([...prev, { id: newId, type: 'overig', name: '', group: '', m2: '', wensen: [] }]);
      return { chapterAnswers: { ...(s.chapterAnswers ?? {}), ruimtes: next } };
    });

    setCurrentChapter?.('ruimtes');
    setTimeout(() => setFocusedField?.({ chapter: 'ruimtes', fieldId: `name_${newId}` }), 0);
  };

  const removeAt = (index: number, id?: string) => {
    useWizardState.setState((s: any) => {
      const prev: Room[] = Array.isArray(s.chapterAnswers?.ruimtes) ? s.chapterAnswers.ruimtes : [];
      let next: Room[];
      if (index >= 0 && index < prev.length) {
        next = clone([...prev.slice(0, index), ...prev.slice(index + 1)]);
      } else if (id) {
        next = clone(prev.filter((r) => r.id !== id));
      } else {
        next = prev;
      }
      return { chapterAnswers: { ...(s.chapterAnswers ?? {}), ruimtes: next } };
    });
  };

  const patchRoom = (id: string | undefined, patch: Partial<Room>) => {
    if (!id) return;
    useWizardState.setState((s: any) => {
      const prev: Room[] = Array.isArray(s.chapterAnswers?.ruimtes) ? s.chapterAnswers.ruimtes : [];
      const next = clone(prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
      return { chapterAnswers: { ...(s.chapterAnswers ?? {}), ruimtes: next } };
    });
  };

  return (
    <section className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <h3 className="text-sm md:text-base font-semibold text-gray-900">Ruimtes</h3>
        <button
          type="button"
          onClick={addRoom}
          className="rounded-lg bg-[#107d82] text-white px-3 py-1.5 hover:opacity-90"
        >
          + Ruimte
        </button>
      </div>

      {list.length === 0 && (
        <div className="rounded-xl border border-dashed p-4 text-sm text-neutral-700 bg-white">
          <p className="mb-2">
            Nog geen ruimtes. Klik op <em>+ Ruimte</em> om te starten.
          </p>
          <p className="text-neutral-600">
            Tip: u kunt ook gewoon typen in de chat—bijv. “Voeg woonkamer toe van 30 m²”
            of “Slaapkamer op zolder”—Jules zet het voor u klaar.
          </p>
        </div>
      )}

      {list.map((room, idx) => (
        <div
          key={room.id ?? `idx_${idx}`}
          className="rounded-xl border border-[var(--brx-ring)] bg-white shadow-[0_8px_24px_rgba(16,125,130,.08)]"
        >
          <div className="p-4 md:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <strong className="text-sm">
                {idx + 1}. {room.name || '(naamloos)'}
              </strong>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeAt(idx, room.id);
                }}
                className="text-red-600 text-sm hover:underline pointer-events-auto"
                aria-label={`Verwijder ${room.name || 'ruimte'}`}
              >
                Verwijder
              </button>
            </div>

            {/* Grid: Naam | Groep/Verdieping | m² */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FocusTarget chapter="ruimtes" fieldId={`name_${room.id}`}>
                <label className="block">
                  <span className="block text-xs text-gray-600 mb-1">Naam</span>
                  <input
                    className="w-full rounded border px-3 py-2 pointer-events-auto"
                    value={room.name ?? ''}
                    onChange={(e) => patchRoom(room.id, { name: e.target.value })}
                    placeholder="Bijv. Woonkamer"
                  />
                </label>
              </FocusTarget>

              <FocusTarget chapter="ruimtes" fieldId={`group_${room.id}`}>
                <label className="block">
                  <span className="block text-xs text-gray-600 mb-1">Groep / Verdieping (optioneel)</span>
                  <input
                    className="w-full rounded border px-3 py-2 pointer-events-auto"
                    value={room.group ?? ''}
                    onChange={(e) => patchRoom(room.id, { group: e.target.value })}
                    placeholder="Bijv. Begane grond, Zolder, Buiten…"
                  />
                </label>
              </FocusTarget>

              <FocusTarget chapter="ruimtes" fieldId={`m2_${room.id}`}>
                <label className="block">
                  <span className="block text-xs text-gray-600 mb-1">m²</span>
                  <input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-full rounded border px-3 py-2 pointer-events-auto"
                    value={room.m2 ?? ''}
                    onChange={(e) => {
                      const onlyDigits = e.target.value.replace(/\D+/g, '');
                      patchRoom(room.id, { m2: onlyDigits === '' ? '' : Number(onlyDigits) });
                    }}
                    placeholder="bijv. 20"
                  />
                </label>
              </FocusTarget>
            </div>

            {/* Wensen als textarea: elke wens op een nieuwe regel */}
            <FocusTarget chapter="ruimtes" fieldId={`wensen_${room.id}`}>
              <label className="block">
                <span className="block text-xs text-gray-600 mb-1">Wensen</span>
                <textarea
                  className="w-full rounded border px-3 py-2 min-h-28 resize-y pointer-events-auto"
                  value={(room.wensen ?? []).join('\n')}
                  onChange={(e) =>
                    patchRoom(room.id, {
                      wensen: e.currentTarget.value
                        .split('\n')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder={`Zet elke wens op een nieuwe regel, bijv.:
- Veel daglicht
- Zicht op tuin
- Aansluiting op terras`}
                />
                <p className="mt-1 text-[11px] text-neutral-500">
                  Tip: typ natuurlijk; Jules herkent tegenstrijdigheden later automatisch.
                </p>
              </label>
            </FocusTarget>
          </div>
        </div>
      ))}
    </section>
  );
}
