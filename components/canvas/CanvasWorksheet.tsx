'use client';

import React, { useMemo } from 'react';
import { useWizardState } from '@/lib/stores/useWizardState'; // optioneel; alles via ?. om crashes te voorkomen

// Kleine helper voor highlight van de "spotlight" (actief veld)
function Box({
  title,
  fieldId,
  activeFieldId,
  children,
}: {
  title: string;
  fieldId?: string;
  activeFieldId?: string;
  children?: React.ReactNode;
}) {
  const isActive = fieldId && activeFieldId && fieldId === activeFieldId;
  return (
    <section
      className={[
        'rounded-xl border bg-white p-4 shadow-sm',
        'border-[#0d3d4d]/10',
        isActive ? 'ring-2 ring-[#4db8ba]/40 animate-pulse' : '',
      ].join(' ')}
    >
      <header className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#0d3d4d]">{title}</h3>
        {isActive && (
          <span className="text-xs text-[#0d3d4d] bg-[#e6f4f5] rounded-full px-2 py-0.5">
            In focus
          </span>
        )}
      </header>
      <div className="text-sm text-gray-700">{children}</div>
    </section>
  );
}

export default function CanvasWorksheet() {
  // Selectors zijn optioneel (store mag ontbreken)
  const focusedField = useWizardState?.((s: any) => s.focusedField);
  const archetype = useWizardState?.((s: any) => s.archetype);
  const worksheet = useWizardState?.((s: any) => s.worksheet) || {};

  // Bepaal "currentFieldId" vanuit de store (als je dat hebt) — anders gebruiken we focusedField
  const activeFieldId = useMemo(() => {
    if (focusedField) return focusedField;
    // fallback: geen specifieke field focus
    return undefined;
  }, [focusedField]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-[#f3fafb] border border-[#0d3d4d]/10 p-4">
        <div className="text-sm text-gray-700">
          <div className="font-medium text-[#0d3d4d]">
            Canvas / Werkblad {archetype ? `· ${archetype}` : ''}
          </div>
          <div className="text-xs text-gray-500">
            Hier verschijnen de kernonderdelen van je PvE. Velden die via de chat in focus komen,
            lichten kort op.
          </div>
        </div>
      </div>

      <Box title="Projectbasis" fieldId="project.base" activeFieldId={activeFieldId}>
        <ul className="list-disc pl-5 space-y-1">
          <li>Projecttype: <em className="text-gray-600">{worksheet?.projectType ?? 'n.n.b.'}</em></li>
          <li>Locatie: <em className="text-gray-600">{worksheet?.location ?? 'n.n.b.'}</em></li>
          <li>Omvang: <em className="text-gray-600">{worksheet?.size ?? 'n.n.b.'}</em></li>
        </ul>
      </Box>

      <Box title="Budget" fieldId="budget.globalBudget" activeFieldId={activeFieldId}>
        <p>Globaal budget: <strong>{worksheet?.budget ?? 'n.n.b.'}</strong></p>
        <p className="text-xs text-gray-500 mt-1">
          Tip: ranges werken prima (bv. €200–300k). Dit helpt in prioritering en risico-inschatting.
        </p>
      </Box>

      <Box title="Ruimteprogramma" fieldId="requirements.rooms" activeFieldId={activeFieldId}>
        <ul className="list-disc pl-5 space-y-1">
          <li>Slaapkamers: <em className="text-gray-600">{worksheet?.rooms ?? 'n.n.b.'}</em></li>
          <li>Badkamers: <em className="text-gray-600">{worksheet?.baths ?? 'n.n.b.'}</em></li>
          <li>Keuken: <em className="text-gray-600">{worksheet?.kitchen ?? 'n.n.b.'}</em></li>
        </ul>
      </Box>

      <Box title="Risico’s" fieldId="risks.overview" activeFieldId={activeFieldId}>
        <p className="text-gray-700">
          Nog geen risicodata. Beantwoord een paar vragen in de chat, dan verschijnt hier een
          risicoprofiel met waarschuwingen en vervolgstappen.
        </p>
      </Box>

      <Box title="Preview PvE" fieldId="preview.report" activeFieldId={activeFieldId}>
        <p className="text-gray-700">
          Je voorlopige PvE-samenvatting komt hier. Je kunt op elk moment exporteren naar PDF
          (watermerk) of Premium PvE ontgrendelen.
        </p>
      </Box>
    </div>
  );
}
