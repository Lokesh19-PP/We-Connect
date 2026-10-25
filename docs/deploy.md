# VendorFlow (We-Connect) — Deployment Guide & Rollback Plan

This document outlines the deployment procedure for Vercel, required environment variables, production deployment checklist, and incident rollback procedures.

---

## 1. Environment Variables for Vercel

Configure all environment variables in the **Vercel Dashboard &rarr; Project Settings &rarr; Environment Variables**.

| Variable Name | Scope | Security Level | Purpose & Example |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client & Server | Public | URL of your Supabase project instance.<br/>Example: `https://xyzproject.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client & Server | Public (Restricted via RLS) | Anon public API key used by client-side Supabase queries.<br/>Example: `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-Only** | **Sensitive / Secret** | Admin service role key with full bypass capabilities. Used strictly in server contexts (`lib/supabase/server.ts:createAdminClient()`).<br/>**CRITICAL: Never prefix with `NEXT_PUBLIC_`!** |
| `NEXT_PUBLIC_USE_SAMPLE` | Client & Server | Public | Set to `false` in production to use live Supabase data and disable prototype-only demo controls (e.g. demo guide drawer, sample reset). Set to `true` only for offline demos. |
| `RESEND_API_KEY` | **Server-Only** | **Sensitive / Secret** | Resend API key for transactional emails (drawing approved, inspection rejected, payment ready/paid).<br/>Example: `re_xxxxxxxxxxxxxx`<br/>*If empty, emails are logged to server console without throwing errors.* |

> [!CAUTION]
> **Zero Secrets in Client Bundle**: Verify that `SUPABASE_SERVICE_ROLE_KEY` and `RESEND_API_KEY` are **never** prefixed with `NEXT_PUBLIC_`. Vercel automatically exposes any variable starting with `NEXT_PUBLIC_` to the public browser runtime.

---

## 2. Pre-Deployment Database Setup

Before triggering the first production deployment on Vercel, ensure the target Supabase project has been initialized:

1. **Run SQL Migrations in Supabase SQL Editor** in numerical order:
   - `supabase/migrations/001_base.sql` (Core schema, tables, triggers, and read RLS policies)
   - `supabase/migrations/002_additions.sql` (Role write RLS policies, notifications, projects, audit triggers)
   - `supabase/migrations/003_storage.sql` (Private storage buckets: `drawings`, `photos`, `invoices`)
   - `supabase/migrations/004_audit_triggers.sql` (Automated audit trail triggers on all core entities)
   - `supabase/migrations/005_dashboard.sql` (Aggregated database views and RPC summary functions)
2. **Seed Initial Data & Users**:
   - Run `supabase/seed.sql` to populate sample parts, projects, and assembly steps.
   - Run `npm run seed:users` locally with production credentials in `.env.local` to create authenticated users for all 10 roles.

---

## 3. Deployment Checklist

### Pre-Deploy Verification (Local Machine)
- [ ] Run test suite: `npm test` (all unit & RLS tests pass).
- [ ] Run code linter: `npm run lint` (zero ESLint errors).
- [ ] Run production build: `npm run build` (Next.js compilation succeeds with exit code 0).
- [ ] Verify `.env.local` is listed in `.gitignore` and has not been committed.

### Vercel Project Configuration
- [ ] Import GitHub repository `Lokesh19-PP/We-Connect` into Vercel.
- [ ] Set Root Directory to `We-Connect` (or root if flattened).
- [ ] Set Framework Preset to **Next.js**.
- [ ] Add all 5 environment variables from Section 1 for **Production**, **Preview**, and **Development**.
- [ ] Enable Vercel Speed Insights and Analytics (optional).

### Post-Deploy Verification (Live URL)
- [ ] **Health Check**: Visit `https://<your-app>.vercel.app/api/health`. Verify it returns HTTP 200 with JSON:
  ```json
  { "status": "ok", "timestamp": "...", "service": "vendorflow", "environment": "production" }
  ```
- [ ] **Authentication**: Log in with `procurement@test.com` and `workshopA@test.com`. Verify session cookies refresh.
- [ ] **RLS Isolation**:
  - Log in as Workshop A &rarr; Verify only Workshop A jobs are visible.
  - Log in as Management &rarr; Verify dashboards and reports load, but all mutating buttons are disabled/hidden.
- [ ] **Storage Buckets**: Upload a sample PDF drawing as Engineering; verify file upload succeeds and signed link renders.
- [ ] **File Size Limit**: Attempt upload of a file > 5 MB; verify client error banner blocks upload.
- [ ] **Live Dashboard**: Confirm KPI cards, shortfall calendar, and snapshots populate from Supabase.
- [ ] **Realtime Notifications**: Open two browser tabs; trigger an action; verify notification bell updates count.
- [ ] **Mobile Performance**: Open `/workshop` on a mobile device over 4G; verify initial page load < 3 seconds.

---

## 4. Rollback Plan & Disaster Recovery

### Scenario A: Deployment Bug or Regressed Build
If a newly deployed build has broken UI or unexpected runtime crashes:
1. Go to **Vercel Dashboard &rarr; Deployments**.
2. Locate the previous successful deployment.
3. Click the three dots menu (`...`) &rarr; select **Instant Rollback**.
4. Vercel immediately points production traffic to the previous deployment artifact within seconds without rebuilding.

### Scenario B: Supabase Database Outage / Unreachable Database
If Supabase experiences infrastructure downtime or maintenance:
1. Open **Vercel Dashboard &rarr; Project Settings &rarr; Environment Variables**.
2. Change `NEXT_PUBLIC_USE_SAMPLE` from `false` to `true`.
3. Trigger a redeploy (or promote previous deployment).
4. The application immediately boots into self-contained in-memory sample mode, allowing factory floor operators and stakeholders to navigate the app and view demo data without crashing.

### Scenario C: Leaked Secrets or API Key Compromise
If the `SUPABASE_SERVICE_ROLE_KEY` or `RESEND_API_KEY` is accidentally leaked:
1. **Supabase Key Rotation**:
   - Go to Supabase Dashboard &rarr; **Project Settings &rarr; API**.
   - Under **Project API keys**, click **Reset service_role secret**.
   - Copy the newly generated secret.
   - Update `SUPABASE_SERVICE_ROLE_KEY` in Vercel Environment Variables.
   - Click **Redeploy** on Vercel.
2. **Resend Key Rotation**:
   - Go to Resend Dashboard &rarr; **API Keys**.
   - Create a new API Key & delete the compromised key.
   - Update `RESEND_API_KEY` in Vercel Environment Variables.
3. **Audit Log Inspection**:
   - Query `select * from audit_log order by created_at desc limit 100;` to verify no unauthorized actions occurred during the compromise window.

### Scenario D: Database Migration Rollback
If a database migration introduced an invalid constraint or broken view:
- To roll back a view/RPC: run `drop view if exists <view_name> cascade;` or restore the previous version from `supabase/migrations/`.
- To roll back a table trigger: run `drop trigger if exists <trigger_name> on <table_name>;`.
- Supabase automatically takes daily point-in-time backups (PITR). You can restore to any point in time via the Supabase Dashboard &rarr; **Database &rarr; Backups**.
