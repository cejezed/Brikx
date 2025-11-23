// kennisbank_geordend2.data.ts

/**
 * Brikx Kennisbank v2 – Single Source of Truth
 *
 * - Kennisblokken (KennisItem) met:
 *   id, chapter, titel, samenvatting, inhoud, tags
 * - Chapters = thematische lagen (1–7), gemapt naar wizard-stappen via knowledgeMapping.ts
 * - inhoud = volledige, bruikbare tekst (mini-artikel), geen meta-uitleg
 */

export const ONDERWERPEN = [
  'proces',
  'locatie',
  'vergunningen',
  'financien',
  'ontwerp',
  'professionals',
  'uitvoering',
  'duurzaamheid',
  'tools',
  'risico', // ✅ v3.9: Added for risk-related knowledge items
] as const;

export const PROJECTSOORTEN = ['nieuwbouw', 'verbouw', 'aanbouw'] as const;

export type Onderwerp = (typeof ONDERWERPEN)[number];
export type Projectsoort = (typeof PROJECTSOORTEN)[number];

export type KennisItem = {
  id: string;
  chapter: number; // thematisch hoofdstuk (1–7)
  titel: string;
  samenvatting: string;
  inhoud: string; // mini-essay / kennisblok
  tags: {
    onderwerpen: Onderwerp[];
    projectsoorten: Projectsoort[];
  };
};

