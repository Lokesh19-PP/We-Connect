-- 002_additions.sql
-- Missing tables, fields, indexes, triggers, and granular role-based RLS write policies.

-- 1. PROJECTS TABLE
create table if not exists projects (
  id text primary key,
  name text not null,
  start_date date,
  end_date date,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

-- Link projects foreign key
alter table jobs 
  add constraint fk_jobs_project foreign key (project_id) references projects(id) on delete set null;

alter table assembly_steps 
  add constraint fk_assembly_steps_project foreign key (project_id) references projects(id) on delete cascade;

-- 2. NOTIFICATIONS TABLE
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  type text not null default 'info', -- 'info' | 'warning' | 'error' | 'success'
  title text not null,
  body text not null,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table notifications enable row level security;

-- 3. MISSING FIELDS IDENTIFIED IN AUDIT
-- Workshops
alter table workshops 
  add column if not exists email text,
  add column if not exists address text,
  add column if not exists warning text;

-- Drawings
alter table drawings
  add column if not exists uploaded_by uuid references users(id);

-- Jobs
alter table jobs
  add column if not exists notes text,
  add column if not exists accepted_date date;

-- Deliveries
alter table deliveries
  add column if not exists challan_number text,
  add column if not exists received_by text,
  add column if not exists vehicle_number text,
  add column if not exists transporter_name text,
  add column if not exists notes text;

-- Inspections
alter table inspections
  add column if not exists reinspection_date date;

-- Invoices & Payments
alter table invoices_payments
  add column if not exists invoice_number text,
  add column if not exists invoice_date date,
  add column if not exists paid_amount numeric(12,2);

-- 4. PERFORMANCE & FOREIGN KEY INDEXES
create index if not exists idx_jobs_part on jobs(part_id);
create index if not exists idx_jobs_workshop on jobs(workshop_id);
create index if not exists idx_jobs_project on jobs(project_id);
create index if not exists idx_jobs_assembly_step on jobs(assembly_step_id);
create index if not exists idx_jobs_workshop_due on jobs(workshop_id, due_date);
create index if not exists idx_drawings_part on drawings(part_id);
create index if not exists idx_drawing_acks_job on drawing_acknowledgements(job_id);
create index if not exists idx_drawing_acks_drawing on drawing_acknowledgements(drawing_id);
create index if not exists idx_status_updates_job on status_updates(job_id);
create index if not exists idx_deliveries_job on deliveries(job_id);
create index if not exists idx_inspections_job on inspections(job_id);
create index if not exists idx_invoices_payments_job on invoices_payments(job_id);
create index if not exists idx_notifications_user_unread on notifications(user_id, read) where not read;

-- 5. UPDATED_AT TRIGGER & COLUMNS
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

alter table jobs add column if not exists updated_at timestamptz not null default now();
drop trigger if exists trg_jobs_updated_at on jobs;
create trigger trg_jobs_updated_at before update on jobs
for each row execute function set_updated_at();

alter table drawings add column if not exists updated_at timestamptz not null default now();
drop trigger if exists trg_drawings_updated_at on drawings;
create trigger trg_drawings_updated_at before update on drawings
for each row execute function set_updated_at();

alter table inspections add column if not exists updated_at timestamptz not null default now();
drop trigger if exists trg_inspections_updated_at on inspections;
create trigger trg_inspections_updated_at before update on inspections
for each row execute function set_updated_at();

alter table invoices_payments add column if not exists updated_at timestamptz not null default now();
drop trigger if exists trg_invoices_payments_updated_at on invoices_payments;
create trigger trg_invoices_payments_updated_at before update on invoices_payments
for each row execute function set_updated_at();

alter table workshops add column if not exists updated_at timestamptz not null default now();
drop trigger if exists trg_workshops_updated_at on workshops;
create trigger trg_workshops_updated_at before update on workshops
for each row execute function set_updated_at();

-- 6. ROLE-BASED RLS WRITE POLICIES
create or replace function current_user_role() returns app_role
language sql stable security definer as $$
  select role from users where id = auth.uid();
$$;

-- Projects: read by all authenticated; write by procurement and admin
alter table projects enable row level security;
create policy projects_read on projects for select using (true);
create policy projects_write on projects for all using (current_user_role() in ('procurement', 'admin'));

-- Notifications policies
create policy notifications_select on notifications for select
  using (user_id = auth.uid() or user_id is null);

create policy notifications_update on notifications for update
  using (user_id = auth.uid());

create policy notifications_insert on notifications for insert
  with check (true);

-- Quality: can insert and update inspections
create policy inspections_insert_quality on inspections for insert
  with check (current_user_role() in ('quality', 'admin'));

create policy inspections_update_quality on inspections for update
  using (current_user_role() in ('quality', 'admin'));

-- Finance: updates invoices_payments (approve & mark paid)
create policy payments_update_finance on invoices_payments for update
  using (current_user_role() in ('finance', 'admin'));

-- Engineering: inserts and approves drawings
create policy drawings_insert_engineering on drawings for insert
  with check (current_user_role() in ('engineering', 'admin'));

create policy drawings_update_engineering on drawings for update
  using (current_user_role() in ('engineering', 'admin'));

-- Stores: inserts deliveries
create policy deliveries_insert_stores on deliveries for insert
  with check (current_user_role() in ('stores', 'admin'));

-- Workshop Staff & Owner:
-- Inserts status_updates for its own workshop's jobs
create policy status_insert_workshop on status_updates for insert
  with check (
    job_id in (select id from jobs where workshop_id = current_workshop())
    or current_user_role() = 'admin'
  );

-- Inserts drawing acknowledgements for its own workshop's jobs
create policy ack_insert_workshop on drawing_acknowledgements for insert
  with check (
    job_id in (select id from jobs where workshop_id = current_workshop())
    or current_user_role() = 'admin'
  );

-- Workshop Staff/Owner updates job stage only for its own workshop's jobs
create policy jobs_update_workshop on jobs for update
  using (
    (is_workshop_user() and workshop_id = current_workshop())
    or current_user_role() in ('procurement', 'admin')
  );

-- Workshop Owner: can insert or upload invoice on invoices_payments
create policy payments_insert_workshop on invoices_payments for insert
  with check (
    job_id in (select id from jobs where workshop_id = current_workshop())
    or current_user_role() in ('finance', 'admin')
  );

-- Procurement: inserts jobs and manages vendors
create policy jobs_insert_procurement on jobs for insert
  with check (current_user_role() in ('procurement', 'admin'));

create policy workshops_write_procurement on workshops for insert
  with check (current_user_role() in ('procurement', 'admin'));

create policy workshops_update_procurement on workshops for update
  using (current_user_role() in ('procurement', 'admin'));

-- Admin: full access to users table
create policy users_admin_all on users for all
  using (current_user_role() = 'admin' or id = auth.uid());
