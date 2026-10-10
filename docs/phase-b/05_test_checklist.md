# Phase B Test Checklist

Test every item below before considering Phase B complete. Log in as the specified role and verify the expected result.

---

## Row-Level Security (RLS)

| Test | Role to log in as | Expected result | Pass/Fail |
|------|-------------------|-----------------|-----------|
| Workshop user sees only its own jobs | workshop_owner (Workshop A) | Jobs list shows only Workshop A jobs. No Workshop B jobs visible. | |
| Workshop user sees only its own drawings | workshop_owner (Workshop A) | Drawings page shows only drawings linked to Workshop A's jobs. | |
| Workshop user sees only its own deliveries | workshop_owner (Workshop A) | Deliveries page shows only deliveries for Workshop A's jobs. | |
| Workshop user sees only its own payments | workshop_owner (Workshop A) | Payments page shows only invoices/payments for Workshop A's jobs. | |
| Management is read-only | management | Can view all pages. Cannot create, edit, or delete anything. All action buttons are hidden or disabled. | |
| Quality cannot approve payments | quality | Payments page is visible but the "Approve" and "Mark Paid" buttons are hidden or disabled. | |
| Finance cannot approve drawings | finance | Drawings page is visible but the "Approve" button is hidden or disabled. | |

---

## Business Rules

| Test | Role to log in as | Expected result | Pass/Fail |
|------|-------------------|-----------------|-----------|
| Job cannot move to In Progress without acknowledgement | workshop_staff | Clicking "Start Work" on a job whose approved drawing has not been acknowledged shows an error. The database trigger blocks the update. | |
| Only one approved drawing per part | engineering | Approving a new drawing for a part that already has an approved drawing either supersedes the old one or is blocked by the unique index. | |
| Payment is Ready only with delivery + accepted inspection + invoice | finance | A job with all three shows status "Ready". Missing any one shows "Not Ready" or "On Hold". | |
| Rejected inspection puts payment on hold for quality | quality | After rejecting an inspection, the payment status changes to "On Hold — Quality". | |

---

## File Uploads and Storage

| Test | Role to log in as | Expected result | Pass/Fail |
|------|-------------------|-----------------|-----------|
| Uploads over 5 MB are refused | workshop_staff | Trying to upload a file larger than 5 MB shows a clear error message. The file is not uploaded. | |
| Signed file links expire | any authenticated user | A signed URL for a drawing, photo, or invoice stops working after 1 hour. | |

---

## Notifications and Email

| Test | Role to log in as | Expected result | Pass/Fail |
|------|-------------------|-----------------|-----------|
| Email on drawing approved | engineering (approve a drawing) | The workshop owner for related jobs receives an email notification. | |
| Email on revision not acknowledged (3+ days) | any | Workshop that has not acknowledged after 3 days gets a reminder email. | |
| Email on inspection rejected | quality (reject an inspection) | The workshop owner receives an email about the rejection. | |
| Email on payment ready | finance (or automatic) | The workshop owner receives an email that payment is ready. | |
| Email on payment paid | finance (mark as paid) | The workshop owner receives an email confirming payment. | |

---

## End-to-End Demo Flow (7 steps)

Run the full demo on a **real phone over 4G**.

| Step | Action | Role | Expected result | Pass/Fail |
|------|--------|------|-----------------|-----------|
| 1 | Create a job for Bracket B-204 | procurement | Job appears in the jobs list with stage "Ordered". | |
| 2 | Approve drawing Rev v3. Workshop C has not acknowledged. | engineering | Drawing shows "Approved". Acknowledgement status shows "Pending" for Workshop C. | |
| 3 | Open phone view, confirm drawing, post "Started" | workshop_staff (Workshop C) | Drawing acknowledgement recorded. Job moves to "In Progress". | |
| 4 | Record a delivery | stores | Delivery recorded. Quantity updated on the job. | |
| 5 | Reject inspection, then re-inspect and accept | quality | First inspection: "Rejected", rework created. Second inspection: "Accepted". | |
| 6 | Upload invoice. Payment shows "On Hold" → "Ready". Finance marks paid. | workshop_staff → finance | Invoice uploaded. Status moves from "On Hold" to "Ready" to "Paid". | |
| 7 | Dashboard and Reports reflect all changes | procurement / management | Dashboard cards, activity feed, and reports show the correct numbers. | |

---

## Performance

| Test | Role to log in as | Expected result | Pass/Fail |
|------|-------------------|-----------------|-----------|
| Page load time on slow network | any | All pages load in under 3 seconds on a simulated slow 4G connection. | |
| Dashboard refresh | any internal role | Dashboard data refreshes every 60 seconds without a full page reload. | |
