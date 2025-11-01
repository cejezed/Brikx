// /utils/essentials.ts
// Build v2.0 — essentials-check, backward-compatible exports voor Preview.tsx.
// - Exporteert: collectEssentials, computeEssentialIssues, EssentialIssue
// - Tolerant voor ontbrekende 'ervaring' / 'urgentie' in TriageData types/state.

import type { TriageData } from "@/types/chat";

// ==== Types ====
export type EssentialIssue = {
  id: string;
  title: string;
  message: string;
  severity?: "low" | "medium" | "high";
  related?: string[]; // dotted paths voor focus/navigatie
};

// Backwards-compat alias (sommige code noemde dit EssentialFinding)
export type EssentialFinding = EssentialIssue;

// ==== Utils ====
function uid(prefix = "ess"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
}

// ==== Core (tolerant) ====
export function collectEssentials(triage?: TriageData): EssentialIssue[] {
  const out: EssentialIssue[] = [];

  // --- Canoniek en veilig getypt ---
  if (!triage?.projectType) {
    out.push({
      id: uid("ptype"),
      title: "Projecttype ontbreekt",
      message: "Kies Nieuwbouw / Verbouwing / Hybride.",
      related: ["basis.projectType"],
      severity: "medium",
    });
  }

  if (!triage?.intent || triage.intent.length === 0) {
    out.push({
      id: uid("intent"),
      title: "Intentie ontbreekt",
      message: "Kies je hoofddoel (architect, offertes, scenario's).",
      related: ["basis.intent"],
      severity: "low",
    });
  }

  if (!Number.isFinite(triage?.budget) || (triage?.budget as number) <= 0) {
    out.push({
      id: uid("budget-miss"),
      title: "Budget ontbreekt of ongeldig",
      message: "Vul een indicatief budget in voor betere afwegingen (±15% bandbreedte).",
      related: ["triage.budget"],
      severity: "medium",
    });
  }

  // --- Tolerante (runtime) checks: ervaring / urgentie ---
  const anyTri = triage as unknown as Record<string, unknown> | undefined;

  const ervaring = (anyTri?.["ervaring"] as string | undefined) ?? undefined;
  if (!ervaring) {
    out.push({
      id: uid("exp"),
      title: "Ervaring ontbreekt",
      message: "Geef aan of je starter of ervaren bent.",
      related: ["basis.ervaring"],
      severity: "low",
    });
  }

  const urgentie =
    (anyTri?.["urgentie"] as string | undefined) ??
    (anyTri?.["urgency"] as string | undefined); // alias-ondersteuning
  if (!urgentie) {
    out.push({
      id: uid("urg"),
      title: "Urgentie ontbreekt",
      message: "Hoe snel wil je starten?",
      related: ["basis.urgentie"],
      severity: "low",
    });
  }

  return out;
}

// Backwards-compat function export verwacht door Preview.tsx
export function computeEssentialIssues(triage?: TriageData): EssentialIssue[] {
  return collectEssentials(triage);
}
