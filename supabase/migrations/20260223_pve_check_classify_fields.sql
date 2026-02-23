-- PvE Check: classify_fields kolom + document_summary
-- Versie: 2026-02-23
-- Reden: classify.fields worden nu opgeslagen zodat DocumentReadSection ze kan tonen.
--        document_summary vervangt de generieke nudge_summary string.

ALTER TABLE public.pve_check_results
  ADD COLUMN IF NOT EXISTS classify_fields JSONB DEFAULT '[]'::jsonb;

-- document_summary: LLM-gegenereerde samenvatting van het document zelf
-- (vervangt de intake-context string die nudge_summary nu bevat)
-- Reuse bestaande nudge_summary kolom — het type verandert van intake-context naar doc-samenvatting
-- Geen nieuwe kolom nodig, nudge_summary wordt nu document-specifiek ingevuld.
