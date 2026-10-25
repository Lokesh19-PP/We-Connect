# Phase B Security & System Test Checklist

This checklist documents the verification of all security boundaries, Row-Level Security (RLS) enforcement, database integrity triggers, storage isolation, automated notifications, and the end-to-end mobile demo flow for **Phase B**.

---

## 1. Master Security & Business Rules Test Matrix

| Test | Role | Expected result | Pass/Fail |
|---|---|---|---|
| **Workshop sees only its own data** | `workshop_owner` / `workshop_staff` (Workshop A) | • Querying `jobs` returns only Workshop A jobs (`workshop_id = 'c0000000-0000-0000-0000-000000000001'`).<br/>• Querying Workshop B jobs returns 0 rows.<br/>• Attempting to update a Workshop B job returns 0 rows updated / blocked by RLS.<br/>• Deliveries, status updates, and invoices display only Workshop A records. | **Pass** *(Automated in `tests/rls.test.ts` & RLS policies in `001_base.sql`)* |
| **Management is read-only** | `management` | • Can query and view all jobs, deliveries, inspections, reports, and dashboards across all workshops.<br/>• Attempting to insert a job is rejected by PostgreSQL RLS (`jobs_insert_procurement`).<br/>• Attempting to update or delete any record is rejected by RLS.<br/>• Action buttons (`job.create`, `payment.approve`, `drawing.approve`, etc.) return `false` in `can('Management', action)`. | **Pass** *(Automated in `tests/rls.test.ts` & `tests/rules-security.test.ts`)* |
| **Quality cannot approve payments** | `quality` | • Quality inspector can view the payments page, but `payment.approve` and `payment.upload_invoice` return `false` in `can()`.<br/>• Direct SQL update on `invoices_payments` is blocked by RLS policy `payments_update_finance` (0 rows modified).<br/>• Quality inspector can record and update inspection records in `inspections`. | **Pass** *(Automated in `tests/rls.test.ts` & `tests/rules-security.test.ts`)* |
| **Finance cannot approve drawings** | `finance` | • Finance officer can view drawings, but `drawing.approve` returns `false` in `can()`.<br/>• Direct SQL update of `is_approved = true` on `drawings` table is blocked by RLS policy `drawings_update_engineering` (0 rows modified).<br/>• Finance officer can approve invoices and mark payments as paid. | **Pass** *(Automated in `tests/rls.test.ts` & `tests/rules-security.test.ts`)* |
| **No In progress without acknowledgement** | `workshop_staff` / `workshop_owner` | • UI: `canStartWork()` returns `allowed: false` with warning when drawing has not been acknowledged.<br/>• Database: Attempting to update a job to `stage = 'in_progress'` is intercepted by PostgreSQL trigger `enforce_ack_before_progress()`, raising exception: *"Workshop must acknowledge the approved drawing revision before work starts"*. | **Pass** *(Automated in `tests/rules-security.test.ts`, `lib/rules.test.ts`, and DB trigger `jobs_require_ack`)* |
| **One approved drawing per part** | `engineering` | • UI: `canApproveDrawing()` returns `allowed: false` if another revision for the same part is already marked approved.<br/>• Database: Partial unique index `create unique index one_approved_drawing_per_part on drawings(part_id) where is_approved;` raises a unique violation on any concurrent duplicate approval. | **Pass** *(Automated in `tests/rules-security.test.ts`, `lib/rules.test.ts`, and DB index `one_approved_drawing_per_part`)* |
| **Payment Ready only with delivery, accepted inspection and invoice** | `finance` / System | • Evaluated dynamically via `getPaymentStatus()` and SQL function `payment_readiness()`.<br/>• If delivery is missing &rarr; returns `Not ready`.<br/>• If invoice is missing &rarr; returns `Not ready`.<br/>• If inspection is missing or pending &rarr; returns `On hold for quality`.<br/>• Only when delivery exists + latest inspection is Accepted + invoice is uploaded &rarr; returns `Ready`. | **Pass** *(Automated in `lib/rules.test.ts`, `tests/rules-security.test.ts`, and SQL function `payment_readiness`)* |
| **Rejected inspection means on hold for quality** | `quality` / `finance` | • When Quality records an inspection with `result = 'Rejected'`, payment status immediately transitions to `On hold for quality`.<br/>• Finance approval is blocked until reinspection is performed and marked `Accepted`. | **Pass** *(Automated in `lib/rules.test.ts`, `tests/rules-security.test.ts`, and SQL function `payment_readiness`)* |
| **Uploads over 5 MB refused** | All authenticated roles | • Files exceeding `5 * 1024 * 1024` bytes are validated and blocked client-side in `lib/storage.ts:uploadFile()` before upload, returning: *"File size exceeds the 5 MB limit"*. Storage buckets also enforce the 5 MB limit. | **Pass** *(Automated in `tests/rules-security.test.ts` and storage policy `003_storage.sql`)* |
| **Signed links expire** | All authenticated roles | • All files uploaded to `drawings`, `photos`, and `invoices` buckets are strictly private.<br/>• File access is mediated through `lib/storage.ts:getSignedUrl()` using a 3600-second (1 hour) expiration TTL.<br/>• Expired tokens return `403 Forbidden` from Supabase Storage CDN. | **Pass** *(Verified in `lib/storage.ts` and Supabase Storage configuration)* |
| **Notifications and emails fire** | System / Background | • In-app: `NotificationBell` connects to Supabase Realtime channel for `notifications` table, auto-increments unread count, and supports single/all mark-as-read.<br/>• Resend Email events: (1) Drawing revision approved, (2) Drawing revision not acknowledged, (3) Inspection rejected, (4) Payment ready, (5) Payment paid.<br/>• If `RESEND_API_KEY` is empty/placeholder, cleanly falls back to structured console logging without runtime errors. | **Pass** *(Verified in `lib/email/index.ts`, `app/api/email/route.ts`, and `NotificationBell` component)* |

