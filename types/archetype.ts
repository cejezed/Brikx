export type Archetype =
  | "nieuwbouw_woning"
  | "aanbouw"
  | "bijgebouw"
  | "complete_renovatie"
  | "verbouwing_zolder"
  | "hybride_project"
  | "anders";

export const archetypeLabels: Record<Archetype, string> = {
  nieuwbouw_woning:   "Een complete nieuwbouwwoning",
  aanbouw:            "Een aanbouw of uitbouw",
  bijgebouw:          "Een bijgebouw of tuinkantoor",
  complete_renovatie: "Een grote renovatie",
  verbouwing_zolder:  "Een interne verbouwing (zolder of badkamer)",
  hybride_project:    "Meerdere onderdelen combineren",
  anders:             "Iets anders (zoals kozijnen vervangen)"
};
