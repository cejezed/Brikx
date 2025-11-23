// /types/project.ts
// ✅ v3.3 GRONDWET: Inclusief alle v3.2 types + v3.3 fixes (camelCase en GeneratePatchResult)

// ============================================================================
// HELPER TYPES (v3.2)
// ============================================================================

export type TriageData = {
  projectType?: string;
  projectSize?: string;
  urgency?: string;
  budget?: number;
  intent?: string[];
};

export type AmbitiePolicy = "bouwbesluit" | "hoger";

// --- Techniek Helpers ---
export type TechAmbition = "unknown" | "basis" | "comfort" | "max";
export type CurrentState = "unknown" | "bestaand_blijft" | "casco_aanpak" | "sloop_en_opnieuw";
export type BuildMethod = "unknown" | "traditioneel_baksteen" | "houtskeletbouw" | "staalframe" | "anders";
export type HeatingSystem = "onbekend" | "cv_gas" | "hybride_warmtepomp" | "all_electric_warmtepomp" | "stadswarmte" | "anders";
export type VentilationSystem = "onbekend" | "natuurlijk" | "mechanisch_afvoer" | "balans_wtw";
export type CoolingSystem = "onbekend" | "geen" | "passieve_koeling" | "actieve_koeling_warmtepomp";
export type PvConfig = "onbekend" | "geen" | "basis" | "uitgebreid" | "nul_op_de_meter";
export type EvProvision = "geen" | "voorbereid" | "laadpunt" | "laadpunt_bidirectioneel";
export type BatteryProvision = "geen" | "voorbereid" | "batterij_gepland";

export type LightingControlLevel = "none" | "zones" | "scenes" | "human_centric";
export type ShadingControl = "none" | "motor_manual" | "motor_sun_temp" | "motor_domotica";
export type SecurityAlarmType = "none" | "standalone" | "connected" | "monitored";
export type ResistanceClass = "rc2" | "rc3";
export type NetworkBackbone = "none" | "ethernet_cat6" | "fiber";

// --- Duurzaamheid Helpers ---
export type EnergievoorzieningAmbitie = "onbekend" | "gasloos" | "hybride" | "volledig_all_electric";
export type RegenwaterGebruik = "geen" | "tuin" | "toilet_en_was" | "maximaal";
export type GrijswaterVoorziening = "geen" | "voorbereiding" | "individueel_systeem" | "collectief_systeem";
export type Materiaalstrategie = "standaard" | "deels_biobased" | "overwegend_biobased_circulair";
export type ZonnepanelenOrientatie = "noord" | "oost" | "zuid" | "west" | "oost-west" | "gemengd";


// ============================================================================
// PROJECT SCOPE & LEEFPROFIELEN (v3.8)
// ============================================================================

export type ProjectScope =
  | "nieuwe_woning"
  | "uitbouw"
  | "dakopbouw"
  | "dakkapel"
  | "schuur"
  | "garage"
  | "tuinhuis"
  | "renovatie"
  | "interieur"
  | "anders";

export type AgeBracket =
  | "geen_kinderen"
  | "0-4"
  | "4-8"
  | "8-12"
  | "12-16"
  | "16-20"
  | "20plus";

export type FamilyProfile =
  | "geen_kinderen"
  | "jonge_kinderen"
  | "basisschool_kinderen"
  | "pubers"
  | "mix_kinderen"
  | "onbekend";

export type WorkFromHomeProfile = "niet" | "af_en_toe" | "regelmatig";
export type CookingProfile = "basis" | "hobbykok" | "fanatiek";
export type HostingProfile = "zelden" | "kleine_groepen" | "grote_groepen";
export type PetsProfile = "geen" | "hond" | "kat" | "meerdere";
export type NoiseProfile = "gevoelig" | "neutraal" | "maakt_niet_uit";
export type MobilityProfile = "fit" | "lichte_beperking" | "rolstoelvriendelijk";
export type TidyProfile = "strak" | "gemiddeld" | "creatieve_chaos";

// Hoog-niveau leefprofiel dat we in de prompt gebruiken
export type LifestyleProfile = {
  family: FamilyProfile;
  work: WorkFromHomeProfile;
  cooking: CookingProfile;
  hosting: HostingProfile;
  pets: PetsProfile;
  noise: NoiseProfile;
  mobility: MobilityProfile;
  tidiness: TidyProfile;
};

// ============================================================================
// CHAPTER 1: BASIS
// ============================================================================

