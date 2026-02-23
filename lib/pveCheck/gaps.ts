// lib/pveCheck/gaps.ts — 3-layer gap detection
// Layer 1: Structural (missing fields, enriched with LLM context)
// Layer 2: Vagueness (LLM-detected, with document quotes)
// Layer 3: Context-specific (intake-based, project-aware)
import type { WizardState } from "@/types/project";
import type {
  PveClassifyResult,
  PveGap,
  PveRubric,
  PveRubricItem,
  PveCheckIntakeData,
} from "@/types/pveCheck";
import { computeMissingFields } from "@/lib/ai/missing";
import { GAP_FRIENDLY_REASONS } from "./friendlyReasons";

function getFriendlyReason(
  fieldId: string,
  mode: "missing" | "vague",
): string | undefined {
  return GAP_FRIENDLY_REASONS[fieldId]?.[mode];
}

// ============================================================================
// LAYER 1: STRUCTURAL GAPS — enriched with LLM missing field context
// ============================================================================

function structuralGaps(
  rubric: PveRubric,
  classify: PveClassifyResult,
): PveGap[] {
  const gaps: PveGap[] = [];

  // Build a minimal WizardState from mapped data for computeMissingFields
  const state: WizardState = {
    stateVersion: 1,
    chapterAnswers: classify.mappedData,
    chapterFlow: [],
    mode: "PREVIEW",
  } as WizardState;

  let missingItems: ReturnType<typeof computeMissingFields> = [];
  try { missingItems = computeMissingFields(state); } catch { /* LLM data shape mismatch */ }

  // Also check rubric items not in classify.fields
  const classifiedFieldIds = new Set(classify.fields.map((f) => f.fieldId));
  for (const item of rubric.items) {
    if (!classifiedFieldIds.has(item.id)) {
      // Not classified = not found in document. Use LLM missingFieldContext if available
      const llmContext = classify.missingFieldContext[item.id];

      const reason = llmContext
        ? `${llmContext.whyMissing}${llmContext.nearbyContext && llmContext.nearbyContext !== "Geen gerelateerde tekst gevonden" ? ` Het document zegt wel: "${llmContext.nearbyContext.slice(0, 150)}"` : ""}`
        : `${item.label} is niet gevonden in het document.`;

      gaps.push({
        id: `gap:structural:${item.id}`,
        chapter: item.chapter,
        fieldId: item.id,
        label: item.label,
        severity: item.severity,
        fixEffort: item.fixEffort,
        reason,
        friendlyReason: getFriendlyReason(item.id, "missing"),
        riskOverlay: item.riskOverlay,
        isVagueness: false,
        isConflict: false,
      });
    }
  }

  // Add any extra missing fields from computeMissingFields not yet covered
  const seenIds = new Set(gaps.map((g) => g.fieldId));
  for (const missing of missingItems) {
    const fieldId = `${missing.chapter}.${missing.fieldId}`;
    if (seenIds.has(fieldId)) continue;

    const rubricItem = rubric.items.find(
      (item) => item.chapter === missing.chapter && item.fieldId === missing.fieldId,
    );

    gaps.push({
      id: `gap:structural:${fieldId}`,
      chapter: missing.chapter,
      fieldId: rubricItem?.id ?? fieldId,
      label: missing.label,
      severity: rubricItem?.severity ?? "important",
      fixEffort: rubricItem?.fixEffort ?? "S",
      reason: `${missing.label} ontbreekt in het document.`,
      friendlyReason: getFriendlyReason(rubricItem?.id ?? fieldId, "missing"),
      riskOverlay: rubricItem?.riskOverlay ?? "Ontbrekende informatie kan leiden tot verkeerde aannames.",
      isVagueness: false,
      isConflict: false,
    });
  }

  return gaps;
}

// ============================================================================
// LAYER 2: VAGUENESS GAPS — with document quotes and specific weaknesses
// ============================================================================

