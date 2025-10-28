"use client";

import { useMemo, useState } from "react";
import { useWizardState } from "@/lib/stores/useWizardState";
import type { ChapterKey } from "@/types/wizard";
import type {
  SustainabilityPrefs,
  EnergyFocus,
  RainwaterReuse,
  GreenRoof,
  MaterialPref,
} from "@/types/project";

const CHAPTER_KEY: ChapterKey = "duurzaamheid";

const FOCUS = [
  { value: "unknown", label: "Weet ik nog niet / n.v.t." },
  { value: "comfort", label: "Comfort & gezond binnenklimaat" },
  { value: "kosten", label: "Laag verbruik / kosten" },
  { value: "co2", label: "CO₂-reductie" },
  { value: "circulair", label: "Circulair / hergebruik" },
] as const;

const RAIN = [
  { value: "unknown", label: "Weet ik nog niet / n.v.t." },
  { value: "geen", label: "Geen hergebruik" },
  { value: "wc_tuin", label: "WC + tuin besproeiing" },
  { value: "volledig", label: "Maximaal (grijswater-systeem)" },
] as const;

const ROOF = [
  { value: "unknown", label: "Weet ik nog niet / n.v.t." },
  { value: "geen", label: "Geen groendak" },
  { value: "gedeeltelijk", label: "Gedeeltelijk groendak" },
  { value: "volledig", label: "Volledig groendak" },
] as const;

const MATERIALS = [
  { value: "unknown", label: "Weet ik nog niet / n.v.t." },
  { value: "standaard", label: "Standaard materialen" },
  { value: "biobased", label: "Biobased waar mogelijk" },
  { value: "mix", label: "Mix (prestatiegestuurd)" },
] as const;

export default function Duurzaamheid() {
  const flow = useWizardState((s) => s.chapterFlow);
  const current = useWizardState((s) => s.currentChapter);
  const goTo = useWizardState((s) => s.goToChapter);
  const setAnswer = useWizardState((s) => s.setChapterAnswer);
  const triage = useWizardState((s) => s.triage);

  const saved = useWizardState((s) => s.chapterAnswers[CHAPTER_KEY] as SustainabilityPrefs | undefined);

  const [form, setForm] = useState<SustainabilityPrefs>(
    saved ?? {
      focus: "unknown",
      rainwater: "unknown",
      greenRoof: "unknown",
      materials: "unknown",
      epcTarget: triage.projectType === "nieuwbouw" ? 0.4 : undefined,
      insulationUpgrade: triage.projectType !== "nieuwbouw" ? true : undefined,
      notes: "",
    }
  );

  const index = flow.indexOf(current);
  const prevKey = flow[index - 1];
  const nextKey = useMemo(() => flow[index + 1] ?? "preview", [flow, index]);

  const commit = (patch: Partial<SustainabilityPrefs>) => {
    const next = { ...form, ...patch };
    setForm(next);
    setAnswer(CHAPTER_KEY, next);
  };

  const goNext = () => goTo(nextKey);

  const isVerbouwing = triage.projectType === "verbouwing";

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-lg font-semibold">Duurzaamheid</h2>
        <p className="text-xs text-gray-600">
          <strong>Uitleg:</strong> selecteer je <em>prioriteit/voorkeur</em> per thema. Onzeker? Kies “Weet ik nog niet / n.v.t.”.
        </p>
      </header>

      <div className="grid gap-4 max-w-3xl md:grid-cols-2">
        <label className="block">
          <span className="block text-sm mb-1">Hoofdfocus</span>
          <select className="w-full border rounded px-3 py-2" value={form.focus}
                  onChange={(e) => commit({ focus: e.target.value as EnergyFocus })}>
            {FOCUS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <p className="text-[11px] text-gray-500 mt-1">Waar leggen we de nadruk op in keuzes?</p>
        </label>

        <label className="block">
          <span className="block text-sm mb-1">Materialen</span>
          <select className="w-full border rounded px-3 py-2" value={form.materials}
                  onChange={(e) => commit({ materials: e.target.value as MaterialPref })}>
            {MATERIALS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <p className="text-[11px] text-gray-500 mt-1">Bijv. biobased of standaard mix.</p>
        </label>

        <label className="block">
          <span className="block text-sm mb-1">Regenwater hergebruik</span>
          <select className="w-full border rounded px-3 py-2" value={form.rainwater}
                  onChange={(e) => commit({ rainwater: e.target.value as RainwaterReuse })}>
            {RAIN.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <p className="text-[11px] text-gray-500 mt-1">Optioneel; scheelt drinkwater/afvoer.</p>
        </label>

        <label className="block">
          <span className="block text-sm mb-1">Groendak</span>
          <select className="w-full border rounded px-3 py-2" value={form.greenRoof}
                  onChange={(e) => commit({ greenRoof: e.target.value as GreenRoof })}>
            {ROOF.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <p className="text-[11px] text-gray-500 mt-1">Biodiversiteit/retentie/koelte.</p>
        </label>

        <label className="block">
          <span className="block text-sm mb-1">
            {triage.projectType === "nieuwbouw" ? "BENG/EPC-doel (indicatief)" : "Energie-index/EPC (indicatief)"}
          </span>
          <input
            type="number" step={0.01} min={0} className="w-full border rounded px-3 py-2"
            value={form.epcTarget ?? ""}
            onChange={(e) => commit({ epcTarget: e.target.value === "" ? undefined : Number(e.target.value) })}
            placeholder={triage.projectType === "nieuwbouw" ? "bijv. 0.4" : "bijv. 1.2"}
          />
          <p className="text-[11px] text-gray-500 mt-1">Alleen invullen als je hier al een doel kent.</p>
        </label>

        {isVerbouwing && (
          <label className="block">
            <span className="block text-sm mb-1">Isolatie-upgrade gepland?</span>
            <select className="w-full border rounded px-3 py-2" value={String(!!form.insulationUpgrade)}
                    onChange={(e) => commit({ insulationUpgrade: e.target.value === "true" })}>
              <option value="true">Ja</option>
              <option value="false">Nee</option>
            </select>
            <p className="text-[11px] text-gray-500 mt-1">Alleen relevant bij verbouwingen.</p>
          </label>
        )}
      </div>

      <label className="block max-w-3xl">
        <span className="block text-sm mb-1">Toelichting / extra wensen & aandachtspunten</span>
        <textarea
          className="w-full border rounded px-3 py-2 min-h-24"
          value={form.notes ?? ""}
          onChange={(e) => commit({ notes: e.target.value })}
          placeholder="Bijv. voorkeur biobased gevel; groendak waar zichtbaar; extra aandacht voor hergebruik materialen."
        />
      </label>

      <div className="flex items-center">
        {prevKey && <button type="button" className="px-3 py-2 border rounded" onClick={() => goTo(prevKey)}>← Vorige</button>}
        <button type="button" className="ml-auto px-3 py-2 border rounded bg-black text-white" onClick={goNext}>
          Opslaan & Verder
        </button>
      </div>
    </section>
  );
}
