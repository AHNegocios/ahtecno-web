-- Datos sincronizados desde Mercado Libre. El campo link existente continúa
-- siendo el enlace de afiliado y nunca se reemplaza por el permalink común.
alter table public."Productos"
  add column if not exists descripcion text,
  add column if not exists currency_id text,
  add column if not exists ml_permalink text,
  add column if not exists ml_status text,
  add column if not exists available_quantity integer,
  add column if not exists sold_quantity integer,
  add column if not exists rating_average numeric(3, 2),
  add column if not exists reviews_count integer,
  add column if not exists last_synced_at timestamptz,
  add column if not exists sync_error text;

update public."Productos"
set ml_id = upper(trim(ml_id))
where ml_id is not null;

create unique index if not exists productos_ml_id_unique
  on public."Productos" (ml_id)
  where ml_id is not null and ml_id <> '';

-- Los tokens se guardan cifrados por el backend con AES-256-GCM. Esta tabla
-- no concede acceso a usuarios del navegador aunque conozcan su nombre.
create table if not exists public.mercadolibre_credentials (
  id smallint primary key check (id = 1),
  access_token_encrypted text not null,
  refresh_token_encrypted text not null,
  token_type text not null default 'bearer',
  scope text,
  mercado_libre_user_id bigint,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

alter table public.mercadolibre_credentials enable row level security;
revoke all on table public.mercadolibre_credentials from anon, authenticated;
grant all on table public.mercadolibre_credentials to service_role;
