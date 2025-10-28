// config/chapters.ts
// Centrale hoofdstukmapping — Intake weer als stap 1

import IntakeForm from "@/components/intake/IntakeForm";       // ← jouw bestaande, volledige intake
import ChapterBasis from "@/components/chapters/Basis";
import ChapterRuimtes from "@/components/chapters/Ruimtes";
import ChapterWensen from "@/components/chapters/Wensen";
import ChapterBudget from "@/components/chapters/Budget";
import ChapterTechniek from "@/components/chapters/Techniek";
import ChapterDuurzaamheid from "@/components/chapters/Duurzaamheid";
import ChapterRisico from "@/components/chapters/Risico";
import PvEPreview from "@/components/chapters/Preview";

export function generateChapters(_state?: any) {
  return [
    // 🔵 Intake eerst — hiermee komt jouw volledige Archetype/Intake terug
    { key: "intake", title: "Intake", Component: IntakeForm },

    // daarna de reguliere hoofdstukken
    { key: "basis", title: "Basis", Component: ChapterBasis },
    { key: "ruimtes", title: "Ruimtes", Component: ChapterRuimtes },
    { key: "wensen", title: "Wensen", Component: ChapterWensen },
    { key: "budget", title: "Budget", Component: ChapterBudget },
    { key: "techniek", title: "Techniek", Component: ChapterTechniek },
    { key: "duurzaamheid", title: "Duurzaamheid", Component: ChapterDuurzaamheid },
    { key: "risico", title: "Risico", Component: ChapterRisico },
    { key: "preview", title: "Preview", Component: PvEPreview },
  ];
}
