# PvE Check Feature — Build Document (v5.1)

> **Status:** In ontwikkeling
> **Versie:** v5.1 production-hard
> **Gestart:** 2026-02-13

## Positionering

Digitale architectdienst met AI-acceleratie. Premium = inclusief architect-check. Mensen betalen voor zekerheid, niet voor AI.

## Kernprincipes

1. LLM doet alleen extract → map → vaagheiddetectie → suggesttekst. Score/gaps/risks/conflicts: 100% deterministisch.
2. Upload en Analyze zijn gescheiden routes met eigen DB-records.
3. Geen volledige extracted_text opslaan — alleen hash + doc_stats + evidence_snippets (AVG-veilig).
4. Premium gate op patch-kwaliteit, niet gap-zichtbaarheid.
5. Nudge voor LLM (Build v2.0 Pijler 1).
6. Architect-review voor premium unlock.
7. Gestructureerde review-feedback → zelflerend kwaliteitssysteem.
8. Betalen = "place in review queue" — Stripe webhook als bron van waarheid.
9. Analyze is idempotent op (documentId, intakeHash).
10. Rubric is versieerbaar.
11. Auth required — Supabase magic link.

## Hergebruikte bestaande code (NIET aanpassen)

| Bestand | Functie |
|---------|---------|
| `types/project.ts` | ChapterDataMap, WizardState, PatchEvent, Risk |
| `lib/ai/missing.ts` | computeMissingFields() |
| `lib/risk/scan.ts` | scanRisks() |
| `lib/report/heuristics.ts` | computePermitStatus() (r20-40), computeBudgetWarning(), computeComplexity() |
| `lib/report/formatters.ts` | formatCurrency(), formatProjectType(), etc. |
| `lib/wizard/CHAPTER_SCHEMAS.ts` | Validatie + field whitelist |
| `lib/rag/Kennisbank.ts` | RAG context per gap |
| `components/premium/PremiumGate.tsx` | Free/premium split |
| `lib/stores/useWizardState.ts` | State laden voor "Convert to Brikx PvE" |
| `lib/export/print.ts` | Audit report export patroon |

## Nieuwe bestanden

### Types & Data

| Bestand | Doel |
|---------|------|
| `types/pveCheck.ts` | Alle PvE Check types |
| `lib/pveCheck/rubric.ts` | Deterministische rubric (de canon) |
| `lib/pveCheck/benchmark.ts` | Hardcoded frequentietabel per projecttype |

### Processing Pipeline

| Bestand | Doel |
|---------|------|
| `lib/pveCheck/extract.ts` | PDF/DOCX tekst extractie |
| `lib/pveCheck/classify.ts` | LLM sectieclassificatie + nudge |
| `lib/pveCheck/score.ts` | Deterministisch scoring engine |
| `lib/pveCheck/gaps.ts` | Gap detectie (3 lagen) |
| `lib/pveCheck/conflicts.ts` | 6 headline conflicts |
| `lib/pveCheck/patches.ts` | 3-staps patch generator |

### State & API

| Bestand | Doel |
|---------|------|
| `lib/stores/usePveCheckStore.ts` | Zustand store |
| `app/api/pve-check/upload/route.ts` | Upload → Storage + DB + extract |
| `app/api/pve-check/analyze/route.ts` | Idempotent analyse pipeline |
| `app/api/pve-check/export/route.ts` | Audit rapport export |
| `app/api/pve-check/fill-gaps/route.ts` | Gap filling chat (SSE) |
| `app/api/pve-check/context/route.ts` | RAG context per gap |
| `app/api/webhooks/stripe/route.ts` | Stripe webhook handler |
| `app/api/admin/pve-check/review/route.ts` | Review actie |
| `app/api/admin/pve-check/dashboard/route.ts` | Dashboard data |

### Frontend

