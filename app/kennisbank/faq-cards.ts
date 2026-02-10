export type FaqCardItem = {
  slug: string
  title: string
  description: string
  imageUrl: string
  tag: string
}

export const FAQ_CARD_ITEMS: FaqCardItem[] = [
  {
    slug: 'wat-zijn-faalkosten-en-hoe-voorkom-ik-ze',
    title: 'Faalkosten voorkomen in de praktijk',
    description:
      'Faalkosten ontstaan door fouten, miscommunicatie en slechte volgorde. In de sector wordt vaak gesproken over 10-15%.',
    imageUrl: '/faq/wat-zijn-faalkosten-en-hoe-voorkom-ik-ze.webp',
    tag: 'Risico',
  },
  {
    slug: 'hoeveel-buffer-moet-ik-aanhouden-voor-onvoorziene-kosten',
    title: 'Buffer voor onvoorziene kosten bepalen',
    description:
      'Waarom 10-15% buffer vaak het minimum is, en wanneer 20% realistischer wordt.',
    imageUrl: '/faq/hoeveel-buffer-moet-ik-aanhouden-voor-onvoorziene-kosten.webp',
    tag: 'Budget',
  },
  {
    slug: 'wat-zijn-verborgen-kosten-waar-mensen-niet-aan-denken',
    title: 'Verborgen kosten die budgetten onder druk zetten',
    description:
      'Leges, kwaliteitsborger, onderzoeken, aansluitingen, terrein en afwerking. Alles op een rij.',
    imageUrl: '/faq/wat-zijn-verborgen-kosten-waar-mensen-niet-aan-denken.webp',
    tag: 'Kosten',
  },
  {
    slug: 'hoe-maak-ik-een-realistisch-budget-voor-bouwen-of-verbouwen',
    title: 'Een realistisch bouw- of verbouwbudget opzetten',
    description:
      'Een strak stappenplan om te rekenen met echte kosten, buffers en m2-prijzen.',
    imageUrl: '/faq/hoe-maak-ik-een-realistisch-budget-voor-bouwen-of-verbouwen.webp',
    tag: 'Planning',
  },
  {
    slug: 'wanneer-heb-ik-een-architect-nodig-en-wanneer-niet',
    title: 'Architect inschakelen: wanneer wel en wanneer niet',
    description:
      'Wanneer expertise onmisbaar is, en wanneer een tekenaar of adviseur volstaat.',
    imageUrl: '/faq/wanneer-heb-ik-een-architect-nodig-en-wanneer-niet.webp',
    tag: 'Team',
  },
  {
    slug: 'hoe-weet-ik-of-een-offerte-compleet-is',
    title: 'Een offerte op volledigheid controleren',
    description:
      'De check op detailniveau, stelposten, duidelijke in- en exclusies.',
    imageUrl: '/faq/hoe-weet-ik-of-een-offerte-compleet-is.webp',
    tag: 'Uitvoering',
  },
  {
    slug: 'wat-is-meerwerk-en-hoe-voorkom-je-discussies',
    title: 'Meerwerk beheersen zonder discussies',
    description:
      'Meerwerk is vaak te voorkomen met heldere afspraken, schriftelijke procedures en strakke controle tijdens de bouw.',
    imageUrl: '/faq/wat-is-meerwerk-en-hoe-voorkom-je-discussies.webp',
    tag: 'Uitvoering',
  },
  {
    slug: 'hoe-kies-je-een-betrouwbare-aannemer',
    title: 'Een betrouwbare aannemer selecteren',
    description:
      'Selecteer op referenties, duidelijkheid en ervaring met jouw projecttype in plaats van alleen op prijs.',
    imageUrl: '/faq/hoe-kies-je-een-betrouwbare-aannemer.webp',
    tag: 'Selectie',
  },
  {
    slug: 'wat-is-een-programma-van-eisen-en-waarom-is-het-belangrijk',
    title: 'Werken met een helder Programma van Eisen (PvE)',
    description:
      'Een sterk PvE voorkomt misverstanden, maakt offertes vergelijkbaar en geeft richting aan ontwerp en uitvoering.',
    imageUrl: '/faq/wat-is-een-programma-van-eisen-en-waarom-is-het-belangrijk.webp',
    tag: 'Voorbereiding',
  },
  {
    slug: 'waarom-lopen-bouwprojecten-uit-en-hoe-voorkom-je-dat',
    title: 'Bouwvertraging voorkomen met realistische planning',
    description:
      'Voorkom uitloop met een keuzetijdlijn, tijdsbuffer en wekelijkse voortgang op planning en beslissingen.',
    imageUrl: '/faq/waarom-lopen-bouwprojecten-uit-en-hoe-voorkom-je-dat.webp',
    tag: 'Planning',
  },
  {
    slug: 'wanneer-moet-je-welke-keuzes-maken-tijdens-het-bouwproces',
    title: 'Keuzes op het juiste moment in het bouwproces',
    description:
      'Per fase de juiste keuzes maken voorkomt stilstand, herplanning en duur meerwerk.',
    imageUrl: '/faq/wanneer-moet-je-welke-keuzes-maken-tijdens-het-bouwproces.webp',
    tag: 'Planning',
  },
  {
    slug: 'hoe-blijf-je-binnen-budget-tijdens-de-bouw',
    title: 'Binnen budget blijven tijdens de bouw',
    description:
      'Houd grip op wijzigingen, buffer en meerwerk met een strak ritme van besluiten en controle.',
    imageUrl: '/faq/hoe-blijf-je-binnen-budget-tijdens-de-bouw.webp',
    tag: 'Budget',
  },
  {
    slug: 'wat-zijn-de-grootste-fouten-bij-bouwen-of-verbouwen',
    title: 'De grootste fouten bij bouwen of verbouwen',
    description:
      'Voorkom de fouten die projecten structureel vertragen en veel duurder maken dan gepland.',
    imageUrl: '/faq/wat-zijn-de-grootste-fouten-bij-bouwen-of-verbouwen.webp',
    tag: 'Risico',
  },
  {
    slug: 'hoe-werkt-de-samenwerking-tussen-architect-en-aannemer',
    title: 'Samenwerking tussen architect en aannemer',
    description:
      'Kies het juiste samenwerkingsmodel en voorkom ruis over rollen, kwaliteit en beslissingen.',
    imageUrl: '/faq/hoe-werkt-de-samenwerking-tussen-architect-en-aannemer.webp',
    tag: 'Team',
  },
  {
    slug: 'wat-is-het-verschil-tussen-een-architect-en-een-tekenaar',
    title: 'Architect versus tekenaar: wat is het verschil?',
    description:
      'Ontdek wanneer tekenwerk volstaat en wanneer ontwerpbegeleiding essentieel wordt.',
    imageUrl: '/faq/wat-is-het-verschil-tussen-een-architect-en-een-tekenaar.webp',
    tag: 'Rolkeuze',
  },
]
