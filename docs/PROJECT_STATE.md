# VendorFlow (We-Connect) — Project State Audit

**Audit Date:** October 25, 2026  
**Repository:** `Lokesh19-PP/We-Connect` (Branch: `Lokesh`)  
**Scope:** Read-only audit of prototype code, configuration, business rules, database schema, and test/build status.

---

## 1. What Is Built

All 14 routes planned for Phase A are implemented, navigable, and rendered with realistic manufacturing data.

| Route | Purpose | Owner Folder | Data Source | Working Status |
|---|---|---|---|---|
| `/` | Executive Dashboard: 5 summary KPI cards, "Needs Action Today" with quick actions, 14-day assembly shortfall calendar bar chart, 25-row paginated jobs overview, snapshots for vendors, quality, and payments. | Lokesh (`app/page.tsx`, `components/dashboard/`) | `data/sample.ts` via getters (`getJobs()`, `getWorkshops()`, `getAssemblySlots()`) | ✅ Fully works. Interactive filters, reminder modal, tooltips, responsive layout. |
| `/jobs` | Jobs List: Search, multi-criteria filtering (project, vendor, stage, risk, part type), pagination, "New Job" creation dialog. | Tanmay (`app/jobs/`, `components/jobs/`) | `data/jobs.ts` (in-memory store initialized from `data/sample.ts`) | ✅ Fully works. Interactive search, filters, job creation with audit trail. |
| `/jobs/[id]` | Job Detail: Part specs, vendor, stage badge, risk badge, quantity ordered vs accepted, dates, drawing revision & ack status, timeline, audit history, payment/quality summary, stage transition action. | Tanmay (`app/jobs/[id]/`, `components/jobs/`) | `data/jobs.ts`, `data/sample.ts` | ✅ Fully works. Gated stage progression button (Rule 2), timeline, audit log. |
| `/drawings` | Drawing Register & Revision Control: Part search, revision list, upload revision modal, approval action, drawing SVG/PDF viewer, workshop acknowledgement tracking with "Remind vendor" action. | Suyash (`app/drawings/`, `components/drawings/`) | `data/drawings.ts` (in-memory store initialized from `data/sample.ts`) | ✅ Fully works. Upload revision, approval supersedes previous rev, acknowledgement tracking. |
| `/workshop` | Workshop Mobile Portal Home: Phone-first layout for workshop staff/owner showing "My jobs", stages, due dates, drawing acknowledgement alerts, payment status card, status update dialog with photo upload. | Vedant (`app/workshop/`, `components/layout/workshop-shell.tsx`) | `data/sample.ts`, `lib/rules.ts` | ✅ Fully works. Phone layout, role-aware job filtering, status update modal. |
| `/workshop/jobs/[id]` | Workshop Job Detail: Phone-first drawing viewer, 1-tap "Confirm drawing received" button, status progression buttons (Started, In progress, Ready for dispatch) unlocked by acknowledgement, invoice upload. | Vedant (`app/workshop/jobs/[id]/`) | `data/sample.ts`, `lib/rules.ts`, local state | ✅ Fully works. Unlocks status buttons upon drawing acknowledgement, invoice upload form. |
| `/quality` | Quality Inspection Queue & Metrics: First-pass yield (91%), rework count, 4 tabs (To inspect, Rework, Reinspection due, Completed), inspection checklist modal, Accept/Reject with reinspection scheduling. | Shiva (`app/quality/`, `components/quality/`) | `data/quality.ts` (wraps `data/sample.ts`) | ✅ Fully works. Checklist verification, rejection to rework tab, inspection history modal. |
| `/deliveries` | Goods Receipt / Deliveries: Delivery log table with column sorting (date, part, vendor, quantity), "Record Delivery" modal for open jobs capturing challan number, vehicle, transporter, and challan scan upload. | Abhi (`app/deliveries/`, `components/payments/`) | `data/deliveries.ts`, `data/sample.ts` | ✅ Fully works. Column sorting, delivery recording dialog with file upload preview. |
| `/payments` | Payment Readiness & Finance Approval: Invoice register, 3-item readiness checklist, "On hold for quality" banner, "Review invoice" modal, Finance "Approve Payment" and "Mark Paid" actions. | Abhi (`app/payments/`, `components/payments/`) | `data/payments.ts`, `data/sample.ts`, `lib/rules.ts` | ✅ Fully works. Automated payment readiness checklist, approval and mark-paid flow. |
| `/vendors` | Vendor Directory: List of 6 workshops with on-time delivery rates, active job counts, contact person, phone, email, address, warning badges ("No update in 2 days"), "Add Vendor" dialog, vendor detail modal. | Soham (`app/vendors/`, `components/vendors/`) | `data/vendors.ts`, `data/sample.ts` | ✅ Fully works. Directory search, Add Vendor modal, vendor profile drilldown. |
| `/reports` | Executive Reports: Tabbed analytics (Delivery performance by workshop, On-time completion trends, Quality & rework breakdown, Payment aging & average days to pay). | Soham (`app/reports/`, `components/reports/`) | `data/reports.ts`, `data/sample.ts` | ✅ Fully works. Recharts visualizations, tabbed switching, KPI calculations. |
| `/settings` | System Settings & Governance: Managed user accounts table with role assignment and active toggle, permission matrix (10 roles × 21 actions), system threshold configuration inputs. | Soham (`app/settings/`, `components/settings/`) | `data/settings.ts`, `lib/permissions.ts` | ✅ Fully works. User management, permission matrix rendering, threshold form. |
| `/rfqs` | RFQ Placeholder: "Coming Soon" placeholder explaining planned Phase B feature for multi-workshop quoting and comparison. | Soham (`app/rfqs/page.tsx`) | Static content | ✅ Fully works. Clean placeholder page with roadmap highlights; prevents 404s. |
| `/design` | Design System Showcase: Visual design guide, typography scale, color palette swatches, badge preview, drawing mock assets, and layout components. | Shared / Lokesh (`app/design/page.tsx`) | Static design tokens | ✅ Fully works. Interactive token inspection and asset viewer. |

