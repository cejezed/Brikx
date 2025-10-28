import { Archetype } from "./archetype";

export type ProjectType = "nieuwbouw" | "verbouwing" | "hybride";
export type Ervaring = "starter" | "ervaren";
export type Intentie = "architect_start" | "contractor_quote" | "scenario_exploration";
export type Urgentie = "laag" | "normaal" | "dringend";

export interface TriageData {
  projectType: ProjectType;
  ervaring: Ervaring;
  intent: Intentie;
  budget: number;
  urgentie: Urgentie;
  extra?: string;
}

export type ChapterKey =
  | "basis"
  | "ruimtes"
  | "wensen"
  | "budget"
  | "techniek"
  | "duurzaamheid"
  | "risico"
  | "preview";

export interface WizardState {
  triage: TriageData;
  archetype: Archetype | null; // initieel null -> progressive disclosure
  chapterFlow: ChapterKey[];
  currentChapter: ChapterKey;
  chapterAnswers: Record<string, any>;
  completedChapters: ChapterKey[];
  startedAt: number;
  tier: "free" | "premium";
  mode: "preview" | "edit";

  setTriage: (t: TriageData) => void;
  setArchetype: (a: Archetype) => void;
  setMode: (m: "preview" | "edit") => void;
  setChapterAnswer: (key: ChapterKey, value: any) => void;
  goToChapter: (key: ChapterKey) => void;
  startWizard: () => void;
}
