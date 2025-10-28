import type { TriageData } from "@/types/wizard";
import type { Space, WishItem, TechnicalPrefs, SustainabilityPrefs } from "@/types/project";

export type PvEPreview = {
  summary: {
    projectType: string;
    ervaring: string;
    intent: string;
    urgentie: string;
    budget: string;
  };
  ruimtes: Space[];
  wensen: WishItem[];
  techniek?: {
    buildMethod: string;
    ventilation: string;
    heating: string;
    cooling: string;
    pv: string;
    insulationTargetRc?: number;
    notes?: string;
  };
  duurzaamheid?: {
    focus: string;
    materials: string;
    rainwater: string;
    greenRoof: string;
    epcTarget?: number;
    insulationUpgrade?: boolean;
    notes?: string;
  };
  /** Geaggregeerde aandachtspunten & toelichting uit basis/techniek/duurzaamheid */
  remarks: string[];
};

function euro(n: number) {
  if (!Number.isFinite(n) || n <= 0) return "—";
  try {
    return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  } catch {
    return `€ ${Math.round(n).toLocaleString("nl-NL")}`;
  }
}

export function buildPreview(args: { triage: TriageData; chapterAnswers: Record<string, any> }): PvEPreview {
  const { triage, chapterAnswers } = args;
  const ruimtes = (chapterAnswers["ruimtes"] as Space[]) ?? [];
  const wensen = (chapterAnswers["wensen"] as WishItem[]) ?? [];
  const techniek = (chapterAnswers["techniek"] as TechnicalPrefs | undefined);
  const duurzaamheid = (chapterAnswers["duurzaamheid"] as SustainabilityPrefs | undefined);

  const remarks: string[] = [];
  if (triage?.extra && triage.extra.trim()) remarks.push(triage.extra.trim());
  if (techniek?.notes && techniek.notes.trim()) remarks.push(techniek.notes.trim());
  if (duurzaamheid?.notes && duurzaamheid.notes.trim()) remarks.push(duurzaamheid.notes.trim());

  return {
    summary: {
      projectType: labelProjectType(triage.projectType),
      ervaring: triage.ervaring === "starter" ? "Starter" : "Ervaren",
      intent: intentLabel(triage.intent),
      urgentie: urgentieLabel(triage.urgentie),
      budget: euro(triage.budget),
    },
    ruimtes,
    wensen,
    techniek: techniek
      ? {
          buildMethod: buildMethodLabel(techniek.buildMethod),
          ventilation: ventilationLabel(techniek.ventilation),
          heating: heatingLabel(techniek.heating),
          cooling: coolingLabel(techniek.cooling),
          pv: pvLabel(techniek.pv),
          insulationTargetRc: techniek.insulationTargetRc,
          notes: techniek.notes,
        }
      : undefined,
    duurzaamheid: duurzaamheid
      ? {
          focus: focusLabel(duurzaamheid.focus),
          materials: materialsLabel(duurzaamheid.materials),
          rainwater: rainwaterLabel(duurzaamheid.rainwater),
          greenRoof: greenRoofLabel(duurzaamheid.greenRoof),
          epcTarget: duurzaamheid.epcTarget,
          insulationUpgrade: duurzaamheid.insulationUpgrade,
          notes: duurzaamheid.notes,
        }
      : undefined,
    remarks,
  };
}

function labelProjectType(v: TriageData["projectType"]) {
  switch (v) {
    case "nieuwbouw": return "Nieuwbouw";
    case "verbouwing": return "Verbouwing";
    default: return "Hybride";
  }
}
function intentLabel(v: TriageData["intent"]) {
  switch (v) {
    case "architect_start": return "Start met architect (oriëntatie)";
    case "contractor_quote": return "Voorbereiden aannemers-offertes";
    case "scenario_exploration": return "Scenario’s / haalbaarheid verkennen";
    default: return "—";
  }
}
function urgentieLabel(v: TriageData["urgentie"]) {
  switch (v) {
    case "laag": return "Laag";
    case "normaal": return "Normaal";
    case "dringend": return "Dringend";
    default: return "—";
  }
}

// techniek labels (incl. unknown)
function buildMethodLabel(v: string) {
  switch (v) {
    case "traditioneel_baksteen": return "Traditioneel (baksteen/beton)";
    case "houtskeletbouw": return "Houtskeletbouw";
    case "staalframe": return "Staalframe";
    case "anders": return "Anders / later bepalen";
    case "unknown": return "Weet ik nog niet / n.v.t.";
    default: return v;
  }
}
function ventilationLabel(v: string) {
  switch (v) {
    case "natuurlijk": return "Natuurlijk";
    case "C": return "Systeem C";
    case "D": return "Systeem D";
    case "balans_wtw": return "Balansventilatie met WTW";
    case "unknown": return "Weet ik nog niet / n.v.t.";
    default: return v;
  }
}
function heatingLabel(v: string) {
  switch (v) {
    case "all_electric_warmtepomp": return "All-electric warmtepomp";
    case "hybride_warmtepomp": return "Hybride warmtepomp";
    case "cv_gas": return "CV op gas";
    case "stadswarmte": return "Stadswarmte";
    case "unknown": return "Weet ik nog niet / n.v.t.";
    default: return v;
  }
}
function coolingLabel(v: string) {
  switch (v) {
    case "passief": return "Passief";
    case "actief": return "Actief";
    case "geen": return "Geen";
    case "unknown": return "Weet ik nog niet / n.v.t.";
    default: return v;
  }
}
function pvLabel(v: string) {
  switch (v) {
    case "geen": return "Geen";
    case "optioneel": return "Optioneel";
    case "maximeren": return "Maximaliseren";
    case "unknown": return "Weet ik nog niet / n.v.t.";
    default: return v;
  }
}

// duurzaamheid labels (incl. unknown)
function focusLabel(v: string) {
  switch (v) {
    case "comfort": return "Comfort & binnenklimaat";
    case "kosten": return "Laag verbruik/kosten";
    case "co2": return "CO₂-reductie";
    case "circulair": return "Circulair / hergebruik";
    case "unknown": return "Weet ik nog niet / n.v.t.";
    default: return v;
  }
}
function materialsLabel(v: string) {
  switch (v) {
    case "standaard": return "Standaard";
    case "biobased": return "Biobased";
    case "mix": return "Mix";
    case "unknown": return "Weet ik nog niet / n.v.t.";
    default: return v;
  }
}
function rainwaterLabel(v: string) {
  switch (v) {
    case "geen": return "Geen hergebruik";
    case "wc_tuin": return "WC + tuin";
    case "volledig": return "Volledig grijswater";
    case "unknown": return "Weet ik nog niet / n.v.t.";
    default: return v;
  }
}
function greenRoofLabel(v: string) {
  switch (v) {
    case "geen": return "Geen";
    case "gedeeltelijk": return "Gedeeltelijk";
    case "volledig": return "Volledig";
    case "unknown": return "Weet ik nog niet / n.v.t.";
    default: return v;
  }
}
