// /components/chapters/Techniek.tsx
// ✅ v3.2 COMPLEET: ExpertCorner integratie, stabiele selectors, focus handlers, en v3.2 suggesties
// ✅ v3.3 WIJZIGING: 'Info' tooltip component toegevoegd en helper-functies hersteld

"use client";

import React, { useMemo, useEffect } from "react";
import { useWizardState } from "@/lib/stores/useWizardState";
import FocusTarget from "@/components/wizard/FocusTarget";
import type {
  ChapterKey,
  TechniekData,
  DuurzaamData,
  TechAmbition,
  LightingControlLevel,
  ShadingControl,
  SecurityAlarmType,
  ResistanceClass,
  NetworkBackbone,
} from "@/types/project"; // ✅ Gebruikt v3.2 types
import { createFocusKey } from "@/lib/wizard/focusKeyHelper";

const CHAPTER: ChapterKey = "techniek";

// ✅ HIER TOEGEVOEGD (gekopieerd uit Duurzaamheid.tsx)
const Info = ({ children }: { children: React.ReactNode }) => (
  <span className="group relative ml-1 inline-flex cursor-help align-middle">
    <span className="text-[10px] text-slate-500">ℹ️</span>
    <div className="pointer-events-none absolute left-1/2 top-full z-20 hidden w-72 -translate-x-1/2 translate-y-1 rounded-md bg-slate-900 px-2 py-1 text-[10px] text-slate-50 group-hover:block shadow-lg">
      {children}
    </div>
  </span>
);

const AMBITION_OPTS: { value: TechAmbition; label: string }[] = [
  { value: "unknown", label: "Weet ik nog niet" },
  { value: "basis", label: "Basis (voldoen aan eisen)" },
  { value: "comfort", label: "Comfort (stiller, stabieler, zuiniger)" },
  { value: "max", label: "Maximaal (topniveau / zeer zuinig)" },
];

const CURRENT_STATE_OPTS = [
  { value: "unknown", label: "Nog onbekend" },
  { value: "bestaand_blijft", label: "Bestaand blijft grotendeels" },
  { value: "casco_aanpak", label: "Casco-aanpak / zware renovatie" },
  { value: "sloop_en_opnieuw", label: "Sloop en nieuwbouw" },
] as const;

const BUILD_METHOD_OPTS = [
  { value: "unknown", label: "Nog open / n.v.t." },
  { value: "traditioneel_baksteen", label: "Traditioneel (baksteen/beton)" },
  { value: "houtskeletbouw", label: "Houtskeletbouw" },
  { value: "staalframe", label: "Staalframe / licht bouwsysteem" },
  { value: "anders", label: "Anders / later bepalen" },
] as const;

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

// ✅ Stabiele selectors
const useTechniekStore = () => {
  const techniekStored = useWizardState(
    (s) => s.chapterAnswers.techniek
  ) as TechniekData | undefined;
  const duurzaam = useWizardState(
    (s) => s.chapterAnswers.duurzaam
  ) as DuurzaamData | undefined;
  const updateChapterData = useWizardState((s) => s.updateChapterData);
  const setCurrentChapter = useWizardState((s) => s.setCurrentChapter);
  const currentChapter = useWizardState((s) => s.currentChapter);
  const setFocusedField = useWizardState((s) => s.setFocusedField);

  // ✅ v3.1: Lees projectType uit basis chapter (Grondwet)
  const triageProjectType = useWizardState(
    (s) => s.chapterAnswers.basis?.projectType
  );

  return {
    techniekStored,
    duurzaam,
    updateChapterData,
    setCurrentChapter,
    currentChapter,
    setFocusedField,
    triageProjectType,
  };
};

