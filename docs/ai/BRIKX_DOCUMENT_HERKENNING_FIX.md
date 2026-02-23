# Brikx PvE-Check: Document-herkenning — diagnose & fix
> Gegenereerd op 2026-02-23

---

## Het probleem in één zin

De LLM leest het document grondig en produceert per rubric-veld een citaat, observatie
en zwaktepunt. Maar die data wordt na de analyse weggegooid — nooit opgeslagen,
nooit getoond. De gebruiker ziet een generieke score-pagina die net zo goed gegenereerd
had kunnen zijn zonder hun document te lezen.

---

## Wat de LLM wél produceert (maar je nooit ziet)

`classify.ts` vraagt de LLM per rubric-veld om:

```typescript
// PveClassifiedField — per gevonden veld:
{
  fieldId: "basis.locatie",
  chapter: "basis",
  value: "Utrecht, Kerkstraat",
  confidence: 0.92,
  vague: false,

  quote:       "Het project bevindt zich aan de Kerkstraat 12 te Utrecht",   // EXACT citaat uit document
  observation: "Locatie is volledig en specifiek beschreven met adres.",      // wat er goed is
  weakness:    "Kadastraal perceelnummer ontbreekt.",                          // wat er ontbreekt
  evidence: {
    snippet: "...Kerkstraat 12, 3511 CX Utrecht...",
    page: 1,
    startOffset: 234,
    endOffset: 267
  }
}
```

Dit is rijke, document-specifieke data. **Geen enkel woord hiervan bereikt de gebruiker.**

---

## Waarom het verdwijnt — de drie breekpunten

### Breekpunt 1: `classify.fields` niet opgeslagen in DB

In `route.ts` lijn 293-313 staat de DB insert. De velden die wél opgeslagen worden:
`gaps`, `conflicts`, `mapped_data`, `chapter_scores`, `nudge_summary`.

`classify.fields` staat er **niet bij**. Na de API-call is het weg.

```typescript
// route.ts — wat er NIET in de insert zit:
// classify.fields (observation, weakness, quote, confidence, evidence per veld)
// classify.evidenceSnippets
// classify.missingFieldContext (ook al als Map niet serialiseerbaar)
```

### Breekpunt 2: `PveCheckResult` type heeft geen `fields` property

```typescript
// types/pveCheck.ts — PveCheckResult
export type PveCheckResult = {
  id: string;
  gaps: PveGap[];
  conflicts: HeadlineConflict[];
  mapped: PveCheckMappedData;
  // ... etc
  // classify_fields: PveClassifiedField[]  ← ONTBREEKT
}
```

Zelfs als het opgeslagen was, had de frontend er geen type voor.

### Breekpunt 3: `ResultsPage.tsx` toont alleen gaps, niet bevindingen

De ResultsPage itereert over `result.gaps` en `result.conflicts`.
Er is geen sectie die toont "dit hebben we in je document gevonden en herkend".

Het enige document-specifieke dat getoond wordt:
- `gap.evidence` — alleen in expanded gap card, alleen voor gaps, gelabeld als technisch "Evidence (p.X)"
- `nudgeSummary` — is de intake-data als string ("Project: verbouwing. Budget: €100k-€250k."), **niet** document-specifiek

---

## De fix — drie stappen

### Stap 1: Sla `classify_fields` op in de DB

**In `route.ts`** — voeg toe aan de insert:

```typescript
const insert = await supabaseAdmin
  .from("pve_check_results")
  .insert({
    // ...bestaande velden...
    classify_fields: classify.fields.map(f => ({
      fieldId:     f.fieldId,
      chapter:     f.chapter,
      confidence:  f.confidence,
      vague:       f.vague,
      vagueReason: f.vagueReason,
      observation: f.observation,
      weakness:    f.weakness,
      quote:       f.quote,
      evidence:    f.evidence,
    })),
  })
```

**In `types/pveCheck.ts`** — voeg toe aan `PveCheckResult`:

```typescript
export type PveCheckResult = {
  // ...bestaande velden...
  classifyFields?: PveClassifiedField[]  // opgeslagen LLM-bevindingen per veld
}
```

**In `dbRowToResult()`** — map het:

```typescript
classifyFields: (row.classify_fields as PveClassifiedField[]) ?? [],
```

**Supabase migratie** — nieuwe kolom:

```sql
ALTER TABLE pve_check_results
ADD COLUMN classify_fields JSONB DEFAULT '[]'::jsonb;
```

---

### Stap 2: Bereken de "documentherkenning" op basis van classify_fields

Voeg een helper toe in `ResultsPage.tsx` (of als util in `lib/pveCheck/`):

```typescript
type FieldStatus = "goed" | "vaag" | "ontbreekt";

type DocumentFinding = {
  fieldId: string;
  chapter: ChapterKey;
  label: string;
  status: FieldStatus;
  quote?: string;
  observation?: string;
  weakness?: string;
  confidence: number;
};

function buildDocumentFindings(
  classifyFields: PveClassifiedField[],
  rubric: PveRubric
): DocumentFinding[] {
  return classifyFields
    .filter(f => f.confidence >= 0.5)  // alleen wat redelijk zeker herkend is
    .map(f => {
      const rubricItem = rubric.items.find(r => r.id === f.fieldId);
      return {
        fieldId:     f.fieldId,
        chapter:     f.chapter,
        label:       rubricItem?.label ?? f.fieldId,
        status:      f.vague ? "vaag" : "goed",
        quote:       f.quote,
        observation: f.observation,
        weakness:    f.weakness,
        confidence:  f.confidence,
      };
    })
    .sort((a, b) => b.confidence - a.confidence);  // meest zeker bovenaan
}
```

---

### Stap 3: Toon een "Wat we in je document lazen" sectie

Voeg dit toe **boven de gap-secties** in `ResultsPage.tsx`, als eerste sectie na de chapterscores:

```tsx
{/* Document-herkenning sectie */}
{result.classifyFields && result.classifyFields.length > 0 && (
  <DocumentReadSection classifyFields={result.classifyFields} />
)}
```

De component `DocumentReadSection`:

```tsx
function DocumentReadSection({
  classifyFields,
}: {
  classifyFields: PveClassifiedField[];
}) {
  const [expanded, setExpanded] = useState(false);

  const findings = buildDocumentFindings(classifyFields, PVE_RUBRIC);
  const goedCount = findings.filter(f => f.status === "goed").length;
  const vaagCount = findings.filter(f => f.status === "vaag").length;

  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">

      {/* Header — altijd zichtbaar */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div>
          <h3 className="font-semibold text-sm">
            Wat we in je document herkenden
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {goedCount} onderdelen aanwezig
            {vaagCount > 0 && `, ${vaagCount} te vaag uitgewerkt`}
          </p>
        </div>
        <span className="text-slate-400 text-xs">{expanded ? "▲" : "▼"}</span>
      </button>

      {/* Expanded: per-veld bevindingen */}
      {expanded && (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {findings.map(finding => (
            <FindingRow key={finding.fieldId} finding={finding} />
          ))}
        </div>
      )}
    </section>
  );
}

function FindingRow({ finding }: { finding: DocumentFinding }) {
  const icon = finding.status === "goed" ? "✓" : "~";
  const iconColor = finding.status === "goed"
    ? "text-green-600 dark:text-green-400"
    : "text-amber-500 dark:text-amber-400";

  return (
    <div className="px-4 py-3 space-y-1">
      <div className="flex items-start gap-2">
        <span className={`text-xs font-bold mt-0.5 w-4 shrink-0 ${iconColor}`}>
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium">{finding.label}</span>

          {/* Citaat uit het document */}
          {finding.quote && (
            <blockquote className="mt-1 text-xs text-slate-500 dark:text-slate-400 italic border-l-2 border-slate-300 dark:border-slate-600 pl-2">
              &ldquo;{finding.quote}&rdquo;
            </blockquote>
          )}

          {/* Observatie (wat goed is) */}
          {finding.observation && finding.status === "goed" && (
            <p className="mt-1 text-xs text-green-700 dark:text-green-400">
              {finding.observation}
            </p>
          )}

          {/* Zwakte (wat vaag/onvolledig is) */}
          {finding.weakness && finding.status === "vaag" && (
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
              {finding.weakness}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Hoe het er dan uit ziet (UX mock)

```
┌─────────────────────────────────────────────────────────┐
│ Score: 54/100 — Concept-fase                            │
│ ██████████░░░░░░░░░░░                                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Wat we in je document herkenden              ▼           │
│ 8 onderdelen aanwezig, 3 te vaag uitgewerkt              │
├─────────────────────────────────────────────────────────┤
│ ✓  Projecttype                                           │
│    "Het project betreft een verbouwing van de begane     │
│     grond inclusief aanbouw aan de achterzijde"          │
│    → Projecttype helder beschreven                       │
│                                                          │
│ ✓  Locatie                                               │
│    "Kerkstraat 12, 3511 CX Utrecht"                      │
│    → Volledig adres aanwezig                             │
│                                                          │
│ ~  Duurzaamheidsambitie                                  │
│    "We willen zo duurzaam mogelijk bouwen"               │
│    → Ambitie uitgesproken maar geen meetbaar doel        │
│                                                          │
│ ~  Verwarmingssysteem                                    │
│    "We denken aan een warmtepomp of HR-ketel"            │
│    → Twijfel uitgesproken, geen keuze gemaakt            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 🔴 Kritieke gaps (4)                                    │
│ ...                                                      │
```

---

## Aanvullend: `nudgeSummary` vervangen door echte document-samenvatting

Momenteel is `nudgeSummary` gebouwd door `buildNudge()` in `classify.ts`:

```typescript
// classify.ts lijn 81-94 — genereert intake-context, niet document-samenvatting
export function buildNudge(intake: PveCheckIntakeData): string {
  const parts: string[] = [];
  parts.push(`Project: ${intake.archetype} (${intake.projectType})`);
  // ...
  return parts.join(". ") + ".";
}
```

Dit is puur de intake-data als string. Het wordt opgeslagen als `nudge_summary` in de DB
en getoond op de resultatenpagina. **Het zegt niets over het document zelf.**

**Fix:** Laat de LLM in `classify.ts` ook een korte document-samenvatting genereren:

```typescript
// Voeg toe aan de LLM prompt in classify.ts:
// "documentSummary": "<1-2 zinnen: wat voor document is dit, wat is de scope,
//                     hoe volledig voelt het aan?>"

// Dan opslaan als nudge_summary:
nudgeSummary: llmResult.documentSummary ?? buildNudge(intake)
```

Zodat de gebruiker bovenaan ziet:

```
"Dit is een PvE voor een verbouwing van een jaren-30 woning in Utrecht met
 achterbouw. Het document beschrijft de ruimtewensen goed maar mist technische
 eisen en een concreet budget."
```

In plaats van het huidige:
```
"Project: Jaren-30 verbouwing (verbouwing). Locatie: Utrecht. Budget: €100k-€250k."
```

---

## Samenvatting: wat er moet veranderen

| Wat | Waar | Impact |
|-----|------|--------|
| Sla `classify_fields` op in DB | `route.ts` + Supabase migratie | classify.fields gaat niet verloren |
| Voeg `classifyFields` toe aan `PveCheckResult` | `types/pveCheck.ts` + `dbRowToResult()` | Frontend krijgt de data |
| Bouw `DocumentReadSection` component | `ResultsPage.tsx` | Gebruiker ziet wat er gelezen is |
| Vervang `nudgeSummary` door LLM document-samenvatting | `classify.ts` | Opener voelt documentspecifiek |

Dit zijn vier gerichte wijzigingen. Geen nieuwe LLM-calls nodig — de data wordt al gegenereerd.
Het gaat puur om opslaan wat al gemaakt wordt, en tonen wat al opgeslagen staat.
