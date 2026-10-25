-- 004_audit_triggers.sql
-- Automated audit trail logging into public.audit_log for core business events:
-- 1. Job stage changes
-- 2. Drawing acknowledgements created
-- 3. Inspection results recorded / updated
-- 4. Payment status updates

-- 1. TRIGGER FUNCTION: Job stage change
create or replace function audit_job_stage_change() returns trigger
language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' then
    insert into audit_log (entity, entity_id, action, user_id)
    values ('job', new.id, 'job_created: stage=' || new.stage, auth.uid());
  elsif tg_op = 'UPDATE' and old.stage is distinct from new.stage then
    insert into audit_log (entity, entity_id, action, user_id)
    values ('job', new.id, 'stage_changed: ' || old.stage || ' -> ' || new.stage, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists trg_audit_job_stage on jobs;
create trigger trg_audit_job_stage
after insert or update of stage on jobs
for each row execute function audit_job_stage_change();

-- 2. TRIGGER FUNCTION: Drawing acknowledgement created
create or replace function audit_drawing_ack() returns trigger
language plpgsql security definer as $$
begin
  insert into audit_log (entity, entity_id, action, user_id)
  values ('drawing_acknowledgement', new.drawing_id, 'drawing_acknowledged: job=' || new.job_id, auth.uid());
  return new;
end;
$$;

drop trigger if exists trg_audit_drawing_ack on drawing_acknowledgements;
create trigger trg_audit_drawing_ack
after insert on drawing_acknowledgements
for each row execute function audit_drawing_ack();

-- 3. TRIGGER FUNCTION: Inspection result set
create or replace function audit_inspection_result() returns trigger
language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' or old.result is distinct from new.result then
    insert into audit_log (entity, entity_id, action, user_id)
    values ('inspection', new.id, 'inspection_result: ' || new.result || ' for job=' || new.job_id, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists trg_audit_inspection on inspections;
create trigger trg_audit_inspection
after insert or update of result on inspections
for each row execute function audit_inspection_result();

-- 4. TRIGGER FUNCTION: Payment status update
create or replace function audit_payment_change() returns trigger
language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' or old.payment_status is distinct from new.payment_status then
    insert into audit_log (entity, entity_id, action, user_id)
    values ('invoices_payments', new.id, 'payment_status_changed: ' || new.payment_status || ' for job=' || new.job_id, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists trg_audit_payment on invoices_payments;
create trigger trg_audit_payment
after insert or update of payment_status on invoices_payments
for each row execute function audit_payment_change();

-- RLS ON AUDIT_LOG: Admin & Management can read audit logs
alter table audit_log enable row level security;

create policy audit_log_read_admin on audit_log for select
using (
  (select role from public.users where id = auth.uid()) in ('admin', 'management')
);

create policy audit_log_insert_system on audit_log for insert
with check (true);
