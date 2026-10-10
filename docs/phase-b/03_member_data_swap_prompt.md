# Member Data Swap Prompt

After Lokesh finishes the foundation (Step 1) and pushes to `main`, every member pulls and uses this prompt template.

---

## Prompt template

Copy the prompt below, replace `[NAME]` with your name, and paste it into Antigravity.

```
Follow AGENTS.md and docs/data-layer.md. I am [NAME]. Replace the sample data in my data file and screens with Supabase queries and inserts using lib/supabase and lib/data, keeping function names and return types the same. Use lib/storage.ts for every file upload. Handle loading, empty and error states and show a toast on success and failure. Do not trust the UI for permissions: rely on RLS and can(). Only edit my own files. After each screen run npm run build and commit. Do not push. Tell me how to test each change as a real logged-in user.
```

---

## Member table

| Member | Tables they touch | Files they edit | Phase B extras |
|--------|-------------------|-----------------|----------------|
| Tanmay | `jobs`, `parts` | `app/jobs`, `components/jobs`, `data/jobs.ts` | New job insert (Supabase insert into `jobs`). Job history from `audit_log`. |
| Suyash | `drawings`, `drawing_acknowledgements` | `app/drawings`, `components/drawings`, `data/drawings.ts` | Drawing upload via `lib/storage.ts` (drawings bucket). Reminders create rows in `notifications`. |
| Vedant | `status_updates`, `drawing_acknowledgements`, `invoices_payments` | `app/workshop`, `components/workshop` | Photo upload via `lib/storage.ts` (photos bucket). Invoice upload via `lib/storage.ts` (invoices bucket). Offline retry for poor network. |
| Shiva | `inspections` | `app/quality`, `components/quality`, `data/quality.ts` | Rework flow (rejection → reinspection). First-pass yield calculated from SQL (accepted on first try / total inspected). |
| Abhi | `deliveries`, `invoices_payments` | `app/deliveries`, `app/payments`, `components/payments`, `data/payments.ts` | Payment status comes from the database function `payment_readiness()` — never set manually. Invoice upload via `lib/storage.ts` (invoices bucket). |
| Soham | `workshops`, `users`, `notifications` | `app/vendors`, `app/reports`, `app/settings`, `app/rfqs`, `components/vendors`, `components/reports`, `components/notifications` | Vendor CRUD (workshops table). User and role management in settings. Reports from SQL queries/views. Notifications table (read/unread). Resend email on 5 events: drawing approved, revision not acknowledged (3 days), inspection rejected, payment ready, payment paid. |
| Lokesh | `jobs`, `assembly_steps`, `parts` (read-only for dashboard) | `app/page`, `components/dashboard`, `data/sample.ts` | Dashboard from real data — see `04_dashboard_and_deploy_prompts.md`. |

---

## How to test

1. Pull the latest `main` branch.
2. Copy `.env.example` to `.env.local` and fill in the Supabase keys (ask Lokesh).
3. Run `npm run dev`.
4. Log in with the test user for your role (see `01_manual_setup.md` for credentials).
5. Verify your screens load data from Supabase, not from sample data.
6. Test loading states (slow network), empty states (no data), and error states (wrong key).
7. Test that RLS works: a workshop user should only see their own jobs.
8. Open a pull request into `main` when all screens work.
