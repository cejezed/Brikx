// /components/chapters/ChapterRuimtes.tsx
// ✅ v3.0 Conform: stabiele selectors, loop-beveiliging, correcte ':' focus key
// ✅ Snelle selectie (presets) altijd beschikbaar
// ✅ Uitklapbare kaarten per ruimte (compacte layout)
// ✅ Geen verplichte open kaart; alles mag dicht blijven

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useWizardState } from "@/lib/stores/useWizardState";
import FocusTarget from "@/components/wizard/FocusTarget";
import type { ChapterKey, RuimtesData, Room } from "@/types/project";
import { createFocusKey } from "@/lib/wizard/focusKeyHelper";

const CHAPTER: ChapterKey = "ruimtes";

type RoomPreset = {
  name: string;
  group?: string;
  type?: string;
};

const safeId = (): string =>
  (typeof globalThis !== "undefined" &&
    (globalThis.crypto as Crypto | undefined)?.randomUUID?.()) ||
  `room_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const BASE_PRESETS: RoomPreset[] = [
  { name: "Woonkamer / leefruimte", group: "Begane grond", type: "living" },
  { name: "Keuken / leefkeuken", group: "Begane grond", type: "kitchen" },
  {
    name: "Slaapkamer 1 (hoofdslaapkamer)",
    group: "Verdieping",
    type: "sleep",
  },
  { name: "Badkamer", group: "Verdieping", type: "bathroom" },
  { name: "Toilet begane grond", group: "Begane grond", type: "toilet" },
  {
    name: "Berging / techniek / wasruimte",
    group: "Begane grond",
    type: "storage",
  },
];

const PRESETS_BY_PROJECTTYPE: Record<string, RoomPreset[]> = {
  nieuwbouw: [
    ...BASE_PRESETS,
    { name: "Hal / entree", group: "Begane grond", type: "hall" },
    {
      name: "Thuiswerkplek / kantoor",
      group: "Begane grond",
      type: "office",
    },
  ],
  verbouwing: [
    { name: "Bestaande woonkamer", group: "Begane grond", type: "living" },
    {
      name: "Leefkeuken / uitbouw",
      group: "Begane grond",
      type: "kitchen",
    },
    {
      name: "Badkamer (bestaand/nieuw)",
      group: "Verdieping",
      type: "bathroom",
    },
    { name: "Slaapkamer(s)", group: "Verdieping", type: "sleep" },
  ],
  aanbouw: [
    {
      name: "Nieuwe leefkeuken / eetkamer",
      group: "Begane grond",
      type: "kitchen",
    },
    {
      name: "Extra zithoek / tuinkamer",
      group: "Begane grond",
      type: "living",
    },
  ],
  dakopbouw: [
    {
      name: "Slaapkamer dakopbouw",
      group: "Dakopbouw",
      type: "sleep",
    },
    {
      name: "Badkamer dakopbouw",
      group: "Dakopbouw",
      type: "bathroom",
    },
    {
      name: "Werkkamer dakopbouw",
      group: "Dakopbouw",
      type: "office",
    },
  ],
  appartement: [
    { name: "Woonkamer", group: "Appartement", type: "living" },
    { name: "Keuken", group: "Appartement", type: "kitchen" },
    { name: "Slaapkamer 1", group: "Appartement", type: "sleep" },
    { name: "Badkamer", group: "Appartement", type: "bathroom" },
  ],
};

const getPresetsForProjectType = (projectType?: string): RoomPreset[] => {
  if (!projectType) return BASE_PRESETS;
  const key = projectType.toLowerCase();
  return PRESETS_BY_PROJECTTYPE[key] ?? BASE_PRESETS;
};

// ⚠️ Granulaire, stabiele selectors om loops te voorkomen
const useRuimtesStore = () => {
  const data = useWizardState(
    (s) =>
      (s.chapterAnswers?.[CHAPTER] as RuimtesData | undefined) ?? { rooms: [] }
  );
  const updateChapterData = useWizardState((s) => s.updateChapterData);
  const setCurrentChapter = useWizardState((s) => s.setCurrentChapter);
  const setFocusedField = useWizardState((s) => s.setFocusedField);
  const currentChapter = useWizardState((s) => s.currentChapter);
const projectType = useWizardState(
  (s) => s.chapterAnswers?.basis?.projectType
  );

  return {
    data,
    updateChapterData,
    setCurrentChapter,
    setFocusedField,
    currentChapter,
    projectType,
  };
};

// Zorgt dat we altijd een geldige structuur hebben in de updater
const ensureArray = (prevRaw: unknown): RuimtesData => {
  const prev = (prevRaw as RuimtesData) || { rooms: [] };
  return {
    rooms: Array.isArray(prev.rooms) ? prev.rooms : [],
  };
};

export default function ChapterRuimtes() {
  const {
    data,
    updateChapterData,
    setCurrentChapter,
    setFocusedField,
    currentChapter,
    projectType,
  } = useRuimtesStore();

  // Loop-beveiliging: stel eenmalig het actieve hoofdstuk in
  useEffect(() => {
    if (currentChapter !== CHAPTER) {
      setCurrentChapter(CHAPTER);
    }
  }, [currentChapter, setCurrentChapter]);

  const rooms = useMemo<Room[]>(
    () => (Array.isArray(data.rooms) ? data.rooms : []),
    [data.rooms]
  );

  const presets = getPresetsForProjectType(projectType);

  // UI-state: welke ruimte is opengeklapt?
  const [openRoomId, setOpenRoomId] = useState<string | null>(null);

  // 👉 Nieuw gedrag: alleen repareren als openRoomId verwijst naar een niet-bestaande room.
  // Niet meer "altijd eerste room open" forceren.
  useEffect(() => {
    if (!rooms.length) {
      setOpenRoomId(null);
      return;
    }

    if (openRoomId && !rooms.find((r) => r.id === openRoomId)) {
      setOpenRoomId(rooms[0].id);
    }
  }, [rooms, openRoomId]);

  // --- Mutaties via updateChapterData (v3.0 aligned) ---

  const addRoom = () => {
    const id = safeId();

    updateChapterData(CHAPTER, (prevRaw) => {
      const prev = ensureArray(prevRaw);
      return {
        rooms: [
          ...prev.rooms,
          {
            id,
            name: "",
            group: "",
            type: "other",
            m2: undefined,
            wensen: [],
          },
        ],
      };
    });

    // Nieuwe ruimte direct openen
    setOpenRoomId(id);

    if (typeof setFocusedField === "function") {
      setTimeout(
        () => setFocusedField(createFocusKey(CHAPTER, `room:${id}:name`)),
        40
      );
    }
  };

  const addPresetRooms = () => {
    updateChapterData(CHAPTER, (prevRaw) => {
      const prev = ensureArray(prevRaw);
      const existing = new Set(
        prev.rooms.map((r) => (r.name || "").toLowerCase().trim())
      );

      const toAdd: Room[] = presets
        .filter((p) => !existing.has(p.name.toLowerCase().trim()))
        .map((p) => ({
          id: safeId(),
          name: p.name,
          group: p.group ?? "",
          type: p.type ?? "other",
          m2: undefined,
          wensen: [],
        }));

      if (!toAdd.length) return prev;

      const nextRooms = [...prev.rooms, ...toAdd];

      return { rooms: nextRooms };
    });
  };

  const addSinglePreset = (preset: RoomPreset) => {
    const id = safeId();

    updateChapterData(CHAPTER, (prevRaw) => {
      const prev = ensureArray(prevRaw);
      const exists = prev.rooms.some(
        (r) =>
          r.name?.toLowerCase().trim() === preset.name.toLowerCase().trim()
      );
      if (exists) return prev;

      const next: RuimtesData = {
        rooms: [
          ...prev.rooms,
          {
            id,
            name: preset.name,
            group: preset.group ?? "",
            type: preset.type ?? "other",
            m2: undefined,
            wensen: [],
          },
        ],
      };

      return next;
    });

    // Geselecteerde preset direct openen
    setOpenRoomId(id);
  };

  const patchRoom = (id: string, patch: Partial<Room>) => {
    updateChapterData(CHAPTER, (prevRaw) => {
      const prev = ensureArray(prevRaw);
      return {
        rooms: prev.rooms.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      };
    });
  };

  const removeRoom = (id: string) => {
    updateChapterData(CHAPTER, (prevRaw) => {
      const prev = ensureArray(prevRaw);
      return {
        rooms: prev.rooms.filter((r) => r.id !== id),
      };
    });
  };

  // Helper voor onFocus handlers (focuskey v3.0 formaat)
  const handleFocus = (fieldId: string) => {
    setFocusedField(createFocusKey(CHAPTER, fieldId));
  };

  // --- Render ---

  // Presets die nog niet in de lijst zitten (voor snelle selectie)
  const remainingPresets = presets.filter(
    (p) =>
      !rooms.some(
        (r) => r.name?.toLowerCase().trim() === p.name.toLowerCase().trim()
      )
  );

  return (
    <section className="space-y-4 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-sm md:text-base font-semibold text-gray-900">
            Ruimtes
          </h2>
          <p className="text-xs md:text-sm text-gray-600">
            Dit is de kapstok van uw woning. Selecteer en benoem de
            belangrijkste ruimtes; in het hoofdstuk{" "}
            <strong>Wensen</strong> werken we deze verder uit.
          </p>
          {projectType && (
            <p className="text-[10px] text-gray-500 mt-1">
              Herkend projecttype: <strong>{projectType}</strong>. U kunt
              passende standaardruimtes laten invullen.
            </p>
          )}
        </div>

        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={addRoom}
            className="rounded-lg bg-[#107d82] text-white px-3 py-1.5 hover:opacity-90 text-xs"
          >
            + Ruimte
          </button>
          <button
            type="button"
            onClick={addPresetRooms}
            className="rounded-lg border border-[#107d82]/40 text-[#107d82] px-3 py-1.5 hover:bg-[#107d82] hover:text-white text-[10px]"
          >
            Voorgestelde ruimtes
          </button>
        </div>
      </div>

      {/* Snelle selectie: presets ALTIJD zichtbaar (zolang er nog iets te kiezen is) */}
      {remainingPresets.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 md:p-4 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] md:text-xs text-gray-700">
              Snelle selectie op basis van{" "}
              <strong>{projectType ?? "uw project"}</strong>:
            </p>
            <button
              type="button"
              onClick={addPresetRooms}
              className="text-[10px] px-2.5 py-1 rounded-full border border-[#107d82]/40 text-[#107d82] hover:bg-[#107d82] hover:text-white transition-colors"
            >
              Voeg alle voorgestelde ruimtes toe
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {remainingPresets.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => addSinglePreset(p)}
                className="text-[10px] px-2.5 py-1 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-[#107d82] hover:text-white transition-colors"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lege staat (zonder preset-chips) */}
      {rooms.length === 0 && (
        <div className="rounded-xl border border-dashed p-4 text-xs md:text-sm text-neutral-700 bg-white space-y-2">
          <p>Nog geen ruimtes toegevoegd. U kunt:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Handmatig starten met <em>+ Ruimte</em>.</li>
            <li>
              In één keer logische ruimtes toevoegen met{" "}
              <strong>Voorgestelde ruimtes</strong>.
            </li>
            <li>
              Of in de chat typen:{" "}
              <span className="italic text-gray-600">
                "Voeg woonkamer (30 m²) en leefkeuken (25 m²) toe."
              </span>{" "}
              – dan vullen wij dit hoofdstuk voor u.
            </li>
          </ul>
        </div>
      )}

      {/* Lijst met ruimtes - COLLAPSIBLE CARDS */}
      {rooms.map((room, index) => {
        const isOpen = openRoomId === room.id;

        return (
          <div
            key={room.id}
            className="rounded-xl border bg-white shadow-sm"
          >
            {/* Card header */}
            <button
              type="button"
              onClick={() =>
                setOpenRoomId((prev) => (prev === room.id ? null : room.id))
              }
              className="w-full flex items-center justify-between px-4 py-3 md:px-5 md:py-4 text-left"
            >
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">
                  Ruimte {index + 1}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {room.name || "Nieuwe ruimte"}
                  {room.m2 ? ` · ca. ${room.m2} m²` : ""}
                </span>
                {room.group && (
                  <span className="text-[11px] text-gray-500">
                    {room.group}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-gray-500">
                  {isOpen ? "Inklappen" : "Uitklappen"}
                </span>
                <span className="text-xs">{isOpen ? "▾" : "▸"}</span>
              </div>
            </button>

            {/* Card body */}
            {isOpen && (
              <div className="border-t px-4 py-4 md:px-5 md:py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Detailinstellingen voor deze ruimte
                  </span>
                  <button
                    type="button"
                    onClick={() => removeRoom(room.id)}
                    className="text-red-600 text-[11px] hover:underline"
                  >
                    Verwijderen
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FocusTarget
                    chapter={CHAPTER}
                    fieldId={`room:${room.id}:name`}
                  >
                    <label className="block">
                      <span className="block text-xs text-gray-600 mb-1">
                        Naam
                      </span>
                      <input
                        className="w-full rounded border px-3 py-2"
                        value={room.name ?? ""}
                        onFocus={() =>
                          handleFocus(`room:${room.id}:name`)
                        }
                        onChange={(e) =>
                          patchRoom(room.id, { name: e.target.value })
                        }
                        placeholder="Bijv. Woonkamer, Leefkeuken"
                      />
                    </label>
                  </FocusTarget>

                  <FocusTarget
                    chapter={CHAPTER}
                    fieldId={`room:${room.id}:group`}
                  >
                    <label className="block">
                      <span className="block text-xs text-gray-600 mb-1">
                        Verdieping / zone (optioneel)
                      </span>
                      <input
                        className="w-full rounded border px-3 py-2"
                        value={room.group ?? ""}
                        onFocus={() =>
                          handleFocus(`room:${room.id}:group`)
                        }
                        onChange={(e) =>
                          patchRoom(room.id, { group: e.target.value })
                        }
                        placeholder="Bijv. Begane grond, Verdieping, Tuin"
                      />
                    </label>
                  </FocusTarget>

                  <FocusTarget
                    chapter={CHAPTER}
                    fieldId={`room:${room.id}:m2`}
                  >
                    <label className="block">
                      <span className="block text-xs text-gray-600 mb-1">
                        m² (indicatief)
                      </span>
                      <input
                        className="w-full rounded border px-3 py-2"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={
                          room.m2 === undefined || room.m2 === null
                            ? ""
                            : room.m2
                        }
                        onFocus={() =>
                          handleFocus(`room:${room.id}:m2`)
                        }
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D+/g, "");
                          patchRoom(room.id, {
                            m2: digits ? Number(digits) : undefined,
                          });
                        }}
                        placeholder="Bijv. 25"
                      />
                    </label>
                  </FocusTarget>
                </div>

                <FocusTarget
                  chapter={CHAPTER}
                  fieldId={`room:${room.id}:wishes`}
                >
                  <label className="block">
                    <span className="block text-xs text-gray-600 mb-1">
                      Wensen bij deze ruimte
                    </span>
                    <textarea
                      className="w-full rounded border px-3 py-2 min-h-20 resize-y"
                      value={(room.wensen ?? []).join("\n")}
                      onFocus={() =>
                        handleFocus(`room:${room.id}:wishes`)
                      }
                      onChange={(e) =>
                        patchRoom(room.id, {
                          wensen: e.target.value
                            .split("\n")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder={`Zet elke wens op een nieuwe regel, bijv.:
- Veel daglicht
- Direct contact met tuin
- Rustige zithoek`}
                    />
                    <p className="mt-1 text-[10px] text-neutral-500">
                      Deze bullets koppelen we later automatisch aan uw
                      algemene Wensen & het PvE.
                    </p>
                  </label>
                </FocusTarget>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
