// components/premium/PremiumRoomInsights.tsx
// v3.x: Fase 5 – Premium ruimte-specifieke tips

"use client";

import React from "react";
import type { Room, LifestyleProfile } from "@/types/project";

interface PremiumRoomInsightsProps {
  room: Room;
  lifestyleProfile?: LifestyleProfile;
}

/**
 * Premium Room Insights component voor PvE rapport.
 *
 * Toont 1-2 praktische, contextuele tips per ruimte op basis van:
 * - Ruimte type (woonkamer, keuken, slaapkamer, etc.)
 * - Lifestyle profiel (family, work, cooking, hosting)
 * - Ruimte grootte (optioneel)
 *
 * BELANGRIJK: Veilig en neutraal, geen persoonlijke aannames.
 * Alleen tonen als er een relevante tip is, anders niets renderen.
 */
export default function PremiumRoomInsights({
  room,
  lifestyleProfile,
}: PremiumRoomInsightsProps) {
  const tips = generateRoomTips(room, lifestyleProfile);

  // Alleen tonen als er daadwerkelijk tips zijn
  if (tips.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h5 className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-1.5">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        Tips voor deze ruimte
      </h5>
      <div className="space-y-2">
        {tips.map((tip, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <span className="text-blue-600 text-xs flex-shrink-0 mt-0.5">•</span>
            <p className="text-xs text-blue-800">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Genereert contextual tips op basis van ruimte type en lifestyle profiel.
 * Veilig, generiek, en alleen relevante tips.
 */
function generateRoomTips(
  room: Room,
  lifestyleProfile?: LifestyleProfile
): string[] {
  const tips: string[] = [];
  const roomType = room.type?.toLowerCase() || "";
  const roomName = room.name?.toLowerCase() || "";
  const m2 = typeof room.m2 === "number" ? room.m2 : null;

  // Helper om ruimte type te detecteren
  const isLivingRoom =
    roomType.includes("woonkamer") ||
    roomName.includes("woonkamer") ||
    roomName.includes("living");
  const isKitchen =
    roomType.includes("keuken") || roomName.includes("keuken");
  const isBedroom =
    roomType.includes("slaapkamer") || roomName.includes("slaapkamer");
  const isStudy =
    roomType.includes("studeerkamer") ||
    roomName.includes("studeerkamer") ||
    roomName.includes("werkkamer") ||
    roomName.includes("kantoor");
  const isBathroom =
    roomType.includes("badkamer") || roomName.includes("badkamer");
  const isGarden =
    roomType.includes("tuin") || roomName.includes("tuin");
  const isChildRoom =
    roomName.includes("kinderkamer") || roomName.includes("kind");

  // === WOONKAMER ===
  if (isLivingRoom) {
    // Familie met kinderen → verbinding binnen-buiten
    if (
      lifestyleProfile?.family === "jonge_kinderen" ||
      lifestyleProfile?.family === "basisschool_kinderen"
    ) {
      tips.push(
        "Gezinnen met kinderen waarderen een lage drempel of directe verbinding naar de tuin. Dit vergroot de leefruimte en zorgt voor overzicht."
      );
    }

    // Hosting profiel → ruimte en flow
    if (
      lifestyleProfile?.hosting === "kleine_groepen" ||
      lifestyleProfile?.hosting === "grote_groepen"
    ) {
      tips.push(
        "Bij regelmatig ontvangen: overweeg een open verbinding naar keuken/eetruimte voor betere flow tijdens sociale momenten."
      );
    }

    // Kleine woonkamer → praktische tip
    if (m2 !== null && m2 < 25) {
      tips.push(
        "Kleinere woonkamers (< 25m²) vragen om slim meubileren. Denk aan multifunctionele meubels en voldoende natuurlijk licht om ruimtelijkheid te behouden."
      );
    }
  }

  // === KEUKEN ===
  if (isKitchen) {
    // Cooking profiel → kookeiland/werkruimte
    if (
      lifestyleProfile?.cooking === "hobbykok" ||
      lifestyleProfile?.cooking === "fanatiek"
    ) {
      tips.push(
        "Enthousiaste koks waarderen voldoende aanrechtruimte, een goed werkdriehoek (fornuis-spoelbak-koelkast) en eventueel een kookeiland voor voorbereidingen."
      );
    }

    // Familie → sociale keuken
    if (
      lifestyleProfile?.family === "jonge_kinderen" ||
      lifestyleProfile?.family === "basisschool_kinderen"
    ) {
      tips.push(
        "Gezinnen profiteren van een keuken met zicht op leefruimte, zodat u kunt koken en tegelijkertijd toezicht houdt."
      );
    }

    // Grote keuken → eilandmogelijkheid
    if (m2 !== null && m2 > 15) {
      tips.push(
        "Bij grotere keukens (> 15m²) kan een kookeiland of werkeiland de functionaliteit en gezelligheid flink verbeteren."
      );
    }
  }

  // === STUDEERKAMER / WERKKAMER ===
  if (isStudy) {
    // Thuiswerkers → akoestiek en afstand
    if (
      lifestyleProfile?.work === "regelmatig" ||
      lifestyleProfile?.work === "af_en_toe"
    ) {
      tips.push(
        "Voor thuiswerkers: een afsluitbare ruimte op afstand van drukke leefruimtes helpt concentratie en privacy. Let ook op goede verlichtings- en akoestische voorzieningen."
      );
    }

    // Videobellen → daglicht en achtergrond
    if (lifestyleProfile?.work === "regelmatig") {
      tips.push(
        "Bij videobellen: zorg voor voldoende natuurlijk licht (bij voorkeur zijlicht) en een neutrale achtergrond."
      );
    }
  }

  // === SLAAPKAMER ===
  if (isBedroom) {
    // Kleine slaapkamer → efficiënt gebruik
    if (m2 !== null && m2 < 12) {
      tips.push(
        "Kleinere slaapkamers (< 12m²) vragen om slim gebruik van inbouwkasten en verhoogde bedden voor extra bergruimte."
      );
    }

    // Algemeen → comfort
    if (!isChildRoom) {
      tips.push(
        "Voor slaapkamers geldt: goede verduistering, stille vloeren (zwevend parket of tapijt) en ventilatie zijn essentieel voor slaapcomfort."
      );
    }
  }

  // === KINDERKAMER ===
  if (isChildRoom) {
    tips.push(
      "Kinderkamers groeien mee: plan flexibele bergruimte en neutraal kleurgebruik, zodat de ruimte makkelijk aanpast aan de leeftijd."
    );

    if (m2 !== null && m2 < 10) {
      tips.push(
        "Kleine kinderkamers: overweeg hoogslaper of halfhoogslaper om speelruimte onder het bed te creëren."
      );
    }
  }

  // === BADKAMER ===
  if (isBathroom) {
    // Familie met kinderen → praktisch
    if (
      lifestyleProfile?.family === "jonge_kinderen" ||
      lifestyleProfile?.family === "basisschool_kinderen"
    ) {
      tips.push(
        "Gezinnen waarderen een praktische badkamer: douche én bad, voldoende bergruimte, en een gemakkelijk schoon te maken vloer."
      );
    }

    // Algemeen → ventilatie
    tips.push(
      "Goede ventilatie (mechanisch of raam) is cruciaal in badkamers om vochtproblemen en schimmel te voorkomen."
    );
  }

  // === TUIN ===
  if (isGarden) {
    // Familie → kindvriendelijk
    if (
      lifestyleProfile?.family === "jonge_kinderen" ||
      lifestyleProfile?.family === "basisschool_kinderen"
    ) {
      tips.push(
        "Gezinnen met kinderen: overweeg een vlak grasveld voor spelen, en een overdekt terras voor alle weersomstandigheden."
      );
    }

    // Hosting → buitenkeuken/lounge
    if (
      lifestyleProfile?.hosting === "kleine_groepen" ||
      lifestyleProfile?.hosting === "grote_groepen"
    ) {
      tips.push(
        "Bij regelmatig ontvangen in de tuin: een vaste BBQ-plek of buitenkeuken en voldoende zitruimte in de schaduw maken het verschil."
      );
    }
  }

  // Beperk tot maximaal 2 tips (zoals gespecificeerd)
  return tips.slice(0, 2);
}
