// /types/project.ts
// Kern-entity types voor Ruimtes, Wensen, Techniek en Duurzaamheid

// Ruimtecategorie
export type SpaceTag = "private" | "public" | "guest" | "future" | "nvt";

export interface Dimensions {
  length?: number; // m
  width?: number;  // m
}

export interface RoomDetail {
  label: string;
  size?: Dimensions;
  fixedPlacement?: boolean;
}

export interface RoomConfig {
  rooms?: RoomDetail[];
  notes?: string;
}

// Wensen

export type WishPriority = "unknown" | "must" | "nice" | "future";

export interface WishItem {
  id: string;
  label: string;
  priority: WishPriority;
  confirmed?: boolean;
}

// Techniek v2

export type Ambition = "unknown" | "basis" | "comfort" | "max";
export type CurrentState =
  | "unknown"
  | "bestaand_blijft"
  | "casco_aanpak"
  | "sloop_en_opnieuw";
export type BuildMethodV2 =
  | "unknown"
  | "traditioneel_baksteen"
  | "houtskeletbouw"
  | "staalframe"
  | "anders";

export interface TechnicalPrefsV2 {
  ventilationAmbition: Ambition;
  heatingAmbition: Ambition;
  coolingAmbition: Ambition;
  pvAmbition: Ambition;
  currentState?: CurrentState;
  buildMethod?: BuildMethodV2;
  notes?: string;
}

// Duurzaamheid

export type EnergyFocus = "comfort" | "kosten" | "co2" | "circulair" | "unknown";
export type RainwaterReuse = "geen" | "wc_tuin" | "volledig" | "unknown";
export type GreenRoof = "geen" | "gedeeltelijk" | "volledig" | "unknown";
export type MaterialPref = "standaard" | "biobased" | "mix" | "unknown";

export interface SustainabilityPrefs {
  focus: EnergyFocus;
  rainwater: RainwaterReuse;
  greenRoof: GreenRoof;
  materials: MaterialPref;
  epcTarget?: number;
  insulationUpgrade?: boolean;
  notes?: string;
}
