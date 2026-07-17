-- Conserva la publicación/oferta concreta usada para consultar el precio,
-- mientras ml_id identifica de forma estable la página de catálogo.
alter table public."Productos"
  add column if not exists ml_item_id text;

update public."Productos"
set ml_item_id = upper(replace(trim(ml_item_id), 'MLA-', 'MLA'))
where ml_item_id is not null;

create index if not exists productos_ml_item_id_idx
  on public."Productos" (ml_item_id)
  where ml_item_id is not null and ml_item_id <> '';
