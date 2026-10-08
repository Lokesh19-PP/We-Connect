# Tanmay: Jobs (List, Detail, Timeline)

**Branch:** `feat/tanmay-jobs`
**You own:** `app/jobs`, `components/jobs`, `data/jobs.ts`
**Routes:** `/jobs`, `/jobs/[id]`
**Wait for:** Lokesh's base on `main`. Then `git pull`.

## Prompt 1: Jobs list
```
Follow AGENTS.md. I am Tanmay. Build /jobs (app/jobs/page.tsx, components in components/jobs).
- Table: Job, Part, Vendor, Ordered / Accepted, Stage, Due date, Needed by, Risk. Use getJobs() from @/data/sample and the Risk badge colours in AGENTS.md.
- Search box and filters: Project / Boiler, Vendor, Date range, Part type, Stage, Risk.
- Pagination (10 per page), sortable columns, row click opens /jobs/[id].
- Orange "New Job" button opens a dialog; support opening it automatically when the URL has ?new=1.
- Loading and empty states.
```

## Prompt 2: New Job dialog
```
Follow AGENTS.md. Build the New Job dialog: part (select), quantity, workshop (select), material, due date, needed-by assembly date. Validate required fields. Only roles allowed by can(role, "job.create") see the button. On submit, add the job to local state (and data/jobs.ts helper) with stage "Ordered", attach the currently approved drawing revision for the part, and show a toast.
```

## Prompt 3: Job detail page
```
Follow AGENTS.md. Build /jobs/[id]: header with part, vendor, stage badge, risk badge; quantity ordered vs accepted; due date and needed-by date; current approved drawing revision and acknowledgement status (acknowledged / not acknowledged with date); latest status updates; delivery, inspection and payment status summary using getPaymentStatus() from @/lib/rules. Add a "Remind vendor" button if the drawing is not acknowledged. Handle "job not found".
```

## Prompt 4: Per-part timeline
```
Follow AGENTS.md. On the job detail page add a vertical timeline for the 7 stages: Ordered, Accepted, In progress, Ready, Delivered, Inspected, Paid. Show done / current / upcoming, with dates and who did it. Below it add a full history list (audit trail): status change, acknowledgement, inspection, payment action, each with user and time.
```

## Prompt 5: Rule demo and polish
```
Follow AGENTS.md. On the job detail page, add a "Move to In progress" button for demo that is disabled with a clear message when the drawing is not acknowledged (use canStartWork() from @/lib/rules). Polish spacing, make the page responsive, and check all links back to /jobs.
```

## Done checklist
- [ ] /jobs filters, search, pagination work
- [ ] New Job dialog validates and adds a job
- [ ] Job detail shows drawing ack, payment status, timeline, history
- [ ] Rule 2 blocks "In progress" without acknowledgement
- [ ] Pull request opened to main