export type BasisData = {
  projectType: "nieuwbouw" | "verbouwing" | "bijgebouw" | "hybride" | "anders";
  projectNaam?: string;
  locatie?: string;
  projectSize?: "<75m2" | "75-150m2" | "150-250m2" | ">250m2";
  urgency?: "<3mnd" | "3-6mnd" | "6-12mnd" | ">12mnd" | "onzeker";
  ervaring?: "starter" | "enigszins" | "ervaren";
  toelichting?: string;
  budget?: number;

  // ✅ v3.8: Leefprofiel uitbreidingen
  projectScope?: ProjectScope;
  huishoudenType?: "alleenstaand" | "stel" | "gezin" | "samengesteld" | "anders";
  kinderenLeeftijdsgroepen?: AgeBracket[]; // leeg of undefined = onbekend

  workFromHome?: WorkFromHomeProfile;
  cookingProfile?: CookingProfile;
  hostingProfile?: HostingProfile;
  petsProfile?: PetsProfile;
  noiseProfile?: NoiseProfile;
  mobilityProfile?: MobilityProfile;
  tidyProfile?: TidyProfile;
};

// ============================================================================
// CHAPTER 2: RUIMTES
// ============================================================================

export type Room = {
  id: string;
  name: string;
  type: string;
  group?: string;
  m2?: number | "";
  wensen?: string[];
  count?: number;
};

export type RuimtesData = {
  rooms: Room[];
};

// ============================================================================
// CHAPTER 3: WENSEN
// ============================================================================

export type Wish = {
  id: string;
  text: string;
  category?: "comfort" | "style" | "function" | "other";
  priority?: "must" | "nice" | "optional";
};

export type WensenData = {
  wishes: Wish[];
};

// ============================================================================
// CHAPTER 4: BUDGET
// ============================================================================

export type BudgetData = {
  budgetTotaal?: number;
  bandbreedte?: [number | null, number | null];
  eigenInbreng?: number;
  contingency?: number;
  notes?: string;
};

// ============================================================================
// CHAPTER 5: TECHNIEK - v3.2
// ============================================================================

export type TechniekData = {
  // Ambities
  ventilationAmbition?: TechAmbition;
  heatingAmbition?: TechAmbition;
  coolingAmbition?: TechAmbition;
  pvAmbition?: TechAmbition;

  // Context
  currentState?: CurrentState;
  buildMethod?: BuildMethod;

  // Geavanceerde toggler
  showAdvanced?: boolean;

  // Verwarming/afgifte/ventilatie/koeling
  gasaansluiting?: boolean;
  verwarming?: HeatingSystem;
  afgiftesysteem?: "onbekend" | "radiatoren_hoog_temp" | "radiatoren_lage_temp" | "vloerverwarming" | "vloer_wand_plafond" | "anders";
  ventilatie?: VentilationSystem;
  koeling?: CoolingSystem;

  // PV/batterij/EV
  pvConfiguratie?: PvConfig;
  batterijVoorziening?: BatteryProvision;
  evVoorziening?: EvProvision;

  // Domotica & verlichting
  lightingControl?: LightingControlLevel;
  presenceSensors?: boolean;
  taskLighting?: boolean;

  // Zonwering & daglichtsturing
  shadingControl?: ShadingControl;
  externalShading?: boolean;
  daylightSensors?: boolean;

  // Beveiliging & inbraakwerendheid
  securityAlarm?: SecurityAlarmType;
  resistanceClass?: ResistanceClass;
  cctv?: boolean;

  // Netwerk & data
  networkBackbone?: NetworkBackbone;
  meshWifi?: boolean;
  wiredDrops?: boolean;

  // Brandveiligheid
  linkedSmokeDetectors?: boolean;
  coDetectors?: boolean;
  alarmAppIntegration?: boolean;

  // Geluid & plaatsing
  noiseConstraintOutdoor?: boolean;
  acousticDecoupling?: boolean;
  vibrationDamping?: boolean;

  // PvE-notes
  notes?: string;
};

// ============================================================================
// CHAPTER 6: DUURZAAMHEID - v3.3 (camelCase FIX)
// ============================================================================

