-- Tables
create table if not exists public.wizard_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,      -- verwijst naar auth.users.id
  title text not null,
  payload jsonb not null,     -- triage + chapterAnswers + meta
  status text not null default 'draft', -- 'draft' | 'submitted'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexen
create index if not exists wizard_drafts_user_id_idx on public.wizard_drafts(user_id);
create index if not exists wizard_drafts_updated_at_idx on public.wizard_drafts(updated_at desc);

-- Trigger voor updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists wizard_drafts_set_updated_at on public.wizard_drafts;
create trigger wizard_drafts_set_updated_at
before update on public.wizard_drafts
for each row execute procedure public.set_updated_at();

-- RLS aan
alter table public.wizard_drafts enable row level security;

-- Policies: alleen eigen rijen kunnen lezen/schrijven/verwijderen.
-- Anonymous sign-ins zijn 'authenticated' met claim is_anonymous; auth.uid() werkt dus gewoon.
create policy "drafts_select_own"
on public.wizard_drafts
for select
to authenticated
using ( user_id = auth.uid() );

create policy "drafts_insert_own"
on public.wizard_drafts
for insert
to authenticated
with check ( user_id = auth.uid() );

create policy "drafts_update_own"
on public.wizard_drafts
for update
to authenticated
using ( user_id = auth.uid() )
with check ( user_id = auth.uid() );

create policy "drafts_delete_own"
on public.wizard_drafts
for delete
to authenticated
using ( user_id = auth.uid() );
