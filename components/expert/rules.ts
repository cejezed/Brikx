export type TipItem = { id: string; text: string; severity?: "info"|"warning"|"danger" };
export type Rules = Record<string, TipItem[]>;


const rules: Rules = {
  intake: [
    { id: "budget", text: "Werk met een bandbreedte (bijv. €250k–€300k) i.p.v. één bedrag.", severity: "info" },
    { id: "intent", text: "Kies 'scenario's verkennen' als vergunning/onzekerheden nog groot zijn. Brikx stelt dan minder strikte eisen en helpt je opties verkennen.", severity: "info" },
    { id: "projectType", text: "Bij verbouwing met uitbreiding: check erfgrens en afstanden tot buren. Bij renovatie zonder uitbreiding: let op constructieve veiligheid en geluidsnormen (vooral bij functiewijziging).", severity: "warning" },
  ],
  basis: [
    { id: "projectType", text: "Bij nieuwbouw: let op erfgrens, kavelpositie en welstandseisen. Welstandseisen variëren per gemeente; check ook of je locatie in beschermd stads- of dorpsgezicht ligt. Bij verbouwing: check erfgrens, geluidsnormen en constructieve veiligheid vroeg in het proces.", severity: "info" },
    { id: "projectNaam", text: "Een duidelijke projectnaam helpt bij communicatie met adviseurs en aannemers, bijv. 'Renovatie woning [Achternaam]' of 'Nieuwbouw [Straatnaam]'.", severity: "info" },
    { id: "locatie", text: "Bestemmingsplan en welstandsnota zijn locatie-gebonden; noteer minimaal de plaats. Check ook of de locatie in beschermd stads- of dorpsgezicht ligt.", severity: "info" },
    { id: "budget", text: "Werk met een bandbreedte (bijv. €250k–€300k) i.p.v. één bedrag. Reserveer 10–15% voor onvoorziene kosten en meerwerk.", severity: "warning" },
    { id: "projectSize", text: "Oppervlakte is indicatief; wijkt dit later >15% af, herzie dan het budget en de planning. Grotere of complexe projecten (>150m², of bij ingrijpende constructiewijzigingen) vragen vaak om constructeur.", severity: "warning" },
    { id: "urgency", text: "Vergunningsprocedures duren 8 weken (regulier) tot 26 weken (uitgebreid). Architectfase duurt 6-12 weken. Bij urgentie <6 maanden: overweeg gefaseerde aanpak of snellopende alternatieven.", severity: "info" },
    { id: "ervaring", text: "Als starter: overweeg begeleiding door een (bouw)adviseur of architect. Dit voorkomt kostbare fouten en vergunningsproblemen.", severity: "warning" },
    { id: "toelichting", text: "Een goede toelichting helpt adviseurs en AI om beter context te geven. Vermeld bijv. woonstijl, duurzaamheidswensen, of bijzondere eisen.", severity: "info" },
  ],
  ruimtes: [
    { id: "room:*:name", text: "Geef ruimtes duidelijke namen (bijv. 'Woonkamer', 'Slaapkamer 1'). Dit voorkomt verwarring bij adviseurs en aannemers.", severity: "info" },
    { id: "room:*:group", text: "Groepeer ruimtes logisch (dag/nacht/nat/tech). Dit helpt bij energie-zonering en installatieontwerp.", severity: "info" },
    { id: "room:*:m2", text: "Oppervlaktes zijn indicatief. Architect maakt definitieve opmeting. Houd rekening met maatvoering: binnenmaat vs buitenmaat kan 3-5% schelen (bij standaard spouwmuren ca. 30cm).", severity: "warning" },
    { id: "room:*:wishes", text: "Wensen per ruimte helpen architect/adviseur gerichte keuzes maken. Denk aan: verlichting, stopcontacten, vloerverwarming, extra isolatie, akoestiek.", severity: "info" },
  ],
  techniek: [
    { id: "heatingAmbition", text: "NIEUWBOUW: Vanaf 2024 geen gasaansluiting meer toegestaan. All-electric warmtepomp is standaard. Check isolatieniveau (minimaal Rc 3.5 gevels). VERBOUWING (tot 2026): Keuze tussen all-electric of hybride warmtepomp. Vanaf 2026 ook bij vervanging: minimaal warmtepomp of ander duurzaam alternatief verplicht.", severity: "warning" },
    { id: "ventilationAmbition", text: "Nieuwbouw vereist mechanische ventilatie (systeem C of D). Systeem D (balansventilatie met WTW) is beste keuze voor energiezuinigheid en comfort, maar niet verplicht. Systeem C+ kan bij lichte renovatie. Plan kanalen en technische ruimte vroeg in ontwerp!", severity: "warning" },
    { id: "coolingAmbition", text: "Passieve koeling (nachtventilatie, zonwering) is goedkoper en duurzamer dan actieve koeling. Overweeg actief alleen bij hoge interne lasten.", severity: "info" },
    { id: "pvAmbition", text: "Zonnepanelen: Zuid ±30° = optimaal (100% opbrengst). Oost/West = 85-90% opbrengst. Oost-west opstelling op plat dak = meer panelen per m², totale opbrengst kan hoger zijn. Check draagkracht dak (10-15 kg/m²) en schaduw van bomen/buren.", severity: "info" },
    { id: "verwarming", text: "All-electric warmtepomp is bij nieuwbouw sinds 2024 verplicht (geen gas mogelijk). Bij verbouwing tot 2026 kan hybride warmtepomp nog, maar niet met gasketel (geen gasaansluiting voor hybride). Hybride combineert elektrisch + hout. Minder duurzaam dan all-electric.", severity: "info" },
    { id: "ventilatie", text: "Vraaggestuurde ventilatie (CO2-sensoren) bespaart 20-30% energie vs continu. Verplicht kanalen opnemen in bouwkundige ruimte!", severity: "warning" },
    { id: "pvConfiguratie", text: "Bij installatie >6kWp: check capaciteit van meterkast (minimaal 3x25A voor 6-8kWp). Bij >8-10kWp: mogelijk netcongestie, overleg vroeg met netbeheerder over teruglevering.", severity: "warning" },
    { id: "evVoorziening", text: "Laadpaal minimaal 11kW (3x16A). Voorzie aparte groep in meterkast. Overweeg 22 kW (3x32A) bij grotere EV of twee auto's. V2G (vehicle-to-grid) vereist bidirectionele lader.", severity: "info" },
    { id: "resistanceClass", text: "Inbraakwerendheid RC2 is standaard voor woningen (basisbescherming, 3 min weerstand). RC3 voor vrijstaand/afgelegen (extra beveiliging, 5 min). Kies vroeg: beïnvloedt kozijnen en beglazing. Bespreek met verzekeraar voor eventuele premiekorting.", severity: "info" },
    { id: "notes", text: "Technische opmerkingen zijn cruciaal voor adviseurs. Vermeld bijv. bestaande aansluitingen, gewenste merken, of combinatie met domotica.", severity: "info" },
  ],
  budget: [
    { id: "budget.budgetTotaal", text: "Totaalbudget incl. BTW, architect, adviseurs, vergunningen én onvoorzien (10-15%). Exclusief grondkosten en inrichting.", severity: "warning" },
    { id: "budget.minBudget", text: "Minimumbudget = absolute ondergrens. Hieronder stopt het project. Gebruik voor risicomanagement en go/no-go beslissingen.", severity: "info" },
    { id: "budget.maxBudget", text: "Maximumbudget = plafond incl. marge. Hierbinnen kunnen keuzes gemaakt worden. Adviseer 10-15% boven verwachte kosten.", severity: "info" },
    { id: "budget.notes", text: "Vermeld bijzonderheden: Is grond al gekocht? Eigen inbreng? Subsidies? Gefaseerde aanpak mogelijk? Dit helpt adviseurs realistisch te adviseren.", severity: "info" },
  ],
  wensen: [
    { id: "wish:*:text", text: "Wees specifiek in wensen. Niet 'moderne keuken' maar 'kookeiland 3m, inductie, Quooker, vaatwasser in keukeneiland'.", severity: "info" },
    { id: "wish:*:priority", text: "Must-have = deal-breaker. Should-have = belangrijk maar flexibel. Nice-to-have = alleen als budget het toelaat. Gebruik dit voor keuzes!", severity: "warning" },
  ],
  duurzaamheid: [
    { id: "rcGevelAmbitie", text: "Nieuwbouw: minimaal Rc 4.7 (Bouwbesluit 2024). Ambitie Rc 6.0+ geeft EPC voordeel en toekomstwaarde. Elke 0.5 Rc-verbetering bespaart ca. 5-7% stookkosten. Let op koudebruggen!", severity: "warning" },
    { id: "rcDakAmbitie", text: "Dak is grootste warmteverlies. Rc 6.3+ is standaard bij nieuwbouw. Bij renovatie: minimaal Rc 6.3. Verschil Rc 6→8 = ca. €15/m² meerkosten.", severity: "info" },
    { id: "rcVloerAmbitie", text: "Vloerisolatie bij nieuwbouw minimaal Rc 3.5. Kruipruimte: isoleer ook leidingen! Bij renovatie: check vochtkerende laag.", severity: "info" },
    { id: "uGlasAmbitie", text: "HR++ glas (Ug 1.0-1.2) voldoet aan Bouwbesluit en is standaard. Triple glas (Ug 0.6-0.8) biedt 30-40% betere isolatie en is ideaal voor ambitieuze nieuwbouw of bij grote raampartijen. Let op: kozijnprofiel (Uf) beïnvloedt totale U-waarde even sterk!", severity: "warning" },
    { id: "n50Ambitie", text: "Luchtdichtheid in BENG: qv;10 <0.4-0.6 dm³/s.m² (afhankelijk van berekening). Voor passiefhuis: n50 <0.6/uur. Blowerdoortest wordt steeds meer standaard voor kwaliteitsborging. Goede luchtdichtheid bespaart 10-20% energiekosten.", severity: "warning" },
    { id: "co2TargetPpm", text: "CO2 <800ppm = gezond. 800-1200 = matig. >1200 = slecht voor concentratie/slaap. Zorg voor voldoende ventilatie!", severity: "info" },
    { id: "daglichtAmbitie", text: "Daglichtfactor >2% in verblijfsruimtes (Bouwbesluit). >4% = goed. Overweeg dakramen bij diepe ruimtes of noordgevel.", severity: "info" },
    { id: "zonnepanelenOppervlak", text: "Vuistregel: 1 paneel (450Wp) = ca. 1.7m². Voor 3000 kWh/jaar: 8-10 panelen (~3.5-4.5 kWp). Voor 5000 kWh/jaar: 13-16 panelen (~6-7 kWp). Check draagkracht dak (10-15 kg/m²) en schaduw van bomen/schoorsteen.", severity: "info" },
    { id: "evLaadpunt", text: "Thuislader minimaal 11kW (3x16A). Voorzie aparte groep in meterkast. Overweeg 22 kW (3x32A) bij grotere EV of twee auto's. Slimme lader optimaliseert met zonnepanelen/thuisbatterij. Kabel <25m tot parkeerplaats ideaal.", severity: "info" },
    { id: "regenwaterHerbruik", text: "Regenwateropvang voor toilet/tuin bespaart 30-50% drinkwater. Minimaal 1500L buffer voor gezin. Check ruimte kelder/kruipruimte.", severity: "info" },
    { id: "materiaalstrategie", text: "Circulaire materialen (hout, herbruikbare stenen) verhogen circulariteit. Biobased isolatie (cellulose, houtwol) = lagere CO2-footprint.", severity: "info" },
    { id: "opmerkingen", text: "Duurzaamheidsopmerkingen helpen adviseur keuzes maken. Vermeld bijv. gewenste certificering (BREEAM, WELL), passiefhuis-ambitie, of cradle-to-cradle.", severity: "info" },
  ],
};


export default rules;