export type DuurzaamData = {
  // Energieconcept
  energievoorziening?: EnergievoorzieningAmbitie;
  energieLabel?: "A" | "A+" | "A++" | "A+++" | "A++++" | "B" | "C" | "D" | "E" | "F" | "G";

  // Schil & prestatie + ambities
  rcGevelAmbitie?: AmbitiePolicy;
  rcDakAmbitie?: AmbitiePolicy;
  rcVloerAmbitie?: AmbitiePolicy;
  uGlasAmbitie?: AmbitiePolicy;
  n50Ambitie?: AmbitiePolicy;
  gWaardeAmbitie?: AmbitiePolicy;

  rcGevel?: number;
  rcDak?: number;
  rcVloer?: number;
  uGlas?: number;
  n50?: number;
  gWaarde?: number;
  blowerdoorTestUitvoeren?: boolean;
  typeGlas?: "dubbel" | "hr++" | "triple" | "anders";

  // IAQ - ✅ FIXED: camelCase
  iaqAmbitie?: AmbitiePolicy;
  co2TargetPpm?: number;
  ventilatieklasse?: "A" | "B" | "C";
  iaqMonitoring?: boolean;

  // Daglicht - ✅ FIXED: camelCase
  daglichtAmbitie?: AmbitiePolicy;
  daglichtMetric?: "DA" | "UDI" | "factor";
  daglichtStreefwaarde?: number;
  zonwerendGlasToepassen?: boolean;

  // Akoestiek - ✅ FIXED: camelCase
  akoestiekAmbitie?: AmbitiePolicy;
  akoestiekBinnenDnTw?: number;
  akoestiekContactLnTw?: number;

  // Opwek & opslag
  zonnepanelen?: "geen" | "beperkt" | "ruim_voldoende" | "nul_op_de_meter";
  zonnepanelenOppervlak?: number;
  zonnepanelenOrientatie?: ZonnepanelenOrientatie;
  thuisbatterij?: "geen" | "overwegen" | "ja_korte_termijn";
  evLaadpunt?: EvProvision;
  v2gVoorbereid?: boolean;

  // Stadswarmte
  stadswarmteBeschikbaar?: boolean;
  stadswarmteGeinteresseerd?: boolean;

  // Water
  regenwaterHerbruik?: RegenwaterGebruik;
  grijswaterVoorziening?: GrijswaterVoorziening;
  groendakOppervlak?: number;
  waterRetentieTuin?: boolean;

  // Materialen
  materiaalstrategie?: Materiaalstrategie;
  demontabelConstrueren?: boolean;
  mpgAmbitie?: number;
  mpgToelichting?: string;

  // Toekomst - ✅ FIXED: flexibelIndelingsConcept → flexibelIndeling
  klimaatadaptief?: boolean;
  flexibelIndeling?: boolean;
  installatiesToekomstgericht?: boolean;

  // Meta
  prioriteit?: "laag" | "normaal" | "hoog" | "zeer_hoog";
  opmerkingen?: string;
  epcOfBengDoel?: number;
  bengToelichting?: string;
};

// ============================================================================
// CHAPTER 7: RISICO
// ============================================================================

export type RiskSeverity = "laag" | "medium" | "hoog";
export type RiskType = "planning" | "budget" | "quality" | "technical" | "other";

export type Risk = {
  id: string;
  description: string;
  severity: RiskSeverity;
  mitigation?: string;
  related?: string[];
  type?: RiskType;
};

export type RisicoData = {
  risks: Risk[];
  overallRisk?: RiskSeverity;
};

// ============================================================================
// UNIFIED MAP & KEYS
// ============================================================================

export type ChapterDataMap = {
  basis: BasisData;
  ruimtes: RuimtesData;
  wensen: WensenData;
  budget: BudgetData;
  techniek: TechniekData;
  duurzaam: DuurzaamData;
  risico: RisicoData;
};

export type ChapterKey = keyof ChapterDataMap;
export type ChapterData<K extends ChapterKey> = ChapterDataMap[K];

// ============================================================================
// PATCH OPERATIONS (v3.3)
// ============================================================================

export type PatchDelta = {
  path: string;
  operation: "set" | "append" | "remove";
  value?: any;
};

export type PatchEvent = {
  chapter: ChapterKey;
  delta: PatchDelta;
};

// ✅ NEW v3.3: Multiple patches
// ✅ v3.6: Added action field for reset functionality
// ✅ v3.7: Added "undo" action
export type GeneratePatchResult = {
  action?: "none" | "reset" | "undo";
  patches: PatchEvent[];
  followUpQuestion?: string;
  tokensUsed?: number;
};

// ✅ v3.8: RAGDoc interface - centralized for Kennisbank and ProModel
export interface RAGDoc {
  id?: string;
  text: string;
  source?: string;
}

// ============================================================================
// PROJECT META (v3.5 - Stap 0 data)
// ============================================================================

export type ProjectMeta = {
  projectNaam: string;
  projectType: "nieuwbouw" | "verbouwing" | "bijgebouw" | "hybride" | "anders";
  locatie?: string;
  startVoorkeur?: string;
};

// ============================================================================
// WIZARD STATE
// ============================================================================

export type WizardState = {
  stateVersion: number;
  projectMeta?: ProjectMeta; // ✅ v3.5: Stap 0 data (project metadata)
  chapterAnswers: Partial<ChapterDataMap>;
  triage?: TriageData;
  currentChapter?: ChapterKey;
  chapterFlow?: ChapterKey[];
  focusedField?: string | null;
  showExportModal?: boolean;
  mode?: "PREVIEW" | "PREMIUM";
};