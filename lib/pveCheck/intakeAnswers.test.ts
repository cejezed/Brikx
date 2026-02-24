import { describe, expect, it } from "vitest";
import type { PveCheckIntakeData } from "@/types/pveCheck";
import {
  deriveQuickAnswersFromIntake,
  filterUnansweredQuickFillQuestions,
  normalizeBudgetAnswer,
} from "@/lib/pveCheck/intakeAnswers";

function makeIntake(overrides: Partial<PveCheckIntakeData> = {}): PveCheckIntakeData {
  return {
    archetype: "Jaren 30 woning",
    projectType: "verbouwing",
    locatie: "Utrecht",
    budgetRange: "100k-250k" as PveCheckIntakeData["budgetRange"],
    bouwjaar: "1932",
    duurzaamheidsAmbitie: "normaal",
    analyseDoel: "architect",
    ...overrides,
  };
}

describe("deriveQuickAnswersFromIntake", () => {
  it("maps projecttype, budget and bouwjaar from intake", () => {
    const intake = makeIntake({
      projectType: "hybride",
      bouwjaar: "1978",
    });
    const answers = deriveQuickAnswersFromIntake(intake);

    expect(answers["basis.projectType"]).toBe("hybride");
    expect(answers["budget.budgetTotaal"]).toBe("100k-250k");
    expect(answers["basis.bouwjaar"]).toBe("1978");
  });

  it("does not set bouwjaar answer when bouwjaar is empty", () => {
    const intake = makeIntake({ bouwjaar: "   " });
    const answers = deriveQuickAnswersFromIntake(intake);

    expect(answers["basis.projectType"]).toBe("verbouwing");
    expect(answers["budget.budgetTotaal"]).toBe("100k-250k");
    expect(answers["basis.bouwjaar"]).toBeUndefined();
  });
});

describe("filterUnansweredQuickFillQuestions", () => {
  it("hides questions that are already answered in intake quickAnswers", () => {
    const questions = [
      { fieldId: "basis.projectType" },
      { fieldId: "basis.bouwjaar" },
      { fieldId: "budget.budgetTotaal" },
      { fieldId: "techniek.verwarming" },
    ];

    const filtered = filterUnansweredQuickFillQuestions(questions, {
      "basis.projectType": "verbouwing",
      "basis.bouwjaar": "1932",
      "budget.budgetTotaal": "100k-250k",
    });

    expect(filtered).toEqual([{ fieldId: "techniek.verwarming" }]);
  });
});

describe("normalizeBudgetAnswer", () => {
  it("converts budget ranges to numeric midpoint values", () => {
    expect(normalizeBudgetAnswer("100k-250k")).toBe(175000);
    expect(normalizeBudgetAnswer("500k-1M")).toBe(750000);
  });
});

