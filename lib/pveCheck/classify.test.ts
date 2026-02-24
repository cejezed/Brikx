import { describe, expect, it } from "vitest";
import type { PveCheckIntakeData } from "@/types/pveCheck";
import { buildNudge } from "@/lib/pveCheck/classify";

function makeIntake(overrides: Partial<PveCheckIntakeData> = {}): PveCheckIntakeData {
  return {
    archetype: "Gezinswoning",
    projectType: "nieuwbouw",
    locatie: "Almere",
    budgetRange: "250k-500k" as PveCheckIntakeData["budgetRange"],
    duurzaamheidsAmbitie: "ambitieus",
    analyseDoel: "architect",
    ...overrides,
  };
}

describe("buildNudge", () => {
  it("includes analyseDoel in the analysis context", () => {
    const nudge = buildNudge(makeIntake({ analyseDoel: "aannemer" }));
    expect(nudge).toContain("Doel: aannemer");
  });

  it("falls back to architect when analyseDoel is missing", () => {
    const intake = makeIntake();
    delete intake.analyseDoel;

    const nudge = buildNudge(intake);
    expect(nudge).toContain("Doel: architect");
  });
});

