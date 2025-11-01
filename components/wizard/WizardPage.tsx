// 📄 Bestand: components/wizard/WizardPage.tsx

"use client";

import { useUiStore } from "@/lib/stores/useUiStore";
import IntakeForm from "@/components/intake/IntakeForm";
import StartWizardButton from "@/components/intake/StartWizardFromIntake";
import ChapterRuimtes from "@/components/chapters/Ruimtes";

export default function WizardPage() {
  // ✅ Use useUiStore for currentChapter
  const current = useUiStore((s) => s.currentChapter);

  if (current === "ruimtes") return <ChapterRuimtes />;

  return (
    <main className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Brikx Intake</h1>
      <IntakeForm />
      <StartWizardButton />
    </main>
  );
}