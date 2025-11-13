// /lib/risk/scan.ts
// Brikx Build v3.0 — Risicoscan (schema-conform en UI-compatibel)
// Geeft Risk[] terug (id, severity: 'laag'|'medium'|'hoog', description, mitigation?)
// Back-compat: `scan(...)` accepteert ofwel WizardState, ofwel chapterAnswers (Partial<ChapterDataMap>)

import type {
  WizardState,
  TechniekData,
  DuurzaamData,
  Risk,
  ChapterDataMap,
} from "@/types/project";

// ---- Helpers ---------------------------------------------------------------

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function getTechniek(state: WizardState): TechniekData | undefined {
  return state.chapterAnswers?.techniek as TechniekData | undefined;
}

function getDuurzaam(state: WizardState): DuurzaamData | undefined {
  return state.chapterAnswers?.duurzaam as DuurzaamData | undefined;
}

function getTriageBudget(state: WizardState): number | undefined {
  const triage = (state as any)?.triage;
  const b = triage?.budget;
  return typeof b === "number" && Number.isFinite(b) ? b : undefined;
}

// ---- Kernscan --------------------------------------------------------------

export function scanRisks(state: WizardState): Risk[] {
  const risks: Risk[] = [];

  const techniek = getTechniek(state);
  const duurzaam = getDuurzaam(state);
  const budget = getTriageBudget(state);

  // 1) Basisvalidaties
  if (budget === undefined || budget <= 0) {
    risks.push({
      id: uid("budget-miss"),
      severity: "medium",
      description:
        "Budget ontbreekt of is ongeldig. Vul een indicatief budget in (±15% bandbreedte) voor betere afwegingen.",
      mitigation:
        "Ga naar basis/triage en vul een realistisch bandbreedte-budget in; koppel het aan prioriteiten.",
      related: ["triage.budget"],
    });
  }

  // 2) Techniek ↔ Duurzaam consistentie
  if (techniek) {
    const verwarming = techniek.verwarming;
    const gasaansluiting = techniek.gasaansluiting;

    const isWarmtepomp =
      verwarming === "all_electric_warmtepomp" ||
      verwarming === "hybride_warmtepomp";

    if (duurzaam?.energievoorziening === "gasloos") {
      if (gasaansluiting === true) {
        risks.push({
          id: uid("gasloos-conflict"),
          severity: "medium",
          description:
            "Ambitie is gasloos, maar er staat nog een gasaansluiting aan in Techniek.",
          mitigation:
            "Zet gasaansluiting uit of pas de duurzame ambitie aan.",
          related: ["duurzaam.energievoorziening", "techniek.gasaansluiting"],
        });
      }
      if (verwarming === "cv_gas") {
        risks.push({
          id: uid("gasloos-cv-gas"),
          severity: "hoog",
          description:
            "Ambitie is gasloos, maar het verwarmingssysteem is CV op gas.",
          mitigation:
            "Kies een all-electric of hybride warmtepomp of herzie de ambitie.",
          related: ["duurzaam.energievoorziening", "techniek.verwarming"],
        });
      }
    }

    if (duurzaam?.energievoorziening === "volledig_all_electric") {
      if (!(isWarmtepomp || verwarming === "stadswarmte")) {
        risks.push({
          id: uid("allelectric-mismatch"),
          severity: "hoog",
          description:
            "Ambitie is all-electric, maar het gekozen verwarmingssysteem sluit daar niet op aan.",
          mitigation:
            "Stel Techniek in op ‘all-electric warmtepomp’ of ‘stadswarmte’.",
          related: ["duurzaam.energievoorziening", "techniek.verwarming"],
        });
      }
    }

    if (duurzaam?.energievoorziening === "hybride") {
      if (verwarming !== "hybride_warmtepomp") {
        risks.push({
          id: uid("hybride-mismatch"),
          severity: "medium",
          description:
            "Ambitie is hybride, maar het gekozen verwarmingssysteem is niet hybride.",
          mitigation:
            "Kies in Techniek ‘hybride warmtepomp’ of pas de ambitie aan.",
          related: ["duurzaam.energievoorziening", "techniek.verwarming"],
        });
      }
    }

    if (duurzaam?.evLaadpunt && duurzaam.evLaadpunt !== "geen") {
      if (!techniek.evVoorziening || techniek.evVoorziening === "geen") {
        risks.push({
          id: uid("ev-mismatch"),
          severity: "laag",
          description:
            "EV-laadpunt gewenst, maar er is geen technische voorziening vastgelegd.",
          mitigation:
            "Leg in Techniek een EV-voorbereiding of laadpunt vast (groep, kabeltraject, plek).",
          related: ["duurzaam.evLaadpunt", "techniek.evVoorziening"],
        });
      }
    }

    if (duurzaam?.thuisbatterij === "ja_korte_termijn") {
      if (techniek.batterijVoorziening !== "batterij_gepland") {
        risks.push({
          id: uid("batterij-mismatch"),
          severity: "laag",
          description:
            "Thuisbatterij gewenst, maar (nog) niet als technische voorziening opgenomen.",
          mitigation:
            "Plan in Techniek ‘batterij voorzien in ontwerp’ (plaats, ventilatie, omvormers).",
          related: ["duurzaam.thuisbatterij", "techniek.batterijVoorziening"],
        });
      }
    }

    if (duurzaam?.zonnepanelen && duurzaam.zonnepanelen !== "geen") {
      if (
        !techniek.pvConfiguratie ||
        techniek.pvConfiguratie === "onbekend" ||
        techniek.pvConfiguratie === "geen"
      ) {
        risks.push({
          id: uid("pv-mismatch"),
          severity: "laag",
          description:
            "Zonnepanelen gewenst, maar er is geen passende PV-configuratie vastgelegd.",
          mitigation:
            "Kies in Techniek een PV-configuratie (basis/uitgebreid/nul-op-de-meter).",
          related: ["duurzaam.zonnepanelen", "techniek.pvConfiguratie"],
        });
      }
    }

    if (isWarmtepomp && techniek.afgiftesysteem === "radiatoren_hoog_temp") {
      risks.push({
        id: uid("lt-afgifte"),
        severity: "laag",
        description:
          "Warmtepomp met hoge-temperatuur radiatoren verlaagt efficiëntie en comfort.",
        mitigation:
          "Overweeg lage-temperatuur afgifte (vloerverwarming of LT-radiatoren).",
        related: ["techniek.verwarming", "techniek.afgiftesysteem"],
      });
    }
  }

  // 3) Duurzaam sanity checks
  if (duurzaam) {
    if (typeof duurzaam.n50 === "number" && Number.isFinite(duurzaam.n50)) {
      if (duurzaam.n50 > 5) {
        risks.push({
          id: uid("n50-hoog"),
          severity: "medium",
          description:
            "Luchtdichtheid indicatie is ongunstig (n50-waarde is relatief hoog).",
          mitigation:
            "Verbeter kierdichting/oplevercontrole voor minder energieverlies en tocht.",
          related: ["duurzaam.n50"],
        });
      }
    }

    if (typeof duurzaam.uGlas === "number" && Number.isFinite(duurzaam.uGlas)) {
      if (duurzaam.uGlas > 1.5) {
        risks.push({
          id: uid("u-glas-hoog"),
          severity: "laag",
          description:
            "U-waarde van het glas is relatief hoog (warmteverlies, mindere comfort).",
          mitigation:
            "Overweeg HR++ (≈1.2) of triple (≈0.7) voor betere isolatie en comfort.",
          related: ["duurzaam.uGlas"],
        });
      }
    }

    const lowRcGevel =
      typeof duurzaam.rcGevel === "number" &&
      duurzaam.rcGevel > 0 &&
      duurzaam.rcGevel < 4.0;
    const lowRcDak =
      typeof duurzaam.rcDak === "number" &&
      duurzaam.rcDak > 0 &&
      duurzaam.rcDak < 5.0;
    const lowRcVloer =
      typeof duurzaam.rcVloer === "number" &&
      duurzaam.rcVloer > 0 &&
      duurzaam.rcVloer < 3.0;

    if (lowRcGevel || lowRcDak || lowRcVloer) {
      risks.push({
        id: uid("rc-laag"),
        severity: "laag",
        description:
          "Relatief lage Rc-waarden zorgen voor hogere energielasten op de lange termijn.",
        mitigation:
          "Streef naar gevel ~4.5–6.0, dak ~6–8, vloer ~3.5–5.0 waar haalbaar.",
        related: [
          ...(lowRcGevel ? ["duurzaam.rcGevel"] : []),
          ...(lowRcDak ? ["duurzaam.rcDak"] : []),
          ...(lowRcVloer ? ["duurzaam.rcVloer"] : []),
        ],
      });
    }
  }

  return risks;
}

// ---- Back-compat wrapper ---------------------------------------------------
// Laat bestaande UI-imports werken: `scan(allAnswers)` of `scan(wizardState)`
export function scan(stateOrAnswers: WizardState | Partial<ChapterDataMap>): Risk[] {
  if (stateOrAnswers && "stateVersion" in stateOrAnswers) {
    // volledige WizardState aangeleverd
    return scanRisks(stateOrAnswers as WizardState);
  }
  // alleen chapterAnswers aangeleverd → wikkel in minimale WizardState
  const chapterAnswers = stateOrAnswers as Partial<ChapterDataMap>;
  const minimalState: WizardState = {
    stateVersion: 1,
    chapterAnswers,
    chapterFlow: [],
    mode: "PREVIEW",
  } as WizardState;
  return scanRisks(minimalState);
}

// ⛔ Verwijderd: `export { scanRisks };` (dit veroorzaakte de dubbele export)
