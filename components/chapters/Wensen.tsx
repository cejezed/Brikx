// /components/chapters/Wensen.tsx
// ✅ REAL FIX: Alle callbacks gememoized met useCallback

"use client";

import React, { useMemo, useCallback } from "react";
import { useWizardState } from "@/lib/stores/useWizardState";
import FocusTarget from "@/components/wizard/FocusTarget";
import type { ChapterKey } from "@/types/project";
import type { Wish, WensenData } from "@/types/project";
import { createFocusKey } from "@/lib/wizard/focusKeyHelper";

const CHAPTER: ChapterKey = "wensen";

const PRIORITIES: {
  value: NonNullable<Wish["priority"]>;
  label: string;
  hint: string;
}[] = [
  {
    value: "must",
    label: "Must-have",
    hint: "Zonder dit voelt het plan niet geslaagd."
  },
  {
    value: "nice",
    label: "Nice-to-have",
    hint: "Belangrijk, maar in noodgeval inwisselbaar."
  },
  {
    value: "optional",
    label: "Optioneel / later",
    hint: "Mag in fase 2 of als het budget het toelaat."
  }
];

const QUICK_WISH_PRESETS: Array<Pick<Wish, "text" | "priority" | "category">> = [
  {
    text: "Lichte leefkeuken met zicht op de tuin en grote eettafel",
    priority: "must",
    category: "comfort"
  },
  {
    text: "Geen directe inkijk vanaf de straat in woonkamer en keuken",
    priority: "must",
    category: "function"
  },
  {
    text: "Comfortabele thuiswerkplek met daglicht en goede akoestiek",
    priority: "nice",
    category: "function"
  },
  {
    text: "Overdekt terras gekoppeld aan leefruimte voor buiten eten en zitten",
    priority: "nice",
    category: "style"
  },
  {
    text: "Duurzame oplossingen zoals isolatie, zonnepanelen en lage energielasten",
    priority: "optional",
    category: "other"
  }
];

// Default constant to avoid creating new object on every render
const DEFAULT_WENSEN_DATA: WensenData = { wishes: [] };

