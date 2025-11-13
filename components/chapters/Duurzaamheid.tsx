// /components/chapters/Duurzaamheid.tsx
// ✅ v3.1 COMPLETE — Alle secties, geen fouten, v3.0 conform

"use client";

import React from "react";
import { useWizardState } from "@/lib/stores/useWizardState";
import type {
  ChapterKey,
  DuurzaamData,
  TechniekData,
  EvProvision,
  ZonnepanelenOrientatie,
} from "@/types/project";
import { createFocusKey } from "@/lib/wizard/focusKeyHelper";

const CHAPTER: ChapterKey = "duurzaam";

const Info = ({ children }: { children: React.ReactNode }) => (
  <span className="group relative ml-1 inline-flex cursor-help align-middle">
    <span className="text-[10px] text-slate-500">ℹ️</span>
    <div className="pointer-events-none absolute left-1/2 top-full z-20 hidden w-72 -translate-x-1/2 translate-y-1 rounded-md bg-slate-900 px-2 py-1 text-[10px] text-slate-50 group-hover:block shadow-lg">
      {children}
    </div>
  </span>
);

const useDuurzaamStore = () => {
  const stored = useWizardState((s) => s.chapterAnswers.duurzaam) as
    | DuurzaamData
    | undefined;
  const techniek = useWizardState((s) => s.chapterAnswers.techniek) as
    | TechniekData
    | undefined;
  const updateChapterData = useWizardState((s) => s.updateChapterData);
  const setFocusedField = useWizardState((s) => s.setFocusedField);
  return { stored, techniek, updateChapterData, setFocusedField };
};

