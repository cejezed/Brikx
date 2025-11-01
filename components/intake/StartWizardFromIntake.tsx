'use client';

import IntakeForm from './IntakeForm';

/**
 * Dumb wrapper:
 * - geen store- of type-imports
 * - alle logica (store lezen, validatie, generateChapters, setChapter, router.push)
 *   leeft in IntakeForm, conform Build v2.0 (Pijler 1–4).
 */
export default function StartWizardFromIntake() {
  return <IntakeForm />;
}