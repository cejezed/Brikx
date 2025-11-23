/**
 * Dit bestand is uw "Single Source of Truth" (Eén Bron van Waarheid).
 * Het bevat alle "kennis-blokjes" uit uw Kennisbank ABJZ.pdf,
 * opgesplitst in een gestructureerd formaat.
 *
 * UPDATE (v2):
 * - Toevoeging van 'chapter' veld voor directe koppeling aan de 8 PDF-hoofdstukken.
 * - Gebruik van 'const' assertions (Enums) voor ONDERWERPEN en PROJECTSOORTEN
 * voor type-veiligheid en het voorkomen van typfouten (aanbeveling voldaan).
 */

// --- 1. Canonieke Tags (Type-veiligheid) ---
// Deze const-lijsten zorgen ervoor dat we geen typfouten kunnen maken in de tags.
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
] as const

export const PROJECTSOORTEN = [
  'nieuwbouw',
  'verbouw',
  'aanbouw',
] as const

// --- 2. Definieer de Types ---
export type Onderwerp = (typeof ONDERWERPEN)[number]
export type Projectsoort = (typeof PROJECTSOORTEN)[number]

/**
 * Definieert de structuur (de 'interface') voor één "Kennis-Item"
 */
export type KennisItem = {
  /** Een unieke ID, bijv. 'onderwerp_subonderwerp' */
  id: string
  /** NIEUW: Koppelt direct aan de 8 hoofdstukken uit de PDF */
  chapter: number
  /** De titel van het kennis-blokje */
  titel: string
  /** Een korte samenvatting (1-2 zinnen) voor previews */
  samenvatting: string
  /** De volledige inhoud (tekst/uitleg) uit uw PDF. Mag Markdown bevatten. */
  inhoud: string
  /** De "tags" die dit blokje slim en filterbaar maken */
  tags: {
    /** Over welke hoofdonderwerpen gaat dit? (Type-safe) */
    onderwerpen: Onderwerp[]
    /** Voor welke projectsoorten is dit relevant? (Type-safe) */
    projectsoorten: Projectsoort[]
  }
}