---

## 2. Business Rules Audit

`AGENTS.md` mandates 5 core business rules. Below is the mapping of where each rule is implemented in `lib/rules.ts` and where it is consumed or duplicated in the UI:

| Rule | Description | `lib/rules.ts` Implementation | Screen / Module Consuming It | Duplications & Logic Divergences |
|---|---|---|---|---|
| **Rule 1** | Only ONE drawing revision per part can be approved at a time. | `canApproveDrawing(drawingToApprove, allDrawingsForPart)` (lines 163–180) | `data/drawings.ts:approveDrawing()` (lines 81–84) | In `data/drawings.ts`, approving a revision automatically mutates existing approved drawings to `approved: false` in memory before calling `canApproveDrawing()`. In `supabase/schema.sql`, enforced via `create unique index one_approved_drawing_per_part on drawings(part_id) where is_approved;`. |
| **Rule 2** | A job cannot move to "In progress" until the workshop acknowledges the approved revision. | `canStartWork(job, drawings, acks)` (lines 129–157) | • `components/jobs/job-timeline.tsx` (line 45)<br/>• `app/workshop/jobs/[id]/job-client.tsx` (line 73) | In `app/workshop/jobs/[id]/job-client.tsx`, local component state `hasAcked` is maintained alongside `canStartWork()` to immediately unlock status buttons in the client without refetching data. In `supabase/schema.sql`, enforced via trigger `enforce_ack_before_progress()`. |
| **Rule 3** | Payment is "Ready" only when: delivery exists AND latest inspection is Accepted AND invoice is uploaded. | `getPaymentStatus(deliveries, inspections, invoice)` (lines 27–58) | • `components/payments/payment-readiness-checklist.tsx` (line 52)<br/>• `app/payments/page.tsx` (line 91)<br/>• `components/quality/inspection-dialog.tsx` (line 51)<br/>• `components/jobs/payment-quality-summary.tsx` (line 27)<br/>• `app/workshop/page.tsx` (line 72)<br/>• `app/workshop/jobs/[id]/job-client.tsx` (line 63) | None in screen logic—all UI screens faithfully call `getPaymentStatus()`. However, static objects in `data/payments.ts` and `data/sample.ts` have hardcoded `paymentStatus` fields rather than being dynamically evaluated on import. In `supabase/schema.sql`, mirrored by SQL function `payment_readiness()`. |
| **Rule 4** | A rejected (or pending) inspection sets payment to "On hold for quality". | `getPaymentStatus(deliveries, inspections, invoice)` (lines 48–50) | • `components/payments/payment-readiness-checklist.tsx`<br/>• `app/payments/page.tsx`<br/>• `components/quality/inspection-dialog.tsx` | Handled inside `getPaymentStatus()`. However, in `components/quality/quality-queue.tsx:handleReject()`, rejecting an inspection mutates only local queue state and does not create an inspection record in `data/sample.ts`, meaning the payment hold does not immediately propagate across pages. |
| **Rule 5** | Overdue = past due date. At Risk = predicted to miss due date or assembly need (also Reinspection due, May miss date, On track). | `getRisk(job, today, inspections)` (lines 68–108) | Tested in `lib/rules.test.ts`. Imported in `data/jobs.ts` (line 34) **but never invoked**. | **Major duplication/gap:** Screens and sample data bypass `getRisk()` entirely. Jobs in `data/sample.ts` and `data/jobs.ts` have hardcoded `risk` strings. In `components/quality/quality-queue.tsx`, rejection directly writes `risk: 'Reinspection due'` and acceptance writes `risk: 'On track'` via string assignment instead of passing parameters to `getRisk()`. |

