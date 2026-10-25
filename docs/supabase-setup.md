# Supabase Setup Guide & SQL Execution Order

Follow these steps in order when setting up your Supabase project for **VendorFlow Phase B**.

---

## Prerequisites

1. Create a Supabase project at [supabase.com](https://supabase.com) (Region: **Mumbai `ap-south-1`**).
2. Go to **Authentication → Providers → Email**:
   - Ensure **Enable Email provider** is turned ON.
   - Turn OFF **Confirm email** during development so test users can log in immediately without confirmation links.
3. In **Settings → API**, copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `Anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `Service role secret` → `SUPABASE_SERVICE_ROLE_KEY` (Server-only)
4. Add these keys to `.env.local` (do not commit this file).

---

## SQL Execution Order in Supabase SQL Editor

Open the **SQL Editor** in your Supabase dashboard and run the files in the following exact order:

### Step 1: Base Schema (`supabase/migrations/001_base.sql`)
- **File:** [`supabase/migrations/001_base.sql`](file:///c:/Users/lokes/OneDrive/Desktop/GIT-REPO/We-Connect/We-Connect/supabase/migrations/001_base.sql)
- **What it does:**
  - Creates PostgreSQL enums (`app_role`, `job_stage`, `job_risk`, `inspection_result`, `payment_status`).
  - Creates core tables: `workshops`, `users`, `parts`, `drawings`, `jobs`, `drawing_acknowledgements`, `status_updates`, `deliveries`, `inspections`, `invoices_payments`, `assembly_steps`, `audit_log`.
  - Implements **Rule 1**: unique index `one_approved_drawing_per_part`.
  - Implements **Rule 2**: trigger `enforce_ack_before_progress()`.
  - Implements **Rule 3 & 4**: calculation function `payment_readiness()`.
  - Enables Row-Level Security (RLS) on all core tables with workshop isolation select policies.

### Step 2: Schema Additions & Role Policies (`supabase/migrations/002_additions.sql`)
- **File:** [`supabase/migrations/002_additions.sql`](file:///c:/Users/lokes/OneDrive/Desktop/GIT-REPO/We-Connect/We-Connect/supabase/migrations/002_additions.sql)
- **What it does:**
  - Creates `projects` and `notifications` tables.
  - Adds missing columns identified in audit (`challan_number`, `reinspection_date`, `invoice_number`, `email`, `warning`, `notes`, etc.).
  - Creates performance indexes on all foreign keys and composite `(workshop_id, due_date)`.
  - Sets up `updated_at` timestamps and triggers.
  - Implements role-based write RLS policies for Quality, Finance, Engineering, Stores, Workshop Staff, Procurement, and Admin.

### Step 3: Seed Sample Data (`supabase/seed.sql`)
- **File:** [`supabase/seed.sql`](file:///c:/Users/lokes/OneDrive/Desktop/GIT-REPO/We-Connect/We-Connect/supabase/seed.sql)
- **What it does:**
  - Populates 4 projects (`boiler-b200`, `boiler-12`, `boiler-b300`, `boiler-b450`).
  - Populates 6 workshops (Shree Fabricators, Om Engg, Patil Steel, Kulkarni, Deshmukh, Jadhav).
  - Populates 12 parts and 20 drawing revisions.
  - Populates 25 realistic sample jobs.
  - Populates deliveries, inspections, invoice payments, and notifications matching the prototype.

### Step 4: Seed Auth Users (`scripts/seed-users.ts`)
Run the user seeding script from your terminal:
```bash
npx tsx scripts/seed-users.ts
```
*(Requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`)*

This creates the 10 test user accounts in Supabase Auth and links their profile records in `public.users`:

| Email | Password | Role | Workshop |
|---|---|---|---|
| `procurement@test.com` | `test1234` | `procurement` | Manufacturer |
| `production@test.com` | `test1234` | `production` | Manufacturer |
| `engineering@test.com` | `test1234` | `engineering` | Manufacturer |
| `stores@test.com` | `test1234` | `stores` | Manufacturer |
| `quality@test.com` | `test1234` | `quality` | Manufacturer |
| `finance@test.com` | `test1234` | `finance` | Manufacturer |
| `management@test.com` | `test1234` | `management` | Manufacturer |
| `admin@test.com` | `test1234` | `admin` | Manufacturer |
| `workshopA@test.com` | `test1234` | `workshop_owner` | Shree Fabricators |
| `workshopB@test.com` | `test1234` | `workshop_staff` | Om Engg Works |

---

## Verification Checklist

In your Supabase dashboard:
1. **Table Editor**: Open `workshops` &rarr; verify 6 rows exist.
2. **Table Editor**: Open `jobs` &rarr; verify 25 rows exist.
3. **Authentication → Users**: Verify 10 users exist with confirmed emails.
4. **Table Editor**: Open `users` &rarr; verify 10 profile rows with assigned roles and workshop links.