function vagueGaps(
  rubric: PveRubric,
  classify: PveClassifyResult,
): PveGap[] {
  const gaps: PveGap[] = [];

  for (const field of classify.fields) {
    if (!field.vague) continue;

    const rubricItem = rubric.items.find((item) => item.id === field.fieldId);
    if (!rubricItem) continue;

    // Build a document-specific reason using quote + weakness
    const parts: string[] = [];

    if (field.quote) {
      parts.push(`Het document zegt: "${field.quote.slice(0, 120)}"`);
    }
    if (field.weakness) {
      parts.push(field.weakness);
    } else if (field.vagueReason) {
      parts.push(field.vagueReason);
    }
    if (rubricItem.qualityCriteria) {
      parts.push(`Kwaliteitscriterium: ${rubricItem.qualityCriteria}`);
    }

    const reason = parts.length > 0
      ? parts.join(". ") + "."
      : "Informatie is aanwezig maar niet concreet genoeg voor betrouwbare uitvoering.";

    gaps.push({
      id: `gap:vague:${field.fieldId}`,
      chapter: field.chapter,
      fieldId: field.fieldId,
      label: `${rubricItem.label} is te vaag`,
      severity: rubricItem.severity,
      fixEffort: rubricItem.fixEffort,
      reason,
      friendlyReason: getFriendlyReason(rubricItem.id, "vague"),
      riskOverlay: rubricItem.riskOverlay,
      evidence: field.evidence,
      currentValue: typeof field.value === "string" ? field.value : undefined,
      isVagueness: true,
      isConflict: false,
    });
  }

  return gaps;
}

// ============================================================================
// LAYER 3: CONTEXT-SPECIFIC GAPS (intake-driven, project-aware)
// ============================================================================