---

## 3. Data Model Gap Analysis

Comparing `types/index.ts` & `data/sample.ts` against `supabase/schema.sql`:

### A. Missing Tables
1. **`users`**: Exists in `supabase/schema.sql` (referencing `auth.users`), but **no `User` interface exists in `types/index.ts`**. A local `ManagedUser` interface exists only inside `data/settings.ts`.
2. **`notifications`**: Defined as `AppNotification` in `types/index.ts` and `data/notifications.ts`, but **completely absent in `supabase/schema.sql`** (slated for migration `002_additions.sql`).
3. **`projects`**: Projects (e.g. `Boiler B-200`, `Boiler #12`) are used throughout UI filters, `data/jobs.ts`, and referenced as `jobs.project_id` in SQL, but **no `projects` table exists in `supabase/schema.sql`**.
4. **`assembly_steps` vs `AssemblySlot`**: SQL has `assembly_steps` table with foreign key `jobs.assembly_step_id`. `types/index.ts` only defines aggregated calendar slots `AssemblySlot: { date, needed, ready }`. There is no TypeScript type for individual assembly steps or the foreign key link.
5. **`audit_log`**: Defined in SQL (`entity`, `entity_id`, `action`, `user_id`, `created_at`). `types/index.ts` has no audit type; `data/jobs.ts` created a divergent local `AuditEvent` type (`jobId`, `type`, `title`, `description`, `actor`, `timestamp`, `badgeVariant`).

### B. Field Discrepancies by Entity

