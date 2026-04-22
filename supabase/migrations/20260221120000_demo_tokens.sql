-- Jetons pour liens démo : accès uniquement via le backend (clé service_role).
-- Exécuter ce fichier dans Supabase → SQL Editor, ou via `supabase db push`.

create table if not exists public.demo_tokens (
  token_hash text primary key,
  recipient_label text not null default '',
  created_at timestamptz not null default now(),
  first_opened_at timestamptz null
);

comment on table public.demo_tokens is 'Liens démo horodatés ; la fenêtre 10 min est calculée côté app.';

alter table public.demo_tokens enable row level security;

-- Aucune policy : l’API anon/authenticated ne lit pas cette table.
-- Le serveur utilise SUPABASE_SERVICE_ROLE_KEY (bypass RLS).
