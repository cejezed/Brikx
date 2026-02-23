# Brikx PvE-Check: Output-kwaliteit & Upsell-optimalisaties
> Gegenereerd op 2026-02-23 — aanvullend op BRIKX_PVE_CHUNK_ANALYSE.md

---

## Context: waar staan we nu

De gratis laag toont:
- Score (0-100) — zonder duiding wat dit betekent
- Chapterscores als balken — ook zonder duiding
- Conflicts + gaps — labels zichtbaar, exampleGood geblurd
- Eén generieke CTA: "Architect review aanvragen →"

De premium approved laag toont:
- Verbetervoorstel per gap (patchValue uit LLM)
- "Zet over naar PvE" knop (stub)
- "Exporteer rapport (PDF)" knop (stub)

De rubric heeft 15 items — 6 critical, 6 important, 2 nice_to_have, verdeeld over 7 chapters. Dat is een relatief smalle basis voor een analyse die als "professioneel" moet aanvoelen.

---

## A — Verbeteringen voor document-kwaliteit (waardevoller gratis product)

### A1 — Score-framing: vertel wat de score *betekent*

**Probleem:** "54/100" zegt een gebruiker niets zonder referentiekader.

**Fix:** Voeg een scorelabel + benchmarkzin toe direct onder de score-cirkel:

```
Score: 54/100 — Concept-fase
"Je PvE bevat de basis, maar mist concrete technische en duurzaamheidseisen.
 Gemiddelde nieuwbouw-PvE die klaar is voor een architect: 72+."
```

Vier bands:
- 0-40: "Schets-fase — onvoldoende voor offerteaanvraag"
- 41-60: "Concept-fase — bruikbaar als gespreksbasis"
- 61-80: "Werkconcept — klaar voor architect-gesprek"
- 81-100: "Uitgewerkt PvE — gereed voor offerteaanvraag"

Dit geeft de score betekenis *en* creëert aspiratie naar de hogere band.

---

### A2 — "Wat je wél goed hebt gedaan" sectie

**Probleem:** De resultatenpagina is volledig negatief geframed (gaps, conflicts, ontbrekende info). Er is geen erkenning van wat wél aanwezig is.

**Fix:** Voeg boven de gaps een korte "Sterke punten" sectie toe op basis van `classify.fields` met `confidence > 0.7` en `vague = false`:

```
✓ Projecttype en locatie zijn helder beschreven
✓ Duurzaamheidsambitie is concreet benoemd
✓ Ruimteprogramma bevat 6 ruimtes
```

Dit reduceert defensiviteit bij de gebruiker ("mijn PvE is niet slecht, maar kan beter") en maakt de gaps constructiever.

---

### A3 — Gap-reason op menselijk niveau herschrijven

**Probleem:** Gap-reasons zijn technisch geschreven vanuit de rubric ("Bouwjaar is niet gevonden in het document"). Dit voelt als een robotrapport, niet als advies.

**Fix:** Gebruik een simpele mapping van gap.fieldId → menselijke frase:

```typescript
const GAP_FRIENDLY_REASONS: Record<string, string> = {
  "basis.bouwjaar": "Zonder bouwjaar kan een aannemer geen inschatting maken van asbest-risico of bestaande fundering.",
  "techniek.verwarming": "De verwarmingskeuze bepaalt 30-40% van je installatiekosten — dit is nu onbeslist gelaten.",
  "duurzaam.energieLabel": "Je hebt een ambitieuze duurzaamheidsdoelstelling, maar geen meetbaar doel. Dat maakt beoordeling achteraf onmogelijk.",
}
```

Toon dit *naast* de technische reason, niet in plaats van. De technische reason is evidence, de menselijke frase is het advies.

---

### A4 — AnalyzingStep: gebruik de wachttijd als verkoopmoment

**Probleem:** De analysepagina is een kale spinner van 10-30 seconden — volledig verspilde tijd.

**Fix:** Toon stap-voor-stap wat er nu gebeurt (met animatie), plus een contextuele hint:

