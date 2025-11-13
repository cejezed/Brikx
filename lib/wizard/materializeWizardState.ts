import type { WizardState, ChapterDataMap, ChapterKey } from "@/types/project";

/** Zorgt dat alle verplichte velden bestaan (met veilige defaults). */
export function materializeWizardState(ws: Partial<WizardState>): WizardState {
  return {
    // verplichte velden
    stateVersion: ws.stateVersion ?? 1,
    chapterAnswers: (ws.chapterAnswers ?? {}) as Partial<ChapterDataMap>,
    chapterFlow: (ws.chapterFlow ?? []) as ChapterKey[],

    // optionele velden – alleen doorgeven als ze bestaan in jouw type
    currentChapter: ws.currentChapter,
    focusedField: ws.focusedField ?? null,
    showExportModal: ws.showExportModal ?? false,

    // Als jouw WizardState wél een 'mode' kent:
    // mode: (ws as any).mode ?? "PREVIEW",
  } as WizardState;
}
