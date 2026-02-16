// lib/pveCheck/rubric.ts — Deterministic rubric (de canon)
// Versie wordt gebumpt na review-feedback patronen.
import type { PveRubric, PveRubricItem } from "@/types/pveCheck";
import { RUBRIC_VERSION } from "@/types/pveCheck";

// ============================================================================
// RUBRIC ITEMS — per veld: severity, fixEffort, quality criteria, risk overlay,
// pitfalls, en een gratis voorbeeldtekst (template, niet LLM).
// ============================================================================

const ITEMS: PveRubricItem[] = [
  // --- BASIS ---
  {
    id: "basis.projectType",
    chapter: "basis",
    fieldId: "projectType",
    label: "Projecttype",
    severity: "critical",
    fixEffort: "XS",
    weight: 12,
    keywords: ["nieuwbouw", "verbouwing", "bijgebouw", "renovatie", "aanbouw", "uitbouw"],
    qualityCriteria: "Eenduidig projecttype benoemd (nieuwbouw/verbouwing/bijgebouw/hybride).",
    riskOverlay: "Zonder duidelijk projecttype worden vergunning, budget en planning verkeerd ingeschat.",
    pitfalls: ["'Verbouwing' en 'renovatie' worden verwisseld", "Hybride scope niet gedefinieerd"],
    exampleGood: "Het project betreft een verbouwing van een bestaande jaren-30 woning met uitbouw aan de achterzijde.",
  },
  {
    id: "basis.locatie",
    chapter: "basis",
    fieldId: "locatie",
    label: "Locatie",
    severity: "critical",
    fixEffort: "XS",
    weight: 8,
    keywords: ["locatie", "adres", "gemeente", "wijk", "stad", "straat", "perceel"],
    qualityCriteria: "Minimaal gemeente + straat of kadastrale aanduiding.",
    riskOverlay: "Locatie bepaalt bestemmingsplan, bodemgesteldheid en bouwvoorschriften.",
    pitfalls: ["Alleen 'regio' zonder specifiek adres", "Postcode ontbreekt"],
    exampleGood: "Het project bevindt zich aan de Kerkstraat 12, 3511 CX Utrecht.",
  },
  {
    id: "basis.bouwjaar",
    chapter: "basis",
    fieldId: "bouwjaar",
    label: "Bouwjaar (bij verbouwing)",
    severity: "important",
    fixEffort: "XS",
    weight: 4,
    keywords: ["bouwjaar", "jaar", "gebouwd", "oorsprong", "bestaand"],
    qualityCriteria: "Specifiek bouwjaar of decade benoemd.",
    riskOverlay: "Bouwjaar bepaalt constructieve aannames, asbest-risico en energielabel-potentieel.",
    pitfalls: ["'Oud huis' zonder jaartal", "Bouwjaar verward met aankoopdatum"],
    exampleGood: "De woning is gebouwd in 1932 en heeft een gemetselde spouwmuur zonder isolatie.",
  },

  // --- RUIMTES ---
  {
    id: "ruimtes.rooms",
    chapter: "ruimtes",
    fieldId: "rooms",
    label: "Ruimteprogramma",
    severity: "critical",
    fixEffort: "M",
    weight: 16,
    keywords: ["slaapkamer", "badkamer", "woonkamer", "keuken", "kamer", "ruimte", "m2", "m²", "oppervlakte"],
    qualityCriteria: "Minimaal hoofd-ruimtes benoemd met gewenst oppervlak of verhouding.",
    riskOverlay: "Zonder ruimteprogramma is geen plattegrond of kostenverdeling mogelijk.",
    pitfalls: ["Alleen 'woonkamer' zonder andere ruimtes", "Oppervlaktes ontbreken", "Berging/bijkeuken vergeten"],
    exampleGood: "Woonkamer (ca. 45m²), open keuken (20m²), 3 slaapkamers (12-15m²), badkamer (8m²), toilet, berging (6m²).",
  },

  // --- WENSEN ---
  {
    id: "wensen.wishes",
    chapter: "wensen",
    fieldId: "wishes",
    label: "Wensen en prioriteiten",
    severity: "critical",
    fixEffort: "M",
    weight: 16,
    keywords: ["must", "nice", "wens", "prioriteit", "belangrijk", "eis", "voorwaarde", "moet"],
    qualityCriteria: "Minimaal 5 wensen met MoSCoW-prioriteit (must/nice/optional).",
    riskOverlay: "Zonder geprioriteerde wensen kan geen afweging worden gemaakt bij budgetdruk.",
    pitfalls: ["Alle wensen als 'must-have'", "Geen onderscheid functioneel/esthetisch", "Wensen zonder meetbaar criterium"],
    exampleGood: "Must: open keuken-woonkamer, vloerverwarming, 3 slaapkamers. Nice: inloopkast, dakraam. Optioneel: buitensauna.",
  },

  // --- BUDGET ---
  {
    id: "budget.budgetTotaal",
    chapter: "budget",
    fieldId: "budgetTotaal",
    label: "Budget indicatie",
    severity: "critical",
    fixEffort: "S",
    weight: 16,
    keywords: ["budget", "euro", "kosten", "maximaal", "investering", "begroting", "€"],
    qualityCriteria: "Concreet bedrag of bandbreedte met onder- en bovengrens.",
    riskOverlay: "Zonder budget is geen haalbaarheidstoets mogelijk en dreigt overschrijding.",
    pitfalls: ["'Zo goedkoop mogelijk'", "Budget exclusief BTW/bijkomende kosten", "Financiering niet benoemd"],
    exampleGood: "Het beschikbare bouwbudget is €275.000 – €325.000 inclusief BTW, exclusief grondkosten en leges.",
  },

  // --- TECHNIEK ---
  {
    id: "techniek.verwarming",
    chapter: "techniek",
    fieldId: "verwarming",
    label: "Verwarmingssysteem",
    severity: "critical",
    fixEffort: "S",
    weight: 10,
    keywords: ["warmtepomp", "verwarming", "cv", "vloerverwarming", "radiatoren", "all-electric", "gas"],
    qualityCriteria: "Gekozen verwarmingssysteem + afgiftetype benoemd.",
    riskOverlay: "Verwarmingskeuze bepaalt netaansluiting, vloerhoogte en exploitatiekosten.",
    pitfalls: ["'Duurzaam verwarmen' zonder concreet systeem", "Hybride vs. all-electric niet gekozen"],
    exampleGood: "All-electric warmtepomp (lucht-water) met lage-temperatuur vloerverwarming op begane grond en radiatoren op verdieping.",
  },
  {
    id: "techniek.ventilatie",
    chapter: "techniek",
    fieldId: "ventilatie",
    label: "Ventilatiesysteem",
    severity: "important",
    fixEffort: "S",
    weight: 6,
    keywords: ["ventilatie", "wtw", "mechanisch", "natuurlijk", "lucht", "afzuiging"],
    qualityCriteria: "Ventilatieconcept benoemd (natuurlijk/mechanisch/balans-WTW).",
    riskOverlay: "Ventilatie bepaalt leidingvoering, plafondhoogte en binnenluchtkwaliteit.",
    pitfalls: ["Ventilatie niet benoemd bij goed geïsoleerde schil", "WTW zonder kanaalvoering"],
    exampleGood: "Balansventilatie met WTW (rendement ≥90%), centrale unit op zolder, toevoer via plafondrooster.",
  },
  {
    id: "techniek.isolatie",
    chapter: "techniek",
    fieldId: "isolatie",
    label: "Isolatie / schil",
    severity: "important",
    fixEffort: "S",
    weight: 6,
    keywords: ["isolatie", "rc-waarde", "schil", "spouw", "dak", "vloer", "gevel"],
    qualityCriteria: "Isolatie-ambitie of Rc-waarden per bouwdeel benoemd.",
    riskOverlay: "Isolatiekeuze bepaalt energielabel, comfort en verwarmingscapaciteit.",
    pitfalls: ["'Goed geïsoleerd' zonder Rc-waarden", "Vloerisolatie vergeten bij bestaande bouw"],
    exampleGood: "Gevel Rc ≥ 4.5, dak Rc ≥ 6.0, vloer Rc ≥ 3.5, HR++ beglazing (U ≤ 1.1).",
  },

  // --- DUURZAAM ---
  {
    id: "duurzaam.energieLabel",
    chapter: "duurzaam",
    fieldId: "energieLabel",
    label: "Energiedoelstelling",
    severity: "important",
    fixEffort: "S",
    weight: 8,
    keywords: ["energielabel", "duurzaam", "nul-op-de-meter", "epc", "beng", "gasloos", "zonnepanelen"],
    qualityCriteria: "Concreet energielabel-doel of BENG-eis benoemd.",
    riskOverlay: "Energiedoel bepaalt schilkwaliteit, installatiekeuze en terugverdientijd.",
    pitfalls: ["'Zo duurzaam mogelijk' zonder meetbaar doel", "Label A++ vs. NOM verward"],
    exampleGood: "Streefniveau: energielabel A++, BENG 1 ≤ 50 kWh/m²/jaar, gasloze exploitatie.",
  },
  {
    id: "duurzaam.zonnepanelen",
    chapter: "duurzaam",
    fieldId: "zonnepanelen",
    label: "Zonnepanelen / opwek",
    severity: "nice_to_have",
    fixEffort: "XS",
    weight: 4,
    keywords: ["zonnepanelen", "pv", "opwek", "zonne-energie", "omvormer"],
    qualityCriteria: "Aantal panelen of Wp-vermogen + oriëntatie benoemd.",
    riskOverlay: "PV-installatie beïnvloedt dakconstructie en netaansluiting.",
    pitfalls: ["Alleen 'zonnepanelen' zonder capaciteit", "Oriëntatie niet gecheckt"],
    exampleGood: "16 zonnepanelen (±6.4 kWp) op zuidwest-georiënteerd dak (hellingshoek 35°).",
  },

  // --- RISICO ---
  {
    id: "risico.planning",
    chapter: "risico",
    fieldId: "risks",
    label: "Planning en doorlooptijd",
    severity: "important",
    fixEffort: "S",
    weight: 6,
    keywords: ["planning", "doorlooptijd", "oplevering", "start", "deadline", "maanden", "weken"],
    qualityCriteria: "Gewenste start- en opleverdatum of doorlooptijd benoemd.",
    riskOverlay: "Zonder planning is vergunnings- en uitvoeringstijd niet te toetsen.",
    pitfalls: ["'Zo snel mogelijk' zonder realistische doorlooptijd", "Vergunningsdoorlooptijd niet meegenomen"],
    exampleGood: "Gewenste start bouw: september 2026, oplevering: maart 2027 (6 maanden doorlooptijd).",
  },
  {
    id: "risico.vergunning",
    chapter: "risico",
    fieldId: "risks",
    label: "Vergunningsstatus",
    severity: "important",
    fixEffort: "XS",
    weight: 4,
    keywords: ["vergunning", "omgevingsvergunning", "bouwvergunning", "bestemmingsplan", "welstand"],
    qualityCriteria: "Vergunningsplicht en status (aangevraagd/verleend/onbekend) benoemd.",
    riskOverlay: "Ontbrekende vergunning kan het gehele project stilleggen.",
    pitfalls: ["Aanname 'vergunningvrij' zonder toetsing", "Welstandscommissie niet meegenomen"],
    exampleGood: "Omgevingsvergunning is vereist en wordt aangevraagd na definitief ontwerp. Bestemmingsplan laat de uitbouw toe.",
  },
  {
    id: "risico.scope",
    chapter: "risico",
    fieldId: "risks",
    label: "Scope en verantwoordelijkheden",
    severity: "nice_to_have",
    fixEffort: "M",
    weight: 4,
    keywords: ["scope", "verantwoordelijkheid", "aannemer", "architect", "opdrachtgever", "wie doet wat"],
    qualityCriteria: "Rolverdeling opdrachtgever/architect/aannemer + scope-afbakening benoemd.",
    riskOverlay: "Onduidelijke scope leidt tot meerwerk-discussies en vertraging.",
    pitfalls: ["Geen onderscheid casco vs. turn-key", "Zelfwerkzaamheid niet afgebakend"],
    exampleGood: "Opdrachtgever regelt schilderwerk en tuin. Aannemer levert casco+ (incl. keuken, sanitair). Architect bewaakt kwaliteit.",
  },
];

// ============================================================================
// EXPORT
// ============================================================================

export const PVE_RUBRIC: PveRubric = {
  version: RUBRIC_VERSION,
  items: ITEMS,
};

export function getRubricVersion(): string {
  return PVE_RUBRIC.version;
}

/** Lookup a single rubric item by id */
export function getRubricItem(id: string): PveRubricItem | undefined {
  return ITEMS.find((item) => item.id === id);
}

/** All field IDs in the rubric (whitelist) */
export function getRubricFieldIds(): string[] {
  return ITEMS.map((item) => item.fieldId);
}