| Bestand | Doel |
|---------|------|
| `app/pve-check/page.tsx` | Hoofdpagina |
| `app/pve-check/layout.tsx` | Layout |
| `app/pve-check/components/IntakeStep.tsx` | Archetype-first + 4 vragen |
| `app/pve-check/components/UploadStep.tsx` | Drag-drop upload |
| `app/pve-check/components/AnalyzingStep.tsx` | Laadstatus |
| `app/pve-check/components/ResultsPage.tsx` | Resultaten |
| `app/pve-check/components/ScoreOverview.tsx` | Score cirkel + balken |
| `app/pve-check/components/GapList.tsx` | Alle gaps |
| `app/pve-check/components/GapCard.tsx` | Individuele gap |
| `app/pve-check/components/ConflictOverlay.tsx` | 6 headline conflicts |
| `app/pve-check/components/ActionButtons.tsx` | 3 actieknoppen |
| `app/pve-check/components/PremiumPurchaseState.tsx` | Premium pending state |
| `app/pve-check/components/NeedsAdjustmentState.tsx` | Needs adjustment state |
| `app/admin/pve-check/page.tsx` | Review dashboard |

### Database

| Bestand | Doel |
|---------|------|
| `supabase/migrations/20260213_pve_check.sql` | 3 tabellen + RLS + indexes |

## Database Schema

### pve_check_documents
- user_id (not null), storage_path, document_name, mime, size, text_hash, doc_stats
- expires_at (24h default, 14d bij premium), deleted_at (soft delete)
- RLS: user select+insert, admin select+update

### pve_check_results
- user_id (not null), document_id (FK), intake, intake_hash
- nudge_summary, rubric_version, overall_score, chapter_scores, gaps, conflicts, mapped_data
- critical_gap_count, conflict_count (denormalized)
- is_premium, payment_intent_id (unique), review_status (none/pending/approved/needs_adjustment)
- Unique index: (document_id, intake_hash)
- RLS: user select+insert, admin select+update. Webhook: service_role.

### pve_check_review_feedback
- result_id (FK), field_id, issue_type (6 types), note
- RLS: admin only (select+insert)

## Premium Lifecycle

```
1. Upload + analyze → result (review_status='none')
2. Stripe checkout met result_id in metadata
3. Webhook: is_premium=true, payment_intent_id, review_status='pending', expires_at+=14d
4. UI: "Je rapport wordt gecontroleerd" + blurred preview
5. Architect review: approve / needs_adjustment + feedback
6. Approved → premium unlocked | Needs adjustment → fill-gaps → re-review
```

## Security

- Auth required (magic link)
- Mimetype + magic bytes, max 10MB/40p/35k words
- Rate: 5 uploads/uur, 10 analyze/uur
- RLS per operatie (geen "for all")
- Stripe webhook signature + payment_intent_id idempotency
- Analyze idempotency: unique (document_id, intake_hash)

## npm dependencies

- `pdf-parse` — PDF tekst extractie
- `mammoth` — DOCX tekst extractie

## Implementatievolgorde

1. Database migratie
2. Types (`types/pveCheck.ts`)
3. Rubric (`lib/pveCheck/rubric.ts`)
4. Extract (`lib/pveCheck/extract.ts`) + npm deps
5. Classify (`lib/pveCheck/classify.ts`)
6. Score + Gaps + Conflicts
7. Patches
8. Benchmark
9. Store + Upload API
10. Analyze API
11. Stripe webhook
12. Frontend (intake/upload/results)
13. Paywall + acties
14. Admin review dashboard
15. TTL cleanup cron
16. Export + Fill gaps + Context

## Update Todos (2026-02-13)

- [x] Maak `BUILD_PVE_CHECK.md` document
- [x] Database migratie (3 tabellen + RLS + indexes)
- [x] Types - `types/pveCheck.ts`
- [x] Rubric - `lib/pveCheck/rubric.ts`
- [x] Extract - `lib/pveCheck/extract.ts` + npm deps
- [x] Classify - `lib/pveCheck/classify.ts`
- [x] Score + Gaps + Conflicts - deterministisch
- [x] Patches - `lib/pveCheck/patches.ts`
- [x] Benchmark - `lib/pveCheck/benchmark.ts`
- [x] Store - `lib/stores/usePveCheckStore.ts`
- [x] Upload API - `/api/pve-check/upload`
- [x] Analyze API - `/api/pve-check/analyze`