```
[✓] Document geladen (3.421 woorden, 12 pagina's)
[✓] Project herkend: Verbouwing jaren-30 woning, Utrecht
[⟳] Analyseren op 15 kwaliteitscriteria...
[ ] Kennisbank raadplegen voor jouw projecttype
[ ] Verbetervoorstellen opstellen
```

Tussendoor (na ~8s): een "Wist je dat?" kaartje:

```
"Een incomplete PvE is de meest voorkomende oorzaak van meerwerk.
 Gemiddeld kost onduidelijkheid in een PvE €12.000 extra per project."
```

Dit zet framing neer *voordat* de score verschijnt, waardoor een lage score als hulp voelt, niet als kritiek.

---

### A5 — Rubric uitbreiden: 15 items is te weinig voor geloofwaardige analyse

**Probleem:** Het systeem heeft 15 rubric-items voor 7 chapters. Dat is gemiddeld 2 items per chapter. De analyses zijn daardoor oppervlakkig en de gap-lijst voelt snel "compleet" (wat paradoxaal een lage conversie geeft — "ik heb maar 3 gaps, dat valt mee").

**Aanbeveling:** Breid rubric uit naar 35-45 items. Focus op:
- `ruimtes`: nu 1 item. Voeg afmetingen per ruimte, daglicht-eisen, akoestiek toe
- `wensen`: nu 1 item. Voeg MoSCoW-prioritering, flexibiliteitseisen, bewonersprofiel toe
- `budget`: nu 1 item. Voeg bufferpost, betaalfasering, BTW-behandeling toe
- `techniek`: 3 items. Voeg ventilatietype, glaspercentage, buitenzonwering toe

Meer items = meer gaps = grotere urgentie = hogere conversie én rijker document.

---

### A6 — "Ontbrekende info"-vragen direct tonen in de gratis laag

**Probleem:** Wanneer info ontbreekt (budget exact onbekend, technische keuze open), verdwijnt dit in de gap-lijst. Er is geen mechanisme om de gebruiker direct te helpen die info toe te voegen.

**Fix:** Toon bovenaan de resultatenpagina een "Snel aanvullen" blok met maximaal 3 vragen die het meest impact hebben op de score:

```
Om je score te verbeteren, beantwoord deze 3 vragen:
1. Wat is je exacte budget (of range)? [invoerveld]
2. Kies je voor all-electric of hybride verwarming? [keuzeknop]
3. Is er een bestaande fundering die hergebruikt wordt? [ja/nee]
[Heranalyseer met deze info →]
```

Dit is gratis én verhoogt de kwaliteit van het document, en de herbeoordeling voelt als een waardevolle actie.

---

## B — Upsell-optimalisaties (hogere conversie)

### B1 — Dynamische CTA-tekst op basis van gevonden gaps

**Probleem:** De CTA "Architect review aanvragen →" is generiek en niet gekoppeld aan wat er specifiek in *dit* document is gevonden.

**Fix:** Genereer de CTA-tekst dynamisch op basis van de zwakste chapter en het critical gap-type:

```typescript
function buildCtaText(result: PveCheckResult): string {
  const worstChapter = result.chapterScores
    .sort((a, b) => a.score - b.score)[0]

  const criticals = result.gaps.filter(g => g.severity === 'critical')

  if (criticals.some(g => g.chapter === 'budget')) {
    return "Laat een architect je budgetstructuur controleren →"
  }
  if (criticals.some(g => g.chapter === 'techniek')) {
    return "Laat een architect je installatiekeuzes doorlichten →"
  }
  return `Verbeter je ${worstChapter.label.toLowerCase()}-score van ${worstChapter.score}% →`
}
```

Een specifieke belofte ("je installatiekeuzes doorlichten") converteert beter dan een generieke belofte ("architect review").

---

### B2 — Verlies-framing boven de paywall, niet feature-framing