function contextGaps(
  rubric: PveRubric,
  classify: PveClassifyResult,
  intake: PveCheckIntakeData,
): PveGap[] {
  const gaps: PveGap[] = [];
  const fieldIds = new Set(classify.fields.map((f) => f.fieldId));
  const contextText = classify.fields
    .flatMap((field) => [
      typeof field.value === "string" ? field.value : "",
      field.quote ?? "",
      field.observation ?? "",
      field.weakness ?? "",
    ])
    .join(" ")
    .toLowerCase();

  function hasAnyKeyword(keywords: string[]): boolean {
    return keywords.some((keyword) => contextText.includes(keyword));
  }

  function parseBouwjaarFromIntake(): number | null {
    const raw = (intake.bouwjaar ?? "").trim();
    const match = raw.match(/\d{4}/);
    if (!match) return null;
    const year = Number(match[0]);
    return Number.isFinite(year) ? year : null;
  }

  function pushContextGap(nextGap: PveGap) {
    if (gaps.some((gap) => gap.fieldId === nextGap.fieldId)) return;
    gaps.push({
      ...nextGap,
      friendlyReason:
        nextGap.friendlyReason ?? getFriendlyReason(nextGap.fieldId, "missing"),
    });
  }

  // Verbouwing without bouwjaar → critical
  if (intake.projectType === "verbouwing" && !fieldIds.has("basis.bouwjaar")) {
    const item = rubric.items.find((i) => i.id === "basis.bouwjaar");
    const llmContext = classify.missingFieldContext["basis.bouwjaar"];
    if (item) {
      pushContextGap({
        id: "gap:context:verbouwing_bouwjaar",
        chapter: "basis",
        fieldId: "basis.bouwjaar",
        label: "Bouwjaar ontbreekt bij verbouwing",
        severity: "critical",
        fixEffort: "XS",
        reason: llmContext
          ? `Bij een verbouwing is het bouwjaar essentieel voor asbest-risico en constructieve aannames. ${llmContext.nearbyContext !== "Geen gerelateerde tekst gevonden" ? `Het document vermeldt wel: "${llmContext.nearbyContext.slice(0, 100)}" maar dat is niet specifiek genoeg.` : ""}`
          : "Bij een verbouwing is het bouwjaar essentieel voor asbest-risico, constructieve aannames en energielabel.",
        riskOverlay: item.riskOverlay,
        isVagueness: false,
        isConflict: false,
      });
    }
  }

  // Ambitious sustainability without energy target
  if (
    (intake.duurzaamheidsAmbitie === "ambitieus" ||
      intake.duurzaamheidsAmbitie === "zeer_ambitieus") &&
    !fieldIds.has("duurzaam.energieLabel")
  ) {
    const item = rubric.items.find((i) => i.id === "duurzaam.energieLabel");
    const llmContext = classify.missingFieldContext["duurzaam.energieLabel"];
    if (item) {
      pushContextGap({
        id: "gap:context:ambitieus_zonder_energiedoel",
        chapter: "duurzaam",
        fieldId: "duurzaam.energieLabel",
        label: "Energiedoel ontbreekt bij hoge duurzaamheidsambitie",
        severity: "critical",
        fixEffort: "S",
        reason: llmContext
          ? `Je hebt "${intake.duurzaamheidsAmbitie}" als ambitie aangegeven, maar het document bevat geen concreet energiedoel. ${llmContext.whyMissing}`
          : `Je hebt een hoge duurzaamheidsambitie aangegeven maar het document bevat geen concreet energiedoel (bv. energielabel A+, BENG-eisen, of EPC-waarde).`,
        riskOverlay: item.riskOverlay,
        isVagueness: false,
        isConflict: false,
      });
    }
  }

  // High budget without risk paragraph
  if (
    (intake.budgetRange === "€500k-€1M" || intake.budgetRange === "> €1M") &&
    !fieldIds.has("risico.planning") &&
    !fieldIds.has("risico.vergunning")
  ) {
    const llmContext = classify.missingFieldContext["risico.planning"];
    pushContextGap({
      id: "gap:context:hoog_budget_geen_risico",
      chapter: "risico",
      fieldId: "risico.planning",
      label: "Risicoparagraaf ontbreekt bij groot budget",
      severity: "important",
      fixEffort: "M",
      reason: llmContext
        ? `Bij een project van ${intake.budgetRange} is een expliciete risico- en beheerstrategie essentieel. ${llmContext.whyMissing}`
        : `Bij een project met budget ${intake.budgetRange} is een expliciete risico- en beheerstrategie essentieel.`,
      riskOverlay: "Zonder risicoparagraaf worden budgetoverschrijdingen pas laat ontdekt.",
      isVagueness: false,
      isConflict: false,
    });
  }

  // Nieuwbouw without foundation strategy (example from P7)
  if (
    intake.projectType === "nieuwbouw" &&
    !hasAnyKeyword(["fundering", "heipaal", "paalfundering", "sondering", "grondonderzoek"])
  ) {
    const item = rubric.items.find((i) => i.id === "risico.scope");
    const llmContext = classify.missingFieldContext["risico.scope"];
    pushContextGap({
      id: "gap:context:nieuwbouw_geen_fundering",
      chapter: "risico",
      fieldId: "risico.scope",
      label: "Funderingsaanpak ontbreekt bij nieuwbouw",
      severity: "critical",
      fixEffort: "S",
      reason: llmContext
        ? `Nieuwbouw zonder funderingsaanpak geeft grote uitvoeringsrisico's. ${llmContext.whyMissing}`
        : "Nieuwbouw zonder funderingsaanpak (sondering, type fundering, uitgangspunten) geeft grote uitvoeringsrisico's.",
      riskOverlay:
        item?.riskOverlay ??
        "Onbekende fundering zorgt vaak voor meerwerk en vertraging in uitvoer.",
      isVagueness: false,
      isConflict: false,
    });
  }

  // Bijgebouw without permit check (example from P7)
  if (
    intake.projectType === "bijgebouw" &&
    !fieldIds.has("risico.vergunning") &&
    !hasAnyKeyword(["vergunning", "vergunningsvrij", "omgevingsvergunning", "welstand", "bestemmingsplan"])
  ) {
    const item = rubric.items.find((i) => i.id === "risico.vergunning");
    const llmContext = classify.missingFieldContext["risico.vergunning"];
    if (item) {
      pushContextGap({
        id: "gap:context:bijgebouw_geen_vergunningscheck",
        chapter: "risico",
        fieldId: "risico.vergunning",
        label: "Vergunningscheck ontbreekt bij bijgebouw",
        severity: "critical",
        fixEffort: "XS",
        reason: llmContext
          ? `Bijgebouwen vallen vaak in een grensgebied van vergunningvrij/vergunningplichtig. ${llmContext.whyMissing}`
          : "Bijgebouwen vallen vaak in een grensgebied van vergunningvrij en vergunningplichtig. Zonder check is de planning onbetrouwbaar.",
        riskOverlay: item.riskOverlay,
        isVagueness: false,
        isConflict: false,
      });
    }
  }

  // High sustainability ambition should be translated into technical choices
  if (
    (intake.duurzaamheidsAmbitie === "ambitieus" ||
      intake.duurzaamheidsAmbitie === "zeer_ambitieus") &&
    !fieldIds.has("techniek.verwarming") &&
    !fieldIds.has("techniek.ventilatie")
  ) {
    const item = rubric.items.find((i) => i.id === "techniek.verwarming");
    const llmContext = classify.missingFieldContext["techniek.verwarming"];
    if (item) {
      pushContextGap({
        id: "gap:context:duurzaam_geen_installatiekeuze",
        chapter: "techniek",
        fieldId: "techniek.verwarming",
        label: "Duurzaamheidsambitie mist technische vertaling",
        severity: "critical",
        fixEffort: "S",
        reason: llmContext
          ? `Je duurzaamheidsambitie vraagt om expliciete installatiekeuzes. ${llmContext.whyMissing}`
          : "Je duurzaamheidsambitie vraagt om expliciete installatiekeuzes (verwarming/ventilatie), maar die ontbreken.",
        riskOverlay: item.riskOverlay,
        isVagueness: false,
        isConflict: false,
      });
    }
  }

  // Older renovation/hybrid project without asbestos check
  const bouwjaar = parseBouwjaarFromIntake();
  if (
    (intake.projectType === "verbouwing" || intake.projectType === "hybride") &&
    bouwjaar !== null &&
    bouwjaar <= 1994 &&
    !hasAnyKeyword(["asbest", "asbestinventarisatie", "asbestscan"])
  ) {
    const item = rubric.items.find((i) => i.id === "risico.scope");
    pushContextGap({
      id: "gap:context:oud_bouwjaar_geen_asbestcheck",
      chapter: "risico",
      fieldId: "risico.scope",
      label: "Asbestcheck ontbreekt bij ouder bouwjaar",
      severity: "critical",
      fixEffort: "S",
      reason:
        "Bij oudere bouwjaren hoort een expliciete asbestcheck in de voorbereiding. Zonder die check is de uitvoeringsplanning kwetsbaar.",
      riskOverlay:
        item?.riskOverlay ??
        "Ontbrekende asbesttoets kan leiden tot stopzetting en extra saneringskosten.",
      isVagueness: false,
      isConflict: false,
    });
  }

  return gaps;
}

// ============================================================================
// PUBLIC API — merge all 3 layers, deduplicate by fieldId
// ============================================================================

export function computeGaps(params: {
  rubric: PveRubric;
  classify: PveClassifyResult;
  intake: PveCheckIntakeData;
}): PveGap[] {
  const layer1 = structuralGaps(params.rubric, params.classify);
  const layer2 = vagueGaps(params.rubric, params.classify);
  const layer3 = contextGaps(params.rubric, params.classify, params.intake);

  // Deduplicate: context gaps override structural, vague gaps are additive
  const seen = new Set<string>();
  const result: PveGap[] = [];

  // Context first (highest priority)
  for (const gap of layer3) {
    seen.add(gap.fieldId);
    result.push(gap);
  }
  // Then vague
  for (const gap of layer2) {
    if (!seen.has(gap.fieldId)) {
      seen.add(gap.fieldId);
      result.push(gap);
    }
  }
  // Then structural
  for (const gap of layer1) {
    if (!seen.has(gap.fieldId)) {
      seen.add(gap.fieldId);
      result.push(gap);
    }
  }

  return result;
}
