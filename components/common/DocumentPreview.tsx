"use client";

import React, { useMemo, useState } from "react";
import { useWizardState } from "@/lib/stores/useWizardState";

/** Veilig waarde lezen uit genest object via pad "a.b.c" */
function get(obj: any, path: string, fallback?: any) {
  return path.split(".").reduce((o, k) => (o && k in o ? o[k] : undefined), obj) ?? fallback;
}

/** Probeer diverse bekende stores samen te voegen (defensief) */
function useWizardValues() {
  // Alles optioneel – we weten niet exact hoe je store heet
  const raw = useWizardState?.((s: any) => s) ?? {};
  // Meest voorkomende kandidaten:
  const values =
    raw.values ??
    raw.form ??
    raw.pve ??
    raw.answers ??
    raw.data ??
    raw; // als laatste redmiddel hele store

  return values ?? {};
}

/** Klein Labeled row */
function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-3 text-[13px] py-1.5">
      <div className="text-gray-500">{label}</div>
      <div className="col-span-2 text-gray-900">{value ?? <span className="text-gray-400">—</span>}</div>
    </div>
  );
}

/** DocumentPreview – compacte PvE/PDF-achtige samenvatting */
export default function DocumentPreview() {
  const vals = useWizardValues();
  const [showRaw, setShowRaw] = useState(false);

  // Koppel hier je eigen paden/veld-ids aan
  const model = useMemo(() => {
    return {
      project: {
        variant: get(vals, "intake.projectVariant") ?? get(vals, "project.type"),
        experience: get(vals, "intake.experience"),
        urgency: get(vals, "intake.urgency"),
        intent: get(vals, "intake.intent"),
      },
      budget: {
        global: get(vals, "budget.globalBudget") ?? get(vals, "budget.total"),
        ownFunds: get(vals, "budget.ownFunds") ?? get(vals, "budget.eigenInbreng"),
      },
      spaces: {
        bedrooms: get(vals, "requirements.rooms"),
        notes: get(vals, "requirements.notes") ?? get(vals, "ruimtes.notes"),
      },
      wishes: get(vals, "wensen.list") ?? get(vals, "wishes") ?? [],
      techniek: {
        energy: get(vals, "techniek.energyLabel") ?? get(vals, "installatie.energie"),
        ventilation: get(vals, "techniek.ventilation"),
      },
    };
  }, [vals]);

  const hasAny =
    model.project.variant ||
    model.budget.global ||
    model.spaces.bedrooms ||
    (Array.isArray(model.wishes) && model.wishes.length > 0) ||
    model.techniek.energy ||
    model.techniek.ventilation;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-[var(--brx-ink)]">Preview (live)</h4>
        <div className="flex items-center gap-2">
          <button
            className="brx-pill text-xs"
            onClick={() => setShowRaw((v) => !v)}
            aria-pressed={showRaw}
            title="Toon ruwe data"
          >
            {showRaw ? "↩︎ Samenvatting" : "{} Ruwe data"}
          </button>
        </div>
      </div>

      {/* Samenvatting */}
      {!showRaw ? (
        <div className="rounded-xl border border-[var(--brx-ring)] bg-white p-3">
          {!hasAny ? (
            <div className="text-sm text-gray-500">
              Nog niets ingevuld. Vul velden in het midden; de preview werkt live mee.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {/* Project */}
              <div className="pb-2">
                <div className="text-[12px] font-semibold uppercase tracking-wide text-gray-500 mb-1">Project</div>
                <Row label="Variant"   value={model.project.variant} />
                <Row label="Ervaring"  value={model.project.experience} />
                <Row label="Urgentie"  value={model.project.urgency} />
                <Row label="Intentie"  value={model.project.intent} />
              </div>

              {/* Budget */}
              <div className="py-2">
                <div className="text-[12px] font-semibold uppercase tracking-wide text-gray-500 mb-1">Budget</div>
                <Row label="Globaal"   value={model.budget.global} />
                <Row label="Eigen inbreng" value={model.budget.ownFunds} />
              </div>

              {/* Ruimtes */}
              <div className="py-2">
                <div className="text-[12px] font-semibold uppercase tracking-wide text-gray-500 mb-1">Ruimtes</div>
                <Row label="Slaapkamers (min.)" value={model.spaces.bedrooms} />
                <Row label="Notities" value={model.spaces.notes} />
              </div>

              {/* Wensen */}
              {Array.isArray(model.wishes) && model.wishes.length > 0 && (
                <div className="py-2">
                  <div className="text-[12px] font-semibold uppercase tracking-wide text-gray-500 mb-1">Wensen</div>
                  <ul className="list-disc pl-5 text-[13px] text-gray-900">
                    {model.wishes.slice(0, 6).map((w: any, i: number) => (
                      <li key={i}>{typeof w === "string" ? w : w?.label ?? JSON.stringify(w)}</li>
                    ))}
                    {model.wishes.length > 6 && (
                      <li className="text-gray-500">… +{model.wishes.length - 6} meer</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Techniek */}
              {(model.techniek.energy || model.techniek.ventilation) && (
                <div className="pt-2">
                  <div className="text-[12px] font-semibold uppercase tracking-wide text-gray-500 mb-1">Techniek</div>
                  <Row label="Energie"      value={model.techniek.energy} />
                  <Row label="Ventilatie"   value={model.techniek.ventilation} />
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        // Ruwe data (debug)
        <pre className="rounded-xl border border-[var(--brx-ring)] bg-white p-3 text-xs overflow-auto max-h-64">
{JSON.stringify(vals, null, 2)}
        </pre>
      )}

      {/* Export-acties (optioneel, geen deps) */}
      <div className="flex items-center justify-end gap-2">
        <button
          className="brx-pill text-xs"
          onClick={() => {
            const blob = new Blob([JSON.stringify(vals ?? {}, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = "brikx-preview.json"; a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Exporteer JSON
        </button>
        <button
          className="brx-pill teal text-xs"
          onClick={async () => {
            try { await navigator.clipboard.writeText(document.querySelector("#brikx-preview-markdown")?.textContent ?? ""); }
            catch {}
          }}
          title="Kopieer Markdown"
        >
          Kopieer Markdown
        </button>
      </div>

      {/* Onzichtbare markdown (voor copy) */}
      <div id="brikx-preview-markdown" className="sr-only">
        {`# Brikx – Preview

**Project**
- Variant: ${model.project.variant ?? "-"}
- Ervaring: ${model.project.experience ?? "-"}
- Urgentie: ${model.project.urgency ?? "-"}
- Intentie: ${model.project.intent ?? "-"}

**Budget**
- Globaal: ${model.budget.global ?? "-"}
- Eigen inbreng: ${model.budget.ownFunds ?? "-"}

**Ruimtes**
- Slaapkamers (min.): ${model.spaces.bedrooms ?? "-"}
- Notities: ${model.spaces.notes ?? "-"}

**Wensen**
${Array.isArray(model.wishes) && model.wishes.length ? model.wishes.map((w:any)=>`- ${typeof w==="string"?w:(w?.label??JSON.stringify(w))}`).join("\n") : "-"}
`}
      </div>
    </div>
  );
}
