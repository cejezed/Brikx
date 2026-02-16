"use client";

import { useState } from "react";
import { usePveCheckStore } from "@/lib/stores/usePveCheckStore";
import type {
  PveBudgetRange,
  PveDuurzaamheidsAmbitie,
  PveProjectType,
} from "@/types/pveCheck";

const PROJECT_TYPES: { value: PveProjectType; label: string }[] = [
  { value: "nieuwbouw", label: "Nieuwbouw" },
  { value: "verbouwing", label: "Verbouwing" },
  { value: "bijgebouw", label: "Bijgebouw" },
  { value: "hybride", label: "Hybride" },
  { value: "anders", label: "Anders" },
];

const BUDGET_RANGES: { value: PveBudgetRange; label: string }[] = [
  { value: "< €100k", label: "< €100.000" },
  { value: "€100k-€250k", label: "€100.000 – €250.000" },
  { value: "€250k-€500k", label: "€250.000 – €500.000" },
  { value: "€500k-€1M", label: "€500.000 – €1.000.000" },
  { value: "> €1M", label: "> €1.000.000" },
];

const DUURZAAMHEID: { value: PveDuurzaamheidsAmbitie; label: string }[] = [
  { value: "basis", label: "Basis (bouwbesluit)" },
  { value: "normaal", label: "Normaal" },
  { value: "ambitieus", label: "Ambitieus (A+/A++)" },
  { value: "zeer_ambitieus", label: "Zeer ambitieus (NOM)" },
];

export function IntakeStep() {
  const setIntake = usePveCheckStore((s) => s.setIntake);
  const setStep = usePveCheckStore((s) => s.setStep);

  const [archetype, setArchetype] = useState("");
  const [projectType, setProjectType] = useState<PveProjectType>("nieuwbouw");
  const [locatie, setLocatie] = useState("");
  const [postcode4, setPostcode4] = useState("");
  const [budgetRange, setBudgetRange] = useState<PveBudgetRange>("€100k-€250k");
  const [bouwjaar, setBouwjaar] = useState("");
  const [duurzaamheid, setDuurzaamheid] =
    useState<PveDuurzaamheidsAmbitie>("normaal");

  const canSubmit = archetype.trim() && locatie.trim();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setIntake({
      archetype: archetype.trim(),
      projectType,
      locatie: locatie.trim(),
      postcode4: postcode4.trim() || undefined,
      budgetRange,
      bouwjaar: bouwjaar.trim() || undefined,
      duurzaamheidsAmbitie: duurzaamheid,
    });
    setStep("upload");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">
          Vertel ons over je project
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          We gebruiken deze informatie om je PvE gerichter te analyseren.
        </p>
      </div>

      {/* Archetype */}
      <Field label="Wat voor project is dit?" required>
        <input
          type="text"
          value={archetype}
          onChange={(e) => setArchetype(e.target.value)}
          placeholder="bv. Gezinswoning nieuwbouw, Jaren-30 verbouwing, Schuur ombouw..."
          className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d3d4d]/40"
        />
      </Field>

      {/* Project type */}
      <Field label="Projecttype">
        <select
          value={projectType}
          onChange={(e) => setProjectType(e.target.value as PveProjectType)}
          className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d3d4d]/40"
        >
          {PROJECT_TYPES.map((pt) => (
            <option key={pt.value} value={pt.value}>
              {pt.label}
            </option>
          ))}
        </select>
      </Field>

      {/* Locatie */}
      <Field label="Locatie" required>
        <input
          type="text"
          value={locatie}
          onChange={(e) => setLocatie(e.target.value)}
          placeholder="bv. Utrecht, Amsterdam-Zuid"
          className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d3d4d]/40"
        />
      </Field>

      {/* Postcode */}
      <Field label="Postcode (4 cijfers)" hint="Optioneel, voor latere vergunningslogica">
        <input
          type="text"
          value={postcode4}
          onChange={(e) => setPostcode4(e.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder="3511"
          maxLength={4}
          className="w-28 mt-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d3d4d]/40"
        />
      </Field>

      {/* Budget range */}
      <Field label="Budgetrange">
        <select
          value={budgetRange}
          onChange={(e) => setBudgetRange(e.target.value as PveBudgetRange)}
          className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d3d4d]/40"
        >
          {BUDGET_RANGES.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
      </Field>

      {/* Bouwjaar (only for verbouwing) */}
      {(projectType === "verbouwing" || projectType === "hybride") && (
        <Field label="Bouwjaar bestaande woning" hint="Belangrijk voor asbest-risico en constructieve aannames">
          <input
            type="text"
            value={bouwjaar}
            onChange={(e) => setBouwjaar(e.target.value)}
            placeholder="bv. 1932"
            className="w-28 mt-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d3d4d]/40"
          />
        </Field>
      )}

      {/* Duurzaamheid */}
      <Field label="Duurzaamheidsambitie">
        <select
          value={duurzaamheid}
          onChange={(e) =>
            setDuurzaamheid(e.target.value as PveDuurzaamheidsAmbitie)
          }
          className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d3d4d]/40"
        >
          {DUURZAAMHEID.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </Field>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full py-3 px-6 rounded-lg bg-[#0d3d4d] text-white font-medium hover:bg-[#0a2f3c] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Volgende: Document uploaden
      </button>
    </form>
  );
}

// ---- Reusable field wrapper ----
function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      {hint && (
        <span className="block text-xs text-slate-400">{hint}</span>
      )}
      {children}
    </label>
  );
}
