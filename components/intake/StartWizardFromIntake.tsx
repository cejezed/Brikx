// /components/intake/StartWizardFromIntake.tsx

"use client";

import IntakeForm from "./IntakeForm";

/**
 * StartWizardFromIntake
 *
 * Bewust "dom" component:
 * - Alle logica voor triage, generateChapters, setChapterFlow, goToChapter, enz.
 *   leeft in IntakeForm (of daaronder), conform Build v2.0 (AI-First Triage).
 * - Dit voorkomt dubbele bronnen van waarheid en SSR/hydration-issues.
 */
export default function StartWizardFromIntake() {
  return <IntakeForm />;
}
