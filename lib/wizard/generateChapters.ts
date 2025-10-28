// 📄 Bestand: lib/wizard/generateChapters.ts

import { ChapterKey } from "@/types/wizard";
import { Archetype } from "@/types/archetype";

export function generateChapters(archetype: Archetype): ChapterKey[] {
  const base: ChapterKey[] = ["basis", "ruimtes", "wensen"];

  const map: Record<Archetype, ChapterKey[]> = {
    nieuwbouw_woning: ["budget", "techniek", "duurzaamheid", "risico", "preview"],
    complete_renovatie: ["budget", "techniek", "risico", "preview"],
    bijgebouw: ["budget", "risico", "preview"],
    aanbouw: ["budget", "techniek", "preview"],
    verbouwing_zolder: ["budget", "risico", "preview"],
    hybride_project: ["budget", "techniek", "duurzaamheid", "risico", "preview"],
    anders: ["preview"]
  };

  const extra = map[archetype] || [];
  return [...base, ...extra];
}