---

## 2. Storage Bucket Isolation Matrix

| Test | Role | Expected result | Pass/Fail |
|---|---|---|---|
| Engineering uploads drawing PDF | `engineering` | Drawing upload succeeds in private `drawings` bucket; signed URL generated. | **Pass** |
| Workshop attempts upload to drawings bucket | `workshop_staff` | Upload to `drawings` bucket is rejected with 403 Forbidden. | **Pass** |
| Workshop uploads progress photo | `workshop_staff` | Photo upload succeeds in private `photos` bucket under job directory. | **Pass** |
| Workshop Owner uploads invoice PDF | `workshop_owner` (Workshop A) | Invoice upload succeeds in private `invoices` bucket. | **Pass** |
| Other workshop accesses invoice | `workshop_owner` (Workshop B) | Workshop B cannot generate signed URL or download Workshop A's invoice. | **Pass** |
| Finance views and reviews invoice | `finance` | Finance generates signed URL and views invoice PDF in review modal. | **Pass** |

---

## 3. End-to-End Demo Flow (7-Step Phone Verification)

Tested on phone viewport (390×844) over 4G network simulation:

| Step | Action | Role | Expected result | Pass/Fail |
|---|---|---|---|---|
| **Step 1** | Create a job for Bracket B-204 | `procurement` | Job is created with stage "Ordered", due date, quantity, and project association. Visible in Jobs list. | **Pass** |
| **Step 2** | Approve drawing Rev v3; Workshop C pending ack | `engineering` | Drawing marked approved; previous approved revision revoked; acknowledgement status displays "Pending" for Workshop C. | **Pass** |
| **Step 3** | Open phone view (`/workshop`), confirm drawing, post "Started" | `workshop_staff` (Workshop C) | Drawing acknowledgement recorded; stage transitions to "In progress". Stage button unlocked upon acknowledgement. | **Pass** |
| **Step 4** | Record goods receipt / delivery | `stores` | Delivery challan recorded with vehicle number and challan file. Quantity accepted updated. | **Pass** |
| **Step 5** | Reject inspection, then re-inspect and accept | `quality` | • 1st inspection: Marked "Rejected", rework entry created, payment status switches to "On hold for quality".<br/>• 2nd inspection: Reinspection marked "Accepted", unlocking payment readiness. | **Pass** |
| **Step 6** | Upload invoice; Payment moves "On hold" &rarr; "Ready" &rarr; Finance marks paid | `workshop_owner` &rarr; `finance` | Invoice uploaded; payment readiness checklist passes (delivery + accepted inspection + invoice); status becomes "Ready"; Finance clicks "Approve Payment" and "Mark Paid". | **Pass** |
| **Step 7** | Dashboard and Reports reflect all updates | `procurement` / `management` | KPI cards, 14-day assembly shortfall calendar, snapshot sections, and executive reports update in real-time. | **Pass** |

---

## 4. Performance & Reliability Verification

| Test | Role | Expected result | Pass/Fail |
|---|---|---|---|
| **Page load time on slow 4G** | Any role | All primary routes load within 3 seconds under 4G throttling; skeleton loaders prevent layout shift. | **Pass** |
| **Dashboard auto-refresh** | Internal roles | Dashboard data re-queries Supabase every 60 seconds automatically without full page reload. | **Pass** |
| **Service Role Key Isolation** | Security Audit | Service role key is never exported to client-side bundles; only used server-side (`lib/supabase/server.ts`). | **Pass** |
| **Audit Trail Immutability** | Security Audit | All stage changes, drawing acknowledgements, inspections, and payment changes log rows to `audit_log`. Non-admin users cannot read or delete audit logs. | **Pass** |
