import type {
  BasisData,
  RiskSeverity,
  HeatingSystem,
  VentilationSystem,
  PvConfig,
  TechAmbition,
  WishPriority,
} from "@/types/project";

/**
 * Formatters voor enum types uit @/types/project.
 *
 * Deze helpers converteren machine-readable enum values naar
 * user-friendly strings in TitleCase Nederlands.
 */

type ProjectType = BasisData["projectType"];

export function formatProjectType(type?: ProjectType): string {
  if (!type) return "Onbekend";
  const map: Record<ProjectType, string> = {
    nieuwbouw: "Nieuwbouw",
    verbouwing: "Verbouwing",
    bijgebouw: "Bijgebouw",
    hybride: "Hybride Project",
    anders: "Anders",
  };
  return map[type] || type;
}

export function formatRiskSeverity(severity?: RiskSeverity): string {
  if (!severity) return "Onbekend";
  const map: Record<RiskSeverity, string> = {
    laag: "Laag",
    medium: "Gemiddeld",
    hoog: "Hoog",
  };
  return map[severity];
}

export function formatHeatingSystem(system?: HeatingSystem): string {
  if (!system) return "Onbekend";
  const map: Record<HeatingSystem, string> = {
    onbekend: "Onbekend",
    cv_gas: "CV (Gas)",
    hybride_warmtepomp: "Hybride Warmtepomp",
    all_electric_warmtepomp: "All-Electric Warmtepomp",
    stadswarmte: "Stadswarmte",
    anders: "Anders",
  };
  return map[system] || system;
}

export function formatVentilationSystem(system?: VentilationSystem): string {
  if (!system) return "Onbekend";
  const map: Record<VentilationSystem, string> = {
    onbekend: "Onbekend",
    natuurlijk: "Natuurlijke Ventilatie",
    mechanisch_afvoer: "Mechanische Afvoer",
    balans_wtw: "Balansventilatie met WTW",
  };
  return map[system] || system;
}

export function formatPvConfig(config?: PvConfig): string {
  if (!config) return "Onbekend";
  const map: Record<PvConfig, string> = {
    onbekend: "Onbekend",
    geen: "Geen",
    basis: "Basis",
    uitgebreid: "Uitgebreid",
    nul_op_de_meter: "Nul-op-de-Meter",
  };
  return map[config] || config;
}

export function formatTechAmbition(ambition?: TechAmbition): string {
  if (!ambition) return "Onbekend";
  const map: Record<TechAmbition, string> = {
    unknown: "Onbekend",
    basis: "Basis",
    comfort: "Comfort",
    max: "Maximaal",
  };
  return map[ambition] || ambition;
}

export function formatWishPriority(priority?: WishPriority): string {
  if (!priority) return "Onbekend";
  const map: Record<WishPriority, string> = {
    must: "Must-have (Cruciaal)",
    nice: "Nice-to-have",
    optional: "Optioneel / Fase 2",
    wont: "Won't-have (Anti-wens)",
  };
  return map[priority] || priority;
}

/**
 * Formatteert een getal als Nederlands currency.
 */
export function formatCurrency(amount?: number): string {
  if (amount === undefined || amount === null) return "€ 0";
  return `€ ${amount.toLocaleString("nl-NL")}`;
}

/**
 * Formatteert een datum als Nederlandse datumstring.
 */
export function formatDate(date?: Date | string): string {
  if (!date) return "Onbekend";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Formatteert vierkante meters met eenheid.
 */
export function formatM2(value?: number | ""): string {
  if (typeof value === "string" || !value) return "Niet ingevuld";
  return `${value} m²`;
}

/**
 * Capitaliseert eerste letter van een string.
 */
export function capitalize(str?: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
