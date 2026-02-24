import type { PveCheckIntakeData } from "@/types/pveCheck";

export function deriveQuickAnswersFromIntake(
  intake: PveCheckIntakeData,
): Record<string, string> {
  const inferred: Record<string, string> = {
    "basis.projectType": intake.projectType,
    "budget.budgetTotaal": intake.budgetRange,
  };

  const bouwjaar = intake.bouwjaar?.trim();
  if (bouwjaar) {
    inferred["basis.bouwjaar"] = bouwjaar;
  }

  return inferred;
}

export function normalizeBudgetAnswer(rawValue: string): number | string {
  const compact = rawValue.toLowerCase().replace(/[^0-9kmg<>-]/g, "");
  const byRange: Record<string, number> = {
    "<100k": 100000,
    "100k-250k": 175000,
    "250k-500k": 375000,
    "500k-1m": 750000,
    "500k-1000k": 750000,
    ">1m": 1000000,
  };

  const mappedRange = byRange[compact];
  if (typeof mappedRange === "number") {
    return mappedRange;
  }

  const directNumber = rawValue.replace(/[^\d]/g, "");
  if (directNumber.length > 0) {
    const parsed = Number(directNumber);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return rawValue;
}

export function normalizeClassifyValue(fieldId: string, rawValue: string): unknown {
  if (fieldId === "budget.budgetTotaal") {
    return normalizeBudgetAnswer(rawValue);
  }
  return rawValue;
}

export function filterUnansweredQuickFillQuestions<T extends { fieldId: string }>(
  questions: T[],
  storedAnswers?: Record<string, string>,
): T[] {
  return questions.filter(
    (question) => (storedAnswers?.[question.fieldId] ?? "").trim().length === 0,
  );
}

