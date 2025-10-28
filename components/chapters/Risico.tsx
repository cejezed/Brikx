"use client";

import { useMemo, useState } from "react";
import { useWizardState } from "@/lib/stores/useWizardState";
import { scanRisks, type RiskReport, type RiskSeverity } from "@/lib/risk/scan";
import { buildPreview } from "@/lib/preview/buildPreview";
import { useToast } from "@/components/ui/Toaster";

const SEVERITY_ORDER: RiskSeverity[] = ["high", "medium", "low"];

function badgeStyles(s: RiskSeverity) {
  switch (s) {
    case "high": return "bg-red-600 text-white";
    case "medium": return "bg-amber-500 text-black";
    default: return "bg-gray-300 text-black";
  }
}
function label(s: RiskSeverity) {
  return s === "high" ? "Hoog" : s === "medium" ? "Middel" : "Laag";
}

export default function Risico() {
  const triage = useWizardState((s) => s.triage);
  const archetype = useWizardState((s) => s.archetype);
  const answers = useWizardState((s) => s.chapterAnswers);
  const { show } = useToast();

  const [filter, setFilter] = useState<RiskSeverity | "all">("all");

  const report = useMemo<RiskReport>(() => {
    const preview = buildPreview({ triage, chapterAnswers: answers });
    return scanRisks({
      triage,
      archetype,
      ruimtes: answers["ruimtes"] ?? [],
      wensen: answers["wensen"] ?? [],
      techniek: answers["techniek"] ?? undefined,
      duurzaamheid: answers["duurzaamheid"] ?? undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triage, archetype, answers]);

  const findings = useMemo(() => {
    const base = [...report.findings].sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity));
    return filter === "all" ? base : base.filter((f) => f.severity === filter);
  }, [report, filter]);

  const copyToClipboard = async () => {
    const lines = report.findings.map((f) => `• [${label(f.severity)}] ${f.title}: ${f.message}`);
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      show({ variant: "success", title: "Gekopieerd", description: "Risico-overzicht staat op je klembord." });
    } catch {
      show({ variant: "error", title: "Kopiëren mislukt", description: "Selecteer en kopieer handmatig." });
    }
  };

  const refresh = () => {
    // Recompute is al live; we geven een subtiele bevestiging
    show({ variant: "default", title: "Risico’s opnieuw gescand", description: "Gebaseerd op huidige invoer." });
  };

  const counts = {
    high: report.findings.filter((f) => f.severity === "high").length,
    medium: report.findings.filter((f) => f.severity === "medium").length,
    low: report.findings.filter((f) => f.severity === "low").length,
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Risico’s & aandachtspunten</h2>
          <p className="text-xs text-gray-600">
            Automatische checks op basis van je invoer. Gebruik dit als gesprekstarter; niets is definitief.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={refresh} className="px-3 py-2 border rounded">Opnieuw scannen</button>
          <button type="button" onClick={copyToClipboard} className="px-3 py-2 border rounded">Kopiëren</button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="px-2 py-1 rounded bg-gray-100">Totaal: {report.findings.length}</span>
        <span className="px-2 py-1 rounded bg-red-50 text-red-700">Hoog: {counts.high}</span>
        <span className="px-2 py-1 rounded bg-amber-50 text-amber-800">Middel: {counts.medium}</span>
        <span className="px-2 py-1 rounded bg-gray-50 text-gray-700">Laag: {counts.low}</span>

        <div className="ml-auto flex items-center gap-2">
          <label className="text-gray-600">Filter</label>
          <select
            className="border rounded px-2 py-1"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
          >
            <option value="all">Alles</option>
            <option value="high">Hoog</option>
            <option value="medium">Middel</option>
            <option value="low">Laag</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {findings.length === 0 ? (
          <div className="border rounded p-4 text-sm text-gray-600 bg-gray-50">
            Geen bevindingen in deze filter. Goed bezig!
          </div>
        ) : (
          findings.map((f) => (
            <article key={f.id} className="border rounded-lg bg-white shadow-sm p-4">
              <header className="flex items-start gap-2">
                <span className={`px-2 py-0.5 text-xs rounded ${badgeStyles(f.severity)}`}>{label(f.severity)}</span>
                <h3 className="font-medium">{f.title}</h3>
              </header>
              <p className="text-sm text-gray-700 mt-2">{f.message}</p>
              {f.related && f.related.length > 0 && (
                <p className="mt-2 text-xs text-gray-500">
                  Gerelateerd: {f.related.join(", ")}
                </p>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
