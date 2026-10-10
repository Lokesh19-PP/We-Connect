# Manual Setup — Lokesh Only

Step-by-step manual tasks before running any code prompts. Do these in order.

---

## 1. Create a Supabase project

- [ ] Go to [supabase.com](https://supabase.com) and sign up (free tier).
- [ ] Create a new project.
  - Name: `vendorflow` (or `we-connect`)
  - Region: **Mumbai (ap-south-1)**
  - Set a strong database password and save it somewhere safe.
- [ ] Wait for the project to finish provisioning (~2 minutes).

## 2. Run the schema

- [ ] Open the **SQL Editor** in the Supabase dashboard.
- [ ] Copy the entire contents of `supabase/schema.sql` and paste it into the editor.
- [ ] Click **Run**. All tables, enums, functions, triggers, and RLS policies will be created.
- [ ] Check the **Table Editor** — you should see: `workshops`, `users`, `parts`, `drawings`, `jobs`, `drawing_acknowledgements`, `status_updates`, `deliveries`, `inspections`, `invoices_payments`, `assembly_steps`, `audit_log`.

## 3. Copy keys into `.env.local`

- [ ] In the Supabase dashboard, go to **Settings → API**.
- [ ] Copy these three values:
  - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
  - **Anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - **Service role key** → `SUPABASE_SERVICE_ROLE_KEY`
- [ ] In the project root, copy `.env.example` to `.env.local`:
  ```bash
  cp .env.example .env.local
  ```
- [ ] Paste the three values into `.env.local`.
- [ ] **Never commit `.env.local`** — it is already in `.gitignore`.

## 4. Create a Vercel account

- [ ] Go to [vercel.com](https://vercel.com) and sign up (free tier, use your GitHub account).
- [ ] Do **not** deploy yet — that comes in Step 5 of the Phase B plan.

## 5. Create a Resend account

- [ ] Go to [resend.com](https://resend.com) and sign up (free tier).
- [ ] Create an API key and add it to `.env.local`:
  ```
  RESEND_API_KEY=re_xxxxxxxxx
  ```
- [ ] Verify a sender domain or use the default `onboarding@resend.dev` for testing.

## 6. Configure Supabase Auth

- [ ] In the Supabase dashboard, go to **Authentication → Providers**.
- [ ] Enable **Email** login (email + password). This is on by default.
- [ ] **Disable** email confirmation for now (Settings → Auth → toggle off "Enable email confirmations") so test users can log in immediately.
- [ ] Leave Phone OTP disabled — it needs an SMS provider like Twilio which requires business verification. Add it later.

## 7. Create test users

Create one test user per role. Go to **Authentication → Users → Add User** (or use the SQL editor).

| # | Email | Password | Role | Workshop |
|---|-------|----------|------|----------|
| 1 | `procurement@test.com` | `test1234` | procurement | — |
| 2 | `production@test.com` | `test1234` | production | — |
| 3 | `engineering@test.com` | `test1234` | engineering | — |
| 4 | `stores@test.com` | `test1234` | stores | — |
| 5 | `quality@test.com` | `test1234` | quality | — |
| 6 | `finance@test.com` | `test1234` | finance | — |
| 7 | `management@test.com` | `test1234` | management | — |
| 8 | `admin@test.com` | `test1234` | admin | — |
| 9 | `workshopA@test.com` | `test1234` | workshop_owner | Workshop A |
| 10 | `workshopB@test.com` | `test1234` | workshop_staff | Workshop B |

Steps:
- [ ] First, insert at least two workshops into the `workshops` table using the Table Editor or SQL:
  ```sql
  INSERT INTO workshops (name, contact_person, phone, location)
  VALUES
    ('Workshop A', 'Rajesh', '9876543210', 'Pune'),
    ('Workshop B', 'Manoj', '9876543211', 'Mumbai');
  ```
- [ ] For each test user, click **Add User** in Authentication → Users (use email + password, no email confirmation).
- [ ] After creating each user in Auth, insert a row into the `users` table linking `auth.users.id` to their role:
  ```sql
  INSERT INTO users (id, name, email, role, workshop_id)
  VALUES
    ('<auth-user-id>', 'Procurement User', 'procurement@test.com', 'procurement', NULL);
  ```
  For workshop users, set `workshop_id` to the matching workshop's UUID.
- [ ] Repeat for all 10 users.

## 8. Confirm RLS is enabled

- [ ] In the Supabase dashboard, go to **Table Editor**.
- [ ] Click each of these tables and check that **RLS** shows a green badge (enabled):
  - [ ] `jobs`
  - [ ] `deliveries`
  - [ ] `inspections`
  - [ ] `invoices_payments`
  - [ ] `status_updates`
  - [ ] `drawing_acknowledgements`
- [ ] If any table shows RLS disabled, run:
  ```sql
  ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;
  ```

---

## Done?

Once all boxes are checked, tell the team: **"Foundation is ready. Pull main and start your Phase B prompts."**
