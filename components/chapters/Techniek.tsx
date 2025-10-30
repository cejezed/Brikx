"use client";

import { useMemo, useState } from "react";
import { useWizardState } from "@/lib/stores/useWizardState";
import type { ChapterKey } from "@/types/wizard";
import type { TechnicalPrefs, BuildMethod, Ventilation, Heating, Cooling, PvPreference } from "@/types/project";

const CHAPTER_KEY: ChapterKey = "techniek";

const BUILD_METHODS = [
  { value: "unknown", label: "Weet ik nog niet / n.v.t." },
  { value: "traditioneel_baksteen", label: "Traditioneel (baksteen/beton)" },
  { value: "houtskeletbouw", label: "Houtskeletbouw" },
  { value: "staalframe", label: "Staalframe" },
  { value: "anders", label: "Anders / later bepalen" },
] as const;

const VENTILATION = [
  { value: "unknown", label: "Weet ik nog niet / n.v.t." },
  { value: "natuurlijk", label: "Natuurlijk (roosters/kleppen)" },
  { value: "C", label: "Systeem C (toevoer natuurlijk, afvoer mechanisch)" },
  { value: "D", label: "Systeem D (aan/afvoer mechanisch)" },
  { value: "balans_wtw", label: "Balansventilatie met WTW" },
] as const;

const HEATING = [
  { value: "unknown", label: "Weet ik nog niet / n.v.t." },
  { value: "all_electric_warmtepomp", label: "All-electric warmtepomp" },
  { value: "hybride_warmtepomp", label: "Hybride warmtepomp" },
  { value: "cv_gas", label: "CV op gas (bestaand)" },
  { value: "stadswarmte", label: "Aangesloten op stadswarmte" },
] as const;

const COOLING = [
  { value: "unknown", label: "Weet ik nog niet / n.v.t." },
  { value: "passief", label: "Passief (zonwering/ventilatie)" },
  { value: "actief", label: "Actief (WP/airco/koelplafond)" },
  { value: "geen", label: "Geen koeling" },
] as const;

const PV = [
  { value: "unknown", label: "Weet ik nog niet / n.v.t." },
  { value: "geen", label: "Geen PV" },
  { value: "optioneel", label: "Optioneel / indien passend" },
  { value: "maximeren", label: "Maximaliseren (dak vol, waar zinvol)" },
] as const;

