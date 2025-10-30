// components/chapters/Techniek_v2.tsx
"use client";

import { useMemo } from "react";
import { useWizardState } from "@/lib/stores/useWizardState";
import FocusTarget from "@/components/wizard/FocusTarget";
import type { ChapterKey } from "@/types/wizard";

// ———————————————————————————————
// v2: Ambitie-gedreven, jargon-vrij
// ———————————————————————————————

const CHAPTER_KEY: ChapterKey = "techniek";

/** Ambitieniveaus vertalen techniek-jargon naar doelen. */
type Ambition = "unknown" | "basis" | "comfort" | "max";

/** Huidige staat – alleen relevant bij verbouw/renovatie. */
type CurrentState = "unknown" | "bestaand_blijft" | "casco_aanpak" | "sloop_en_opnieuw";

/** Bouwmethode – alleen bij nieuwbouw/bijgebouw getoond. */
type BuildMethodV2 =
  | "unknown"
  | "traditioneel_baksteen"
  | "houtskeletbouw"
  | "staalframe"
  | "anders";

/** Dit is de v2-payload die we onder chapterAnswers.techniek bewaren. */
export type TechnicalPrefsV2 = {
  // Ambities (jargon-vrij; mapping naar techniek gebeurt door Gids/Adviseur)
  ventilationAmbition: Ambition;
  heatingAmbition: Ambition;
  coolingAmbition: Ambition;
  pvAmbition: Ambition;

  // Contextuele velden (alleen tonen indien relevant voor projectType)
  currentState?: CurrentState; // verbouw/renovatie
  buildMethod?: BuildMethodV2; // nieuwbouw/bijgebouw

  // Vrije toelichting
  notes?: string;
};

// Keuzes
const AMBITION_OPTS: Array<{ value: Ambition; label: string }> = [
  { value: "unknown", label: "Weet ik nog niet" },
  { value: "basis", label: "Basis" },
  { value: "comfort", label: "Comfort" },
  { value: "max", label: "Maximaal" },
];

const CURRENT_STATE_OPTS: Array<{ value: CurrentState; label: string; hint?: string }> = [
  { value: "unknown", label: "Nog onbekend" },
  { value: "bestaand_blijft", label: "Bestaand blijft grotendeels", hint: "kleinere ingrepen" },
  { value: "casco_aanpak", label: "Casco-aanpak", hint: "schil/indeling flink wijzigen" },
  { value: "sloop_en_opnieuw", label: "Sloop en opnieuw", hint: "herbouw traject" },
];

const BUILD_METHOD_OPTS: Array<{ value: BuildMethodV2; label: string }> = [
  { value: "unknown", label: "Nog open / n.v.t." },
  { value: "traditioneel_baksteen", label: "Traditioneel (baksteen/beton)" },
  { value: "houtskeletbouw", label: "Houtskeletbouw" },
  { value: "staalframe", label: "Staalframe" },
  { value: "anders", label: "Anders / later bepalen" },
];

// Utility
function cx(...parts: Array<string | false | undefined | null>) {
  return parts.filter(Boolean).join(" ");
}

/** Robuuste patch volgens getState-patroon (voorkomt stale state). */
function patchTechniek(patch: Partial<TechnicalPrefsV2>) {
  const st = useWizardState.getState();
  const prev = (st.chapterAnswers?.[CHAPTER_KEY] as TechnicalPrefsV2 | undefined) ?? {
    ventilationAmbition: "unknown",
    heatingAmbition: "unknown",
    coolingAmbition: "unknown",
    pvAmbition: "unknown",
    notes: "",
  };
  const next: TechnicalPrefsV2 = { ...prev, ...patch };
  st.setChapterAnswer?.(CHAPTER_KEY, next);
}

