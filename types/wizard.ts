// types/wizard.ts
/**
 * 🧱 CENTRALIZED WIZARD TYPES
 * Single source of truth for all wizard-related types
 */

// ============================================================
// CHAPTER TYPES
// ============================================================

export type ChapterKey =
  | 'basis'
  | 'wensen'
  | 'budget'
  | 'ruimtes'
  | 'techniek'
  | 'duurzaamheid'
  | 'risico'
  | 'preview';

export type ProjectType =
  | 'interieur'
  | 'verbouwing_binnen'
  | 'uitbouw'
  | 'nieuwbouw'
  | 'bijgebouw'
  | 'renovatie';

export type ProjectSize = 'klein' | 'middel' | 'groot';
export type Urgency = 'laag' | 'middel' | 'hoog';
export type BudgetCategory = 'unknown' | 'lt100k' | '100-250k' | '250-500k' | 'gt500k';
export type Mode = 'PREVIEW' | 'PREMIUM';

export type StijlVoorkeur =
  | 'modern'
  | 'landelijk'
  | 'industrieel'
  | 'scandinavisch'
  | 'klassiek'
  | 'onbekend';

export type Document = 'fotos' | 'bouwtekeningen' | 'ontwerp' | 'geen';

export type HulpVraag =
  | 'pve_maken'
  | 'architect'
  | 'aannemer'
  | 'interieur'
  | 'kosten'
  | 'oriënteren';

// ============================================================
// TRIAGE DATA (Intake Result)
// ============================================================

export interface TriageData {
  projectType: ProjectType[];
  projectSize: ProjectSize;
  urgency: Urgency;
  budget?: BudgetCategory;
  budgetCustom?: number;
  stijlvoorkeur?: StijlVoorkeur[];
  moodboardUrl?: string;
  bestaandeDocumenten?: Document[];
  hulpvraag?: HulpVraag[];
  createdAt?: Date;
  updatedAt?: Date;
  tempId?: string;
}

// ============================================================
// CHAPTER ANSWERS (Form Data Per Chapter)
// ============================================================

export interface ChapterAnswers {
  basis: BasisAnswers;
  wensen: WensenAnswers;
  ruimtes: RuimteAnswer[];
  budget: BudgetAnswers;
  techniek: TechniekaAnswers;
  duurzaamheid: DuurzaamheidAnswers;
  risico: RiscoAnswers;
}

export interface BasisAnswers {
  projectNaam?: string;
  locatie?: string;
  beschrijving?: string;
  oppervlakte?: number;
  adres?: string;
  postcode?: string;
  plaats?: string;
}

export interface WensenAnswers {
  topWensen?: string[];
  doelFunctie?: string;
  prioriteiten?: string;
  inspiratie?: string;
  aandachtsPunten?: string;
}

export interface RuimteAnswer {
  id: string;
  naam: string;
  oppervlakte?: number;
  wensen?: string[];
  huidigeStatus?: string;
  opmerkingen?: string;
}

export interface BudgetAnswers {
  bedrag?: number;
  fasering?: string;
  prioriteitsBudget?: string;
  reserves?: number;
  financieringswijze?: string;
}

export interface TechniekaAnswers {
  bouwkundige?: string;
  cv?: string;
  elektriciteit?: string;
  sanitair?: string;
  dak?: string;
  gevel?: string;
  isolatie?: string;
  ramen?: string;
  andere?: string;
}

export interface DuurzaamheidAnswers {
  isolatie?: string;
  verwarming?: string;
  energie?: string;
  waterbesparing?: string;
  materialen?: string;
  bcng?: string;
}

export interface RiscoAnswers {
  mogelijkeRisicos?: RiscoItem[];
  aanwezigeGebreken?: string;
  vergunningen?: string;
  burenBetrokkenheid?: string;
  tijdsdruk?: string;
}

export interface RiscoItem {
  category: 'structural' | 'permits' | 'time' | 'budget' | 'neighbour' | 'tech' | 'other';
  omschrijving: string;
  ernst: 'laag' | 'middel' | 'hoog';
  oplossing?: string;
}

// ============================================================
// WIZARD STATE (Full state tree)
// ============================================================

export interface WizardState {
  triage: TriageData;
  chapterAnswers: ChapterAnswers;
  currentChapter: ChapterKey;
  completedChapters: ChapterKey[];
  chapterFlow?: string[];
  mode: Mode;
  chapters: ChapterKey[];
  tempId: string;
  savedAt?: Date;
  isDraft: boolean;
}

// ============================================================
// UI STATE (Separate from content)
// ============================================================

export interface UIState {
  focusedField?: {
    chapter: ChapterKey;
    fieldId: string;
  };
  isLoading: boolean;
  errors: Record<string, string>;
  successMessage?: string;
}

// ============================================================
// CHAPTER GENERATION RESULT
// ============================================================

export interface GenerateChaptersResult {
  chapters: ChapterKey[];
  mode: Mode;
  reasoning: string;
}

// ============================================================
// EXPORT/PVE RESULT
// ============================================================

export interface PVEExportData {
  mode: 'PREVIEW' | 'PREMIUM';
  projectInfo: BasisAnswers;
  wensen: WensenAnswers;
  budget: BudgetAnswers;
  techniek?: TechniekaAnswers;
  duurzaamheid?: DuurzaamheidAnswers;
  risicos?: RiscoAnswers;
  ruimtes?: RuimteAnswer[];
  timestamp: Date;
  tempId: string;
  watermark: string;
}

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

export interface ValidationRule {
  field: string;
  chapter: ChapterKey;
  required: boolean;
  validate: (value: any) => boolean | string;
}

// ============================================================
// HELPER TYPES
// ============================================================

export type PartialTriageData = Partial<TriageData>;
export type PartialChapterAnswers = Partial<ChapterAnswers>;
export type PartialBasisAnswers = Partial<BasisAnswers>;