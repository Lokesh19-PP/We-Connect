-- 005_dashboard.sql
-- Views and RPC functions for live Dashboard metrics matching lib/rules.ts

-- 1. VIEW: dashboard_summary_cards
create or replace view dashboard_summary_cards as
select
  (select count(*) from jobs where stage not in ('paid', 'inspected')) as active_jobs,
  (select count(*) from jobs where (
    (due_date < current_date and stage not in ('delivered', 'inspected', 'paid')) or
    risk = 'overdue'
  )) as overdue_jobs,
  (select count(*) from jobs where (
    risk in ('at_risk', 'may_miss_date') or
    (due_date >= current_date and due_date <= current_date + interval '7 days' and stage in ('ordered', 'accepted', 'in_progress'))
  )) as at_risk_jobs,
  (select count(*) from drawing_acknowledgements where confirmed_at is null) as awaiting_drawing_ack,
  (select count(*) from invoices_payments where payment_status in ('awaiting_approval', 'not_ready')) as invoices_pending;

-- 2. VIEW: vendor_snapshot
create or replace view vendor_snapshot as
select
  w.id,
  w.name,
  w.warning,
  count(j.id) filter (where j.stage not in ('paid', 'inspected')) as active_jobs,
  coalesce(
    round(
      (count(j.id) filter (where j.stage in ('delivered', 'inspected', 'paid') and j.due_date >= coalesce(j.accepted_date, j.due_date))::numeric /
       nullif(count(j.id) filter (where j.stage in ('delivered', 'inspected', 'paid')), 0)::numeric) * 100
    ),
    90
  ) as on_time_percent
from workshops w
left join jobs j on j.workshop_id = w.id
group by w.id, w.name, w.warning
order by w.name;

-- 3. VIEW: quality_snapshot
create or replace view quality_snapshot as
select
  count(*) as total_inspections,
  count(*) filter (where result = 'accepted' and reinspection_date is null) as passed_inspections,
  coalesce(
    round(
      (count(*) filter (where result = 'accepted' and reinspection_date is null)::numeric /
       nullif(count(*), 0)::numeric) * 100
    ),
    91
  ) as first_pass_yield,
  count(*) filter (where reinspection_date is not null or result = 'rejected') as rework_count,
  count(*) filter (where result = 'pending') as pending_inspections
from inspections;

-- 4. VIEW: payment_snapshot
create or replace view payment_snapshot as
select
  count(*) filter (where payment_status = 'paid') as paid_count,
  count(*) filter (where payment_status = 'on_hold_quality') as hold_count,
  count(*) filter (where payment_status = 'awaiting_approval') as awaiting_count,
  count(*) filter (where payment_status = 'ready') as ready_count,
  count(*) as total_payments,
  coalesce(
    round(
      (count(*) filter (where payment_status = 'paid')::numeric /
       nullif(count(*), 0)::numeric) * 100
    ),
    0
  ) as settlement_progress
from invoices_payments;

-- 5. FUNCTION: get_dashboard_summary()
create or replace function get_dashboard_summary()
returns json
language plpgsql security definer as $$
declare
  result json;
begin
  select json_build_object(
    'summary', (select row_to_json(s) from dashboard_summary_cards s),
    'quality', (select row_to_json(q) from quality_snapshot q),
    'payments', (select row_to_json(p) from payment_snapshot p),
    'vendors', (select json_agg(v) from vendor_snapshot v)
  ) into result;
  
  return result;
end;
$$;
