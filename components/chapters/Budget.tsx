// /components/chapters/ChapterBudget.tsx
"use client";

import React, { useEffect, useMemo } from "react";
import { useWizardState } from "@/lib/stores/useWizardState";
import FocusTarget from "@/components/wizard/FocusTarget";
import type { ChapterKey } from "@/types/project";

const CHAPTER: ChapterKey = "budget";

type BudgetState = {
  budgetTotaal?: number;
  minBudget?: number;
  maxBudget?: number;
  notes?: string;
};

// Zorgt voor consistente basis + optioneel vullen vanuit centrale budgetbron
const ensure = (
  prevRaw: BudgetState | undefined
): BudgetState => {
  const prev = (prevRaw as BudgetState) || {};
  return prev;
};

export default function ChapterBudget() {
  // ✅ Individual selectors (no array destructuring, no shallow)
  const dataRaw = useWizardState((s) => s.chapterAnswers?.[CHAPTER] as BudgetState | undefined);
  const updateChapterData = useWizardState((s) => s.updateChapterData);
  const setCurrentChapter = useWizardState((s) => s.setCurrentChapter);
  const setFocusedField = useWizardState((s) => s.setFocusedField);
  const currentChapter = useWizardState((s) => s.currentChapter);

  // triage kan in sommige builds ontbreken; selecteer los en tolerant
  const triage = useWizardState((s) => (s as any).triage);

  // Actief hoofdstuk zetten — met guard om ping-pong te voorkomen
  useEffect(() => {
    if (currentChapter !== CHAPTER) setCurrentChapter(CHAPTER);
  }, [currentChapter, setCurrentChapter]);

  // Consistente state + optioneel vullen vanuit centrale budgetbron
  const state: BudgetState = useMemo(
    () => ensure(dataRaw),
    [dataRaw]
  );

  const patch = (patch: Partial<BudgetState>) => {
    updateChapterData(CHAPTER, (prevRaw) => {
      const base = ensure(prevRaw as BudgetState | undefined);
      const next: BudgetState = {
        ...base,
        ...patch,
      };

      // Kleine sanity checks (optioneel, mild)
      if (
        typeof next.minBudget === "number" &&
        typeof next.maxBudget === "number" &&
        next.minBudget > next.maxBudget
      ) {
        // Swap indien per ongeluk omgedraaid
        return {
          ...next,
          minBudget: next.maxBudget,
          maxBudget: next.minBudget,
        };
      }

      return next;
    });
  };

  const formatProjectContext = () => {
    if (!triage) return "";
    const { projectType, projectSize } = triage;
    if (!projectType && !projectSize) return "";
    if (projectType && projectSize) return `${projectType} · ${projectSize}`;
    return projectType || projectSize || "";
  };

  return (
    <section className="space-y-4 max-w-3xl">
      {/* Titel + context */}
      <div className="space-y-1">
        <h2 className="text-sm md:text-base font-semibold text-gray-900">Budget</h2>
        <p className="text-xs md:text-sm text-gray-600">
          Een realistische bandbreedte helpt om <strong>ontwerpkeuzes, materialen en fasering</strong> in lijn te
          houden met uw mogelijkheden. We gebruiken dit budget ook in de risicocheck en het Programma van Eisen.
        </p>
        {formatProjectContext() && (
          <p className="text-[10px] text-gray-500">Projectcontext: {formatProjectContext()}</p>
        )}
      </div>

      {/* Totaalbudget */}
      <FocusTarget chapter={CHAPTER} fieldId={`${CHAPTER}.budgetTotaal`}>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs md:text-sm font-medium text-gray-800">Totaalbudget (globale indicatie)</label>
          <input
            type="number"
            className="border rounded-md px-3 py-2 text-sm"
            value={state.budgetTotaal ?? ""}
            onChange={(e) =>
              patch({
                budgetTotaal: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            placeholder="Bijvoorbeeld 300000"
          />
          <p className="text-[10px] text-gray-500">
            Inclusief bouwkosten, aannemer, architect, adviseurs en btw (tenzij u bewust anders noteert bij toelichting).
          </p>
        </div>
      </FocusTarget>

      {/* Min / Max bandbreedte */}
      <div className="grid grid-cols-2 gap-3">
        <FocusTarget chapter={CHAPTER} fieldId={`${CHAPTER}.minBudget`}>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs md:text-sm font-medium text-gray-800">Minimale raming</label>
            <input
              type="number"
              className="border rounded-md px-3 py-2 text-sm"
              value={state.minBudget ?? ""}
              onChange={(e) =>
                patch({
                  minBudget: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              placeholder="Ondergrens (bijv. 260000)"
            />
            <p className="text-[10px] text-gray-500">Ondergrens waarboven het plan nog haalbaar is.</p>
          </div>
        </FocusTarget>

        <FocusTarget chapter={CHAPTER} fieldId={`${CHAPTER}.maxBudget`}>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs md:text-sm font-medium text-gray-800">Maximale raming</label>
            <input
              type="number"
              className="border rounded-md px-3 py-2 text-sm"
              value={state.maxBudget ?? ""}
              onChange={(e) =>
                patch({
                  maxBudget: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              placeholder="Bovengrens (bijv. 340000)"
            />
            <p className="text-[10px] text-gray-500">Boven deze grens wordt het plan oncomfortabel of onrealistisch.</p>
          </div>
        </FocusTarget>
      </div>

      {/* Toelichting */}
      <FocusTarget chapter={CHAPTER} fieldId={`${CHAPTER}.notes`}>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs md:text-sm font-medium text-gray-800">
            Toelichting: wat valt binnen / buiten dit budget?
          </label>
          <textarea
            className="border rounded-md px-3 py-2 text-sm min-h-[80px]"
            value={state.notes ?? ""}
            onChange={(e) =>
              patch({
                notes: e.target.value || undefined,
              })
            }
            placeholder={`Bijvoorbeeld:
- Inclusief keuken en badkamer, exclusief losse meubels
- Inclusief installaties en warmtepomp
- Reservering voor 10-15% onvoorzien`}
          />
          <p className="text-[10px] text-gray-500">
            Deze tekst nemen we letterlijk mee in uw PvE, zodat alle partijen hetzelfde uitgangspunt hanteren.
          </p>
        </div>
      </FocusTarget>

      {/* Hint naar AI / chat */}
      <div className="text-[10px] text-gray-500 bg-gray-50 border border-dashed rounded-md px-3 py-2">
        Tip: u kunt in de chat ook zeggen{" "}
        <span className="italic">
          "Reken met maximaal 325.000 inclusief verbouwing, maar exclusief keuken."
        </span>{" "}
        – dan werken we dit hoofdstuk automatisch bij.
      </div>
    </section>
  );
}