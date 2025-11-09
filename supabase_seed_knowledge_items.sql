insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('proces_fasen_overzicht', 1, 'Van idee tot oplevering: de fasen in één oogopslag', 'Oriëntatie, ontwerp, vergunning, selectie aannemer, bouw en oplevering. Elke fase heeft eigen besluiten en valkuilen.', 'Het traject verloopt in herkenbare stappen:

- **Oriëntatie:** wensen, budget, locatie, haalbaarheid.
- **Schetsontwerp:** eerste massa, plattegrond, sfeer, grove kosten.
- **Voorlopig Ontwerp (VO):** concretere plattegronden, gevels, materiaalrichting.
- **Definitief Ontwerp (DO):** uitgewerkte tekeningen en principes, basis voor constructeur en installateur.
- **Vergunning:** compleet dossier indienen, vragen beantwoorden, formele toets.
- **Selectie aannemer / aanbesteding:** offertes op basis van goede stukken, keuze op inhoud én prijs.
- **Uitvoering:** bouwen, toezicht, meer- en minderwerk managen, kwaliteit borgen.
- **Oplevering & nazorg:** restpunten, garanties, inregeling installaties.

Door iedere fase bewust af te sluiten voorkom je dat beslissingen blijven doorschuiven naar de bouwplaats,
waar elke wijziging veel duurder is.', ARRAY['proces'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('proces_pve_maken', 1, 'Het Programma van Eisen (PvE) opstellen', 'Schrijf zo uitgebreid mogelijk uw wensen op. Niet alleen tastbare (aantal kamers), maar ook ontastbare (uitzicht, privacy, sfeer).', 'schrijf zo uitgebreid mogelijk uw wensen op. Dat kunnen zaken zijn zoals de hoeveelheid
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
En natuurlijk kan zo''n programma van eisen ook samen met de
architect verder uitgebreid worden.', ARRAY['proces', 'ontwerp'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('proces_pve_manieren', 1, 'Manieren om een PvE op te stellen', 'U kunt een PvE opstellen in Word, Excel, via Moodboards (Pinterest), of zelfs met simpele plattegronden.', 'Manieren waar je zo''n programma kan opstellen:
- Word documenten met omschrijving van wensen en gedachten
- Excel sheets informatie, ook over stichtingskosten en budget
- Moodboards zelf gemaakt of via apps zoals pinterest
- Soms zelfs al plattegronden met gedachten voor indelingen en ordening van ruimtes', ARRAY['proces', 'ontwerp', 'tools'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('proces_start', 1, 'De Start van het Proces', 'Een (ver)bouwproces begint bij drie basiselementen: een Programma van Eisen (PvE), een beschikbaar budget, en de specifieke locatie.', 'Een proces van verbouwen of nieuw bouwen van een woning begint bij het opstellen van een
helder projectdocument waarin in ieder geval de volgende onderdelen duidelijk omschreven staan:
programma van eisen, beschikbaar budget en de specifieke locatie met bijbehorende regelgeving
en voorwaarden.

Die drie elementen vormen de basis voor de start van het ontwerpproces en bepalen in grote mate
ook de kwaliteit en succes van dat ontwerpproces. Hoe meer helderheid over verwachtingen hoe
beter het resultaat. Dat is dus ook een belangrijke taak van de architect bij de start van zijn
werkzaamheden: zo veel mogelijk informatie verzamelen bij de opdrachtgever zodat er zo min
mogelijk ruis in het proces is en het eerste resultaat van een ontwerp zo goed mogelijk past bij dat
complete pakket van eisen, wensen en voorwaarden.', ARRAY['proces'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('proces_start_project', 1, 'Start van je (ver)bouwproject: drie vaste pijlers', 'Een sterk project begint met een duidelijk PvE, een realistisch budget en helderheid over locatie en regels.', 'Een woonhuis bouwen of verbouwen doe je meestal één keer. Juist daarom is de start cruciaal.

Drie pijlers:
1. **Programma van Eisen (PvE)** – hoe leef je, welke ruimtes heb je nodig, welke sfeer, welk comfort?
2. **Budget** – wat kun je en wil je uitgeven, inclusief alle bijkomende kosten, niet alleen de aanneemsom.
3. **Locatie & regels** – wat mag er op die plek, welke beperkingen en kansen bepalen het ontwerp?

Wie direct begint met schetsen of offertes zonder deze pijlers, loopt grote kans op herontwerpen, afgekeurde vergunningen,
meerwerk en frustratie. Met een helder PvE, toetsbaar budget en inzicht in de randvoorwaarden wordt het traject voorspelbaar,
stuurbaar en leuk.', ARRAY['proces'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('locatie_archieftekeningen_verbouw', 2, 'Archieftekeningen en inmeten bij verbouw', 'Zonder betrouwbare bestaande situatie is elk verbouwontwerp een gok.', 'Voor verbouw en aanbouw is inzicht in de bestaande constructie cruciaal.

Bronnen:
- gemeentearchief;
- oude vergunningsdossiers;
- recente verbouwplannen.

Als tekeningen ontbreken:
- laat de woning nauwkeurig inmeten;
- leg constructieve opbouw vast (vloeren, balklagen, dak, fundering);

Dit voorkomt verrassingen tijdens sloop en zorgt voor betrouwbare vergunningen en offertes.', ARRAY['locatie', 'proces', 'vergunningen'], ARRAY['verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('locatie_bodem_pfas_fundering', 2, 'Bodemonderzoek, PFAS en fundering: de onzichtbare kosten', 'Bodemkwaliteit en vervuiling bepalen funderingstype, kelderopties en mogelijke saneringskosten.', 'Een verkennend bodemonderzoek en sonderingen laten zien:
- of de ondergrond schoon genoeg is;
- op welke diepte draagkrachtige lagen liggen;
- of paalfundering of kelder reëel en betaalbaar zijn.

PFAS en andere vervuiling kunnen de afvoer van grond extreem duur maken.
Voor luxe woningen met kelder of zware constructies is een vroeg funderingsadvies essentieel.
Ontwerp en budget worden hierop afgestemd, niet andersom.', ARRAY['locatie', 'uitvoering', 'risico'], ARRAY['nieuwbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('locatie_due_diligence_bouwkavel_2025', 2, 'Bouwkavel due diligence: zo voorkom je een miskoop', 'Systematische check van juridische lasten, bodem, omgeving en bijkomende kosten vóór je tekent.', 'Een kavel bepaalt je speelveld: ontwerpvrijheid, fundering, kosten en toekomstwaarde.

Check vóór koop:
- **Juridisch:** erfdienstbaarheden, kettingbedingen, antispeculatie, zelfbewoningsplicht, gebruiksbeperkingen;
- **Planologisch:** omgevingsplan, dubbelbestemmingen, geluidzones, hoogtes, beeldkwaliteitseisen;
- **Fysiek:** bezonning, privacy, uitzicht, geluid, bereikbaarheid, waterstanden, bomen, hoogteverschillen;
- **Financieel:** onderzoeken, aansluitingen, bouwrijp maken, eventuele sanering.

Een architect helpt om deze informatie te lezen en te vertalen naar kansen, risico’s en ontwerpstrategie.', ARRAY['locatie', 'proces', 'risico'], ARRAY['nieuwbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('locatie_kenmerken', 2, 'Locatie Kenmerken Analyseren', 'Analyseer de locatie: zon, avondzon, lawaai, privacy, zichtlijnen en de logische routing voor thuiskomen, fietsen en kliko’s.', '...de kenmerken van de locatie of bestaande woning. Waar komt de zon op? Waar is het in
de avond goed vertoeven? Is er veel lawaai of verkeer in de omgeving? Hoeveel privacy is er
...
Allemaal onderdelen die de ordening van de woning op de kavel kunnen
bepalen zodat de praktische routing van thuiskomen na werk, met boodschappen of na sporten zo
logisch mogelijk is.', ARRAY['locatie', 'proces', 'ontwerp'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('locatie_nuts_netcongestie', 2, 'Nuts & netcongestie: all-electric zonder verrassingen', 'Beschikbaarheid van vermogen en aansluitingen is een harde randvoorwaarde voor moderne villa’s.', 'All-electric wonen vraagt vermogen voor warmtepomp, laadpalen, kookplaat en eventueel wellness.

Belangrijk:
- check vroegtijdig de mogelijkheden bij de netbeheerder;
- onderzoek wachttijden voor verzwaarde aansluitingen;
- beoordeel of warmtenet of hybride oplossingen spelen;
- neem aansluit- en aanlegkosten mee in het budget.

Zonder deze check kun je een duurzaam ontwerp maken dat praktisch niet uitvoerbaar is.', ARRAY['locatie', 'duurzaamheid', 'uitvoering'], ARRAY['nieuwbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('locatie_regelgeving', 2, 'Locatie & Regelgeving', 'Naast de locatiekenmerken is de regelgeving cruciaal: wat mag volgens het bestemmingsplan, wat is vergunningsvrij, en wat zijn de welstandseisen?', 'En natuurlijk is er ook regelgeving: wat mag er conform bestemmingsplan gebouwd worden, wat
zou vergunningsvrij kunnen en welke randvoorwaarden worden aan vormgeving gesteld door
welstand en of monumentencommissies. Ook kan regelgeving over archeologie of culturele
waarden beperkingen opleggen... Allemaal zaken die invloed hebben op het ontwerp en
dus ook voor de start van het ontwerp bekend moeten zijn bij alle partijen.', ARRAY['locatie', 'vergunningen'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('regelgeving_monumenten_erfgoed', 3, 'Monumenten & erfgoed: verbouwen zonder karakter te slopen', 'Werken met box-in-box, reversibiliteit en specialistische begeleiding voorkomt schade en gedoe.', 'Bij monumenten en beschermde panden gelden extra eisen.

Belangrijk:
- behoud hoofdstructuur en beeldbepalende elementen;
- gebruik waar mogelijk reversibele ingrepen;
- werk met box-in-box oplossingen voor comfort en isolatie;
- betrek monumentenadviseur en gemeente vroeg;
- onderzoek subsidiemogelijkheden en erfgoedleningen.

Dit vergt meer ontwerpintelligentie, maar levert unieke, toekomstbestendige woningen op.', ARRAY['vergunningen', 'professionals', 'risico'], ARRAY['verbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('regelgeving_omgevingswet_dso', 3, 'Omgevingswet & DSO: zo dien je slim en compleet in', 'Nieuwe spelregels vragen om betere voorbereiding, maar bieden ruimte voor goed onderbouwde plannen.', 'Onder de Omgevingswet loopt alles via het Omgevingsloket. De lat voor volledigheid ligt hoger.

Kern:
- werk met uitgewerkte tekeningen en onderbouwingen;
- stem kritische punten (hoogte, massa, beeldkwaliteit) vooraf af;
- houd rekening met formele termijnen en mogelijke verlenging;
- documenteer keuzes en bijlagen netjes: dit voorkomt discussies.

Een zorgvuldig opgebouwd dossier voelt voor gemeente en omgeving geloofwaardig en professioneel.', ARRAY['vergunningen', 'proces', 'risico'], ARRAY['nieuwbouw', 'verbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('regelgeving_participatieplicht', 3, 'Participatieplicht: zo win je de buren vóór je begint', 'Goede participatie verlaagt bezwaar-risico en versnelt de vergunning.', 'Participatie is geen formaliteit, maar strategie.

Aanpak:
- identificeer direct betrokken buren;
- licht plannen vroegtijdig toe met begrijpelijke tekeningen;
- vraag gericht naar zorgen (inkijk, schaduw, parkeren) en verwerk waar mogelijk;
- leg gesprekken vast en bundel dit in een participatieverslag.

Een serieus participatieproces laat zien dat je als opdrachtgever zorgvuldig handelt en helpt bezwaren voorkomen.', ARRAY['vergunningen', 'proces', 'risico'], ARRAY['nieuwbouw', 'verbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('regelgeving_vergunning_stappenplan', 3, 'Tactisch stappenplan voor een sterke vergunningsaanvraag', 'Van omgevingstafel tot besluit: zo bouw je aan een dossier dat in één keer overtuigt.', 'Stappen:
1. **Vooroverleg** met gemeente over hoofdvorm, maat, positie en uitstraling.
2. **Compleet ontwerp** (DO) met plattegronden, gevels, doorsneden, situatietekening.
3. **Onderbouwing**: stedenbouwkundig verhaal, materiaalstrategie, privacy, bezonning.
4. **Technische basis**: constructieve uitgangspunten, energieconcept, bodem- en funderingsinfo.
5. **Participatieverslag** en eventuele afspraken met buren.
6. **Controle op volledigheid** volgens indieningsvereisten, dan pas indienen.

Dit verkleint de kans op herstelverzoeken en verlenging aanzienlijk.', ARRAY['vergunningen', 'proces'], ARRAY['nieuwbouw', 'verbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('regelgeving_welstand_strategie', 3, 'Welstand: van tegenkracht naar bondgenoot', 'Door de welstandskaders te begrijpen kun je er strategisch binnen ontwerpen.', 'Welstand gaat over inpassing in straatbeeld en omgeving. Gemeenten hanteren niveaus:
van streng beschermd beeld tot globale toets.

Tips:
- bestudeer referentiebeelden en criteria van je gebied;
- kies een architect die gewend is aan dit type commissie;
- onderbouw ontwerp met zichtlijnen, materiaalkeuzes en relatie met de omgeving;
- presenteer helder en professioneel: dat wekt vertrouwen.

Zo wordt welstand een gesprek over kwaliteit in plaats van een blokkade.', ARRAY['vergunningen', 'ontwerp'], ARRAY['nieuwbouw', 'verbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('vergunningen_bestemmingsplan_lezen', 3, 'Hoe lees en begrijp je een bestemmingsplan?', 'Check online de regels voor uw adres (goot, nok, bouwvlak), maar lees ook de algemene hoofdstukken en definities voor afwijkingen en vrijstellingen.', 'De belangrijkste elementen zoals goothoogte, nokhoogte en bouwvlak zijn over het algemeen
eenvoudig te achterhalen in de online versie van de omgevingswet. ... Er staan echter meestal meer
randvoorwaarden dan alleen de bouwkundige vereisten: dat kan gaan over bodem, archeologie,
cultuur... die regels kunnen ook van invloed zijn...
Ook is het van belang om bij de definities goed te kijken...
En verdiep je in de mogelijkheden
voor afwijkingen van het bestemmingsplan in de BOPA regeling...', ARRAY['vergunningen', 'locatie'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('vergunningen_fouten_aanvraag', 3, 'Veelgemaakte fouten bij een vergunningaanvraag', 'Te snel indienen, bouwkosten te hoog (of laag) invullen, documenten vergeten, planning te optimistisch, en geen vooroverleg doen.', '- Te snel iets in willen dienen... en daardoor zaken over het hoofd zien...
- Denk goed na over het invullen van bouwkosten: op basis van dat bedrag worden de
legeskosten bepaald.
- het niet goed uitzoeken van alle vereisten die benodigd zijn voor een aanvraag.
- verwachten dat een vergunning wel snel verleend zal worden. Termijn is 8 weken + 6 weken verlenging + tijd voor aanvullende gegevens.
- het niet doen van vooroverleg: ...een vooroverleg erg handig.
- vergeten constructie en andere rapporten...
- inspraak: neem altijd eerst contact op met de buren...
- na het verlenen van een vergunning is er nog 6 weken de tijd voor belang hebbenden om
een bezwaar in te dienen...', ARRAY['vergunningen', 'proces'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('vergunningen_vergunningsvrij_check', 3, 'Hoe weet je of je vergunningsvrij kunt bouwen?', 'Check online de regels, maar let op: bestaande bijgebouwen tellen mee, check beschermd dorpsgezicht, en het gebruik (geen verblijfsruimte > 4m).', 'Online is er duidelijke documentatie beschikbaar... Toch kunnen er specifieke situatie zijn...
Aandachtspunten bij vergunningsvrij bouwen:
- bekijk goed wat bij de woning aangeduid is als hoofdgebouw...
- bekijk of de woning niet valt binnen een rijksbeschermd dorpsgezicht...
- is de woning een monument? dan is er meestal erg weinig mogelijk...
- let op het gebruik van de ruimtes: alleen de vergunningsvrije ruimtes binnen 4 meter van
het hoofdgebouw mogen gebruikt worden als verblijfsruimte...
- een kelder, verdieping of dakterras zijn nooit toegestaan.
- vergunningsvrij bouwen op de erfgrens is meestal mogelijk, houd wel goed rekening met de
toegestane hoogtes... en overleg uiteraard altijd eerst met de buren...', ARRAY['vergunningen'], ARRAY['verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('budget_financiering_bouwdepot_energielabel', 4, 'Financiering: bouwdepot, fasering en energievoordeel', 'Een goed plan houdt rekening met bouwdepot, cashflow en effect van energielabel op leencapaciteit.', 'Belangrijke punten:
- **Bouwdepot:** geld wordt in termijnen uitgekeerd op basis van facturen; zorg dat planning en depotvoorwaarden aansluiten.
- **Overbrugging:** bij verkoop/nieuwbouw-situaties tijdig afstemmen met adviseur.
- **Energieprestaties:** betere energieprestatie kan extra leencapaciteit opleveren; benut dat voor slimme maatregelen.

Laat financiering en ontwerp elkaar versterken in plaats van tegenwerken.', ARRAY['financien'], ARRAY['nieuwbouw', 'verbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('budget_isde_subsidies_2025', 4, 'ISDE & subsidies: kansen benutten zonder erop te leunen', 'Subsidies voor isolatie en warmtepompen helpen, maar je plan moet ook zonder kunnen kloppen.', 'De ISDE en andere regelingen bieden steun voor warmtepompen, isolatie en andere maatregelen.
Bedragen en voorwaarden wijzigen regelmatig (check altijd de actuele RVO-informatie). :contentReference[oaicite:0]{index=0}

Advies:
- gebruik subsidies als bonus, niet als randvoorwaarde voor haalbaarheid;
- verwerk ze niet als harde korting in de basisbegroting;
- controleer vóór aanschaf of systemen en uitvoerders aan de eisen voldoen.

Zo blijft je project financieel robuust.', ARRAY['financien', 'duurzaamheid'], ARRAY['nieuwbouw', 'verbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('budget_m2_prijzen_segmenten', 4, 'Indicatieve m²-prijzen luxe woningbouw', 'Bandbreedtes voor standaard, luxe en premium helpen verwachtingen kalibreren.', 'Bouwkosten per m² zijn geen exacte wetenschap, maar bieden richting.

Als grove orde (exclusief grond en incl. btw, indicatief):
- **Functioneel / degelijk:** ca. €2.200–€2.800 per m² BVO;
- **Luxe particulier:** ca. €2.800–€3.500+ per m²;
- **High-end / maatwerk / kelder / specials:** vaak €3.500–€4.500+ per m².

Exacte bedragen hangen af van locatie, ontwerpcomplexiteit, materiaalniveau, installaties en markt.
Gebruik deze cijfers als reality check, niet als vaste prijslijst. Voor actuele stand: raadpleeg marktdata,
CBS en recente offertes.', ARRAY['financien'], ARRAY['nieuwbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('budget_stichtingskosten_stiko', 4, 'Stichtingskosten: het complete kostenplaatje', 'Van grond tot inrichting: één structuur om niets te vergeten.', 'Stichtingskosten omvatten:
- grond en bijkomende kosten;
- onderzoeken, leges, kwaliteitsborging (Wkb), advies;
- bouwkundige werk, installaties, meerwerkopties;
- nuts, terrein, tuin, keukens, sanitair;
- financieringskosten, reservering onvoorzien.

Door alles in een STIKO-structuur te zetten, koppel je ontwerpkeuzes direct aan hun financiële impact
en voorkom je dat “vergeten posten” later voor spanningen zorgen.', ARRAY['financien', 'proces'], ARRAY['nieuwbouw', 'verbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('budget_verborgen_kosten_wkb_leges_onderzoeken', 4, 'Verborgen kosten: Wkb, leges en onderzoeken', 'Kwaliteitsborger, leges en verplichte onderzoeken zijn vaste posten, geen sluitpost.', 'Naast bouw en ontwerp zijn er onmisbare posten:

- **Kwaliteitsborger (Wkb)** voor gevolgklasse 1-projecten;
- **Leges** op basis van opgegeven bouwsom;
- **Onderzoeken:** bodem, sonderingen, geluid, flora/fauna, asbest, etc.;
- **Aansluitkosten nuts** en eventuele verzwaring.

Reserveer hiervoor vanaf de start een realistische bandbreedte.
Deze posten zijn juridisch en technisch nodig en horen niet in de categorie “zien we later wel”.', ARRAY['financien', 'risico'], ARRAY['nieuwbouw', 'verbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('financien_besparen_offerte', 4, 'Besparen: Strategisch Offertes Aanvragen', 'Vraag een offerte aan voor een kleinere variant; een meter *toevoegen* is vaak goedkoper dan een meter *weghalen* als bezuiniging.', 'Soms kan het daarom ook handig zijn om bij een offerteaanvraag juist een wat kleinere variant aan
te vragen. Dat zal meer ruimte geven in de begroting maar ook strategisch kan dat handig zijn: een
aannemer vragen om de uitbouw een meter breder te maken zal waarschijnlijk niet zo veel extra
kosten. Maar dezelfde aannemer vrage om in het kader van bezuinigingen de uitbouw een meter
kleiner te maken zal waarschijnlijk de reactie geven dat dat allemaal niet zo veel uitmaakt. Maak
hier dus handig gebruik van.', ARRAY['financien', 'uitvoering', 'professionals'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('financien_besparen_ontwerp', 4, 'Besparen: Slim Ontwerpen', 'De belangrijkste besparing zit in het ontwerp: slimme indeling, materiaalkeuze, positionering en het voorkomen van dure technische oplossingen.', 'De belangrijkste besparing begint bij het ontwerpproces: hoe kan je slim gebruik maken van de
zaken die er al zijn? Kun je een doorbraak ergens maken die een ruimte opeens transformeert? De
woning zodanig positioneren op het perceel... Openingen in gevels maken op plekken waar de zonbelasting minder is...
Het besparen in een later stadium is erg lastig.', ARRAY['financien', 'ontwerp'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('financien_budget_opstellen_basis', 4, 'Hoe stel je een eerste budget op?', 'Het opstellen van een budget begint met het bepalen van de totale financiële ruimte en het opzetten van een stichtingskostenbegroting.', 'Bij het opschrijven van de wensen hoort natuurlijk ook bij van hoeveel je uit wil geven aan de
verbouw of nieuwbouw van de woning. Het is van belang om te weten welke ruimte er financieel is
zodat iemand die iets gaat bedenken ook een plan presenteert wat financieel haalbaar is. Niks zo
frustrerend als een droomkasteel gepresenteerd krijgen wat in een volgende fase eigenlijk totaal
niet haalbaar blijkt.
...
Probeer zo duidelijk mogelijk te omschrijven wat de verwachtingen zijn over het uitgeven van een
budget en wat er wel of niet in het budget zou moeten zitten.
...
Begin dus met bepalen van een bedrag wat je uit wilt en uit kunt geven. Vanuit dat bedrag kan je
een opzet gaan maken voor alle kosten die komen kijken bij de nieuwbouw of verbouw.', ARRAY['financien', 'proces'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('financien_budget_opstellen_verbouw', 4, 'Specifiek budget voor Verbouw', 'Bij oudere woningen gaat een groot deel van het budget op aan de basis: isolatie, installaties en fundering, nog vóórdat de uitbreiding begint.', 'Zeker bij oudere woningen moet er alleen al om de basis goed te krijgen behoorlijk geïnvesteerd
worden zodat energiezuinigheid en comfort verbeterd worden. Het isoleren van vloer, gevel en dak
en eventueel vervangen van kozijnen en beglazing kunnen al een behoorlijk onderdeel van het
budget wegnemen. En vaak zijn ook installaties voor verwarrming, ventilatie en electra verouderd
en is ook daar vervanging de enige optie. Pas als die zaken op orde zijn is het pas zinnig om na te
gaan denken over uitbreiding van de woning.', ARRAY['financien', 'uitvoering'], ARRAY['verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('financien_kwaliteitsborger_wkb', 4, 'Verborgen Kosten: Kwaliteitsborger (Wkb)', 'De Wet kwaliteitsborging (Wkb) verplicht een kwaliteitsborger, een extra kostenpost van circa €8.000-€15.000.', 'bij nieuwbouw van een woning is tegenwoordig een kwaliteitsborger verplicht. Deze moet
door de opdrachtgever ingehuurd worden en heeft gedeeltelijk de controlerende taak van
de gemeente overgenomen. ... Een hele andere inrichting van het
proces dus in daardoor ook een extra kostenpost van circa €15000 waar rekening mee
gehouden moet worden.', ARRAY['financien', 'vergunningen', 'uitvoering'], ARRAY['nieuwbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('financien_legeskosten', 4, 'Verborgen Kosten: Legeskosten Gemeente', 'Leges kunnen oplopen tot 4% van de bouwsom. Dit is een substantiële verborgen kostenpost waar u rekening mee moet houden.', 'legeskosten van gemeentes zijn vaak behoorlijk hoog In de legesverordening van de
gemeente is op internet te vinden hoe hoog die zijn voor de bouw of verbouw van een
woning. ... Op basis van die bouwsom worden de legeskoten bepaald... Dat kan soms
verrassend hoge rekeningen opleveren. ... kan soms oplopen tot ruim 4% van de bouwsom. Houd er ook
rekening mee dat het afwijken van het bestemmingsplan op basis van bijvoorbeeld de
BOPA regeleing ook extra kosten met zich meebrengt. ... Dat kunnen dan
standaard bedragen van rond de €5000 zijn.', ARRAY['financien', 'vergunningen'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('financien_meerwerk_werking', 4, 'Hoe werken stelposten en meer-/minderwerk?', 'Hoe stelposten werken en waarom een aannemer met veel stelposten een financieel risico vormt. Goedkoop is dan duurkoop.', 'Tijdens de voorbereiding van een bouwproject zullen er altijd een aantal zaken nog niet helemaal
duidelijk zijn... daarom worden er stelposten opgenomnen. ... Het is natuurlijk
verleidelijk om dat soort posten laag in te zetten, zeker voor aannemers. ...
Door veel stelposten op te nemen bouwt een
aannemer eigenlijk gratis ruimte in om de kosten later te verhogen. ...
Een offerte moet dus zo specifiek mogelijk zijn
om die verrassingen te voorkomen.', ARRAY['financien', 'uitvoering', 'professionals'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('financien_onvoorziene_post_verbouw', 4, 'Verborgen Kosten: Post Onvoorzien (Verbouw)', 'Zeker bij verbouw zijn er altijd onvoorziene zaken (constructie, installaties). Een substantiële post onvoorzien is essentieel.', 'het verduurzamen van bestaande woningen die verbouwd moeten gaan worden: vaak
worden er bij de start van het sloopwerk allerlei zaken ontdekt die anders zijn dan op
tekening of in eerste instantie zo leken te zijn. Dat kan qua constructie, installatie of
kwaliteit van bouwkundige onderdelen. Houd dus zeker bij verbouw altijd een post
onvoorzien aan en maark die substantieel onderdeel van de begroting', ARRAY['financien'], ARRAY['verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('financien_participatie', 4, 'Verborgen Kosten: Verplichte Participatie', 'Participatie van omwonenden is verplicht. Dit kan leiden tot vertraging en extra kosten voor rapporten om bezwaren te weerleggen.', 'verplichte participatie: een onderdeel van de omgevingswet en dus vergunningsproceduren
is tegenwoordig ook de participatie van omwonenden. ... In de praktijk zijn gemeente uitermate voorzichtig
geworden met het verlenen van vergunningen... en dat kan dus leiden tot
de verplichting tot het maken van allerlei rapporten die normaal gesproken niet zo snel
onderdeel zouden zijn van de vereisten.', ARRAY['financien', 'vergunningen', 'proces'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('financien_stelposten_valkuil', 4, 'Valkuil: Te optimistische stelposten', 'Stelposten (keuken, badkamer) zijn vaak te laag ingeschat om een offerte aantrekkelijk te maken. Dit leidt gegarandeerd tot meerwerk.', 'te optimistische stelposten in begrotingen opnemen; neem realistische bedragen op of
vraag bij professionals na welke bedragen reel zijn. Als stelposten tegenvallen in de bouw
is er geen weg meer terug..,', ARRAY['financien', 'uitvoering', 'professionals'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('financien_verplichte_onderzoeken', 4, 'Verborgen Kosten: Verplichte Onderzoeken', 'Kosten voor verplichte onderzoeken zoals asbestinventarisatie, bodemonderzoek, archeologie, flora & fauna, en geluidsbelasting.', 'kosten voor allerlei veprlichte onderzoeken die kunnern voortkomen uit vereisten vanuit het
bestemmingsplan. Dat kunnen voor dehand liggende zaken zijn als een
asbestinventarisatie onderzoek... (verplicht bij gebouewn voor 1994...). of een
bodemonderzoek wat verplicht gesteld wordt ivm verontreiniging of archeologisch
waardevolle gebieden... Ook kunnen flora en fauna onderzoeken kostbaar zijn...
Geluidsbelasting van bestaande wegen... Of bezonningsstudies...', ARRAY['financien', 'locatie', 'vergunningen'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('ontwerp_akoestiek', 5, 'Aandachtspunt: Akoestiek (Harde materialen)', 'Moderne inrichtingen (gietvloer, tegels, geen gordijnen) klinken hol. Overweeg een akoestisch plafond (stuc op isolatieplaten) voor comfort.', 'Een onderwerp wat vaak vergeten wordt... de
akoestiek van een ruimte. Vloeren worden steeds vaker uitgevoerd in tegelwerk of als gietvloer...
Gordijnen worden vervangen door
lamellen... Wat overblijft zijn vaak ruimtes die weinig absorberend vermogen hebben voor
geluid...
Bijvoorbeeld door het aanbrengen van een akoestisch plafond: hierbij wordt er stucwerk
aangebracht op isolatieplaten... Qua uitstraling vrijwel geen verschil met
regulier stucwerk maar qua comfort een wereld van verschil.', ARRAY['uitvoering', 'ontwerp'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('ontwerp_beng_biobased_circulair', 5, 'BENG, biobased & circulair: wat betekent dat concreet?', 'Eisen aan energie, isolatie en materiaalgebruik vormen het nieuwe normaal.', 'Nieuwbouw moet voldoen aan BENG-eisen voor energiebehoefte, primair verbruik en hernieuwbare energie. :contentReference[oaicite:1]{index=1}
Dat betekent:
- goede isolatie (hoge Rc-waarden),
- luchtdicht bouwen met gecontroleerde ventilatie,
- inzet van hernieuwbare bronnen.

Biobased en circulair bouwen (bijv. houtconstructies, herbruikbare elementen) winnen terrein:
ze verlagen milieu-impact en kunnen esthetisch én comfortabel zijn.
Belangrijk is integrale afweging: techniek, regelgeving, comfort en uitstraling in samenhang.', ARRAY['ontwerp', 'duurzaamheid', 'uitvoering'], ARRAY['nieuwbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('ontwerp_biofilie_wellness', 5, 'Biofilie & wellness: wonen als dagelijks herstel', 'Licht, lucht, groen en stilte zijn ontwerpkeuzes, geen afterthought.', 'Elementen:
- zicht op groen en hemel vanuit kernruimtes;
- daglicht als leidraad voor plattegrond;
- akoestische rustplekken;
- wellness-ruimtes (bad, sauna, fitness) logisch ingepast;
- natuurlijke materialen waar je ze aanraakt.

Deze keuzes verhogen comfort en gezondheid en maken het huis toekomstbestendiger dan alleen “meer meters”.', ARRAY['ontwerp', 'duurzaamheid'], ARRAY['nieuwbouw', 'verbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('ontwerp_domotica_knx_smart', 5, 'Domotica & KNX: slim huis zonder gedoe', 'Professionele systemen vragen vroeg ontwerp, consumentensystemen vragen discipline. Combineer slim.', 'Een smart home staat of valt met structuur.

Opties:
- **Professioneel (bijv. KNX):** bekabeld, stabiel, schaalbaar; vraagt vroeg ontwerp;
- **Consumentensystemen:** snel en flexibel, maar versnipperd en minder betrouwbaar op lange termijn.

Richtlijnen:
- bepaal scenario’s (licht, klimaat, beveiliging, zonwering);
- reserveer techniekruimte en infrastructuur;
- zorg dat esthetiek en bediening intuïtief blijven.

Zo blijft techniek dienend in plaats van dominant.', ARRAY['ontwerp', 'tools'], ARRAY['nieuwbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('ontwerp_duurzaamheid_basis', 5, 'Wat is een duurzaam en toekomstbestendig ontwerp?', 'Duurzaamheid is meer dan isolatie. Het is een flexibel ontwerp dat meegroeit, slimme oriëntatie (passieve zonnewarmte) en duurzaam materiaalgebruik (zoals HSB).', 'Duurzaamheid is te vertalen op allerlei manieren, niet alleen op een goede isolatie'':
- Het begint met een goed ontwerp. een goed ontwerp is een ontwerp wat in de loop van de
tijd zijn waarde behoudt en eventueel aangepast kan worden...
- Ook is er bij het maken van een ontwerp ook rekening te houden met opwarming van de
woning: het maken van strategische overstekken voorkomt teveel opwarming in de zomer...
- duurzaamheid heeft ook te maken met het gebruik van materiaal... een geprefabriceerd
houtskeletbouw huis is iets wat we steeds vaker gaan zien.
- ook de gevelafwerking moet duurzaam zijn qua materiaal maar vooral ook qua onderhoud.', ARRAY['ontwerp', 'duurzaamheid'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('ontwerp_duurzaamheid_installaties', 5, 'Duurzaamheid: Installaties (Warmtepomp & Koeling)', 'Installaties (warmtepomp) hebben alleen zin als de schil (isolatie) op orde is. Een warmtepomp kan ook duurzaam koelen via de bodem.', 'installatietechnisch moet er ook rekening gehouden worden met duurzaamheid. Dat start
met het zorgen dat de bouwkundige schil op orde is... Een warmtepomp aanbrengen in een woning die nooit goed te
isoleren is is namelijk onzinnig. ...
Bij nieuwbouw is het allemaal
niet zo spannend... Daar is koeling van de woning vaak de bottleneck...
Een warmtepomp heeft de mogelijkheid
om te koelen via de vloerverwarming... Overigens is het koelen met de warmtepomp in de zomer ook juist
duurzaam: de warmte die uit de woning getrokken wordt verdwijnt weer de bodem in...', ARRAY['ontwerp', 'duurzaamheid', 'uitvoering'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('ontwerp_lichtplan', 5, 'Aandachtspunt: Lichtplan', 'Maak een lichtplan *voordat* de bouw start. Het gaat niet om de lampen, maar om *waar* het licht moet komen (basis, sfeer, functioneel).', 'een lichtplan laten maken is meestal niet iets wat onderdeel is van de eerste plannen...
Een strategisch geplaatste simpele spot kan een ruimte in de
avond transformeren...
Het gaat tenslotte niet
om wat voor soort lampen er moeten komen maar juist over waar moet wat voor soort licht komen.
...
Dat bepaald sfeer en zorgt voor voldoende licht op de plekken waar het
nodig is. Denk dan bijvoorbeeld aan functionele verlichting op werkplekken...', ARRAY['uitvoering', 'ontwerp'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('ontwerp_slim_advies_warmtepomp', 5, 'Slimme Oplossing: Advies Warmtepomp', 'Laat een transmissieberekening maken *voordat* u een warmtepomp kiest. Een te lichte pomp gaat elektrisch bijstoken en is extreem duur in verbruik.', 'Laat je bij het verduurzamen van een woning goed adviseren en ga niet zomaar in zee met de
goedkoopste aanbieder van bijvoorbeeld een warmtepomp Het succes van die nieuwe intallatie
hangt af van een grondige analyse... Er moet onderzocht worden wat de
isolatiewaarden... zijn. Op basis daarvan
kan een transmissieberekening gemaakt worden. ...en daarmee kan de capaciteit van de warmtebehoefte
berekend worden. En dat moet de basis zijn voor het kiezen van een installatieconcept...', ARRAY['ontwerp', 'duurzaamheid', 'uitvoering', 'financien'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('ontwerp_slim_daglicht_aanbouw', 5, 'Slimme Oplossing: Pas op met Daglicht bij Aanbouw', 'Een grote aanbouw maakt de bestaande woning donker. Een kleinere ruimte met goed daglicht heeft meer kwaliteit. Overweeg daklichten (op het noorden) of Solatubes.', 'Houd bij aanbouwen rekening met het feit dat het uitbreiden van een woonlaag met extra m2
invloed heeft op de bestaande ruimtes. Met name daglicht zal dan heel anders worden. Een hele
grote ruimte waarbij een groot deel weinig daglicht krijgt heeft minder kwaliteit dan een kleinere
ruimte met goed daglicht en contact met buiten. Daklichten kunnen daar een oplossing voor zijn
maar deze hebben dan weer het grote nadeel dat als ze op de zon georiënteerd zijn ze ook erg
veel warmte doorlaten... Bij een orientatie op het noorden geen enkel probleem... Of kiezen voor bijvoorbeeld een solatube...', ARRAY['ontwerp', 'duurzaamheid'], ARRAY['aanbouw', 'verbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('ontwerp_slim_kleine_ruimtes', 5, 'Slim omgaan met kleine ruimtes', 'Een kleine ruimte kan groots aanvoelen door juist gebruik van daglicht en contact met buiten. Een te grote, donkere ruimte heeft minder kwaliteit.', 'Een kleine ruimte kan zeer ruimtelijk voelen door een juist gebruik van daglicht en contact met
buiten. Vaak is het zelfs beter om ruimtes niet te groot te maken omdat er een omslagpunt is
waarbij een grote ruimte teveel plekken gaat krijgen die in de praktijk te donker worden en dus
resulteren in het feit dat er altijd een lamp aan moet om het licht goed te krijgen.', ARRAY['ontwerp'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('ontwerp_slim_praktisch', 5, 'Veelgemaakte Fouten: Praktische zaken vergeten', 'Denk na over de "rommel": waar laat u jassen, tassen, schoenen, sportspullen? Een goede berging en logische routing voorkomen dagelijkse ergernis.', 'Niet goed nadenken over praktische gang van zaken: bij de meeste gezinnen met kinderen is het
zo dat jassen, tassen, schoenen, sportspullen, fietsen e.d. op plekken achtergelaten worden waar
dit het meeste gemak oplevert. En dat is vaak ergens in de gang of voor een deur. En dat levert
dan dus rommel en ergernis op. Bedenk dus bij het maken van een plattegrond goed hoe de
dagelijkse dingen gedaan gaan worden...', ARRAY['uitvoering', 'ontwerp', 'proces'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('ontwerp_slim_verbouw_vs_nieuwbouw', 5, 'Slimme Oplossing: Verbouw vs. Nieuwbouw indienen', 'Onderzoek of u een project als "verbouw" kunt indienen i.p.v. "nieuwbouw". Dit geeft flexibiliteit in BENG-eisen en een eventuele gasaansluiting.', '...tussen het gaan verbouwen van een
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
als verbouwing ingediend kan worden en niet als nieuwbouw.', ARRAY['ontwerp', 'vergunningen', 'proces', 'duurzaamheid'], ARRAY['verbouw', 'nieuwbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('ontwerp_stijlkeuzes_vergeleken', 5, 'Stijlkeuzes: modern, schuurwoning, nieuwe klassiek, loft', 'Elke stijl heeft impact op budget, detaillering en vergunning. Begrijp de consequenties.', 'Populaire richtingen:
- **Modern minimalistisch:** vlakke daken, grote glasvlakken, strakke details; hogere eisen aan uitvoering en budget.
- **Schuurwoning:** herkenbare kap, warme materialen, vaak gunstige verhouding tussen expressie en kosten.
- **Nieuwe klassiek / jaren 30:** rijke details, metselwerk, dakoverstekken; arbeidsintensiever, dus duurder.
- **Loft / industrieel:** grote open ruimtes, zichtbare constructie; vraagt om doordachte techniek en akoestiek.

Kies niet alleen met het oog, maar ook met verstand van onderhoud, kosten en welstandskader.', ARRAY['ontwerp'], ARRAY['nieuwbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('ontwerp_wonen_op_maat', 5, 'Ontwerpen vanuit levensstijl in plaats van kamerlabels', 'Begin bij je ritme, zichtlijnen en routines; niet bij vakjes “slaapkamer 1,2,3”.', 'Een sterk ontwerp volgt jouw dagelijks leven:
- waar je wakker wordt en wat je ziet;
- hoe je kookt, werkt, sport, leeft met kinderen of gasten;
- welke spullen en hobbies ruimte vragen.

Door eerst leefpatronen te schetsen en daarna plattegronden te tekenen,
ontstaat een huis dat klopt zonder “dode” kamers.', ARRAY['ontwerp', 'proces'], ARRAY['nieuwbouw', 'verbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('professionals_aanbesteding_vs_bouwteam', 6, 'Traditionele aanbesteding of bouwteam?', 'Kies tussen scherp concurreren op prijs of vroeg samenwerken op inhoud.', 'Twee hoofdmodellen:
- **Traditioneel:** volledig uitgewerkt pakket, meerdere aannemers offreren; goede prijsvergelijking, maar weinig vroegtijdige betrokkenheid.
- **Bouwteam:** één aannemer vanaf VO/DO aan tafel; gezamenlijke optimalisatie, open begroting, minder frictie.

Voor complexe of luxe maatwerkprojecten is een bouwteam vaak verstandiger. Voor eenvoudige, goed definieerbare plannen
kan traditioneel nog prima werken.', ARRAY['professionals', 'proces'], ARRAY['nieuwbouw', 'verbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('professionals_bouwbegeleiding', 6, 'Hoeveel bouwbegeleiding (controle) is nodig?', 'Afhankelijk van de complexiteit en de voorbereiding, maar gemiddeld is elke 3 weken overleg voldoende. Vertrouw op uw architect voor de begeleiding.', 'Dit is afhankelijk van een aantal belangrijke factoren:
- ken je de aannemer goed...
- hoe goed was de voorbereiding...
- hoe ingewikkeld is de verbouw of nieuwbouw...
Bij een goede voorbereiding zou gemiddeld om de drie weken op de bouw met aannemer,
onderaannemer en opdrachtgever overleggen voldoende moeten zijn. ...
Het meest comfortabel is natuurlijk begeleiding van eerste kennismaking tot aan oplevering van de
woning. ... de
expertise van de architect niet alleen het maken van een ontwerp is maar er ook voor te zorgen dat
het ontwerp op de juiste manier zonder zorgen en verrassingen gebouwd gaat worden.', ARRAY['professionals', 'uitvoering', 'proces'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('professionals_bouwbegeleiding_en_toezicht', 6, 'Bouwbegeleiding & toezicht: wie kijkt er voor jou mee?', 'Onafhankelijke controle voorkomt ruzie en garandeert dat je krijgt wat is afgesproken.', 'Opties:
- architect verzorgt esthetisch en technisch toezicht;
- externe bouwbegeleider controleert kwaliteit, planning en kosten;
- combinatie, afhankelijk van schaal en complexiteit.

Dit levert:
- minder discussie op de bouw;
- tijdige signalering van fouten;
- duidelijk vastgelegde afspraken.

De kosten verdienen zich vaak terug via voorkomen herstelwerk en meerwerk.', ARRAY['professionals', 'uitvoering', 'risico'], ARRAY['nieuwbouw', 'verbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('professionals_conflicten_mediation_rva', 6, 'Conflicten oplossen: van gesprek tot Raad van Arbitrage', 'Ken de routes: eerst praten, dan mediation, pas daarna juridische stappen.', 'Bij serieuze geschillen:
1. direct gesprek en feiten op tafel;
2. onafhankelijke deskundige of mediator;
3. formele procedure (bijv. Raad van Arbitrage voor de Bouw of civiele rechter, afhankelijk van contract).

Een goed dossier, duidelijke afspraken en verslaglegging van bouwvergaderingen zijn hierbij essentieel.', ARRAY['professionals', 'risico'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('professionals_conflicten_voorkomen', 6, 'Hoe voorkom je conflicten met de aannemer?', 'Heldere afspraken, een complete tekeningenset, een realistische planning, en het minimaliseren van stelposten zijn de sleutel tot een stressvrij proces.', 'Discussies en conflicten, daar zit niemand op te wachten. ... Dat wil je
voorkomen door te zorgen dat er duidelijke tekeningen en afspraken op papier staan. ...
Planning is ook een belangrijk item: maak heldere afspraken over de duur van de bouw...
beter een realistische planning dan een planning die bedacht is om naar de mond van de
opdrachtgever te praten. ...
Beperk het aantal stelposten zoveel mogelijk.', ARRAY['professionals', 'uitvoering', 'proces'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('professionals_contracten_uav', 6, 'Contracten & UAV: spelregels vooraf vastleggen', 'Heldere contracten met verwijzing naar UAV beperken interpretatieruimte.', 'Een goed contract:
- verwijst naar passende voorwaarden (bijv. UAV 2012);
- beschrijft scope, tekeningen, kwaliteitsniveau en planning;
- regelt meer- en minderwerkprocedure;
- legt betalingsschema vast op basis van voortgang;
- benoemt hoe met vertraging en gebreken wordt omgegaan.

Dit geeft houvast als er discussie ontstaat.', ARRAY['professionals', 'risico', 'proces'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('professionals_keuze_aannemer_constructeur', 6, 'Hoe kies je een aannemer of constructeur?', 'Een constructeur wordt vaak via de architect gevonden. Een goede aannemer vindt u via referenties, keurmerken (BouwGarant) en het netwerk van uw architect.', 'Een constructeur vinden is vaak niet nodig: de architect heeft over het algemeen meerdere
constructeurs waar hij mee samenwerkt...
Een aannemer vinden kan op veschillende manieren; belangrijk is in ieder geval om mensen om je
heen te vragen naar goede ervaringen... Een voorbeeld daarvan is bouwgarant. Zoek
vooral naar referenties...
En natuurlijk is de rol van de architect hierin ook van groot belang...', ARRAY['professionals', 'proces'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('professionals_keuze_architect', 6, 'Hoe kies je een architect?', 'Het kiezen van een architect is persoonlijk. Kijk online of de stijl u aanspreekt, maar het allerbelangrijkste is de persoonlijke "klik".', 'Natuurlijk is het best spannend om met een architect een woning te bedenken...
Het ontwerpen en (ver)- bouwen van een huis is een intensief, persoonlijk en langdurig proces. Het
is dan ook van groot belang dat het ''klikt'' tussen opdrachtgever en architect. ...
En dus ook heel belangrijk dat, als je tijdens een ontwerpproces merkt dat het stroef gaat... je tijdig de knoop doorhakt om te stoppen...', ARRAY['professionals', 'proces'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('professionals_misverstanden_architect', 6, 'Misverstanden over de rol van de architect', 'Twee misverstanden: 1. "Een architect is duur" (maar verdient zichzelf terug). 2. "Een architect is eigenwijs" (een goede architect is een teamlid).', 'Waarschijnlijk de meest voorkomende is dat een architect inhuren erg duur is. ... de investering daarin
verdient zich snel terug door een gestructureerder proces, een beter ontwerp en een proces
zonder verrassingen.
...
Een ander misverstand is de eigenwijsheid van een architect... bij dat soort samenwerkingen is denk ik al snel duidelijk dat het
eenrichtingsverkeer is, snel afkappen dus en op zoek naar iemand die wel als teamlid kan
functioneren.', ARRAY['professionals', 'proces', 'financien'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('professionals_offerte_eisen', 6, 'Wat moet er in een offerte van een aannemer staan?', 'Een offerte moet specifiek zijn. Onduidelijkheden en te veel stelposten leiden tot conflicten en meerwerk. Het moet duidelijk omschrijven *wat* er gedaan wordt.', 'Een offerte van een aannemer moet vooral duidelijk alle werkzaamheden aangeven die
opgenomen zijn in de totaalsom van de begroting. Problemen ontstaan vaak door verkeerde
verwachtingen...
De klassieke manier om een bouwproces vervelend te krijgen:
verrassingen die zorgen voor extra kosten. ...
Een offerte moet dus zo specifiek mogelijk zijn
om die verrassingen te voorkomen.', ARRAY['professionals', 'uitvoering', 'financien'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('professionals_offerte_opbouw', 6, 'Opbouw van een aannemersbegroting', 'Een offerte bestaat uit: algemene kosten, CAR-verzekering, bouwkundige onderdelen (casco), afwerking, installaties, stelposten, winst/risico, en coördinatiekosten.', 'Normaal gesproken is een offerte van een aannemer als volgt opgebouwd:
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
- algemene voorwaarden...', ARRAY['professionals', 'financien'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('professionals_offerte_vergelijken', 6, 'Hoe vergelijk je offertes van aannemers?', 'Vraag altijd om een *gespecificeerde* begroting. Alleen dan kunt u zien of posten vergeten zijn, of de algemene kosten te hoog zijn, en of er veel risicovolle stelposten in zitten.', 'Er kunnen soms grote verschillen zijn tussen aanbiedingen van aannemers. ...
De enige manier om offertes van aannemers goed te kunnen vergelijken is als ze een
gespecificeerde begroting aanleveren...
Daar moet ook instaan of en tot
wanneer de aanbieding prijsvast is: als er staat dat bepaalde onderdelen verrekenbaar zijn tijdens
de bouw dan zal dit een groot risico gaan zijn.
...
En natuurlijk moet per onderdeel helder omschreven staat wat de werkzaamheden zijn en wat er
geleverd wordt.', ARRAY['professionals', 'uitvoering', 'financien'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('professionals_rol_architect', 6, 'Architect als regisseur van kwaliteit en risico', 'Meer dan een mooi plaatje: proces, regels, budget en coördinatie.', 'De architect:
- vertaalt wensen naar een helder PvE en ontwerp;
- toetst aan regels en omgeving;
- schakelt constructeur en adviseurs aan;
- bewaakt samenhang tussen techniek, esthetiek en budget;
- ondersteunt bij vergunning en selectie van aannemer.

Voor particuliere opdrachtgevers is deze rol essentieel om fouten en vertraging te voorkomen.', ARRAY['professionals', 'proces'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('professionals_selectie_financiele_check', 6, 'Aannemer selecteren: meer dan de laagste prijs', 'Check reputatie, organisatie én financiële gezondheid om faillissementsrisico te beperken.', 'Let bij selectie op:
- referenties van vergelijkbare projecten;
- kwaliteit van eerdere werken;
- transparantie in offerte en communicatie;
- continuïteit van het bedrijf (jaarrekeningen, kredietinformatie, signalen uit de markt);
- beschikbaarheid van vast aanspreekpunt op de bouw.

Een iets duurdere maar solide partij is vaak goedkoper dan een goedkope aannemer die het niet redt.', ARRAY['professionals', 'risico', 'financien'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('duurzaamheid_klimaatadaptief_bouwen', 7, 'Klimaatadaptief bouwen: hitte, water en groen', 'Bescherm je woning tegen hitte en water door slimme ontwerp- en buitenruimtekeuzes.', 'Maatregelen:
- zonwering, luifels, buitenzonwering en oriëntatie tegen oververhitting;
- groene daken, bomen en pergola’s voor koelte;
- infiltratievoorzieningen (wadi, kratten, grindstroken) voor regenwater;
- voldoende afschot en geen kwetsbare functies in laagste niveau zonder bescherming.

Dit voorkomt toekomstig comfortverlies en schades en sluit aan bij gemeentelijke ambities.', ARRAY['duurzaamheid', 'uitvoering'], ARRAY['nieuwbouw', 'verbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('techniek_bouwfysica_beng_rc_luchtdichtheid', 7, 'Bouwfysica basics: Rc-waarden, BENG en luchtdichtheid', 'Goede schil en luchtdichte bouw zijn randvoorwaarde voor comfort en energieprestatie.', 'Belangrijke begrippen:
- **Rc-waarde:** warmteweerstand van dak, gevel, vloer; hogere waarden = minder verlies.
- **BENG:** eisen voor energiebehoefte, primair gebruik en aandeel hernieuwbare energie;
- **Luchtdichtheid:** voorkomt tocht en ongecontroleerde verliezen; vraagt zorgvuldige uitvoering en vaak blowerdoortest.

Een goed doordachte schil maakt installaties kleiner, het huis comfortabeler en energiekosten lager.', ARRAY['uitvoering', 'duurzaamheid'], ARRAY['nieuwbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('tools_bim_ai_digital_twin', 7, 'BIM, AI & digital twins: slimmer ontwerpen en bouwen', 'Digitale modellen maken clashes zichtbaar en geven opdrachtgevers meer grip.', '- **BIM:** integraal 3D-model waarin architect, constructeur en installateur samenwerken; minder kans op botsingen.
- **AI-tools:** helpen scenario’s vergelijken, visualisaties maken, maar vervangen geen vakmanschap.
- **Digital twins:** digitale kopie van gebouw voor beheer en monitoring, vooral interessant bij grotere projecten.

Voor particuliere villaprojecten is BIM vaak al zeer zinvol; AI kan ondersteunen bij keuzes en visualisaties.', ARRAY['tools', 'uitvoering'], ARRAY['nieuwbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('tools_checklist_kavel', 7, 'Checklist aankoop bouwkavel', 'Compacte checklist om alle kritische punten van een kavel te beoordelen.', 'Onderwerpen:
- juridische status en lasten;
- omgevingsplan, kavelpaspoort, dubbelbestemmingen;
- bodem, fundering, water en PFAS-risico;
- bezonning, privacy, geluid, bereikbaarheid;
- nutsvoorzieningen en netcongestie;
- globale kosteninschatting van noodzakelijke maatregelen.

Deze checklist vormt de basis voor een digitale Brikx-tool.', ARRAY['tools', 'locatie', 'risico'], ARRAY['nieuwbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('tools_pve_template', 7, 'Programma van Eisen: het werkdocument voor al je keuzes', 'Een gestructureerd PvE voorkomt dat wensen vergeten of verkeerd geïnterpreteerd worden.', 'Een sterk PvE bevat:
- functionele wensen per ruimte;
- sfeer en materiaalvoorkeuren;
- eisen aan licht, zicht, privacy;
- technische ambities (energie, comfort, domotica);
- budgetkaders en prioriteiten (must/should/could).

Dit document stuurt ontwerp, vergunning, offertes én uitvoering en vormt de basis van de Brikx-wizard.', ARRAY['tools', 'proces'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('uitvoering_fouten_kierdichtheid', 7, 'Veelgemaakte Fouten: Kierdichtheid', 'Te weinig aandacht voor kierdichtheid op de bouwplaats. Zelfs de binnenkant van een electrabuis voor een buitenlamp moet worden afgedicht.', 'Te weinig aandacht voor de uitvoering op de bouwplaats. Op de bouw dient er een strenge manier
van controle te zijn zodat bouwkundige aansluitingen gemaakt worden conform de gekozen
uitgangspunten in de energieberekeningen. Gaat dan met name om de kierdichtheid...
Een electra doorvoer bijvoorbeeld voor een buitenlamp moet rondom afgedicht worden
maar ook de binnenkant van de buis moet afgekit worden...', ARRAY['uitvoering', 'duurzaamheid'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('uitvoering_fouten_te_laat_kiezen', 7, 'Veelgemaakte Fouten: Te laat keuzes maken', 'Te laat kiezen van sanitair, tegels, keuken, etc. leidt tot stress, vertraging en meerkosten. Zorg dat alles voor de start van de bouw bekend is.', 'te lang wachten met het maken van keuzes voor bijvoorbeeld sanitair, tegelwerk, vloerafwerking en
dergelijke. Een goed uitgevoerde bouw is alleen maar mogelijk als de planning strak is...
Te lang wachten met het maken van die keuzes is dan ook
niet handig en zal leiden tot een hoop gedoe en soms frustratie en meerkosten. De meest soepele
bouwprocessen zijn die waarbij bijna alle onderdelen al uitgezocht zijn...', ARRAY['uitvoering', 'proces'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('uitvoering_fouten_zelf_leveren', 7, 'Veelgemaakte Fouten: Zelf materialen leveren', 'Zelf materialen (sanitair, tegels) online kopen lijkt goedkoop, maar let op: u bent zelf verantwoordelijk voor timing, compleetheid, schade en garantie.', 'Te veel uitgaan van prijzen op internet voor sanitair en tegelwerk...
Een valkauil is echter vaak dat
materialen erg goedkoop lijken online in verhouding tot een aanbieding van een onderaannemer...
Soms
willen opdrachtgevers toch spullen zelf leveren. Dat kan natuurlijk maar er zitten wel wat haken en
ogen aan...
- de materialen moeten op het juiste moment geleverd worden en dan ook compleet zijn...
- alles moet bij levering gecontroleerd worden op schade...
- een installateur zal... geen garantie kunnen
geven op het materiaal.', ARRAY['uitvoering', 'financien', 'professionals'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('uitvoering_isolatie_basis', 7, 'Aandachtspunt Verbouw: Isolatie (Basis)', 'Een warmtepomp heeft pas zin als de schil (vloer, gevel, dak, glas) op orde is. Begin met de makkelijkste winst: vloerisolatie (indien kruipruimte) en glas.', 'Dure installaties, zoals warmtepompen, aanleggen hebben alleen zin als de basis van de woning
op nieuwbouw kwaliteit of beter is. ... Het is dus van belang dat de isolatie van de schil van de woning op
orde is. ...
Een begane grondvloer isoleren
is meestal de meest makkelijke en snelle winst als er zich een kruipruimte bevindt...
Beglazing in kozijnen is vaak een volgende stap. ...
Houd overigens bij het plaatsen van triple beglazing rekening met... condens op de ramen...', ARRAY['uitvoering', 'duurzaamheid'], ARRAY['verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('uitvoering_isolatie_dak', 7, 'Aandachtspunt Verbouw: Dak isoleren', 'Dakisolatie (binnen of buiten) is cruciaal. Let op de damp-opbouw: een dampremmende folie binnen en dampopen folie buiten voorkomt houtrot.', 'En nog een onderdeel waar vaak heel veel winst tebehalen valt: het isoleren van het dal. ...
Het gaat dan niet alleen om kou maar ook om in de zomer warmte te weren...
Ook hier is de
vochthuishouding een belangrijk aandachtspunt...
Daken en gevels worden dan over het algemeen aan de binnenzijde voorzien van een
dampremmende folie... en aan de buitenzijde een waterkerende... dampopen folie...
Zeker bij oudere pannendaken ligt
er vaak nog een waterkerende laag onder de pannen... die... niet dampdoorlatend wat betekent
dat het vocht... niet weg kan en dus in de constructie blijft...', ARRAY['uitvoering', 'duurzaamheid'], ARRAY['verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('uitvoering_isolatie_gevels_binnen', 7, 'Aandachtspunt Verbouw: Gevels isoleren (Binnenzijde)', 'Isoleren aan de binnenzijde (met een voorzetwand) kan, maar heeft nadelen: ruimteverlies, koudebruggen, en risico op vochtproblemen bij verkeerde opbouw.', 'Het isoleren van gevels is een belangrijke volgende stap. ...
Dan blijft isoatie aan de binnenzijde over: het
plaatsen van een hoogwaardig geïsoleerde voorzetwand binnen...
Er zitten echter ook een aantal haken en ogen aan: ten eerste wordt
natuurlijk de binnenruimte kleiner... Aansluitingen bij bestaande vloeren, wanden en kozijnen leveren vaak problemen op door
koudebruggen... En de constructie moet zodanig
aangelegd worden dat er geen condens problemen ontstaan...', ARRAY['uitvoering', 'duurzaamheid'], ARRAY['verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('uitvoering_isolatie_gevels_buiten', 7, 'Aandachtspunt Verbouw: Gevels isoleren (Buitenzijde)', 'De beste (maar duurste) methode is het "inpakken" van de woning aan de buitenzijde. Dit voorkomt koudebruggen, maar is altijd vergunningsplichtig.', 'Als de buitenzijde van de woning weinig kwaliteit heeft is eigenlijk de beste manier van isoleren
altijd het inpakken van de woning aan de buitenzijde. Dan worden een hoop problematische
aansluitingen met bestaande constructies voorkomen...
En het opdikken van gevels van soms wel 20 cm zorgt natuurlijk er ook voor dat de
aansluiting op goten en dakranden anders wordt...
En natuurlijk is het dan wel van groot belang om te onderzoeken of de bestaande gevels voldoende
kwaliteit hebben...
En nog een onderdeel... het aanbrengen van isolatie aan de buitenzijde... is altijd vergunningsplichtig...', ARRAY['uitvoering', 'duurzaamheid', 'vergunningen'], ARRAY['verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('uitvoering_isolatie_plat_dak', 7, 'Aandachtspunt Verbouw: Plat dak isoleren (Nooit van binnen!)', 'Platte daken (met bitumen/EPDM) mogen NOOIT van binnenuit geïsoleerd worden. Dit leidt tot vochtophoping en houtrot. Altijd isoleren aan de bovenzijde.', 'Bij platte daken is er eigenlijk altijd een dampdichte oplossing aan de bovenkant: een bitumineuze
of epdm dakbedekking laat geen vocht door. Het isoleren van dat soort daken aan de binnenzijde
is dan ook vragen om problemen: het vocht zal gaan ophopen op het meest koude onderdeel van
de constructie... en zal dus in deloop van de tijd wegrotten. Bij platte daken dus altijd zaak om de
isolatie aan de bovenzijde van de constructie aan te brengen...', ARRAY['uitvoering', 'duurzaamheid'], ARRAY['verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('uitvoering_prefab_vs_traditioneel', 7, 'Prefab, cascobouw of traditioneel: wat past bij jouw plan?', 'Snelheid, kwaliteit en architectonische vrijheid verschillen per systeem.', '- **Prefab / conceptueel bouwen:** snel, gecontroleerde fabriek, minder faalkosten; iets minder vrij in maatwerk.
- **Hybride:** prefab casco met maatwerk-afwerking; goede balans.
- **Traditioneel metselwerk / in het werk:** maximale vrijheid, maar gevoeliger voor detailfouten en planning.

Kies op basis van gewenste uitstraling, budget, planning en beschikbaarheid van betrouwbare partijen.', ARRAY['uitvoering', 'tools'], ARRAY['nieuwbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('uitvoering_stress_beperken', 7, 'Hoe kun je stress tijdens een verbouwing beperken?', 'Stress komt door onduidelijke afspraken, onhaalbare planning, of te late keuzes. Een extreem goede voorbereiding (alles kiezen vóór de start) is de enige oplossing.', 'Stress tijden een bouw of verbouw komt eigenlijk altijd door een paar zaken:
- onduidelijke afspraken en dus verkeerde verwachtingen
- een planning die niet haalbaar blijkt voor de aannemer
- het niet op tijd uitzoeken van materialen die van belang zijn voor de voortgang van de bouw
- meerkosten die ontstaan door bovenstaande zaken

Eigenlijk allemaal onderdelen die je vooraf dus prima kunt ondervangen door het traject goed voor
te bereiden. ... Neem
de tijd om alles goed uit te zoeken, een heldere tekeningenset te maken...', ARRAY['uitvoering', 'proces'], ARRAY['nieuwbouw', 'verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('uitvoering_ventilatie_balans_nieuwbouw', 7, 'Aandachtspunt Nieuwbouw: Balansventilatie', 'Bij nieuwbouw is balansventilatie (met warmteterugwinning) de standaard. Dit is efficiënt, maar vereist ruimte voor kanalen.', 'Bij de huidige regelgeving voor nieuwbouwwoningen is zo''n manier van ventileren (met roosters) ook geen optie
meer; de koude lucht die in de winter binnen komt... moet opgewarmd worden...
Hier wordt dan eigenlijk tegenwoordig standaard
uitgegaan van een balansventilatiesysteem. Bij dit systeem wordt er nog steeds afgezogen...
maar wordt verse lucht ook mechanisch aangevoerd... het grote energetisch voordeel... is het feit dat de lucht van
buiten door middel van een warmtewisselaar opgewarmd wordt...', ARRAY['uitvoering', 'duurzaamheid', 'ontwerp'], ARRAY['nieuwbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('uitvoering_ventilatie_basis_verbouw', 7, 'Aandachtspunt Verbouw: Ventilatie (Basis)', 'Isoleren = Ventileren. Bij oude woningen verdwijnt de natuurlijke tocht. Zonder nieuwe ventilatie (roosters of unit) ontstaan vocht en schimmel.', 'lets wat vaak vergeten wordt bij het verbetern van woningen is ventilatie. Bij oude woningen is dat
ook nite zo belangrijk: door allerlei kieren... komt er... tocht naar binnen...
Aandachtspunt bij verduurzaming is dan ook vaak het zo veel mogelijk dichten van kieren...
Een belangrijk devies is echter: isoleren is ook ventileren. Bij
te weinig ventilatie zullen er allerlei ongezonde gassen ophopen... en zal vocht... aanwezig blijven. Met als gevolg nog meer ongezonde lucht door schimmelvorming.
...
Het principe komt dan
neer op volgende: een vemtilatieunit zuigt continu af in de badkamer, toilet en keuken. Daardoor
ontstaat er een onderdruk en wordt er verse lucht via gevelroosters... naar binnen gehaald...', ARRAY['uitvoering', 'duurzaamheid', 'ontwerp'], ARRAY['verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;

insert into public.knowledge_items
  (id, chapter, title, summary, content, onderwerpen, projectsoorten)
values
  ('uitvoering_ventilatie_kanalen_verbouw', 7, 'Aandachtspunt Verbouw: Kanalen Balansventilatie', 'Balansventilatie in een bestaand huis is lastig. De kanalen zijn groot en moeten weggewerkt worden in koofjes, knieschotten of nieuwe dekvloeren.', 'Een belangrijk aandachtspunt bij dat systeem is het feit dat naar alle
ruimtes ventilatiekanalen aangeleg moeten worden die op een of andere manier weggewerkt
moeten worden in bestaande wanden en vloeren. En dat is niet eenvoudig...
Bij een rigoreuze verbouwing
waarbij alle vloeren en plafonds open liggen is er vaak wel het e.e.a. nodig...', ARRAY['uitvoering', 'duurzaamheid', 'ontwerp'], ARRAY['verbouw', 'aanbouw'])
on conflict (id) do update set
  chapter = excluded.chapter,
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  onderwerpen = excluded.onderwerpen,
  projectsoorten = excluded.projectsoorten;