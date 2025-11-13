// /types/archetype.ts
// BRON: BRIKX_BUILD_MANIFEST_v3_0_LOCKED_FINAL.md
// STATUS: FINAL LOCKED

export type Archetype =
  | "nieuwbouw_woning"
  | "nieuwbouw_bijgebouw" // 💡 Gebruikerseis toegevoegd
  | "aanbouw"
  | "bijgebouw" // (Voor bestaand bijgebouw)
  | "complete_renovatie"
  | "verbouwing_zolder"
  | "hybride_project"
  | "anders";

export const archetypeLabels: Record<Archetype, string> = {
  nieuwbouw_woning:   "Een complete nieuwbouwwoning",
  nieuwbouw_bijgebouw: "Een nieuw te bouwen bijgebouw",
  aanbouw:            "Een aanbouw of uitbouw",
  bijgebouw:          "Een bestaand bijgebouw (aanpassen)",
  complete_renovatie: "Een grote renovatie",
  verbouwing_zolder:  "Een interne verbouwing (zolder of badkamer)",
  hybride_project:    "Meerdere onderdelen combineren",
  anders:             "Iets anders (zoals kozijnen vervangen)"
};