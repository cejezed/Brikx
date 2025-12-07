// /components/chapters/ChapterBasis.tsx
// ✅ v3.13 Conform: Met onFocus-handlers om de ExpertCorner te activeren + DossierChecklist

"use client";

import React, { useEffect, useState } from "react";
import { Home, Hammer, Scaling, Layers, HelpCircle } from "lucide-react";
import { useWizardState } from "@/lib/stores/useWizardState";
import { generateChapters } from "@/lib/wizard/generateChapters";
import type { ChapterKey, BasisData, BudgetData } from "@/types/project";
import FocusTarget from "@/components/wizard/FocusTarget";
// ✅ v3.0: Importeer de focus-helper
import { createFocusKey } from "@/lib/wizard/focusKeyHelper";
// ✅ v3.13: Dossier & Documenten checklist
import DossierChecklist from "@/app/wizard/components/DossierChecklist";

const CHAPTER: ChapterKey = "basis";

export default function ChapterBasis() {
  // Losse selectors
  const basisRaw = useWizardState(
    (s) => s.chapterAnswers.basis as BasisData | undefined
  );
  const budgetRaw = useWizardState(
    (s) => s.chapterAnswers.budget as BudgetData | undefined
  );
  const chapterFlowRaw = useWizardState((s) => s.chapterFlow);
  const updateChapterData = useWizardState((s) => s.updateChapterData);
  const setCurrentChapter = useWizardState((s) => s.setCurrentChapter);
  const setChapterFlow = useWizardState((s) => s.setChapterFlow);
  const currentChapter = useWizardState((s) => s.currentChapter);

  // ✅ STAP 1: Haal de setter voor de ExpertCorner op
  const setFocusedField = useWizardState((s) => s.setFocusedField);

  // ✅ v3.13: Dossier sectie toggle state
  const [showDossier, setShowDossier] = useState(false);

  // Fallbacks
  const basisData: BasisData = basisRaw ?? ({} as BasisData);
  const budgetData: BudgetData = budgetRaw ?? ({} as BudgetData);
  const chapterFlow = chapterFlowRaw ?? [];

  // ✅ Loop-veilige hook: stelt alleen in als dit niet de actieve chapter is
  useEffect(() => {
    if (currentChapter !== CHAPTER) setCurrentChapter(CHAPTER);
  }, [currentChapter, setCurrentChapter]);

  // ✅ Loop-veilige hook: update de flow alleen als het projectType wijzigt
  useEffect(() => {
    const state = useWizardState.getState();
    const newFlow = generateChapters(state);
    const same =
      newFlow.length === chapterFlow.length &&
      newFlow.every((v, i) => v === chapterFlow[i]);
    if (!same) setChapterFlow(newFlow);
  }, [basisData?.projectType, chapterFlow, setChapterFlow]);

  // ✅ v3.0 Unified updater (alle Basis-velden behalve budget)
  const update = <K extends keyof BasisData>(field: K, value: BasisData[K]) => {
    updateChapterData(CHAPTER, (prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ✅ Specifieke handler voor budget:
  // schrijft DIRECT naar budget.budgetTotaal zodat Basis & Budget dezelfde bron delen
  const updateBudget = (raw: string) => {
    const val =
      raw.trim() === "" ? undefined : Number(raw.replace(/\D+/g, ""));
    updateChapterData("budget", (prev) => ({
      ...prev,
      budgetTotaal: val,
    }));
  };

  // ✅ STAP 2: Helper-functie voor focus
  const handleFocus = (fieldId: keyof BasisData) => {
    setFocusedField(createFocusKey(CHAPTER, fieldId));
  };

  return (
    <section className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <FocusTarget chapter={CHAPTER} fieldId="__header">
        <header>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight mb-3 text-slate-900">
            De Basis.
          </h1>
          <p className="text-lg leading-relaxed max-w-2xl text-slate-500">
            Laten we de fundering leggen. Vertel ons de basisgegevens zodat de wizard zich aanpast aan uw project.
          </p>
        </header>
      </FocusTarget>

      <div className="space-y-10">

        {/* PROJECT TYPE */}
        <FocusTarget chapter={CHAPTER} fieldId="projectType">
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Wat voor project wilt u uitwerken?
            </label>
            <div className="flex gap-3 overflow-x-auto pb-4 -mx-6 px-6 lg:mx-0 lg:px-0 lg:pb-0 scrollbar-hide snap-x lg:flex-nowrap">
              {[
                { value: "nieuwbouw", label: "Nieuwbouw woning", icon: Home },
                { value: "verbouwing", label: "Verbouwing / renovatie", icon: Hammer },
                { value: "bijgebouw", label: "Bijgebouw / uitbreiding", icon: Scaling },
                { value: "hybride", label: "Hybride / combinatie", icon: Layers },
                { value: "anders", label: "Anders / weet ik nog niet precies", icon: HelpCircle },
              ].map((option) => {
                const Icon = option.icon;
                const isActive = basisData?.projectType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      handleFocus("projectType");
                      update("projectType", option.value as BasisData["projectType"]);
                    }}
                    className={[
                      "flex-none w-36 h-36 lg:w-auto lg:h-auto lg:aspect-square lg:flex-1 snap-center",
                      "flex flex-col items-center justify-center gap-3 p-4",
                      "rounded-2xl border-2 transition-all duration-300",
                      isActive
                        ? "bg-brikx-500 border-brikx-500 text-white shadow-lg shadow-brikx-500/30 scale-105 z-10"
                        : "bg-white/40 border-white/60 backdrop-blur-xl text-slate-600 hover:border-brikx-400 hover:text-brikx-600 hover:bg-white/60 shadow-sm hover:shadow-md",
                    ].join(" ")}
                  >
                    <Icon size={32} className={isActive ? "text-white" : "text-slate-500"} />
                    <span className="text-xs font-bold text-center leading-tight">
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500">
              Uw keuze bepaalt welke hoofdstukken verschijnen.
            </p>
          </div>
        </FocusTarget>

        {/* PROJECT NAME & LOCATION - Side by side */}
        <div className="grid md:grid-cols-2 gap-8">
          <FocusTarget chapter={CHAPTER} fieldId="projectNaam">
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Projectnaam
              </label>
              <input
                className="glass-input w-full"
                value={basisData?.projectNaam ?? ""}
                onFocus={() => handleFocus("projectNaam")}
                onChange={(e) => update("projectNaam", e.target.value)}
                placeholder="Bijv. Uitbouw Serre"
              />
            </div>
          </FocusTarget>

          <FocusTarget chapter={CHAPTER} fieldId="locatie">
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Locatie
              </label>
              <input
                className="glass-input w-full"
                value={basisData?.locatie ?? ""}
                onFocus={() => handleFocus("locatie")}
                onChange={(e) => update("locatie", e.target.value)}
                placeholder="Postcode + Huisnr."
              />
            </div>
          </FocusTarget>
        </div>

        {/* BUDGET */}
        <FocusTarget chapter={CHAPTER} fieldId="budget">
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Budget Indicatie
            </label>
            <div className="relative rounded-2xl p-2 border-2 focus-within:ring-4 transition-all backdrop-blur-sm bg-white/40 border-white/50 focus-within:border-brikx-400 focus-within:ring-brikx-400/20 shadow-sm">
              <input
                type="text"
                inputMode="numeric"
                value={budgetData?.budgetTotaal ? `€ ${Number(budgetData.budgetTotaal).toLocaleString('nl-NL')}` : ""}
                onFocus={(e) => {
                  handleFocus("budget");
                  if (budgetData?.budgetTotaal) {
                    e.target.value = String(budgetData.budgetTotaal);
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value) {
                    const num = Number(e.target.value.replace(/\D/g, ''));
                    e.target.value = `€ ${num.toLocaleString('nl-NL')}`;
                  }
                }}
                onChange={(e) => updateBudget(e.target.value.replace(/\D/g, ''))}
                placeholder="€ 0"
                className="w-full text-4xl font-black tracking-tight bg-transparent px-6 py-4 focus:outline-none placeholder:text-slate-400 text-slate-900"
              />
            </div>
            <p className="text-xs text-slate-500">
              Dit wordt de basis voor het <strong>Budget</strong>-hoofdstuk.
            </p>
          </div>
        </FocusTarget>

        {/* PROJECT SIZE */}
        <FocusTarget chapter={CHAPTER} fieldId="projectSize">
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Hoe groot is het ongeveer?
            </label>
            <div className="flex gap-2">
              {[
                { value: "<75m2", label: "< 75 m²" },
                { value: "75-150m2", label: "75–150 m²" },
                { value: "150-250m2", label: "150–250 m²" },
                { value: ">250m2", label: "> 250 m²" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    handleFocus("projectSize");
                    update("projectSize", option.value as BasisData["projectSize"]);
                  }}
                  className={[
                    "px-6 py-3 rounded-xl text-sm font-bold border-2 transition-all backdrop-blur-sm",
                    basisData?.projectSize === option.value
                      ? "bg-brikx-500 border-brikx-500 text-white shadow-lg shadow-brikx-500/30 transform scale-105"
                      : "bg-white/40 text-slate-600 border-white/50 hover:border-brikx-400 hover:text-brikx-600 hover:bg-white/80 shadow-sm",
                  ].join(" ")}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </FocusTarget>

        {/* URGENCY */}
        <FocusTarget chapter={CHAPTER} fieldId="urgency">
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Wanneer wilt u ongeveer starten?
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "<3mnd", label: "< 3 maanden" },
                { value: "3-6mnd", label: "3–6 maanden" },
                { value: "6-12mnd", label: "6–12 maanden" },
                { value: ">12mnd", label: "> 12 maanden" },
                { value: "onzeker", label: "Nog onzeker" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    handleFocus("urgency");
                    update("urgency", option.value as BasisData["urgency"]);
                  }}
                  className={[
                    "px-6 py-3 rounded-xl text-sm font-bold border-2 transition-all backdrop-blur-sm",
                    basisData?.urgency === option.value
                      ? "bg-brikx-500 border-brikx-500 text-white shadow-lg shadow-brikx-500/30 transform scale-105"
                      : "bg-white/40 text-slate-600 border-white/50 hover:border-brikx-400 hover:text-brikx-600 hover:bg-white/80 shadow-sm",
                  ].join(" ")}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </FocusTarget>

        {/* EXPERIENCE */}
        <FocusTarget chapter={CHAPTER} fieldId="ervaring">
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Hoe ervaren bent u met bouwprojecten?
            </label>
            <div className="flex gap-2">
              {[
                { value: "starter", label: "Eerste project" },
                { value: "enigszins", label: "Enigszins ervaren" },
                { value: "ervaren", label: "Zeer ervaren" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    handleFocus("ervaring");
                    update("ervaring", option.value as BasisData["ervaring"]);
                  }}
                  className={[
                    "flex-1 px-6 py-3 rounded-xl text-sm font-bold border-2 transition-all backdrop-blur-sm",
                    basisData?.ervaring === option.value
                      ? "bg-brikx-500 border-brikx-500 text-white shadow-lg shadow-brikx-500/30 transform scale-105"
                      : "bg-white/40 text-slate-600 border-white/50 hover:border-brikx-400 hover:text-brikx-600 hover:bg-white/80 shadow-sm",
                  ].join(" ")}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </FocusTarget>

        {/* TOELICHTING */}
        <FocusTarget chapter={CHAPTER} fieldId="toelichting">
          <label className="block">
            <span className="block text-sm font-medium mb-1">
              Korte toelichting (optioneel)
            </span>
            <textarea
              className="w-full border rounded px-3 py-2 min-h-24 text-sm"
              value={basisData?.toelichting ?? ""}
              // ✅ STAP 3: Voeg onFocus toe
              onFocus={() => handleFocus("toelichting")}
              onChange={(e) => update("toelichting", e.target.value)}
              placeholder="Beschrijf kort wat u wilt bereiken. Dit geeft de AI context."
            />
          </label>
        </FocusTarget>

        {/* ✅ v3.13: DOSSIER & DOCUMENTEN CHECKLIST */}
        {basisData?.projectType && (
          <FocusTarget chapter={CHAPTER} fieldId="documentStatus">
            <div className="mt-8 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowDossier(!showDossier)}
                className="w-full flex items-center justify-between text-left"
              >
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Dossier & Documenten
                  </h2>
                  <p className="text-sm text-slate-500">
                    Welke documenten en inspiratie heeft u al verzameld?
                  </p>
                </div>
                <span className="text-2xl text-slate-400">
                  {showDossier ? "−" : "+"}
                </span>
              </button>

              {showDossier && (
                <div className="mt-4">
                  <DossierChecklist
                    onComplete={() => {
                      // Optioneel: scroll naar navigation of feedback
                      console.log("[Basis] DossierChecklist completed");
                    }}
                  />
                </div>
              )}
            </div>
          </FocusTarget>
        )}

      </div>
    </section>
  );
}
