-- Calendario editorial para preparar productos antes de publicarlos.
-- Los productos existentes conservan su visibilidad y quedan como publicados.
alter table public."Productos"
  add column if not exists publication_status text not null default 'published',
  add column if not exists planned_publish_at timestamptz,
  add column if not exists published_at timestamptz,
  add column if not exists content_url text,
  add column if not exists editorial_notes text;

alter table public."Productos"
  drop constraint if exists productos_publication_status_check;

alter table public."Productos"
  add constraint productos_publication_status_check
  check (publication_status in ('draft', 'scheduled', 'published'));

alter table public."Productos"
  drop constraint if exists productos_scheduled_date_check;

alter table public."Productos"
  add constraint productos_scheduled_date_check
  check (publication_status <> 'scheduled' or planned_publish_at is not null);

update public."Productos"
set
  publication_status = case
    when is_visible = false then 'draft'
    else 'published'
  end,
  published_at = case
    when is_visible = true then coalesce(published_at, created_at, now())
    else null
  end
where publication_status is null
   or publication_status = 'published';

create index if not exists productos_editorial_status_idx
  on public."Productos" (publication_status, planned_publish_at, created_at desc);

