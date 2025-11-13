// /config/chapters.ts
// ✅ v3.0 Conform: Mapt *alleen* de 7 data-hoofdstukken
// zoals gedefinieerd in de ChapterDataMap (de 'Grondwet').

import type { ChapterKey } from "@/types/project";
import type { ComponentType } from "react";

// Importeer de 7 chapter-componenten
import ChapterBasis from "@/components/chapters/Basis";
import ChapterRuimtes from "@/components/chapters/Ruimtes";
import ChapterWensen from "@/components/chapters/Wensen";
import ChapterBudget from "@/components/chapters/Budget";
import ChapterTechniek from "@/components/chapters/Techniek";
import ChapterDuurzaam from "@/components/chapters/Duurzaamheid"; 
import ChapterRisico from "@/components/chapters/Risico";

export type ChapterConfig = {
  key: ChapterKey;
  title: string;
  Component: ComponentType<any>; // Type voor React component
};

/**
 * Genereert de 7 kernhoofdstukken voor de wizard.
 * * NOTA: 'Intake' en 'Preview' zijn in v3.0 aparte UI-states/routes
 * en horen niet in de data-hoofdstuk-flow thuis.
 */
export function generateChapters(_state?: any): ChapterConfig[] {
  return [
    { key: "basis", title: "Basis", Component: ChapterBasis },
    { key: "ruimtes", title: "Ruimtes", Component: ChapterRuimtes },
    { key: "wensen", title: "Wensen", Component: ChapterWensen },
    { key: "budget", title: "Budget", Component: ChapterBudget },
    { key: "techniek", title: "Techniek", Component: ChapterTechniek },
    { key: "duurzaam", title: "Duurzaam", Component: ChapterDuurzaam },
    { key: "risico", title: "Risico's", Component: ChapterRisico },
  ];
}