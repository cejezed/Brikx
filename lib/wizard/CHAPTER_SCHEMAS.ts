// /lib/wizard/CHAPTER_SCHEMAS.ts
// ✅ v3.2 PRODUCTION-READY: Alle 5 pragmatische fixes doorgevoerd
// - undefined = OK (niet invalid)
// - Strict enum checking
// - 100% chapter coverage
// - Zero unnecessary imports
// - Consistent naming

import type { 
  ChapterKey, 
  BasisData,
  RuimtesData,
  WensenData,
  BudgetData,
  TechniekData,
  DuurzaamData,
  RisicoData,
} from "@/types/project";

/**
 * ✅ v3.2 PRODUCTION VALIDATOR
 * 
 * Principles:
 * - `undefined` chapter = "not yet filled in" = VALID ✅
 * - `null` or invalid type = INVALID ❌
 * - All enum checks are strict (no loose type coercion)
 * - Zero unnecessary imports
 */

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Check if value is valid enum member or undefined.
 * ✅ FIX #2: Strict type checking (no String() coercion of null)
 */
function isValidEnum(value: any, enumValues: readonly string[]): boolean {
  if (value === undefined) return true;
  if (typeof value !== 'string') return false;
  return enumValues.includes(value);
}

/**
 * Check if value is boolean or undefined
 */
function isValidBool(value: any): boolean {
  return value === undefined || typeof value === 'boolean';
}

/**
 * Check if value is string or undefined
 */
function isValidString(value: any): boolean {
  return value === undefined || typeof value === 'string';
}

/**
 * Check if value is number or undefined
 */
function isValidNumber(value: any): boolean {
  return value === undefined || typeof value === 'number';
}

// ============================================================================
// ENUM CONSTANTS
// ============================================================================

const ENUM = {
  BASIS_PROJECT_TYPE: ['nieuwbouw', 'verbouwing', 'bijgebouw', 'hybride', 'anders'] as const,
  BASIS_PROJECT_SIZE: ['<75m2', '75-150m2', '150-250m2', '>250m2'] as const,
  BASIS_URGENCY: ['<3mnd', '3-6mnd', '6-12mnd', '>12mnd', 'onzeker'] as const,
  BASIS_ERVARING: ['starter', 'enigszins', 'ervaren'] as const,

  WISH_CATEGORY: ['comfort', 'style', 'function', 'other'] as const,
  WISH_PRIORITY: ['must', 'nice', 'optional'] as const,

  TECH_AMBITION: ['unknown', 'basis', 'comfort', 'max'] as const,
  TECH_CURRENT_STATE: ['unknown', 'bestaand_blijft', 'casco_aanpak', 'sloop_en_opnieuw'] as const,
  TECH_BUILD_METHOD: ['unknown', 'traditioneel_baksteen', 'houtskeletbouw', 'staalframe', 'anders'] as const,
  TECH_HEATING: ['onbekend', 'cv_gas', 'hybride_warmtepomp', 'all_electric_warmtepomp', 'stadswarmte', 'anders'] as const,
  TECH_AFGIFTE: ['onbekend', 'radiatoren_hoog_temp', 'radiatoren_lage_temp', 'vloerverwarming', 'vloer_wand_plafond', 'anders'] as const,
  TECH_VENTILATION: ['onbekend', 'natuurlijk', 'mechanisch_afvoer', 'balans_wtw'] as const,
  TECH_COOLING: ['onbekend', 'geen', 'passieve_koeling', 'actieve_koeling_warmtepomp'] as const,
  TECH_PV: ['onbekend', 'geen', 'basis', 'uitgebreid', 'nul_op_de_meter'] as const,
  TECH_EV: ['geen', 'voorbereid', 'laadpunt', 'laadpunt_bidirectioneel'] as const,
  TECH_BATTERY: ['geen', 'voorbereid', 'batterij_gepland'] as const,
  TECH_LIGHTING: ['none', 'zones', 'scenes', 'human_centric'] as const,
  TECH_SHADING: ['none', 'motor_manual', 'motor_sun_temp', 'motor_domotica'] as const,
  TECH_SECURITY: ['none', 'standalone', 'connected', 'monitored'] as const,
  TECH_RESISTANCE: ['rc2', 'rc3'] as const,
  TECH_NETWORK: ['none', 'ethernet_cat6', 'fiber'] as const,

  DUURZAAM_ENERGIE: ['onbekend', 'gasloos', 'hybride', 'volledig_all_electric'] as const,
  DUURZAAM_LABEL: ['A', 'A+', 'A++', 'A+++', 'A++++', 'B', 'C', 'D', 'E', 'F', 'G'] as const,
  DUURZAAM_AMBITION: ['bouwbesluit', 'hoger'] as const,
  DUURZAAM_GLAS: ['dubbel', 'hr++', 'triple', 'anders'] as const,
  DUURZAAM_VENTKLASSE: ['A', 'B', 'C'] as const,
  DUURZAAM_DAGLICHT_METRIC: ['DA', 'UDI', 'factor'] as const,
  DUURZAAM_ZONNEPANELEN: ['geen', 'beperkt', 'ruim_voldoende', 'nul_op_de_meter'] as const,
  DUURZAAM_BATTERIJ: ['geen', 'overwegen', 'ja_korte_termijn'] as const,
  DUURZAAM_ZONNEPANEL_ORIENT: ['zuid', 'oost', 'west', 'oost-west', 'noord', 'gemengd'] as const,
  DUURZAAM_REGENWAT: ['geen', 'tuin', 'toilet_en_was', 'maximaal'] as const,
  DUURZAAM_GRIJS: ['geen', 'voorbereiding', 'individueel_systeem', 'collectief_systeem'] as const,
  DUURZAAM_MATERIAAL: ['standaard', 'deels_biobased', 'overwegend_biobased_circulair'] as const,
  DUURZAAM_PRIORITEIT: ['laag', 'normaal', 'hoog', 'zeer_hoog'] as const,

  RISK_SEVERITY: ['laag', 'medium', 'hoog'] as const,
  RISK_TYPE: ['planning', 'budget', 'quality', 'technical', 'other'] as const,
} as const;

