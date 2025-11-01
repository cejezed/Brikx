// lib/risk/scan.ts
// Build v2.0 — lichte risico-scan op basis van triage + chapterAnswers
// Defensieve reads (geen harde vereisten op optionele velden).

export type Severity = "low" | "medium" | "high";

export type RiskFinding = {
  id: string;
  severity: Severity;
  title: string;
  message: string;
  related?: string[]; // padjes zoals "triage.budget", "ruimtes.list.0"
};

export type RiskScanInput = {
  triage?: {
    projectType?: string | string[];
    projectSize?: string;
    urgency?: string;
    budget?: number;          // optioneel
    budgetCustom?: number;    // optioneel (intake custom)
    [k: string]: any;
  };
  chapterAnswers?: Record<string, any>;
};

export type RiskScanOutput = {
  findings: RiskFinding[];
};

function uid(prefix = "risk"): string {
  const r = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${r}`;
}

const asArray = <T = any>(v: unknown): T[] =>
  Array.isArray(v) ? (v as T[]) : v != null ? [v as T] : [];

export function scan(input: RiskScanInput): RiskScanOutput {
  const findings: RiskFinding[] = [];
  const triage = input?.triage ?? {};
  const answers = input?.chapterAnswers ?? {};

  // ===== Archetype / projectType =====
  const projectTypes = asArray<string>(triage.projectType).map((s) => String(s).toLowerCase().trim());
  if (projectTypes.length === 0) {
    findings.push({
      id: uid("archetype-miss"),
      severity: "medium",
      title: "Projectvariant ontbreekt",
      message: "Kies eerst een projectvariant (archetype).",
      related: ["intake.archetype", "triage.projectType"],
    });
  }

  // ===== Budget (defensief) =====
  const budget =
    typeof triage?.budget === "number"
      ? triage.budget
      : typeof triage?.budgetCustom === "number"
      ? triage.budgetCustom
      : undefined;

  if (!(typeof budget === "number" && Number.isFinite(budget) && budget > 0)) {
    findings.push({
      id: uid("budget-miss"),
      severity: "medium",
      title: "Budget ontbreekt",
      message: "Vul een indicatief budget in voor betere afwegingen (±15% bandbreedte).",
      related: ["triage.budget"],
    });
  }

  // ===== Urgentie vs. projectgrootte (indicatief signaal) =====
  const urgency = String(triage.urgency ?? "").toLowerCase();
  const size = String(triage.projectSize ?? "").toLowerCase();
  if (urgency === "hoog" && (size === "groot" || size === "middel")) {
    findings.push({
      id: uid("planning-krap"),
      severity: "low",
      title: "Strakke planning",
      message:
        "Hoge urgentie bij een (middel)groot project kan tot tijdsdruk leiden. Plan vergunningen en ontwerptraject tijdig.",
      related: ["triage.urgency", "triage.projectSize"],
    });
  }

  // ===== Ruimtes: inconsistenties / ontbrekende kernruimtes =====
  const rooms = Array.isArray(answers?.ruimtes?.list) ? answers.ruimtes.list : [];
  if (rooms.length === 0) {
    findings.push({
      id: uid("rooms-empty"),
      severity: "low",
      title: "Nog geen ruimtes ingevuld",
      message: "Voeg minimaal de kernruimtes toe (woonkamer, keuken, badkamer, slaapkamer).",
      related: ["ruimtes.list"],
    });
  } else {
    // voorbeeld: ontbrekende oppervlaktes signaleren
    const missingArea = rooms.filter((r: any) => !r || r.oppervlakte == null || r.oppervlakte <= 0);
    if (missingArea.length > 0) {
      findings.push({
        id: uid("room-area-miss"),
        severity: "low",
        title: "Ontbrekende oppervlakten",
        message:
          "Eén of meer ruimtes hebben geen (geldige) oppervlakte. Vul m² in voor een betere inschatting.",
        related: ["ruimtes.list"],
      });
    }
  }

  // ===== Techniek: voorbeeldsignaal (alleen bij ingevulde techniek) =====
  const techniek = answers?.techniek && typeof answers.techniek === "object" ? answers.techniek : null;
  if (techniek) {
    // voorbeeld: als koeling gekozen is zonder isolatie-doel
    if (techniek.cooling && !techniek.insulationTargetRc) {
      findings.push({
        id: uid("tech-rc-miss"),
        severity: "low",
        title: "Isolatiedoel ontbreekt",
        message:
          "Koeling is opgegeven zonder een Rc-doel. Overweeg eerst de schil te optimaliseren (isolatie/zontoetreding).",
        related: ["techniek.cooling", "techniek.insulationTargetRc"],
      });
    }
  }

  // ===== Duurzaamheid: voorbeeldsignaal (alleen bij ingevulde duurzaamheid) =====
  const duurzaamheid =
    answers?.duurzaamheid && typeof answers.duurzaamheid === "object" ? answers.duurzaamheid : null;
  if (duurzaamheid) {
    if (duurzaamheid.greenRoof && size === "groot" && projectTypes.includes("verbouwing")) {
      findings.push({
        id: uid("greenroof-struct"),
        severity: "low",
        title: "Groendak en constructie",
        message:
          "Een groendak vraagt vaak extra constructieve controle, zeker bij grotere verbouwingen. Laat draagkracht toetsen.",
        related: ["duurzaamheid.greenRoof", "triage.projectSize", "triage.projectType"],
      });
    }
  }

  // ===== Samengestelde triggers op basis van budget + wensen (voorbeeld) =====
  const wensenItems = Array.isArray(answers?.wensen?.items) ? answers.wensen.items : [];
  const hasManyMusts = wensenItems.filter((w: any) => (w?.priority ?? w?.prio) === "must").length >= 8;
  if (typeof budget === "number" && budget > 0 && hasManyMusts) {
    findings.push({
      id: uid("scope-vs-budget"),
      severity: "medium",
      title: "Ambities vs. budget",
      message:
        "Er zijn veel ‘must-have’ wensen opgegeven. Check of het budget realistisch is of stel prioriteiten bij (MoSCoW).",
      related: ["wensen.items", "triage.budget"],
    });
  }

  return { findings };
}

export default scan;