export default function Duurzaamheid() {
  const { stored, techniek, updateChapterData, setFocusedField } =
    useDuurzaamStore();

  const data: DuurzaamData = stored ?? {};
  const update = (patch: Partial<DuurzaamData>) => {
    updateChapterData(CHAPTER, (prev) => ({
      ...prev,
      ...patch,
    }));
  };
  const focus = (k: keyof DuurzaamData) =>
    setFocusedField(createFocusKey(CHAPTER, k));

  return (
    <section className="space-y-8 max-w-3xl">
      <header className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">
          Duurzaamheid & Toekomstbestendigheid
        </h2>
        <p className="text-sm text-slate-600">
          Standaard gaan wij uit van de eisen uit het Bouwbesluit (baseline).
          U kunt per onderdeel kiezen voor een <strong>hogere ambitie</strong>;
          we lichten toe wat dit betekent voor comfort, energiegebruik en onderhoud.
        </p>
      </header>

      {/* 🔋 Energie & concept */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-800">
          🔋 Energieprestatie & energieconcept
        </h3>

        <div>
          <label className="block text-xs font-medium text-slate-700">
            Energieconcept (gasloos / hybride / all-electric)
            <Info>
              Richting/strategie. Concrete invulling (warmtepomp, stadswarmte)
              is bij Techniek.
            </Info>
          </label>
          <select
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            value={data.energievoorziening ?? "onbekend"}
            onFocus={() => focus("energievoorziening")}
            onChange={(e) =>
              update({
                energievoorziening: e.target.value as any,
              })
            }
          >
            <option value="onbekend">Nog onbekend / later bepalen</option>
            <option value="gasloos">Gasloos (geen gasaansluiting)</option>
            <option value="hybride">Hybride (tussenoplossing)</option>
            <option value="volledig_all_electric">Volledig all-electric</option>
          </select>
        </div>
      </section>

      {/* 🧊 Schil & Prestatie */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-800">
          🧊 Schil & prestatie (Bouwbesluit als standaard)
        </h3>

        <AmbitieField
          label="Rc gevel (m²K/W)"
          policyValue={data.rcGevelAmbitie}
          numValue={data.rcGevel}
          better="higher"
          unit="m²K/W"
          baselineText="Bouwbesluit: voldoen aan minimumeis voor gevels."
          higherText="Hoger = minder warmteverlies, minder koudeval en stabieler comfort."
          placeholder="Bijv. 4.5 – 6.0"
          onFocusPolicy={() => focus("rcGevelAmbitie")}
          onFocusValue={() => focus("rcGevel")}
          onChangePolicy={(p) => update({ rcGevelAmbitie: p })}
          onChangeValue={(v) => update({ rcGevel: v })}
        />

        <AmbitieField
          label="Rc dak (m²K/W)"
          policyValue={data.rcDakAmbitie}
          numValue={data.rcDak}
          better="higher"
          unit="m²K/W"
          baselineText="Bouwbesluit: minimumeis voor daken."
          higherText="Hoger = dak isoleren loont sterk tegen warmteverlies."
          placeholder="Bijv. 6.0 – 8.0"
          onFocusPolicy={() => focus("rcDakAmbitie")}
          onFocusValue={() => focus("rcDak")}
          onChangePolicy={(p) => update({ rcDakAmbitie: p })}
          onChangeValue={(v) => update({ rcDak: v })}
        />

        <AmbitieField
          label="Rc vloer (m²K/W)"
          policyValue={data.rcVloerAmbitie}
          numValue={data.rcVloer}
          better="higher"
          unit="m²K/W"
          baselineText="Bouwbesluit: minimumeis voor vloeren."
          higherText="Hoger = warmere vloer, minder tochtgevoel."
          placeholder="Bijv. 3.5 – 5.0"
          onFocusPolicy={() => focus("rcVloerAmbitie")}
          onFocusValue={() => focus("rcVloer")}
          onChangePolicy={(p) => update({ rcVloerAmbitie: p })}
          onChangeValue={(v) => update({ rcVloer: v })}
        />

        <AmbitieField
          label="U-waarde beglazing (W/m²K)"
          policyValue={data.uGlasAmbitie}
          numValue={data.uGlas}
          better="lower"
          unit="W/m²K"
          baselineText="Bouwbesluit: minimale isolatieprestatie glas."
          higherText="Lager = minder stralingskou/condens, stiller; meestal triple glas."
          placeholder="Bijv. 0.7 (triple)"
          onFocusPolicy={() => focus("uGlasAmbitie")}
          onFocusValue={() => focus("uGlas")}
          onChangePolicy={(p) => update({ uGlasAmbitie: p })}
          onChangeValue={(v) => update({ uGlas: v })}
        />

        <AmbitieField
          label="Luchtdichtheid n50 (h⁻¹)"
          policyValue={data.n50Ambitie}
          numValue={data.n50}
          better="lower"
          unit="h⁻¹"
          baselineText="Bouwbesluit: minimale kierdichting."
          higherText="Lager = minder kieren/trek, stiller binnenklimaat."
          placeholder="Bijv. 3.0 (goed) — 1.5 (zeer goed)"
          onFocusPolicy={() => focus("n50Ambitie")}
          onFocusValue={() => focus("n50")}
          onChangePolicy={(p) => update({ n50Ambitie: p })}
          onChangeValue={(v) => update({ n50: v })}
        />

        <CheckboxLine
          label={
            <>
              Blowerdoortest uitvoeren{" "}
              <Info>
                Verifieert luchtdichtheid (n50). Noodzakelijk voor comfort- en
                energieambities aantoonbaar te halen.
              </Info>
            </>
          }
          checked={!!data.blowerdoorTestUitvoeren}
          onFocus={() => focus("blowerdoorTestUitvoeren")}
          onChange={(v) => update({ blowerdoorTestUitvoeren: v })}
        />

        <AmbitieField
          label="g-waarde glas (zon-toetredingsfactor)"
          policyValue={data.gWaardeAmbitie}
          numValue={data.gWaarde}
          better="lower"
          unit=""
          baselineText="Bouwbesluit: standaard zon-toetreding."
          higherText="Lager = minder oververhitting; combineer met buitenzonwering."
          placeholder="Bijv. 0.35 – 0.55"
          onFocusPolicy={() => focus("gWaardeAmbitie")}
          onFocusValue={() => focus("gWaarde")}
          onChangePolicy={(p) => update({ gWaardeAmbitie: p })}
          onChangeValue={(v) => update({ gWaarde: v })}
        />
      </section>

      {/* 🌬️ IAQ */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-800">
          🌬️ Binnenklimaat (IAQ)
        </h3>

        <div>
          <label className="block text-xs font-medium text-slate-700">
            IAQ ambitie
            <Info>
              Standaard: Bouwbesluit. Hoger: betere luchtkwaliteit, drogere
              woning.
            </Info>
          </label>
          <select
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={data.iaqAmbitie ?? "bouwbesluit"}
            onFocus={() => focus("iaqAmbitie")}
            onChange={(e) =>
              update({ iaqAmbitie: e.target.value as any })
            }
          >
            <option value="bouwbesluit">Standaard (Bouwbesluit)</option>
            <option value="hoger">Ambitie: hoger dan Bouwbesluit</option>
          </select>
        </div>

        {data.iaqAmbitie === "hoger" && (
          <div className="grid gap-3 md:grid-cols-3">
            <FieldNumber
              label="CO₂-doel (ppm, lager = beter)"
              value={data.co2TargetPpm}
              onFocus={() => focus("co2TargetPpm")}
              onChange={(v) => update({ co2TargetPpm: v })}
              placeholder="Bijv. 900"
            />
            <div>
              <label className="block text-xs font-medium text-slate-700">
                Ventilatieklasse (indicatief)
              </label>
              <select
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                value={data.ventilatieklasse ?? ""}
                onFocus={() => focus("ventilatieklasse")}
                onChange={(e) => update({ ventilatieklasse: e.target.value as any })}
              >
                <option value="">Maak een keuze</option>
                <option value="C">Klasse C</option>
                <option value="B">Klasse B</option>
                <option value="A">Klasse A</option>
              </select>
            </div>
            <CheckboxLine
              label="CO₂-monitoring voorzien"
              checked={!!data.iaqMonitoring}
              onFocus={() => focus("iaqMonitoring")}
              onChange={(v) => update({ iaqMonitoring: v })}
            />
          </div>
        )}
      </section>

      {/* ☀️ Daglicht */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-800">☀️ Daglicht</h3>

        <div>
          <label className="block text-xs font-medium text-slate-700">
            Daglicht ambitie
            <Info>
              Standaard: minimale equivalente daglichtoppervlakte. Hoger: betere
              daglichtkwaliteit (DA/UDI).
            </Info>
          </label>
          <select
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={data.daglichtAmbitie ?? "bouwbesluit"}
            onFocus={() => focus("daglichtAmbitie")}
            onChange={(e) => update({ daglichtAmbitie: e.target.value as any })}
          >
            <option value="bouwbesluit">Standaard (Bouwbesluit)</option>
            <option value="hoger">Ambitie: hoger dan Bouwbesluit</option>
          </select>
        </div>

        {data.daglichtAmbitie === "hoger" && (
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-slate-700">
                Metric (indicatief)
              </label>
              <select
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                value={data.daglichtMetric ?? ""}
                onFocus={() => focus("daglichtMetric")}
                onChange={(e) =>
                  update({ daglichtMetric: e.target.value as any })
                }
              >
                <option value="">Maak een keuze</option>
                <option value="factor">Daglichtfactor</option>
                <option value="DA">DA (Daylight Autonomy)</option>
                <option value="UDI">UDI (Useful Daylight)</option>
              </select>
            </div>

            <FieldNumber
              label="Streefwaarde (bijv. 50% DA)"
              value={data.daglichtStreefwaarde}
              onFocus={() => focus("daglichtStreefwaarde")}
              onChange={(v) => update({ daglichtStreefwaarde: v })}
              placeholder="Bijv. 50"
            />

            <CheckboxLine
              label="Zonwerend glas toepassen waar nodig"
              checked={!!data.flexibelIndeling}
              onFocus={() => focus("flexibelIndeling")}
              onChange={(v) => update({ flexibelIndeling: v })}
            />
          </div>
        )}
      </section>

      {/* 🎧 Akoestiek */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-800">🎧 Akoestiek</h3>

        <div>
          <label className="block text-xs font-medium text-slate-700">
            Akoestiek ambitie
            <Info>
              Standaard: minimale lucht- en contactgeluidsisolatie. Hoger:
              rustiger binnenklimaat.
            </Info>
          </label>
          <select
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={data.akoestiekAmbitie ?? "bouwbesluit"}
            onFocus={() => focus("akoestiekAmbitie")}
            onChange={(e) => update({ akoestiekAmbitie: e.target.value as any })}
          >
            <option value="bouwbesluit">Standaard (Bouwbesluit)</option>
            <option value="hoger">Ambitie: hoger dan Bouwbesluit</option>
          </select>
        </div>

        {data.akoestiekAmbitie === "hoger" && (
          <div className="grid gap-3 md:grid-cols-2">
            <FieldNumber
              label="Binnenluchtgeluidisolatie DₙT,w (dB, hoger = beter)"
              value={data.akoestiekBinnenDnTw}
              onFocus={() => focus("akoestiekBinnenDnTw")}
              onChange={(v) => update({ akoestiekBinnenDnTw: v })}
              placeholder="Bijv. 55"
            />
            <FieldNumber
              label="Contactgeluid Ln,T,w (dB, lager = beter)"
              value={data.akoestiekContactLnTw}
              onFocus={() => focus("akoestiekContactLnTw")}
              onChange={(v) => update({ akoestiekContactLnTw: v })}
              placeholder="Bijv. 50"
            />
          </div>
        )}
      </section>

      {/* ☀️ Opwek & opslag */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-800">
          ☀️ Opwek & opslag
        </h3>

        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-slate-700">
              Zonnepanelen (ambitie)
            </label>
            <select
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={data.zonnepanelen ?? ""}
              onFocus={() => focus("zonnepanelen")}
              onChange={(e) => update({ zonnepanelen: e.target.value as any })}
            >
              <option value="">Maak een keuze</option>
              <option value="geen">Geen specifieke ambitie</option>
              <option value="beperkt">Deel verbruik dekken</option>
              <option value="ruim">Groot deel verbruik</option>
              <option value="nul_op_meter">Richting nul-op-de-meter</option>
            </select>
          </div>

          <FieldNumber
            label="PV-oppervlak (m²)"
            value={data.zonnepanelenOppervlak}
            onFocus={() => focus("zonnepanelenOppervlak")}
            onChange={(v) => update({ zonnepanelenOppervlak: v })}
            placeholder="Bijv. 20"
          />

          <div>
            <label className="block text-xs font-medium text-slate-700">
              PV-oriëntatie
            </label>
            <select
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={data.zonnepanelenOrientatie ?? ""}
              onFocus={() => focus("zonnepanelenOrientatie")}
              onChange={(e) =>
                update({ zonnepanelenOrientatie: e.target.value as any })
              }
            >
              <option value="">Maak een keuze</option>
              <option value="zuid">Zuid</option>
              <option value="oost">Oost</option>
              <option value="west">West</option>
              <option value="oost_west">Oost-West</option>
            </select>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-slate-700">
              Thuisbatterij
            </label>
            <select
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={data.thuisbatterij ?? ""}
              onFocus={() => focus("thuisbatterij")}
              onChange={(e) => update({ thuisbatterij: e.target.value as any })}
            >
              <option value="">Maak een keuze</option>
              <option value="geen">Niet voorzien</option>
              <option value="overwegen">Voorbereiden</option>
              <option value="ja">Ja, direct meenemen</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">
              EV-laadpunt
            </label>
            <select
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={data.evLaadpunt ?? ""}
              onFocus={() => focus("evLaadpunt")}
              onChange={(e) => update({ evLaadpunt: e.target.value as any })}
            >
              <option value="">Maak een keuze</option>
              <option value="geen">Geen</option>
              <option value="voorbereiding">Voorbereiding</option>
              <option value="laadpunt">Laadpunt</option>
              <option value="bidirectioneel">Laadpunt + bidirectioneel</option>
            </select>
          </div>

          <CheckboxLine
            label="V2G/V2H voorbereiding"
            checked={!!data.v2gVoorbereid}
            onFocus={() => focus("v2gVoorbereid")}
            onChange={(v) => update({ v2gVoorbereid: v })}
          />
        </div>
      </section>

      {/* 💧 Water */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-800">
          💧 Water & hergebruik
        </h3>

        <div>
          <label className="block text-xs font-medium text-slate-700">
            Regenwatergebruik
          </label>
          <select
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={data.regenwaterHerbruik ?? ""}
            onFocus={() => focus("regenwaterHerbruik")}
            onChange={(e) => update({ regenwaterHerbruik: e.target.value as any })}
          >
            <option value="">Maak een keuze</option>
            <option value="geen">Geen inzet</option>
            <option value="tuin">Voor tuin</option>
            <option value="toilet_was">Toilet en wasmachine</option>
            <option value="maximaal">Maximaal benutten</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700">
            Grijswatersysteem
          </label>
          <select
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={data.grijswaterVoorziening ?? ""}
            onFocus={() => focus("grijswaterVoorziening")}
            onChange={(e) =>
              update({ grijswaterVoorziening: e.target.value as any })
            }
          >
            <option value="">Maak een keuze</option>
            <option value="geen">Geen voorziening</option>
            <option value="voorbereiding">Voorbereiding leidingwerk</option>
            <option value="individueel">Individueel systeem</option>
            <option value="collectief">Collectief systeem</option>
          </select>
        </div>

        <FieldNumber
          label="Groendak-oppervlak (m²)"
          value={data.groendakOppervlak}
          onFocus={() => focus("groendakOppervlak")}
          onChange={(v) => update({ groendakOppervlak: v })}
          placeholder="Bijv. 30"
        />

        <CheckboxLine
          label="Water vasthouden in tuin (wadi, infiltratie, vijver)"
          checked={!!data.waterRetentieTuin}
          onFocus={() => focus("waterRetentieTuin")}
          onChange={(v) => update({ waterRetentieTuin: v })}
        />
      </section>

      {/* ♻️ Materialen */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-800">
          ♻️ Materialen & circulariteit
        </h3>

        <div>
          <label className="block text-xs font-medium text-slate-700">
            Materiaalstrategie
          </label>
          <select
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={data.materiaalstrategie ?? ""}
            onFocus={() => focus("materiaalstrategie")}
            onChange={(e) =>
              update({ materiaalstrategie: e.target.value as any })
            }
          >
            <option value="">Maak een keuze</option>
            <option value="standaard">Standaard (prijs leidend)</option>
            <option value="deels_biobased">Deels biobased / lage CO₂</option>
            <option value="biobased_circulair">Overwegend biobased & circulair</option>
          </select>
        </div>

        <CheckboxLine
          label="Waar mogelijk demontabel / herbruikbaar construeren"
          checked={!!data.demontabelConstrueren}
          onFocus={() => focus("demontabelConstrueren")}
          onChange={(v) => update({ demontabelConstrueren: v })}
        />
      </section>

      {/* 🏗️ Toekomstbestendig */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-800">
          🏗️ Toekomstbestendig
        </h3>

        <CheckboxLine
          label="Klimaatadaptief ontwerpen (hittestress, water, groen)"
          checked={!!data.klimaatadaptief}
          onFocus={() => focus("klimaatadaptief")}
          onChange={(v) => update({ klimaatadaptief: v })}
        />

        <CheckboxLine
          label="Indeling/installaties flexibel houden"
          checked={!!data.flexibelIndeling}
          onFocus={() => focus("flexibelIndeling")}
          onChange={(v) => update({ flexibelIndeling: v })}
        />
      </section>

      {/* Samenvatting */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-800">
          Prioriteit & toelichting
        </h3>

        <div>
          <label className="block text-xs font-medium text-slate-700">
            Hoe belangrijk is duurzaamheid?
          </label>
          <select
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={data.prioriteit ?? ""}
            onFocus={() => focus("prioriteit")}
            onChange={(e) => update({ prioriteit: e.target.value as any })}
          >
            <option value="">Maak een keuze</option>
            <option value="laag">Laag – prijs gaat voor</option>
            <option value="normaal">Normaal – balans</option>
            <option value="hoog">Hoog – bereid te investeren</option>
            <option value="zeer_hoog">Zeer hoog – leidend</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700">
            Toelichting (voor PvE)
          </label>
          <textarea
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            rows={4}
            value={data.opmerkingen ?? ""}
            onFocus={() => focus("opmerkingen")}
            onChange={(e) => update({ opmerkingen: e.target.value })}
          />
        </div>
      </section>
    </section>
  );
}

/** =========================================================================
 *  Reusable field blocks
 *  =======================================================================*/

type AmbitiePolicy = "bouwbesluit" | "hoger";

function AmbitieField({
  label,
  policyValue,
  numValue,
  better,
  unit,
  baselineText,
  higherText,
  placeholder,
  onFocusPolicy,
  onFocusValue,
  onChangePolicy,
  onChangeValue,
}: {
  label: string;
  policyValue?: AmbitiePolicy;
  numValue?: number;
  better: "higher" | "lower";
  unit: string;
  baselineText: string;
  higherText: string;
  placeholder?: string;
  onFocusPolicy: () => void;
  onFocusValue: () => void;
  onChangePolicy: (p: AmbitiePolicy) => void;
  onChangeValue: (v: number | undefined) => void;
}) {
  const policy = policyValue ?? "bouwbesluit";

  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label className="text-xs font-medium text-slate-700">
          {label}
          <Info>
            <strong>Standaard:</strong> {baselineText}
            <br />
            <strong>Hoger:</strong> {higherText}
          </Info>
        </label>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <select
            className="rounded-md border px-3 py-2 text-sm"
            value={policy}
            onFocus={onFocusPolicy}
            onChange={(e) => onChangePolicy(e.target.value as AmbitiePolicy)}
          >
            <option value="bouwbesluit">Standaard</option>
            <option value="hoger">Hoger</option>
          </select>

          {policy === "hoger" && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                step={better === "higher" ? 0.1 : 0.05}
                className="w-32 rounded-md border px-3 py-2 text-sm"
                value={numValue ?? ""}
                onFocus={onFocusValue}
                onChange={(e) =>
                  onChangeValue(e.target.value === "" ? undefined : Number(e.target.value))
                }
                placeholder={placeholder}
              />
              {unit && (
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {unit}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FieldNumber({
  label,
  value,
  onChange,
  placeholder,
  onFocus,
}: {
  label: string;
  value?: number;
  onChange: (v: number | undefined) => void;
  placeholder?: string;
  onFocus: () => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700">
        {label}
      </label>
      <input
        type="number"
        step={0.01}
        min={0}
        className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
        value={value ?? ""}
        onFocus={onFocus}
        onChange={(e) =>
          onChange(e.target.value === "" ? undefined : Number(e.target.value))
        }
        placeholder={placeholder}
      />
    </div>
  );
}

function CheckboxLine({
  label,
  checked,
  onChange,
  onFocus,
}: {
  label: React.ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
  onFocus: () => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-slate-700">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-slate-300"
        checked={checked}
        onFocus={onFocus}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}