# Brikx PvE-Check: Chunk-Pipeline Analyse
> Gegenereerd op 2026-02-23 — gebaseerd op volledige codebase-scan

---

## 1. Hoe chunks nu door Brikx gaan (volledig diagram)

```
GEBRUIKER
   │
   ▼
[1] UPLOAD  (/api/pve-check/upload)
   │  extractDocument()
   │  → PDF/DOCX → raw text (genormaliseerd)
   │  → sha256-hash, pageCount, wordCount
   │  → opgeslagen in Supabase Storage (pve-check-docs)
   │  → documentId terug naar frontend
   │
   ▼
[2] CLASSIFY  (lib/pveCheck/classify.ts)
   │  buildNudge()  ← intake-context samengevat tot 1 string
   │  llmClassify() ← gpt-4o-mini
   │     └─ input: text.slice(0, 12_000)  ⚠️ HARDE TRUNCATIE
   │     └─ output: fields[] + missingFields[]
   │  findEvidence() ← deterministisch keyword-match in pages[]
   │  isVague()     ← deterministisch op vage-termen-lijst
   │  → PveClassifyResult {mappedData, fields, missingFieldContext}
   │
   ▼
[3] GAPS  (lib/pveCheck/gaps.ts)
   │  Layer 1: structuralGaps()  ← rubric-items zonder classify-match
   │  Layer 2: vagueGaps()       ← classify.fields met vague=true
   │  Layer 3: contextGaps()     ← intake-gedreven regels (3 hardcoded)
   │  → PveGap[] gesorteerd op prioriteit (context > vague > structural)
   │
   ▼
[4] SCORE  (lib/pveCheck/score.ts)
   │  Deterministisch: severity-weight × status-factor
   │  → overallScore (0-100) + chapterScores[]
   │
   ▼
[5] KENNISBANK  (lib/pveCheck/knowledge.ts)
   │  queryKnowledgeForGaps() ← parallel, 1 query per chapter
   │  enrichGapsWithKnowledge() ← muteert gaps in-place (knowledgeHint)
   │
   ▼
[6] CONFLICTS  (lib/pveCheck/conflicts.ts)
   │  6 hardcoded headline-conflicten
   │  hergebruikt: computeBudgetWarning, computePermitStatus, scanRisks
   │  → HeadlineConflict[]
   │
   ▼
[7] PATCHES  (lib/pveCheck/patches.ts)
   │  Alleen voor critical + important gaps
   │  llmSuggestText() ← gpt-4o-mini per gap (sequentieel!)
   │  buildPatchEvent() ← chapter + fieldPath + value
   │  validatePatch()  ← CHAPTER_SCHEMAS validatie
   │  → PvePatchPlan[] {suggestedText, patchEvent?, validated}
   │
   ▼
[8] BENCHMARK  (lib/pveCheck/benchmark.ts)
   │  computeBenchmark() ← statische benchmarks per projecttype
   │  → PveBenchmarkDelta[]
   │
   ▼
[9] DB INSERT  (Supabase: pve_check_results)
   │  Opgeslagen: gaps, conflicts, mapped_data.patchEvents, scores
   │  ⚠️  BENCHMARK WORDT NIET OPGESLAGEN (lijn 252-257 route.ts)
   │  ⚠️  missingFieldContext (Map) verdwijnt hier — niet serialiseerbaar
   │
   ▼
[10] FRONTEND  (app/pve-check/components/ResultsPage.tsx)
   │  Toont: score, chapterScores, conflicts, gaps gesorteerd op severity
   │  patchMap ← mapped_data.patchEvents geïndexeerd op delta.path
   │
   │  GRATIS VIEW:
   │  └─ gaps zichtbaar (label + reason + riskOverlay)
   │  └─ exampleGood (rubric) geblurd achter paywall
   │
   │  PREMIUM APPROVED VIEW:
   │  └─ verbetervoorstel (patchValue) zichtbaar
   │  └─ "Zet over naar PvE →" knop
   │       └─ onClick: alert(JSON.stringify(patch.delta))  ⚠️ STUB!
   │
   ▼
EINDGEBRUIKER ZIET: score + lijst gaps + conflicts
           KRIJGT NIET: samenvatting, prioritering, actieplan, wizard-integratie
```

---

## 2. Waar gaat het fout — gedetailleerde knelpunten

### 🔴 Knelpunt 1: Patch-→Wizard koppeling bestaat niet

**Locatie:** `ResultsPage.tsx` lijn 529

```typescript
onClick={() => alert("Patch: " + JSON.stringify(patch.delta))}
```

