"use client";

import React, { useMemo } from "react";
import useWizardState from "@/lib/stores/useWizardState";
import type { ChapterKey } from "@/types/wizard";

const CHAPTER: ChapterKey = "budget";

type BudgetState = {
  totaalBudget?: number;
  minBudget?: number;
  maxBudget?: number;
  toelichting?: string;
  [key: string]: any;
};

export default function ChapterBudget() {
  const chapterAnswers = useWizardState(
    (s: any) => s.chapterAnswers
  ) as Record<string, any>;
  const patchChapterAnswer = useWizardState(
    (s: any) => s.patchChapterAnswer
  );
  const getBudgetValue = useWizardState((s: any) => s.getBudgetValue);

  const state: BudgetState = useMemo(
    () => ({
      ...(chapterAnswers?.[CHAPTER] ?? {}),
      totaalBudget:
        chapterAnswers?.[CHAPTER]?.totaalBudget ?? getBudgetValue() ?? undefined,
    }),
    [chapterAnswers, getBudgetValue]
  );

  const update = (patch: Partial<BudgetState>) => {
    patchChapterAnswer?.(CHAPTER, patch);
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <h2 className="text-xl font-semibold">Budget</h2>
      <p className="text-sm text-muted-foreground">
        Geef een realistische bandbreedte op. De assistent zorgt dat keuzes in
        lijn blijven met dit budget.
      </p>

      {/* Totaalbudget */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">
          Totaalbudget (globale indicatie)
        </label>
        <input
          type="number"
          className="border rounded-md px-3 py-2 text-sm"
          value={state.totaalBudget ?? ""}
          onChange={(e) =>
            update({
              totaalBudget: e.target.value
                ? Number(e.target.value)
                : undefined,
            })
          }
          placeholder="Bijvoorbeeld 300000"
        />
      </div>

      {/* Min / Max */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Minimaal</label>
          <input
            type="number"
            className="border rounded-md px-3 py-2 text-sm"
            value={state.minBudget ?? ""}
            onChange={(e) =>
              update({
                minBudget: e.target.value
                  ? Number(e.target.value)
                  : undefined,
              })
            }
            placeholder="Ondergrens"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Maximaal</label>
          <input
            type="number"
            className="border rounded-md px-3 py-2 text-sm"
            value={state.maxBudget ?? ""}
            onChange={(e) =>
              update({
                maxBudget: e.target.value
                  ? Number(e.target.value)
                  : undefined,
              })
            }
            placeholder="Bovengrens"
          />
        </div>
      </div>

      {/* Toelichting */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">
          Toelichting (wat valt binnen / buiten het budget?)
        </label>
        <textarea
          className="border rounded-md px-3 py-2 text-sm min-h-[80px]"
          value={state.toelichting ?? ""}
          onChange={(e) =>
            update({
              toelichting: e.target.value || undefined,
            })
          }
          placeholder="Bijvoorbeeld: exclusief keuken, inclusief installaties, reservering voor meerwerk..."
        />
      </div>
    </div>
  );
}
