"use client";

import { useMemo, useState } from "react";
import { useWizardState } from "@/lib/stores/useWizardState";
import { buildPreview } from "@/lib/preview/buildPreview";
import { printPreviewToPdf } from "@/lib/export/print";
import { computeEssentialIssues, type EssentialIssue } from "@/utils/essentials";
import { useToast } from "@/components/ui/Toaster";

export default function Preview() {
  const triage = useWizardState((s) => s.triage);
  const answers = useWizardState((s) => s.chapterAnswers);
  const archetype = useWizardState((s) => s.archetype);
  const goTo = useWizardState((s) => s.goToChapter);
  const { show } = useToast();

  const [showIssues, setShowIssues] = useState(true);

  const pv = useMemo(() => buildPreview({ triage, chapterAnswers: answers }), [triage, answers]);
  const essentials = useMemo<EssentialIssue[]>(
    () => computeEssentialIssues({ triage, archetype, answers }),
    [triage, archetype, answers]
  );

  const handleSend = () => {
    const issuesNow = computeEssentialIssues({ triage, archetype, answers });
    if (issuesNow.length > 0) {
      setShowIssues(true);
      show({
        variant: "warning",
        title: "Nog niet compleet",
        description: "Er missen nog essentiële zaken. Bekijk de lijst hieronder.",
      });
      return;
    }
    show({ variant: "success", title: "Verstuurd", description: "Je PvE is compleet en is verstuurd. (Demo)" });
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify({ triage, answers, preview: pv }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "brikx-pve.json";
    a.click();
    URL.revokeObjectURL(url);
    show({ variant: "success", title: "JSON gedownload" });
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Preview & Versturen</h2>
          <p className="text-xs text-gray-600">
            Controleer je gegevens. Alleen bij <em>Preview</em>/<em>Versturen</em> tonen we wat nog echt nodig is.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="px-3 py-2 border rounded" onClick={() => { printPreviewToPdf(pv); }}>
            Download als PDF
          </button>
          <button type="button" className="px-3 py-2 border rounded" onClick={downloadJson}>
            Download JSON
          </button>
          <button type="button" className="px-3 py-2 border rounded bg-black text-white" onClick={handleSend}>
            Verstuur
          </button>
        </div>
      </header>

      {showIssues && (
        <div className="border rounded-lg bg-amber-50 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-amber-900">Essentiële onderdelen om nog aan te vullen</h3>
            <button className="text-xs underline text-amber-900" onClick={() => setShowIssues(false)}>Verbergen</button>
          </div>
          {essentials.length === 0 ? (
            <p className="text-sm text-amber-900 mt-2">Alles lijkt ingevuld. Je kunt gerust versturen of exporteren.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {essentials.map((e) => (
                <li key={e.id} className="bg-white/70 border rounded p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{e.title}</p>
                      <p className="text-sm text-gray-700 mt-0.5">{e.message}</p>
                    </div>
                    {linkFor(e)?.label && (
                      <button
                        type="button"
                        className="text-xs px-2 py-1 border rounded"
                        onClick={() => goTo(linkFor(e)!.chapter)}
                      >
                        Naar {linkFor(e)!.label}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="border rounded-lg p-4 bg-white">
        <h3 className="font-medium mb-2">Samenvatting (kort)</h3>
        <ul className="text-sm space-y-1">
          <li><span className="text-gray-500">Type:</span> {pv.summary.projectType}</li>
          <li><span className="text-gray-500">Intentie:</span> {pv.summary.intent}</li>
          <li><span className="text-gray-500">Budget:</span> {pv.summary.budget}</li>
          <li><span className="text-gray-500">Ruimtes:</span> {pv.ruimtes.length}</li>
          <li><span className="text-gray-500">Wensen:</span> {pv.wensen.length}</li>
          <li><span className="text-gray-500">Techniek:</span> {pv.techniek ? "ingevuld" : "—"}</li>
        </ul>
        {pv.remarks.length > 0 && (
          <div className="mt-3">
            <p className="text-sm text-gray-600">Aandachtspunten: {pv.remarks.length} item(s)</p>
          </div>
        )}
      </div>
    </section>
  );
}

function linkFor(e: EssentialIssue): { chapter: any; label: string } | null {
  const rel = e.related?.[0] ?? "";
  if (rel.startsWith("basis.")) return { chapter: "basis", label: "Basis" };
  if (rel === "ruimtes") return { chapter: "ruimtes", label: "Ruimtes" };
  if (rel === "wensen") return { chapter: "wensen", label: "Wensen" };
  if (rel === "techniek") return { chapter: "techniek", label: "Techniek" };
  if (rel === "intake.archetype") return { chapter: "basis", label: "Archetype" };
  return null;
}
