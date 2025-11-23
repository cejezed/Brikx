// lib/domain/lifestyle.ts
// ✅ v3.8: Domeinlogica voor leefprofielen en projectscope

import type {
  BasisData,
  FamilyProfile,
  LifestyleProfile,
  ProjectScope,
  WorkFromHomeProfile,
  CookingProfile,
  HostingProfile,
  PetsProfile,
  NoiseProfile,
  MobilityProfile,
  TidyProfile,
} from "@/types/project";

// ------------------------------------------------------------
// Project scope-profiling
// ------------------------------------------------------------

export type ProjectScopeProfile = {
  isMainResidence: boolean;
  isAuxiliaryBuilding: boolean;
  relevanceChildren: boolean;
  relevanceAcoustics: boolean;
  relevanceHospitality: boolean;
  relevanceStorage: boolean;
  relevanceDailyRoutines: boolean;
};

export function deriveScopeProfile(scope?: ProjectScope | null): ProjectScopeProfile {
  switch (scope) {
    case "nieuwe_woning":
      return {
        isMainResidence: true,
        isAuxiliaryBuilding: false,
        relevanceChildren: true,
        relevanceAcoustics: true,
        relevanceHospitality: true,
        relevanceStorage: true,
        relevanceDailyRoutines: true,
      };
    case "uitbouw":
    case "dakopbouw":
    case "renovatie":
    case "interieur":
      return {
        isMainResidence: true,
        isAuxiliaryBuilding: false,
        relevanceChildren: true,
        relevanceAcoustics: true,
        relevanceHospitality: true,
        relevanceStorage: true,
        relevanceDailyRoutines: true,
      };
    case "garage":
    case "schuur":
    case "tuinhuis":
      return {
        isMainResidence: false,
        isAuxiliaryBuilding: true,
        relevanceChildren: false,
        relevanceAcoustics: false,
        relevanceHospitality: false,
        relevanceStorage: true,
        relevanceDailyRoutines: false,
      };
    case "dakkapel":
      return {
        isMainResidence: true,
        isAuxiliaryBuilding: false,
        relevanceChildren: false,
        relevanceAcoustics: true,
        relevanceHospitality: false,
        relevanceStorage: false,
        relevanceDailyRoutines: true,
      };
    default:
      return {
        isMainResidence: false,
        isAuxiliaryBuilding: false,
        relevanceChildren: false,
        relevanceAcoustics: false,
        relevanceHospitality: false,
        relevanceStorage: true,
        relevanceDailyRoutines: false,
      };
  }
}

// ------------------------------------------------------------
// Family profile (kinderen, leeftijden)
// ------------------------------------------------------------

export function deriveFamilyProfile(basis?: Partial<BasisData> | null): FamilyProfile {
  const groups = basis?.kinderenLeeftijdsgroepen ?? [];

  if (!groups.length || groups.includes("geen_kinderen")) {
    return "geen_kinderen";
  }

  const hasYoung = groups.some((g) => g === "0-4" || g === "4-8");
  const hasPrimary = groups.includes("8-12");
  const hasTeen =
    groups.includes("12-16") || groups.includes("16-20") || groups.includes("20plus");

  const count =
    Number(hasYoung) +
    Number(hasPrimary) +
    Number(hasTeen);

  if (count > 1) return "mix_kinderen";
  if (hasYoung) return "jonge_kinderen";
  if (hasPrimary) return "basisschool_kinderen";
  if (hasTeen) return "pubers";

  return "onbekend";
}

// ------------------------------------------------------------
// Default helpers voor lifestyle subprofielen
// ------------------------------------------------------------

function defaultWorkProfile(v?: WorkFromHomeProfile): WorkFromHomeProfile {
  return v ?? "niet";
}

function defaultCookingProfile(v?: CookingProfile): CookingProfile {
  return v ?? "basis";
}

function defaultHostingProfile(v?: HostingProfile): HostingProfile {
  return v ?? "kleine_groepen";
}

function defaultPetsProfile(v?: PetsProfile): PetsProfile {
  return v ?? "geen";
}

function defaultNoiseProfile(v?: NoiseProfile): NoiseProfile {
  return v ?? "neutraal";
}

function defaultMobilityProfile(v?: MobilityProfile): MobilityProfile {
  return v ?? "fit";
}

function defaultTidyProfile(v?: TidyProfile): TidyProfile {
  return v ?? "gemiddeld";
}

// ------------------------------------------------------------
// Hoofdprofiel dat we richting de LLM sturen
// ------------------------------------------------------------

export function deriveLifestyleProfile(basis?: Partial<BasisData> | null): LifestyleProfile {
  return {
    family: deriveFamilyProfile(basis),
    work: defaultWorkProfile(basis?.workFromHome),
    cooking: defaultCookingProfile(basis?.cookingProfile),
    hosting: defaultHostingProfile(basis?.hostingProfile),
    pets: defaultPetsProfile(basis?.petsProfile),
    noise: defaultNoiseProfile(basis?.noiseProfile),
    mobility: defaultMobilityProfile(basis?.mobilityProfile),
    tidiness: defaultTidyProfile(basis?.tidyProfile),
  };
}
