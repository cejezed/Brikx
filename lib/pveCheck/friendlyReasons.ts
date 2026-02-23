// lib/pveCheck/friendlyReasons.ts
// Menselijke GAP-omschrijvingen per rubric-item (A3 — geen technisch jargon).
//
// Twee varianten per veld:
//   missing — veld volledig afwezig in document
//   vague   — veld aanwezig maar te onspecifiek
//
// Principe: beschrijf de CONSEQUENTIE, niet alleen het ontbrekende feit.
// Toon: direct, professioneel, tweede persoon ("je project", "een architect").

export type FriendlyReason = {
  missing: string;
  vague: string;
};

export const GAP_FRIENDLY_REASONS: Record<string, FriendlyReason> = {

  // ── BASIS ──────────────────────────────────────────────────────────────────

  "basis.projectType": {
    missing:
      "Zonder een duidelijk projecttype weten aannemers en vergunningverleners niet waarmee ze te maken hebben — dat leidt direct tot verkeerde offertes en vertraagde vergunningsaanvragen.",
    vague:
      "Het projecttype is benoemd, maar niet eenduidig genoeg. 'Verbouwing' en 'renovatie' zijn juridisch en bouwkundig verschillend; onduidelijkheid hier kost je al snel weken doorlooptijd.",
  },

  "basis.locatie": {
    missing:
      "Zonder locatie kan niemand het bestemmingsplan, de bodemgesteldheid of de bouwvoorschriften controleren. Elk advies in dit rapport is daarmee gebaseerd op aannames.",
    vague:
      "Een regio of stad is niet voldoende — een architect en aannemer hebben minimaal een straatnaam of kadastraal nummer nodig om realistische uitspraken te doen over vergunning en kosten.",
  },

  "basis.bouwjaar": {
    missing:
      "Bij een verbouwing bepaalt het bouwjaar of er asbest aanwezig kan zijn, hoe de fundering waarschijnlijk is uitgevoerd en wat het energielabel-potentieel is. Zonder dit gegeven werk je blind.",
    vague:
      "'Oud pand' of 'jaren 30-woning' is te vaag om de juiste constructieve aannames te maken. Noteer het exacte bouwjaar of in elk geval het decennium.",
  },

  "basis.gebruikersProfiel": {
    missing:
      "Wie er in het gebouw woont of werkt, bepaalt drempelvrije eisen, werkplekindeling en toekomstige aanpassingen. Zonder gebruikersprofiel worden levensloopbestendigheid en thuiswerkeisen over het hoofd gezien.",
    vague:
      "'Gezin' of 'particulier' zegt te weinig. Vermeld leeftijden, mobiliteitsbehoeften en werkpatronen — ze sturen keuzes die later niet meer terug te draaien zijn.",
  },

  "basis.omgevingsContext": {
    missing:
      "Monumentale status of een beschermd stadsgezicht beperkt je ontwerpvrijheid aanzienlijk en verlengt het vergunningsproces. Zonder dit te vermelden verrast het je pas bij de vergunningsaanvraag.",
    vague:
      "De omgevingscontext is aangestipt maar niet volledig uitgewerkt. Controleer het welstandsregime en eventuele erfgoed-aanwijzingen — die zijn bindend en gelden ongeacht je wensen.",
  },

  // ── RUIMTES ────────────────────────────────────────────────────────────────

  "ruimtes.rooms": {
    missing:
      "Zonder een ruimteprogramma kan een architect geen plattegrond tekenen en een aannemer geen reële prijs berekenen. Dit is het fundament van elk PvE.",
    vague:
      "Het ruimteprogramma is benoemd maar mist oppervlaktes of essentiële ruimtes. Een architect heeft minimaal de hoofd-ruimtes met globale m² nodig om haalbaarheid te toetsen.",
  },

  "ruimtes.daglicht": {
    missing:
      "Daglicht- en oriëntatie-eisen sturen de hele plattegrond-indeling. Zonder ze vastgelegd te hebben loop je het risico op een woonkamer op het noorden of een slaapkamer zonder ochtendlicht.",
    vague:
      "'Veel licht' is geen projecteis. Benoem gewenste oriëntaties per hoofd-ruimte zodat de architect de indeling daarop kan afstemmen en schaduwrisico van buurpercelen kan beoordelen.",
  },

  "ruimtes.buitenruimte": {
    missing:
      "Buitenruimte beïnvloedt het bebouwingspercentage en buurrelaties. Zonder tuin- of terraseis kan de architect het perceel niet optimaal benutten.",
    vague:
      "De buitenruimte is wel vermeld maar zonder m² of oriëntatie. Te weinig oppervlak of een verkeerd georiënteerd terras is een van de meest genoemde teleurstellingen na oplevering.",
  },

  "ruimtes.akoestiek": {
    missing:
      "Akoestische eisen worden pas duur als ze achteraf komen. Bij een thuisstudio, muziekkamer of woning met meerdere thuiswerkers zijn geluidsisolatie-maatregelen een vast onderdeel van het ontwerp.",
    vague:
      "'Weinig geluid' is niet specificeerbaar voor een aannemer. Benoem de ruimte en de gewenste Rw-waarde (bijv. ≥ 52 dB) zodat de juiste constructie wordt gekozen.",
  },

  // ── WENSEN ────────────────────────────────────────────────────────────────

  "wensen.wishes": {
    missing:
      "Zonder geprioriteerde wensen kan een architect bij budgetdruk geen onderbouwde keuze maken. Alles lijkt dan even belangrijk, waardoor verkeerde afwegingen worden gemaakt.",
    vague:
      "Wensen zijn aanwezig maar zonder MoSCoW-prioriteit. Als het budget tegenvalt, weet niemand wat je écht wilt behouden — dat leidt tot herhaaldelijke ontwerprondes.",
  },

  "wensen.toekomstbestendigheid": {
    missing:
      "Een woning die nu niet levensloopbestendig is, kost later €20.000-€50.000 extra om aan te passen. De keuze hoeft nu niet duur te zijn: constructiefvrije wanden en een slaapkamer op de begane grond zijn relatief goedkoop mee te nemen.",
    vague:
      "'Aanpasbaar' zonder concrete maatregelen helpt een aannemer niet. Beschrijf welke ruimtes zonder trap bereikbaar moeten zijn en welke wanden later doorgebroken mogen worden.",
  },

  "wensen.stijl": {
    missing:
      "Zonder stijlreferentie geeft de architect een ontwerp vanuit eigen voorkeur. Dat leidt regelmatig tot meerdere revisierondes en hogere ontwerpkosten.",
    vague:
      "Een stijlomschrijving is aanwezig maar te algemeen. 'Modern' kan van minimalistisch wit tot industrieel zwart betekenen. Voeg een referentieproject of moodboard-richting toe.",
  },

  "wensen.binnenklimaat": {
    missing:
      "Comforteisen voor temperatuur en luchtkwaliteit bepalen welke installaties nodig zijn. Zonder deze eisen wordt comfort niet getoetst en blijven oververhitting en tocht verborgen risico's.",
    vague:
      "Comforteisen zijn benoemd maar niet meetbaar. Gebruik concrete streefwaarden (bijv. max 25°C op 90% van zomerdagen, CO₂ < 800 ppm) zodat de installateur hierop kan dimensioneren.",
  },

  // ── BUDGET ────────────────────────────────────────────────────────────────

  "budget.budgetTotaal": {
    missing:
      "Zonder budget is geen haalbaarheidstoets mogelijk. Een architect en aannemer werken dan op basis van aannames, waardoor de eerste offerte vrijwel zeker een teleurstelling wordt.",
    vague:
      "Een budget zonder bandbreedte geeft te weinig houvast. Noem minimaal een onder- en bovengrens en geef aan of BTW en bijkomende kosten zijn inbegrepen.",
  },

  "budget.bufferpost": {
    missing:
      "Projecten zonder bufferpost overschrijden hun budget gemiddeld met 12-18%. Bij verbouwingen liggen onverwachte funderingsproblemen of asbestsanering altijd op de loer.",
    vague:
      "Een bufferpost is benoemd maar het percentage is niet duidelijk. Leg vast hoeveel procent van de bouwsom is gereserveerd — de standaard is 10-15% bij verbouwingen.",
  },

  "budget.btwBijkomend": {
    missing:
      "Bijkomende kosten (BTW, leges, honoraria, notaris) zijn gemiddeld 15-25% bovenop de bouwsom en worden structureel onderschat. Zonder dit te benoemen kloppen je financiële verwachtingen niet.",
    vague:
      "Bijkomende kosten zijn aangestipt maar niet uitgesplitst. Benoem minstens het BTW-regime en een indicatie van architecthonorarium en leges — dat voorkomt verrassingen bij de eindafrekening.",
  },

  "budget.financiering": {
    missing:
      "Financieringsvorm en eigenkapitaal zijn relevant voor de planning: een bouwdepot vergt fasering die afgestemd moet worden met de aannemer, en subsidies vereisen tijdige aanvraag.",
    vague:
      "De financieringsvorm is vermeld maar te globaal. Geef aan welk deel hypotheek en welk deel eigen kapitaal is, en of er een bouwdepot of subsidie-aanvraag bij betrokken is.",
  },

  // ── TECHNIEK ──────────────────────────────────────────────────────────────

  "techniek.verwarming": {
    missing:
      "De keuze voor verwarming bepaalt of je een gasaansluiting nodig hebt, hoeveel vloerhoogte je verliest aan vloerverwarming en wat je exploitatiekosten worden. Zonder dit vast te leggen kunnen aannemers geen passende offerte maken.",
    vague:
      "'Duurzaam verwarmen' is geen specificatie. Kies concreet: warmtepomp (lucht/water of bodem), hybride cv, of volledig all-electric — inclusief het afgiftesysteem (vloer, radiator, lucht).",
  },

  "techniek.ventilatie": {
    missing:
      "In een goed geïsoleerde woning is ventilatie verplicht en bepaalt het de leidingvoering, plafondhoogte en luchtkwaliteit. Een vergeten ventilatiesysteem leidt tot condensatie en schimmelklachten.",
    vague:
      "Het ventilatieconcept is aangestipt maar niet uitgewerkt. Geef aan of het gaat om natuurlijke ventilatie, mechanische afzuiging of balansventilatie met WTW — elk systeem stelt andere eisen aan het gebouw.",
  },

  "techniek.isolatie": {
    missing:
      "Isolatiewaarden bepalen het energielabel, de verwarmingscapaciteit en het zomercomfort. Zonder doelwaarden per bouwdeel werkt een installateur met giswerk.",
    vague:
      "'Goed geïsoleerd' is niet specificeerbaar. Benoem Rc-waarden per bouwdeel (gevel, dak, vloer) zodat aannemers identieke offertes kunnen indienen en het energielabel haalbaar is.",
  },

  "techniek.daglichtGlas": {
    missing:
      "Een grote glazen pui zonder zonweringsstrategie leidt in de zomer tot oververhitting, ook in een goed geïsoleerde woning. Dit is één van de meest kosteneffectieve beslissingen om vroeg te maken.",
    vague:
      "Glas en zonwering zijn vermeld maar zonder percentages of type. Benoem het glaspercentage per gevel en de gewenste zonweringsvorm (inwendig/uitwendig) zodat de thermische berekening klopt.",
  },

  "techniek.sanitair": {
    missing:
      "Sanitaire herindeling achteraf is een van de duurste aanpassingen in bestaande bouw. Benoem eisen per natte cel nu, zodat de leidingvoering meteen correct ontworpen wordt.",
    vague:
      "Sanitaire wensen zijn aangestipt maar niet volledig. Beschrijf per badkamer de gewenste toestellen (douche/bad, wastafels) en het warmwatersysteem — dat stuurt de installatie-capaciteit.",
  },

  "techniek.elektra": {
    missing:
      "Bij een all-electric woning of een woning met laadpaal kan een standaard 3×25A aansluiting te krap zijn. Dit nu vastleggen voorkomt kostbare verzwaring of wachttijden bij het energienetbedrijf.",
    vague:
      "Elektra-wensen zijn benoemd maar niet gespecificeerd. Benoem gewenst aansluitvermogen, of er een laadpaal (en welk vermogen) nodig is, en of er domotica-bekabeling aangelegd moet worden.",
  },

  "techniek.bouwfysica": {
    missing:
      "Koudebruggen en onvoldoende luchtdichtheid zijn verantwoordelijk voor 60% van de vochtklachten in gerenoveerde woningen. Benoem een luchtdichtheidsdoel en plan een blower door-test.",
    vague:
      "Bouwfysische eisen zijn aangestipt maar te algemeen. Leg vast welke qv10-waarde je nastreeft en hoe koudebruggen bij kritische aansluitingen worden voorkomen.",
  },

  // ── DUURZAAM ──────────────────────────────────────────────────────────────

  "duurzaam.energieLabel": {
    missing:
      "'Zo duurzaam mogelijk bouwen' zonder meetbaar doel leidt tot vage opdrachten en onvergelijkbare offertes. Een concreet energielabel of BENG-eis geeft iedereen een helder streefdoel.",
    vague:
      "Een duurzaamheidsambitie is benoemd maar niet vertaald naar een meetbaar doel. Kies een specifiek energielabel (A, A+, A++, NOM) of BENG-waarden zodat het ontwerp hierop geoptimaliseerd kan worden.",
  },

  "duurzaam.zonnepanelen": {
    missing:
      "Als zonnepanelen later worden toegevoegd, is de dakconstructie en de netaansluiting mogelijk niet voorbereid. Het is goedkoper om de infrastructuur nu mee te nemen, ook als de panelen later komen.",
    vague:
      "Zonnepanelen zijn gewenst maar capaciteit en oriëntatie zijn niet vastgelegd. Benoem minimaal het gewenste vermogen (kWp) en het dakoppervlak zodat de constructeur de dakbelasting kan berekenen.",
  },

  "duurzaam.materialen": {
    missing:
      "Zonder materiaalkeuze-ambitie worden materialen puur op prijs geselecteerd. Biobased of circulaire materialen vereisen vroegtijdige specificatie om leveranciers en kosten te kunnen plannen.",
    vague:
      "Duurzame materialen zijn gewenst maar niet geconcretiseerd. Geef een MPG-doelwaarde of benoem specifieke voorkeuren (houtvezel, hergebruik, FSC-hout) zodat de adviseur dit kan uitwerken.",
  },

  "duurzaam.water": {
    missing:
      "Verhard oppervlak zonder compensatie leidt bij extreme buien tot wateroverlast. Regenwateropvang of infiltratie is in steeds meer gemeenten verplicht bij nieuwbouw en grote verbouwingen.",
    vague:
      "Waterbeheer is aangestipt maar niet uitgewerkt. Benoem het gewenste opvangvolume of de infiltratiemaatregel en koppel dit aan het dakoppervlak om te beoordelen of het volstaat.",
  },

  // ── RISICO ────────────────────────────────────────────────────────────────

  "risico.planning": {
    missing:
      "Zonder gewenste start- en opleverdatum is het onmogelijk te toetsen of de vergunningsdoorlooptijd en bouwperiode realistisch zijn. Tijdsdruk wordt zo pas laat ontdekt.",
    vague:
      "'Zo snel mogelijk' of 'eind dit jaar' is geen planning. Benoem een concrete start- en opleverdatum en vergelijk die met de realistische vergunnings- en uitvoeringstijd.",
  },

  "risico.vergunning": {
    missing:
      "Zonder check op vergunningsplicht kan een project maanden vertraging oplopen of zelfs teruggedraaid worden. Neem minimaal een kwalitatieve beoordeling op.",
    vague:
      "De vergunningssituatie is aangestipt maar niet concreet. Geef de status aan (vergunningvrij getoetst / aanvraag in voorbereiding / vergunning verleend) en noteer eventuele welstandseis.",
  },

  "risico.scope": {
    missing:
      "Onduidelijke rolverdeling is de meest voorkomende oorzaak van meerwerk-discussies. Leg vast wie wat oplevert: casco, afbouw, installaties, tuin, schilderwerk.",
    vague:
      "De scope is beschreven maar niet volledig afgebakend. Maak een expliciete lijst van wat de aannemer levert en wat de opdrachtgever zelf regelt — dat voorkomt discussies op de bouwplaats.",
  },

  "risico.constructief": {
    missing:
      "Onverwachte funderingsproblemen kosten gemiddeld €15.000-€40.000 extra. Bij bestaande bouw ouder dan 1940 is een funderingsinspectie bijna altijd de moeite waard.",
    vague:
      "Constructieve maatregelen zijn aangestipt maar niet volledig uitgewerkt. Beschrijf welke dragende elementen worden aangetast en welk onderzoek is gepland — een architect kan dan realistisch plannen.",
  },

  "risico.asbest": {
    missing:
      "Bij gebouwen van voor 1994 is een asbestinventarisatie verplicht vóór sloopwerk. Zonder inventarisatie riskeer je een bouwstop, boetes en saneringskosten die kunnen oplopen tot €50.000+.",
    vague:
      "Asbest is vermeld maar de inventarisatiestatus is onduidelijk. Benoem of een type-A inventarisatie is uitgevoerd, wat de uitkomst was en of er saneringskosten zijn opgenomen in het budget.",
  },

  "risico.omgeving": {
    missing:
      "Buurprotest, een smalle toegangsweg of een kraanopstelling op openbaar terrein kunnen de bouwstart met weken vertragen. Dit hoeft geen showstopper te zijn — maar pak het vroeg op.",
    vague:
      "Omgevingsfactoren zijn vermeld maar niet concreet uitgewerkt. Noteer of buren zijn geïnformeerd, of ontheffing voor bouwverkeer is aangevraagd en of er budget voor tijdelijke verhuizing is gereserveerd.",
  },
};