export default function ChapterWensen() {
  // ✅ Selectors - stabiel van Zustand
  const wensenData = useWizardState(
    (s) => (s.chapterAnswers?.wensen as WensenData | undefined) ?? DEFAULT_WENSEN_DATA
  );
  const updateChapterData = useWizardState((s) => s.updateChapterData);
  const setFocusedField = useWizardState((s) => s.setFocusedField);

  const wishes = useMemo<Wish[]>(
    () => (Array.isArray(wensenData?.wishes) ? wensenData.wishes : []),
    [wensenData?.wishes]
  );

  const ensureArray = useCallback((prev?: WensenData): WensenData => ({
    wishes: Array.isArray(prev?.wishes) ? prev.wishes : [],
  }), []);

  // ✅ Alle callbacks gememoized om loops te voorkomen
  const addWish = useCallback(() => {
    const id = crypto.randomUUID();

    updateChapterData(CHAPTER, (prevRaw) => {
      const prev = ensureArray(prevRaw as WensenData | undefined);
      return {
        wishes: [
          ...prev.wishes,
          {
            id,
            text: "",
            priority: "nice",
          },
        ],
      };
    });

    if (typeof setFocusedField === "function") {
      setTimeout(() => {
        setFocusedField(createFocusKey(CHAPTER, `wish:${id}`));
      }, 40);
    }
  }, [updateChapterData, setFocusedField, ensureArray]);

  const addQuickWish = useCallback(
    (preset: Pick<Wish, "text" | "priority" | "category">) => {
      const id = crypto.randomUUID();

      updateChapterData(CHAPTER, (prevRaw) => {
        const prev = ensureArray(prevRaw as WensenData | undefined);

        if (prev.wishes.some((w) => w.text === preset.text)) {
          return prev;
        }

        return {
          wishes: [
            ...prev.wishes,
            {
              id,
              text: preset.text,
              priority: preset.priority,
              category: preset.category,
            },
          ],
        };
      });
    },
    [updateChapterData, ensureArray]
  );

  const updateWish = useCallback(
    (id: string, patch: Partial<Wish>) => {
      updateChapterData(CHAPTER, (prevRaw) => {
        const prev = ensureArray(prevRaw as WensenData | undefined);
        return {
          wishes: prev.wishes.map((w) =>
            w.id === id ? { ...w, ...patch } : w
          ),
        };
      });
    },
    [updateChapterData, ensureArray]
  );

  const removeWish = useCallback(
    (id: string) => {
      updateChapterData(CHAPTER, (prevRaw) => {
        const prev = ensureArray(prevRaw as WensenData | undefined);
        return {
          wishes: prev.wishes.filter((w) => w.id !== id),
        };
      });
    },
    [updateChapterData, ensureArray]
  );

  const handleFocus = useCallback(
    (fieldId: string) => {
      setFocusedField(createFocusKey(CHAPTER, fieldId));
    },
    [setFocusedField]
  );

  const currentHint = useCallback(
    (prio?: Wish["priority"]) => {
      const p = PRIORITIES.find((x) => x.value === (prio ?? "nice"));
      return p?.hint ?? "";
    },
    []
  );

  return (
    <section className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-sm md:text-base font-semibold text-gray-900">
            Wensen &amp; anti-wensen
          </h2>
          <p className="text-xs md:text-sm text-gray-600">
            Verzamel hier de punten die uw plan maken of breken. Denk aan{" "}
            <strong>licht, indeling, privacy, sfeer, techniek</strong> – en noteer
            ook expliciet wat u juist níet wilt.
            <br />
            Alles wat u hier of in de chat noemt, bundelen we in één helder
            overzicht voor uw Programma van Eisen.
          </p>
        </div>

        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={addWish}
            className="rounded-lg bg-[#107d82] text-white px-3 py-1.5 hover:opacity-90 text-xs"
          >
            + Wens
          </button>
        </div>
      </div>

      {/* Quick-add voorbeelden */}
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-wide text-gray-500">
          Snel starten met voorbeelden
        </p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_WISH_PRESETS.map((preset) => (
            <button
              key={preset.text}
              type="button"
              onClick={() => addQuickWish(preset)}
              className="text-[10px] md:text-[11px] px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-700 hover:bg-[#107d82] hover:text-white transition-colors"
            >
              {preset.text}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-gray-500">
          Tip: klik op een voorbeeld om hem toe te voegen en pas hem daarna aan
          naar uw situatie.
        </p>
      </div>

      {/* Wensen lijst */}
      <div className="space-y-3">
        {wishes.map((w) => (
          <div
            key={w.id}
            className="rounded-xl border bg-white p-4 md:p-5 shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Omschrijving */}
              <FocusTarget
                chapter={CHAPTER}
                fieldId={`wish:${w.id}:text`}
              >
                <div>
                  <label className="block text-xs mb-1 text-gray-600">
                    Omschrijving
                  </label>
                  <textarea
                    className="w-full border rounded px-2 py-1.5 min-h-[60px] text-sm"
                    value={w.text ?? ""}
                    onFocus={() => handleFocus(`wish:${w.id}:text`)}
                    onChange={(e) =>
                      updateWish(w.id, { text: e.target.value })
                    }
                    placeholder="Bijv. royale leefkeuken, geen open trap in woonkamer, rustige slaapkamer..."
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Formuleer concreet. Benoem ook wat u wilt voorkomen
                    (geluid, inkijk, tocht, donkere hoeken).
                  </p>
                </div>
              </FocusTarget>

              {/* Prioriteit */}
              <FocusTarget
                chapter={CHAPTER}
                fieldId={`wish:${w.id}:priority`}
              >
                <div>
                  <label className="block text-xs mb-1 text-gray-600">
                    Prioriteit
                  </label>
                  <select
                    className="w-full border rounded px-2 py-1.5 text-sm"
                    value={w.priority ?? "nice"}
                    onFocus={() => handleFocus(`wish:${w.id}:priority`)}
                    onChange={(e) =>
                      updateWish(w.id, {
                        priority: e.target.value as Wish["priority"],
                      })
                    }
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {currentHint(w.priority)}
                  </p>
                </div>
              </FocusTarget>

              {/* Acties */}
              <div className="flex items-end justify-end">
                <button
                  type="button"
                  className="text-xs text-red-600 hover:underline"
                  onClick={() => removeWish(w.id)}
                >
                  Verwijderen
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Lege staat */}
        {wishes.length === 0 && (
          <div className="border rounded-xl p-4 text-xs md:text-sm text-gray-650 bg-gray-50">
            Nog geen wensen toegevoegd.
            <ul className="mt-1 list-disc list-inside space-y-0.5">
              <li>Klik op <em>+ Wens</em> om een eigen punt toe te voegen.</li>
              <li>
                Gebruik de voorbeeldchips hierboven om snel een eerste lijst te
                bouwen.
              </li>
              <li>
                Of typ in de chat:{" "}
                <span className="italic text-gray-600">
                  "We willen een lichte leefkeuken, maar gén inkijk vanaf de
                  straat."
                </span>{" "}
                – dan vullen wij dit hoofdstuk met u mee.
              </li>
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}