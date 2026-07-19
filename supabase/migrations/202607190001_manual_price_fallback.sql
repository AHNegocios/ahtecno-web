-- Indica de dónde salió el precio visible y si necesita control humano.
-- Los productos existentes se consideran manuales hasta que una sincronización
-- confirme un precio oficial de Mercado Libre.
alter table public."Productos"
  add column if not exists price_source text not null default 'manual',
  add column if not exists price_needs_review boolean not null default false;

update public."Productos"
set price_source = 'manual'
where price_source is null or price_source = '';
