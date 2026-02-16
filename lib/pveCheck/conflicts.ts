// lib/pveCheck/conflicts.ts — 6 headline conflicts
// Uses existing code: computeBudgetWarning(), computePermitStatus(), scanRisks()
import type { ChapterDataMap, WizardState } from "@/types/project";
import type {
  HeadlineConflict,
  HeadlineConflictType,
  PveCheckIntakeData,
  PveClassifyResult,
} from "@/types/pveCheck";
import { computeBudgetWarning, computePermitStatus } from "@/lib/report/heuristics";
import { scan as scanRisks } from "@/lib/risk/scan";

// ============================================================================
// HELPERS
// ============================================================================

let conflictCounter = 0;
function uid(type: HeadlineConflictType): string {
  return `conflict:${type}:${++conflictCounter}`;
}

function readFieldText(
  classify: PveClassifyResult,
  fieldId: string,
): string {
  const field = classify.fields.find((f) => f.fieldId === fieldId);
  return typeof field?.value === "string" ? field.value : "";
}

function hasKeyword(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

// ============================================================================
// 6 HEADLINE CONFLICTS
// ============================================================================

export function computeConflicts(params: {
  classify: PveClassifyResult;
  intake: PveCheckIntakeData;
}): HeadlineConflict[] {
  const conflicts: HeadlineConflict[] = [];
  conflictCounter = 0;

  const mapped = params.classify.mappedData;
  const wishes = readFieldText(params.classify, "wensen.wishes");
  const techniek = readFieldText(params.classify, "techniek.verwarming");

  // Build minimal WizardState for existing helpers
  const wizardState: WizardState = {
    stateVersion: 1,
    chapterAnswers: mapped,
    chapterFlow: [],
    mode: "PREVIEW",
  } as WizardState;

  // ---- 1. budget_vs_ambition ----
  // Uses computeBudgetWarning() + must-have count
  let budgetWarning: string | null = null;
  try { budgetWarning = computeBudgetWarning(mapped); } catch { /* LLM data shape mismatch */ }
  const mustHaveCount = wishes.toLowerCase().split("must").length - 1;

  if (budgetWarning || mustHaveCount > 5) {
    conflicts.push({
      id: uid("budget_vs_ambition"),
      type: "budget_vs_ambition",
      title: "Ambitie past mogelijk niet bij budget",
      severity: "hoog",
      summary:
        budgetWarning ??
        "Er zijn veel must-have wensen terwijl het budget beperkt lijkt voor dit ambitieniveau.",
      relatedFieldIds: ["budget.budgetTotaal", "wensen.wishes"],
      suggestedNextStep:
        "Prioriteer wensen met MoSCoW-methode en stel een budgetbuffer van 10-15% vast.",
    });
  }

  // ---- 2. planning_vs_permit ----
  // Uses computePermitStatus() as-is
  const basis = mapped.basis;
  const permitStatus = computePermitStatus(basis);
  const isUrgent =
    params.intake.budgetRange === "< €100k"
      ? false
      : params.intake.projectType === "nieuwbouw" ||
        params.intake.projectType === "verbouwing";

  if (permitStatus !== "Geen" && isUrgent) {
    conflicts.push({
      id: uid("planning_vs_permit"),
      type: "planning_vs_permit",
      title: "Vergunningstraject botst mogelijk met planning",
      severity: "medium",
      summary: `Verwachte vergunning: ${permitStatus}. Dit kan de planning beïnvloeden.`,
      relatedFieldIds: ["risico.planning", "risico.vergunning"],
      suggestedNextStep:
        "Neem minimaal 8-16 weken voor vergunningsaanvraag en -verlening mee in de planning.",
    });
  }

  // ---- 3. install_vs_space ----
  // Uses scanRisks() existing checks
  let risks: ReturnType<typeof scanRisks> = [];
  try { risks = scanRisks(wizardState); } catch { /* LLM data shape mismatch */ }
  const installRisks = risks.filter(
    (r) =>
      r.related?.some(
        (rel) => rel.includes("techniek.") || rel.includes("duurzaam."),
      ) && r.severity !== "laag",
  );

  if (installRisks.length > 0) {
    conflicts.push({
      id: uid("install_vs_space"),
      type: "install_vs_space",
      title: "Installatiekeuze conflicteert met ruimte/systeem",
      severity: installRisks.some((r) => r.severity === "hoog")
        ? "hoog"
        : "medium",
      summary: installRisks[0].description,
      relatedFieldIds: installRisks.flatMap((r) => r.related ?? []),
      suggestedNextStep:
        installRisks[0].mitigation ??
        "Controleer of de gekozen installaties passen bij de ruimtelijke en technische randvoorwaarden.",
    });
  }

  // ---- 4. structural_vs_scope ----
  // projectType + scope vs structural requirements
  const projectType = params.intake.projectType;
  const rooms = readFieldText(params.classify, "ruimtes.rooms");

  if (
    (projectType === "nieuwbouw" || projectType === "hybride") &&
    rooms &&
    !hasKeyword(rooms, ["constructie", "fundering", "draagmuur", "staal", "hout"])
  ) {
    conflicts.push({
      id: uid("structural_vs_scope"),
      type: "structural_vs_scope",
      title: "Structurele eisen niet afgestemd op scope",
      severity: "medium",
      summary:
        "Het ruimteprogramma is uitgebreid maar er zijn geen constructieve uitgangspunten benoemd.",
      relatedFieldIds: ["ruimtes.rooms", "basis.projectType"],
      suggestedNextStep:
        "Beschrijf draagstructuur, funderingstype en overspanningen voor de belangrijkste ruimtes.",
    });
  }

  // ---- 5. sustainability_vs_comfort ----
  // scanRisks() gasloos vs CV gas
  const gasloosConflicts = risks.filter(
    (r) =>
      r.related?.includes("duurzaam.energievoorziening") &&
      r.related?.includes("techniek.verwarming"),
  );

  if (
    gasloosConflicts.length > 0 ||
    (hasKeyword(techniek, ["cv", "gas"]) &&
      hasKeyword(wishes, ["energieneutraal", "all electric", "nul op de meter", "gasloos"]))
  ) {
    conflicts.push({
      id: uid("sustainability_vs_comfort"),
      type: "sustainability_vs_comfort",
      title: "Duurzaamheidsambitie conflicteert met installatiekeuze",
      severity: "hoog",
      summary:
        gasloosConflicts[0]?.description ??
        "De gekozen installaties passen niet bij de uitgesproken duurzaamheidsdoelen.",
      relatedFieldIds: [
        "duurzaam.energieLabel",
        "techniek.verwarming",
      ],
      suggestedNextStep:
        "Kies een consistent installatieconcept dat past bij je energieambitie (all-electric of hybride).",
    });
  }

  // ---- 6. scope_vs_responsibility ----
  // Missing scope definitions
  const scope = readFieldText(params.classify, "risico.scope");
  if (!scope) {
    conflicts.push({
      id: uid("scope_vs_responsibility"),
      type: "scope_vs_responsibility",
      title: "Scope en verantwoordelijkheden niet gedefinieerd",
      severity: "medium",
      summary:
        "Er is geen duidelijke afbakening van wie waarvoor verantwoordelijk is (opdrachtgever/architect/aannemer).",
      relatedFieldIds: ["risico.scope"],
      suggestedNextStep:
        "Definieer rolverdeling, scope-afbakening (casco/turn-key) en eventuele zelfwerkzaamheid.",
    });
  }

  return conflicts;
}
