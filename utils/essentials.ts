// Checkt alleen de essentials. Geen hard blok; jij bepaalt wanneer je dit toont.
// Gebruik in Preview/versturen, niet tijdens tab navigatie.

import type { TriageData } from "@/types/wizard";
import type { Space, WishItem, TechnicalPrefs, SustainabilityPrefs } from "@/types/project";
import type { Archetype } from "@/types/archetype";

export type EssentialIssue = {
  id: string;
  title: string;
  message: string;
  related?: string[]; // hints zoals ['basis.budget', 'ruimtes']
};

function uid(p: string) { return `${p}-${Math.random().toString(36).slice(2,8)}`; }

export function computeEssentialIssues(args: {
  triage: TriageData;
  archetype: Archetype | null;
  answers: Record<string, any>;
}): EssentialIssue[] {
  const { triage, archetype, answers } = args;

  const ruimtes = (answers["ruimtes"] as Space[] | undefined) ?? [];
  const wensen  = (answers["wensen"] as WishItem[] | undefined) ?? [];
  const techniek = (answers["techniek"] as TechnicalPrefs | undefined);
  const duurzaamheid = (answers["duurzaamheid"] as SustainabilityPrefs | undefined);

  const out: EssentialIssue[] = [];

  // Archetype
  if (!archetype) {
    out.push({
      id: uid("arch"),
      title: "Kies je projectvariant (archetype)",
      message: "Selecteer welke projectvariant het beste past. Dit helpt bij het vervolg.",
      related: ["intake.archetype"],
    });
  }

  // Basis
  if (!triage?.projectType) out.push({ id: uid("ptype"), title: "Projecttype ontbreekt", message: "Kies Nieuwbouw / Verbouwing / Hybride.", related: ["basis.projectType"] });
  if (!triage?.ervaring) out.push({ id: uid("exp"), title: "Ervaring ontbreekt", message: "Geef aan of je starter of ervaren bent.", related: ["basis.ervaring"] });
  if (!triage?.intent) out.push({ id: uid("intent"), title: "Intentie ontbreekt", message: "Kies je hoofddoel (architect, offertes, scenario's).", related: ["basis.intent"] });
  if (!triage?.urgentie) out.push({ id: uid("urg"), title: "Urgentie ontbreekt", message: "Hoe snel wil je starten?", related: ["basis.urgentie"] });
  if (!Number.isFinite(triage?.budget) || (triage?.budget as number) <= 0) {
    out.push({ id: uid("budget"), title: "Budget ontbreekt", message: "Vul een indicatief budget in (mag globaal).", related: ["basis.budget"] });
  }

  // Ruimtes
  if (ruimtes.length < 1) {
    out.push({ id: uid("rooms"), title: "Nog geen ruimtes toegevoegd", message: "Voeg minimaal één ruimte toe (bv. keuken, slaapkamer).", related: ["ruimtes"] });
  } else if (ruimtes.some(r => !r.type?.trim())) {
    out.push({ id: uid("rooms-name"), title: "Onbenoemde ruimte", message: "Geef elke ruimte een duidelijke naam.", related: ["ruimtes"] });
  }

  // Wensen
  if (wensen.length < 1) {
    out.push({ id: uid("wishes"), title: "Nog geen wensen toegevoegd", message: "Voeg minimaal één wens toe (kookeiland, lichtstraat, etc.).", related: ["wensen"] });
  }

  // Techniek (alleen de kern; 'unknown' is toegestaan)
  if (!techniek) {
    out.push({ id: uid("tech"), title: "Techniek nog leeg", message: "Maak alvast globale techniek-keuzes of kies ‘Weet ik nog niet’.", related: ["techniek"] });
  }

  // Duurzaamheid is niet essentieel, maar prettig
  // => Geen blocking item, dus overslaan

  return out;
}
