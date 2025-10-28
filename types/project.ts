// Kern-entity types voor Ruimtes, Wensen, Techniek en Duurzaamheid

// Ruimtecategorie, incl. 'nvt' (niet van toepassing / onbekend)
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

export interface Space {
  id: string;
  type: string; // bv. "keuken", "slaapkamer"
  tag: SpaceTag;
  details?: RoomDetail[];
}

// Wensen + prioriteit (MoSCoW), incl. 'unknown'
export type WishPriority = "must" | "nice" | "future" | "unknown";

export interface WishItem {
  id: string;
  label: string;
  confirmed: boolean;
  priority?: WishPriority;
}

/** TECHNIEK — met 'unknown' keuzes */
export type BuildMethod = "traditioneel_baksteen" | "houtskeletbouw" | "staalframe" | "anders" | "unknown";
export type Ventilation = "natuurlijk" | "C" | "D" | "balans_wtw" | "unknown";
export type Heating = "all_electric_warmtepomp" | "hybride_warmtepomp" | "cv_gas" | "stadswarmte" | "unknown";
export type Cooling = "passief" | "actief" | "geen" | "unknown";
export type PvPreference = "geen" | "optioneel" | "maximeren" | "unknown";

export interface TechnicalPrefs {
  buildMethod: BuildMethod;
  insulationTargetRc?: number;   // Rc gevel/plafond indicatie
  ventilation: Ventilation;
  heating: Heating;
  cooling: Cooling;
  pv: PvPreference;
  notes?: string;
}

/** DUURZAAMHEID — met 'unknown' keuzes */
export type EnergyFocus = "comfort" | "kosten" | "co2" | "circulair" | "unknown";
export type RainwaterReuse = "geen" | "wc_tuin" | "volledig" | "unknown";
export type GreenRoof = "geen" | "gedeeltelijk" | "volledig" | "unknown";
export type MaterialPref = "standaard" | "biobased" | "mix" | "unknown";

export interface SustainabilityPrefs {
  focus: EnergyFocus;
  rainwater: RainwaterReuse;
  greenRoof: GreenRoof;
  materials: MaterialPref;
  epcTarget?: number;          // Indicatief (of BENG-doel, bij verbouw: energie-index)
  insulationUpgrade?: boolean; // Vooral bij verbouwing relevant
  notes?: string;
}
