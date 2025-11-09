"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useWizardState } from "@/lib/stores/useWizardState";
import { generateChapters } from "@/lib/wizard/generateChapters";

type IntakeFormState = {
  projectType: string;
  projectSize: string;
  urgency: string;
  budget: string;
  ervaring: string;
};

const DEFAULT_STATE: IntakeFormState = {
  projectType: "",
  projectSize: "",
  urgency: "",
  budget: "",
  ervaring: "",
};

export default function IntakeForm() {
  const router = useRouter();

  const patchTriage = useWizardState((s) => s.patchTriage);
  const setChapterFlow = useWizardState((s) => s.setChapterFlow);
  const goToChapter = useWizardState((s) => s.goToChapter);
  const resetWizard = useWizardState((s) => s.reset);

  const [form, setForm] = useState<IntakeFormState>(DEFAULT_STATE);
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof IntakeFormState>(
    key: K,
    value: IntakeFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    // 1) Triage updaten in shared state
    const budgetNumber =
      form.budget && !Number.isNaN(Number(form.budget))
        ? Number(form.budget)
        : undefined;

    const nextTriage = {
      projectType: form.projectType || undefined,
      projectSize: form.projectSize || undefined,
      urgency: form.urgency || undefined,
      budget: budgetNumber,
      ervaring: form.ervaring || undefined,
      intent: [],
    };

    // schoon traject
    resetWizard();
    patchTriage(nextTriage);

    // 2) Flow genereren obv triage
    const flow = generateChapters(nextTriage);
    setChapterFlow(flow);

    // 3) Start in eerste hoofdstuk uit flow (fallback: basis)
    const first = flow[0] ?? "basis";
    goToChapter(first);

    // 4) Naar /wizard
    router.push("/wizard");
  };

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-2xl mx-auto space-y-6 rounded-2xl border bg-white/80 p-6 shadow-sm"
    >
      <header className="space-y-1">
        <h1 className="text-lg font-semibold text-slate-900">
          Vertel kort wat over uw project
        </h1>
        <p className="text-sm text-slate-600">
          Op basis hiervan stellen we een slimme volgorde van hoofdstukken samen.
          U kunt dit later altijd verfijnen.
        </p>
      </header>

      {/* Projecttype */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-800">
          Wat voor project wilt u uitwerken?
        </label>
        <select
          required
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={form.projectType}
          onChange={(e) => update("projectType", e.target.value)}
        >
          <option value="">Kies een optie…</option>
          <option value="nieuwbouw">Nieuwbouw woning</option>
          <option value="verbouwing">Verbouwing / renovatie</option>
          <option value="bijgebouw">Bijgebouw / uitbreiding</option>
          <option value="hybride">Hybride / combinatie</option>
          <option value="anders">Anders / weet ik nog niet precies</option>
        </select>
      </div>

      {/* Omvang */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-800">
          Hoe groot is het ongeveer?
        </label>
        <select
          required
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={form.projectSize}
          onChange={(e) => update("projectSize", e.target.value)}
        >
          <option value="">Kies een categorie…</option>
          <option value="<75m2">Compact (&lt; 75 m²)</option>
          <option value="75-150m2">Normaal (75–150 m²)</option>
          <option value="150-250m2">Ruim (150–250 m²)</option>
          <option value=">250m2">Groot (&gt; 250 m²)</option>
        </select>
      </div>

      {/* Urgentie */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-800">
          Wanneer wilt u ongeveer starten?
        </label>
        <select
          required
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={form.urgency}
          onChange={(e) => update("urgency", e.target.value)}
        >
          <option value="">Kies een indicatie…</option>
          <option value="<3mnd">Binnen 3 maanden</option>
          <option value="3-6mnd">Binnen 3–6 maanden</option>
          <option value="6-12mnd">Binnen 6–12 maanden</option>
          <option value=">12mnd">Langer dan 12 maanden</option>
          <option value="onzeker">Nog geen idee</option>
        </select>
      </div>

      {/* Budget */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-800">
          Richtbudget (globaal, mag ruwe schatting zijn)
        </label>
        <div className="flex gap-2 items-center">
          <span className="text-sm text-slate-500">€</span>
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={form.budget}
            onChange={(e) =>
              update("budget", e.target.value.replace(/[^\d]/g, ""))
            }
            placeholder="bijv. 250000"
          />
        </div>
        <p className="text-[11px] text-slate-500">
          Dit wordt gebruikt om adviezen en keuzes in lijn te houden. U kunt dit
          later verfijnen in het hoofdstuk <strong>Budget</strong>.
        </p>
      </div>

      {/* Ervaring */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-800">
          Hoe ervaren bent u met bouw- of verbouwprojecten?
        </label>
        <select
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={form.ervaring}
          onChange={(e) => update("ervaring", e.target.value)}
        >
          <option value="">Kies een optie…</option>
          <option value="starter">Dit is mijn eerste keer</option>
          <option value="enigszins">
            Ik heb eerder een project gedaan (enigszins ervaren)
          </option>
          <option value="ervaren">
            Ik ben zeer ervaren / professioneel
          </option>
        </select>
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0d3d4d] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Traject starten…" : "Start mijn projecttraject"}
        </button>
      </div>
    </form>
  );
}
