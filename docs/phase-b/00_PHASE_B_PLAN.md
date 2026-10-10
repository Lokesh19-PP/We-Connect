# Phase B Plan — Working Version

## Purpose

Turn the clickable prototype (sample data, fake role switcher) into the full working app with:

- Real login (Supabase Auth, email + password)
- PostgreSQL database (Supabase)
- File storage (Supabase Storage)
- Row-level security (RLS)
- Email notifications (Resend)
- Hosting (Vercel)

---

## Sequence

> All times are **rough estimates**.

| Step | Who | What | Rough time |
|------|-----|------|------------|
| 0 | Lokesh | Accounts and keys (Supabase, Vercel, Resend) | ~1 hour |
| 1 | Lokesh | Foundation: auth, database, storage, security | ~2–3 days |
| 2 | All 7 in parallel | Each member swaps their own sample data to Supabase | ~1–2 weeks |
| 3 | Lokesh + Soham | Real dashboard, notifications, email | ~3–4 days |
| 4 | Everyone | Test with real roles on a phone | ~2–3 days |
| 5 | Lokesh | Deploy to Vercel | ~1 day |
| 6 | Everyone | Pilot with one real workshop, then Hindi and Marathi | ~2–4 weeks |

---

## Ownership (same as Phase A)

| # | Member | Owns | Files they may edit |
|---|--------|------|---------------------|
| 01 | Lokesh (team lead) | Project setup, app shell, Dashboard, shared types, sample data, rules, role switcher, merging | `app/layout`, `app/page`, `app/login`, `components/layout`, `components/dashboard`, `types/`, `data/sample.ts`, `lib/`, `messages/`, `supabase/` |
| 02 | Tanmay | Jobs list, job detail, per-part timeline | `app/jobs`, `components/jobs`, `data/jobs.ts` |
| 03 | Suyash | Drawing revisions, approval, acknowledgement status, reminders | `app/drawings`, `components/drawings`, `data/drawings.ts` |
| 04 | Vedant | Workshop phone-first view (home, job view, status, photo, invoice upload) | `app/workshop`, `components/workshop` |
| 05 | Shiva | Quality inspection, rework, reinspection, first-pass yield | `app/quality`, `components/quality`, `data/quality.ts` |
| 06 | Abhi | Deliveries, invoices, payment readiness and hold, finance approval | `app/deliveries`, `app/payments`, `components/payments`, `data/payments.ts` |
| 07 | Soham | Vendors, Reports, Settings (users and roles), RFQ placeholder, notifications | `app/vendors`, `app/reports`, `app/settings`, `app/rfqs`, `components/vendors`, `components/reports`, `components/notifications` |

---

## Rules

1. **Never** commit `.env.local` or the service role key.
2. The service role key is **server-only** — never expose it to the browser.
3. Migrate one table at a time and test each before moving on.
4. Read every SQL policy before running it.
5. Merge only through pull requests.
6. Only edit files you own. Need a change in a shared file? Ask Lokesh.

---

## Checklist

- [ ] Step 0 — Lokesh creates Supabase, Vercel, Resend accounts and saves keys
- [ ] Step 1 — Lokesh builds foundation (auth, database, storage, security)
  - [ ] Supabase client setup
  - [ ] Schema additions and RLS policies
  - [ ] Login page and auth context
  - [ ] Data layer pattern
  - [ ] Storage helper
  - [ ] Audit log and security checklist
- [ ] Step 2 — All 7 members swap sample data to Supabase
  - [ ] Tanmay: jobs list, job detail, per-part timeline
  - [ ] Suyash: drawings, acknowledgements, reminders
  - [ ] Vedant: workshop views, photo and invoice upload
  - [ ] Shiva: inspections, rework, first-pass yield
  - [ ] Abhi: deliveries, invoices, payment status
  - [ ] Soham: vendors, reports, settings, notifications, email
  - [ ] Lokesh: dashboard (real data)
- [ ] Step 3 — Lokesh and Soham build real dashboard, notifications, email
- [ ] Step 4 — Everyone tests with real roles on a phone
- [ ] Step 5 — Lokesh deploys to Vercel
- [ ] Step 6 — Pilot with one real workshop, then Hindi and Marathi

---

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Leaked keys (`.env.local` or service role key committed to Git) | Full database access by anyone | Add `.env.local` to `.gitignore` (already done). Never log keys. Rotate immediately if leaked. |
| Wrong RLS policies showing one workshop another's data | Privacy breach, loss of trust | Test every policy with a workshop user and a manufacturer user before merging. Use the test checklist. |
| Big uploads on slow networks (photos, invoices, drawings) | Uploads fail or time out on 4G | Compress images before upload. Enforce a 5 MB file size limit. Show upload progress. |
| SMS/WhatsApp approval delays (Twilio needs business verification) | Delayed launch of phone OTP login | Start with email login only. Add phone OTP later when Twilio is approved. |
| Scope growth (new features creep in during Phase B) | Delays the working version | Stick to the features in AGENTS.md and PROMPT_PLAN.md. No new features until Phase B is deployed. |
