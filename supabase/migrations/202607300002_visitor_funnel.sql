-- Amplía las estadísticas privadas con el embudo completo y la procedencia
-- de la visita. No almacena nombres, correos, IP ni identificadores personales.
alter table public.product_outbound_clicks
  add column if not exists channel text not null default 'direct';

alter table public.product_outbound_clicks
  drop constraint if exists product_outbound_clicks_event_type_check;

alter table public.product_outbound_clicks
  add constraint product_outbound_clicks_event_type_check
  check (
    event_type in (
      'product_impression',
      'product_view',
      'favorite_add',
      'outbound_click',
      'share'
    )
  );

create index if not exists product_outbound_clicks_channel_idx
  on public.product_outbound_clicks (channel, created_at desc);

create or replace view public.product_event_daily as
select
  (created_at at time zone 'America/Argentina/Buenos_Aires')::date as event_date,
  product_id,
  event_type,
  source,
  count(*)::bigint as event_count,
  channel
from public.product_outbound_clicks
group by
  (created_at at time zone 'America/Argentina/Buenos_Aires')::date,
  product_id,
  event_type,
  source,
  channel;

create or replace view public.product_event_totals as
select
  product_id,
  count(*) filter (
    where event_type = 'product_view'
  )::bigint as product_views,
  count(*) filter (
    where event_type = 'outbound_click'
  )::bigint as outbound_clicks,
  count(*) filter (
    where event_type = 'share'
  )::bigint as shares,
  count(*) filter (
    where event_type = 'product_impression'
  )::bigint as product_impressions,
  count(*) filter (
    where event_type = 'favorite_add'
  )::bigint as favorites_added
from public.product_outbound_clicks
group by product_id;

revoke all on table public.product_event_daily from anon, authenticated;
revoke all on table public.product_event_totals from anon, authenticated;
grant select on table public.product_event_daily to service_role;
grant select on table public.product_event_totals to service_role;