// ============================================================================
// VALIDATORS
// ============================================================================

export const CHAPTER_SCHEMAS = {
  // --- BASIS ---
  basis: {
    validate: (data: any): data is BasisData => {
      // ✅ FIX #1: undefined chapter = "not yet filled" = VALID
      if (data === undefined) return true;
      if (typeof data !== 'object' || data === null) return false;
      
      // projectType is REQUIRED when chapter is present
      if (!ENUM.BASIS_PROJECT_TYPE.includes(data.projectType)) {
        return false;
      }
      
      // Optional fields
      if (!isValidString(data.projectNaam)) return false;
      if (!isValidString(data.locatie)) return false;
      if (!isValidEnum(data.projectSize, ENUM.BASIS_PROJECT_SIZE)) return false;
      if (!isValidEnum(data.urgency, ENUM.BASIS_URGENCY)) return false;
      if (!isValidEnum(data.ervaring, ENUM.BASIS_ERVARING)) return false;
      if (!isValidString(data.toelichting)) return false;
      if (!isValidNumber(data.budget)) return false;
      
      return true;
    }
  },

  // --- RUIMTES ---
  ruimtes: {
    validate: (data: any): data is RuimtesData => {
      if (data === undefined) return true;
      if (typeof data !== 'object' || data === null) return false;
      if (!Array.isArray(data.rooms)) return false;
      
      for (const room of data.rooms) {
        if (typeof room !== 'object' || room === null) return false;
        if (typeof room.id !== 'string' || !room.id) return false;
        if (typeof room.name !== 'string') return false;
        if (!isValidString(room.type)) return false;
        if (!isValidString(room.group)) return false;
        if (room.m2 !== undefined && (typeof room.m2 !== 'number' && room.m2 !== '')) return false;
        if (room.wensen !== undefined && !Array.isArray(room.wensen)) return false;
        if (!isValidNumber(room.count)) return false;
      }
      
      return true;
    }
  },

  // --- WENSEN ---
  wensen: {
    validate: (data: any): data is WensenData => {
      if (data === undefined) return true;
      if (typeof data !== 'object' || data === null) return false;
      if (!Array.isArray(data.wishes)) return false;

      for (const wish of data.wishes) {
        if (typeof wish !== 'object' || wish === null) return false;
        if (typeof wish.id !== 'string' || !wish.id) return false;
        // ✅ Allow empty string for text (user hasn't filled it in yet)
        if (typeof wish.text !== 'string') return false;
        // ✅ Category is optional - user may not have set it yet
        if (wish.category !== undefined && !isValidEnum(wish.category, ENUM.WISH_CATEGORY)) return false;
        if (!isValidEnum(wish.priority, ENUM.WISH_PRIORITY)) return false;
      }

      return true;
    }
  },

  // --- BUDGET ---
  budget: {
    validate: (data: any): data is BudgetData => {
      if (data === undefined) return true;
      if (typeof data !== 'object' || data === null) return false;
      
      if (!isValidNumber(data.budgetTotaal)) return false;
      if (!isValidNumber(data.eigenInbreng)) return false;
      if (!isValidNumber(data.contingency)) return false;
      if (!isValidString(data.notes)) return false;
      
      if (data.bandbreedte !== undefined) {
        if (!Array.isArray(data.bandbreedte) || data.bandbreedte.length !== 2) return false;
        const [min, max] = data.bandbreedte;
        if ((min !== null && typeof min !== 'number') || (max !== null && typeof max !== 'number')) return false;
      }
      
      return true;
    }
  },

  // --- TECHNIEK (v3.2) ---
  techniek: {
    validate: (data: any): data is TechniekData => {
      // ✅ FIX #1: undefined = OK (not yet filled)
      if (data === undefined) return true;
      if (typeof data !== 'object' || data === null) return false;

      // Ambitie-velden
      if (!isValidEnum(data.ventilationAmbition, ENUM.TECH_AMBITION)) return false;
      if (!isValidEnum(data.heatingAmbition, ENUM.TECH_AMBITION)) return false;
      if (!isValidEnum(data.coolingAmbition, ENUM.TECH_AMBITION)) return false;
      if (!isValidEnum(data.pvAmbition, ENUM.TECH_AMBITION)) return false;

      // Context
      if (!isValidEnum(data.currentState, ENUM.TECH_CURRENT_STATE)) return false;
      if (!isValidEnum(data.buildMethod, ENUM.TECH_BUILD_METHOD)) return false;

      // Toggler
      if (!isValidBool(data.showAdvanced)) return false;

      // Verwarming/afgifte/ventilatie/koeling
      if (!isValidBool(data.gasaansluiting)) return false;
      if (!isValidEnum(data.verwarming, ENUM.TECH_HEATING)) return false;
      if (!isValidEnum(data.afgiftesysteem, ENUM.TECH_AFGIFTE)) return false;
      if (!isValidEnum(data.ventilatie, ENUM.TECH_VENTILATION)) return false;
      if (!isValidEnum(data.koeling, ENUM.TECH_COOLING)) return false;
      
      // PV/batterij/EV
      if (!isValidEnum(data.pvConfiguratie, ENUM.TECH_PV)) return false;
      if (!isValidEnum(data.batterijVoorziening, ENUM.TECH_BATTERY)) return false;
      if (!isValidEnum(data.evVoorziening, ENUM.TECH_EV)) return false;

      // Domotica & verlichting
      if (!isValidEnum(data.lightingControl, ENUM.TECH_LIGHTING)) return false;
      if (!isValidBool(data.presenceSensors)) return false;
      if (!isValidBool(data.taskLighting)) return false;
      
      // Zonwering & daglichtsturing
      if (!isValidEnum(data.shadingControl, ENUM.TECH_SHADING)) return false;
      if (!isValidBool(data.externalShading)) return false;
      if (!isValidBool(data.daylightSensors)) return false;

      // Beveiliging & inbraakwerendheid
      if (!isValidEnum(data.securityAlarm, ENUM.TECH_SECURITY)) return false;
      if (!isValidEnum(data.resistanceClass, ENUM.TECH_RESISTANCE)) return false;
      if (!isValidBool(data.cctv)) return false;
      
      // Brandveiligheid
      if (!isValidBool(data.linkedSmokeDetectors)) return false;
      if (!isValidBool(data.coDetectors)) return false;
      if (!isValidBool(data.alarmAppIntegration)) return false;

      // Geluid & plaatsing
      if (!isValidBool(data.noiseConstraintOutdoor)) return false;
      if (!isValidBool(data.acousticDecoupling)) return false;
      if (!isValidBool(data.vibrationDamping)) return false;

      // Netwerk & data
      if (!isValidEnum(data.networkBackbone, ENUM.TECH_NETWORK)) return false;
      if (!isValidBool(data.meshWifi)) return false;
      if (!isValidBool(data.wiredDrops)) return false;

      // PvE-notes
      if (!isValidString(data.notes)) return false;

      return true;
    }
  },

  // --- DUURZAAM (v3.2) ---
  duurzaam: {
    validate: (data: any): data is DuurzaamData => {
      // ✅ FIX #1: undefined = OK (not yet filled)
      if (data === undefined) return true;
      if (typeof data !== 'object' || data === null) return false;

      // Energieconcept
      if (!isValidEnum(data.energievoorziening, ENUM.DUURZAAM_ENERGIE)) return false;
      if (!isValidEnum(data.energieLabel, ENUM.DUURZAAM_LABEL)) return false;

      // Schil & prestatie - Ambitie
      if (!isValidEnum(data.rcGevelAmbitie, ENUM.DUURZAAM_AMBITION)) return false;
      if (!isValidEnum(data.rcDakAmbitie, ENUM.DUURZAAM_AMBITION)) return false;
      if (!isValidEnum(data.rcVloerAmbitie, ENUM.DUURZAAM_AMBITION)) return false;
      if (!isValidEnum(data.uGlasAmbitie, ENUM.DUURZAAM_AMBITION)) return false;
      if (!isValidEnum(data.n50Ambitie, ENUM.DUURZAAM_AMBITION)) return false;
      if (!isValidEnum(data.gWaardeAmbitie, ENUM.DUURZAAM_AMBITION)) return false;

      // Schil & prestatie - Waarden
      if (!isValidNumber(data.rcGevel)) return false;
      if (!isValidNumber(data.rcDak)) return false;
      if (!isValidNumber(data.rcVloer)) return false;
      if (!isValidNumber(data.uGlas)) return false;
      if (!isValidNumber(data.n50)) return false;
      if (!isValidNumber(data.gWaarde)) return false;
      if (!isValidBool(data.blowerdoorTestUitvoeren)) return false;
      if (!isValidEnum(data.typeGlas, ENUM.DUURZAAM_GLAS)) return false;

      // IAQ - ✅ v3.8: Fixed to match camelCase in types/project.ts
      if (!isValidEnum(data.iaqAmbitie, ENUM.DUURZAAM_AMBITION)) return false;
      if (!isValidNumber(data.co2TargetPpm)) return false;
      if (!isValidEnum(data.ventilatieklasse, ENUM.DUURZAAM_VENTKLASSE)) return false;
      if (!isValidBool(data.iaqMonitoring)) return false;

      // Daglicht - ✅ v3.8: Fixed to match camelCase in types/project.ts
      if (!isValidEnum(data.daglichtAmbitie, ENUM.DUURZAAM_AMBITION)) return false;
      if (!isValidEnum(data.daglichtMetric, ENUM.DUURZAAM_DAGLICHT_METRIC)) return false;
      if (!isValidNumber(data.daglichtStreefwaarde)) return false;
      if (!isValidBool(data.zonwerendGlasToepassen)) return false;

      // Akoestiek - ✅ v3.8: Fixed to match camelCase in types/project.ts
      if (!isValidEnum(data.akoestiekAmbitie, ENUM.DUURZAAM_AMBITION)) return false;
      if (!isValidNumber(data.akoestiekBinnenDnTw)) return false;
      if (!isValidNumber(data.akoestiekContactLnTw)) return false;

      // Opwek & opslag
      if (!isValidEnum(data.zonnepanelen, ENUM.DUURZAAM_ZONNEPANELEN)) return false;
      if (!isValidNumber(data.zonnepanelenOppervlak)) return false;
      if (!isValidEnum(data.zonnepanelenOrientatie, ENUM.DUURZAAM_ZONNEPANEL_ORIENT)) return false;
      if (!isValidEnum(data.thuisbatterij, ENUM.DUURZAAM_BATTERIJ)) return false;
      if (!isValidEnum(data.evLaadpunt, ENUM.TECH_EV)) return false; // Matches Techniek enum
      if (!isValidBool(data.v2gVoorbereid)) return false;

      // Stadswarmte
      if (!isValidBool(data.stadswarmteBeschikbaar)) return false;
      if (!isValidBool(data.stadswarmteGeinteresseerd)) return false;

      // Water
      if (!isValidEnum(data.regenwaterHerbruik, ENUM.DUURZAAM_REGENWAT)) return false;
      if (!isValidEnum(data.grijswaterVoorziening, ENUM.DUURZAAM_GRIJS)) return false;
      if (!isValidNumber(data.groendakOppervlak)) return false;
      if (!isValidBool(data.waterRetentieTuin)) return false;

      // Materialen
      if (!isValidEnum(data.materiaalstrategie, ENUM.DUURZAAM_MATERIAAL)) return false;
      if (!isValidBool(data.demontabelConstrueren)) return false;
      if (!isValidNumber(data.mpgAmbitie)) return false;
      if (!isValidString(data.mpgToelichting)) return false;

      // Toekomst - ✅ v3.8: Fixed flexibelIndeling to match types/project.ts
      if (!isValidBool(data.klimaatadaptief)) return false;
      if (!isValidBool(data.flexibelIndeling)) return false;
      if (!isValidBool(data.installatiesToekomstgericht)) return false;

      // Meta
      if (!isValidEnum(data.prioriteit, ENUM.DUURZAAM_PRIORITEIT)) return false;
      if (!isValidString(data.opmerkingen)) return false;
      if (!isValidNumber(data.epcOfBengDoel)) return false;
      if (!isValidString(data.bengToelichting)) return false;
      
      return true;
    }
  },

  // --- RISICO ---
  risico: {
    validate: (data: any): data is RisicoData => {
      // ✅ FIX #1: undefined = OK (not yet filled)
      if (data === undefined) return true;
      if (typeof data !== 'object' || data === null) return false;
      if (!Array.isArray(data.risks)) return false;
      
      for (const risk of data.risks) {
        if (typeof risk !== 'object' || risk === null) return false;
        if (typeof risk.id !== 'string' || !risk.id) return false;
        if (typeof risk.description !== 'string' || !risk.description) return false;
        
        // Severity is REQUIRED
        if (!ENUM.RISK_SEVERITY.includes(risk.severity)) return false;
        
        if (!isValidString(risk.mitigation)) return false;
        if (risk.related !== undefined) {
          if (!Array.isArray(risk.related)) return false;
          if (!risk.related.every((r: unknown) => typeof r === 'string')) return false;
        }
        if (!isValidEnum(risk.type, ENUM.RISK_TYPE)) return false;
      }
      
      return true;
    }
  }
} as const;

/**
 * Main validator function
 * 
 * ✅ Returns:
 * - `true` if valid (including undefined = "not filled yet")
 * - `false` + console warning if invalid
 */
export function validateChapter(
  chapter: ChapterKey,
  data: any
): boolean {
  const schema = CHAPTER_SCHEMAS[chapter];
  
  if (!schema) {
    console.warn(`[validateChapter] Unknown chapter: ${chapter}`);
    return false;
  }
  
  // @ts-ignore (schema.validate signature differs per chapter, but all valid)
  const isValid = schema.validate(data);
  
  if (!isValid) {
    console.warn(
      `[validateChapter] Validation FAILED for chapter "${chapter}"`,
      { receivedData: data }
    );
  }
  
  return isValid;
}