/**
 * Kennisbank Vergunningen & Constructie
 *
 * Dit bestand bevat specifieke regels over:
 * - Vergunningsplichtige werkzaamheden
 * - Vergunningsvrije werkzaamheden
 * - Constructieve wijzigingen
 * - Rode vlaggen bij verbouwingen
 */

import type { Onderwerp, Projectsoort } from './kennisbank_geordend2.data';

export type KennisItem = {
  id: string;
  chapter: number;
  titel: string;
  samenvatting: string;
  inhoud: string;
  onderwerpen: Onderwerp[];
  projectsoorten: Projectsoort[];
};

export const kennisbankVergunningen: KennisItem[] = [
  // =======================================================================
  // --- CONSTRUCTIEVE WIJZIGINGEN ---
  // =======================================================================

  {
    id: 'vergunning_constructief_algemeen',
    chapter: 3, // vergunningen
    titel: 'Constructieve wijzigingen zijn altijd vergunningsplichtig',
    samenvatting:
      'Elke wijziging aan de constructie van een woning vereist een omgevingsvergunning, tenzij het onderdeel is van een vergunningsvrije uitbouw.',
    inhoud: `
Constructieve wijzigingen aan een woning zijn ALTIJD vergunningsplichtig. Dit geldt voor:

- Het doorbreken of verwijderen van dragende muren
- Het maken van nieuwe openingen in dragende constructies
- Wijzigingen aan de dakconstructie
- Aanpassingen aan de fundering
- Het verwijderen of aanpassen van kolommen of steunpunten
- Wijzigingen aan vloerconstructies (houten balken, betonvloeren)

**Uitzondering**: Wanneer een doorbraak onderdeel is van een vergunningsvrije aanbouw of uitbouw,
kan deze doorbraak ook vergunningsvrij zijn. Dit geldt alleen als de uitbouw zelf aan alle
voorwaarden voor vergunningsvrij bouwen voldoet.

**Procedure**:
1. Altijd eerst een constructeur inschakelen voor berekeningen
2. Omgevingsvergunning aanvragen bij de gemeente
3. Constructieberekeningen meesturen met de aanvraag
4. Wachten op goedkeuring voordat je begint

**Waarschuwing**: Zonder vergunning constructief werk uitvoeren is illegaal en kan leiden tot
handhaving, boetes, en problemen bij verkoop van de woning.
    `,
    onderwerpen: ['vergunningen'],
    projectsoorten: ['verbouw', 'aanbouw'],
  },

  {
    id: 'vergunning_dragende_muur',
    chapter: 3,
    titel: 'Dragende muur doorbreken of verwijderen',
    samenvatting:
      'Het doorbreken van een dragende muur vereist altijd een constructeur, stalen balk (UNP/HEA), en een omgevingsvergunning.',
    inhoud: `
Het doorbreken of verwijderen van een dragende muur is een van de meest voorkomende
verbouwingswensen, maar ook een van de meest risicovolle ingrepen.

**Altijd nodig**:
1. **Constructeur**: Laat eerst een constructief ingenieur bepalen of de muur dragend is
2. **Constructieberekening**: De constructeur berekent welke stalen balk (UNP, HEA, IPE profiel) nodig is
3. **Omgevingsvergunning**: Aanvragen bij de gemeente met de constructieberekening
4. **Stalen balk**: Meestal een UNP of HEA profiel om de krachten over te nemen
5. **Opleggingen**: De balk moet rusten op voldoende draagkrachtige punten (kolommen of muurwerk)

**Herkennen dragende muren**:
- Muren in de lengterichting van het huis zijn vaak dragend
- Muren onder andere muren of onder de nok zijn meestal dragend
- Muren dikker dan 10cm zijn vaker dragend
- Bij twijfel: ALTIJD een constructeur raadplegen

**Risico's bij verkeerd aanpakken**:
- Scheuren in muren en plafonds
- Doorbuiging van vloeren
- In extreme gevallen: instorting
- Problemen met verzekering en verkoop

**Kosten indicatie**:
- Constructeur: €300-800 voor berekening
- Stalen balk: €500-2000 afhankelijk van lengte
- Plaatsing: €1000-3000 voor het gehele werk
    `,
    onderwerpen: ['vergunningen'],
    projectsoorten: ['verbouw'],
  },

  {
    id: 'vergunning_jaren30_woning',
    chapter: 3,
    titel: 'Verbouwen van jaren 30 woningen - extra aandachtspunten',
    samenvatting:
      'Vooroorlogse woningen (jaren 20-40) hebben vaak houten vloerconstructies en bijzondere constructieve eigenschappen die extra aandacht vereisen.',
    inhoud: `
Jaren 30 woningen (en andere vooroorlogse woningen uit 1920-1940) hebben specifieke
constructieve eigenschappen waar je rekening mee moet houden bij verbouwingen.

**Typische kenmerken jaren 30 woningen**:
- **Houten vloerbalken**: In plaats van betonvloeren, vaak grenen of vuren balken
- **Houten balklaag**: De draagconstructie van de verdiepingsvloeren
- **Spouwmuren**: Vaak geen of beperkte spouwisolatie
- **Houten kapconstructie**: Gordingen en spanten van hout
- **Fundering op staal**: Gemetselde fundering, niet altijd even stabiel

**Extra aandachtspunten bij verbouwen**:

1. **Dragende muren**: Veel binnenmuren zijn dragend in deze woningen
2. **Vloerbalken**: Check de staat van de houten balken (houtworm, rot)
3. **Draagkracht vloeren**: Houten vloeren hebben beperkte draagkracht
4. **Leidingen**: Oude loden leidingen moeten vaak vervangen worden
5. **Elektra**: Verouderde bedrading kan brandgevaarlijk zijn

**Bij zolder verbouwen**:
- Houten balklaag vaak niet berekend op permanent gebruik
- Mogelijk versterken of nieuwe vloer nodig
- Dakconstructie vaak niet geschikt voor dakkapel zonder aanpassingen
- Trapgat maken = constructieve ingreep

**Altijd een constructeur inschakelen bij**:
- Doorbreken van muren
- Zolder bewoonbaar maken
- Dakkapel plaatsen
- Uitbouwen aan achterzijde
    `,
    onderwerpen: ['vergunningen'],
    projectsoorten: ['verbouw'],
  },

  // =======================================================================
  // --- VERGUNNINGSVRIJ BOUWEN ---
  // =======================================================================

  {
    id: 'vergunning_vrij_uitbouw',
    chapter: 3,
    titel: 'Vergunningsvrij uitbouwen - voorwaarden',
    samenvatting:
      'Een uitbouw aan de achterzijde kan vergunningsvrij zijn als deze aan specifieke voorwaarden voldoet qua diepte, hoogte en oppervlakte.',
    inhoud: `
Een aanbouw of uitbouw aan de achterzijde van uw woning kan vergunningsvrij zijn,
maar alleen als aan ALLE voorwaarden wordt voldaan.

**Voorwaarden vergunningsvrij uitbouwen (per 2024)**:

1. **Locatie**: Alleen aan de achterkant van de woning
2. **Diepte**: Maximaal 4 meter uit de achtergevel
3. **Hoogte**: Maximaal 3 meter (bij plat dak) of aansluitend op bestaande dakhelling
4. **Oppervlakte totaal**: Bebouwd erf mag niet meer zijn dan 50% van achtererfgebied
5. **Afstand erfgrens**: Minimaal 1 meter tot erfgrens bij buren (of 0m met toestemming)

**Belangrijk bij doorbraak**:
Als de uitbouw vergunningsvrij is, kan de doorbraak naar de bestaande woning
OOK vergunningsvrij zijn. Dit is de uitzondering op de regel dat constructieve
wijzigingen altijd vergunningsplichtig zijn.

**Let op**: Vergunningsvrij betekent NIET dat je geen regels hoeft te volgen!
- Bouwbesluit blijft van toepassing
- Constructie moet veilig zijn
- Constructeur blijft aan te raden voor berekeningen

**Wanneer WEL vergunning nodig**:
- Uitbouw aan voorkant of zijkant
- Dieper dan 4 meter
- Hoger dan 3 meter
- Bij monumentale panden
- In beschermd stadsgezicht
    `,
    onderwerpen: ['vergunningen'],
    projectsoorten: ['aanbouw', 'verbouw'],
  },

  {
    id: 'vergunning_vrij_dakkapel',
    chapter: 3,
    titel: 'Dakkapel plaatsen - wanneer vergunningsvrij',
    samenvatting:
      'Een dakkapel aan de achterzijde kan vergunningsvrij zijn als deze aan specifieke maatvoorwaarden voldoet.',
    inhoud: `
Een dakkapel kan onder bepaalde voorwaarden vergunningsvrij geplaatst worden.

**Voorwaarden vergunningsvrije dakkapel (achterzijde)**:

1. **Locatie**: Alleen aan de achterzijde van het dakvlak
2. **Breedte**: Maximaal 50% van de breedte van het dakvlak
3. **Hoogte bovenzijde**: Minimaal 0,5 meter onder de nok
4. **Hoogte onderzijde**: Minimaal 0,5 meter boven de dakvoet
5. **Zijkanten**: Minimaal 0,5 meter vrij aan beide zijden

**Altijd vergunningsplichtig**:
- Dakkapel aan de voorzijde
- Dakkapel aan de zijkant (naar openbaar gebied)
- Grotere dakkapellen dan bovenstaande maten
- Bij monumenten of beschermd stadsgezicht

**Constructieve aspecten**:
Ook bij een vergunningsvrije dakkapel moet de constructie veilig zijn:
- De bestaande dakconstructie moet de dakkapel kunnen dragen
- Vaak zijn extra spanten of versterkingen nodig
- Laat dit altijd door een professional beoordelen
    `,
    onderwerpen: ['vergunningen'],
    projectsoorten: ['verbouw'],
  },

  // =======================================================================
  // --- ZOLDER VERBOUWEN ---
  // =======================================================================

  {
    id: 'vergunning_zolder_verbouwen',
    chapter: 3,
    titel: 'Zolder verbouwen tot slaapkamer of werkruimte',
    samenvatting:
      'Een zolder bewoonbaar maken is vaak vergunningsplichtig en vereist aandacht voor constructie, brandveiligheid en vluchtwegen.',
    inhoud: `
Het verbouwen van een zolder tot bewoonbare ruimte (slaapkamer, werkruimte) is een
populaire manier om extra ruimte te creeren, maar vraagt om zorgvuldige planning.

**Vergunning nodig bij**:
- Wijziging van de gebruiksfunctie (opslag → verblijfsruimte)
- Plaatsen van dakkapel of dakraam groter dan 2m²
- Aanpassen van de dakconstructie
- Maken van een trapgat (constructieve wijziging!)

**Constructieve aandachtspunten**:

1. **Vloerbalken/balklaag**:
   - Oorspronkelijk vaak berekend op lichte belasting (opslag)
   - Mogelijk versterken nodig voor permanent gebruik
   - Extra draagkracht voor badkamer (water is zwaar!)

2. **Trapgat**:
   - Maken van trapgat = doorbreken vloerconstructie
   - Vereist versterking rondom (trimbalken)
   - Altijd constructeur raadplegen

3. **Dakconstructie**:
   - Niet zomaar gordingen of spanten verwijderen
   - Dakkapel vraagt vaak om extra ondersteuning

**Brandveiligheid**:
- Vluchtweg moet mogelijk zijn (raam of deur naar buiten)
- Rookmelders verplicht
- Minimale afmetingen voor vluchtopening

**Isolatie**:
- Dak-isolatie is essentieel voor comfort
- Let op ventilatie om vochtproblemen te voorkomen
    `,
    onderwerpen: ['vergunningen'],
    projectsoorten: ['verbouw'],
  },

  // =======================================================================
  // --- FUNDERING ---
  // =======================================================================

  {
    id: 'vergunning_fundering',
    chapter: 3,
    titel: 'Funderingsproblemen en funderingsherstel',
    samenvatting:
      'Funderingsproblemen komen veel voor bij oudere woningen. Funderingsherstel is altijd vergunningsplichtig.',
    inhoud: `
Funderingsproblemen zijn een serieus en kostbaar issue, vooral bij oudere woningen
met houten paalfundering of fundering op staal.

**Signalen van funderingsproblemen**:
- Scheuren in muren (vooral diagonaal bij ramen/deuren)
- Klemmende deuren of ramen
- Scheefstand van de woning
- Scheuren in voegen van metselwerk
- Natte kruipruimte

**Oorzaken**:
- **Houten palen**: Rot door schommelende grondwaterstand
- **Fundering op staal**: Verzakking door slechte ondergrond
- **Droogte**: Inklinking van veengrond
- **Boomwortels**: Kunnen fundering beschadigen

**Funderingsherstel**:
- ALTIJD vergunningsplichtig
- Kostbaar: €30.000 - €100.000+ per woning
- Verschillende technieken:
  - Nieuwe betonpalen naast oude
  - Vijzelen en ondersteunen
  - Injecteren

**Vooraf laten onderzoeken**:
- Bij aankoop van woning ouder dan 1970
- Bij zichtbare scheuren
- In gebieden met bekende funderingsproblemen (bijv. delen van Amsterdam, Rotterdam)

**Kosten onderzoek**: €500-1500 voor funderingsonderzoek
    `,
    onderwerpen: ['vergunningen'],
    projectsoorten: ['verbouw'],
  },

  // =======================================================================
  // --- OVERIGE VERGUNNINGEN ---
  // =======================================================================

  {
    id: 'vergunning_schuur_garage',
    chapter: 3,
    titel: 'Schuur of garage bouwen',
    samenvatting:
      'Een vrijstaand bijgebouw zoals een schuur of garage kan onder voorwaarden vergunningsvrij zijn.',
    inhoud: `
Het bouwen van een vrijstaand bijgebouw (schuur, garage, tuinhuis) kan onder
bepaalde voorwaarden vergunningsvrij.

**Voorwaarden vergunningsvrij bijgebouw**:

1. **Locatie**: In het achtererfgebied (achter de voorgevel)
2. **Hoogte**: Maximaal 3 meter (bij plat dak) of 5 meter bij kap
3. **Oppervlakte**:
   - Totaal bebouwd: max 50% van achtererfgebied
   - Max 30m² vergunningsvrij
   - Bij erfgebied > 100m²: max 50m² vergunningsvrij
4. **Afstand**: Minimaal 1 meter achter voorgevel

**Altijd vergunningsplichtig**:
- Bijgebouw groter dan 50m²
- Bijgebouw in voorerfgebied
- Bij monumenten of beschermd stadsgezicht

**Praktische tips**:
- Check vooraf bij gemeente of welstandseisen gelden
- Informeer buren bij bouwen dicht bij erfgrens
- Let op ondergrondse leidingen en kabels
    `,
    onderwerpen: ['vergunningen'],
    projectsoorten: ['nieuwbouw', 'verbouw'],
  },

  {
    id: 'vergunning_monument',
    chapter: 3,
    titel: 'Verbouwen van een monument of in beschermd stadsgezicht',
    samenvatting:
      'Bij rijks- of gemeentelijke monumenten en in beschermde stadsgezichten zijn vrijwel alle wijzigingen vergunningsplichtig.',
    inhoud: `
Woont u in een monument of in een beschermd stadsgezicht? Dan gelden strengere regels.

**Rijksmonument**:
- Vrijwel ALLE wijzigingen zijn vergunningsplichtig
- Ook interne verbouwingen
- Ook schilderen in andere kleur (exterieur)
- Monumentencommissie beoordeelt alle plannen
- Langere doorlooptijd vergunningen

**Gemeentelijk monument**:
- Regels per gemeente verschillend
- Vaak vergelijkbaar met rijksmonument
- Check lokale monumentenverordening

**Beschermd stadsgezicht**:
- Buitenzijde strenger gereguleerd
- Vergunningsvrije regels gelden vaak NIET
- Welstandscommissie beoordeelt plannen
- Dakkapellen, kozijnen, gevels extra getoetst

**Voordelen monumentenstatus**:
- Mogelijk subsidie voor restauratie
- Fiscale aftrek onderhoudskosten
- Waardevermeerdering op lange termijn

**Tips**:
- Neem vroeg contact op met gemeente
- Schakel specialist in monumentenzorg in
- Reken op langere doorlooptijden en hogere kosten
    `,
    onderwerpen: ['vergunningen'],
    projectsoorten: ['verbouw'],
  },

  {
    id: 'vergunning_omgevingsvergunning_aanvragen',
    chapter: 3,
    titel: 'Omgevingsvergunning aanvragen - stappenplan',
    samenvatting:
      'Een omgevingsvergunning vraag je digitaal aan via het Omgevingsloket. De doorlooptijd is meestal 8 weken.',
    inhoud: `
Als u een omgevingsvergunning nodig heeft, volgt hier het stappenplan.

**Stap 1: Vergunningcheck**
- Doe eerst de vergunningcheck op omgevingsloket.nl
- Dit geeft aan of u een vergunning nodig heeft
- En welke documenten u moet aanleveren

**Stap 2: Documenten verzamelen**
Meestal nodig:
- Bouwtekeningen (plattegronden, doorsneden, gevels)
- Situatietekening met maatvoering
- Constructieberekeningen (bij constructieve wijzigingen)
- Foto's van bestaande situatie
- Eventueel EPC-berekening (energieprestatie)

**Stap 3: Aanvraag indienen**
- Via omgevingsloket.nl (digitaal)
- Of via de website van uw gemeente
- Kosten (leges) verschillen per gemeente: €200-1500+

**Stap 4: Procedure**
- **Reguliere procedure**: 8 weken, eenmalig te verlengen met 6 weken
- **Uitgebreide procedure**: 26 weken (bij afwijking bestemmingsplan)

**Stap 5: Besluit**
- Vergunning verleend: u mag beginnen na bezwaartermijn (6 weken)
- Vergunning geweigerd: mogelijkheid tot bezwaar

**Tips**:
- Begin op tijd met aanvragen
- Vooroverleg met gemeente kan tijd schelen
- Schakel een tekenaar of architect in voor de tekeningen
    `,
    onderwerpen: ['vergunningen', 'proces'],
    projectsoorten: ['nieuwbouw', 'verbouw', 'aanbouw'],
  },
];
