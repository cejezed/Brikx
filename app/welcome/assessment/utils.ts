import type { BasisData } from '@/types/project';
import type { IntakeFormData } from './types';

/**
 * Convert square meters to projectSize range
 */
export function sqMetersToProjectSize(m2: number): BasisData['projectSize'] {
  if (m2 <= 75) return '<75m2';
  if (m2 <= 150) return '75-150m2';
  if (m2 <= 250) return '150-250m2';
  return '>250m2';
}

/**
 * Convert budget range string to number (midpoint)
 */
export function budgetRangeToNumber(range: string): number {
  const ranges: Record<string, [number, number]> = {
    '€100k - €250k': [100000, 250000],
    '€250k - €500k': [250000, 500000],
    '€500k - €1M': [500000, 1000000],
    '€1M+': [1000000, 2000000], // upper bound for midpoint calculation
  };
  const [low, high] = ranges[range] || [0, 0];
  return Math.round((low + high) / 2);
}

/**
 * Build toelichting field by concatenating all relevant parts
 */
export function buildToelichting(parts: {
  designStyles?: string[];
  designStyleAnders?: string;
  vrijeToelichting?: string;
  budgetOpmerking?: string;
  pveDoelen?: string[];
  pveAndersDoel?: string;
  extraWensen?: string;
}): string {
  const segments: string[] = [];

  // Design styles
  if (parts.designStyles && parts.designStyles.length > 0) {
    const styles = [...parts.designStyles];
    if (parts.designStyleAnders) {
      styles.push(parts.designStyleAnders);
    }
    segments.push(`Voorkeursstijl: ${styles.join(', ')}`);
  }

  // PvE doelen
  if (parts.pveDoelen && parts.pveDoelen.length > 0) {
    const doelen = [...parts.pveDoelen];
    if (parts.pveAndersDoel) {
      doelen.push(parts.pveAndersDoel);
    }
    segments.push(`Doel PvE: ${doelen.join(', ')}`);
  }

  // Budget opmerking
  if (parts.budgetOpmerking?.trim()) {
    segments.push(parts.budgetOpmerking.trim());
  }

  // Vrije toelichting
  if (parts.vrijeToelichting?.trim()) {
    segments.push(parts.vrijeToelichting.trim());
  }

  // Extra wensen
  if (parts.extraWensen?.trim()) {
    segments.push(parts.extraWensen.trim());
  }

  return segments.join('\n\n');
}

/**
 * Map IntakeFormData to BasisData
 */
export function mapIntakeToBasisData(intakeData: IntakeFormData): BasisData {
  return {
    projectType: intakeData.projectType!,
    projectNaam: intakeData.projectNaam,
    locatie: intakeData.locatieOnbekend ? undefined : intakeData.locatie,
    projectSize: sqMetersToProjectSize(intakeData.sqMeters),
    urgency: intakeData.urgency!,
    ervaring: intakeData.ervaring || undefined,
    budget: budgetRangeToNumber(intakeData.budgetRange!),
    toelichting: buildToelichting({
      designStyles: intakeData.designStyles,
      designStyleAnders: intakeData.designStyleAnders,
      vrijeToelichting: intakeData.vrijeToelichting,
      budgetOpmerking: intakeData.budgetOpmerking,
      pveDoelen: intakeData.pveDoelen,
      pveAndersDoel: intakeData.pveAndersDoel,
      extraWensen: intakeData.extraWensen,
    }),
  };
}

/**
 * Validation helpers per step
 */
export function isStep1Valid(data: IntakeFormData): boolean {
  return (
    data.projectType !== null &&
    (data.locatieOnbekend || data.locatie.trim().length > 0) &&
    data.sqMeters > 0 &&
    data.budgetRange !== null
  );
}

export function isStep2Valid(data: IntakeFormData): boolean {
  return (
    data.urgency !== null &&
    data.ervaring !== null
  );
}

export function isStep3Valid(data: IntakeFormData): boolean {
  // All fields optional in step 3
  return true;
}

/**
 * Check if can proceed from current step
 */
export function canProceed(currentStep: number, data: IntakeFormData): boolean {
  switch (currentStep) {
    case 1:
      return isStep1Valid(data);
    case 2:
      return isStep2Valid(data);
    case 3:
      return isStep3Valid(data);
    default:
      return false;
  }
}

/**
 * LocalStorage persistence
 */
const STORAGE_KEY = 'brikx-intake-draft';

export function saveIntakeDraft(data: IntakeFormData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save intake draft:', err);
  }
}

export function loadIntakeDraft(): IntakeFormData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('Failed to load intake draft:', err);
  }
  return null;
}

export function clearIntakeDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear intake draft:', err);
  }
}
