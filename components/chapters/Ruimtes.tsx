// components/chapters/Ruimtes.tsx
'use client';

import React, { useEffect, useMemo } from 'react';
import FocusTarget from '@/components/wizard/FocusTarget';
import { useWizardState } from '@/lib/stores/useWizardState';
import { useUiStore } from '@/lib/stores/useUiStore';

type Room = {
  id: string;
  name?: string;
  type?: string; // 'woonkamer' | 'keuken' | ... (vrij)
  m2?: number | '';
  wensen?: string[];
};

const safeId = () =>
  (globalThis as any)?.crypto?.randomUUID?.() ??
  `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export default function Ruimtes() {
  // Router hint (optioneel)
  const setCurrentChapter = useUiStore((s) => s.setCurrentChapter);
  useEffect(() => { setCurrentChapter?.('ruimtes'); }, [setCurrentChapter]);

  const chapterAnswers = useWizardState((s) => s.chapterAnswers) as Record<string, any>;
  const setChapterAnswers = useWizardState((s) => s.setChapterAnswers); // 2-arg overload

  const list: Room[] = useMemo(
    () => (Array.isArray(chapterAnswers?.ruimtes) ? chapterAnswers.ruimtes : []),
    [chapterAnswers?.ruimtes]
  );

  const setList = (next: Room[]) => {
    // ✅ schrijf alléén dit hoofdstuk, niet hele object vervangen
    setChapterAnswers('ruimtes', next as any);
  };

  const addRoom = () => {
    const next: Room[] = [
      ...list,
      { id: safeId(), type: 'overig', name: '', m2: '', wensen: [] },
    ];
    setList(next);
  };

  const removeRoom = (id: string) => {
    const next = list.filter((r) => r.id !== id);
    setList(next);
  };

  const patchRoom = (id: string, patch: Partial<Room>) => {
    const next = list.map((r) => (r.id === id ? { ...r, ...patch } : r));
    setList(next);
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
        <p className="text-sm text-neutral-600">
          Nog geen ruimtes. Klik op <em>+ Ruimte</em> om te starten.
        </p>
      )}

      {list.map((room, idx) => (
        <div
          key={room.id}
          className="rounded-xl border border-[var(--brx-ring)] bg-white shadow-[0_8px_24px_rgba(16,125,130,.08)]"
        >
          <div className="p-4 md:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <strong className="text-sm">
                {idx + 1}. {room.name || '(naamloos)'}
              </strong>
              <button
                type="button"
                onClick={() => removeRoom(room.id)}
                className="text-red-600 text-sm hover:underline"
              >
                Verwijder
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FocusTarget chapter="ruimtes" fieldId={`name_${room.id}`}>
                <label className="block">
                  <span className="block text-xs text-gray-600 mb-1">Naam</span>
                  <input
                    className="w-full rounded border px-3 py-2"
                    value={room.name ?? ''}
                    onChange={(e) => patchRoom(room.id, { name: e.target.value })}
                    placeholder="Bijv. Woonkamer"
                  />
                </label>
              </FocusTarget>

              <FocusTarget chapter="ruimtes" fieldId={`type_${room.id}`}>
                <label className="block">
                  <span className="block text-xs text-gray-600 mb-1">Type</span>
                  <select
                    className="w-full rounded border px-3 py-2"
                    value={room.type ?? 'overig'}
                    onChange={(e) => patchRoom(room.id, { type: e.target.value })}
                  >
                    <option value="woonkamer">Woonkamer</option>
                    <option value="keuken">Keuken</option>
                    <option value="slaapkamer">Slaapkamer</option>
                    <option value="badkamer">Badkamer</option>
                    <option value="toilet">Toilet</option>
                    <option value="berging">Berging</option>
                    <option value="zolder">Zolder</option>
                    <option value="buiten">Buiten</option>
                    <option value="overig">Overig</option>
                  </select>
                </label>
              </FocusTarget>

              <FocusTarget chapter="ruimtes" fieldId={`m2_${room.id}`}>
                <label className="block">
                  <span className="block text-xs text-gray-600 mb-1">m²</span>
                  <input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-full rounded border px-3 py-2"
                    value={room.m2 ?? ''}
                    onChange={(e) =>
                      patchRoom(
                        room.id,
                        { m2: e.target.value === '' ? '' : Number(e.target.value.replace(/\D+/g, '')) }
                      )
                    }
                    placeholder="bijv. 20"
                  />
                </label>
              </FocusTarget>
            </div>

            <FocusTarget chapter="ruimtes" fieldId={`wensen_${room.id}`}>
              <label className="block">
                <span className="block text-xs text-gray-600 mb-1">Wensen (komma-gescheiden)</span>
                <input
                  className="w-full rounded border px-3 py-2"
                  value={(room.wensen ?? []).join(', ')}
                  onChange={(e) =>
                    patchRoom(room.id, {
                      wensen: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="licht, warm, zicht tuin…"
                />
              </label>
            </FocusTarget>
          </div>
        </div>
      ))}
    </section>
  );
}