De "Zet over naar PvE →" knop is een `alert()` stub. Er is **geen router.push naar /wizard**, geen `useWizardStore.applyPatch()`, geen state-hydration. De patch-data is wel aanwezig, maar er ontbreekt de brug van PvE-check naar de wizard-state. Hetzelfde geldt voor de "Zet over naar Brikx PvE" knop in de premium action bar (lijn 150) — ook zonder `onClick`.

**Gevolg:** Alle gegenereerde `PvePatchPlan`s, inclusief de gevalideerde `PatchEvent`s, worden nooit daadwerkelijk toegepast op een bestaand PvE-document.

---

### 🔴 Knelpunt 2: LLM ziet slechts 34% van het document

**Locatie:** `classify.ts` lijn 196

```typescript
content: `Beoordeel dit PvE document:\n\n${text.slice(0, 12000)}`
```

Het systeem accepteert tot 35.000 woorden (~175.000 tekens), maar stuurt slechts 12.000 tekens naar de LLM. Een gemiddeld PvE van 3.400 woorden (~20.000 tekens) wordt dus al deels afgekapt. Bij grotere documenten (verbouwing, nieuwbouw) mist de classificatie structureel de tweede helft — precies waar techniek, duurzaamheid en risico-paragrafen typisch staan.

**Gevolg:** Gaps worden aangemeld als "niet gevonden" terwijl de info wél in het document staat — maar na karakter 12.000.

---

### 🔴 Knelpunt 3: Benchmark wordt niet opgeslagen én nooit getoond

**Locatie:** `route.ts` lijn 252-257 (compute) vs lijn 293-313 (insert)

De benchmark (`computeBenchmark`) wordt berekend maar is afwezig in de DB insert. Het resultaat (`PveBenchmarkDelta[]`) verdwijnt na de API-aanroep. In de `ResultsPage` is er geen benchmark-weergave.

**Gevolg:** Waardevolle context ("jouw PvE heeft 800 woorden, gemiddelde nieuwbouw-PvE heeft 3.400 woorden") wordt nooit getoond.

---

### 🟠 Knelpunt 4: Geen aggregatie/advies-fase na gap-detectie

Er ontbreekt een **"chunk-summary agent"** die:
- De topgaps ordent op *gecombineerde impact* (severity × fixEffort × chapterScore)
- Een "Top 5 acties voor dit project" formuleert
- Kwantificeert: "50 gaps gevonden, 8 kritiek, focuseer eerst op: budget, techniek"
- Aanvullende vragen genereert voor info die ontbreekt (budgetbedrag, technische keuzes)

Momenteel wordt de ruwe `gaps[]` array direct naar de UI gestuurd, ongesorteerd op prioriteit voor díe specifieke klant.

---

### 🟠 Knelpunt 5: missingFieldContext verdwijnt na classify

**Locatie:** `classify.ts` → `route.ts` → DB insert

`missingFieldContext` is een `Map<string, PveMissingFieldContext>` — JavaScript Maps zijn niet JSON-serialiseerbaar. In `gaps.ts` wordt de context correct gebruikt, maar na de gap-berekening gaat alle rijke "waarom ontbreekt dit / wat staat er wél in de buurt"-informatie verloren. Het wordt nooit opgeslagen en nooit aan de gebruiker getoond.

**Gevolg:** De gebruiker ziet een gap als "ontbreekt" maar krijgt niet de documentspecifieke uitleg die de LLM al had gegenereerd.

---

### 🟠 Knelpunt 6: Patches worden sequentieel gegenereerd (performance)

**Locatie:** `patches.ts` lijn 145 — `for (const gap of patchableGaps)`

Elke `llmSuggestText()` is een afzonderlijke OpenAI API-call in een sequentiële loop. Bij 10 kritieke + belangrijke gaps = 10 seriële requests. Dit verlengt de analysetijd significant en is een bottleneck voor de UX.

---

### 🟡 Knelpunt 7: contextGaps heeft slechts 3 hardcoded regels

**Locatie:** `gaps.ts` lijn 156-227

De intake-gedreven context-layer heeft maar 3 regels:
1. verbouwing zonder bouwjaar
2. ambitieuze duurzaamheid zonder energiedoel
3. hoog budget zonder risicoparagraaf

Er zijn geen regels voor: bijgebouw-specifieke eisen, postcode-gebaseerde context, archetype-specifieke gaps, of de combinatie van duurzaamheidsambitie met technische keuzes anders dan de energiedoel-check.

---

### 🟡 Knelpunt 8: Aanvullings-loop bestaat niet

De `NeedsAdjustmentBanner` heeft een "Vul nu aan →" knop zonder implementatie. Er is geen mechanisme om:
- Te detecteren welke info ontbreekt die via follow-up vragen verkregen kan worden
- Follow-up vragen te genereren en naar de klant te sturen
- De analyse opnieuw te draaien na aanvulling
- Budget/techniek/duurzaamheid-specifieke vragen te stellen op basis van gap-patronen

