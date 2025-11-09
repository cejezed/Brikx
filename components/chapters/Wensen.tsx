"use client";

import React, { useEffect, useId, useState } from "react";
import FocusTarget from "@/components/wizard/FocusTarget";
import useWizardState from "@/lib/stores/useWizardState";
import { useUiStore } from "@/lib/stores/useUiStore";
import type { ChapterKey } from "@/types/wizard";
import type { WishItem, WishPriority } from "@/types/project";

const CHAPTER_KEY: ChapterKey = "wensen";

const PRIORITIES: {
  value: WishPriority;
  label: string;
  hint: string;
}[] = [
  {
    value: "unknown",
    label: "Weet ik nog niet / n.v.t.",
    hint: "Later prioriteren is prima.",
  },
  {
    value: "must",
    label: "Must-have",
    hint: "Moet erin, kern voor succes.",
  },
  {
    value: "nice",
    label: "Nice-to-have",
    hint: "Gewenst, maar niet cruciaal.",
  },
  {
    value: "future",
    label: "Toekomst-optie",
    hint: "Kan in fase 2 / later.",
  },
];

export default function Wensen() {
  const uid = useId();
  const { setCurrentChapter, setFocusedField } = useUiStore();

  useEffect(() => {
    setCurrentChapter?.(CHAPTER_KEY);
  }, [setCurrentChapter]);

  const stored = useWizardState(
    (s: any) => s.chapterAnswers?.[CHAPTER_KEY] as WishItem[] | undefined
  );

  const [wishes, setWishes] = useState<WishItem[]>(
    Array.isArray(stored) ? stored : []
  );

  useEffect(() => {
    if (Array.isArray(stored)) setWishes(stored);
  }, [stored]);

  const commit = (next: WishItem[]) => {
    setWishes(next);
    useWizardState.setState((s: any) => ({
      ...s,
      chapterAnswers: {
        ...(s.chapterAnswers ?? {}),
        [CHAPTER_KEY]: next,
      },
      stateVersion: (s.stateVersion ?? 0) + 1,
    }));
  };

  const addWish = () => {
    const id = `${uid}-${Date.now()}`;
    const current =
      (useWizardState.getState().chapterAnswers?.[
        CHAPTER_KEY
      ] as WishItem[]) ?? [];
    const next = [
      ...current,
      { id, label: "", confirmed: false, priority: "unknown" as WishPriority },
    ];
    commit(next);
    setTimeout(
      () =>
        setFocusedField?.({
          chapter: CHAPTER_KEY,
          fieldId: `label_${id}`,
        } as any),
      50
    );
  };

  const updateWish = (idx: number, patch: Partial<WishItem>) => {
    const current =
      (useWizardState.getState().chapterAnswers?.[
        CHAPTER_KEY
      ] as WishItem[]) ?? [];
    const next = current.map((w, i) =>
      i === idx ? { ...w, ...patch } : w
    );
    commit(next);
  };

  const removeWish = (idx: number) => {
    const current =
      (useWizardState.getState().chapterAnswers?.[
        CHAPTER_KEY
      ] as WishItem[]) ?? [];
    const next = current.filter((_, i) => i !== idx);
    commit(next);
  };

  const currentHint = (prio: WishPriority | undefined) =>
    PRIORITIES.find((p) => p.value === (prio ?? "unknown"))?.hint ?? "";

  return (
    <section className="space-y-5 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm md:text-base font-semibold text-gray-900">
            Wensen & anti-wensen
          </h2>
          <p className="text-xs text-gray-600">
            Beschrijf wat u belangrijk vindt — en ook wat u juist{" "}
            <strong>niet</strong> wilt.
          </p>
        </div>
        <button
          type="button"
          onClick={addWish}
          className="rounded-lg bg-[#107d82] text-white px-3 py-1.5 hover:opacity-90 text-xs"
        >
          + Wens
        </button>
      </div>

      <div className="space-y-3">
        {wishes.map((w, i) => (
          <div
            key={w.id}
            className="rounded-xl border bg-white p-4 md:p-5 shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FocusTarget chapter={CHAPTER_KEY} fieldId={`label_${w.id}`}>
                <div>
                  <label className="block text-xs mb-1 text-gray-600">
                    Omschrijving
                  </label>
                  <textarea
                    className="w-full border rounded px-2 py-1.5 min-h-[60px] text-sm"
                    value={w.label}
                    onChange={(e) =>
                      updateWish(i, { label: e.target.value })
                    }
                    placeholder="bv. kookeiland, licht, geen open keuken..."
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Omschrijf kort en concreet.
                  </p>
                </div>
              </FocusTarget>

              <FocusTarget
                chapter={CHAPTER_KEY}
                fieldId={`priority_${w.id}`}
              >
                <div>
                  <label className="block text-xs mb-1 text-gray-600">
                    Prioriteit
                  </label>
                  <select
                    className="w-full border rounded px-2 py-1.5 text-sm"
                    value={w.priority ?? "unknown"}
                    onChange={(e) =>
                      updateWish(i, {
                        priority: e.target.value as WishPriority,
                      })
                    }
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {currentHint(w.priority)}
                  </p>
                </div>
              </FocusTarget>

              <div className="flex items-end justify-end">
                <button
                  type="button"
                  className="text-xs text-red-600 hover:underline"
                  onClick={() => removeWish(i)}
                >
                  Verwijderen
                </button>
              </div>
            </div>
          </div>
        ))}

        {wishes.length === 0 && (
          <div className="border rounded p-4 text-sm text-gray-600 bg-gray-50">
            Nog geen wensen toegevoegd. Klik op <em>+ Wens</em> of typ in de
            chat:
            <br />
            <span className="italic text-gray-500">
              “We willen een lichte leefkeuken, maar géén inkijk.”
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
