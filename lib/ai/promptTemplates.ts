// lib/ai/promptTemplates.ts

type BuildPromptIn = {
  mode?: "preview" | "premium";
  project_type?: string | null;
  project_size?: string | number | null;
  wizardState?: any;
  missing_fields?: string[];
};

export function buildPrompt(input: BuildPromptIn) {
  const {
    mode = "preview",
    project_type,
    project_size,
    wizardState,
    missing_fields = [],
  } = input ?? {};

  const triage = wizardState?.triage ?? {};
  const wensen = wizardState?.chapterAnswers?.wensen ?? [];

  const sysBase = [
    "Je bent Jules, een behulpzame architect-assistent.",
    "Antwoorden in het Nederlands, kort en to-the-point.",
    "Lieg niet; als je iets niet zeker weet, geef aan wat de gebruiker kan doen (bv. gemeente/architect raadplegen).",
  ].join(" ");

  const sysMode =
    mode === "premium"
      ? "Premium-modus: je mag richtwaarden, regelgeving en technische details noemen, maar voeg een korte disclaimer toe."
      : "Preview-modus: vermijd bedragen en concrete regelgeving; focus op begrippen, volgende stappen en waar de gebruiker info kan vinden.";

  const developer = [
    `Projecttype: ${project_type ?? triage?.projectType ?? "-"}`,
    `Schaal: ${project_size ?? triage?.projectSize ?? "-"}`,
    `Ervaring: ${triage?.ervaring ?? "-"}`,
    `Urgentie: ${triage?.urgentie ?? "-"}`,
    `Intentie: ${triage?.intent ?? "-"}`,
    `Bekende wensen: ${Array.isArray(wensen) ? wensen.map((w: any) => w?.titel).filter(Boolean).join(", ") : "-"}`,
    `Ontbrekende kernvelden: ${missing_fields.join(", ") || "-"}`,
  ].join("\n");

  return {
    system: `${sysBase}\n${sysMode}`,
    developer,
  };
}