| Entity | Field in TypeScript / Sample Data | Equivalent in `supabase/schema.sql` | Gap / Action Required |
|---|---|---|---|
| **Workshops** | `contactPerson`, `phone`, `email`, `address`, `onTimePercent`, `activeJobs`, `warning` | `contact_person`, `phone`, `location`, `status` | • Missing `email` in SQL.<br/>• `address` in TS vs `location` in SQL.<br/>• `onTimePercent` & `activeJobs` are runtime/computed metrics; should not be stored in SQL.<br/>• Missing `warning` column in SQL.<br/>• `status` ('active') in SQL is missing from TS interface. |
| **Users** | Roles: `Role = 'Procurement' \| 'Workshop Owner' ...` (Title Case with spaces) | `app_role` enum (`'procurement'`, `'workshop_owner'`) | Casing mismatch. Database uses snake_case, frontend uses Title Case with spaces. Mapping helper required. |
| **Parts** | `code`, `name`, `displayName`, `type` | `part_code`, `name`, `material`, `part_type` | • `code` in TS vs `part_code` in SQL.<br/>• `type` in TS vs `part_type` in SQL.<br/>• `displayName` in TS is missing from SQL (can be computed).<br/>• `material` exists in SQL but is missing from `Part` in `types/index.ts`. |
| **Drawings** | `approved`, `uploadedBy`, `uploadedAt`, `approvedBy`, `approvedAt`, `fileUrl` | `is_approved`, `approved_by` (uuid), `approved_at`, `file_url`, `created_at` | • `approved` in TS vs `is_approved` in SQL.<br/>• `uploadedBy` in TS has no column in SQL (needs `uploaded_by uuid references users(id)`).<br/>• `uploadedAt` in TS maps to `created_at` in SQL. |
| **Jobs** | `quantity`, `orderedDate`, `acceptedDate`, `drawingId`, `notes`, `partDisplayName`, `workshopName` | `quantity_ordered`, `quantity_accepted`, `due_date`, `needed_by_date`, `stage`, `risk`, `project_id`, `assembly_step_id`, `created_at` | • `quantity` in TS maps to `quantity_ordered` in SQL.<br/>• `acceptedDate` in TS missing in SQL.<br/>• `drawingId` in TS: SQL does NOT store `drawing_id` on jobs table (drawings link via `drawing_acknowledgements`).<br/>• `notes` in TS missing in SQL `jobs` table.<br/>• `needed_by_date` and `quantity_accepted` in SQL are missing from base `Job` interface in `types/index.ts` (added ad-hoc in `EnrichedJob`). |
| **Drawing Acknowledgements** | `id` (string), `workshopId`, `acknowledgedAt`, `acknowledgedBy` | Composite PK `(job_id, drawing_id)`, `confirmed_by` (uuid), `confirmed_at` | • TS has surrogate `id`, SQL uses composite key.<br/>• `workshopId` in TS is redundant (derivable via `jobs.workshop_id`).<br/>• `acknowledgedAt/By` in TS vs `confirmed_at/by` in SQL. |
| **Status Updates** | `workshopId`, `status` (`WorkshopStatus`), `message`, `photoUrl`, `updatedAt`, `updatedBy` | `job_id`, `status` (text), `note`, `photo_url`, `created_by` (uuid), `created_at` | • `workshopId` redundant.<br/>• `message` in TS vs `note` in SQL.<br/>• `updatedAt/By` in TS vs `created_at/by` in SQL. |
| **Deliveries** | `receivedBy`, `quantity`, `challanNumber`, `vehicleNumber`, `transporterName`, `notes`, `challanFileUrl` | `job_id`, `quantity`, `delivered_at`, `challan_url` | • SQL `deliveries` table is missing `received_by`, `challan_number`, `vehicle_number`, `transporter_name`, and `notes`. |
| **Inspections** | `deliveryId`, `inspectedDate`, `inspectedBy`, `result`, `remarks`, `reinspectionDate` | `job_id`, `result`, `checklist` (jsonb), `remarks`, `photo_url`, `inspector_id`, `inspected_at` | • In TS, `Inspection` references `deliveryId`. In SQL, `inspections` references `job_id`.<br/>• SQL is missing `reinspection_date` column.<br/>• TS interface is missing `checklist` and `photoUrl`. |
| **Invoices / Payments** | `invoiceNumber`, `invoiceDate`, `amount`, `invoiceFileUrl`, `paymentStatus`, `paidDate`, `paidAmount` | `job_id` (unique), `invoice_url`, `invoice_amount`, `payment_status`, `approved_by`, `paid_at` | • SQL `invoices_payments` table is missing `invoice_number`, `invoice_date`, and `paid_amount`.<br/>• Enum value difference: `on_hold_quality` in SQL vs `On hold for quality` in TS. |

