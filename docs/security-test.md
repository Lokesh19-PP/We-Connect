# VendorFlow Security Verification & Test Checklist

This checklist verifies the security posture of the application, Row-Level Security (RLS) enforcement, storage bucket isolation, and audit trail integrity for **Phase B**.

---

## 1. Secrets & Environment Variable Protection

- [ ] **`.env.local` is not committed to Git**:
  - Run `git status --ignored` and verify `.env.local` appears under Ignored files.
  - Verify `.gitignore` contains `.env*`.
- [ ] **Service Role Key is Never Exposed in Client-Side Code**:
  - Search the client bundle / repository for `SUPABASE_SERVICE_ROLE_KEY`.
  - Verify it is referenced ONLY in `lib/supabase/server.ts:createAdminClient()` and `scripts/seed-users.ts`.
  - It must never be prefixed with `NEXT_PUBLIC_`.
- [ ] **Anon Public Key has Safe Defaults**:
  - Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` can only execute actions permitted by PostgreSQL RLS policies.

---

## 2. Row-Level Security (RLS) Matrix Testing

Log in as each test user and execute the corresponding tests in browser console or Supabase SQL editor using `SET ROLE authenticated; SET request.jwt.claim.sub = '<user_uuid>';`:

| Role | Expected Allowed Actions | Forbidden Actions to Test & Reject | Verified? |
|---|---|---|---|
| **Workshop Staff (Workshop A)** | • View own jobs (`workshop_id = current_workshop()`)<br/>• Insert status updates for own jobs<br/>• Acknowledge drawings for own jobs | • Select jobs belonging to Workshop B (must return 0 rows)<br/>• Update job stage for Workshop B<br/>• View another workshop's deliveries or invoices | [ ] |
| **Workshop Owner (Workshop A)** | • View own jobs<br/>• Upload invoices for own jobs<br/>• View payment status of own jobs | • Read another workshop's invoices<br/>• Approve drawings<br/>• Record deliveries or quality inspections | [ ] |
| **Procurement** | • View all jobs and workshops<br/>• Insert new jobs (`jobs_insert_procurement`)<br/>• Add/update workshops (`workshops_write_procurement`) | • Record quality inspections (Quality only)<br/>• Approve finance invoices (Finance only) | [ ] |
| **Engineering** | • Upload drawing revisions to `drawings` table<br/>• Approve drawing revisions (`is_approved = true`) | • Delete another user's drawing<br/>• Record goods deliveries<br/>• Update invoice payment status | [ ] |
| **Stores** | • Insert goods receipts into `deliveries` table | • Mark invoices as paid<br/>• Approve drawing revisions | [ ] |
| **Quality** | • Insert and update records in `inspections` table | • Move job directly to 'Paid'<br/>• Approve invoices | [ ] |
| **Finance** | • Update `invoices_payments` (approve & mark paid) | • Create new jobs<br/>• Upload engineering drawing revisions | [ ] |
| **Management** | • Read-only access to all dashboards, jobs, reports, snapshots | • Insert or update any job, delivery, or inspection (must fail RLS check) | [ ] |
| **Admin** | • Full read/write access to `users`, `workshops`, and administrative settings | • N/A (super-user profile) | [ ] |

---

## 3. Storage Bucket Policy Verification

- [ ] **`drawings` bucket**:
  - Log in as Engineering &rarr; upload sample PDF &rarr; verify upload succeeds.
  - Log in as Workshop Staff &rarr; try to upload to `drawings` bucket &rarr; verify request is rejected with `403 Forbidden`.
  - Log in as Workshop Staff &rarr; request signed URL for approved drawing &rarr; verify drawing loads.
- [ ] **`photos` bucket**:
  - Log in as Workshop Staff &rarr; upload progress photo &rarr; verify upload succeeds.
  - Verify file size exceeds 5 MB error triggers before upload.
- [ ] **`invoices` bucket**:
  - Log in as Workshop Owner A &rarr; upload invoice PDF &rarr; verify upload succeeds.
  - Log in as Workshop Owner B &rarr; attempt to generate signed URL or download Workshop A's invoice &rarr; verify rejected.
  - Log in as Finance &rarr; verify invoice can be viewed and approved.

---

## 4. Business Rule Database Integrity Constraints

- [ ] **Rule 1 (Single Approved Revision)**:
  - Attempt to execute SQL:
    ```sql
    update drawings set is_approved = true where part_id = 'd0000000-0000-0000-0000-000000000001';
    ```
  - Verify database raises unique violation error on index `one_approved_drawing_per_part`.
- [ ] **Rule 2 (No In-Progress Without Acknowledgement)**:
  - Create a new job with an unacknowledged drawing.
  - Attempt to update `stage = 'in_progress'`.
  - Verify trigger `jobs_require_ack` raises exception: *"Workshop must acknowledge the approved drawing revision before work starts"*.
- [ ] **Rule 3 & 4 (Payment Readiness)**:
  - Query `select payment_readiness('<job_id>');` for:
    1. Undelivered job &rarr; returns `not_ready`.
    2. Delivered job with rejected inspection &rarr; returns `on_hold_quality`.
    3. Delivered job with accepted inspection, no invoice &rarr; returns `not_ready`.
    4. Delivered job with accepted inspection + invoice uploaded &rarr; returns `ready`.

---

## 5. Audit Trail Verification

Verify `audit_log` records events automatically:
- [ ] Stage change on job writes row with `entity = 'job'` and `action = 'stage_changed: ...'`.
- [ ] Drawing acknowledgement writes row with `entity = 'drawing_acknowledgement'`.
- [ ] Inspection recording writes row with `entity = 'inspection'` and `action = 'inspection_result: ...'`.
- [ ] Payment status update writes row with `entity = 'invoices_payments'`.
- [ ] Non-admin users cannot read from `public.audit_log`.
