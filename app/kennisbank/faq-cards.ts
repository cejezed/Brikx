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
    title: 'Wat zijn faalkosten en hoe voorkom ik ze?',
    description:
      'Faalkosten komen door fouten, miscommunicatie en slechte volgorde. Gemiddeld 10-15% van de bouwsom.',
    imageUrl: '/faq/wat-zijn-faalkosten-en-hoe-voorkom-ik-ze.webp',
    tag: 'Risico',
  },
  {
    slug: 'hoeveel-buffer-moet-ik-aanhouden-voor-onvoorziene-kosten',
    title: 'Hoeveel buffer heb ik nodig voor onvoorziene kosten?',
    description:
      'Waarom 10-15% buffer vaak het minimum is, en wanneer 20% realistischer wordt.',
    imageUrl: '/faq/hoeveel-buffer-moet-ik-aanhouden-voor-onvoorziene-kosten.webp',
    tag: 'Budget',
  },
  {
    slug: 'wat-zijn-verborgen-kosten-waar-mensen-niet-aan-denken',
    title: 'Welke verborgen kosten worden vaak vergeten?',
    description:
      'Leges, kwaliteitsborger, onderzoeken, aansluitingen, terrein en afwerking. Alles op een rij.',
    imageUrl: '/faq/wat-zijn-verborgen-kosten-waar-mensen-niet-aan-denken.webp',
    tag: 'Kosten',
  },
  {
    slug: 'hoe-maak-ik-een-realistisch-budget-voor-bouwen-of-verbouwen',
    title: 'Hoe maak ik een realistisch bouw- of verbouwbudget?',
    description:
      'Een strak stappenplan om te rekenen met echte kosten, buffers en m2-prijzen.',
    imageUrl: '/faq/hoe-maak-ik-een-realistisch-budget-voor-bouwen-of-verbouwen.webp',
    tag: 'Planning',
  },
  {
    slug: 'wanneer-heb-ik-een-architect-nodig-en-wanneer-niet',
    title: 'Wanneer heb ik een architect nodig en wanneer niet?',
    description:
      'Wanneer expertise onmisbaar is, en wanneer een tekenaar of adviseur volstaat.',
    imageUrl: '/faq/wanneer-heb-ik-een-architect-nodig-en-wanneer-niet.webp',
    tag: 'Team',
  },
  {
    slug: 'hoe-weet-ik-of-een-offerte-compleet-is',
    title: 'Hoe weet ik of een offerte compleet is?',
    description:
      'De check op detailniveau, stelposten, duidelijke in- en exclusies.',
    imageUrl: '/faq/hoe-weet-ik-of-een-offerte-compleet-is.webp',
    tag: 'Uitvoering',
  },
]
