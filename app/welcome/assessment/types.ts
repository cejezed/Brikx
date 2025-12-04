// app/welcome/assessment/types.ts
// Type definitions for Brikx intake/assessment flow

export interface IntakeFormData {
  // Step 1: Project Context
  projectType: 'nieuwbouw' | 'verbouwing' | 'bijgebouw' | 'hybride' | 'anders' | null;
  locatie: string;
  locatieOnbekend: boolean;
  sqMeters: number;

  // Step 2: Planning & Ervaring
  urgency: '<3mnd' | '3-6mnd' | '6-12mnd' | '>12mnd' | 'onzeker' | null;
  ervaring: 'starter' | 'enigszins' | 'ervaren' | null;
  projectNaam: string;

  // Step 3: Budget
  budgetRange: '€100k - €250k' | '€250k - €500k' | '€500k - €1M' | '€1M+' | null;
  budgetOpmerking: string;

  // Step 4: Stijl & Toelichting
  designStyles: string[];
  designStyleAnders: string; // Free text when "Anders" selected
  vrijeToelichting: string;

  // Step 5: Doel PvE & Extra
  pveDoelen: string[];
  pveAndersDoel: string; // Free text when "Anders" selected in PvE doelen
  extraWensen: string;
}

export const DESIGN_STYLES = [
  'Scandinavisch',
  'Minimalistisch',
  'Industrieel',
  'Modern',
  'Klassiek',
  'Landelijk',
  'Anders',
] as const;

export const PVE_DOELEN = [
  'Voorbereiding voor architect',
  'Voorbereiding voor aannemer',
  'Oriëntatie / budget-inschatting',
  'Vergunningstraject voorbereiden',
  'Advies van expert/adviseur',
  'Planning & scope bepalen',
  'Anders',
] as const;

export const PROJECT_TYPES = [
  { value: 'nieuwbouw', label: 'Nieuwbouw', icon: '🏗️' },
  { value: 'verbouwing', label: 'Verbouwing', icon: '🔨' },
  { value: 'bijgebouw', label: 'Bijgebouw', icon: '🏚️' },
  { value: 'hybride', label: 'Hybride', icon: '🏘️' },
  { value: 'anders', label: 'Anders', icon: '📐' },
] as const;

export const URGENCY_OPTIONS = [
  { value: '<3mnd', label: 'Binnen 3 maanden' },
  { value: '3-6mnd', label: '3-6 maanden' },
  { value: '6-12mnd', label: '6-12 maanden' },
  { value: '>12mnd', label: 'Meer dan 12 maanden' },
  { value: 'onzeker', label: 'Nog onzeker' },
] as const;

export const ERVARING_OPTIONS = [
  { value: 'starter', label: 'Starter', description: 'Mijn eerste bouwproject' },
  { value: 'enigszins', label: 'Enigszins ervaren', description: 'Eerder betrokken geweest bij een project' },
  { value: 'ervaren', label: 'Ervaren', description: 'Meerdere projecten gedaan' },
] as const;

export const BUDGET_RANGES = [
  '€100k - €250k',
  '€250k - €500k',
  '€500k - €1M',
  '€1M+',
] as const;

export function getInitialFormData(): IntakeFormData {
  return {
    projectType: null,
    locatie: '',
    locatieOnbekend: false,
    sqMeters: 150,
    urgency: null,
    ervaring: null,
    projectNaam: '',
    budgetRange: null,
    budgetOpmerking: '',
    designStyles: [],
    designStyleAnders: '',
    vrijeToelichting: '',
    pveDoelen: [],
    pveAndersDoel: '',
    extraWensen: '',
  };
}