export const kennisbankData: KennisItem[] = [
  // =====================================================================
  // 1. ALGEMEEN PROCES  (wizard: basis)
  // =====================================================================

  {
    id: 'proces_start_project',
    chapter: 1,
    titel: 'Start van je (ver)bouwproject: drie vaste pijlers',
    samenvatting:
      'Een sterk project begint met een duidelijk PvE, een realistisch budget en helderheid over locatie en regels.',
    inhoud: `
Een woonhuis bouwen of verbouwen doe je meestal één keer. Juist daarom is de start cruciaal.

Drie pijlers:
1. **Programma van Eisen (PvE)** – hoe leef je, welke ruimtes heb je nodig, welke sfeer, welk comfort?
2. **Budget** – wat kun je en wil je uitgeven, inclusief alle bijkomende kosten, niet alleen de aanneemsom.
3. **Locatie & regels** – wat mag er op die plek, welke beperkingen en kansen bepalen het ontwerp?

Wie direct begint met schetsen of offertes zonder deze pijlers, loopt grote kans op herontwerpen, afgekeurde vergunningen,
meerwerk en frustratie. Met een helder PvE, toetsbaar budget en inzicht in de randvoorwaarden wordt het traject voorspelbaar,
stuurbaar en leuk.
    `,
    tags: {
      onderwerpen: ['proces'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },

  {
    id: 'proces_fasen_overzicht',
    chapter: 1,
    titel: 'Van idee tot oplevering: de fasen in één oogopslag',
    samenvatting:
      'Oriëntatie, ontwerp, vergunning, selectie aannemer, bouw en oplevering. Elke fase heeft eigen besluiten en valkuilen.',
    inhoud: `
Het traject verloopt in herkenbare stappen:

- **Oriëntatie:** wensen, budget, locatie, haalbaarheid.
- **Schetsontwerp:** eerste massa, plattegrond, sfeer, grove kosten.
- **Voorlopig Ontwerp (VO):** concretere plattegronden, gevels, materiaalrichting.
- **Definitief Ontwerp (DO):** uitgewerkte tekeningen en principes, basis voor constructeur en installateur.
- **Vergunning:** compleet dossier indienen, vragen beantwoorden, formele toets.
- **Selectie aannemer / aanbesteding:** offertes op basis van goede stukken, keuze op inhoud én prijs.
- **Uitvoering:** bouwen, toezicht, meer- en minderwerk managen, kwaliteit borgen.
- **Oplevering & nazorg:** restpunten, garanties, inregeling installaties.

Door iedere fase bewust af te sluiten voorkom je dat beslissingen blijven doorschuiven naar de bouwplaats,
waar elke wijziging veel duurder is.
    `,
    tags: {
      onderwerpen: ['proces'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },

  // =====================================================================
  // 2. LOCATIE & KAVEL  (wizard: basis, wensen, risico)
  // =====================================================================

  {
    id: 'locatie_due_diligence_bouwkavel_2025',
    chapter: 2,
    titel: 'Bouwkavel due diligence: zo voorkom je een miskoop',
    samenvatting:
      'Systematische check van juridische lasten, bodem, omgeving en bijkomende kosten vóór je tekent.',
    inhoud: `
Een kavel bepaalt je speelveld: ontwerpvrijheid, fundering, kosten en toekomstwaarde.

Check vóór koop:
- **Juridisch:** erfdienstbaarheden, kettingbedingen, antispeculatie, zelfbewoningsplicht, gebruiksbeperkingen;
- **Planologisch:** omgevingsplan, dubbelbestemmingen, geluidzones, hoogtes, beeldkwaliteitseisen;
- **Fysiek:** bezonning, privacy, uitzicht, geluid, bereikbaarheid, waterstanden, bomen, hoogteverschillen;
- **Financieel:** onderzoeken, aansluitingen, bouwrijp maken, eventuele sanering.

Een architect helpt om deze informatie te lezen en te vertalen naar kansen, risico’s en ontwerpstrategie.
    `,
    tags: {
      onderwerpen: ['locatie', 'proces', 'risico'],
      projectsoorten: ['nieuwbouw'],
    },
  },

  {
    id: 'locatie_bodem_pfas_fundering',
    chapter: 2,
    titel: 'Bodemonderzoek, PFAS en fundering: de onzichtbare kosten',
    samenvatting:
      'Bodemkwaliteit en vervuiling bepalen funderingstype, kelderopties en mogelijke saneringskosten.',
    inhoud: `
Een verkennend bodemonderzoek en sonderingen laten zien:
- of de ondergrond schoon genoeg is;
- op welke diepte draagkrachtige lagen liggen;
- of paalfundering of kelder reëel en betaalbaar zijn.

PFAS en andere vervuiling kunnen de afvoer van grond extreem duur maken.
Voor luxe woningen met kelder of zware constructies is een vroeg funderingsadvies essentieel.
Ontwerp en budget worden hierop afgestemd, niet andersom.
    `,
    tags: {
      onderwerpen: ['locatie', 'uitvoering', 'risico'],
      projectsoorten: ['nieuwbouw'],
    },
  },

  {
    id: 'locatie_nuts_netcongestie',
    chapter: 2,
    titel: 'Nuts & netcongestie: all-electric zonder verrassingen',
    samenvatting:
      'Beschikbaarheid van vermogen en aansluitingen is een harde randvoorwaarde voor moderne villa’s.',
    inhoud: `
All-electric wonen vraagt vermogen voor warmtepomp, laadpalen, kookplaat en eventueel wellness.

Belangrijk:
- check vroegtijdig de mogelijkheden bij de netbeheerder;
- onderzoek wachttijden voor verzwaarde aansluitingen;
- beoordeel of warmtenet of hybride oplossingen spelen;
- neem aansluit- en aanlegkosten mee in het budget.

Zonder deze check kun je een duurzaam ontwerp maken dat praktisch niet uitvoerbaar is.
    `,
    tags: {
      onderwerpen: ['locatie', 'duurzaamheid', 'uitvoering'],
      projectsoorten: ['nieuwbouw'],
    },
  },

  {
    id: 'locatie_archieftekeningen_verbouw',
    chapter: 2,
    titel: 'Archieftekeningen en inmeten bij verbouw',
    samenvatting:
      'Zonder betrouwbare bestaande situatie is elk verbouwontwerp een gok.',
    inhoud: `
Voor verbouw en aanbouw is inzicht in de bestaande constructie cruciaal.

Bronnen:
- gemeentearchief;
- oude vergunningsdossiers;
- recente verbouwplannen.

Als tekeningen ontbreken:
- laat de woning nauwkeurig inmeten;
- leg constructieve opbouw vast (vloeren, balklagen, dak, fundering);

Dit voorkomt verrassingen tijdens sloop en zorgt voor betrouwbare vergunningen en offertes.
    `,
    tags: {
      onderwerpen: ['locatie', 'proces', 'vergunningen'],
      projectsoorten: ['verbouw', 'aanbouw'],
    },
  },

  // =====================================================================
  // 3. REGELGEVING & VERGUNNINGEN  (wizard: basis, risico)
  // =====================================================================

  {
    id: 'regelgeving_omgevingswet_dso',
    chapter: 3,
    titel: 'Omgevingswet & DSO: zo dien je slim en compleet in',
    samenvatting:
      'Nieuwe spelregels vragen om betere voorbereiding, maar bieden ruimte voor goed onderbouwde plannen.',
    inhoud: `
Onder de Omgevingswet loopt alles via het Omgevingsloket. De lat voor volledigheid ligt hoger.

Kern:
- werk met uitgewerkte tekeningen en onderbouwingen;
- stem kritische punten (hoogte, massa, beeldkwaliteit) vooraf af;
- houd rekening met formele termijnen en mogelijke verlenging;
- documenteer keuzes en bijlagen netjes: dit voorkomt discussies.

Een zorgvuldig opgebouwd dossier voelt voor gemeente en omgeving geloofwaardig en professioneel.
    `,
    tags: {
      onderwerpen: ['vergunningen', 'proces', 'risico'],
      projectsoorten: ['nieuwbouw', 'verbouw'],
    },
  },

  {
    id: 'regelgeving_participatieplicht',
    chapter: 3,
    titel: 'Participatieplicht: zo win je de buren vóór je begint',
    samenvatting:
      'Goede participatie verlaagt bezwaar-risico en versnelt de vergunning.',
    inhoud: `
Participatie is geen formaliteit, maar strategie.

Aanpak:
- identificeer direct betrokken buren;
- licht plannen vroegtijdig toe met begrijpelijke tekeningen;
- vraag gericht naar zorgen (inkijk, schaduw, parkeren) en verwerk waar mogelijk;
- leg gesprekken vast en bundel dit in een participatieverslag.

Een serieus participatieproces laat zien dat je als opdrachtgever zorgvuldig handelt en helpt bezwaren voorkomen.
    `,
    tags: {
      onderwerpen: ['vergunningen', 'proces', 'risico'],
      projectsoorten: ['nieuwbouw', 'verbouw'],
    },
  },

  {
    id: 'regelgeving_welstand_strategie',
    chapter: 3,
    titel: 'Welstand: van tegenkracht naar bondgenoot',
    samenvatting:
      'Door de welstandskaders te begrijpen kun je er strategisch binnen ontwerpen.',
    inhoud: `
Welstand gaat over inpassing in straatbeeld en omgeving. Gemeenten hanteren niveaus:
van streng beschermd beeld tot globale toets.

Tips:
- bestudeer referentiebeelden en criteria van je gebied;
- kies een architect die gewend is aan dit type commissie;
- onderbouw ontwerp met zichtlijnen, materiaalkeuzes en relatie met de omgeving;
- presenteer helder en professioneel: dat wekt vertrouwen.

Zo wordt welstand een gesprek over kwaliteit in plaats van een blokkade.
    `,
    tags: {
      onderwerpen: ['vergunningen', 'ontwerp'],
      projectsoorten: ['nieuwbouw', 'verbouw'],
    },
  },

  {
    id: 'regelgeving_monumenten_erfgoed',
    chapter: 3,
    titel: 'Monumenten & erfgoed: verbouwen zonder karakter te slopen',
    samenvatting:
      'Werken met box-in-box, reversibiliteit en specialistische begeleiding voorkomt schade en gedoe.',
    inhoud: `
Bij monumenten en beschermde panden gelden extra eisen.

Belangrijk:
- behoud hoofdstructuur en beeldbepalende elementen;
- gebruik waar mogelijk reversibele ingrepen;
- werk met box-in-box oplossingen voor comfort en isolatie;
- betrek monumentenadviseur en gemeente vroeg;
- onderzoek subsidiemogelijkheden en erfgoedleningen.

Dit vergt meer ontwerpintelligentie, maar levert unieke, toekomstbestendige woningen op.
    `,
    tags: {
      onderwerpen: ['vergunningen', 'professionals', 'risico'],
      projectsoorten: ['verbouw'],
    },
  },

  {
    id: 'regelgeving_vergunning_stappenplan',
    chapter: 3,
    titel: 'Tactisch stappenplan voor een sterke vergunningsaanvraag',
    samenvatting:
      'Van omgevingstafel tot besluit: zo bouw je aan een dossier dat in één keer overtuigt.',
    inhoud: `
Stappen:
1. **Vooroverleg** met gemeente over hoofdvorm, maat, positie en uitstraling.
2. **Compleet ontwerp** (DO) met plattegronden, gevels, doorsneden, situatietekening.
3. **Onderbouwing**: stedenbouwkundig verhaal, materiaalstrategie, privacy, bezonning.
4. **Technische basis**: constructieve uitgangspunten, energieconcept, bodem- en funderingsinfo.
5. **Participatieverslag** en eventuele afspraken met buren.
6. **Controle op volledigheid** volgens indieningsvereisten, dan pas indienen.

Dit verkleint de kans op herstelverzoeken en verlenging aanzienlijk.
    `,
    tags: {
      onderwerpen: ['vergunningen', 'proces'],
      projectsoorten: ['nieuwbouw', 'verbouw'],
    },
  },

  // =====================================================================
  // 4. BUDGET & FINANCIERING  (wizard: budget, risico)
  // =====================================================================

  {
    id: 'budget_stichtingskosten_stiko',
    chapter: 4,
    titel: 'Stichtingskosten: het complete kostenplaatje',
    samenvatting:
      'Van grond tot inrichting: één structuur om niets te vergeten.',
    inhoud: `
Stichtingskosten omvatten:
- grond en bijkomende kosten;
- onderzoeken, leges, kwaliteitsborging (Wkb), advies;
- bouwkundige werk, installaties, meerwerkopties;
- nuts, terrein, tuin, keukens, sanitair;
- financieringskosten, reservering onvoorzien.

Door alles in een STIKO-structuur te zetten, koppel je ontwerpkeuzes direct aan hun financiële impact
en voorkom je dat “vergeten posten” later voor spanningen zorgen.
    `,
    tags: {
      onderwerpen: ['financien', 'proces'],
      projectsoorten: ['nieuwbouw', 'verbouw'],
    },
  },

  {
    id: 'budget_m2_prijzen_segmenten',
    chapter: 4,
    titel: 'Indicatieve m²-prijzen luxe woningbouw',
    samenvatting:
      'Bandbreedtes voor standaard, luxe en premium helpen verwachtingen kalibreren.',
    inhoud: `
Bouwkosten per m² zijn geen exacte wetenschap, maar bieden richting.

Als grove orde (exclusief grond en incl. btw, indicatief):
- **Functioneel / degelijk:** ca. €2.200–€2.800 per m² BVO;
- **Luxe particulier:** ca. €2.800–€3.500+ per m²;
- **High-end / maatwerk / kelder / specials:** vaak €3.500–€4.500+ per m².

Exacte bedragen hangen af van locatie, ontwerpcomplexiteit, materiaalniveau, installaties en markt.
Gebruik deze cijfers als reality check, niet als vaste prijslijst. Voor actuele stand: raadpleeg marktdata,
CBS en recente offertes.
    `,
    tags: {
      onderwerpen: ['financien'],
      projectsoorten: ['nieuwbouw'],
    },
  },

  {
    id: 'budget_verborgen_kosten_wkb_leges_onderzoeken',
    chapter: 4,
    titel: 'Verborgen kosten: Wkb, leges en onderzoeken',
    samenvatting:
      'Kwaliteitsborger, leges en verplichte onderzoeken zijn vaste posten, geen sluitpost.',
    inhoud: `
Naast bouw en ontwerp zijn er onmisbare posten:

- **Kwaliteitsborger (Wkb)** voor gevolgklasse 1-projecten;
- **Leges** op basis van opgegeven bouwsom;
- **Onderzoeken:** bodem, sonderingen, geluid, flora/fauna, asbest, etc.;
- **Aansluitkosten nuts** en eventuele verzwaring.

Reserveer hiervoor vanaf de start een realistische bandbreedte.
Deze posten zijn juridisch en technisch nodig en horen niet in de categorie “zien we later wel”.
    `,
    tags: {
      onderwerpen: ['financien', 'risico'],
      projectsoorten: ['nieuwbouw', 'verbouw'],
    },
  },

  {
    id: 'budget_financiering_bouwdepot_energielabel',
    chapter: 4,
    titel: 'Financiering: bouwdepot, fasering en energievoordeel',
    samenvatting:
      'Een goed plan houdt rekening met bouwdepot, cashflow en effect van energielabel op leencapaciteit.',
    inhoud: `
Belangrijke punten:
- **Bouwdepot:** geld wordt in termijnen uitgekeerd op basis van facturen; zorg dat planning en depotvoorwaarden aansluiten.
- **Overbrugging:** bij verkoop/nieuwbouw-situaties tijdig afstemmen met adviseur.
- **Energieprestaties:** betere energieprestatie kan extra leencapaciteit opleveren; benut dat voor slimme maatregelen.

Laat financiering en ontwerp elkaar versterken in plaats van tegenwerken.
    `,
    tags: {
      onderwerpen: ['financien'],
      projectsoorten: ['nieuwbouw', 'verbouw'],
    },
  },

  {
    id: 'budget_isde_subsidies_2025',
    chapter: 4,
    titel: 'ISDE & subsidies: kansen benutten zonder erop te leunen',
    samenvatting:
      'Subsidies voor isolatie en warmtepompen helpen, maar je plan moet ook zonder kunnen kloppen.',
    inhoud: `
De ISDE en andere regelingen bieden steun voor warmtepompen, isolatie en andere maatregelen.
Bedragen en voorwaarden wijzigen regelmatig (check altijd de actuele RVO-informatie). :contentReference[oaicite:0]{index=0}

Advies:
- gebruik subsidies als bonus, niet als randvoorwaarde voor haalbaarheid;
- verwerk ze niet als harde korting in de basisbegroting;
- controleer vóór aanschaf of systemen en uitvoerders aan de eisen voldoen.

Zo blijft je project financieel robuust.
    `,
    tags: {
      onderwerpen: ['financien', 'duurzaamheid'],
      projectsoorten: ['nieuwbouw', 'verbouw'],
    },
  },

  // =====================================================================
  // 5. ONTWERP & ARCHITECTUUR  (wizard: wensen, ruimtes, duurzaamheid)
  // =====================================================================

  {
    id: 'ontwerp_wonen_op_maat',
    chapter: 5,
    titel: 'Ontwerpen vanuit levensstijl in plaats van kamerlabels',
    samenvatting:
      'Begin bij je ritme, zichtlijnen en routines; niet bij vakjes “slaapkamer 1,2,3”.',
    inhoud: `
Een sterk ontwerp volgt jouw dagelijks leven:
- waar je wakker wordt en wat je ziet;
- hoe je kookt, werkt, sport, leeft met kinderen of gasten;
- welke spullen en hobbies ruimte vragen.

Door eerst leefpatronen te schetsen en daarna plattegronden te tekenen,
ontstaat een huis dat klopt zonder “dode” kamers.
    `,
    tags: {
      onderwerpen: ['ontwerp', 'proces'],
      projectsoorten: ['nieuwbouw', 'verbouw'],
    },
  },

  {
    id: 'ontwerp_stijlkeuzes_vergeleken',
    chapter: 5,
    titel: 'Stijlkeuzes: modern, schuurwoning, nieuwe klassiek, loft',
    samenvatting:
      'Elke stijl heeft impact op budget, detaillering en vergunning. Begrijp de consequenties.',
    inhoud: `
Populaire richtingen:
- **Modern minimalistisch:** vlakke daken, grote glasvlakken, strakke details; hogere eisen aan uitvoering en budget.
- **Schuurwoning:** herkenbare kap, warme materialen, vaak gunstige verhouding tussen expressie en kosten.
- **Nieuwe klassiek / jaren 30:** rijke details, metselwerk, dakoverstekken; arbeidsintensiever, dus duurder.
- **Loft / industrieel:** grote open ruimtes, zichtbare constructie; vraagt om doordachte techniek en akoestiek.

Kies niet alleen met het oog, maar ook met verstand van onderhoud, kosten en welstandskader.
    `,
    tags: {
      onderwerpen: ['ontwerp'],
      projectsoorten: ['nieuwbouw'],
    },
  },

  {
    id: 'ontwerp_domotica_knx_smart',
    chapter: 5,
    titel: 'Domotica & KNX: slim huis zonder gedoe',
    samenvatting:
      'Professionele systemen vragen vroeg ontwerp, consumentensystemen vragen discipline. Combineer slim.',
    inhoud: `
Een smart home staat of valt met structuur.

Opties:
- **Professioneel (bijv. KNX):** bekabeld, stabiel, schaalbaar; vraagt vroeg ontwerp;
- **Consumentensystemen:** snel en flexibel, maar versnipperd en minder betrouwbaar op lange termijn.

Richtlijnen:
- bepaal scenario’s (licht, klimaat, beveiliging, zonwering);
- reserveer techniekruimte en infrastructuur;
- zorg dat esthetiek en bediening intuïtief blijven.

Zo blijft techniek dienend in plaats van dominant.
    `,
    tags: {
      onderwerpen: ['ontwerp', 'tools'],
      projectsoorten: ['nieuwbouw'],
    },
  },

  {
    id: 'ontwerp_biofilie_wellness',
    chapter: 5,
    titel: 'Biofilie & wellness: wonen als dagelijks herstel',
    samenvatting:
      'Licht, lucht, groen en stilte zijn ontwerpkeuzes, geen afterthought.',
    inhoud: `
Elementen:
- zicht op groen en hemel vanuit kernruimtes;
- daglicht als leidraad voor plattegrond;
- akoestische rustplekken;
- wellness-ruimtes (bad, sauna, fitness) logisch ingepast;
- natuurlijke materialen waar je ze aanraakt.

Deze keuzes verhogen comfort en gezondheid en maken het huis toekomstbestendiger dan alleen “meer meters”.
    `,
    tags: {
      onderwerpen: ['ontwerp', 'duurzaamheid'],
      projectsoorten: ['nieuwbouw', 'verbouw'],
    },
  },

  {
    id: 'ontwerp_beng_biobased_circulair',
    chapter: 5,
    titel: 'BENG, biobased & circulair: wat betekent dat concreet?',
    samenvatting:
      'Eisen aan energie, isolatie en materiaalgebruik vormen het nieuwe normaal.',
    inhoud: `
Nieuwbouw moet voldoen aan BENG-eisen voor energiebehoefte, primair verbruik en hernieuwbare energie. :contentReference[oaicite:1]{index=1}
Dat betekent:
- goede isolatie (hoge Rc-waarden),
- luchtdicht bouwen met gecontroleerde ventilatie,
- inzet van hernieuwbare bronnen.

Biobased en circulair bouwen (bijv. houtconstructies, herbruikbare elementen) winnen terrein:
ze verlagen milieu-impact en kunnen esthetisch én comfortabel zijn.
Belangrijk is integrale afweging: techniek, regelgeving, comfort en uitstraling in samenhang.
    `,
    tags: {
      onderwerpen: ['ontwerp', 'duurzaamheid', 'uitvoering'],
      projectsoorten: ['nieuwbouw'],
    },
  },

  // =====================================================================
  // 6. SAMENWERKEN MET PROFESSIONALS  (wizard: basis, risico)
  // =====================================================================

  {
    id: 'professionals_rol_architect',
    chapter: 6,
    titel: 'Architect als regisseur van kwaliteit en risico',
    samenvatting:
      'Meer dan een mooi plaatje: proces, regels, budget en coördinatie.',
    inhoud: `
De architect:
- vertaalt wensen naar een helder PvE en ontwerp;
- toetst aan regels en omgeving;
- schakelt constructeur en adviseurs aan;
- bewaakt samenhang tussen techniek, esthetiek en budget;
- ondersteunt bij vergunning en selectie van aannemer.

Voor particuliere opdrachtgevers is deze rol essentieel om fouten en vertraging te voorkomen.
    `,
    tags: {
      onderwerpen: ['professionals', 'proces'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },

  {
    id: 'professionals_selectie_financiele_check',
    chapter: 6,
    titel: 'Aannemer selecteren: meer dan de laagste prijs',
    samenvatting:
      'Check reputatie, organisatie én financiële gezondheid om faillissementsrisico te beperken.',
    inhoud: `
Let bij selectie op:
- referenties van vergelijkbare projecten;
- kwaliteit van eerdere werken;
- transparantie in offerte en communicatie;
- continuïteit van het bedrijf (jaarrekeningen, kredietinformatie, signalen uit de markt);
- beschikbaarheid van vast aanspreekpunt op de bouw.

Een iets duurdere maar solide partij is vaak goedkoper dan een goedkope aannemer die het niet redt.
    `,
    tags: {
      onderwerpen: ['professionals', 'risico', 'financien'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },

  {
    id: 'professionals_aanbesteding_vs_bouwteam',
    chapter: 6,
    titel: 'Traditionele aanbesteding of bouwteam?',
    samenvatting:
      'Kies tussen scherp concurreren op prijs of vroeg samenwerken op inhoud.',
    inhoud: `
Twee hoofdmodellen:
- **Traditioneel:** volledig uitgewerkt pakket, meerdere aannemers offreren; goede prijsvergelijking, maar weinig vroegtijdige betrokkenheid.
- **Bouwteam:** één aannemer vanaf VO/DO aan tafel; gezamenlijke optimalisatie, open begroting, minder frictie.

Voor complexe of luxe maatwerkprojecten is een bouwteam vaak verstandiger. Voor eenvoudige, goed definieerbare plannen
kan traditioneel nog prima werken.
    `,
    tags: {
      onderwerpen: ['professionals', 'proces'],
      projectsoorten: ['nieuwbouw', 'verbouw'],
    },
  },

  {
    id: 'professionals_bouwbegeleiding_en_toezicht',
    chapter: 6,
    titel: 'Bouwbegeleiding & toezicht: wie kijkt er voor jou mee?',
    samenvatting:
      'Onafhankelijke controle voorkomt ruzie en garandeert dat je krijgt wat is afgesproken.',
    inhoud: `
Opties:
- architect verzorgt esthetisch en technisch toezicht;
- externe bouwbegeleider controleert kwaliteit, planning en kosten;
- combinatie, afhankelijk van schaal en complexiteit.

Dit levert:
- minder discussie op de bouw;
- tijdige signalering van fouten;
- duidelijk vastgelegde afspraken.

De kosten verdienen zich vaak terug via voorkomen herstelwerk en meerwerk.
    `,
    tags: {
      onderwerpen: ['professionals', 'uitvoering', 'risico'],
      projectsoorten: ['nieuwbouw', 'verbouw'],
    },
  },

  {
    id: 'professionals_contracten_uav',
    chapter: 6,
    titel: 'Contracten & UAV: spelregels vooraf vastleggen',
    samenvatting:
      'Heldere contracten met verwijzing naar UAV beperken interpretatieruimte.',
    inhoud: `
Een goed contract:
- verwijst naar passende voorwaarden (bijv. UAV 2012);
- beschrijft scope, tekeningen, kwaliteitsniveau en planning;
- regelt meer- en minderwerkprocedure;
- legt betalingsschema vast op basis van voortgang;
- benoemt hoe met vertraging en gebreken wordt omgegaan.

Dit geeft houvast als er discussie ontstaat.
    `,
    tags: {
      onderwerpen: ['professionals', 'risico', 'proces'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },

  {
    id: 'professionals_conflicten_mediation_rva',
    chapter: 6,
    titel: 'Conflicten oplossen: van gesprek tot Raad van Arbitrage',
    samenvatting:
      'Ken de routes: eerst praten, dan mediation, pas daarna juridische stappen.',
    inhoud: `
Bij serieuze geschillen:
1. direct gesprek en feiten op tafel;
2. onafhankelijke deskundige of mediator;
3. formele procedure (bijv. Raad van Arbitrage voor de Bouw of civiele rechter, afhankelijk van contract).

Een goed dossier, duidelijke afspraken en verslaglegging van bouwvergaderingen zijn hierbij essentieel.
    `,
    tags: {
      onderwerpen: ['professionals', 'risico'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },

  // =====================================================================
  // 7. TOOLS, UITVOERING, TECHNIEK & TOEKOMST  (wizard: techniek, duurzaamheid, risico, preview)
  // =====================================================================

  {
    id: 'uitvoering_prefab_vs_traditioneel',
    chapter: 7,
    titel: 'Prefab, cascobouw of traditioneel: wat past bij jouw plan?',
    samenvatting:
      'Snelheid, kwaliteit en architectonische vrijheid verschillen per systeem.',
    inhoud: `
- **Prefab / conceptueel bouwen:** snel, gecontroleerde fabriek, minder faalkosten; iets minder vrij in maatwerk.
- **Hybride:** prefab casco met maatwerk-afwerking; goede balans.
- **Traditioneel metselwerk / in het werk:** maximale vrijheid, maar gevoeliger voor detailfouten en planning.

Kies op basis van gewenste uitstraling, budget, planning en beschikbaarheid van betrouwbare partijen.
    `,
    tags: {
      onderwerpen: ['uitvoering', 'tools'],
      projectsoorten: ['nieuwbouw'],
    },
  },

  {
    id: 'duurzaamheid_klimaatadaptief_bouwen',
    chapter: 7,
    titel: 'Klimaatadaptief bouwen: hitte, water en groen',
    samenvatting:
      'Bescherm je woning tegen hitte en water door slimme ontwerp- en buitenruimtekeuzes.',
    inhoud: `
Maatregelen:
- zonwering, luifels, buitenzonwering en oriëntatie tegen oververhitting;
- groene daken, bomen en pergola’s voor koelte;
- infiltratievoorzieningen (wadi, kratten, grindstroken) voor regenwater;
- voldoende afschot en geen kwetsbare functies in laagste niveau zonder bescherming.

Dit voorkomt toekomstig comfortverlies en schades en sluit aan bij gemeentelijke ambities.
    `,
    tags: {
      onderwerpen: ['duurzaamheid', 'uitvoering'],
      projectsoorten: ['nieuwbouw', 'verbouw'],
    },
  },

  {
    id: 'tools_bim_ai_digital_twin',
    chapter: 7,
    titel: 'BIM, AI & digital twins: slimmer ontwerpen en bouwen',
    samenvatting:
      'Digitale modellen maken clashes zichtbaar en geven opdrachtgevers meer grip.',
    inhoud: `
- **BIM:** integraal 3D-model waarin architect, constructeur en installateur samenwerken; minder kans op botsingen.
- **AI-tools:** helpen scenario’s vergelijken, visualisaties maken, maar vervangen geen vakmanschap.
- **Digital twins:** digitale kopie van gebouw voor beheer en monitoring, vooral interessant bij grotere projecten.

Voor particuliere villaprojecten is BIM vaak al zeer zinvol; AI kan ondersteunen bij keuzes en visualisaties.
    `,
    tags: {
      onderwerpen: ['tools', 'uitvoering'],
      projectsoorten: ['nieuwbouw'],
    },
  },

  {
    id: 'techniek_bouwfysica_beng_rc_luchtdichtheid',
    chapter: 7,
    titel: 'Bouwfysica basics: Rc-waarden, BENG en luchtdichtheid',
    samenvatting:
      'Goede schil en luchtdichte bouw zijn randvoorwaarde voor comfort en energieprestatie.',
    inhoud: `
Belangrijke begrippen:
- **Rc-waarde:** warmteweerstand van dak, gevel, vloer; hogere waarden = minder verlies.
- **BENG:** eisen voor energiebehoefte, primair gebruik en aandeel hernieuwbare energie;
- **Luchtdichtheid:** voorkomt tocht en ongecontroleerde verliezen; vraagt zorgvuldige uitvoering en vaak blowerdoortest.

Een goed doordachte schil maakt installaties kleiner, het huis comfortabeler en energiekosten lager.
    `,
    tags: {
      onderwerpen: ['uitvoering', 'duurzaamheid'],
      projectsoorten: ['nieuwbouw'],
    },
  },

  {
    id: 'tools_pve_template',
    chapter: 7,
    titel: 'Programma van Eisen: het werkdocument voor al je keuzes',
    samenvatting:
      'Een gestructureerd PvE voorkomt dat wensen vergeten of verkeerd geïnterpreteerd worden.',
    inhoud: `
Een sterk PvE bevat:
- functionele wensen per ruimte;
- sfeer en materiaalvoorkeuren;
- eisen aan licht, zicht, privacy;
- technische ambities (energie, comfort, domotica);
- budgetkaders en prioriteiten (must/should/could).

Dit document stuurt ontwerp, vergunning, offertes én uitvoering en vormt de basis van de Brikx-wizard.
    `,
    tags: {
      onderwerpen: ['tools', 'proces'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },

  {
    id: 'tools_checklist_kavel',
    chapter: 7,
    titel: 'Checklist aankoop bouwkavel',
    samenvatting:
      'Compacte checklist om alle kritische punten van een kavel te beoordelen.',
    inhoud: `
Onderwerpen:
- juridische status en lasten;
- omgevingsplan, kavelpaspoort, dubbelbestemmingen;
- bodem, fundering, water en PFAS-risico;
- bezonning, privacy, geluid, bereikbaarheid;
- nutsvoorzieningen en netcongestie;
- globale kosteninschatting van noodzakelijke maatregelen.

Deze checklist vormt de basis voor een digitale Brikx-tool.
    `,
    tags: {
      onderwerpen: ['tools', 'locatie', 'risico'],
      projectsoorten: ['nieuwbouw'],
    },
  },
];
