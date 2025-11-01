// components/wizard/PvEPreview.tsx
"use client";

import { useMemo } from "react";
import { useWizardState } from "@/lib/stores/useWizardState";
import { buildPreview } from "@/lib/preview/buildPreview";

// Tolerante mapping: accepteer string | undefined
function priorityLabel(p?: string) {
  switch (p) {
    case "must": return "Must-have";
    case "nice": return "Nice-to-have";
    case "future": return "Toekomst";
    case "unknown": return "Weet ik nog niet / n.v.t.";
    default: return "—";
  }
}

export default function PvEPreview() {
  const triage = useWizardState((s) => s.triage);
  const chapterAnswers = useWizardState((s) => s.chapterAnswers);

  const pv = useMemo(() => {
    if (!triage) return null;

    const safeChapterAnswers: Record<string, any> = chapterAnswers ?? {};

    // ✅ Transform triage to match buildPreview expectations
    return buildPreview({
      triage: {
        projectType: triage.projectType ? [triage.projectType as any] : [],
        projectSize: triage.projectSize as any,
        urgency: triage.urgency as any,
      },
      chapterAnswers: safeChapterAnswers,
    });
  }, [triage, chapterAnswers]);

  if (!pv) return null;

  return (
    <aside className="w-full md:w-[360px] md:sticky md:top-6 border rounded-2xl shadow-sm bg-white">
      <header className="px-4 py-3 border-b rounded-t-2xl bg-gray-50">
        <h3 className="text-sm font-semibold">PvE Preview</h3>
        <p className="text-xs text-gray-600">Live samenvatting van je invoer</p>
      </header>

      <div className="divide-y">
        <section className="p-4 text-sm">
          <h4 className="font-medium mb-2">Projectbasis</h4>
          <ul className="space-y-1">
            <li><span className="text-gray-500">Type:</span> {pv.summary.projectType}</li>
            <li><span className="text-gray-500">Ervaring:</span> {pv.summary.ervaring}</li>
            <li><span className="text-gray-500">Intentie:</span> {pv.summary.intent}</li>
            <li><span className="text-gray-500">Urgentie:</span> {pv.summary.urgentie}</li>
            <li><span className="text-gray-500">Budget:</span> {pv.summary.budget}</li>
          </ul>
        </section>

        <section className="p-4 text-sm">
          <h4 className="font-medium mb-2">Ruimtes ({pv.ruimtes.length})</h4>
          {pv.ruimtes.length === 0 ? (
            <p className="text-gray-500 italic">Nog geen ruimtes toegevoegd.</p>
          ) : (
            <ul className="space-y-1">
              {pv.ruimtes.map((r) => (
                <li key={r.id} className="flex items-center justify-between">
                  <span>{r.type || "—"}</span>
                  <span className="text-xs text-gray-500">{r.tag}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="p-4 text-sm">
          <h4 className="font-medium mb-2">Wensen ({pv.wensen.length})</h4>
          {pv.wensen.length === 0 ? (
            <p className="text-gray-500 italic">Nog geen wensen toegevoegd.</p>
          ) : (
            <ul className="space-y-1">
              {pv.wensen.map((w) => (
                <li key={w.id} className="flex items-center justify-between">
                  <span className="truncate">{w.label}</span>
                  <span className="text-xs text-gray-500">{priorityLabel(w.priority)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="p-4 text-sm">
          <h4 className="font-medium mb-2">Techniek</h4>
          {!pv.techniek ? (
            <p className="text-gray-500 italic">Nog niet ingevuld.</p>
          ) : (
            <ul className="space-y-1">
              <li><span className="text-gray-500">Bouwmethode:</span> {pv.techniek.buildMethod}</li>
              <li><span className="text-gray-500">Ventilatie:</span> {pv.techniek.ventilation}</li>
              <li><span className="text-gray-500">Verwarming:</span> {pv.techniek.heating}</li>
              <li><span className="text-gray-500">Koeling:</span> {pv.techniek.cooling}</li>
              <li><span className="text-gray-500">PV:</span> {pv.techniek.pv}</li>
              <li><span className="text-gray-500">Rc-doel:</span> {pv.techniek.insulationTargetRc ?? "—"}</li>
            </ul>
          )}
        </section>

        <section className="p-4 text-sm">
          <h4 className="font-medium mb-2">Duurzaamheid</h4>
          {!pv.duurzaamheid ? (
            <p className="text-gray-500 italic">Nog niet ingevuld.</p>
          ) : (
            <ul className="space-y-1">
              <li><span className="text-gray-500">Focus:</span> {pv.duurzaamheid.focus}</li>
              <li><span className="text-gray-500">Materialen:</span> {pv.duurzaamheid.materials}</li>
              <li><span className="text-gray-500">Regenwater:</span> {pv.duurzaamheid.rainwater}</li>
              <li><span className="text-gray-500">Groendak:</span> {pv.duurzaamheid.greenRoof}</li>
              <li><span className="text-gray-500">EPC/BENG:</span> {pv.duurzaamheid.epcTarget ?? "—"}</li>
            </ul>
          )}
        </section>

        <section className="p-4 text-sm">
          <h4 className="font-medium mb-2">Aandachtspunten & toelichting</h4>
          {pv.remarks.length === 0 ? (
            <p className="text-gray-500 italic">Geen aanvullende opmerkingen.</p>
          ) : (
            <ul className="list-disc pl-4 space-y-1">
              {pv.remarks.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </aside>
  );
}
