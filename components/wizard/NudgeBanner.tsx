// components/wizard/NudgeBanner.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { groupMissingByChapter, nextMissing, MissingItem } from "@/lib/ai/missing";
import { useWizardState } from "@/lib/stores/useWizardState";
import { useUiStore } from "@/lib/stores/useUiStore";
import { logEvent } from "@/lib/logging/logEvent";

/**
 * NudgeBanner toont boven het Canvas welke essentiële velden nog ontbreken
 * (globaal en/of per huidig hoofdstuk) en biedt directe knoppen om te focussen.
 *
 * - Werkt samen met Spotlight (setFocusedField)
 * - Past taal "u/uw" toe
 * - Logt nudge-clicks
 */

export default function NudgeBanner() {
  const wizardState = useWizardState();
  const currentChapter = useUiStore(s => s.currentChapter);
  const setFocusedField = useUiStore(s => s.setFocusedField);

  const grouped = useMemo(() => groupMissingByChapter(wizardState), [wizardState]);
  const next = useMemo(() => nextMissing(wizardState, currentChapter), [wizardState, currentChapter]);

  const [collapsed, setCollapsed] = useState(false);

  // Automatisch tonen als er iets essentieels mist in het huidige hoofdstuk of globaal
  useEffect(() => {
    if (!next) return;
    setCollapsed(false);
  }, [next]);

  if (!next) return null;

  const totalMissing = Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0);
  const currentList: MissingItem[] = currentChapter ? (grouped[currentChapter] ?? []) : [];

  function goTo(item: MissingItem) {
    setFocusedField({ chapter: item.chapter, fieldId: item.fieldId });
    logEvent("nudge.goto_field", { chapter: item.chapter, fieldId: item.fieldId, source: "nudge_banner" });
  }

  return (
    <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-amber-900">
            Er ontbreken nog {totalMissing} essentieel{totalMissing > 1 ? "e" : ""} onderdeel{totalMissing > 1 ? "en" : ""}.
          </p>
          {!collapsed && (
            <>
              {currentList.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-amber-900/80 mb-1">
                    In dit hoofdstuk ({currentChapter}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {currentList.map((m) => (
                      <button
                        key={`${m.chapter}:${m.fieldId}`}
                        onClick={() => goTo(m)}
                        className="text-xs rounded-full border border-amber-300 bg-white px-2 py-1 hover:bg-amber-100"
                      >
                        Ga naar {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Toon óók een “Volgende beste” voor snelle voortgang */}
              <div className="mt-2">
                <p className="text-xs text-amber-900/80 mb-1">Volgende beste stap:</p>
                <button
                  onClick={() => goTo(next)}
                  className="text-xs rounded-md bg-[#0d3d4d] text-white px-2 py-1 hover:opacity-95"
                >
                  Ga naar {next.label}
                </button>
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-xs text-amber-900 underline underline-offset-2"
        >
          {collapsed ? "Uitklappen" : "Inklappen"}
        </button>
      </div>
    </div>
  );
}
