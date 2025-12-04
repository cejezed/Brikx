// lib/insights/budget-rules.ts
// Centrale configuratie voor budget impact regels
//
// Deze regels worden gebruikt door BudgetRiskStrategy om gebruikers
// te waarschuwen voor kostbare wensen op basis van tag-combinaties
// uit customer_examples data.

export type BudgetImpactLevel = 'low' | 'medium' | 'high';

export interface BudgetRule {
  id: string;
  tags: string[];           // alle tags die samen dit "cost cluster" vormen
  impact: BudgetImpactLevel;
  title: string;            // korte titel voor de warning
  message: string;          // tekst voor Insight.content (geen exacte prijzen, wel indicaties)
  minExamples?: number;     // minimum aantal ondersteunende examples (default 3)
}

export const BUDGET_RULES: BudgetRule[] = [
  {
    id: 'large_glazing',
    tags: ['grote glaspartij', 'puien', 'glasgevel', 'schuifpui'],
    impact: 'high',
    title: 'Grote glaspartijen hebben hoge impact op budget',
    message:
      'Grote glaspartijen verhogen de kosten door extra glas, zwaardere kozijnen, hogere isolatie-eisen en vaak zonwering. Houd rekening met een forse meerprijs ten opzichte van standaard ramen.',
    minExamples: 3,
  },
  {
    id: 'heat_pump',
    tags: ['warmtepomp', 'lucht-water warmtepomp', 'warmtepomp installatie'],
    impact: 'high',
    title: 'Warmtepomp vraagt extra investeringen',
    message:
      'Een warmtepomp vraagt vaak om aanvullende isolatiemaatregelen, aanpassingen aan het afgiftesysteem (zoals vloerverwarming) en ruimte voor buiten- en binnenunit. Dit is een investering in de hogere categorie.',
    minExamples: 3,
  },
  {
    id: 'bathroom_luxury',
    tags: ['badkamer', 'inloopdouche', 'vloerverwarming', 'luxe badkamer'],
    impact: 'medium',
    title: 'Luxe badkamerafwerking verhoogt de kosten',
    message:
      'Combinaties van inloopdouche, vloerverwarming en hoogwaardige afwerking in de badkamer zorgen voor extra kosten in afwerking, techniek en detaillering. Houd rekening met een merkbaar hogere post.',
    minExamples: 3,
  },
  {
    id: 'attic_dormer',
    tags: ['dakkapel', 'zolder', 'dakopbouw'],
    impact: 'medium',
    title: 'Dakkapel op zolder heeft constructieve gevolgen',
    message:
      'Een dakkapel op de zolder vraagt vaak om extra constructieve maatregelen en kan invloed hebben op vergunningen en kosten. Dit is meer dan "alleen een gat in het dak".',
    minExamples: 2,
  },
  {
    id: 'open_floor_plan',
    tags: ['open indeling', 'open keuken', 'wanden slopen', 'dragende wand'],
    impact: 'medium',
    title: 'Open indeling kan constructieve aanpassingen vragen',
    message:
      'Een open indeling betekent vaak het verwijderen van wanden. Bij dragende wanden zijn staalconstructies of balken nodig, wat de kosten merkbaar verhoogt. Ook akoestiek en ventilatie vragen extra aandacht.',
    minExamples: 3,
  },
  {
    id: 'custom_kitchen',
    tags: ['maatwerk keuken', 'keuken op maat', 'design keuken'],
    impact: 'high',
    title: 'Maatwerk keuken vraagt aanzienlijke investering',
    message:
      'Een keuken op maat met hoogwaardige materialen en apparatuur kan een aanzienlijk budgetonderdeel vormen. Denk aan specifieke werkbladen, inbouwapparatuur en afwerking die substantieel duurder zijn dan standaard oplossingen.',
    minExamples: 2,
  },
  {
    id: 'solar_panels',
    tags: ['zonnepanelen', 'PV-panelen', 'solar'],
    impact: 'medium',
    title: 'Zonnepanelen vragen initiële investering',
    message:
      'Zonnepanelen vragen een merkbare initiële investering. Denk ook aan mogelijke aanpassingen aan het dak, de meterkast en eventueel batterijopslag. De terugverdientijd is wel gunstig.',
    minExamples: 3,
  },
  {
    id: 'underfloor_heating',
    tags: ['vloerverwarming', 'vloer verwarming'],
    impact: 'medium',
    title: 'Vloerverwarming verhoogt installatiekosten',
    message:
      'Vloerverwarming vraagt specifieke vloerconstructie, leidingwerk en vaak aanpassingen aan de verwarmingsinstallatie. Dit verhoogt de kosten merkbaar ten opzichte van traditionele radiatoren.',
    minExamples: 3,
  },
];