---

## 3. Concrete refactor-punten (prioriteit)

### P1 — Wizard-patch-integratie (breekt de core loop)

```
ResultsPage: GapCard → "Zet over naar PvE" knop
→ router.push('/wizard')
→ wizard-store.applyPatchEvents(result.mapped.patchEvents)
→ wizard opent bij het juiste chapter
```

Vereist: `useWizardStore.applyPatch(patchEvent: PatchEvent)` methode + routing-afspraak.

---

### P2 — Document-chunking voor LLM-classificatie

De 12.000-tekens truncatie moet vervangen worden door een sliding-window aanpak:

```
text.length > 12_000
  → splits in overlappende chunks van ~8.000 tekens
  → classifeer elk chunk parallel
  → merge resultaten (hoogste confidence per fieldId wint)
```

Of: stuur samengevatte chunks per chapter door naar de LLM i.p.v. het ruwe document.

---

### P3 — ChunkSummaryAgent: aggregatie & actieplan

Voeg een nieuwe stap toe ná de gap-detectie:

```typescript
// lib/pveCheck/summary.ts (nieuw)
export async function computeChunkSummary(
  gaps: PveGap[],
  conflicts: HeadlineConflict[],
  chapterScores: ChapterScore[],
  intake: PveCheckIntakeData
): Promise<ChunkSummary>

type ChunkSummary = {
  totalGapCount: number
  criticalCount: number
  weakestChapter: ChapterKey
  top5Actions: ActionItem[]      // gesorteerd op impact × fixEffort
  followUpQuestions: string[]   // vragen voor ontbrekende info
  oneLineSummary: string        // "Jouw PvE scoort 54/100 — focus op budget en techniek"
}
```

Dit lost het "check-output armoede" probleem op en geeft de gebruiker direct bruikbaar actieadvies.

---

### P4 — Benchmark opslaan + tonen

In `route.ts`: voeg `benchmark_data: benchmark` toe aan de DB-insert.
In `ResultsPage`: voeg een `BenchmarkCard` toe:

```
"Jouw PvE: 800 woorden — gemiddelde verbouwing: 2.200 woorden
 Jouw PvE is dunner dan gebruikelijk. Voeg ruimteprogramma en techniek toe."
```

---

### P5 — missingFieldContext serialiseren

`missingFieldContext` van type `Map` moet worden omgezet naar een plain object voor opslag:

```typescript
// In classify.ts - return als object i.p.v. Map
missingFieldContext: Object.fromEntries(missingFieldContext)
// In gaps.ts - gebruik als Record<string, ...>
// In DB: sla op als JSON-kolom
// In ResultsPage: toon "waarom ontbreekt dit" per gap
```

---

### P6 — Patches paralleliseren

```typescript
// patches.ts
const plans = await Promise.all(
  patchableGaps.map((gap) => generatePatchPlan(gap, documentText, knowledgeMap))
)
```

---

### P7 — relevantChapters-prioritering voor check-output

Voeg een `relevantChapters` berekening toe die per intake-archetype bepaalt welke hoofdstukken het zwaarst wegen — zodat de check-output prioritering projecttype-bewust is:

```typescript
// Nieuwbouw: basis + ruimtes + techniek wegen zwaarder
// Verbouwing: basis + techniek + risico wegen zwaarder
// Bijgebouw: ruimtes + vergunning wegen zwaarder
```

---

### P8 — Aanvullings-loop implementeren

Na gap-analyse: als ≥3 critical gaps betrekking hebben op ontbrekende informatie (geen vagueness, geen conflict):

```
1. Genereer 2-3 follow-up vragen (LLM of templates per gap-type)
2. Sla op als pending_questions[] in pve_check_results
3. Email klant / toon in "Vul nu aan" flow
4. Na beantwoording: heranalyse met aangevulde intake-context
```

---

## 4. Samenvatting: de fundamentele gap

```
WAT BRIKX DOET:
  Document → Chunks → Supabase (rijke data opgeslagen) ✓

WAT ONTBREEKT:
  Supabase data → Actiegericht advies → Wizard → Betere PvE
                       ↑
               HIER ZIT DE GAP

De pipeline produceert uitstekende intermediaire data
(gaps met evidence, patches met suggesties, conflicts met next steps)
maar geen van deze data vertaalt zich naar:
  - Een concreet actieplan voor de gebruiker
  - Automatische verbetering van de PvE via de wizard
  - Follow-up vragen voor ontbrekende info
```

De drie dringendste fixes:
1. **P1**: Wizard-patch-integratie — de "Zet over naar PvE" knop moet werken
2. **P2**: Document-chunking — de LLM moet het hele document zien
3. **P3**: ChunkSummaryAgent — aggregeer gaps naar een top-5 actieplan