**Probleem:** De huidige paywall-tekst is feature-georiënteerd: "Een architect controleert je analyse en voegt concrete verbeterpunten toe." Dit is zwak — de gebruiker begrijpt nog niet waarom ze dat nodig heeft.

**Fix:** Gebruik verlies-framing op basis van de gevonden gaps. Bereken de "risico-exposure":

```
⚠️ Zonder verbetering:
Je PvE bevat 4 kritieke gaps.
Op basis van vergelijkbare projecten (verbouwing, €100k-€250k)
leidt dit bij 7 van de 10 projecten tot meerwerk of vertraging.

Wat een architect nu voor je oplost:
• Techniek-paragraaf compleet maken (nu score: 28%)
• Budgetbuffer en risicopost toevoegen
• Duurzaamheidsdoel meetbaar maken

€ 49 eenmalig — of riskeer gemiddeld €8.000-€15.000 meerwerk.
```

De vergelijking "€49 vs €8.000-€15.000" is een rationele koop-trigger die in de architectuurwereld goed werkt omdat meerwerk een bekende angst is.

---

### B3 — Teaser van de verbeteringsinhoud vóór de paywall

**Probleem:** De gebruiker weet niet *wat* ze precies krijgen voor €49. Het exampleGood is geblurd maar toont geen echte waarde-demonstratie.

**Fix:** Toon één concreet verbetervoorstel volledig — de minst gevoelige gap (severity: nice_to_have of de eerste important) — als gratis teaser. Markeer het als "voorbeeld van wat Premium doet":

```
Voorbeeld verbetervoorstel (gratis preview):

Gap: Verwarmingssysteem niet gespecificeerd
Verbetervoorstel (door Brikx AI + architect):
"Voor dit project adviseren wij een lucht-water warmtepomp (COP ≥ 4.0)
 als primaire verwarming, aangevuld met vloerverwarming op de begane grond.
 Specificeer minimaal: fabrikant-klasse, afgiftesysteem, boilercapaciteit (≥200L)
 en aansluiting op zonnepanelen (minimaal 6 panelen, 2.400 Wp)."

Voor de overige 9 verbetervoorstellen → Ontgrendel architect review
```

Dit demonstreert de kwaliteit van de output in plaats van te beschrijven.

---

### B4 — "Sociale bevestiging" in de upsell-positie

**Probleem:** De PremiumModal toont feature-bullets maar geen sociaal bewijs.

**Fix:** Voeg aan de PremiumModal toe (uit feedback_responses/testimonials DB):

```
"Na de Brikx-check bleek ons PvE op 3 punten onduidelijk.
 De verbetervoorstellen hebben letterlijk discussies met de aannemer voorkomen."
— Karin, verbouwing 2024

⭐⭐⭐⭐⭐  4.8/5 op basis van 47 reviews
```

De feedback-tabel heeft al `allow_testimonial` en `testimonial_name` velden — dit data is dus al beschikbaar.

---

### B5 — Progressie-indicator: "Je PvE is 73% klaar"

**Probleem:** De score wordt gepresenteerd als behaald resultaat, niet als vorderingsindicator.

**Fix:** Herframe de score als voortgang:

```
Je PvE is 54% compleet

████████████░░░░░░░░  54/100

Met architect review: verwacht 82-89%
(Op basis van vergelijkbare projecten)
```

Dit schept een duidelijk einddoel en maakt de gap tot premium concreet en kwantificeerbaar.

---

### B6 — Upsell-timing: toon de CTA ná scroll, niet direct

**Probleem:** De upsell-sectie staat onderaan de pagina na de warnings. De gebruiker heeft dan al alle gaps gezien, de schrik is verwerkt, en de urgentie is gedaald.

**Fix:** Toon de upsell-CTA op twee momenten:
1. **Floating bar**: Verschijnt na 5 seconden op de pagina (of na 50% scroll), verdwijnt bij dismiss
2. **In-context**: Toon direct na de eerste critical gap een inline micro-CTA

