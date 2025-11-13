// /lib/expert/techniektips.ts
// ✅ Static tips voor ExpertCorner Techniek chapter

export const TECHNIEK_TIPS: Record<string, string[]> = {
  ventilationAmbition: [
    "Basis-ventilatie voldoet aan wettelijke eisen (hygiene). Comfort/Maximaal biedt beter binnenklimaat en minder energieverlies.",
    "Balansventilatie (type D met WTW) combineert comfort met energiebesparing door warmteterugwinning.",
  ],

  heatingAmbition: [
    "Basis = voldoen aan eisen. Comfort/Maximaal werkt beter met lage-temperatuur systemen (vloer, LT-radiatoren).",
    "Warmtepomp werkt efficiënter met hogere isolatie (RC ≥5) en lage-temperatuur afgifte.",
  ],

  coolingAmbition: [
    "Basis = geen actieve koeling. Eerst passief proberen (zonwering, massa, ventilatie).",
    "Actieve koeling verhoogt kosten en energieverbruik; begin met passieve maatregelen.",
  ],

  pvAmbition: [
    "Zonnepanelen werken beter op zuidelijke oriëntatie. Oost-west splits meer opbrengst.",
    "Rendabel na 10–12 jaar. Combineer met batterij voor maximale eigenverbruik.",
  ],

  currentState: [
    "Bestaand blijft: beperkte kosten, minder risico. Casco: meer werk, meer voordeel.",
    "Sloop en opnieuw: meeste vrijheid voor optimale energieprestatie.",
  ],

  buildMethod: [
    "Houtskeletbouw: snel, milieuvriendelijk, goed isoleerbaar.",
    "Traditioneel baksteen: traag, zware massa, goed voor thermische traagheid.",
    "Staalframe: flexibel, licht, vereist extra isolatie.",
  ],

  gasaansluiting: [
    "Gasloos/all-electric wordt standaard. Gas wordt uitgeleid in Nederland.",
    "Gas nu voorzien beperkt toekomstige opties; kies elektrisch waar mogelijk.",
  ],

  verwarming: [
    "CV-gas: goedkoop nu, duur later. Hybride/all-electric: duurder eerst, goedkoper op lange termijn.",
    "Warmtepomp kan 50–70% energie besparen vs gas, met goede isolatie.",
  ],

  afgiftesysteem: [
    "Lage-temperatuur (vloer, LT-radiatoren) is essentieel voor warmtepompen.",
    "Hoge-temperatuur radiatoren verlagen warmtepomp-efficiëntie tot 20%.",
  ],

  ventilatie: [
    "Natuurlijke ventilatie: simpel, no-cost, maar afhankelijk van weer.",
    "WTW (type D): 80% warmte-terugwinning; rendabel bij goede isolatie.",
  ],

  koeling: [
    "Passieve koeling: zonwering, thermische massa, nachtlucht. Gratis en stil.",
    "Actieve koeling: zware lasten op elektriciteit; alleen als echt nodig.",
  ],

  pvConfiguratie: [
    "Basis: 4–6 kWp (deel verbruik). Uitgebreid: 8–12 kWp. Nul-op-meter: 15+ kWp + batterij.",
    "Zorg voor voldoende dakoppervlak en zuidelijke oriëntatie.",
  ],

  batterijVoorziening: [
    "Batterij zonder PV: nutteloos. Wacht tot PV omvang bepaald is.",
    "Met PV: 5–10 kWh opslag geeft 40–60% eigenverbruik.",
  ],

  evVoorziening: [
    "V2G (vehicle-to-grid) is toekomst: auto's worden huisbatterij.",
    "Laadpunt nu voorzien (ruimte, kabel) scheelt tienduizenden later.",
  ],

  notes: [
    "Maak notities over geluidseisen, ruimtevereisten en onderhoudswensen.",
    "Deze info helpt architecht bij keuzes later.",
  ],

  showAdvanced: [
    "Geavanceerde opties stellen je in staat specifieke systemen vast te leggen.",
    "Nuttig als je concrete voorkeuren hebt of architectonische beperkingen.",
  ],
};