export default function Techniek() {
  // ✅ FIX: Voeg fallbacks toe
  const flow = useWizardState((s) => s.chapterFlow) ?? [];
  const current = useWizardState((s) => s.currentChapter) ?? CHAPTER_KEY;
  const goTo = useWizardState((s) => s.goToChapter);
  const setAnswer = useWizardState((s) => s.setChapterAnswer);
  const saved = useWizardState((s) => s.chapterAnswers?.[CHAPTER_KEY] as TechnicalPrefs | undefined);

  const [form, setForm] = useState<TechnicalPrefs>(
    saved ?? {
      buildMethod: "unknown",
      ventilation: "unknown",
      heating: "unknown",
      cooling: "unknown",
      pv: "unknown",
      insulationTargetRc: undefined,
      notes: "",
    }
  );

  // ✅ FIX: Safe index calculation
  const index = useMemo(() => {
    if (!Array.isArray(flow) || flow.length === 0) return -1;
    return flow.indexOf(current);
  }, [flow, current]);

  const nextKey = useMemo(() => {
    if (!Array.isArray(flow) || flow.length === 0) return "preview";
    if (index === -1 || index >= flow.length - 1) return "preview";
    return flow[index + 1] ?? "preview";
  }, [flow, index]);

  const prevKey = useMemo(() => {
    if (!Array.isArray(flow) || index <= 0) return undefined;
    return flow[index - 1];
  }, [flow, index]);

  // ✅ Commit naar store (communicatie met Chat + andere chapters)
  const commit = (patch: Partial<TechnicalPrefs>) => {
    const next = { ...form, ...patch };
    setForm(next);
    // Dit schrijft naar useWizardState.chapterAnswers.techniek
    if (setAnswer) {
      setAnswer(CHAPTER_KEY, next);
    }
  };

  const goNext = () => {
    if (goTo) {
      goTo(nextKey);
    }
  };

  const goPrev = () => {
    if (goTo && prevKey) {
      goTo(prevKey);
    }
  };

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-lg font-semibold">Techniek</h2>
        <p className="text-xs text-gray-600">
          <strong>Uitleg:</strong> selecteer je <em>voorkeur</em> per onderdeel. Onzeker? Kies "Weet ik nog niet / n.v.t.".
        </p>
      </header>

      <div className="grid gap-4 max-w-3xl md:grid-cols-2">
        <label className="block">
          <span className="block text-sm mb-1">Bouwmethode</span>
          <select
            className="w-full border rounded px-3 py-2"
            value={form.buildMethod}
            onChange={(e) => commit({ buildMethod: e.target.value as BuildMethod })}
          >
            {BUILD_METHODS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <p className="text-[11px] text-gray-500 mt-1">Materiaal/systeem van het casco.</p>
        </label>

        <label className="block">
          <span className="block text-sm mb-1">Ventilatie</span>
          <select
            className="w-full border rounded px-3 py-2"
            value={form.ventilation}
            onChange={(e) => commit({ ventilation: e.target.value as Ventilation })}
          >
            {VENTILATION.map((v) => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
          <p className="text-[11px] text-gray-500 mt-1">Binnenluchtkwaliteit en afvoer.</p>
        </label>

        <label className="block">
          <span className="block text-sm mb-1">Verwarming</span>
          <select
            className="w-full border rounded px-3 py-2"
            value={form.heating}
            onChange={(e) => commit({ heating: e.target.value as Heating })}
          >
            {HEATING.map((h) => (
              <option key={h.value} value={h.value}>{h.label}</option>
            ))}
          </select>
          <p className="text-[11px] text-gray-500 mt-1">Primaire warmteopwekking.</p>
        </label>

        <label className="block">
          <span className="block text-sm mb-1">Koeling</span>
          <select
            className="w-full border rounded px-3 py-2"
            value={form.cooling}
            onChange={(e) => commit({ cooling: e.target.value as Cooling })}
          >
            {COOLING.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <p className="text-[11px] text-gray-500 mt-1">Comfort in warme periodes.</p>
        </label>

        <label className="block">
          <span className="block text-sm mb-1">PV (zonnepanelen)</span>
          <select
            className="w-full border rounded px-3 py-2"
            value={form.pv}
            onChange={(e) => commit({ pv: e.target.value as PvPreference })}
          >
            {PV.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <p className="text-[11px] text-gray-500 mt-1">Mate van ambitie voor opwek.</p>
        </label>

        <label className="block">
          <span className="block text-sm mb-1">Isolatiedoel Rc (indicatie)</span>
          <input
            type="number"
            step={0.1}
            min={1}
            className="w-full border rounded px-3 py-2"
            value={form.insulationTargetRc ?? ""}
            onChange={(e) => commit({ insulationTargetRc: e.target.value === "" ? undefined : Number(e.target.value) })}
            placeholder="bijv. 4.5"
          />
          <p className="text-[11px] text-gray-500 mt-1">Alleen invullen als je al een doel in gedachten hebt.</p>
        </label>
      </div>

      <label className="block max-w-3xl">
        <span className="block text-sm mb-1">Toelichting / extra wensen & aandachtspunten</span>
        <textarea
          className="w-full border rounded px-3 py-2 min-h-24"
          value={form.notes ?? ""}
          onChange={(e) => commit({ notes: e.target.value })}
          placeholder="Bijv. voorkeur WTW i.v.m. luchtdicht bouwen; extra aandacht voor geluid; wens voor PV esthetisch onopvallend."
        />
      </label>

      {/* Navigation buttons */}
      <div className="flex items-center gap-2">
        {prevKey && (
          <button 
            type="button" 
            className="px-4 py-2 border rounded hover:bg-gray-50 transition"
            onClick={goPrev}
          >
            ← Vorige
          </button>
        )}
        <button 
          type="button" 
          className="ml-auto px-4 py-2 border rounded bg-[#0d3d4d] text-white hover:opacity-90 transition"
          onClick={goNext}
        >
          Opslaan & Verder →
        </button>
      </div>
    </section>
  );
}