```tsx
// Na de eerste critical gap card:
{criticalGaps.length > 0 && !isPremium && (
  <div className="py-2 text-center text-xs text-[#0d3d4d]">
    ↑ Deze kritieke gap heeft een architect-gevalideerd verbetervoorstel.{" "}
    <button className="underline font-medium">Bekijk het →</button>
  </div>
)}
```

De in-context micro-CTA is subtiel maar triggert op het moment van maximale betrokkenheid (de gebruiker leest net een kritiek probleem).

---

### B7 — PremiumModal: checkout stub repareren

**Probleem:** `PremiumGate.tsx` lijn 113-114:

```typescript
onUpgrade={() => {
  console.log("[PremiumGate] Upgrade clicked for feature:", feature);
```

De upgrade-knop doet letterlijk niets voor de eindgebruiker. Geen checkout, geen redirect. Dit is conversie = 0% voor iedereen die op de knop klikt.

**Fix:** Minimale implementatie:

```typescript
onUpgrade={() => {
  window.location.href = `/checkout?feature=${feature}&source=pve-check&resultId=${resultId}`
}}
```

Of via `router.push` als Stripe checkout op een aparte pagina staat.

---

### B8 — Gratis "PDF samenvatting" als lead-capture én upsell-trigger

**Probleem:** Er is geen mechanisme om e-mailgegevens te verzamelen voor de gratis gebruiker.

**Fix:** Bied een gratis "Gap-samenvatting PDF" aan (1 pagina A4, gegenereerd via /api/pve/pdf):

```
📄 Gratis: Download je gap-samenvatting
Ontvang een 1-pagina PDF met je score, top-3 kritieke gaps
en wat je zelf kunt doen.

[E-mailadres invoeren]  [Stuur mij de samenvatting →]
```

Dit levert:
- E-mailadres voor follow-up campagne
- Een concrete deliverable die de waarde van Brikx demonstreert
- Een upsell-moment in de e-mail: "Je samenvatting bijgevoegd — wil je ook de volledige architect review?"

De `/api/pve/pdf` route bestaat al — deze hoeft alleen een lichtgewicht "gratis variant" te genereren.

---

## C — Samenvatting: prioritering

```
PRIO 1 — Directe impact (1-3 dagen werk)
  B7  PremiumModal checkout stub repareren      [conversie = 0% nu]
  A1  Score-framing toevoegen                   [begrip + aspiratie]
  A2  "Wat je goed hebt gedaan" sectie          [negatieve framing doorbreken]

PRIO 2 — Hoge waarde (3-7 dagen werk)
  B2  Verlies-framing + bedrag-vergelijking     [sterkste koop-trigger]
  B3  Eén volledig verbetervoorstel als teaser  [waarde demonstreren]
  A4  AnalyzingStep met stappen + wachttijd     [framing vóór score-reveal]
  B6  In-context micro-CTA na kritieke gap      [timing van upsell]

PRIO 3 — Structurele verbetering (1-2 weken werk)
  A5  Rubric uitbreiden naar 35-45 items        [rijkere analyse, meer gaps]
  A6  "Snel aanvullen" vragen in gratis laag    [score verbeteren = engagement]
  B8  Gratis PDF + e-mail lead capture          [funnel uitbreiden]
  B5  Progressie-indicator "73% klaar"          [score herframen als voortgang]
  A3  Gap-reason menselijk herschrijven         [vertrouwen opbouwen]
```

---

## D — De kern van de upsell-logica

Het product heeft een structureel probleem met de waardedemonstratie:

```
Nu:    Gebruiker ziet gaps → begrijpt niet hoe erg → generieke CTA → geen actie

Beter: Gebruiker ziet gaps → begrijpt risico in euro's + kans → ziet één concreet
       voorbeeld van wat de fix is → CTA met specifieke belofte → koopt
```

De data om dit te realiseren is er volledig (gaps, conflicts, patches, kennisbank-hints, benchmark). Het gaat om presentatielogica, niet om nieuwe functionaliteit.