export default function Techniek() {
  const {
    techniekStored,
    duurzaam,
    updateChapterData,
    setCurrentChapter,
    currentChapter,
    setFocusedField,
    triageProjectType,
  } = useTechniekStore();

  // ✅ v3.2: Standaardwaarden (kunnen worden uitgebreid met nieuwe velden)
  const data: TechniekData = {
    ventilationAmbition: "unknown",
    heatingAmbition: "unknown",
    coolingAmbition: "unknown",
    pvAmbition: "unknown",
    showAdvanced: false,
    ...techniekStored,
  };

  // ✅ Loop-beveiliging
  useEffect(() => {
    if (currentChapter !== CHAPTER) {
      setCurrentChapter(CHAPTER);
    }
  }, [currentChapter, setCurrentChapter]);

  // ✅ Unified updater
  const update = (patch: Partial<TechniekData>) => {
    updateChapterData("techniek", (prev) => ({
      ventilationAmbition: "unknown",
      heatingAmbition: "unknown",
      coolingAmbition: "unknown",
      pvAmbition: "unknown",
      showAdvanced: prev.showAdvanced ?? data.showAdvanced ?? false,
      ...prev,
      ...patch,
    }));
  };

  // ✅ Focus handler voor ExpertCorner
  const handleFocus = (fieldId: keyof TechniekData) => {
    setFocusedField(createFocusKey(CHAPTER, fieldId));
  };

  const isRenovation = useMemo(
    () => triageProjectType === "verbouwing",
    [triageProjectType]
  );

  const isNewBuild = useMemo(
    () =>
      triageProjectType === "nieuwbouw" ||
      triageProjectType === "bijgebouw",
    [triageProjectType]
  );

  // ✅ v3.2: Gebruikt de gecorrigeerde suggestie-logica
  const suggestions = buildSuggestionsFromDuurzaam(duurzaam, data);

  return (
    <section className="space-y-6 max-w-3xl">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">Techniek</h2>
        <p className="text-sm text-slate-600">
          Eerst kiest u per onderdeel het ambitieniveau. Wie meer weet of
          specifieke voorkeuren heeft, kan hieronder{" "}
          <strong>geavanceerde opties</strong> openen en concrete systemen
          vastleggen.
        </p>
      </header>

      {/* Suggesties obv Duurzaamheid */}
      {suggestions.length > 0 && (
        <aside className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-[10px] text-emerald-900">
          <div className="mb-1 font-semibold">
            Voorstellen op basis van uw duurzaamheid-ambities:
          </div>
          <ul className="space-y-1">
            {suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <button
                  type="button"
                  onClick={() => update(s.patch)}
                  className="mt-0.5 rounded-full border border-emerald-500 px-2 py-0.5 text-[9px] font-medium text-emerald-700 hover:bg-emerald-100"
                >
                  Overnemen
                </button>
                <span>{s.label}</span>
              </li>
            ))}
          </ul>
          <p className="mt-1 text-[9px] text-emerald-800">
            U kunt deze keuzes altijd nog aanpassen. Niets gebeurt stiekem.
          </p>
        </aside>
      )}

      {/* Eenvoudige ambitie-keuzes */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FocusTarget chapter={CHAPTER} fieldId="ventilationAmbition">
          <fieldset className="rounded-xl border bg-white p-3">
            <legend className="mb-2 block text-sm font-medium">
              Ventilatie — ambitie
            </legend>
            <p className="mb-2 text-[10px] text-slate-500">
              Basis = voldoet aan eisen. Comfort/Maximaal = stiller,
              constanter binnenklimaat, vaak balansventilatie met WTW.
            </p>
            <AmbitionChips
              current={data.ventilationAmbition ?? "unknown"}
              onSelect={(v) => update({ ventilationAmbition: v })}
              onFocus={() => handleFocus("ventilationAmbition")}
            />
          </fieldset>
        </FocusTarget>

        <FocusTarget chapter={CHAPTER} fieldId="heatingAmbition">
          <fieldset className="rounded-xl border bg-white p-3">
            <legend className="mb-2 block text-sm font-medium">
              Verwarming — ambitie
            </legend>
            <p className="mb-2 text-[10px] text-slate-500">
              Maximaal sluit vaak aan bij lage-temperatuur + warmtepomp.
            </p>
            <AmbitionChips
              current={data.heatingAmbition ?? "unknown"}
              onSelect={(v) => update({ heatingAmbition: v })}
              onFocus={() => handleFocus("heatingAmbition")}
            />
          </fieldset>
        </FocusTarget>

        <FocusTarget chapter={CHAPTER} fieldId="coolingAmbition">
          <fieldset className="rounded-xl border bg-white p-3">
            <legend className="mb-2 block text-sm font-medium">
              Koeling — ambitie
            </legend>
            <p className="mb-2 text-[10px] text-slate-500">
              Basis = geen actieve koeling. Comfort/Maximaal = passief of
              actieve koeling via installaties.
            </p>
            <AmbitionChips
              current={data.coolingAmbition ?? "unknown"}
              onSelect={(v) => update({ coolingAmbition: v })}
              onFocus={() => handleFocus("coolingAmbition")}
            />
          </fieldset>
        </FocusTarget>

        <FocusTarget chapter={CHAPTER} fieldId="pvAmbition">
          <fieldset className="rounded-xl border bg-white p-3">
            <legend className="mb-2 block text-sm font-medium">
              Zonne-energie — ambitie
            </legend>
            <p className="mb-2 text-[10px] text-slate-500">
              Van geen panelen tot nul-op-de-meter ambitie.
            </p>
            <AmbitionChips
              current={data.pvAmbition ?? "unknown"}
              onSelect={(v) => update({ pvAmbition: v })}
              onFocus={() => handleFocus("pvAmbition")}
            />
          </fieldset>
        </FocusTarget>
      </div>

      {/* Context: bestaande staat / bouwmethode */}
      <div className="grid gap-4 sm:grid-cols-2">
        {isRenovation && (
          <FocusTarget chapter={CHAPTER} fieldId="currentState">
            <label className="block rounded-xl border bg-white p-3">
              <span className="mb-2 block text-sm font-medium">
                Huidige staat (indicatie)
              </span>
              <select
                className="w-full rounded border px-3 py-2 text-sm"
                value={data.currentState ?? "unknown"}
                onFocus={() => handleFocus("currentState")}
                onChange={(e) =>
                  update({
                    currentState: e.target.value as TechniekData["currentState"],
                  })
                }
              >
                {CURRENT_STATE_OPTS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </FocusTarget>
        )}

        {isNewBuild && (
          <FocusTarget chapter={CHAPTER} fieldId="buildMethod">
            <label className="block rounded-xl border bg-white p-3">
              <span className="mb-2 block text-sm font-medium">
                Bouwmethode (globaal)
              </span>
              <select
                className="w-full rounded border px-3 py-2 text-sm"
                value={data.buildMethod ?? "unknown"}
                onFocus={() => handleFocus("buildMethod")}
                onChange={(e) =>
                  update({
                    buildMethod: e.target.value as TechniekData["buildMethod"],
                  })
                }
              >
                {BUILD_METHOD_OPTS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </FocusTarget>
        )}
      </div>

      {/* Toggle advanced */}
      <div className="flex items-center gap-2">
        <input
          id="showAdvanced"
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300"
          checked={!!data.showAdvanced}
          onFocus={() => handleFocus("showAdvanced")}
          onChange={(e) => update({ showAdvanced: e.target.checked })}
        />
        <label htmlFor="showAdvanced" className="text-xs text-slate-700">
          Ik wil geavanceerde technische keuzes tonen
          (warmtepomp/WTW/EV-laadpunt/batterij, etc.)
        </label>
      </div>

      {/* Geavanceerde instellingen */}
      {data.showAdvanced && (
        <div className="space-y-4 rounded-xl border bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-800">
            Geavanceerde techniek-instellingen
          </h3>

          {/* Gas / verwarming */}
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-700">
                Gasaansluiting voorzien?
                <Info>
                  'Nee, gasloos' is de standaard bij nieuwbouw en noodzakelijk
                  voor een all-electric warmtepomp.
                </Info>
              </label>
              <select
                className="mt-1 w-full rounded border px-3 py-2 text-sm"
                onFocus={() => handleFocus("gasaansluiting")}
                value={
                  data.gasaansluiting === undefined
                    ? ""
                    : data.gasaansluiting
                    ? "ja"
                    : "nee"
                }
                onChange={(e) =>
                  update({
                    gasaansluiting:
                      e.target.value === ""
                        ? undefined
                        : e.target.value === "ja",
                  })
                }
              >
                <option value="">Nog onbekend</option>
                <option value="nee">Nee, gasloos</option>
                <option value="ja">Ja, gasaansluiting voorzien</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700">
                Verwarmingssysteem (voorkeur)
                <Info>
                  'Hybride' combineert gas met een elektrische pomp (tussenstap).
                  'All-electric' is volledig gasloos en vereist goede isolatie
                  en lage-temperatuur afgifte (zoals vloerverwarming).
                </Info>
              </label>
              <select
                className="mt-1 w-full rounded border px-3 py-2 text-sm"
                value={data.verwarming ?? "onbekend"}
                onFocus={() => handleFocus("verwarming")}
                onChange={(e) =>
                  update({
                    verwarming: e.target.value as TechniekData["verwarming"],
                  })
                }
              >
                <option value="onbekend">Nog onbekend</option>
                <option value="cv_gas">CV-ketel op gas</option>
                <option value="hybride_warmtepomp">
                  Hybride warmtepomp (gas + elektrisch)
                </option>
                <option value="all_electric_warmtepomp">
                  Volledig elektrische warmtepomp
                </option>
                <option value="stadswarmte">Stadswarmte / collectief</option>
                <option value="anders">Anders / in overleg</option>
              </select>
            </div>
          </div>

          {/* Afgiftesysteem */}
          <div>
            <label className="block text-xs font-medium text-slate-700">
              Afgiftesysteem
              <Info>
                'Lage temperatuur' (zoals vloerverwarming) is efficiënter en
                noodzakelijk voor de meeste warmtepompen. 'Hoge temperatuur'
                werkt met traditionele radiatoren en CV-ketels.
              </Info>
            </label>
            <select
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
              value={data.afgiftesysteem ?? "onbekend"}
              onFocus={() => handleFocus("afgiftesysteem")}
              onChange={(e) =>
                update({
                  afgiftesysteem: e.target.value as TechniekData["afgiftesysteem"],
                })
              }
            >
              <option value="onbekend">Nog onbekend</option>
              <option value="radiatoren_hoog_temp">
                Radiatoren (hoge temperatuur)
              </option>
              <option value="radiatoren_lage_temp">
                Radiatoren (lage temperatuur)
              </option>
              <option value="vloerverwarming">Vloerverwarming</option>
              <option value="vloer_wand_plafond">
                Vloer/wand/plafond lage temperatuur
              </option>
              <option value="anders">Anders / maatwerk</option>
            </select>
          </div>

          {/* Ventilatie */}
          <div>
            <label className="block text-xs font-medium text-slate-700">
              Ventilatiesysteem
              <Info>
                'Type C' voert mechanisch af en trekt verse lucht via roosters
                naar binnen. 'Balansventilatie (Type D)' regelt zowel aan- als
                afvoer en gebruikt een WTW (WarmteTerugWinning) om energie te
                besparen.
              </Info>
            </label>
            <select
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
              value={data.ventilatie ?? "onbekend"}
              onFocus={() => handleFocus("ventilatie")}
              onChange={(e) =>
                update({
                  ventilatie: e.target.value as TechniekData["ventilatie"],
                })
              }
            >
              <option value="onbekend">Nog onbekend</option>
              <option value="natuurlijk">
                Natuurlijke toevoer + mechanische afvoer
              </option>
              <option value="mechanisch_afvoer">
                Mechanische afvoer (type C)
              </option>
              <option value="balans_wtw">
                Balansventilatie met WTW (type D)
              </option>
            </select>
          </div>

          {/* Koeling */}
          <div>
            <label className="block text-xs font-medium text-slate-700">
              Koeling
              <Info>
                'Passieve koeling' richt zich op het buitenhouden van warmte
                (zonwering, isolatie). 'Actieve koeling' (via warmtepomp) kan
                de temperatuur actief verlagen.
              </Info>
            </label>
            <select
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
              value={data.koeling ?? "onbekend"}
              onFocus={() => handleFocus("koeling")}
              onChange={(e) =>
                update({
                  koeling: e.target.value as TechniekData["koeling"],
                })
              }
            >
              <option value="onbekend">Nog onbekend</option>
              <option value="geen">Geen actieve koeling voorzien</option>
              <option value="passieve_koeling">
                Passieve koeling (zonwering, massa, nachtventilatie)
              </option>
              <option value="actieve_koeling_warmtepomp">
                Actieve koeling via warmtepomp
              </option>
            </select>
          </div>

          {/* PV, batterij, EV */}
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-slate-700">
                PV-systeem (technische voorkeur)
                <Info>
                  PV staat voor 'Photovoltaïsch' (zonnepanelen). De keuze hangt
                  samen met uw ambitie uit het Duurzaamheid hoofdstuk.
                </Info>
              </label>
              <select
                className="mt-1 w-full rounded border px-3 py-2 text-sm"
                value={data.pvConfiguratie ?? "onbekend"}
                onFocus={() => handleFocus("pvConfiguratie")}
                onChange={(e) =>
                  update({
                    pvConfiguratie:
                      e.target.value as TechniekData["pvConfiguratie"],
                  })
                }
              >
                <option value="onbekend">Nog onbekend</option>
                <option value="geen">Geen PV</option>
                <option value="basis">Basis (deel verbruik)</option>
                <option value="uitgebreid">Uitgebreid</option>
                <option value="nul_op_de_meter">
                  Nul-op-de-meter gericht
                </option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">
                Thuisbatterij / opslag (technisch)
              </label>
              <select
                className="mt-1 w-full rounded border px-3 py-2 text-sm"
                value={data.batterijVoorziening ?? "geen"}
                onFocus={() => handleFocus("batterijVoorziening")}
                onChange={(e) =>
                  update({
                    batterijVoorziening:
                      e.target.value as TechniekData["batterijVoorziening"],
                  })
                }
              >
                <option value="geen">Geen voorziening</option>
                <option value="voorbereid">
                  Voorbereiding (ruimte/leidingen)
                </option>
                <option value="batterij_gepland">
                  Batterij voorzien in ontwerp
                </option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">
                EV-laadpunt
                <Info>
                  EV = Electric Vehicle. 'Bidirectioneel' betekent dat de
                  auto-accu ook stroom aan het huis kan terugleveren (V2H:
                  Vehicle-to-Home).
                </Info>
              </label>
              <select
                className="mt-1 w-full rounded border px-3 py-2 text-sm"
                value={data.evVoorziening ?? "geen"}
                onFocus={() => handleFocus("evVoorziening")}
                onChange={(e) =>
                  update({
                    evVoorziening:
                      e.target.value as TechniekData["evVoorziening"],
                  })
                }
              >
                <option value="geen">Geen</option>
                <option value="voorbereid">Voorbereiding</option>
                <option value="laadpunt">Laadpunt</option>
                <option value="laadpunt_bidirectioneel">
                  Laadpunt + bidirectioneel optie
                </option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 💡 --- NIEUWE v3.2 SECTIES --- 💡 */}

      {/* Domotica & Verlichting */}
      {data.showAdvanced && (
        <div className="space-y-4 rounded-xl border bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-800">
            Slimme Sturing, Verlichting & Zonwering
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-700">
                Verlichtingsplan
                <Info>
                  'Zones' (dimmers) is standaard. 'Scènes' zijn
                  voorgeprogrammeerde instellingen (bv. 'koken', 'lezen').
                  'Human Centric' past kleurtemperatuur aan op het
                  daglichtritme.
                </Info>
              </label>
              <select
                className="mt-1 w-full rounded border px-3 py-2 text-sm"
                value={data.lightingControl ?? "none"}
                onFocus={() => handleFocus("lightingControl")}
                onChange={(e) =>
                  update({
                    lightingControl: e.target.value as LightingControlLevel,
                  })
                }
              >
                <option value="none">Standaard (basis-schakeling)</option>
                <option value="zones">Werken met zones/dimmers</option>
                <option value="scenes">Scènes (geprogrammeerd)</option>
                <option value="human_centric">
                  Human Centric (daglicht-gestuurd)
                </option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">
                Zonwering (sturing)
                <Info>
                  Goede (buiten)zonwering is cruciaal tegen oververhitting.
                  Automatische sturing op basis van zon en temperatuur
                  verhoogt het comfort en verlaagt de koellast.
                </Info>
              </label>
              <select
                className="mt-1 w-full rounded border px-3 py-2 text-sm"
                value={data.shadingControl ?? "none"}
                onFocus={() => handleFocus("shadingControl")}
                onChange={(e) =>
                  update({
                    shadingControl: e.target.value as ShadingControl,
                  })
                }
              >
                <option value="none">Geen / handmatig</option>
                <option value="motor_manual">
                  Motor (met knop/afstandsbediening)
                </option>
                <option value="motor_sun_temp">
                  Automatisch (zon/temperatuur-gestuurd)
                </option>
                <option value="motor_domotica">
                  Volledig geïntegreerd in domotica
                </option>
              </select>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <CheckboxLine
              label="Aanwezigheidssensoren (licht/verwarming)"
              checked={!!data.presenceSensors}
              onFocus={() => handleFocus("presenceSensors")}
              onChange={(v) => update({ presenceSensors: v })}
            />
            <CheckboxLine
              label="Taakverlichting (keuken/werkplek) voorzien"
              checked={!!data.taskLighting}
              onFocus={() => handleFocus("taskLighting")}
              onChange={(v) => update({ taskLighting: v })}
            />
            <CheckboxLine
              label="Buitenzonwering voorzien (essentieel)"
              checked={!!data.externalShading}
              onFocus={() => handleFocus("externalShading")}
              onChange={(v) => update({ externalShading: v })}
            />
          </div>
        </div>
      )}

      {/* Beveiliging & Netwerk */}
      {data.showAdvanced && (
        <div className="space-y-4 rounded-xl border bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-800">
            Beveiliging & Netwerk
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-700">
                Alarmsysteem
                <Info>
                  'Connected' geeft u notificaties via een app. 'Monitored'
                  staat in verbinding met een externe meldkamer
                  (abonnement vereist).
                </Info>
              </label>
              <select
                className="mt-1 w-full rounded border px-3 py-2 text-sm"
                value={data.securityAlarm ?? "none"}
                onFocus={() => handleFocus("securityAlarm")}
                onChange={(e) =>
                  update({
                    securityAlarm: e.target.value as SecurityAlarmType,
                  })
                }
              >
                <option value="none">Geen</option>
                <option value="standalone">Standalone (lokaal alarm)</option>
                <option value="connected">Verbonden (app/notificaties)</option>
                <option value="monitored">Meldkamer (abonnement)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">
                Inbraakwerendheid (Hang/sluitwerk)
                <Info>
                  RC2 is de standaard voor het Politiekeurmerk Veilig Wonen. RC3
                  is een zwaardere klasse die meer tijd kost om te forceren.
                </Info>
              </label>
              <select
                className="mt-1 w-full rounded border px-3 py-2 text-sm"
                value={data.resistanceClass ?? "rc2"}
                onFocus={() => handleFocus("resistanceClass")}
                onChange={(e) =>
                  update({
                    resistanceClass: e.target.value as ResistanceClass,
                  })
                }
              >
                <option value="rc2">RC2 (Standaard / Politiekeurmerk)</option>
                <option value="rc3">RC3 (Verzwaard)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">
                Netwerk (Backbone)
                <Info>
                  Een bekabeld netwerk (Ethernet Cat6/6a) is altijd stabieler en
                  sneller dan WiFi. Essentieel voor vaste werkplekken, TV's en
                  toegangspunten voor 'Mesh WiFi'.
                </Info>
              </label>
              <select
                className="mt-1 w-full rounded border px-3 py-2 text-sm"
                value={data.networkBackbone ?? "none"}
                onFocus={() => handleFocus("networkBackbone")}
                onChange={(e) =>
                  update({
                    networkBackbone: e.target.value as NetworkBackbone,
                  })
                }
              >
                <option value="none">Geen / Alleen WiFi</option>
                <option value="ethernet_cat6">Ethernet (Cat6/6a)</option>
                <option value="fiber">Glasvezel intern</option>
              </select>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <CheckboxLine
              label="Camera-toezicht (CCTV)"
              checked={!!data.cctv}
              onFocus={() => handleFocus("cctv")}
              onChange={(v) => update({ cctv: v })}
            />
            <CheckboxLine
              label="Mesh WiFi (dekkend netwerk)"
              checked={!!data.meshWifi}
              onFocus={() => handleFocus("meshWifi")}
              onChange={(v) => update({ meshWifi: v })}
            />
            <CheckboxLine
              label="Bekabelde data-punten (werkplek/TV)"
              checked={!!data.wiredDrops}
              onFocus={() => handleFocus("wiredDrops")}
              onChange={(v) => update({ wiredDrops: v })}
            />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <CheckboxLine
              label="Gekoppelde rookmelders"
              checked={!!data.linkedSmokeDetectors}
              onFocus={() => handleFocus("linkedSmokeDetectors")}
              onChange={(v) => update({ linkedSmokeDetectors: v })}
            />
            <CheckboxLine
              label="CO-melders (bij verbranding)"
              checked={!!data.coDetectors}
              onFocus={() => handleFocus("coDetectors")}
              onChange={(v) => update({ coDetectors: v })}
            />
            <CheckboxLine
              label="Alarm integreert met App"
              checked={!!data.alarmAppIntegration}
              onFocus={() => handleFocus("alarmAppIntegration")}
              onChange={(v) => update({ alarmAppIntegration: v })}
            />
          </div>
        </div>
      )}

      {/* Notities */}
      <FocusTarget chapter={CHAPTER} fieldId="notes">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            Toelichting / aandachtspunten (voor PvE)
          </span>
          <textarea
            className="min-h-24 w-full rounded border px-3 py-2 text-sm"
            value={data.notes ?? ""}
            onFocus={() => handleFocus("notes")}
            onChange={(e) => update({ notes: e.target.value })}
            placeholder="Bijv.: voorkeur specifiek merk/type, geluidseisen, positie technische ruimte, onderhoud, etc."
          />
        </label>
      </FocusTarget>
    </section>
  );
}

// ✅ FIXED: AmbitionChips met onFocus prop
function AmbitionChips({
  current,
  onSelect,
  onFocus,
}: {
  current: TechAmbition;
  onSelect: (v: TechAmbition) => void;
  onFocus?: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" onFocus={onFocus}>
      {AMBITION_OPTS.map((opt) => {
        const active = current === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            className={cx(
              "rounded-full border px-3 py-1 text-xs transition",
              active
                ? "border-[#0d3d4d] bg-[#0d3d4d] text-white"
                : "border-slate-300 bg-white hover:bg-slate-50"
            )}
            aria-pressed={active}
            onFocus={onFocus}
            onClick={() => onSelect(opt.value)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ✅ v3.2: Helper component (NIEUW)
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

// ✅ v3.2: Gecorrigeerde suggestie-logica (o.b.v. uw review)
// HERSTELDE FUNCTIE
function buildSuggestionsFromDuurzaam(
  duurzaam: DuurzaamData | undefined,
  techniek: TechniekData
): { label: string; patch: Partial<TechniekData> }[] {
  if (!duurzaam) return [];
  const s: { label: string; patch: Partial<TechniekData> }[] = [];

  // ✅ Gasloos / all-electric
  if (
    (duurzaam.energievoorziening === "gasloos" ||
      duurzaam.energievoorziening === "volledig_all_electric") &&
    techniek.gasaansluiting !== false
  ) {
    s.push({
      label:
        "Ambitie gasloos/all-electric: gasaansluiting uit + all-electric warmtepomp.",
      patch: { gasaansluiting: false, verwarming: "all_electric_warmtepomp" },
    });
  }

  // ✅ Hybride
  if (
    duurzaam.energievoorziening === "hybride" &&
    techniek.verwarming !== "hybride_warmtepomp"
  ) {
    s.push({
      label: "Hybride-ambitie: hybride warmtepomp als voorkeursysteem.",
      patch: { verwarming: "hybride_warmtepomp", heatingAmbition: "comfort" },
    });
  }

  // ✅ PV — match de opties van Duurzaamheid!
  if (duurzaam.zonnepanelen) {
    // ⚠️ FIX: De waarden hier (bv. 'ruim_voldoende') moeten exact overeenkomen
    // met de waarden in Duurzaamheid.tsx <select>
    const pvMapping: Record<string, string> = {
      beperkt: "uitgebreid", // Check deze logica
      ruim: "uitgebreid", // 'ruim' uit Duurzaamheid.tsx
      nul_op_meter: "nul_op_de_meter", // 'nul_op_meter' uit Duurzaamheid.tsx
    };
    
    const mappedPvConfig = pvMapping[duurzaam.zonnepanelen];

    if (
      mappedPvConfig &&
      (!techniek.pvConfiguratie || techniek.pvConfiguratie === "onbekend")
    ) {
      s.push({
        label: "PV-ambitie: zonnepanelen in techniek vastleggen.",
        patch: {
          pvConfiguratie: mappedPvConfig as TechniekData["pvConfiguratie"],
          pvAmbition: "comfort",
        },
      });
    }
  }

  // ✅ Thuisbatterij
  if (
    // ✅ FIXED: Gebruik "ja_korte_termijn" i.p.v. "ja" (type: "geen" | "overwegen" | "ja_korte_termijn")
    (duurzaam.thuisbatterij === "ja_korte_termijn" || duurzaam.thuisbatterij === "overwegen") &&
    (!techniek.batterijVoorziening || techniek.batterijVoorziening === "geen")
  ) {
    s.push({
      label: "Thuisbatterij gewenst: ruimte en bekabeling opnemen.",
      patch: {
        batterijVoorziening: duurzaam.thuisbatterij === "ja_korte_termijn" ? "batterij_gepland" : "voorbereid"
      },
    });
  }

  // ✅ EV-laadpunt
  if (
    duurzaam.evLaadpunt &&
    duurzaam.evLaadpunt !== "geen" &&
    (!techniek.evVoorziening || techniek.evVoorziening === "geen")
  ) {
    // Map DuurzaamData["evLaadpunt"] naar TechniekData["evVoorziening"]
    const evMapping: Record<string, TechniekData["evVoorziening"]> = {
      voorbereiding: "voorbereid",
      laadpunt: "laadpunt",
      bidirectioneel: "laadpunt_bidirectioneel",
    };
    
    const mappedEv = evMapping[duurzaam.evLaadpunt];
    
    if (mappedEv) {
      s.push({
        label: "EV-laadpunt gewenst: technische voorbereiding opnemen.",
        patch: { evVoorziening: mappedEv },
      });
    }
  }

  // ✅ Zonwering (uit Duurzaam: g-waarde laag)
  if (duurzaam.gWaardeAmbitie === "hoger" || (duurzaam.gWaarde && duurzaam.gWaarde <= 0.45)) {
    if (!techniek.shadingControl || techniek.shadingControl === "none") {
      s.push({
        label:
          "Lage g-waarde: motorische zonwering met automatische sturing adviseren.",
        patch: {
          shadingControl: "motor_sun_temp",
          externalShading: true,
        },
      });
    }
  }

  // ✅ IAQ hoger → WTW
  if (
    duurzaam.iaqAmbitie === "hoger" &&
    techniek.ventilatie !== "balans_wtw"
  ) {
    s.push({
      label: "Hogere IAQ-ambitie: balansventilatie met WTW voorkeursysteem.",
      patch: {
        ventilatie: "balans_wtw",
        ventilationAmbition: "comfort",
      },
    });
  }

  // TODO: De volgende suggesties gebruiken velden (daylightSensors, noiseConstraintOutdoor, etc.)
  // die niet gedefinieerd lijken te zijn in de TechniekData type (zie JSX hierboven).
  // Deze zijn tijdelijk uitgecommentarieerd om type errors te voorkomen.
  // Controleer of deze velden moeten worden toegevoegd aan `types/project.ts` en de JSX.

  /*
  // ✅ Daglicht hoger → daylight sensors
  if (
    duurzaam.daglichtAmbitie === "hoger" &&
    !techniek.daylightSensors 
  ) {
    s.push({
      label:
        "Daglicht-ambitie: daglichtsenoren en scène-verlichting voorbereiden.",
      patch: { daylightSensors: true, lightingControl: "scenes" },
    });
  }
  */

  /*
  // ✅ Blowerdoor → geluidseisen voor installaties
  if (
    duurzaam.blowerdoorTestUitvoeren &&
    !techniek.noiseConstraintOutdoor
  ) {
    s.push({
      label:
        "Blowerdoortest ambitie: warmtepompgeluid en vibraties in ontwerp meenemen.",
      patch: {
        noiseConstraintOutdoor: true,
        acousticDecoupling: true,
        vibrationDamping: true,
      },
    });
  }
  */

  // ✅ Isolatie hoog → mogelijkheid voor lage temperatuur verwarming
  if (
    (duurzaam.rcGevelAmbitie === "hoger" ||
      (duurzaam.rcGevel && duurzaam.rcGevel >= 5.0)) &&
    (!techniek.afgiftesysteem || techniek.afgiftesysteem === "onbekend")
  ) {
    s.push({
      label:
        "Hoog isolatieniveau: lage-temperatuur afgiftesysteem (vloerverwarming) is ideaal.",
      patch: { afgiftesysteem: "vloer_wand_plafond", heatingAmbition: "max" },
    });
  }

  return s;
}