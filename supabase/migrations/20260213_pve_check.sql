-- PvE Check Feature: 3 tabellen + RLS + indexes
-- Versie: v5.1 (2026-02-13)

-- ============================================================
-- 1. pve_check_documents — upload records met TTL
-- ============================================================
create table if not exists public.pve_check_documents (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null,
  storage_path    text not null,
  document_name   text not null,
  mime            text not null,
  size            integer not null,
  text_hash       text not null,
  doc_stats       jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  expires_at      timestamptz not null default (now() + interval '24 hours'),
  deleted_at      timestamptz
);

create index if not exists pve_docs_user_id_idx
  on public.pve_check_documents(user_id);
create index if not exists pve_docs_expires_at_idx
  on public.pve_check_documents(expires_at)
  where deleted_at is null;

alter table public.pve_check_documents enable row level security;

create policy "docs_user_select" on public.pve_check_documents
  for select to authenticated
  using (user_id = auth.uid());

create policy "docs_user_insert" on public.pve_check_documents
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "docs_admin_select" on public.pve_check_documents
  for select to authenticated
  using ((auth.jwt()->'app_metadata'->>'role') = 'admin');

create policy "docs_admin_update" on public.pve_check_documents
  for update to authenticated
  using ((auth.jwt()->'app_metadata'->>'role') = 'admin');

-- ============================================================
-- 2. pve_check_results — analyse resultaten
-- ============================================================
create table if not exists public.pve_check_results (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null,
  document_id         uuid not null references public.pve_check_documents(id),
  intake              jsonb not null,
  intake_hash         text not null,
  document_name       text not null,
  doc_stats           jsonb not null default '{}'::jsonb,
  text_hash           text not null,
  nudge_summary       text,
  rubric_version      text not null,
  overall_score       integer not null,
  chapter_scores      jsonb not null default '[]'::jsonb,
  gaps                jsonb not null default '[]'::jsonb,
  conflicts           jsonb not null default '[]'::jsonb,
  mapped_data         jsonb not null default '{}'::jsonb,
  -- Denormalized for dashboard sort/filter
  critical_gap_count  integer not null default 0,
  conflict_count      integer not null default 0,
  -- Premium & payment
  is_premium          boolean not null default false,
  payment_intent_id   text unique,
  -- Review lifecycle: none=gratis, pending=betaald/in queue, approved, needs_adjustment
  review_status       text not null default 'none'
                      check (review_status in ('none', 'pending', 'approved', 'needs_adjustment')),
  review_checked_at   timestamptz,
  review_notes        jsonb,
  created_at          timestamptz not null default now()
);

-- Idempotency: zelfde document + intake = zelfde result
create unique index pve_results_idempotent
  on public.pve_check_results(document_id, intake_hash);

create index if not exists pve_results_user_id_idx
  on public.pve_check_results(user_id);

-- Dashboard prio-sortering: pending reviews, high-risk eerst
create index if not exists pve_results_review_prio_idx
  on public.pve_check_results(review_status, critical_gap_count desc, overall_score asc, conflict_count desc, created_at asc)
  where review_status = 'pending';

alter table public.pve_check_results enable row level security;

create policy "results_user_select" on public.pve_check_results
  for select to authenticated
  using (user_id = auth.uid());

create policy "results_user_insert" on public.pve_check_results
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "results_admin_select" on public.pve_check_results
  for select to authenticated
  using ((auth.jwt()->'app_metadata'->>'role') = 'admin');

create policy "results_admin_update" on public.pve_check_results
  for update to authenticated
  using ((auth.jwt()->'app_metadata'->>'role') = 'admin');

-- ============================================================
-- 3. pve_check_review_feedback — zelflerend systeem
-- ============================================================
create table if not exists public.pve_check_review_feedback (
  id          uuid primary key default gen_random_uuid(),
  result_id   uuid not null references public.pve_check_results(id),
  field_id    text,
  issue_type  text not null
              check (issue_type in (
                'rubric_gap',
                'conflict_missed',
                'vagueness_undetected',
                'severity_wrong',
                'llm_mapping_error',
                'no_issue'
              )),
  note        text,
  created_at  timestamptz not null default now()
);

create index if not exists pve_feedback_result_id_idx
  on public.pve_check_review_feedback(result_id);

alter table public.pve_check_review_feedback enable row level security;

create policy "feedback_admin_select" on public.pve_check_review_feedback
  for select to authenticated
  using ((auth.jwt()->'app_metadata'->>'role') = 'admin');

create policy "feedback_admin_insert" on public.pve_check_review_feedback
  for insert to authenticated
  with check ((auth.jwt()->'app_metadata'->>'role') = 'admin');
