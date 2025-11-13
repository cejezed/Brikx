// /lib/ai/promptTemplates.ts
// ✅ BRIKX Build v3.0 - Prompt Builder
// - 100% type-driven (WizardState, Wish)
// - Leest kerninfo uit chapterAnswers (basis, wensen)
// - Respecteert PREVIEW vs PREMIUM gedrag
// - Geen v2.0 triage / any-lekken

import type { WizardState, Wish } from "@/types/project";
import type { MissingItem } from "./missing";

export type BuildPromptIn = {
  mode?: "PREVIEW" | "PREMIUM" | "preview" | "premium";
  wizardState?: Partial<WizardState>;
  missing?: MissingItem[]; // optioneel, voor context over essentials
};

export function buildPrompt(input?: BuildPromptIn) {
  const safeInput = input ?? {};

  const mode =
    (safeInput.mode || "PREVIEW").toString().toUpperCase() ===
    "PREMIUM"
      ? "PREMIUM"
      : "PREVIEW";

  const wizardState = safeInput.wizardState ?? {};

  const basis: any = wizardState.chapterAnswers?.basis ?? {};
  const wensenData: any =
    wizardState.chapterAnswers?.wensen ?? {};

  const projectType = basis.projectType || "-";
  const projectSize = basis.projectSize || "-";
  const projectNaam = basis.projectNaam || "-";
  const locatie = basis.locatie || "-";
  const currentChapter =
    wizardState.currentChapter || "basis";

  // Wensen: ga uit van Wish[] met .text, maar fail-safe als het anders is
  const wensenList: string[] = Array.isArray(
    wensenData?.wishes
  )
    ? (wensenData.wishes as Wish[])
        .map((w) =>
          typeof w === "string"
            ? w
            : w?.text || ""
        )
        .filter((s) => s && s.trim().length > 0)
    : [];

  const missingSummary =
    safeInput.missing && safeInput.missing.length
      ? safeInput.missing
          .map(
            (m) =>
              `${m.label} (${m.chapter})`
          )
          .join(", ")
      : "-";

  // SYSTEM: gedrag van Jules
  const sysBase = [
    "Je bent Jules, de vaste digitale bouwcoach van Brikx.",
    "Je praat in het Nederlands.",
    "Je antwoorden zijn helder, concreet en niet onnodig lang.",
    "Je verzint geen feiten: als je iets niet zeker weet, zeg dat expliciet en verwijs naar betrouwbare bronnen (gemeente, omgevingsloket, constructeur, architect).",
  ].join(" ");

  const sysMode =
    mode === "PREMIUM"
      ? [
          "Je zit in PREMIUM-modus:",
          "je mag globale richtbedragen, technische diepgang en verwijzingen naar regelgeving geven,",
          "maar voeg bij bedragen en regels altijd kort een nuance of disclaimer toe.",
        ].join(" ")
      : [
          "Je zit in PREVIEW-modus:",
          "vermijd concrete bedragen en exacte juridische uitspraken,",
          "focus op uitleg, opties, aandachtspunten en volgende stappen voor de gebruiker.",
        ].join(" ");

  // DEVELOPER: gestructureerde context zodat het model state-aware blijft
  const developer = [
    "--- CONTEXT ---",
    `Projectnaam: ${projectNaam}`,
    `Projecttype: ${projectType}`,
    `Schaal / omvang: ${projectSize}`,
    `Locatie: ${locatie}`,
    `Huidig wizard-hoofdstuk: ${currentChapter}`,
    `Bekende wensen: ${
      wensenList.length
        ? wensenList.join(", ")
        : "-"
    }`,
    `Ontbrekende essentiële velden: ${missingSummary}`,
    "Gebruik deze context om antwoorden te verankeren in dit specifieke project.",
    "Verwijs waar zinvol naar relevante hoofdstukken (basis, ruimtes, wensen, budget, techniek, duurzaam, risico) in plaats van losstaande adviezen.",
    "--- EINDE CONTEXT ---",
  ].join("\n");

  return {
    system: `${sysBase}\n${sysMode}`,
    developer,
  };
}