---

## 4. Differences from AGENTS.md

1. **Enum & Identifier Casing**:
   - `AGENTS.md` specifies human-readable Title Case with spaces for UI display (`Ordered`, `In progress`, `On hold for quality`, `Workshop Owner`).
   - `supabase/schema.sql` defines PostgreSQL enums in lowercase snake_case (`in_progress`, `on_hold_quality`, `workshop_owner`). Phase B needs bidirectional serialization helpers.
2. **Role Names**:
   - Exactly 10 roles match between `AGENTS.md`, `types/index.ts`, and `lib/permissions.ts`.
   - SQL enum `app_role` covers the same 10 roles in lowercase snake_case.
3. **Screen Completeness**:
   - All 13 primary user routes plus 1 placeholder route (`/rfqs`) exist and render without 404s. No required prototype screens are missing.
4. **Drawing Approval Rule vs UI Flow**:
   - `AGENTS.md` Rule 1: *"Only ONE drawing revision per part can be approved at a time."*
   - UI (`components/drawings/DrawingRegister.tsx` & `data/drawings.ts`) automatically revokes earlier approvals when approving a new revision, rather than blocking the user with an error prompt. This is convenient UX, but technically diverges from strict manual revocation.
5. **Quality Queue Tab Vocabulary**:
   - `AGENTS.md` defines stages and risk values, but not queue tab titles. `components/quality/quality-queue.tsx` uses tabs `To inspect`, `Rework`, `Reinspection due`, `Completed`.

---

## 5. Build, Lint, and Test Execution Results

### A. `npm install`
- **Result:** ❌ **FAILED** (Exit code: 1)
- **Error:**
  ```text
  npm error code ERESOLVE
  npm error ERESOLVE could not resolve
  npm error Conflicting peer dependency: @types/node@26.x
  npm error peerOptional @types/node@"^22.0.0 || >=24.0.0" from vitest@5.0.3
  npm error dev @types/node@"^20" from the root project
  ```
- **Cause:** `package.json` pins `@types/node` to `^20`, while `vitest@5.0.3` declares a peerOptional requirement for `@types/node` `>=22`.
- **Workaround:** `npm install --legacy-peer-deps` succeeds, or upgrade `@types/node` to `^22`.

### B. `npm run build`
- **Result:** ⚠️ **Compiled successfully; exited on Next.js Security Advisory**
- **Details:**
  - TurboPack compiled successfully in 10.0s.
  - TypeScript typecheck passed cleanly in 5.4s without compilation errors.
  - All 17 pages/routes generated and prerendered successfully (14 static, 3 partial prerender).
  - Exit code 1 was thrown by Next.js 16.4.0's runtime security vulnerability blocker (`SecurityFatalError`), which recommends running:
    ```bash
    next upgrade --agent=security
    ```

### C. `npm run lint`
- **Result:** ❌ **FAILED** (Exit code: 1)
- **Problem Count:** **112 problems (35 errors, 77 warnings)**
- **Breakdown of Errors:**
  1. `react-hooks/static-components` (4 errors): `SortIcon` declared inside render function in `app/deliveries/page.tsx:144`.
  2. `react-hooks/purity` (2 errors): Impure `Date.now()` called directly during component render in `app/payments/page.tsx:102` and `components/layout/demo-guide-panel.tsx:118`.
  3. `react-hooks/set-state-in-effect` (2 errors): Synchronous `setState` called directly within `useEffect` body in `app/workshop/jobs/[id]/job-client.tsx:27` and `components/jobs/new-job-dialog.tsx:63`.
  4. `@typescript-eslint/no-explicit-any` (4 errors): Forbidden `any` types used in `app/vendors/page.tsx:191,205`, `app/workshop/jobs/[id]/job-client.tsx:16`, and `components/reports/payment-report.tsx:87` (violates `AGENTS.md` Rule 9).
  5. `react/no-unescaped-entities` (17 errors): Unescaped single/double quotes in JSX text across `app/reports/`, `app/rfqs/`, `components/payments/`, `components/quality/`, and `components/settings/`.
  6. `prefer-const` (6 errors): Unreassigned `let` bindings in `components/quality/quality-metrics.tsx`, `data/drawings.ts`, and `data/jobs.ts`.
  7. `@typescript-eslint/no-unused-vars` (77 warnings): Unused imports and variables across multiple components and data files.

