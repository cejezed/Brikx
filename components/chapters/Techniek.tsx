"use client";

import React, { useMemo } from "react";
import useWizardState from "@/lib/stores/useWizardState";
import FocusTarget from "@/components/wizard/FocusTarget";
import type { ChapterKey } from "@/types/wizard";

const CHAPTER_KEY: ChapterKey = "techniek";

type Ambition = "unknown" | "basis" | "comfort" | "max";
type CurrentState =
  | "unknown"
  | "bestaand_blijft"
  | "casco_aanpak"
  | "sloop_en_opnieuw";
type BuildMethodV2 =
  | "unknown"
  | "traditioneel_baksteen"
  | "houtskeletbouw"
  | "staalframe"
  | "anders";

export type TechnicalPrefsV2 = {
  ventilationAmbition: Ambition;
  heatingAmbition: Ambition;
  coolingAmbition: Ambition;
  pvAmbition: Ambition;
  currentState?: CurrentState;
  buildMethod?: BuildMethodV2;
  notes?: string;
};

const AMBITION_OPTS = [
  { value: "unknown", label: "Weet ik nog niet" },
  { value: "basis", label: "Basis" },
  { value: "comfort", label: "Comfort" },
  { value: "max", label: "Maximaal" },
] as const;

const CURRENT_STATE_OPTS = [
  { value: "unknown", label: "Nog onbekend" },
  { value: "bestaand_blijft", label: "Bestaand blijft grotendeels" },
  { value: "casco_aanpak", label: "Casco-aanpak" },
  { value: "sloop_en_opnieuw", label: "Sloop en opnieuw" },
] as const;

const BUILD_METHOD_OPTS = [
  { value: "unknown", label: "Nog open / n.v.t." },
  { value: "traditioneel_baksteen", label: "Traditioneel (baksteen/beton)" },
  { value: "houtskeletbouw", label: "Houtskeletbouw" },
  { value: "staalframe", label: "Staalframe" },
  { value: "anders", label: "Anders / later bepalen" },
] as const;

const defaultPrefs: TechnicalPrefsV2 = {
  ventilationAmbition: "unknown",
  heatingAmbition: "unknown",
  coolingAmbition: "unknown",
  pvAmbition: "unknown",
  notes: "",
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function patchTechniek(patch: Partial<TechnicalPrefsV2>) {
  useWizardState.setState((s: any) => {
    const prev =
      (s.chapterAnswers?.[CHAPTER_KEY] as TechnicalPrefsV2 | undefined) ??
      defaultPrefs;

    const next: TechnicalPrefsV2 = { ...prev, ...patch };

    return {
      ...s,
      chapterAnswers: {
        ...(s.chapterAnswers ?? {}),
        [CHAPTER_KEY]: next,
      },
      stateVersion: (s.stateVersion ?? 0) + 1,
    };
  });
}

export default function Techniek() {
  const projectType = useWizardState((s: any) => s.triage?.projectType);
  const saved = useWizardState(
    (s: any) => s.chapterAnswers?.[CHAPTER_KEY] as TechnicalPrefsV2 | undefined
  );
  const value = saved ?? defaultPrefs;

  const isRenovation = useMemo(
    () => projectType === "verbouwing" || projectType === "renovatie",
    [projectType]
  );
  const isNewBuild = useMemo(
    () => projectType === "nieuwbouw" || projectType === "bijgebouw",
    [projectType]
  );

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold">Techniek</h2>
        <p className="text-sm text-gray-600">
          Kies per onderdeel het ambitieniveau. Jules vertaalt dit later naar
          concrete installaties die passen bij uw project.
        </p>
      </header>

      <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
        <FocusTarget chapter={CHAPTER_KEY} fieldId="ventilationAmbition">
          <fieldset className="rounded-xl border bg-white p-3">
            <legend className="mb-2 block text-sm font-medium">
              Ventilatie — ambitie
            </legend>
            <AmbitionChips
              current={value.ventilationAmbition}
              onSelect={(v) => patchTechniek({ ventilationAmbition: v })}
            />
          </fieldset>
        </FocusTarget>

        <FocusTarget chapter={CHAPTER_KEY} fieldId="heatingAmbition">
          <fieldset className="rounded-xl border bg-white p-3">
            <legend className="mb-2 block text-sm font-medium">
              Verwarming — ambitie
            </legend>
            <AmbitionChips
              current={value.heatingAmbition}
              onSelect={(v) => patchTechniek({ heatingAmbition: v })}
            />
          </fieldset>
        </FocusTarget>

        <FocusTarget chapter={CHAPTER_KEY} fieldId="coolingAmbition">
          <fieldset className="rounded-xl border bg-white p-3">
            <legend className="mb-2 block text-sm font-medium">
              Koeling — ambitie
            </legend>
            <AmbitionChips
              current={value.coolingAmbition}
              onSelect={(v) => patchTechniek({ coolingAmbition: v })}
            />
          </fieldset>
        </FocusTarget>

        <FocusTarget chapter={CHAPTER_KEY} fieldId="pvAmbition">
          <fieldset className="rounded-xl border bg-white p-3">
            <legend className="mb-2 block text-sm font-medium">
              Zonne-energie — ambitie
            </legend>
            <AmbitionChips
              current={value.pvAmbition}
              onSelect={(v) => patchTechniek({ pvAmbition: v })}
            />
          </fieldset>
        </FocusTarget>
      </div>

      <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
        {isRenovation && (
          <FocusTarget chapter={CHAPTER_KEY} fieldId="currentState">
            <label className="block rounded-xl border bg-white p-3">
              <span className="mb-2 block text-sm font-medium">
                Huidige staat (indicatie)
              </span>
              <select
                className="w-full rounded border px-3 py-2"
                value={value.currentState ?? "unknown"}
                onChange={(e) =>
                  patchTechniek({
                    currentState: e.target.value as CurrentState,
                  })
                }
              >
                {CURRENT_STATE_OPTS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </FocusTarget>
        )}

        {isNewBuild && (
          <FocusTarget chapter={CHAPTER_KEY} fieldId="buildMethod">
            <label className="block rounded-xl border bg-white p-3">
              <span className="mb-2 block text-sm font-medium">
                Bouwmethode (globaal)
              </span>
              <select
                className="w-full rounded border px-3 py-2"
                value={value.buildMethod ?? "unknown"}
                onChange={(e) =>
                  patchTechniek({
                    buildMethod: e.target.value as BuildMethodV2,
                  })
                }
              >
                {BUILD_METHOD_OPTS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </FocusTarget>
        )}
      </div>

      <FocusTarget chapter={CHAPTER_KEY} fieldId="notes">
        <label className="block max-w-3xl">
          <span className="mb-1 block text-sm font-medium">
            Toelichting / aandachtspunten
          </span>
          <textarea
            className="min-h-24 w-full rounded border px-3 py-2"
            value={value.notes ?? ""}
            onChange={(e) => patchTechniek({ notes: e.target.value })}
          />
        </label>
      </FocusTarget>
    </section>
  );
}

function AmbitionChips({
  current,
  onSelect,
}: {
  current: Ambition;
  onSelect: (v: Ambition) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {AMBITION_OPTS.map((opt) => {
        const active = current === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            className={cx(
              "rounded-full border px-3 py-1 text-sm transition",
              active
                ? "border-[#0d3d4d] bg-[#0d3d4d] text-white"
                : "border-gray-300 bg-white hover:bg-gray-50"
            )}
            aria-pressed={active}
            onClick={() => onSelect(opt.value as Ambition)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
