-- 003_storage.sql
-- Create private storage buckets and role-based storage access policies.

-- 1. INSERT PRIVATE BUCKETS INTO storage.buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('drawings', 'drawings', false, 5242880, array['application/pdf', 'image/png', 'image/jpeg', 'image/svg+xml']),
  ('photos', 'photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('invoices', 'invoices', false, 5242880, array['application/pdf', 'image/jpeg', 'image/png'])
on conflict (id) do update set
  public = false,
  file_size_limit = 5242880;

-- 2. STORAGE POLICIES (storage.objects)
-- DRAWINGS BUCKET
-- Read: All authenticated users
create policy "drawings_read_authenticated"
on storage.objects for select
using (
  bucket_id = 'drawings'
  and auth.role() = 'authenticated'
);

-- Upload: Engineering and Admin
create policy "drawings_upload_engineering"
on storage.objects for insert
with check (
  bucket_id = 'drawings'
  and (
    (select role from public.users where id = auth.uid()) in ('engineering', 'admin')
  )
);

-- PHOTOS BUCKET
-- Read: All authenticated users
create policy "photos_read_authenticated"
on storage.objects for select
using (
  bucket_id = 'photos'
  and auth.role() = 'authenticated'
);

-- Upload: Workshop Staff/Owner, Quality Inspector, Admin
create policy "photos_upload_workshop_quality"
on storage.objects for insert
with check (
  bucket_id = 'photos'
  and (
    (select role from public.users where id = auth.uid()) in ('workshop_staff', 'workshop_owner', 'quality', 'admin')
  )
);

-- INVOICES BUCKET
-- Read: Finance, Management, Admin, or Workshop Owner
create policy "invoices_read_authorized"
on storage.objects for select
using (
  bucket_id = 'invoices'
  and (
    (select role from public.users where id = auth.uid()) in ('finance', 'management', 'admin', 'workshop_owner')
  )
);

-- Upload: Workshop Owner, Workshop Staff, Admin
create policy "invoices_upload_workshop"
on storage.objects for insert
with check (
  bucket_id = 'invoices'
  and (
    (select role from public.users where id = auth.uid()) in ('workshop_owner', 'workshop_staff', 'admin')
  )
);