// --- 3. Dit is uw "Database": een array van alle Kennis-Items ---
export const kennisbankData: KennisItem[] = [
  // =======================================================================
  // --- 1. ALGEMEEN BOUWPROCES ---
  // =======================================================================

  {
    id: 'proces_start',
    chapter: 1,
    titel: 'De Start van het Proces',
    samenvatting:
      'Een (ver)bouwproces begint bij drie basiselementen: een Programma van Eisen (PvE), een beschikbaar budget, en de specifieke locatie.',
    inhoud: `
Een proces van verbouwen of nieuw bouwen van een woning begint bij het opstellen van een
helder projectdocument waarin in ieder geval de volgende onderdelen duidelijk omschreven staan:
programma van eisen, beschikbaar budget en de specifieke locatie met bijbehorende regelgeving
en voorwaarden.

Die drie elementen vormen de basis voor de start van het ontwerpproces en bepalen in grote mate
ook de kwaliteit en succes van dat ontwerpproces. Hoe meer helderheid over verwachtingen hoe
beter het resultaat. Dat is dus ook een belangrijke taak van de architect bij de start van zijn
werkzaamheden: zo veel mogelijk informatie verzamelen bij de opdrachtgever zodat er zo min
mogelijk ruis in het proces is en het eerste resultaat van een ontwerp zo goed mogelijk past bij dat
complete pakket van eisen, wensen en voorwaarden.
    `,
    tags: {
      onderwerpen: ['proces'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },
  {
    id: 'proces_pve_maken',
    chapter: 1,
    titel: 'Het Programma van Eisen (PvE) opstellen',
    samenvatting:
      'Schrijf zo uitgebreid mogelijk uw wensen op. Niet alleen tastbare (aantal kamers), maar ook ontastbare (uitzicht, privacy, sfeer).',
    inhoud: `
schrijf zo uitgebreid mogelijk uw wensen op. Dat kunnen zaken zijn zoals de hoeveelheid
slaapkamers, een grote eetkeuken, afgesloten woonkamer of werkkamer, maar ook minder
tastbare wensen als uitzicht, privacy, gezellig eten met vrienden in de keuken, akoestiek. Denk na
over wat u in uw huidige of vorige huis prettig vindt of juist mist. 
...
Heel belangrijk dus om zo veel mogelijk op papier te zetten, ook al
lijken het in eerste instantie onbenullige of uitermate logische zaken. Schrijf dus zoveel mogelijk op
en maak er een document van wat je samen steeds verder uitbouwt en wat dus een steeds beter
beeld geeft over de wensen, eisen en dromen.
...
Het kan ook zeer leerzaam
zijn om de kinderen, welke leeftijd dan ook, te vragen wat ze belangrijk vinden.
...
Natuurlijk is het ook van belang om bijvoorbeeld aan te geven wat je mooi of niet mooi vindt...
maak een Pinterest moodboard...
En natuurlijk kan zo'n programma van eisen ook samen met de
architect verder uitgebreid worden.
    `,
    tags: {
      onderwerpen: ['proces', 'ontwerp'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },
  {
    id: 'proces_pve_manieren',
    chapter: 1,
    titel: 'Manieren om een PvE op te stellen',
    samenvatting:
      'U kunt een PvE opstellen in Word, Excel, via Moodboards (Pinterest), of zelfs met simpele plattegronden.',
    inhoud: `
Manieren waar je zo'n programma kan opstellen:
- Word documenten met omschrijving van wensen en gedachten
- Excel sheets informatie, ook over stichtingskosten en budget
- Moodboards zelf gemaakt of via apps zoals pinterest
- Soms zelfs al plattegronden met gedachten voor indelingen en ordening van ruimtes
    `,
    tags: {
      onderwerpen: ['proces', 'ontwerp', 'tools'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },

  // =======================================================================
  // --- 2. BOUWKAVELS (LOCATIE) ---
  // =======================================================================
  {
    id: 'locatie_kenmerken',
    chapter: 2,
    titel: 'Locatie Kenmerken Analyseren',
    samenvatting:
      'Analyseer de locatie: zon, avondzon, lawaai, privacy, zichtlijnen en de logische routing voor thuiskomen, fietsen en kliko’s.',
    inhoud: `
...de kenmerken van de locatie of bestaande woning. Waar komt de zon op? Waar is het in
de avond goed vertoeven? Is er veel lawaai of verkeer in de omgeving? Hoeveel privacy is er
...
Allemaal onderdelen die de ordening van de woning op de kavel kunnen
bepalen zodat de praktische routing van thuiskomen na werk, met boodschappen of na sporten zo
logisch mogelijk is.
    `,
    tags: {
      onderwerpen: ['locatie', 'proces', 'ontwerp'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },
  {
    id: 'locatie_regelgeving',
    chapter: 2,
    titel: 'Locatie & Regelgeving',
    samenvatting:
      'Naast de locatiekenmerken is de regelgeving cruciaal: wat mag volgens het bestemmingsplan, wat is vergunningsvrij, en wat zijn de welstandseisen?',
    inhoud: `
En natuurlijk is er ook regelgeving: wat mag er conform bestemmingsplan gebouwd worden, wat
zou vergunningsvrij kunnen en welke randvoorwaarden worden aan vormgeving gesteld door
welstand en of monumentencommissies. Ook kan regelgeving over archeologie of culturele
waarden beperkingen opleggen... Allemaal zaken die invloed hebben op het ontwerp en
dus ook voor de start van het ontwerp bekend moeten zijn bij alle partijen.
    `,
    tags: {
      onderwerpen: ['locatie', 'vergunningen'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },
  {
    id: 'locatie_archieftekeningen_verbouw',
    chapter: 2,
    titel: 'Belang van Archieftekeningen (Verbouw)',
    samenvatting:
      'Bij verbouw zijn archieftekeningen cruciaal. Ze zijn nodig voor de vergunning, offertes, en (erg belangrijk) de constructeur i.v.m. de fundering.',
    inhoud: `
Bij het verbouwen van een woning is nog een ander aspect van groot belang: de zoektocht naar
tekeningen van de bestaande woning. ... Die informatie is van belang ivm een aantal zaken:
1. Hoe meer tekeningen er zijn, des te makkelijker is het om de bestaande situatie van de
woning te digitaliseren. Dit is een vereiste voor vergunningaanvraag...
2. Bijna bij alle verbouwprojecten zullen zich ook iets gaan wijzigen aan de constructieve
opbouw... En dan is het dus erg
prettig als de opbouw van die fundering bekend is zodat een constructeur beter kan inschatten
of bepaalde ingrepen... niet een te grote belasting op de fundering gaan hebben...
3. Bij oudere karakteristieke of monumentale woningen is het uitermate handig om tekeningen te
hebben...
    `,
    tags: {
      onderwerpen: ['locatie', 'proces', 'vergunningen'],
      projectsoorten: ['verbouw', 'aanbouw'],
    },
  },

  // =======================================================================
  // --- 3. VERGUNNINGEN & REGELGEVING ---
  // =======================================================================

  {
    id: 'vergunningen_vergunningsvrij_check',
    chapter: 3,
    titel: 'Hoe weet je of je vergunningsvrij kunt bouwen?',
    samenvatting:
      'Check online de regels, maar let op: bestaande bijgebouwen tellen mee, check beschermd dorpsgezicht, en het gebruik (geen verblijfsruimte > 4m).',
    inhoud: `
Online is er duidelijke documentatie beschikbaar... Toch kunnen er specifieke situatie zijn...
Aandachtspunten bij vergunningsvrij bouwen:
- bekijk goed wat bij de woning aangeduid is als hoofdgebouw...
- bekijk of de woning niet valt binnen een rijksbeschermd dorpsgezicht...
- is de woning een monument? dan is er meestal erg weinig mogelijk...
- let op het gebruik van de ruimtes: alleen de vergunningsvrije ruimtes binnen 4 meter van
het hoofdgebouw mogen gebruikt worden als verblijfsruimte...
- een kelder, verdieping of dakterras zijn nooit toegestaan.
- vergunningsvrij bouwen op de erfgrens is meestal mogelijk, houd wel goed rekening met de
toegestane hoogtes... en overleg uiteraard altijd eerst met de buren...
    `,
    tags: {
      onderwerpen: ['vergunningen'],
      projectsoorten: ['verbouw', 'aanbouw'],
    },
  },
  {
    id: 'vergunningen_fouten_aanvraag',
    chapter: 3,
    titel: 'Veelgemaakte fouten bij een vergunningaanvraag',
    samenvatting:
      'Te snel indienen, bouwkosten te hoog (of laag) invullen, documenten vergeten, planning te optimistisch, en geen vooroverleg doen.',
    inhoud: `
- Te snel iets in willen dienen... en daardoor zaken over het hoofd zien...
- Denk goed na over het invullen van bouwkosten: op basis van dat bedrag worden de
legeskosten bepaald.
- het niet goed uitzoeken van alle vereisten die benodigd zijn voor een aanvraag.
- verwachten dat een vergunning wel snel verleend zal worden. Termijn is 8 weken + 6 weken verlenging + tijd voor aanvullende gegevens.
- het niet doen van vooroverleg: ...een vooroverleg erg handig.
- vergeten constructie en andere rapporten...
- inspraak: neem altijd eerst contact op met de buren...
- na het verlenen van een vergunning is er nog 6 weken de tijd voor belang hebbenden om
een bezwaar in te dienen...
    `,
    tags: {
      onderwerpen: ['vergunningen', 'proces'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },
  {
    id: 'vergunningen_bestemmingsplan_lezen',
    chapter: 3,
    titel: 'Hoe lees en begrijp je een bestemmingsplan?',
    samenvatting:
      'Check online de regels voor uw adres (goot, nok, bouwvlak), maar lees ook de algemene hoofdstukken en definities voor afwijkingen en vrijstellingen.',
    inhoud: `
De belangrijkste elementen zoals goothoogte, nokhoogte en bouwvlak zijn over het algemeen
eenvoudig te achterhalen in de online versie van de omgevingswet. ... Er staan echter meestal meer
randvoorwaarden dan alleen de bouwkundige vereisten: dat kan gaan over bodem, archeologie,
cultuur... die regels kunnen ook van invloed zijn...
Ook is het van belang om bij de definities goed te kijken...
En verdiep je in de mogelijkheden
voor afwijkingen van het bestemmingsplan in de BOPA regeling...
    `,
    tags: {
      onderwerpen: ['vergunningen', 'locatie'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },

  // =======================================================================
  // --- 4. KOSTEN & FINANCIËN ---
  // =======================================================================

  {
    id: 'financien_budget_opstellen_basis',
    chapter: 4,
    titel: 'Hoe stel je een eerste budget op?',
    samenvatting:
      'Het opstellen van een budget begint met het bepalen van de totale financiële ruimte en het opzetten van een stichtingskostenbegroting.',
    inhoud: `
Bij het opschrijven van de wensen hoort natuurlijk ook bij van hoeveel je uit wil geven aan de
verbouw of nieuwbouw van de woning. Het is van belang om te weten welke ruimte er financieel is
zodat iemand die iets gaat bedenken ook een plan presenteert wat financieel haalbaar is. Niks zo
frustrerend als een droomkasteel gepresenteerd krijgen wat in een volgende fase eigenlijk totaal
niet haalbaar blijkt.
...
Probeer zo duidelijk mogelijk te omschrijven wat de verwachtingen zijn over het uitgeven van een
budget en wat er wel of niet in het budget zou moeten zitten.
...
Begin dus met bepalen van een bedrag wat je uit wilt en uit kunt geven. Vanuit dat bedrag kan je
een opzet gaan maken voor alle kosten die komen kijken bij de nieuwbouw of verbouw.
    `,
    tags: {
      onderwerpen: ['financien', 'proces'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },
  {
    id: 'financien_budget_opstellen_verbouw',
    chapter: 4,
    titel: 'Specifiek budget voor Verbouw',
    samenvatting:
      'Bij oudere woningen gaat een groot deel van het budget op aan de basis: isolatie, installaties en fundering, nog vóórdat de uitbreiding begint.',
    inhoud: `
Zeker bij oudere woningen moet er alleen al om de basis goed te krijgen behoorlijk geïnvesteerd
worden zodat energiezuinigheid en comfort verbeterd worden. Het isoleren van vloer, gevel en dak
en eventueel vervangen van kozijnen en beglazing kunnen al een behoorlijk onderdeel van het
budget wegnemen. En vaak zijn ook installaties voor verwarrming, ventilatie en electra verouderd
en is ook daar vervanging de enige optie. Pas als die zaken op orde zijn is het pas zinnig om na te
gaan denken over uitbreiding van de woning.
    `,
    tags: {
      onderwerpen: ['financien', 'uitvoering'],
      projectsoorten: ['verbouw', 'aanbouw'],
    },
  },
  {
    id: 'financien_legeskosten',
    chapter: 4,
    titel: 'Verborgen Kosten: Legeskosten Gemeente',
    samenvatting:
      'Leges kunnen oplopen tot 4% van de bouwsom. Dit is een substantiële verborgen kostenpost waar u rekening mee moet houden.',
    inhoud: `
legeskosten van gemeentes zijn vaak behoorlijk hoog In de legesverordening van de
gemeente is op internet te vinden hoe hoog die zijn voor de bouw of verbouw van een
woning. ... Op basis van die bouwsom worden de legeskoten bepaald... Dat kan soms
verrassend hoge rekeningen opleveren. ... kan soms oplopen tot ruim 4% van de bouwsom. Houd er ook
rekening mee dat het afwijken van het bestemmingsplan op basis van bijvoorbeeld de
BOPA regeleing ook extra kosten met zich meebrengt. ... Dat kunnen dan
standaard bedragen van rond de €5000 zijn.
    `,
    tags: {
      onderwerpen: ['financien', 'vergunningen'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },
  {
    id: 'financien_kwaliteitsborger_wkb',
    chapter: 4,
    titel: 'Verborgen Kosten: Kwaliteitsborger (Wkb)',
    samenvatting:
      'De Wet kwaliteitsborging (Wkb) verplicht een kwaliteitsborger, een extra kostenpost van circa €8.000-€15.000.',
    inhoud: `
bij nieuwbouw van een woning is tegenwoordig een kwaliteitsborger verplicht. Deze moet
door de opdrachtgever ingehuurd worden en heeft gedeeltelijk de controlerende taak van
de gemeente overgenomen. ... Een hele andere inrichting van het
proces dus in daardoor ook een extra kostenpost van circa €15000 waar rekening mee
gehouden moet worden.
    `,
    tags: {
      onderwerpen: ['financien', 'vergunningen', 'uitvoering'],
      projectsoorten: ['nieuwbouw'], // Tekst specificeert 'bij nieuwbouw'
    },
  },
  {
    id: 'financien_onvoorziene_post_verbouw',
    chapter: 4,
    titel: 'Verborgen Kosten: Post Onvoorzien (Verbouw)',
    samenvatting:
      'Zeker bij verbouw zijn er altijd onvoorziene zaken (constructie, installaties). Een substantiële post onvoorzien is essentieel.',
    inhoud: `
het verduurzamen van bestaande woningen die verbouwd moeten gaan worden: vaak
worden er bij de start van het sloopwerk allerlei zaken ontdekt die anders zijn dan op
tekening of in eerste instantie zo leken te zijn. Dat kan qua constructie, installatie of
kwaliteit van bouwkundige onderdelen. Houd dus zeker bij verbouw altijd een post
onvoorzien aan en maark die substantieel onderdeel van de begroting
    `,
    tags: {
      onderwerpen: ['financien'],
      projectsoorten: ['verbouw', 'aanbouw'],
    },
  },
  {
    id: 'financien_verplichte_onderzoeken',
    chapter: 4,
    titel: 'Verborgen Kosten: Verplichte Onderzoeken',
    samenvatting:
      'Kosten voor verplichte onderzoeken zoals asbestinventarisatie, bodemonderzoek, archeologie, flora & fauna, en geluidsbelasting.',
    inhoud: `
kosten voor allerlei veprlichte onderzoeken die kunnern voortkomen uit vereisten vanuit het
bestemmingsplan. Dat kunnen voor dehand liggende zaken zijn als een
asbestinventarisatie onderzoek... (verplicht bij gebouewn voor 1994...). of een
bodemonderzoek wat verplicht gesteld wordt ivm verontreiniging of archeologisch
waardevolle gebieden... Ook kunnen flora en fauna onderzoeken kostbaar zijn...
Geluidsbelasting van bestaande wegen... Of bezonningsstudies...
    `,
    tags: {
      onderwerpen: ['financien', 'locatie', 'vergunningen'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },
  {
    id: 'financien_participatie',
    chapter: 4,
    titel: 'Verborgen Kosten: Verplichte Participatie',
    samenvatting:
      'Participatie van omwonenden is verplicht. Dit kan leiden tot vertraging en extra kosten voor rapporten om bezwaren te weerleggen.',
    inhoud: `
verplichte participatie: een onderdeel van de omgevingswet en dus vergunningsproceduren
is tegenwoordig ook de participatie van omwonenden. ... In de praktijk zijn gemeente uitermate voorzichtig
geworden met het verlenen van vergunningen... en dat kan dus leiden tot
de verplichting tot het maken van allerlei rapporten die normaal gesproken niet zo snel
onderdeel zouden zijn van de vereisten.
    `,
    tags: {
      onderwerpen: ['financien', 'vergunningen', 'proces'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },
  {
    id: 'financien_stelposten_valkuil',
    chapter: 4,
    titel: 'Valkuil: Te optimistische stelposten',
    samenvatting:
      'Stelposten (keuken, badkamer) zijn vaak te laag ingeschat om een offerte aantrekkelijk te maken. Dit leidt gegarandeerd tot meerwerk.',
    inhoud: `
te optimistische stelposten in begrotingen opnemen; neem realistische bedragen op of
vraag bij professionals na welke bedragen reel zijn. Als stelposten tegenvallen in de bouw
is er geen weg meer terug..,
    `,
    tags: {
      onderwerpen: ['financien', 'uitvoering', 'professionals'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },
  {
    id: 'financien_meerwerk_werking',
    chapter: 4,
    titel: 'Hoe werken stelposten en meer-/minderwerk?',
    samenvatting:
      'Hoe stelposten werken en waarom een aannemer met veel stelposten een financieel risico vormt. Goedkoop is dan duurkoop.',
    inhoud: `
Tijdens de voorbereiding van een bouwproject zullen er altijd een aantal zaken nog niet helemaal
duidelijk zijn... daarom worden er stelposten opgenomnen. ... Het is natuurlijk
verleidelijk om dat soort posten laag in te zetten, zeker voor aannemers. ...
Door veel stelposten op te nemen bouwt een
aannemer eigenlijk gratis ruimte in om de kosten later te verhogen. ...
Een offerte moet dus zo specifiek mogelijk zijn
om die verrassingen te voorkomen.
    `,
    tags: {
      onderwerpen: ['financien', 'uitvoering', 'professionals'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },
  {
    id: 'financien_besparen_ontwerp',
    chapter: 4,
    titel: 'Besparen: Slim Ontwerpen',
    samenvatting:
      'De belangrijkste besparing zit in het ontwerp: slimme indeling, materiaalkeuze, positionering en het voorkomen van dure technische oplossingen.',
    inhoud: `
De belangrijkste besparing begint bij het ontwerpproces: hoe kan je slim gebruik maken van de
zaken die er al zijn? Kun je een doorbraak ergens maken die een ruimte opeens transformeert? De
woning zodanig positioneren op het perceel... Openingen in gevels maken op plekken waar de zonbelasting minder is...
Het besparen in een later stadium is erg lastig.
    `,
    tags: {
      onderwerpen: ['financien', 'ontwerp'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },
  {
    id: 'financien_besparen_offerte',
    chapter: 4,
    titel: 'Besparen: Strategisch Offertes Aanvragen',
    samenvatting:
      'Vraag een offerte aan voor een kleinere variant; een meter *toevoegen* is vaak goedkoper dan een meter *weghalen* als bezuiniging.',
    inhoud: `
Soms kan het daarom ook handig zijn om bij een offerteaanvraag juist een wat kleinere variant aan
te vragen. Dat zal meer ruimte geven in de begroting maar ook strategisch kan dat handig zijn: een
aannemer vragen om de uitbouw een meter breder te maken zal waarschijnlijk niet zo veel extra
kosten. Maar dezelfde aannemer vrage om in het kader van bezuinigingen de uitbouw een meter
kleiner te maken zal waarschijnlijk de reactie geven dat dat allemaal niet zo veel uitmaakt. Maak
hier dus handig gebruik van.
    `,
    tags: {
      onderwerpen: ['financien', 'uitvoering', 'professionals'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },

  // =======================================================================
  // --- 5. ONTWERP & ARCHITECTUUR ---
  // =======================================================================

  {
    id: 'ontwerp_duurzaamheid_basis',
    chapter: 5,
    titel: 'Wat is een duurzaam en toekomstbestendig ontwerp?',
    samenvatting:
      'Duurzaamheid is meer dan isolatie. Het is een flexibel ontwerp dat meegroeit, slimme oriëntatie (passieve zonnewarmte) en duurzaam materiaalgebruik (zoals HSB).',
    inhoud: `
Duurzaamheid is te vertalen op allerlei manieren, niet alleen op een goede isolatie':
- Het begint met een goed ontwerp. een goed ontwerp is een ontwerp wat in de loop van de
tijd zijn waarde behoudt en eventueel aangepast kan worden...
- Ook is er bij het maken van een ontwerp ook rekening te houden met opwarming van de
woning: het maken van strategische overstekken voorkomt teveel opwarming in de zomer...
- duurzaamheid heeft ook te maken met het gebruik van materiaal... een geprefabriceerd
houtskeletbouw huis is iets wat we steeds vaker gaan zien.
- ook de gevelafwerking moet duurzaam zijn qua materiaal maar vooral ook qua onderhoud.
    `,
    tags: {
      onderwerpen: ['ontwerp', 'duurzaamheid'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },
  {
    id: 'ontwerp_duurzaamheid_installaties',
    chapter: 5,
    titel: 'Duurzaamheid: Installaties (Warmtepomp & Koeling)',
    samenvatting:
      'Installaties (warmtepomp) hebben alleen zin als de schil (isolatie) op orde is. Een warmtepomp kan ook duurzaam koelen via de bodem.',
    inhoud: `
installatietechnisch moet er ook rekening gehouden worden met duurzaamheid. Dat start
met het zorgen dat de bouwkundige schil op orde is... Een warmtepomp aanbrengen in een woning die nooit goed te
isoleren is is namelijk onzinnig. ...
Bij nieuwbouw is het allemaal
niet zo spannend... Daar is koeling van de woning vaak de bottleneck...
Een warmtepomp heeft de mogelijkheid
om te koelen via de vloerverwarming... Overigens is het koelen met de warmtepomp in de zomer ook juist
duurzaam: de warmte die uit de woning getrokken wordt verdwijnt weer de bodem in...
    `,
    tags: {
      onderwerpen: ['ontwerp', 'duurzaamheid', 'uitvoering'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },
  {
    id: 'ontwerp_slim_verbouw_vs_nieuwbouw',
    chapter: 5,
    titel: 'Slimme Oplossing: Verbouw vs. Nieuwbouw indienen',
    samenvatting:
      'Onderzoek of u een project als "verbouw" kunt indienen i.p.v. "nieuwbouw". Dit geeft flexibiliteit in BENG-eisen en een eventuele gasaansluiting.',
    inhoud: `
...tussen het gaan verbouwen van een
woning of het nieuw bouwen van een woning zitten in het bouwbesluit grote verschillen in
regelgeving:
- Blj het nieuw bouwen van een woning is bijvoorbeeld een gasaansluiting niet meer
toegestaan. ...de mogelijkheid
dus om nog gebruik te blijven maken van een gasaansluiting... geeft veel meer flexibiliteit...
- bij een nieuw te bouwen woning moet deze voldoen aan de strenge eisen vanuit de BENG
berekening. ... Bij het
verbouwen van een wopning... zijn de vereisten hier minder streng...
- vereisten aan daglicht, vrije hoogtes en toegankelijkheid... zijn
ook anders geregeld bij verbouw...
Onderzoek dus voor het slopen van een bestaande woning eerst goed welke onderdelen
eventueel hergebruikt zouden kunnen worden zodat de aanvraag voor de omgevingsvergunning
als verbouwing ingediend kan worden en niet als nieuwbouw.
    `,
    tags: {
      onderwerpen: ['ontwerp', 'vergunningen', 'proces', 'duurzaamheid'],
      projectsoorten: ['verbouw', 'nieuwbouw'], // Relevant voor de keuze tussen beide
    },
  },
  {
    id: 'ontwerp_slim_daglicht_aanbouw',
    chapter: 5,
    titel: 'Slimme Oplossing: Pas op met Daglicht bij Aanbouw',
    samenvatting:
      'Een grote aanbouw maakt de bestaande woning donker. Een kleinere ruimte met goed daglicht heeft meer kwaliteit. Overweeg daklichten (op het noorden) of Solatubes.',
    inhoud: `
Houd bij aanbouwen rekening met het feit dat het uitbreiden van een woonlaag met extra m2
invloed heeft op de bestaande ruimtes. Met name daglicht zal dan heel anders worden. Een hele
grote ruimte waarbij een groot deel weinig daglicht krijgt heeft minder kwaliteit dan een kleinere
ruimte met goed daglicht en contact met buiten. Daklichten kunnen daar een oplossing voor zijn
maar deze hebben dan weer het grote nadeel dat als ze op de zon georiënteerd zijn ze ook erg
veel warmte doorlaten... Bij een orientatie op het noorden geen enkel probleem... Of kiezen voor bijvoorbeeld een solatube...
    `,
    tags: {
      onderwerpen: ['ontwerp', 'duurzaamheid'],
      projectsoorten: ['aanbouw', 'verbouw'],
    },
  },
  {
    id: 'ontwerp_slim_advies_warmtepomp',
    chapter: 5,
    titel: 'Slimme Oplossing: Advies Warmtepomp',
    samenvatting:
      'Laat een transmissieberekening maken *voordat* u een warmtepomp kiest. Een te lichte pomp gaat elektrisch bijstoken en is extreem duur in verbruik.',
    inhoud: `
Laat je bij het verduurzamen van een woning goed adviseren en ga niet zomaar in zee met de
goedkoopste aanbieder van bijvoorbeeld een warmtepomp Het succes van die nieuwe intallatie
hangt af van een grondige analyse... Er moet onderzocht worden wat de
isolatiewaarden... zijn. Op basis daarvan
kan een transmissieberekening gemaakt worden. ...en daarmee kan de capaciteit van de warmtebehoefte
berekend worden. En dat moet de basis zijn voor het kiezen van een installatieconcept...
    `,
    tags: {
      onderwerpen: ['ontwerp', 'duurzaamheid', 'uitvoering', 'financien'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },
  {
    id: 'ontwerp_akoestiek',
    chapter: 5,
    titel: 'Aandachtspunt: Akoestiek (Harde materialen)',
    samenvatting:
      'Moderne inrichtingen (gietvloer, tegels, geen gordijnen) klinken hol. Overweeg een akoestisch plafond (stuc op isolatieplaten) voor comfort.',
    inhoud: `
Een onderwerp wat vaak vergeten wordt... de
akoestiek van een ruimte. Vloeren worden steeds vaker uitgevoerd in tegelwerk of als gietvloer...
Gordijnen worden vervangen door
lamellen... Wat overblijft zijn vaak ruimtes die weinig absorberend vermogen hebben voor
geluid...
Bijvoorbeeld door het aanbrengen van een akoestisch plafond: hierbij wordt er stucwerk
aangebracht op isolatieplaten... Qua uitstraling vrijwel geen verschil met
regulier stucwerk maar qua comfort een wereld van verschil.
    `,
    tags: {
      onderwerpen: ['uitvoering', 'ontwerp'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },
  {
    id: 'ontwerp_lichtplan',
    chapter: 5,
    titel: 'Aandachtspunt: Lichtplan',
    samenvatting:
      'Maak een lichtplan *voordat* de bouw start. Het gaat niet om de lampen, maar om *waar* het licht moet komen (basis, sfeer, functioneel).',
    inhoud: `
een lichtplan laten maken is meestal niet iets wat onderdeel is van de eerste plannen...
Een strategisch geplaatste simpele spot kan een ruimte in de
avond transformeren...
Het gaat tenslotte niet
om wat voor soort lampen er moeten komen maar juist over waar moet wat voor soort licht komen.
...
Dat bepaald sfeer en zorgt voor voldoende licht op de plekken waar het
nodig is. Denk dan bijvoorbeeld aan functionele verlichting op werkplekken...
    `,
    tags: {
      onderwerpen: ['uitvoering', 'ontwerp'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },
  {
    id: 'ontwerp_slim_praktisch',
    chapter: 5,
    titel: 'Veelgemaakte Fouten: Praktische zaken vergeten',
    samenvatting:
      'Denk na over de "rommel": waar laat u jassen, tassen, schoenen, sportspullen? Een goede berging en logische routing voorkomen dagelijkse ergernis.',
    inhoud: `
Niet goed nadenken over praktische gang van zaken: bij de meeste gezinnen met kinderen is het
zo dat jassen, tassen, schoenen, sportspullen, fietsen e.d. op plekken achtergelaten worden waar
dit het meeste gemak oplevert. En dat is vaak ergens in de gang of voor een deur. En dat levert
dan dus rommel en ergernis op. Bedenk dus bij het maken van een plattegrond goed hoe de
dagelijkse dingen gedaan gaan worden...
    `,
    tags: {
      onderwerpen: ['uitvoering', 'ontwerp', 'proces'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },
  {
    id: 'ontwerp_slim_kleine_ruimtes',
    chapter: 5,
    titel: 'Slim omgaan met kleine ruimtes',
    samenvatting:
      'Een kleine ruimte kan groots aanvoelen door juist gebruik van daglicht en contact met buiten. Een te grote, donkere ruimte heeft minder kwaliteit.',
    inhoud: `
Een kleine ruimte kan zeer ruimtelijk voelen door een juist gebruik van daglicht en contact met
buiten. Vaak is het zelfs beter om ruimtes niet te groot te maken omdat er een omslagpunt is
waarbij een grote ruimte teveel plekken gaat krijgen die in de praktijk te donker worden en dus
resulteren in het feit dat er altijd een lamp aan moet om het licht goed te krijgen.
    `,
    tags: {
      onderwerpen: ['ontwerp'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },

  // =======================================================================
  // --- 6. SAMENWERKEN MET PROFESSIONALS ---
  // =======================================================================

  {
    id: 'professionals_keuze_architect',
    chapter: 6,
    titel: 'Hoe kies je een architect?',
    samenvatting:
      'Het kiezen van een architect is persoonlijk. Kijk online of de stijl u aanspreekt, maar het allerbelangrijkste is de persoonlijke "klik".',
    inhoud: `
Natuurlijk is het best spannend om met een architect een woning te bedenken...
Het ontwerpen en (ver)- bouwen van een huis is een intensief, persoonlijk en langdurig proces. Het
is dan ook van groot belang dat het 'klikt' tussen opdrachtgever en architect. ...
En dus ook heel belangrijk dat, als je tijdens een ontwerpproces merkt dat het stroef gaat... je tijdig de knoop doorhakt om te stoppen...
    `,
    tags: {
      onderwerpen: ['professionals', 'proces'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },
  {
    id: 'professionals_keuze_aannemer_constructeur',
    chapter: 6,
    titel: 'Hoe kies je een aannemer of constructeur?',
    samenvatting:
      'Een constructeur wordt vaak via de architect gevonden. Een goede aannemer vindt u via referenties, keurmerken (BouwGarant) en het netwerk van uw architect.',
    inhoud: `
Een constructeur vinden is vaak niet nodig: de architect heeft over het algemeen meerdere
constructeurs waar hij mee samenwerkt...
Een aannemer vinden kan op veschillende manieren; belangrijk is in ieder geval om mensen om je
heen te vragen naar goede ervaringen... Een voorbeeld daarvan is bouwgarant. Zoek
vooral naar referenties...
En natuurlijk is de rol van de architect hierin ook van groot belang...
    `,
    tags: {
      onderwerpen: ['professionals', 'proces'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },
  {
    id: 'professionals_offerte_eisen',
    chapter: 6,
    titel: 'Wat moet er in een offerte van een aannemer staan?',
    samenvatting:
      'Een offerte moet specifiek zijn. Onduidelijkheden en te veel stelposten leiden tot conflicten en meerwerk. Het moet duidelijk omschrijven *wat* er gedaan wordt.',
    inhoud: `
Een offerte van een aannemer moet vooral duidelijk alle werkzaamheden aangeven die
opgenomen zijn in de totaalsom van de begroting. Problemen ontstaan vaak door verkeerde
verwachtingen...
De klassieke manier om een bouwproces vervelend te krijgen:
verrassingen die zorgen voor extra kosten. ...
Een offerte moet dus zo specifiek mogelijk zijn
om die verrassingen te voorkomen.
    `,
    tags: {
      onderwerpen: ['professionals', 'uitvoering', 'financien'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },
  {
    id: 'professionals_offerte_vergelijken',
    chapter: 6,
    titel: 'Hoe vergelijk je offertes van aannemers?',
    samenvatting:
      'Vraag altijd om een *gespecificeerde* begroting. Alleen dan kunt u zien of posten vergeten zijn, of de algemene kosten te hoog zijn, en of er veel risicovolle stelposten in zitten.',
    inhoud: `
Er kunnen soms grote verschillen zijn tussen aanbiedingen van aannemers. ...
De enige manier om offertes van aannemers goed te kunnen vergelijken is als ze een
gespecificeerde begroting aanleveren...
Daar moet ook instaan of en tot
wanneer de aanbieding prijsvast is: als er staat dat bepaalde onderdelen verrekenbaar zijn tijdens
de bouw dan zal dit een groot risico gaan zijn.
...
En natuurlijk moet per onderdeel helder omschreven staat wat de werkzaamheden zijn en wat er
geleverd wordt.
    `,
    tags: {
      onderwerpen: ['professionals', 'uitvoering', 'financien'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },
  {
    id: 'professionals_offerte_opbouw',
    chapter: 6,
    titel: 'Opbouw van een aannemersbegroting',
    samenvatting:
      'Een offerte bestaat uit: algemene kosten, CAR-verzekering, bouwkundige onderdelen (casco), afwerking, installaties, stelposten, winst/risico, en coördinatiekosten.',
    inhoud: `
Normaal gesproken is een offerte van een aannemer als volgt opgebouwd:
- overzicht van algemene bouwkosten...
- kosten CAR verzekering...
- kosten eventuele andere verzekeringen...
- overzicht van alle kosten van voorbereiding...
- alle bouwkundige onderdelen...
- overzicht van de afwerking...
- overzicht van alle installaties...
- overzicht van stelposten
- opslagen winst en risico
- coördinatiekosten...
- algemene voorwaarden...
    `,
    tags: {
      onderwerpen: ['professionals', 'financien'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },
  {
    id: 'professionals_conflicten_voorkomen',
    chapter: 6,
    titel: 'Hoe voorkom je conflicten met de aannemer?',
    samenvatting:
      'Heldere afspraken, een complete tekeningenset, een realistische planning, en het minimaliseren van stelposten zijn de sleutel tot een stressvrij proces.',
    inhoud: `
Discussies en conflicten, daar zit niemand op te wachten. ... Dat wil je
voorkomen door te zorgen dat er duidelijke tekeningen en afspraken op papier staan. ...
Planning is ook een belangrijk item: maak heldere afspraken over de duur van de bouw...
beter een realistische planning dan een planning die bedacht is om naar de mond van de
opdrachtgever te praten. ...
Beperk het aantal stelposten zoveel mogelijk.
    `,
    tags: {
      onderwerpen: ['professionals', 'uitvoering', 'proces'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },
  {
    id: 'professionals_bouwbegeleiding',
    chapter: 6,
    titel: 'Hoeveel bouwbegeleiding (controle) is nodig?',
    samenvatting:
      'Afhankelijk van de complexiteit en de voorbereiding, maar gemiddeld is elke 3 weken overleg voldoende. Vertrouw op uw architect voor de begeleiding.',
    inhoud: `
Dit is afhankelijk van een aantal belangrijke factoren:
- ken je de aannemer goed...
- hoe goed was de voorbereiding...
- hoe ingewikkeld is de verbouw of nieuwbouw...
Bij een goede voorbereiding zou gemiddeld om de drie weken op de bouw met aannemer,
onderaannemer en opdrachtgever overleggen voldoende moeten zijn. ...
Het meest comfortabel is natuurlijk begeleiding van eerste kennismaking tot aan oplevering van de
woning. ... de
expertise van de architect niet alleen het maken van een ontwerp is maar er ook voor te zorgen dat
het ontwerp op de juiste manier zonder zorgen en verrassingen gebouwd gaat worden.
    `,
    tags: {
      onderwerpen: ['professionals', 'uitvoering', 'proces'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },
  {
    id: 'professionals_misverstanden_architect',
    chapter: 6,
    titel: 'Misverstanden over de rol van de architect',
    samenvatting:
      'Twee misverstanden: 1. "Een architect is duur" (maar verdient zichzelf terug). 2. "Een architect is eigenwijs" (een goede architect is een teamlid).',
    inhoud: `
Waarschijnlijk de meest voorkomende is dat een architect inhuren erg duur is. ... de investering daarin
verdient zich snel terug door een gestructureerder proces, een beter ontwerp en een proces
zonder verrassingen.
...
Een ander misverstand is de eigenwijsheid van een architect... bij dat soort samenwerkingen is denk ik al snel duidelijk dat het
eenrichtingsverkeer is, snel afkappen dus en op zoek naar iemand die wel als teamlid kan
functioneren.
    `,
    tags: {
      onderwerpen: ['professionals', 'proces', 'financien'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },

  // =======================================================================
  // --- 7. PRAKTISCHE TOOLS & UITVOERING ---
  // (Items uit "Verbouw belangrijke aandachtspunten" e.d.)
  // =======================================================================
  {
    id: 'uitvoering_ventilatie_basis_verbouw',
    chapter: 7, // PDF Hoofdstuk 7 = Tools
    titel: 'Aandachtspunt Verbouw: Ventilatie (Basis)',
    samenvatting:
      'Isoleren = Ventileren. Bij oude woningen verdwijnt de natuurlijke tocht. Zonder nieuwe ventilatie (roosters of unit) ontstaan vocht en schimmel.',
    inhoud: `
lets wat vaak vergeten wordt bij het verbetern van woningen is ventilatie. Bij oude woningen is dat
ook nite zo belangrijk: door allerlei kieren... komt er... tocht naar binnen...
Aandachtspunt bij verduurzaming is dan ook vaak het zo veel mogelijk dichten van kieren...
Een belangrijk devies is echter: isoleren is ook ventileren. Bij
te weinig ventilatie zullen er allerlei ongezonde gassen ophopen... en zal vocht... aanwezig blijven. Met als gevolg nog meer ongezonde lucht door schimmelvorming.
...
Het principe komt dan
neer op volgende: een vemtilatieunit zuigt continu af in de badkamer, toilet en keuken. Daardoor
ontstaat er een onderdruk en wordt er verse lucht via gevelroosters... naar binnen gehaald...
    `,
    tags: {
      onderwerpen: ['uitvoering', 'duurzaamheid', 'ontwerp'],
      projectsoorten: ['verbouw', 'aanbouw'],
    },
  },
  {
    id: 'uitvoering_ventilatie_balans_nieuwbouw',
    chapter: 7,
    titel: 'Aandachtspunt Nieuwbouw: Balansventilatie',
    samenvatting:
      'Bij nieuwbouw is balansventilatie (met warmteterugwinning) de standaard. Dit is efficiënt, maar vereist ruimte voor kanalen.',
    inhoud: `
Bij de huidige regelgeving voor nieuwbouwwoningen is zo'n manier van ventileren (met roosters) ook geen optie
meer; de koude lucht die in de winter binnen komt... moet opgewarmd worden...
Hier wordt dan eigenlijk tegenwoordig standaard
uitgegaan van een balansventilatiesysteem. Bij dit systeem wordt er nog steeds afgezogen...
maar wordt verse lucht ook mechanisch aangevoerd... het grote energetisch voordeel... is het feit dat de lucht van
buiten door middel van een warmtewisselaar opgewarmd wordt...
    `,
    tags: {
      onderwerpen: ['uitvoering', 'duurzaamheid', 'ontwerp'],
      projectsoorten: ['nieuwbouw'],
    },
  },
  {
    id: 'uitvoering_ventilatie_kanalen_verbouw',
    chapter: 7,
    titel: 'Aandachtspunt Verbouw: Kanalen Balansventilatie',
    samenvatting:
      'Balansventilatie in een bestaand huis is lastig. De kanalen zijn groot en moeten weggewerkt worden in koofjes, knieschotten of nieuwe dekvloeren.',
    inhoud: `
Een belangrijk aandachtspunt bij dat systeem is het feit dat naar alle
ruimtes ventilatiekanalen aangeleg moeten worden die op een of andere manier weggewerkt
moeten worden in bestaande wanden en vloeren. En dat is niet eenvoudig...
Bij een rigoreuze verbouwing
waarbij alle vloeren en plafonds open liggen is er vaak wel het e.e.a. nodig...
    `,
    tags: {
      onderwerpen: ['uitvoering', 'duurzaamheid', 'ontwerp'],
      projectsoorten: ['verbouw', 'aanbouw'],
    },
  },
  {
    id: 'uitvoering_isolatie_basis',
    chapter: 7,
    titel: 'Aandachtspunt Verbouw: Isolatie (Basis)',
    samenvatting:
      'Een warmtepomp heeft pas zin als de schil (vloer, gevel, dak, glas) op orde is. Begin met de makkelijkste winst: vloerisolatie (indien kruipruimte) en glas.',
    inhoud: `
Dure installaties, zoals warmtepompen, aanleggen hebben alleen zin als de basis van de woning
op nieuwbouw kwaliteit of beter is. ... Het is dus van belang dat de isolatie van de schil van de woning op
orde is. ...
Een begane grondvloer isoleren
is meestal de meest makkelijke en snelle winst als er zich een kruipruimte bevindt...
Beglazing in kozijnen is vaak een volgende stap. ...
Houd overigens bij het plaatsen van triple beglazing rekening met... condens op de ramen...
    `,
    tags: {
      onderwerpen: ['uitvoering', 'duurzaamheid'],
      projectsoorten: ['verbouw', 'aanbouw'],
    },
  },
  {
    id: 'uitvoering_isolatie_gevels_binnen',
    chapter: 7,
    titel: 'Aandachtspunt Verbouw: Gevels isoleren (Binnenzijde)',
    samenvatting:
      'Isoleren aan de binnenzijde (met een voorzetwand) kan, maar heeft nadelen: ruimteverlies, koudebruggen, en risico op vochtproblemen bij verkeerde opbouw.',
    inhoud: `
Het isoleren van gevels is een belangrijke volgende stap. ...
Dan blijft isoatie aan de binnenzijde over: het
plaatsen van een hoogwaardig geïsoleerde voorzetwand binnen...
Er zitten echter ook een aantal haken en ogen aan: ten eerste wordt
natuurlijk de binnenruimte kleiner... Aansluitingen bij bestaande vloeren, wanden en kozijnen leveren vaak problemen op door
koudebruggen... En de constructie moet zodanig
aangelegd worden dat er geen condens problemen ontstaan...
    `,
    tags: {
      onderwerpen: ['uitvoering', 'duurzaamheid'],
      projectsoorten: ['verbouw', 'aanbouw'],
    },
  },
  {
    id: 'uitvoering_isolatie_gevels_buiten',
    chapter: 7,
    titel: 'Aandachtspunt Verbouw: Gevels isoleren (Buitenzijde)',
    samenvatting:
      'De beste (maar duurste) methode is het "inpakken" van de woning aan de buitenzijde. Dit voorkomt koudebruggen, maar is altijd vergunningsplichtig.',
    inhoud: `
Als de buitenzijde van de woning weinig kwaliteit heeft is eigenlijk de beste manier van isoleren
altijd het inpakken van de woning aan de buitenzijde. Dan worden een hoop problematische
aansluitingen met bestaande constructies voorkomen...
En het opdikken van gevels van soms wel 20 cm zorgt natuurlijk er ook voor dat de
aansluiting op goten en dakranden anders wordt...
En natuurlijk is het dan wel van groot belang om te onderzoeken of de bestaande gevels voldoende
kwaliteit hebben...
En nog een onderdeel... het aanbrengen van isolatie aan de buitenzijde... is altijd vergunningsplichtig...
    `,
    tags: {
      onderwerpen: ['uitvoering', 'duurzaamheid', 'vergunningen'],
      projectsoorten: ['verbouw', 'aanbouw'],
    },
  },
  {
    id: 'uitvoering_isolatie_dak',
    chapter: 7,
    titel: 'Aandachtspunt Verbouw: Dak isoleren',
    samenvatting:
      'Dakisolatie (binnen of buiten) is cruciaal. Let op de damp-opbouw: een dampremmende folie binnen en dampopen folie buiten voorkomt houtrot.',
    inhoud: `
En nog een onderdeel waar vaak heel veel winst tebehalen valt: het isoleren van het dal. ...
Het gaat dan niet alleen om kou maar ook om in de zomer warmte te weren...
Ook hier is de
vochthuishouding een belangrijk aandachtspunt...
Daken en gevels worden dan over het algemeen aan de binnenzijde voorzien van een
dampremmende folie... en aan de buitenzijde een waterkerende... dampopen folie...
Zeker bij oudere pannendaken ligt
er vaak nog een waterkerende laag onder de pannen... die... niet dampdoorlatend wat betekent
dat het vocht... niet weg kan en dus in de constructie blijft...
    `,
    tags: {
      onderwerpen: ['uitvoering', 'duurzaamheid'],
      projectsoorten: ['verbouw', 'aanbouw'],
    },
  },
  {
    id: 'uitvoering_isolatie_plat_dak',
    chapter: 7,
    titel: 'Aandachtspunt Verbouw: Plat dak isoleren (Nooit van binnen!)',
    samenvatting:
      'Platte daken (met bitumen/EPDM) mogen NOOIT van binnenuit geïsoleerd worden. Dit leidt tot vochtophoping en houtrot. Altijd isoleren aan de bovenzijde.',
    inhoud: `
Bij platte daken is er eigenlijk altijd een dampdichte oplossing aan de bovenkant: een bitumineuze
of epdm dakbedekking laat geen vocht door. Het isoleren van dat soort daken aan de binnenzijde
is dan ook vragen om problemen: het vocht zal gaan ophopen op het meest koude onderdeel van
de constructie... en zal dus in deloop van de tijd wegrotten. Bij platte daken dus altijd zaak om de
isolatie aan de bovenzijde van de constructie aan te brengen...
    `,
    tags: {
      onderwerpen: ['uitvoering', 'duurzaamheid'],
      projectsoorten: ['verbouw', 'aanbouw'],
    },
  },
  {
    id: 'uitvoering_fouten_kierdichtheid',
    chapter: 7,
    titel: 'Veelgemaakte Fouten: Kierdichtheid',
    samenvatting:
      'Te weinig aandacht voor kierdichtheid op de bouwplaats. Zelfs de binnenkant van een electrabuis voor een buitenlamp moet worden afgedicht.',
    inhoud: `
Te weinig aandacht voor de uitvoering op de bouwplaats. Op de bouw dient er een strenge manier
van controle te zijn zodat bouwkundige aansluitingen gemaakt worden conform de gekozen
uitgangspunten in de energieberekeningen. Gaat dan met name om de kierdichtheid...
Een electra doorvoer bijvoorbeeld voor een buitenlamp moet rondom afgedicht worden
maar ook de binnenkant van de buis moet afgekit worden...
    `,
    tags: {
      onderwerpen: ['uitvoering', 'duurzaamheid'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },
  {
    id: 'uitvoering_fouten_te_laat_kiezen',
    chapter: 7,
    titel: 'Veelgemaakte Fouten: Te laat keuzes maken',
    samenvatting:
      'Te laat kiezen van sanitair, tegels, keuken, etc. leidt tot stress, vertraging en meerkosten. Zorg dat alles voor de start van de bouw bekend is.',
    inhoud: `
te lang wachten met het maken van keuzes voor bijvoorbeeld sanitair, tegelwerk, vloerafwerking en
dergelijke. Een goed uitgevoerde bouw is alleen maar mogelijk als de planning strak is...
Te lang wachten met het maken van die keuzes is dan ook
niet handig en zal leiden tot een hoop gedoe en soms frustratie en meerkosten. De meest soepele
bouwprocessen zijn die waarbij bijna alle onderdelen al uitgezocht zijn...
    `,
    tags: {
      onderwerpen: ['uitvoering', 'proces'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },
  {
    id: 'uitvoering_fouten_zelf_leveren',
    chapter: 7,
    titel: 'Veelgemaakte Fouten: Zelf materialen leveren',
    samenvatting:
      'Zelf materialen (sanitair, tegels) online kopen lijkt goedkoop, maar let op: u bent zelf verantwoordelijk voor timing, compleetheid, schade en garantie.',
    inhoud: `
Te veel uitgaan van prijzen op internet voor sanitair en tegelwerk...
Een valkauil is echter vaak dat
materialen erg goedkoop lijken online in verhouding tot een aanbieding van een onderaannemer...
Soms
willen opdrachtgevers toch spullen zelf leveren. Dat kan natuurlijk maar er zitten wel wat haken en
ogen aan...
- de materialen moeten op het juiste moment geleverd worden en dan ook compleet zijn...
- alles moet bij levering gecontroleerd worden op schade...
- een installateur zal... geen garantie kunnen
geven op het materiaal.
    `,
    tags: {
      onderwerpen: ['uitvoering', 'financien', 'professionals'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },
  {
    id: 'uitvoering_stress_beperken',
    chapter: 7,
    titel: 'Hoe kun je stress tijdens een verbouwing beperken?',
    samenvatting:
      'Stress komt door onduidelijke afspraken, onhaalbare planning, of te late keuzes. Een extreem goede voorbereiding (alles kiezen vóór de start) is de enige oplossing.',
    inhoud: `
Stress tijden een bouw of verbouw komt eigenlijk altijd door een paar zaken:
- onduidelijke afspraken en dus verkeerde verwachtingen
- een planning die niet haalbaar blijkt voor de aannemer
- het niet op tijd uitzoeken van materialen die van belang zijn voor de voortgang van de bouw
- meerkosten die ontstaan door bovenstaande zaken

Eigenlijk allemaal onderdelen die je vooraf dus prima kunt ondervangen door het traject goed voor
te bereiden. ... Neem
de tijd om alles goed uit te zoeken, een heldere tekeningenset te maken...
    `,
    tags: {
      onderwerpen: ['uitvoering', 'proces'],
      projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
    },
  },

  // =======================================================================
  // --- 8. INSPIRATIE & VISIE ---
  // (Deze zijn weggelaten, zoals besproken: dit zijn 'blog-artikelen',
  // geen 'kennis-blokjes' voor de database)
  // =======================================================================
]