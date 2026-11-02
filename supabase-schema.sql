-- ============================================================
-- SCHEMA SUPABASE PER CORALINE HABIT & DIET TRACKER
-- ============================================================
-- Istruzioni:
-- 1. Crea un progetto gratuito su https://supabase.com
-- 2. Apri la sezione "SQL Editor" nella dashboard di Supabase
-- 3. Incolla questo codice ed esegui "Run"
-- ============================================================

-- 1. Tabella dei backup utente
create table if not exists public.user_backups (
  user_id uuid references auth.users on delete cascade not null primary key,
  backup_data jsonb not null,
  updated_at timestamptz default now()
);

-- 2. Abilita la sicurezza a livello di riga (Row Level Security - RLS)
alter table public.user_backups enable row level security;

-- 3. Rimuove la policy se già creata (evita l'errore se riesegui lo script)
drop policy if exists "Gli utenti possono gestire esclusivamente il proprio backup" on public.user_backups;

-- 4. Politica di sicurezza RLS: ogni utente può visualizzare, inserire
--    e aggiornare esclusivamente il proprio backup
create policy "Gli utenti possono gestire esclusivamente il proprio backup"
on public.user_backups
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ============================================================
-- FATTO! Il tuo database è pronto al 100%.
-- Ora vai su "Project Settings" -> "API" in Supabase
-- e copia "Project URL" e "anon public key" nell'app.
-- ============================================================
