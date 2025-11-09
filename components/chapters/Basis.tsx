"use client";

import React, { useEffect, useMemo } from "react";
import useWizardState from "@/lib/stores/useWizardState";
import FocusTarget from "@/components/wizard/FocusTarget";
import { useUiStore } from "@/lib/stores/useUiStore";

type BasisAnswers = {
  projectNaam?: string;
  locatie?: string;
  oppervlakteM2?: number | "";
  bewonersAantal?: number | "";
  startMaand?: string;
  budgetIndicatie?: number | null;
  toelichting?: string;
};

export default function ChapterBasis() {
  const chapterAnswers = useWizardState(
    (s: any) => s.chapterAnswers
  ) as Record<string, any>;
  const patchChapterAnswer = useWizardState(
    (s: any) => s.patchChapterAnswer
  );
  const triage = useWizardState((s: any) => s.triage);
  const { setCurrentChapter } = useUiStore();

  useEffect(() => {
    setCurrentChapter?.("basis");
  }, [setCurrentChapter]);

  const basis: BasisAnswers = useMemo(
    () => ({ ...(chapterAnswers?.basis ?? {}) }),
    [chapterAnswers?.basis]
  );

  function update<K extends keyof BasisAnswers>(key: K, value: BasisAnswers[K]) {
    patchChapterAnswer?.("basis", { [key]: value });
  }

  function updateBudget(val: number | null) {
    patchChapterAnswer?.("basis", { budgetIndicatie: val });
    // sync naar Budget-hoofdstuk met sleutel totaalBudget
    patchChapterAnswer?.("budget", {
      totaalBudget: val ?? undefined,
    });
  }

  const budgetFromStore = useMemo(
    () => chapterAnswers?.budget?.totaalBudget ?? null,
    [chapterAnswers?.budget?.totaalBudget]
  );

  const projectTypeLabel = useMemo(() => {
    const map: Record<string, string> = {
      nieuwbouw: "Nieuwbouw",
      verbouwing: "Verbouwing",
      hybride: "Hybride / combinatie",
      nieuwbouw_woning: "Nieuwbouw",
      complete_renovatie: "Renovatie",
      bijgebouw: "Bijgebouw",
      verbouwing_zolder: "Zolderverbouwing",
      hybride_project: "Hybride",
    };
    const raw =
      (triage as any)?.projectType ??
      (triage as any)?.project_type ??
      (triage as any)?.archetype;
    return map[String(raw)] ?? "—";
  }, [triage]);

  return (
    <section className="space-y-6 max-w-3xl">
      <FocusTarget chapter="basis" fieldId="__chapterTop">
        <div />
      </FocusTarget>

      <div className="rounded-xl border border-neutral-200 p-4 bg-neutral-50">
        <p className="text-sm text-neutral-700">
          <span className="font-medium">Intake-overzicht:</span> Projecttype{" "}
          <span className="font-medium">{projectTypeLabel}</span>, Budget{" "}
          <span className="font-medium">
            €
            {Number(
              budgetFromStore ??
                basis?.budgetIndicatie ??
                (triage as any)?.budget ??
                0
            ).toLocaleString("nl-NL")}
          </span>
          .
        </p>
        <p className="text-xs text-neutral-500 mt-1">
          Aanpassen kan altijd in de betreffende hoofdstukken.
        </p>
      </div>

      {/* Projectnaam */}
      <FocusTarget chapter="basis" fieldId="projectNaam">
        <label className="block">
          <span className="block text-sm font-medium mb-1">
            Projectnaam
          </span>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={basis.projectNaam ?? ""}
            onChange={(e) => update("projectNaam", e.target.value)}
            placeholder="Bijv. Renovatie woning Van Dijk"
          />
        </label>
      </FocusTarget>

      {/* Locatie */}
      <FocusTarget chapter="basis" fieldId="locatie">
        <label className="block">
          <span className="block text-sm font-medium mb-1">
            Locatie / adres
          </span>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={basis.locatie ?? ""}
            onChange={(e) => update("locatie", e.target.value)}
            placeholder="Straat + plaats (optioneel)"
          />
        </label>
      </FocusTarget>

      {/* Oppervlakte + bewoners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FocusTarget chapter="basis" fieldId="oppervlakteM2">
          <label className="block">
            <span className="block text-sm font-medium mb-1">
              Oppervlakte (m², indicatie)
            </span>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full border rounded px-3 py-2 text-sm"
              value={basis.oppervlakteM2 ?? ""}
              onChange={(e) =>
                update(
                  "oppervlakteM2",
                  e.target.value === ""
                    ? ""
                    : Number(e.target.value.replace(/\D+/g, ""))
                )
              }
              placeholder="bijv. 120"
            />
          </label>
        </FocusTarget>

        <FocusTarget chapter="basis" fieldId="bewonersAantal">
          <label className="block">
            <span className="block text-sm font-medium mb-1">
              Aantal bewoners (indicatie)
            </span>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full border rounded px-3 py-2 text-sm"
              value={basis.bewonersAantal ?? ""}
              onChange={(e) =>
                update(
                  "bewonersAantal",
                  e.target.value === ""
                    ? ""
                    : Number(e.target.value.replace(/\D+/g, ""))
                )
              }
              placeholder="bijv. 4"
            />
          </label>
        </FocusTarget>
      </div>

      {/* Start + Budget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FocusTarget chapter="basis" fieldId="startMaand">
          <label className="block">
            <span className="block text-sm font-medium mb-1">
              Gewenste start (maand)
            </span>
            <input
              type="month"
              className="w-full border rounded px-3 py-2 text-sm"
              value={basis.startMaand ?? ""}
              onChange={(e) => update("startMaand", e.target.value)}
            />
          </label>
        </FocusTarget>

        <FocusTarget chapter="basis" fieldId="budgetIndicatie">
          <label className="block">
            <span className="block text-sm font-medium mb-1">
              Budget (indicatie)
            </span>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full border rounded px-3 py-2 text-sm"
              value={budgetFromStore ?? ""}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D+/g, "");
                updateBudget(raw === "" ? null : Number(raw));
              }}
              placeholder="bijv. 250000"
            />
            <span className="block text-xs text-neutral-500 mt-1">
              Gesynchroniseerd met het hoofdstuk Budget.
            </span>
          </label>
        </FocusTarget>
      </div>

      {/* Toelichting */}
      <FocusTarget chapter="basis" fieldId="toelichting">
        <label className="block">
          <span className="block text-sm font-medium mb-1">
            Korte toelichting
          </span>
          <textarea
            className="w-full border rounded px-3 py-2 min-h-24 text-sm"
            value={basis.toelichting ?? ""}
            onChange={(e) => update("toelichting", e.target.value)}
            placeholder="Beschrijf kort wat u wilt bereiken…"
          />
        </label>
      </FocusTarget>
    </section>
  );
}
