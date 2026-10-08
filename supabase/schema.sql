-- VendorFlow PostgreSQL schema (Supabase). Use in Phase B, not for the clickable prototype.

-- ENUMS
create type app_role as enum ('procurement','production','engineering','stores','quality','finance','management','workshop_owner','workshop_staff','admin');
create type job_stage as enum ('ordered','accepted','in_progress','ready','delivered','inspected','paid');
create type job_risk as enum ('on_track','at_risk','may_miss_date','reinspection_due','overdue');
create type inspection_result as enum ('pending','accepted','rejected');
create type payment_status as enum ('not_ready','ready','on_hold_quality','awaiting_approval','paid');

-- TABLES
create table workshops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_person text,
  phone text,
  location text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  role app_role not null,
  workshop_id uuid references workshops(id), -- set only for workshop_owner / workshop_staff
  created_at timestamptz not null default now()
);

create table parts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  part_code text unique not null,
  material text,
  part_type text
);

create table drawings (
  id uuid primary key default gen_random_uuid(),
  part_id uuid not null references parts(id),
  revision text not null,
  file_url text not null,
  is_approved boolean not null default false,
  approved_by uuid references users(id),
  approved_at timestamptz,
  change_note text,
  created_at timestamptz not null default now(),
  unique (part_id, revision)
);
-- BUSINESS RULE 1: only one approved drawing per part
create unique index one_approved_drawing_per_part on drawings(part_id) where is_approved;

create table jobs (
  id uuid primary key default gen_random_uuid(),
  part_id uuid not null references parts(id),
  workshop_id uuid not null references workshops(id),
  project_id text,
  quantity_ordered int not null check (quantity_ordered > 0),
  quantity_accepted int not null default 0 check (quantity_accepted >= 0),
  due_date date not null,
  needed_by_date date,
  stage job_stage not null default 'ordered',
  risk job_risk not null default 'on_track',
  created_at timestamptz not null default now()
);

create table drawing_acknowledgements (
  job_id uuid not null references jobs(id) on delete cascade,
  drawing_id uuid not null references drawings(id),
  confirmed_by uuid not null references users(id),
  confirmed_at timestamptz not null default now(),
  primary key (job_id, drawing_id)
);

create table status_updates (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  status text not null,
  note text,
  photo_url text,
  created_by uuid references users(id),
  created_at timestamptz not null default now()
);

create table deliveries (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  quantity int not null check (quantity > 0),
  delivered_at timestamptz not null default now(),
  challan_url text
);

create table inspections (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  result inspection_result not null default 'pending',
  checklist jsonb, -- dimensions, workmanship, drawing revision correct
  remarks text,
  photo_url text,
  inspector_id uuid references users(id),
  inspected_at timestamptz not null default now()
);

create table invoices_payments (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null unique references jobs(id) on delete cascade,
  invoice_url text,
  invoice_amount numeric(12,2),
  payment_status payment_status not null default 'not_ready',
  approved_by uuid references users(id),
  paid_at timestamptz
);

create table assembly_steps (
  id uuid primary key default gen_random_uuid(),
  project_id text not null,
  step_name text not null,
  planned_date date not null,
  parts_needed int not null check (parts_needed >= 0)
);

-- Link jobs to the assembly step that needs them (powers the shortfall calendar)
alter table jobs add column assembly_step_id uuid references assembly_steps(id);

create table audit_log (
  id bigint generated always as identity primary key,
  entity text not null,
  entity_id uuid,
  action text not null,
  user_id uuid references users(id),
  created_at timestamptz not null default now()
);

-- BUSINESS RULE 3 + 4: payment readiness (calculated, never typed by hand)
create or replace function payment_readiness(p_job_id uuid) returns payment_status
language sql stable as $$
  select case
    when not exists (select 1 from deliveries d where d.job_id = p_job_id) then 'not_ready'::payment_status
    when coalesce((select i.result from inspections i where i.job_id = p_job_id order by i.inspected_at desc limit 1), 'pending') <> 'accepted'
      then 'on_hold_quality'::payment_status
    when not exists (select 1 from invoices_payments ip where ip.job_id = p_job_id and ip.invoice_url is not null)
      then 'not_ready'::payment_status
    else 'ready'::payment_status
  end;
$$;

-- BUSINESS RULE 2: no "in_progress" before the approved revision is acknowledged
create or replace function enforce_ack_before_progress() returns trigger
language plpgsql as $$
begin
  if new.stage = 'in_progress' and (tg_op = 'INSERT' or old.stage is distinct from new.stage) then
    if not exists (
      select 1 from drawing_acknowledgements a
      join drawings d on d.id = a.drawing_id
      where a.job_id = new.id and d.part_id = new.part_id and d.is_approved
    ) then
      raise exception 'Workshop must acknowledge the approved drawing revision before work starts';
    end if;
  end if;
  return new;
end $$;

create trigger jobs_require_ack
before insert or update of stage on jobs
for each row execute function enforce_ack_before_progress();

-- ROW LEVEL SECURITY: workshop users see only their own jobs
alter table jobs enable row level security;
alter table deliveries enable row level security;
alter table inspections enable row level security;
alter table invoices_payments enable row level security;
alter table status_updates enable row level security;
alter table drawing_acknowledgements enable row level security;

create or replace function current_workshop() returns uuid
language sql stable security definer as $$ select workshop_id from users where id = auth.uid() $$;

create or replace function is_workshop_user() returns boolean
language sql stable security definer as $$
  select role in ('workshop_owner','workshop_staff') from users where id = auth.uid()
$$;

create policy jobs_read on jobs for select
  using (not is_workshop_user() or workshop_id = current_workshop());

create policy deliveries_read on deliveries for select
  using (not is_workshop_user() or job_id in (select id from jobs where workshop_id = current_workshop()));

create policy inspections_read on inspections for select
  using (not is_workshop_user() or job_id in (select id from jobs where workshop_id = current_workshop()));

create policy payments_read on invoices_payments for select
  using (not is_workshop_user() or job_id in (select id from jobs where workshop_id = current_workshop()));

create policy status_read on status_updates for select
  using (not is_workshop_user() or job_id in (select id from jobs where workshop_id = current_workshop()));

create policy ack_read on drawing_acknowledgements for select
  using (not is_workshop_user() or job_id in (select id from jobs where workshop_id = current_workshop()));

-- NOTE: add insert/update policies per role (e.g. quality inserts inspections, finance updates payments)
-- when you build each feature in Phase B. Test every policy with a workshop user and a manufacturer user.
