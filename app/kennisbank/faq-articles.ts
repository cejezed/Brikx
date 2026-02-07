export type FaqSection = {
  title: string
  paragraphs: string[]
  bullets?: string[]
}

export type FaqRelatedLink = {
  label: string
  href: string
}

export type FaqArticle = {
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  intro: string
  keyPoints: string[]
  sections: FaqSection[]
  callout: string
  relatedFaqSlugs: string[]
  relatedLinks: FaqRelatedLink[]
}

export const FAQ_ARTICLES: FaqArticle[] = [
  {
    slug: 'wat-zijn-faalkosten-en-hoe-voorkom-ik-ze',
    title: 'Wat zijn faalkosten en hoe voorkom ik ze?',
    metaTitle: 'Faalkosten in de bouw voorkomen | Brikx Kennisbank',
    metaDescription:
      'Faalkosten ontstaan door fouten, miscommunicatie en slechte voorbereiding. Lees waar ze ontstaan en hoe je ze voorkomt.',
    intro:
      'Faalkosten zijn kosten door fouten, miscommunicatie of slechte voorbereiding. In Nederland ligt dit gemiddeld rond 10-15% van de bouwsom. Bij een project van 300.000 EUR is dat 30.000-45.000 EUR aan vermijdbare kosten.',
    keyPoints: [
      'De grootste oorzaak is te late besluitvorming en onduidelijke afspraken.',
      'Fouten in volgorde leiden tot dubbel werk en meerwerk.',
      'Kwaliteitscontrole voorkomt dure herstelacties bij oplevering.',
    ],
    sections: [
      {
        title: 'Waar ontstaan faalkosten?',
        paragraphs: [
          'Faalkosten ontstaan vooral wanneer keuzes te laat worden gemaakt. Een aannemer die stilvalt omdat tegels of keukenkeuzes ontbreken, moet onderaannemers opnieuw plannen. Dat kost tijd en geld.',
          'Ook onduidelijke afspraken zorgen voor discussie en meerwerk. Een offerte met "complete badkamer" zonder specificaties leidt bijna altijd tot bijbetalingen.',
        ],
        bullets: [
          'Te late keuzes: leidingen liggen, maar de keuken is nog niet gekozen.',
          'Onduidelijke afspraken: onduidelijk of tegels en vloerverwarming zijn inbegrepen.',
          'Verkeerde volgorde: isolatie geplaatst voordat installaties zijn aangelegd.',
          'Wijzigingen tijdens de bouw: een late indelingswijziging kost duizenden euro.',
          'Geen kwaliteitscontrole: fouten worden pas bij oplevering ontdekt.',
        ],
      },
      {
        title: 'Hoe voorkom je faalkosten?',
        paragraphs: [
          'Voorkomen begint met een compleet programma van eisen (PvE). Hoe specifieker je bent, hoe minder ruimte voor misverstanden.',
          'Werk met duidelijke deadlines voor materiaalkeuzes. Veel badkamer- en keukenitems moeten 8-10 weken vooraf besteld worden.',
        ],
        bullets: [
          'Maak een volledig PvE met concrete specificaties.',
          'Leg afspraken vast in een bestek met merken, types en formaten.',
          'Plan beslismomenten ruim op tijd.',
          'Gebruik een architect of bouwkundig adviseur voor procesbewaking.',
          'Reserveer realistische stelposten en een buffer.',
        ],
      },
    ],
    callout:
      'Faalkosten zijn geen pech. Het is het gevolg van gebrek aan voorbereiding. Tijd in de voorfase bespaart een veelvoud tijdens de bouw.',
    relatedFaqSlugs: [
      'hoeveel-buffer-moet-ik-aanhouden-voor-onvoorziene-kosten',
      'hoe-weet-ik-of-een-offerte-compleet-is',
      'hoe-maak-ik-een-realistisch-budget-voor-bouwen-of-verbouwen',
    ],
    relatedLinks: [
      { label: 'Checklist Grip op Uitvoering & Meerwerk', href: '/kennisbank/meerwerk' },
      { label: 'Checklist Droomhuis Vormgeven', href: '/kennisbank/stappenplan' },
    ],
  },
  {
    slug: 'hoeveel-buffer-moet-ik-aanhouden-voor-onvoorziene-kosten',
    title: 'Hoeveel buffer moet ik aanhouden voor onvoorziene kosten?',
    metaTitle: 'Buffer voor onvoorziene kosten | Brikx Kennisbank',
    metaDescription:
      'Minimaal 10% buffer nodig, liever 15%. Lees waarom, waar het risico het hoogst is en hoe je dit verwerkt in je budget.',
    intro:
      'Standaardadviezen lopen uiteen, maar in de praktijk heb je minimaal 10% buffer nodig en liever 15%. Bij verbouwingen kan 20% realistisch zijn.',
    keyPoints: [
      'Onvoorzien zit in kleine dingen die optellen, niet alleen in grote gebreken.',
      'Verbouwingen hebben meer risico dan nieuwbouw.',
      'Zonder buffer loop je kans op dure bijleningen of stilstand.',
    ],
    sections: [
      {
        title: 'Waarom is de buffer zo groot?',
        paragraphs: [
          'Onvoorzien is niet alleen rot hout of een tegenvallende vloer. Het zijn ook extra berekeningen, materiaalwijzigingen en prijsstijgingen die samen optellen.',
        ],
        bullets: [
          'Extra constructie- of akoestiekberekeningen: 2.000-5.000 EUR.',
          'Zwakke bodem en diepere fundering: 8.000-15.000 EUR.',
          'Elektra blijkt niet te voldoen: 3.000-8.000 EUR.',
          'Leidingen lopen anders dan gepland: 1.500 EUR of meer.',
          'Tegels of materialen niet leverbaar: 2.000 EUR extra.',
          'Materiaalprijsstijgingen tijdens de bouw: 2-5%.',
        ],
      },
      {
        title: 'Waar zit het risico het hoogst?',
        paragraphs: ['De risicoverdeling hangt sterk af van projecttype en locatie.'],
        bullets: [
          'Verbouwingen: 15% buffer, soms 20%.',
          'Nieuwbouw op lastige grond: 12-15% buffer.',
          'Nieuwbouw op goede grond: 10% buffer is vaak voldoende.',
        ],
      },
      {
        title: 'Wat als je budget te krap is?',
        paragraphs: [
          'Zonder buffer moet je tijdens het project bijlenen. Dat is duur en levert stress op, zeker als banken niet willen meefinancieren.',
          'Beter is om het ontwerp kleiner of eenvoudiger te maken en de buffer te behouden.',
        ],
      },
    ],
    callout:
      'Ontwerp voor 270.000 EUR bij een budget van 300.000 EUR. Een buffer van 30.000 EUR voorkomt dat je halverwege moet stoppen.',
    relatedFaqSlugs: [
      'wat-zijn-verborgen-kosten-waar-mensen-niet-aan-denken',
      'hoe-maak-ik-een-realistisch-budget-voor-bouwen-of-verbouwen',
      'wat-zijn-faalkosten-en-hoe-voorkom-ik-ze',
    ],
    relatedLinks: [
      { label: 'Checklist Waterdicht Projectbudget', href: '/kennisbank/financien' },
      { label: 'Checklist Grip op Uitvoering & Meerwerk', href: '/kennisbank/meerwerk' },
    ],
  },
  {
    slug: 'wat-zijn-verborgen-kosten-waar-mensen-niet-aan-denken',
    title: 'Wat zijn verborgen kosten waar mensen niet aan denken?',
    metaTitle: 'Verborgen kosten bij bouwen of verbouwen | Brikx Kennisbank',
    metaDescription:
      'Veel mensen vergeten 15-20% bijkomende kosten. Bekijk de complete lijst met leges, aansluitingen, onderzoeken en afwerking.',
    intro:
      'Veel mensen rekenen alleen met grondprijs en bouwkosten, maar vergeten 15-20% aan bijkomende kosten. Hieronder staat de complete lijst.',
    keyPoints: [
      'Leges, kwaliteitsborger en onderzoeken vormen een groot deel van de verborgen kosten.',
      'Aansluitingen, bouwplaats en terrein worden vaak onderschat.',
      'Ook na oplevering lopen kosten door: tuin, oprit, zonwering en apparatuur.',
    ],
    sections: [
      {
        title: 'Gemeentelijke en verplichte kosten',
        paragraphs: [
          'Gemeenten rekenen leges als percentage van de bouwsom. Daarnaast kan een kwaliteitsborger verplicht zijn bij nieuwbouw.',
        ],
        bullets: [
          'Leges bouwvergunning: 2-4% van de bouwsom.',
          'Kwaliteitsborger: 8.000-15.000 EUR.',
          'Aansluitbijdrage riolering: 3.000-8.000 EUR.',
        ],
      },
      {
        title: 'Onderzoeken en locatiekosten',
        paragraphs: [
          'Afhankelijk van locatie en bestaand gebruik kunnen onderzoeken verplicht zijn.',
        ],
        bullets: [
          'Bodemonderzoek: 800-2.500 EUR.',
          'PFAS-onderzoek: 2.500-8.000 EUR.',
          'Asbestonderzoek (bij sloop): 500-1.500 EUR.',
          'Akoestisch onderzoek: 1.500-3.000 EUR.',
          'Archeologisch onderzoek: 5.000-25.000 EUR.',
        ],
      },
      {
        title: 'Aansluitingen, terrein en afwerking',
        paragraphs: [
          'Aansluitkosten, bouwplaatsinrichting en de uiteindelijke afwerking worden vaak vergeten.',
        ],
        bullets: [
          'Elektra: 2.000-5.000 EUR.',
          'Water: 1.000-3.000 EUR.',
          'Glasvezel: 500-1.500 EUR.',
          'Bouwplaatsinrichting: 3.000-8.000 EUR.',
          'Tuin en oprit: 8.000-35.000 EUR.',
          'Gordijnen en zonwering: 3.000-10.000 EUR.',
        ],
      },
    ],
    callout:
      'Bij nieuwbouw van 300.000 EUR kunnen bijkomende kosten oplopen tot 80.000-90.000 EUR. Dat is vaak 25-30% bovenop de bouwsom.',
    relatedFaqSlugs: [
      'hoe-maak-ik-een-realistisch-budget-voor-bouwen-of-verbouwen',
      'hoeveel-buffer-moet-ik-aanhouden-voor-onvoorziene-kosten',
      'hoe-weet-ik-of-een-offerte-compleet-is',
    ],
    relatedLinks: [
      { label: 'Checklist Waterdicht Projectbudget', href: '/kennisbank/financien' },
      { label: 'Checklist Bouwkavel & Locatie Analyse', href: '/kennisbank/locatie' },
    ],
  },
  {
    slug: 'hoe-maak-ik-een-realistisch-budget-voor-bouwen-of-verbouwen',
    title: 'Hoe maak ik een realistisch budget voor bouwen of verbouwen?',
    metaTitle: 'Realistisch bouwbudget maken | Brikx Kennisbank',
    metaDescription:
      'Een realistisch budget betekent alle kosten in beeld, geen wishful thinking en voldoende buffer voor onvoorzien.',
    intro:
      'Een realistisch budget betekent: alle kosten in beeld, geen wishful thinking en voldoende buffer voor onvoorzien.',
    keyPoints: [
      'Start altijd met je echte leencapaciteit en eigen middelen.',
      'Trek verplichte kosten af voordat je bouwbudget bepaalt.',
      'Reserveer minimaal 10% buffer, liever 15%.',
    ],
    sections: [
      {
        title: 'Stap 1 en 2: beschikbaar budget en verplichte kosten',
        paragraphs: [
          'Begin met je totale beschikbare budget: eigen geld, hypotheek en eventuele schenking.',
          'Trek vervolgens alle verplichte kosten af, zoals grond, notaris, architect, leges en aansluitingen.',
        ],
      },
      {
        title: 'Stap 3 en 4: buffer en bouwbudget',
        paragraphs: [
          'Reserveer minimaal 10% buffer van de bouwsom. Bij verbouwingen liever 15%.',
          'Het bedrag dat overblijft is je echte bouwbudget.',
        ],
        bullets: [
          'Voorbeeld: 500.000 EUR totaal budget.',
          'Grond 180.000 EUR, leges 9.000 EUR, architect 21.000 EUR.',
          'Buffer 30.000 EUR.',
          'Overblijvend bouwbudget: 234.500 EUR.',
        ],
      },
      {
        title: 'Stap 5: check realisme',
        paragraphs: [
          'Als je m2-prijs niet past bij je ambities, moet je bijsturen. Kleiner bouwen, eenvoudiger afwerken of extra eigen middelen toevoegen.',
        ],
      },
    ],
    callout:
      'De echte fout is rekenen zonder buffer. Dat leidt tot stress, bijleningen of een onafgemaakt project.',
    relatedFaqSlugs: [
      'hoeveel-buffer-moet-ik-aanhouden-voor-onvoorziene-kosten',
      'wat-zijn-verborgen-kosten-waar-mensen-niet-aan-denken',
      'wat-zijn-faalkosten-en-hoe-voorkom-ik-ze',
    ],
    relatedLinks: [
      { label: 'Checklist Waterdicht Projectbudget', href: '/kennisbank/financien' },
      { label: 'Checklist Droomhuis Vormgeven', href: '/kennisbank/stappenplan' },
    ],
  },
  {
    slug: 'wanneer-heb-ik-een-architect-nodig-en-wanneer-niet',
    title: 'Wanneer heb ik een architect nodig en wanneer niet?',
    metaTitle: 'Architect nodig? Wanneer wel en niet | Brikx Kennisbank',
    metaDescription:
      'Nieuwbouw en grote verbouwingen vragen om een architect. Lees wanneer dit essentieel is en welke alternatieven er zijn.',
    intro:
      'Of je een architect nodig hebt hangt af van complexiteit, risico en je eigen kennis. Juridisch mag je zonder architect bouwen, maar praktisch zijn de risico\'s vaak groot.',
    keyPoints: [
      'Nieuwbouw en grote verbouwingen vragen om een architect.',
      'Bij vergunningstrajecten helpt een architect met regels en kwaliteit.',
      'Alternatieven zijn een tekenaar of bouwkundig adviseur.',
    ],
    sections: [
      {
        title: 'Wanneer is een architect essentieel?',
        paragraphs: [
          'Bij nieuwbouw is samenhang tussen ontwerp, constructie, installaties en regelgeving cruciaal. Dat vraagt expertise.',
          'Ook grote verbouwingen met constructieve ingrepen zijn risicovol zonder architect.',
        ],
        bullets: [
          'Nieuwbouwprojecten.',
          'Grote verbouwingen boven 100.000 EUR.',
          'Complexe locaties zoals monumenten of beschermde gebieden.',
          'Vergunningsplichtige projecten met strenge eisen.',
        ],
      },
      {
        title: 'Wanneer kun je zonder?',
        paragraphs: [
          'Kleine aanpassingen zonder vergunning of standaard nieuwbouwopties zijn vaak prima zonder architect.',
        ],
        bullets: [
          'Kleine verbouwing zonder vergunning.',
          'Standaard uitvoering van een projectontwikkelaar.',
        ],
      },
      {
        title: 'Alternatieven tussen alles en niets',
        paragraphs: [
          'Je kunt ook kiezen voor een architect alleen voor het ontwerp, of voor een bouwkundig adviseur die de kwaliteit bewaakt.',
        ],
        bullets: [
          'Architect voor ontwerp: 3-4% van de bouwsom.',
          'Bouwkundig adviseur: 3-4% voor controle tijdens de bouw.',
          'Tekenaar: 2.000-8.000 EUR voor tekenwerk zonder advies.',
        ],
      },
    ],
    callout:
      'De besparing van 7% architect weegt zelden op tegen 10-15% faalkosten door fouten en miscommunicatie.',
    relatedFaqSlugs: [
      'wat-zijn-faalkosten-en-hoe-voorkom-ik-ze',
      'hoe-weet-ik-of-een-offerte-compleet-is',
      'hoe-maak-ik-een-realistisch-budget-voor-bouwen-of-verbouwen',
    ],
    relatedLinks: [
      { label: 'Checklist Droomhuis Vormgeven', href: '/kennisbank/stappenplan' },
      { label: 'Checklist Grip op Uitvoering & Meerwerk', href: '/kennisbank/meerwerk' },
    ],
  },
  {
    slug: 'hoe-weet-ik-of-een-offerte-compleet-is',
    title: 'Hoe weet ik of een offerte compleet is?',
    metaTitle: 'Offerte controleren bij bouw of verbouw | Brikx Kennisbank',
    metaDescription:
      'Een incomplete offerte lijkt goedkoop maar wordt duur door meerwerk. Leer hoe je een offerte checkt op details en stelposten.',
    intro:
      'Een incomplete offerte is de grootste valkuil bij bouwen. Het lijkt goedkoop, maar tijdens de bouw blijkt dat de helft niet is meegenomen.',
    keyPoints: [
      'Detailniveau is alles: merken, types, maten en uitvoering.',
      'Stelposten moeten realistisch zijn en toegelicht.',
      'In- en exclusies en een duidelijke planning voorkomen discussie.',
    ],
    sections: [
      {
        title: 'Signalen van een slechte offerte',
        paragraphs: [
          'Vage omschrijvingen zoals "complete badkamer" of "standaard tegels" leiden tot discussie en meerwerk.',
        ],
        bullets: [
          'Te weinig detail of geen materiaalkeuze.',
          'Lage stelposten zonder onderbouwing.',
          'Onduidelijke posten zoals "bouwkundige werkzaamheden".',
          'Geen planning of betalingsschema.',
        ],
      },
      {
        title: 'Wat moet er minimaal in staan?',
        paragraphs: [
          'Een goede offerte splitst per ruimte of bouwdeel en specificeert materialen en werkzaamheden.',
        ],
        bullets: [
          'Specificaties: merken, types, formaten en kleuren.',
          'Duidelijke in- en exclusies.',
          'Stelposten met onderbouwing.',
          'Betalingsschema en planning.',
          'Garanties en oplevercriteria.',
        ],
      },
      {
        title: 'Vergelijk niet alleen het totaalbedrag',
        paragraphs: [
          'De goedkoopste offerte is vaak onvolledig. Het verschil komt later als meerwerk terug.',
        ],
      },
    ],
    callout:
      'Laat een offerte desnoods controleren door een onafhankelijk adviseur. Dat kost 500-1.500 EUR en bespaart vaak duizenden.',
    relatedFaqSlugs: [
      'wat-zijn-faalkosten-en-hoe-voorkom-ik-ze',
      'wat-zijn-verborgen-kosten-waar-mensen-niet-aan-denken',
      'hoeveel-buffer-moet-ik-aanhouden-voor-onvoorziene-kosten',
    ],
    relatedLinks: [
      { label: 'Checklist Grip op Uitvoering & Meerwerk', href: '/kennisbank/meerwerk' },
      { label: 'Checklist Waterdicht Projectbudget', href: '/kennisbank/financien' },
    ],
  },
]

export const FAQ_ARTICLE_MAP = new Map(FAQ_ARTICLES.map((article) => [article.slug, article]))
