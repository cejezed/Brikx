import { ProjectData } from './types';

export const MOCK_DATA: ProjectData = {
  meta: {
    projectName: "Herenhuis 't Hof",
    type: "Verbouwing & Verduurzaming",
    date: "25 oktober 2023",
    version: "v1.0",
    clientName: "Fam. Jansen",
    location: "Utrecht (Oost)",
  },
  context: {
    description: "Transformatie van een gedateerd herenhuis naar een moderne, energiezuinige gezinswoning. De focus ligt op het verbinden van de leefruimtes op de begane grond en het creëren van een hoogwaardige thuiswerkplek.",
    experienceLevel: "Eerste grootschalige verbouwing",
    planning: "Wens start bouw: Q2 2024",
  },
  ambitions: {
    architectural: [
      "Behoud van authentieke details (en-suite deuren, ornamenten).",
      "Moderne, strakke uitbouw aan achterzijde die contrasteert met bestaande bouw.",
      "Maximale lichtinval door gebruik van kamerhoge puien.",
    ],
    functional: [
      "Open leefkeuken als centraal hart van het huis.",
      "Scheiding tussen 'rumoerig' leven (keuken/speel) en rust (zithoek).",
      "Efficiënte routing voor was en opslag.",
    ],
    personal: [
      "Ruimte moet geschikt zijn voor gezin met 3 opgroeiende kinderen.",
      "Akoestiek is een belangrijk aandachtspunt i.v.m. thuiswerken.",
    ],
  },
  program: [
    { id: '1', name: 'Woonkeuken', count: 1, area: 45, notes: 'Incl. kookeiland en eettafel voor 8p' },
    { id: '2', name: 'Zithoek (voorzijde)', count: 1, area: 25, notes: 'Focus op rust, haard wenselijk' },
    { id: '3', name: 'Bijkeuken', count: 1, area: 8, notes: 'Directe toegang tot tuin, plek voor wasmachine' },
    { id: '4', name: 'Werkkamer', count: 1, area: 12, notes: 'Akoestisch gescheiden, zicht op tuin' },
    { id: '5', name: 'Slaapkamers', count: 3, area: 14, notes: 'Gemiddeld 14m2 per kamer' },
    { id: '6', name: 'Master Suite', count: 1, area: 30, notes: 'Incl. inloopkast en en-suite badkamer' },
    { id: '7', name: 'Badkamer (kinderen)', count: 1, area: 8, notes: 'Dubbele wastafel, bad en douche' },
  ],
  wishes: [
    { id: '1', category: 'Keuken', description: 'Quooker en inbouw koffieautomaat', priority: 'Nice' },
    { id: '2', category: 'Keuken', description: 'Kookeiland met barfunctie', priority: 'Must' },
    { id: '3', category: 'Installaties', description: 'Vloerverwarming op gehele BG', priority: 'Must' },
    { id: '4', category: 'Afwerking', description: 'Gietvloer in de aanbouw', priority: 'Optioneel' },
    { id: '5', category: 'Exterieur', description: 'Houten gevelbekleding (vergrijzend)', priority: 'Nice' },
  ],
  budget: {
    rangeStart: 250000,
    rangeEnd: 300000,
    disclaimer: "Dit betreft een taakstellend budget voor de bouwkosten incl. BTW, excl. advieskosten en leges.",
    selfWork: "Sloopwerkzaamheden worden in eigen beheer uitgevoerd (reservering: €5.000).",
  },
  technical: [
    { category: 'Isolatie', current: 'Gevelisolatie ontbreekt, dak matig.', attention: 'Na-isolatie vereist zorgvuldige detaillering i.v.m. vocht.' },
    { category: 'Ventilatie', current: 'Natuurlijke ventilatie (roosters).', attention: 'Onderzoek naar balansventilatie (WTW) of mechanische afvoer type C.' },
    { category: 'Warmteopwekking', current: 'CV-ketel (2015).', attention: 'Voorbereiding op Hybrid Heatpump wenselijk.' },
  ],
  risks: [
    { type: 'Techniek', description: 'Staat van de fundering onbekend.', consequence: 'Mogelijk funderingsherstel nodig.', mitigation: 'Funderingsonderzoek uitvoeren in fase 1.' },
    { type: 'Planning', description: 'Lange levertijd warmtepomp/kozijnen.', consequence: 'Vertraging in oplevering.', mitigation: 'Materialen tijdig bestellen, definitieve keuze naar voren halen.' },
  ]
};