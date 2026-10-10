# Lokesh Foundation Prompt

Copy-paste the prompt below into Antigravity after completing `01_manual_setup.md`.

---

```
Follow AGENTS.md and supabase/schema.sql. I am Lokesh. The prototype is merged. Edit only my files (app/layout, app/page, app/login, components/layout, components/ui, types, lib, supabase, messages, data/sample.ts). Never hardcode keys. After EACH part run npm run build, fix errors, git add . && git commit -m '<message>'. Do NOT push. Print PART N DONE and continue.

PART 1 — Supabase clients
Install @supabase/supabase-js and @supabase/ssr.
Create:
- lib/supabase/client.ts — browser client using NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
- lib/supabase/server.ts — server client using the service role key (reads from process.env.SUPABASE_SERVICE_ROLE_KEY)
- lib/supabase/middleware.ts — helper to refresh auth tokens in middleware
Commit "supabase clients".

PART 2 — Schema additions
Create supabase/migrations/002_additions.sql with:
- A notifications table: id (uuid), user_id (references users), type (text), title (text), body (text), link (text), read (boolean default false), created_at (timestamptz default now).
- A projects table (id text primary key, name text, start_date date, end_date date) linked from jobs.project_id and assembly_steps.project_id.
- Indexes on all foreign keys and on jobs(workshop_id, due_date).
- updated_at columns with triggers on jobs, drawings, inspections, invoices_payments.
- Insert/update RLS policies per role:
  - Quality: inserts inspections
  - Finance: updates invoices_payments
  - Engineering: inserts drawings and updates is_approved
  - Stores: inserts deliveries
  - Workshop Staff: inserts status_updates and drawing_acknowledgements, updates job stage only for its own workshop's jobs
  - Procurement: inserts jobs and workshops (vendors)
  - Admin: full access to users table
  - Management: read-only on all tables (already covered by existing select policies)
- Create supabase/seed.sql with seed data matching data/sample.ts, including one user per role.
Commit "schema additions, policies, seed".

PART 3 — Login and roles
Create /login page:
- Large, phone-friendly layout with email and password fields
- Use the Supabase browser client to sign in
- On success, read the user's role and workshop_id from the users table
- Store role and workshop_id in an auth context (lib/auth-context.tsx)
- Redirect workshop roles (workshop_owner, workshop_staff) to /workshop, all others to /
- Protect all routes in middleware.ts: unauthenticated users go to /login
- Replace the demo role switcher with the real role from auth context
- Keep a "view as" role switcher visible only for admin users
- Add a logout button in the header
Commit "auth and roles".

PART 4 — Data layer pattern
Create lib/data/ with typed functions:
- getJobs(filters?), getJob(id), getWorkshops(), getParts(), getDrawings(partId?), getAssemblySlots(projectId?)
- Each function returns the same types from @/types
- Each function uses the Supabase server client
- Handle errors with try/catch and return { data, error } pattern
- Keep data/sample.ts working behind a flag: if NEXT_PUBLIC_USE_SAMPLE=true, use sample data instead of Supabase
- Create docs/data-layer.md explaining the pattern with examples for loading and error handling, so other members know how to use it
Commit "data layer pattern".

PART 5 — Storage
In the Supabase dashboard (or via SQL), create three private buckets: drawings, photos, invoices.
Create storage policies:
- drawings bucket: Engineering can upload, all authenticated users can read
- photos bucket: Workshop Staff can upload, all authenticated users can read
- invoices bucket: Workshop Staff can upload, Finance and Management can read
Create lib/storage.ts with:
- uploadFile(bucket, file) — validates 5 MB limit, compresses images, uploads to Supabase Storage, returns the path
- getSignedUrl(bucket, path) — returns a signed URL with short expiry (1 hour)
In a comment at the top, list which member components must use this: Suyash (drawings), Vedant (photos, invoices), Abhi (invoices), Shiva (inspection photos).
Commit "storage helper".

PART 6 — Audit and checks
Create triggers that write to audit_log on:
- Job stage change
- Drawing acknowledgement created
- Inspection result set
- Payment status change
Put these triggers in supabase/migrations/003_audit_triggers.sql.
Create docs/security-test.md with a checklist to verify:
- Each role can only access what RLS allows
- Service role key is not exposed in browser code
- .env.local is not committed
- Storage bucket policies work correctly
Commit "audit log and security checklist".

FINAL REPORT:
Print a summary of what each part did, what I (Lokesh) must do manually in the Supabase dashboard, the SQL files to run in order (schema.sql, 002_additions.sql, seed.sql, 003_audit_triggers.sql), and the git push commands.
```
