import type { TriageData } from "@/types/wizard";
import type { Space, WishItem, TechnicalPrefs, SustainabilityPrefs } from "@/types/project";
import type { Archetype } from "@/types/archetype";

export type RiskSeverity = "low" | "medium" | "high";
export type RiskFinding = { id: string; severity: RiskSeverity; title: string; message: string; related?: string[] };
export type RiskReport = { generatedAt: number; findings: RiskFinding[] };

function uid(p: string) { return `${p}-${Math.random().toString(36).slice(2, 8)}`; }

export function scanRisks(args: {
  triage: TriageData;
  archetype: Archetype | null;
  ruimtes: Space[];
  wensen: WishItem[];
  techniek?: TechnicalPrefs;
  duurzaamheid?: SustainabilityPrefs;
}): RiskReport {
  const { triage, archetype, ruimtes, wensen, techniek, duurzaamheid } = args;
  const findings: RiskFinding[] = [];

  // Basis
  if (!archetype) {
    findings.push({ id: uid("arch-miss"), severity: "high", title: "Geen projectvariant gekozen",
      message: "Kies eerst een projectvariant (archetype).", related: ["intake.archetype"] });
  }
  if (!Number.isFinite(triage.budget) || triage.budget <= 0) {
    findings.push({ id: uid("budget-miss"), severity: "medium", title: "Budget ontbreekt",
      message: "Vul een indicatief budget in voor betere afwegingen (±15% bandbreedte).", related: ["triage.budget"] });
  }

  // Ruimtes
  if (ruimtes.length === 0) {
    findings.push({ id: uid("rooms-none"), severity: "medium", title: "Nog geen ruimtes",
      message: "Voeg minimaal één ruimte toe voor oppervlaktes/routing/kosten.", related: ["chapter.ruimtes"] });
  } else if (ruimtes.some(r => !r.type || !r.type.trim())) {
    findings.push({ id: uid("rooms-unnamed"), severity: "low", title: "Onbenoemde ruimte",
      message: "Er staat een ruimte zonder type; vul dit aan.", related: ["chapter.ruimtes"] });
  }
  if (ruimtes.some(r => r.tag === "nvt")) {
    findings.push({ id: uid("rooms-nvt"), severity: "low", title: "Ruimte-categorie onbekend",
      message: "Eén of meer ruimtes hebben categorie ‘n.v.t.’. Stel later prioriteit vast.", related: ["chapter.ruimtes"] });
  }

  // Wensen
  if (wensen.length === 0) {
    findings.push({ id: uid("wishes-none"), severity: "low", title: "Nog geen wensen",
      message: "Voeg enkele wensen toe en geef prioriteit (MoSCoW).", related: ["chapter.wensen"] });
  } else if (wensen.some(w => (w.priority ?? "unknown") === "unknown")) {
    findings.push({ id: uid("wishes-unknown"), severity: "low", title: "Wensprioriteit nog onbepaald",
      message: "Eén of meer wensen hebben prioriteit ‘Weet ik nog niet / n.v.t.’. Later concretiseren helpt keuzes.", related: ["chapter.wensen"] });
  }

  // Techniek
  if (!techniek) {
    findings.push({ id: uid("tech-missing"), severity: "medium", title: "Techniek nog niet gekozen",
      message: "Selecteer bouwmethode/ventilatie/verwarming.", related: ["chapter.techniek"] });
  } else {
    const unk = [
      techniek.buildMethod === "unknown",
      techniek.ventilation === "unknown",
      techniek.heating === "unknown",
      techniek.cooling === "unknown",
      techniek.pv === "unknown",
    ].filter(Boolean).length;
    if (unk > 0) {
      findings.push({ id: uid("tech-unknown"), severity: "low", title: "Techniek nog onbepaald",
        message: "Eén of meer techniekkeuzes staan op ‘Weet ik nog niet / n.v.t.’. Goed voor nu; later concreet maken.", related: ["chapter.techniek"] });
    }
    if (triage.projectType === "nieuwbouw" && techniek.heating === "cv_gas") {
      findings.push({ id: uid("newbuild-gas"), severity: "high", title: "CV op gas bij nieuwbouw",
        message: "Voor nieuwbouw is aardgas onwenselijk of niet toegestaan; kies bij voorkeur (hybride) warmtepomp.", related: ["chapter.techniek","triage.projectType"] });
    }
    if ((techniek.insulationTargetRc ?? 0) >= 4.5 && (techniek.ventilation === "natuurlijk" || techniek.ventilation === "C")) {
      findings.push({ id: uid("vent-mismatch"), severity: "medium", title: "Ventilatie vs. isolatie",
        message: "Bij hoge isolatie (Rc ≥ 4.5) is balansventilatie met WTW vaak wenselijk.", related: ["chapter.techniek"] });
    }
  }

  // Duurzaamheid
  if (duurzaamheid) {
    const unkD =
      (duurzaamheid.focus === "unknown") ||
      (duurzaamheid.materials === "unknown") ||
      (duurzaamheid.rainwater === "unknown") ||
      (duurzaamheid.greenRoof === "unknown");
    if (unkD) {
      findings.push({ id: uid("sust-unknown"), severity: "low", title: "Duurzaamheid nog onbepaald",
        message: "Een of meer duurzaamheid-keuzes staan op ‘Weet ik nog niet / n.v.t.’. Later concretiseren helpt detailkeuzes.", related: ["chapter.duurzaamheid"] });
    }
  }

  // Budget-heuristiek
  if (triage.budget > 0 && ruimtes.length >= 4) {
    const estMin = ruimtes.length * 20000;
    if (triage.budget < estMin) {
      findings.push({ id: uid("budget-low"), severity: "medium", title: "Budget mogelijk te laag",
        message: `Bij ~${ruimtes.length} ruimtes lijkt een ondergrens van ca. € ${estMin.toLocaleString("nl-NL")} realistischer. Overweeg prioriteren of faseren.`,
        related: ["triage.budget","chapter.ruimtes"] });
    }
  }

  // Consistentie projectType vs archetype
  if (archetype && triage.projectType === "nieuwbouw" && archetype !== "nieuwbouw_woning") {
    findings.push({ id: uid("ptype-arch-mis"), severity: "low", title: "Projecttype ↔ archetype",
      message: "Je projecttype is ‘Nieuwbouw’, maar je archetype wijkt af. Controleer of dit klopt, of pas één van beide aan.",
      related: ["intake.archetype","triage.projectType"] });
  }

  return { generatedAt: Date.now(), findings };
}
