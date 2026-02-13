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
    title: 'Faalkosten voorkomen in de praktijk',
    metaTitle: 'Faalkosten in de bouw voorkomen | Brikx Kennisbank',
    metaDescription:
      'Faalkosten ontstaan door fouten, miscommunicatie en slechte voorbereiding. Lees waar ze ontstaan en hoe je ze voorkomt.',
    intro:
      'Faalkosten zijn vermijdbare extra kosten tijdens bouwen door fouten, miscommunicatie of te late keuzes. In de sector wordt vaak gesproken over 10-15% van het bouwbudget. Bij een project van 300.000 EUR gaat het dan al snel om 30.000-45.000 EUR aan vermijdbare kosten.',
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
    title: 'Buffer voor onvoorziene kosten bepalen',
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
    title: 'Verborgen kosten die budgetten onder druk zetten',
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
    title: 'Een realistisch bouw- of verbouwbudget opzetten',
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
    title: 'Architect inschakelen: wanneer wel en wanneer niet',
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
      'Een lagere adviespost lijkt aantrekkelijk, maar weegt in de praktijk zelden op tegen de kosten van fouten, vertraging en meerwerk.',
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
    title: 'Een offerte op volledigheid controleren',
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
  {
    slug: 'wat-is-meerwerk-en-hoe-voorkom-je-discussies',
    title: 'Meerwerk beheersen zonder discussies',
    metaTitle: 'Meerwerk in de bouw: conflicten voorkomen | Brikx Kennisbank',
    metaDescription:
      'Meerwerk is een van de grootste bronnen van conflict. Lees hoe je afspraken vooraf vastlegt en discussies tijdens de bouw voorkomt.',
    intro:
      'Meerwerk is werk dat niet in de oorspronkelijke offerte stond en tijdens de bouw wordt toegevoegd - gevraagd of onvoorzien. Het is een van de grootste bronnen van conflict tussen opdrachtgever en aannemer, vooral als afspraken vooraf onduidelijk zijn.',
    keyPoints: [
      'Niet elk meerwerk is hetzelfde: keuze, onduidelijkheid, onvoorzien of foutherstel.',
      'De meeste discussies ontstaan door mondelinge afspraken en vage offertes.',
      'Met een vaste meerwerkprocedure houd je grip op budget en planning.',
    ],
    sections: [
      {
        title: 'Waarom ontstaat meerwerk?',
        paragraphs: [
          'Meerwerk ontstaat meestal in vier situaties. Type 1 is een bewuste wijziging van jou tijdens de bouw, zoals extra stopcontacten of andere tegels. Type 2 is onduidelijkheid in de offerte, bijvoorbeeld bij termen als "complete badkamer" zonder specificaties.',
          'Type 3 gaat over onvoorziene omstandigheden zoals verborgen gebreken in bestaande bouw. Type 4 is foutherstel door de aannemer. Dat laatste is geen meerwerk en hoort niet als extra post te worden gefactureerd.',
        ],
        bullets: [
          'Type 1: wijziging op verzoek van opdrachtgever.',
          'Type 2: verschil in interpretatie van de offerte.',
          'Type 3: technische tegenvaller die vooraf niet zichtbaar was.',
          'Type 4: herstel van een uitvoeringsfout (geen terecht meerwerk).',
        ],
      },
      {
        title: 'Hoe voorkom je discussies over meerwerk?',
        paragraphs: [
          'Voorkomen begint met een compleet bestek en een heldere contractafspraak. Laat meerwerk altijd vooraf schriftelijk melden met prijs en impact op planning. Zonder akkoord geen uitvoering.',
          'Werk bij grotere projecten met een wekelijkse meerwerklijst. Zo zie je vroeg welke posten oplopen en voorkom je een onverwachte eindafrekening.',
        ],
        bullets: [
          'Specificeer offertes op merk, type, aantallen en uitvoering.',
          'Leg vast: meerwerk alleen na schriftelijke goedkeuring.',
          'Accepteer geen mondelinge "doen we wel even" beslissingen.',
          'Vraag per meerwerkpost een losse specificatie.',
          'Laat bij twijfel een architect of adviseur toetsen.',
        ],
      },
      {
        title: 'Wat doe je als het toch misgaat?',
        paragraphs: [
          'Komt er achteraf een grote meerwerkclaim zonder voorafgaande melding, controleer dan eerst de contractafspraak. Staat daarin dat meerwerk vooraf moet worden gemeld, dan is de claim vaak niet automatisch afdwingbaar.',
          'Vraag altijd een onderbouwing per post en betaal niet onder tijdsdruk. Laat bij twijfel een onafhankelijk expert meekijken.',
        ],
      },
    ],
    callout:
      'Een beetje meerwerk is normaal, vooral bij verbouw. Maar 20-30% extra is meestal een signaal van slechte voorbereiding of een te laag ingestoken offerte.',
    relatedFaqSlugs: [
      'hoe-weet-ik-of-een-offerte-compleet-is',
      'wat-zijn-faalkosten-en-hoe-voorkom-ik-ze',
      'hoeveel-buffer-moet-ik-aanhouden-voor-onvoorziene-kosten',
    ],
    relatedLinks: [
      { label: 'Checklist Grip op Uitvoering & Meerwerk', href: '/kennisbank/meerwerk' },
      { label: 'Checklist Waterdicht Projectbudget', href: '/kennisbank/financien' },
    ],
  },
  {
    slug: 'hoe-kies-je-een-betrouwbare-aannemer',
    title: 'Een betrouwbare aannemer selecteren',
    metaTitle: 'Betrouwbare aannemer kiezen zonder gedoe | Brikx Kennisbank',
    metaDescription:
      'Een aannemer kies je niet op laagste prijs. Lees waar je op let bij referenties, contracten, verzekeringen en offertevergelijking.',
    intro:
      'Een aannemer kiezen op laagste prijs lijkt logisch, maar geeft vaak de grootste risico\'s op vertraging, meerwerk en conflicten. Betrouwbaarheid, specialisatie en duidelijke communicatie zijn meestal belangrijker dan een prijsverschil op papier.',
    keyPoints: [
      'Vraag altijd meerdere offertes op basis van dezelfde scope.',
      'Controleer referenties, verzekeringen en projectervaring.',
      'Een goede aannemer communiceert duidelijk voordat het werk start.',
    ],
    sections: [
      {
        title: 'Waar let je op bij selectie?',
        paragraphs: [
          'Vraag om recente referenties en bel deze actief na. Vraag naar planning, communicatie, meerwerk en eindkwaliteit. Alleen foto\'s zeggen weinig over hoe een project echt is verlopen.',
          'Kies ook op specialisatie. Een partij die sterk is in nieuwbouw is niet automatisch sterk in complexe verbouwingen of monumenten.',
        ],
        bullets: [
          'Controleer recente projecten die lijken op jouw opdracht.',
          'Check KvK-inschrijving en bedrijfscontinuiteit.',
          'Vraag bewijs van CAR- en AVB-verzekering.',
          'Vergelijk offertes op inhoud, niet alleen op totaalprijs.',
        ],
      },
      {
        title: 'Rode vlaggen die je serieus moet nemen',
        paragraphs: [
          'Rode vlaggen zijn vaak al zichtbaar in het offertetraject. Een aannemer die pusht op snelheid of vaag blijft over scope, doet dat meestal later in de uitvoering ook.',
        ],
        bullets: [
          'Groot voorschot zonder duidelijke tegenprestatie.',
          'Geen recente referenties of ontwijkende antwoorden.',
          'Offerte veel lager dan markt zonder heldere uitleg.',
          'Geen duidelijke contractvoorwaarden of planning.',
        ],
      },
      {
        title: 'Praktische aanpak in 3 stappen',
        paragraphs: [
          'Vraag minimaal drie vergelijkbare offertes op hetzelfde PvE en vergelijk ze op scope, voorwaarden en communicatie. Loop waar mogelijk een lopend project van de aannemer na.',
          'Leg afspraken altijd vast in een schriftelijk contract met duidelijke meerwerkprocedure, planning en oplevercriteria.',
        ],
      },
    ],
    callout:
      'De meeste bouwconflicten ontstaan niet op de bouwplaats, maar in de selectiefase. Een scherpe keuze vooraf voorkomt veel gedoe later.',
    relatedFaqSlugs: [
      'hoe-weet-ik-of-een-offerte-compleet-is',
      'wat-is-meerwerk-en-hoe-voorkom-je-discussies',
      'wat-zijn-faalkosten-en-hoe-voorkom-ik-ze',
    ],
    relatedLinks: [
      { label: 'Checklist Grip op Uitvoering & Meerwerk', href: '/kennisbank/meerwerk' },
      { label: 'Checklist Droomhuis Vormgeven', href: '/kennisbank/stappenplan' },
    ],
  },
  {
    slug: 'wat-is-een-programma-van-eisen-en-waarom-is-het-belangrijk',
    title: 'Werken met een helder Programma van Eisen (PvE)',
    metaTitle: 'Programma van Eisen (PvE) maken | Brikx Kennisbank',
    metaDescription:
      'Een goed Programma van Eisen voorkomt misverstanden en dure wijzigingen. Lees wat erin moet en hoe je ermee betere offertes krijgt.',
    intro:
      'Een Programma van Eisen (PvE) is een document waarin je beschrijft wat je wil bouwen of verbouwen - je wensen, eisen en randvoorwaarden op papier. Zonder PvE werken architect en aannemer vaak op aannames, met hogere kans op wijzigingen en kostenstress.',
    keyPoints: [
      'Een PvE maakt verwachtingen expliciet voor ontwerp, budget en planning.',
      'Het helpt om offertes echt vergelijkbaar te maken.',
      'Must-haves en nice-to-haves voorkomen twijfel tijdens uitvoering.',
    ],
    sections: [
      {
        title: 'Wat staat er in een goed PvE?',
        paragraphs: [
          'Een goed PvE bevat functionele eisen, ruimtelijke voorkeuren, technische wensen, stijl, budgetgrenzen, planning en prioriteiten. Dat geeft houvast voor iedereen die met jouw project werkt.',
          'Gebruik altijd een duidelijke scheiding tussen must-have en nice-to-have. Bij budgetdruk kun je dan bijsturen zonder de kern van je plan kwijt te raken.',
        ],
        bullets: [
          'Functioneel: ruimtes, oppervlaktes, gebruik per ruimte.',
          'Technisch: installaties, duurzaamheid, comfortniveau.',
          'Financieel: totaalbudget en prioriteiten.',
          'Proces: planning en beslismomenten.',
        ],
      },
      {
        title: 'Waarom helpt dit in de praktijk?',
        paragraphs: [
          'Voor de architect geeft een PvE richting aan het ontwerp. Voor de aannemer geeft het een duidelijk kader voor een complete offerte. Voor jou geeft het rust, omdat keuzes vooraf worden gemaakt in plaats van onder druk tijdens de bouw.',
          'Wie vroeg investeert in een goed PvE voorkomt vaak duur meerwerk en miscommunicatie in latere fases.',
        ],
      },
      {
        title: 'Hoe begin je ermee?',
        paragraphs: [
          'Start met je grootste frustraties in de huidige situatie en vertaal die naar concrete eisen. Werk daarna je leefpatronen, budgetgrenzen en prioriteiten uit.',
          'Gebruik een checklist of wizard zodat je geen belangrijke onderdelen overslaat.',
        ],
      },
    ],
    callout:
      'Een PvE is geen papierwerk voor erbij. Het is het stuurdocument dat bepaalt of ontwerp, offerte en uitvoering op elkaar aansluiten.',
    relatedFaqSlugs: [
      'hoe-maak-ik-een-realistisch-budget-voor-bouwen-of-verbouwen',
      'wat-is-meerwerk-en-hoe-voorkom-je-discussies',
      'hoe-kies-je-een-betrouwbare-aannemer',
    ],
    relatedLinks: [
      { label: 'Checklist Droomhuis Vormgeven', href: '/kennisbank/stappenplan' },
      { label: 'Start direct met de wizard', href: '/wizard' },
    ],
  },
  {
    slug: 'waarom-lopen-bouwprojecten-uit-en-hoe-voorkom-je-dat',
    title: 'Bouwvertraging voorkomen met realistische planning',
    metaTitle: 'Bouwproject loopt uit: oorzaken en aanpak | Brikx Kennisbank',
    metaDescription:
      'Waarom lopen bouwprojecten uit? Lees de belangrijkste oorzaken en hoe je met voorbereiding, planning en overleg vertraging beperkt.',
    intro:
      'Vertraging in bouwprojecten is frustrerend en kost geld. Toch is een groot deel van de uitloop te beperken met betere voorbereiding, realistische planning en tijdige keuzes. De grootste fouten ontstaan meestal al voor de eerste dag op de bouwplaats.',
    keyPoints: [
      'Te late keuzes en leveringsproblemen zijn de meest voorkomende oorzaken.',
      'Onvolledige tekeningen en wijzigingen tijdens uitvoering kosten veel tijd.',
      'Een realistische planning bevat altijd buffer.',
    ],
    sections: [
      {
        title: 'Waarom loopt planning vaak uit?',
        paragraphs: [
          'Uitloop ontstaat zelden door een oorzaak. Meestal stapelen meerdere kleine vertragingen zich op: late materiaalkeuzes, langere levertijden, onduidelijke tekeningen of onverwachte technische issues.',
          'Ook vergunningstrajecten en personele uitval kunnen impact hebben. Wie hier vooraf geen ruimte voor plant, komt vrijwel altijd in tijdsdruk terecht.',
        ],
        bullets: [
          'Late keuzes voor keuken, tegels of installaties.',
          'Lange levertijden van maatwerkmaterialen.',
          'Wijzigingen tijdens uitvoering.',
          'Onvolledige of tegenstrijdige tekeningen.',
          'Vertraging in vergunning of onderaannemersplanning.',
        ],
      },
      {
        title: 'Hoe voorkom je onnodige vertraging?',
        paragraphs: [
          'Werk met een keuzetijdlijn per fase, bestel kritieke onderdelen vroeg en houd een realistische buffer aan. Wekelijks overleg helpt om kleine afwijkingen direct op te lossen voordat ze uitgroeien tot weken vertraging.',
          'Zorg daarnaast dat ontwerp, begroting en uitvoeringstekeningen op elkaar zijn afgestemd voordat de uitvoering start.',
        ],
        bullets: [
          'Maak vooraf een complete voorbereidingsset (PvE, ontwerp, budget).',
          'Plan met minimaal 15-20% tijdsbuffer.',
          'Werk met vaste besluitmomenten per bouwfase.',
          'Leg alternatieven vast voor kritieke materialen.',
        ],
      },
      {
        title: 'Wat als je project toch uitloopt?',
        paragraphs: [
          'Controleer contractafspraken over planning en voortgang. Blijf in gesprek over oorzaak, herstelplan en nieuwe mijlpalen. Niet elke vertraging is verwijtbaar, maar structurele uitval zonder plan vraagt om duidelijke sturing.',
          'Escaleren is pas laatste stap. In de praktijk levert vroeg ingrijpen met transparante voortgangsafspraken meestal het beste resultaat op.',
        ],
      },
    ],
    callout:
      'Projecten lopen het vaakst uit door optimistische planning. Realisme in de voorbereiding is de goedkoopste vorm van tijdswinst.',
    relatedFaqSlugs: [
      'wat-is-een-programma-van-eisen-en-waarom-is-het-belangrijk',
      'wat-is-meerwerk-en-hoe-voorkom-je-discussies',
      'hoe-maak-ik-een-realistisch-budget-voor-bouwen-of-verbouwen',
    ],
    relatedLinks: [
      { label: 'Checklist Droomhuis Vormgeven', href: '/kennisbank/stappenplan' },
      { label: 'Checklist Grip op Uitvoering & Meerwerk', href: '/kennisbank/meerwerk' },
    ],
  },
  {
    slug: 'wanneer-moet-je-welke-keuzes-maken-tijdens-het-bouwproces',
    title: 'Keuzes op het juiste moment in het bouwproces',
    metaTitle: 'Wanneer welke keuzes maken tijdens de bouw? | Brikx Kennisbank',
    metaDescription:
      'Te late keuzes veroorzaken vertraging en meerkosten. Bekijk per fase welke beslissingen je wanneer moet nemen.',
    intro:
      'Timing van keuzes is cruciaal in elk bouwproject. Te laat kiezen veroorzaakt stilstand, herplanning en meerwerk. Met een duidelijke keuzetijdlijn per fase houd je grip op planning en budget.',
    keyPoints: [
      'Grote keuzes horen in schets- en voorlopig ontwerp, niet tijdens uitvoering.',
      'Keuken, sanitair en elektra moeten ruim voor start bouw vastliggen.',
      'Kleine afwerkingskeuzes kunnen later, maar met vaste deadlines.',
    ],
    sections: [
      {
        title: 'Welke keuzes horen in welke fase?',
        paragraphs: [
          'In de eerste fases maak je structurele keuzes: indeling, massa, constructie en installatiestrategie. In de uitvoeringsvoorbereiding kies je concrete producten met levertijd, zoals keuken, sanitair en vloeren.',
          'Tijdens de bouw wil je vooral nog detailkeuzes maken. Als je dan nog basisbeslissingen moet nemen, schuift de planning vrijwel altijd op.',
        ],
        bullets: [
          'Schetsontwerp: indeling, volume, dakvorm, globale stijl.',
          'Voorlopig ontwerp: maatvoering, ramen/deuren, constructie, basistechniek.',
          'Definitief ontwerp: materialisatie buitenzijde en vergunningskeuzes.',
          'Uitvoeringsvoorbereiding: keuken, sanitair, elektra, vloeren, verlichting.',
        ],
      },
      {
        title: 'Hoe voorkom je dat keuzes te laat komen?',
        paragraphs: [
          'Werk met een keuzelijst met harde deadlines per onderdeel. Plan showroombezoeken vroeg, maar leg definitieve bestellingen pas vast zodra planning en specificaties kloppen.',
        ],
        bullets: [
          'Vraag een keuzeplanning met weeknummers.',
          'Check levertijden voordat je akkoord geeft.',
          'Stel interne beslisdeadlines in (niet wachten tot laatste moment).',
          'Leg gekozen opties direct schriftelijk vast.',
        ],
      },
    ],
    callout:
      'De meeste planningstress ontstaat niet op de bouwplaats, maar door keuzes die te laat worden gemaakt.',
    relatedFaqSlugs: [
      'waarom-lopen-bouwprojecten-uit-en-hoe-voorkom-je-dat',
      'hoe-maak-ik-een-realistisch-budget-voor-bouwen-of-verbouwen',
      'wat-is-een-programma-van-eisen-en-waarom-is-het-belangrijk',
    ],
    relatedLinks: [
      { label: 'Checklist Droomhuis Vormgeven', href: '/kennisbank/stappenplan' },
      { label: 'Checklist Grip op Uitvoering & Meerwerk', href: '/kennisbank/meerwerk' },
    ],
  },
  {
    slug: 'hoe-blijf-je-binnen-budget-tijdens-de-bouw',
    title: 'Binnen budget blijven tijdens de bouw',
    metaTitle: 'Budget bewaken tijdens de bouw | Brikx Kennisbank',
    metaDescription:
      'Budgetoverschrijding ontstaat vaak door kleine keuzes. Leer hoe je scope, wijzigingen en buffer onder controle houdt.',
    intro:
      'Binnen budget blijven vraagt actieve sturing. Overschrijding ontstaat meestal door veel kleine wijzigingen, kwaliteitsupsells en onderschatte tegenvallers. Met duidelijke keuzes en budgetdiscipline blijft je project beheersbaar.',
    keyPoints: [
      'Het totaalbudget is leidend, niet alleen de aanneemsom.',
      'Wijzigingen moeten zichtbaar en toetsbaar blijven.',
      'Buffer is voor onvoorzien, niet voor extra luxe.',
    ],
    sections: [
      {
        title: 'Waarom gaat budget vaak mis?',
        paragraphs: [
          'Scope creep is de grootste oorzaak: steeds kleine extra\'s die samen groot worden. Daarnaast komen onvoorziene technische posten en prijsstijgingen vaak bovenop een al krap plan.',
        ],
        bullets: [
          'Veel kleine upgrades tijdens showroomkeuzes.',
          'Onvoorziene technische tegenvallers in uitvoering.',
          'Prijswijzigingen tussen offerte en uitvoering.',
          'Geen actueel overzicht van meerwerk en totaalsom.',
        ],
      },
      {
        title: 'Hoe houd je grip op het budget?',
        paragraphs: [
          'Werk met een wijzigingslijst en bespreek die wekelijks. Spreek af dat grotere wijzigingen pas doorgaan na expliciet akkoord. Koppel elke toevoeging aan een bewuste besparing elders als het budget onder druk staat.',
        ],
        bullets: [
          'Maak vooraf verschil tussen must-have en nice-to-have.',
          'Leg een goedkeuringsgrens vast voor wijzigingen.',
          'Reserveer minimaal 10-15% buffer voor onvoorzien.',
          'Laat architect/adviseur meelezen op gevolgen van keuzes.',
        ],
      },
    ],
    callout:
      'Budgetbewaking is geen eenmalige berekening, maar een ritme van keuzes, controle en bijsturen.',
    relatedFaqSlugs: [
      'hoeveel-buffer-moet-ik-aanhouden-voor-onvoorziene-kosten',
      'wat-zijn-verborgen-kosten-waar-mensen-niet-aan-denken',
      'wat-is-meerwerk-en-hoe-voorkom-je-discussies',
    ],
    relatedLinks: [
      { label: 'Checklist Waterdicht Projectbudget', href: '/kennisbank/financien' },
      { label: 'Start direct met de wizard', href: '/wizard' },
    ],
  },
  {
    slug: 'wat-zijn-de-grootste-fouten-bij-bouwen-of-verbouwen',
    title: 'De grootste fouten bij bouwen of verbouwen',
    metaTitle: 'Grootste bouwfouten en hoe je ze voorkomt | Brikx Kennisbank',
    metaDescription:
      'Van te weinig voorbereiding tot slechte offertecontrole: dit zijn de fouten die projecten vertragen en duur maken.',
    intro:
      'De grootste bouwfouten zijn zelden technisch ingewikkeld. Ze ontstaan meestal door te weinig voorbereiding, onduidelijke prioriteiten en gebrek aan controle tijdens uitvoering. Het goede nieuws: deze fouten zijn grotendeels te voorkomen.',
    keyPoints: [
      'Haast in de voorbereiding veroorzaakt vertraging in uitvoering.',
      'Geen buffer of prioriteitenlijst maakt elk project kwetsbaar.',
      'Mondelinge afspraken en te weinig toezicht leiden tot discussies.',
    ],
    sections: [
      {
        title: 'Welke fouten doen het meeste pijn?',
        paragraphs: [
          'Veel projecten lopen vast op dezelfde patronen: te laat keuzes maken, besparen op verkeerde onderdelen, een offerte vertrouwen en te weinig kwaliteitscontrole op de bouwplaats.',
        ],
        bullets: [
          'Te weinig tijd voor ontwerp en voorbereiding.',
          'Geen realistische buffer in budget.',
          'Te late materiaalkeuzes met lange levertijd.',
          'Geen wekelijkse controle op voortgang en kwaliteit.',
          'Alles willen zonder prioriteiten te stellen.',
        ],
      },
      {
        title: 'Hoe voorkom je deze fouten?',
        paragraphs: [
          'Werk met een heldere faseaanpak: eerst PvE en budget, dan ontwerp, dan uitvoering. Combineer dit met een vaste overlegstructuur en schriftelijke besluitvorming.',
        ],
        bullets: [
          'Plan 3-4 maanden voorbereiding voor complexe projecten.',
          'Vraag minimaal drie vergelijkbare offertes.',
          'Leg keuzes en wijzigingen altijd schriftelijk vast.',
          'Gebruik een adviseur als kwaliteits- en procesbewaker.',
        ],
      },
    ],
    callout:
      'De duurste fout is denken dat voorbereiding tijd kost. In de praktijk bespaart goede voorbereiding juist tijd, geld en stress.',
    relatedFaqSlugs: [
      'wanneer-moet-je-welke-keuzes-maken-tijdens-het-bouwproces',
      'hoe-kies-je-een-betrouwbare-aannemer',
      'wat-zijn-faalkosten-en-hoe-voorkom-ik-ze',
    ],
    relatedLinks: [
      { label: 'Checklist Droomhuis Vormgeven', href: '/kennisbank/stappenplan' },
      { label: 'Checklist Grip op Uitvoering & Meerwerk', href: '/kennisbank/meerwerk' },
    ],
  },
  {
    slug: 'hoe-werkt-de-samenwerking-tussen-architect-en-aannemer',
    title: 'Samenwerking tussen architect en aannemer',
    metaTitle: 'Architect en aannemer: zo werkt de samenwerking | Brikx Kennisbank',
    metaDescription:
      'Ontdek de verschillen tussen traditioneel, bouwteam en design & build en wat dit betekent voor kwaliteit, budget en controle.',
    intro:
      'Architect en aannemer kunnen op verschillende manieren samenwerken. Het gekozen model bepaalt hoeveel grip je hebt op kwaliteit, budget en belangen. Een bewuste keuze vooraf voorkomt veel ruis tijdens uitvoering.',
    keyPoints: [
      'Traditioneel model geeft duidelijke scheiding van rollen.',
      'Bouwteam geeft vroege uitvoeringsinput, maar minder prijscompetitie.',
      'Design & build kan snel zijn, maar vraagt extra aandacht voor onafhankelijkheid.',
    ],
    sections: [
      {
        title: 'Welke samenwerkingsmodellen zijn er?',
        paragraphs: [
          'In het traditionele model ontwerpt de architect en bouwt de aannemer op basis van een uitgevraagd plan. In bouwteam werken architect en aannemer al vroeg samen. Bij design & build ligt ontwerp en uitvoering in één hand.',
        ],
        bullets: [
          'Traditioneel: meer controle op kwaliteit en scope.',
          'Bouwteam: vroegere kostentoets en uitvoerbaarheid.',
          'Design & build: snelle lijn, maar minder onafhankelijke tegenkracht.',
        ],
      },
      {
        title: 'Hoe houd je samenwerking gezond?',
        paragraphs: [
          'Werk met vaste bouwoverleggen, heldere verslaglegging en duidelijke escalatieroutes bij verschil van inzicht. Bespreek keuzes vooraf en voorkom dat discussies pas achteraf ontstaan.',
        ],
        bullets: [
          'Leg rollen en beslisbevoegdheden vooraf vast.',
          'Plan periodieke voortgangs- en kwaliteitsrondes.',
          'Documenteer alle wijzigingen en afspraken schriftelijk.',
          'Schakel bij technische discussie tijdig een onafhankelijke expert in.',
        ],
      },
    ],
    callout:
      'Goede samenwerking is geen toeval. Het is het resultaat van duidelijke rollen, vaste communicatie en transparante afspraken.',
    relatedFaqSlugs: [
      'hoe-kies-je-een-betrouwbare-aannemer',
      'wat-is-meerwerk-en-hoe-voorkom-je-discussies',
      'hoe-weet-ik-of-een-offerte-compleet-is',
    ],
    relatedLinks: [
      { label: 'Checklist Grip op Uitvoering & Meerwerk', href: '/kennisbank/meerwerk' },
      { label: 'Checklist Droomhuis Vormgeven', href: '/kennisbank/stappenplan' },
    ],
  },
  {
    slug: 'wat-is-het-verschil-tussen-een-architect-en-een-tekenaar',
    title: 'Architect versus tekenaar: wat is het verschil?',
    metaTitle: 'Verschil architect en tekenaar | Brikx Kennisbank',
    metaDescription:
      'Een tekenaar tekent uit, een architect ontwerpt en begeleidt. Lees wanneer welke rol past bij jouw project.',
    intro:
      'Een tekenaar en een architect hebben allebei waarde, maar niet dezelfde rol. Een tekenaar werkt meestal uit wat al gekozen is. Een architect helpt ook met ontwerpkeuzes, afwegingen en kwaliteitsbewaking tijdens het proces.',
    keyPoints: [
      'Een tekenaar is geschikt voor eenvoudige, duidelijke opdrachten.',
      'Een architect voegt waarde toe bij complexiteit, budgetafweging en kwaliteit.',
      'Goedkoop in de voorfase kan duur uitpakken in uitvoering.',
    ],
    sections: [
      {
        title: 'Wat doet een tekenaar en wat niet?',
        paragraphs: [
          'Een tekenaar vertaalt een duidelijke vraag naar tekenwerk voor vergunning en uitvoering. Meestal hoort daar geen brede ontwerpbegeleiding of processturing bij.',
        ],
        bullets: [
          'Wel: technisch uitwerken van afgesproken oplossing.',
          'Niet: strategische ontwerpkeuzes en procesbewaking.',
          'Niet: actieve kwaliteitscontrole tijdens bouw.',
        ],
      },
      {
        title: 'Wanneer kies je voor een architect?',
        paragraphs: [
          'Bij nieuwbouw, grotere verbouwingen en complexe locaties is ontwerpkwaliteit direct gekoppeld aan budget, regelgeving en uitvoerbaarheid. Dan loont architectbegeleiding vrijwel altijd.',
          'Een tussenvorm is ook mogelijk: architect voor ontwerp en vergunning, met beperkte begeleiding in uitvoering.',
        ],
        bullets: [
          'Nieuwbouw of verbouw met veel ontwerpkeuzes.',
          'Projecten met vergunningsdruk of complexe context.',
          'Situaties waar budget, kwaliteit en planning tegelijk moeten kloppen.',
        ],
      },
    ],
    callout:
      'De juiste keuze is niet: wat kost minder op papier? De juiste keuze is: welke begeleiding voorkomt later de meeste faalkosten.',
    relatedFaqSlugs: [
      'hoe-kies-je-een-betrouwbare-aannemer',
      'wat-zijn-faalkosten-en-hoe-voorkom-ik-ze',
      'wat-is-een-programma-van-eisen-en-waarom-is-het-belangrijk',
    ],
    relatedLinks: [
      { label: 'Checklist Droomhuis Vormgeven', href: '/kennisbank/stappenplan' },
      { label: 'Start direct met de wizard', href: '/wizard' },
    ],
  },
  {
    slug: 'hoe-lang-duurt-een-gemiddeld-bouw-of-verbouwproject',
    title: 'Realistische doorlooptijd van bouw en verbouw',
    metaTitle: 'Hoe lang duurt bouwen of verbouwen echt? | Brikx Kennisbank',
    metaDescription:
      'Nieuwbouw duurt vaak 12-18 maanden en grote verbouwing 8-14 maanden. Lees waar tijd weglekt en hoe je realistischer plant.',
    intro:
      'Doorlooptijd wordt structureel onderschat. Veel projecten lopen niet uit door pech, maar door te optimistische planning, wachttijden tussen fases en te late keuzes. Realistische timing voorkomt stress en extra kosten.',
    keyPoints: [
      'Nieuwbouw vraagt meestal 12-18 maanden totaal.',
      'Grote verbouwing zit vaak tussen 8-14 maanden.',
      'Voorbereiding en vergunning kosten vaak meer tijd dan verwacht.',
    ],
    sections: [
      {
        title: 'Wat is realistisch per projecttype?',
        paragraphs: [
          'Nieuwbouw bestaat grofweg uit 4-6 maanden voorbereiding en 6-10 maanden uitvoering. Bij grote verbouw zit je vaak op 3-5 maanden voorbereiding en 4-8 maanden uitvoering.',
          'Kleine verbouwingen zijn sneller, maar ook daar bepalen vergunning, levertijden en planning van vakmensen het tempo.',
        ],
        bullets: [
          'Nieuwbouw: meestal 12-18 maanden totaal.',
          'Grote verbouw: meestal 8-14 maanden totaal.',
          'Kleine verbouw: vaak 4-8 maanden inclusief voorbereiding.',
        ],
      },
      {
        title: 'Waarom duurt het vaak langer?',
        paragraphs: [
          'Wachttijden stapelen zich op tussen ontwerp, berekeningen, vergunning en uitvoering. Daarnaast veroorzaken levertijden en late keuzes regelmatig extra uitloop.',
        ],
        bullets: [
          'Wachttijd tussen adviseurs en vergunningstappen.',
          'Levertijden van keuken, kozijnen en maatwerkmateriaal.',
          'Herplanning door te late keuzes tijdens uitvoering.',
          'Seizoenseffect en beperkte beschikbaarheid van onderaannemers.',
        ],
      },
    ],
    callout:
      'Een realistische planning met buffer is geen pessimisme, maar professionele projectsturing.',
    relatedFaqSlugs: [
      'wanneer-moet-je-welke-keuzes-maken-tijdens-het-bouwproces',
      'waarom-lopen-bouwprojecten-uit-en-hoe-voorkom-je-dat',
      'hoe-blijf-je-binnen-budget-tijdens-de-bouw',
    ],
    relatedLinks: [
      { label: 'Checklist Droomhuis Vormgeven', href: '/kennisbank/stappenplan' },
      { label: 'Start direct met de wizard', href: '/wizard' },
    ],
  },
  {
    slug: 'welke-verzekeringen-heb-je-nodig-bij-bouwen-of-verbouwen',
    title: 'Verzekeringen die je project echt beschermen',
    metaTitle: 'Verzekeringen bij bouwen of verbouwen | Brikx Kennisbank',
    metaDescription:
      'CAR, AVB en opdrachtgeversaansprakelijkheid: dit zijn de verzekeringen die risico tijdens bouw en verbouw afdekken.',
    intro:
      'Verzekeringen voelen vaak als bijzaak, tot er schade ontstaat. Dan bepalen ze of een project beheersbaar blijft of financieel uit de hand loopt. Controle op verzekeringen hoort in de voorbereiding, niet tijdens de crisis.',
    keyPoints: [
      'CAR en AVB zijn kernverzekeringen in uitvoering.',
      'Ook als opdrachtgever heb je eigen aansprakelijkheidsrisico.',
      'Polissen en verantwoordelijkheden moeten vooraf duidelijk zijn.',
    ],
    sections: [
      {
        title: 'Welke verzekeringen moet je checken?',
        paragraphs: [
          'Controleer per project wie welke polis draagt en op welke periode de dekking geldt. Vooral bij nieuwbouw is het essentieel dat CAR en AVB goed geregeld zijn.',
        ],
        bullets: [
          'CAR-verzekering voor bouwrisico tijdens uitvoering.',
          'AVB-verzekering van de aannemer voor schade aan derden.',
          'Opdrachtgeversaansprakelijkheid voor jouw positie als opdrachtgever.',
          'Afstemming met bestaande woonhuis- en inboedelpolis bij verbouw.',
        ],
      },
      {
        title: 'Hoe voorkom je problemen bij schade?',
        paragraphs: [
          'Vraag polisbewijs vooraf op, leg verantwoordelijkheden vast in contract en bewaar alle gegevens centraal. Bij schade telt snelheid en heldere documentatie.',
        ],
        bullets: [
          'Vraag bewijs van dekking op naam en periode.',
          'Leg in contract vast wie welke schade claimt.',
          'Meld verbouw vooraf aan je huidige verzekeraar.',
          'Bundel polisnummers en contactpersonen in een projectdossier.',
        ],
      },
    ],
    callout:
      'Verzekering is geen formaliteit. Het is je vangnet als planning en budget onder druk komen door schade.',
    relatedFaqSlugs: [
      'wat-zijn-je-rechten-als-opdrachtgever',
      'wat-moet-je-weten-over-garanties-bij-nieuwbouw-en-verbouwing',
      'hoe-kies-je-een-betrouwbare-aannemer',
    ],
    relatedLinks: [
      { label: 'Checklist Grip op Uitvoering & Meerwerk', href: '/kennisbank/meerwerk' },
      { label: 'Checklist Waterdicht Projectbudget', href: '/kennisbank/financien' },
    ],
  },
  {
    slug: 'hoe-ga-je-om-met-buren-tijdens-een-verbouwing',
    title: 'Buren slim meenemen tijdens verbouwing',
    metaTitle: 'Omgaan met buren tijdens verbouwing | Brikx Kennisbank',
    metaDescription:
      'Goede communicatie met buren voorkomt bezwaar, vertraging en escalatie. Lees hoe je dit praktisch aanpakt.',
    intro:
      'Burenmanagement is projectmanagement. Goede afstemming voorkomt klachten, bezwaar en langdurige spanning in de straat. Slechte communicatie leidt vaak tot onnodige vertraging.',
    keyPoints: [
      'Informeer buren vroeg en concreet over planning en impact.',
      'Maak contact laagdrempelig met duidelijke aanspreekpunten.',
      'Kleine irritaties vroeg oplossen voorkomt escalatie.',
    ],
    sections: [
      {
        title: 'Wat werkt in de praktijk?',
        paragraphs: [
          'Informeer buren vooraf over duur, werktijden en momenten met extra overlast. Laat waar relevant tekeningen zien zodat zorgen niet op aannames blijven hangen.',
        ],
        bullets: [
          'Kondig start en kritieke fasen vooraf aan.',
          'Deel contactgegevens van opdrachtgever en aannemer.',
          'Geef tussentijdse updates bij wijziging van planning.',
          'Reageer snel op klachten of schadepunten.',
        ],
      },
      {
        title: 'Wat moet je vermijden?',
        paragraphs: [
          'Niet communiceren of te optimistische beloftes doen werkt averechts. Beter eerlijk en voorspelbaar communiceren dan te rooskleurig plannen.',
        ],
        bullets: [
          'Niet starten zonder voorafgaande uitleg.',
          'Geen loze beloftes over einddatum of overlastniveau.',
          'Geen defensieve reactie op vragen of zorgen.',
        ],
      },
    ],
    callout:
      'Een goede buurrelatie kost weinig en bespaart vaak maanden aan gedoe.',
    relatedFaqSlugs: [
      'hoe-lang-duurt-een-gemiddeld-bouw-of-verbouwproject',
      'waarom-lopen-bouwprojecten-uit-en-hoe-voorkom-je-dat',
      'wat-zijn-je-rechten-als-opdrachtgever',
    ],
    relatedLinks: [
      { label: 'Checklist Droomhuis Vormgeven', href: '/kennisbank/stappenplan' },
      { label: 'Checklist Grip op Uitvoering & Meerwerk', href: '/kennisbank/meerwerk' },
    ],
  },
  {
    slug: 'wat-zijn-je-rechten-als-opdrachtgever',
    title: 'Je rechten als opdrachtgever in de bouw',
    metaTitle: 'Rechten als opdrachtgever bij verbouw en nieuwbouw | Brikx Kennisbank',
    metaDescription:
      'Ken je rechten op offerte, kwaliteit, oplevering, meerwerk en garantie zodat je sterker staat tijdens uitvoering.',
    intro:
      'Als opdrachtgever heb je meer rechten dan veel mensen denken. Die rechten werken alleen als je ze vooraf contractueel borgt en tijdens uitvoering consequent toepast.',
    keyPoints: [
      'Je hebt recht op duidelijke scope, kwaliteit en toetsbare meerwerkonderbouwing.',
      'Schriftelijke afspraken zijn cruciaal voor handhaving.',
      'Ook jij hebt plichten: tijdige keuzes, toegang en betaling volgens afspraak.',
    ],
    sections: [
      {
        title: 'Waar heb je recht op?',
        paragraphs: [
          'Rechten draaien om helderheid, controle en herstel: duidelijke offerte, schriftelijk contract, kwaliteitscontrole, opleverlijst en onderbouwd meerwerk.',
        ],
        bullets: [
          'Recht op complete en begrijpelijke offerte.',
          'Recht op schriftelijk contract en duidelijke voorwaarden.',
          'Recht op kwaliteitsinspectie en herstel bij gebreken.',
          'Recht op transparante meerwerkonderbouwing.',
        ],
      },
      {
        title: 'Hoe handel je bij conflict?',
        paragraphs: [
          'Escalatie begint met goede dossiervorming. Leg afwijkingen direct schriftelijk vast en geef redelijke hersteltermijn. Pas daarna is formele geschilroute logisch.',
        ],
        bullets: [
          'Stap 1: bespreek direct en feitelijk.',
          'Stap 2: bevestig schriftelijk met hersteltermijn.',
          'Stap 3: schakel onafhankelijke toetsing of geschillenroute in.',
          'Stap 4: juridische route als laatste optie.',
        ],
      },
    ],
    callout:
      'Rechten zonder documentatie zijn moeilijk te handhaven. Leg afspraken en afwijkingen altijd vast.',
    relatedFaqSlugs: [
      'wat-is-meerwerk-en-hoe-voorkom-je-discussies',
      'hoe-weet-ik-of-een-offerte-compleet-is',
      'wat-moet-je-weten-over-garanties-bij-nieuwbouw-en-verbouwing',
    ],
    relatedLinks: [
      { label: 'Checklist Grip op Uitvoering & Meerwerk', href: '/kennisbank/meerwerk' },
      { label: 'Checklist Waterdicht Projectbudget', href: '/kennisbank/financien' },
    ],
  },
  {
    slug: 'wat-moet-je-weten-over-garanties-bij-nieuwbouw-en-verbouwing',
    title: 'Garanties bij nieuwbouw en verbouwing begrijpen',
    metaTitle: 'Garanties bij bouw en verbouw uitgelegd | Brikx Kennisbank',
    metaDescription:
      'Wettelijke, contractuele en productgaranties verschillen sterk. Lees wat je mag verwachten en hoe je een claim goed indient.',
    intro:
      'Garantie is alleen waardevol als je weet wat er precies gedekt is, hoe lang en onder welke voorwaarden. Verschil tussen wettelijke, contractuele en productgarantie is daarom essentieel.',
    keyPoints: [
      'Niet elke schade valt onder garantie; onderhoud en gebruik spelen mee.',
      'Contractvoorwaarden bepalen vaak de praktische claimroute.',
      'Snelle en complete melding vergroot de kans op goed herstel.',
    ],
    sections: [
      {
        title: 'Welke garanties spelen er?',
        paragraphs: [
          'Bij bouwprojecten lopen meestal meerdere garanties tegelijk: wettelijke bescherming, contractafspraken met uitvoerende partij en fabrieksgaranties op producten en installaties.',
        ],
        bullets: [
          'Wettelijke garantie op gebreken binnen redelijke kaders.',
          'Contractuele garantie op afgesproken onderdelen en termijnen.',
          'Fabrieksgarantie op specifieke producten zoals installaties.',
          'Aanvullende borging via projectspecifieke regelingen waar van toepassing.',
        ],
      },
      {
        title: 'Hoe dien je een garantieclaim goed in?',
        paragraphs: [
          'Meld gebreken direct, schriftelijk en met bewijs. Koppel de melding aan contract en oplevergegevens en geef redelijke hersteltermijn.',
        ],
        bullets: [
          'Beschrijf gebrek feitelijk en voeg foto\'s toe.',
          'Verwijs naar contract, opleverdatum en relevante garantie.',
          'Vraag herstelvoorstel met duidelijke planning.',
          'Bewaar alle communicatie in een centraal dossier.',
        ],
      },
    ],
    callout:
      'Goede garantie begint niet bij schade, maar bij heldere contracten en complete opleverdocumentatie.',
    relatedFaqSlugs: [
      'wat-zijn-je-rechten-als-opdrachtgever',
      'welke-verzekeringen-heb-je-nodig-bij-bouwen-of-verbouwen',
      'hoe-kies-je-een-betrouwbare-aannemer',
    ],
    relatedLinks: [
      { label: 'Checklist Grip op Uitvoering & Meerwerk', href: '/kennisbank/meerwerk' },
      { label: 'Start direct met de wizard', href: '/wizard' },
    ],
  },
  {
    slug: 'hoe-bereid-je-een-bouwproject-voor',
    title: 'Hoe bereid je een bouwproject voor?',
    metaTitle: 'Hoe bereid je een bouwproject voor? | Brikx Kennisbank',
    metaDescription:
      'Goede voorbereiding voorkomt EUR 20-60k faalkosten. Werk in vijf stappen: PvE, budget, haalbaarheid, keuzetijdlijn en team.',
    intro:
      'Een bouwproject voorbereiden is vaak belangrijker dan bouwen zelf. Goede voorbereiding voorkomt veel faalkosten, verkort doorlooptijd en verlaagt stress tijdens uitvoering.',
    keyPoints: [
      'Reserveer 4-8 weken voor voorbereiding; die tijd win je later dubbel terug.',
      'Werk in vijf vaste stappen: PvE, budget, haalbaarheid, keuzetijdlijn, team.',
      'Ga niet direct naar een aannemer zonder duidelijke scope en keuzes.',
    ],
    sections: [
      {
        title: 'Stap 1: Programma van Eisen (PvE) uitwerken',
        paragraphs: [
          'Het PvE is de inhoudelijke basis van je project. Hierin leg je per ruimte vast wat functie, maat, kwaliteit en prioriteit is.',
          'Hoe concreter je PvE, hoe beter offertes vergelijkbaar worden en hoe kleiner de kans op discussie of meerwerk.',
        ],
        bullets: [
          'Beschrijf gebruik per ruimte en gewenste m2.',
          'Leg installaties en comforteisen vast.',
          'Maak onderscheid tussen must-have en nice-to-have.',
          'Gebruik de PvE-generator om niets te vergeten.',
        ],
      },
      {
        title: 'Stap 2: Budget realistisch maken',
        paragraphs: [
          'Veel mensen verwarren totaalbudget met bouwbudget. In de praktijk gaat een relevant deel naar ontwerp, vergunningen en onvoorzien.',
          'Een realistisch budget geeft rust en voorkomt pijnlijke bijsturing midden in het traject.',
        ],
        bullets: [
          'Reserveer voldoende onvoorzien (nieuwbouw lager, verbouw hoger).',
          'Neem tijdelijke woonlasten en afrondingskosten mee.',
          'Bepaal pas daarna je echte bouwsom.',
          'Gebruik de budget-calculator voor een complete verdeling.',
        ],
      },
      {
        title: 'Stap 3: Haalbaarheid en risico vooraf toetsen',
        paragraphs: [
          'Voordat je ontwerpt, toets je of plan, budget en regelgeving op elkaar aansluiten. Dit voorkomt dure verrassingen in de vergunnings- of uitvoeringsfase.',
          'Bij nieuwbouw betekent dit ook: kavel toetsen op bouwmogelijkheden voordat je definitief beslist.',
        ],
        bullets: [
          'Check bestemmingsplan en randvoorwaarden tijdig.',
          'Laat bij twijfel een quickscan doen.',
          'Toets constructieve haalbaarheid bij ingrijpende verbouw.',
          'Gebruik Kavel Alert en Kavelrapport in de kavel-fase.',
        ],
      },
      {
        title: 'Stap 4: Keuzetijdlijn opstellen',
        paragraphs: [
          'Veel vertraging ontstaat door keuzes die te laat vallen. Een keuzetijdlijn koppelt beslissingen aan uitvoeringsmomenten en levertijden.',
          'Dit maakt planning voorspelbaar voor jou en voor de uitvoerende partijen.',
        ],
        bullets: [
          'Plan keuken, sanitair en tegelkeuzes ruim vooraf.',
          'Werk met reminders per beslismoment.',
          'Leg alternatieven klaar voor kritieke producten.',
          'Voorkom stilstand door late materiaalkeuzes.',
        ],
      },
      {
        title: 'Stap 5: Team en rolverdeling bepalen',
        paragraphs: [
          'Met een goed PvE, realistisch budget en duidelijke planning kun je het juiste team selecteren. Dan vergelijk je op inhoud in plaats van op aannames.',
          'Goede voorbereiding zorgt dat architect, aannemer en opdrachtgever in hetzelfde ritme werken.',
        ],
        bullets: [
          'Selecteer op ervaring met jouw projecttype.',
          'Vergelijk minimaal drie offertes op dezelfde scope.',
          'Leg meerwerkprocedure en besluitmomenten vast.',
          'Gebruik periodieke voortgangscontrole tijdens uitvoering.',
        ],
      },
    ],
    callout:
      'Voorbereiding kost tijd, maar voorkomt bijna altijd de duurste fouten in budget, planning en uitvoering.',
    relatedFaqSlugs: [
      'wat-is-een-programma-van-eisen-en-waarom-is-het-belangrijk',
      'hoe-maak-ik-een-realistisch-budget-voor-bouwen-of-verbouwen',
      'wat-zijn-faalkosten-en-hoe-voorkom-ik-ze',
    ],
    relatedLinks: [
      { label: 'PvE Generator', href: '/tools/pve-generator' },
      { label: 'Verbouwbudget Calculator', href: '/tools/verbouwbudget-calculator' },
      { label: 'Keuzetijdlijn', href: '/tools/keuzetijdlijn' },
      { label: 'Kavel Alert', href: 'https://kavelarchitect.nl/diensten/kavel-alert' },
      { label: 'Kavelrapport', href: 'https://kavelarchitect.nl/diensten/kavelrapport' },
      { label: 'Waar begin ik met bouwen of verbouwen?', href: 'https://architectenbureau-zwijsen.nl/kennisbank/vragen/architect-kosten-en-bouwen/waar-begin-ik-met-bouwen-of-verbouwen' },
    ],
  }
];

export const FAQ_ARTICLE_MAP = new Map(FAQ_ARTICLES.map((article) => [article.slug, article]))