### D. `npx vitest run`
- **Result:** ✅ **PASSED** (Exit code: 0)
- **Test Files:** 1 passed (`lib/rules.test.ts`)
- **Tests:** **23 passed, 0 failed** (Duration: 1.43s)
  - `canApproveDrawing`: 3 tests passed
  - `canStartWork`: 3 tests passed
  - `getPaymentStatus`: 8 tests passed
  - `getRisk`: 7 tests passed
  - `getAssemblyShortfall`: 2 tests passed

---

## 6. Prioritised Risks and Tech Debt for Phase B

### P0 — Critical (Must Resolve in Foundation / Step 1)
1. **Database Schema & Type Schema Alignment:**
   - `supabase/schema.sql` lacks multiple fields used heavily in the prototype UI:
     - `deliveries`: missing `challan_number`, `received_by`, `vehicle_number`, `transporter_name`, `notes`.
     - `invoices_payments`: missing `invoice_number`, `invoice_date`, `paid_amount`.
     - `inspections`: references `job_id` instead of `delivery_id`; missing `reinspection_date`.
     - `workshops`: missing `email`, `address`, `warning`.
     - Missing tables: `notifications`, `projects`.
   - *Action:* Migration `002_additions.sql` must add these missing columns and tables before team members swap sample data.
2. **Database Enum vs TypeScript Value Mapping:**
   - PostgreSQL enums use snake_case (`workshop_owner`, `on_hold_quality`, `in_progress`), whereas frontend types and UI text use Title Case (`Workshop Owner`, `On hold for quality`, `In progress`).
   - *Action:* Provide a typed translation layer in `lib/supabase/data-mappers.ts`.
3. **Peer Dependency Conflict Resolution:**
   - `@types/node` v20 conflicts with `vitest` v5 during clean `npm install`.
   - *Action:* Update `@types/node` to `^22` in `package.json`.

### P1 — High (Resolve Before / During Member Data Swap)
4. **Fix 35 ESLint Errors:**
   - React 19 hook purity errors (`Date.now()` during render, component declaration inside render, synchronous `setState` in effect) and `@typescript-eslint/no-explicit-any` must be fixed so `npm run build` and CI do not fail.
5. **Connect `getRisk()` to Dynamic Job Data:**
   - `getRisk()` is currently dead code in the UI; jobs use static mock risk values.
   - *Action:* When fetching jobs from Supabase or displaying them in tables, compute `job.risk = getRisk(job, new Date(), inspections)`.
6. **Next.js Security Upgrade:**
   - Next.js 16.4.0 triggers an interactive security upgrade halt.
   - *Action:* Upgrade Next.js to latest patched version (`16.4.1+`).

### P2 — Medium (Architecture & Quality of Life)
7. **Cross-Module State Synchronization:**
   - In Phase A, each member kept local module-level arrays (`data/drawings.ts`, `data/quality.ts`, etc.). Recording an inspection in `/quality` does not reflect in `/jobs/[id]` or `/`.
   - *Resolution:* Moving to Supabase (Phase B) natively fixes this since the database becomes the single source of truth.
8. **Storage Policies & Upload Constraints:**
   - Mock uploads currently generate fake data URLs or local strings.
   - *Action:* Implement `lib/storage.ts` with 5 MB validation and client-side image compression before uploading to private Supabase buckets (`drawings`, `photos`, `invoices`).