export default function Techniek_v2() {
  // Lees triage/projectType voor context-aware gating
  const projectTypes = useWizardState((s) => s.triage?.projectType ?? []) as string[];

  const isRenovation = useMemo(
    () => projectTypes.some((t) => ["verbouwing", "renovatie"].includes(t)),
    [projectTypes]
  );
  const isNewBuild = useMemo(
    () => projectTypes.some((t) => ["nieuwbouw", "bijgebouw"].includes(t)),
    [projectTypes]
  );

  // Huidige opgeslagen antwoorden
  const saved = useWizardState(
    (s) => s.chapterAnswers?.[CHAPTER_KEY] as TechnicalPrefsV2 | undefined
  );

  const value = saved ?? {
    ventilationAmbition: "unknown",
    heatingAmbition: "unknown",
    coolingAmbition: "unknown",
    pvAmbition: "unknown",
    notes: "",
  };

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold">Techniek</h2>
        <p className="text-sm text-gray-600">
          Kies per onderdeel het <em>ambitieniveau</em>. De vertaling naar techniek (bijv. “Systeem D met WTW”
          of “hybride warmtepomp”) doet Jules voor u — u hoeft het jargon niet te kennen.
        </p>
      </header>

      {/* Ambities rij 2×2 */}
      <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
        {/* Ventilatie */}
        <FocusTarget chapter={CHAPTER_KEY} fieldId="ventilationAmbition">
          <fieldset className="rounded-xl border bg-white p-3">
            <legend className="mb-2 block text-sm font-medium">Ventilatie — ambitie</legend>
            <AmbitionChips
              current={value.ventilationAmbition}
              onSelect={(v) => patchTechniek({ ventilationAmbition: v })}
            />
            <p className="mt-2 text-[11px] text-gray-500">
              Basis = gezond en eenvoudig. Comfort = stiller/constanter. Maximaal = top binnenklimaat.
            </p>
          </fieldset>
        </FocusTarget>

        {/* Verwarming */}
        <FocusTarget chapter={CHAPTER_KEY} fieldId="heatingAmbition">
          <fieldset className="rounded-xl border bg-white p-3">
            <legend className="mb-2 block text-sm font-medium">Verwarming — ambitie</legend>
            <AmbitionChips
              current={value.heatingAmbition}
              onSelect={(v) => patchTechniek({ heatingAmbition: v })}
            />
            <p className="mt-2 text-[11px] text-gray-500">
              Jules vertaalt dit later naar een passend warmteconcept (bv. hybride of all-electric).
            </p>
          </fieldset>
        </FocusTarget>

        {/* Koeling */}
        <FocusTarget chapter={CHAPTER_KEY} fieldId="coolingAmbition">
          <fieldset className="rounded-xl border bg-white p-3">
            <legend className="mb-2 block text-sm font-medium">Koeling — ambitie</legend>
            <AmbitionChips
              current={value.coolingAmbition}
              onSelect={(v) => patchTechniek({ coolingAmbition: v })}
            />
            <p className="mt-2 text-[11px] text-gray-500">
              Van zonwering/passief → tot actieve koeling waar gewenst.
            </p>
          </fieldset>
        </FocusTarget>

        {/* PV / Opwek */}
        <FocusTarget chapter={CHAPTER_KEY} fieldId="pvAmbition">
          <fieldset className="rounded-xl border bg-white p-3">
            <legend className="mb-2 block text-sm font-medium">Zonne-energie (PV) — ambitie</legend>
            <AmbitionChips
              current={value.pvAmbition}
              onSelect={(v) => patchTechniek({ pvAmbition: v })}
            />
            <p className="mt-2 text-[11px] text-gray-500">
              Maximaal = “dak vol waar zinvol”. Esthetiek en oriëntatie bespreekt u met Jules.
            </p>
          </fieldset>
        </FocusTarget>
      </div>

      {/* Context: alleen tonen indien relevant volgens projectType */}
      <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
        {/* Huidige staat – verbouw/renovatie */}
        {isRenovation && (
          <FocusTarget chapter={CHAPTER_KEY} fieldId="currentState">
            <label className="block rounded-xl border bg-white p-3">
              <span className="mb-2 block text-sm font-medium">Huidige staat (indicatie)</span>
              <select
                className="w-full rounded border px-3 py-2"
                value={value.currentState ?? "unknown"}
                onChange={(e) =>
                  patchTechniek({ currentState: e.target.value as CurrentState })
                }
              >
                {CURRENT_STATE_OPTS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-[11px] text-gray-500">
                Alleen bij verbouw/renovatie. Helpt Jules de impact te duiden.
              </p>
            </label>
          </FocusTarget>
        )}

        {/* Bouwmethode – nieuwbouw/bijgebouw */}
        {isNewBuild && (
          <FocusTarget chapter={CHAPTER_KEY} fieldId="buildMethod">
            <label className="block rounded-xl border bg-white p-3">
              <span className="mb-2 block text-sm font-medium">Bouwmethode (globaal)</span>
              <select
                className="w-full rounded border px-3 py-2"
                value={value.buildMethod ?? "unknown"}
                onChange={(e) =>
                  patchTechniek({ buildMethod: e.target.value as BuildMethodV2 })
                }
              >
                {BUILD_METHOD_OPTS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-[11px] text-gray-500">
                Alleen tonen bij nieuwbouw/bijgebouw. Detailkeuze volgt later met uw architect.
              </p>
            </label>
          </FocusTarget>
        )}
      </div>

      {/* Vrije toelichting */}
      <FocusTarget chapter={CHAPTER_KEY} fieldId="notes">
        <label className="block max-w-3xl">
          <span className="mb-1 block text-sm font-medium">Toelichting / aandachtspunten</span>
          <textarea
            className="min-h-24 w-full rounded border px-3 py-2"
            value={value.notes ?? ""}
            onChange={(e) => patchTechniek({ notes: e.target.value })}
            placeholder="Bijv. stille installatie; voorkeur voor onopvallende PV; allergieën/geluid; onderhoud laag."
          />
        </label>
      </FocusTarget>

      {/* Proactieve coaching (“Jules ervaring”) */}
      <div className="max-w-3xl rounded-xl border border-dashed p-3 text-sm text-gray-700">
        <strong>Tip</strong>: Wilt u het jargon snappen zonder te verdwalen?
        <ul className="mt-1 list-disc pl-5 text-[13px]">
          <li>
            Vraag Jules in de chat: <em>“wat is het verschil tussen hybride en all-electric?”</em>
          </li>
          <li>
            Bekijk rechts in de Adviseur (Expert Corner) korte uitleg bij het veld dat u nu invult.
          </li>
        </ul>
      </div>

      {/* Opzettelijk géén lokale navigatieknoppen (Eis 2.3). Navigatie via Tabs/Jules. */}
    </section>
  );
}

/** Re-usable chip selector voor ambitieniveaus (met “unknown”). */
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
            onClick={() => onSelect(opt.value)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
