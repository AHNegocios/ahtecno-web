-- Resumen diario privado para que el panel admin pueda dibujar tendencias
-- sin descargar cada evento individual cuando el historial crezca.
create or replace view public.product_event_daily as
select
  (created_at at time zone 'America/Argentina/Buenos_Aires')::date as event_date,
  product_id,
  event_type,
  source,
  count(*)::bigint as event_count
from public.product_outbound_clicks
group by
  (created_at at time zone 'America/Argentina/Buenos_Aires')::date,
  product_id,
  event_type,
  source;

revoke all on table public.product_event_daily from anon, authenticated;
grant select on table public.product_event_daily to service_role;
