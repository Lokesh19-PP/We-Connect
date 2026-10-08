# Lokesh: Team Lead, Setup, App Shell and Dashboard

**Branch:** `feat/lokesh-core`
**You own:** `app/layout`, `app/page`, `components/layout`, `components/dashboard`, `types/`, `data/sample.ts`, `lib/`, `messages/`
**Routes:** `/` (Dashboard)
**Attach:** the dashboard mockup screenshot to Prompt 0 and Prompt 3.
**Also read:** `docs/prompts/MASTER_PROMPT.md` (Prompt 3 is the dashboard part of it).

Your job blocks everyone else for the first hour, so do Prompts 0 to 2 first, push to `main`, and message the team.

## Prompt 0: Scaffold and shared contract (do this first)
```
Follow AGENTS.md. I am Lokesh, the team lead.
Create a Next.js (App Router) + TypeScript + Tailwind CSS project. Add shadcn/ui and Recharts.
Create folders: app, components, data, lib, types, messages.

1. In /types/index.ts define and export TypeScript types for: Role (10 roles), JobStage, JobRisk, PaymentStatus, InspectionResult, Workshop, Part, Drawing, Job, DrawingAcknowledgement, StatusUpdate, Delivery, Inspection, InvoicePayment, AssemblySlot (date, needed, ready), AppNotification. Use the exact vocabulary from AGENTS.md.
2. In /data/sample.ts export realistic sample data for all of these (about 25 jobs, 6 workshops, 12 parts, drawings with revisions Rev A to Rev C, plus a few deliveries, inspections and payments). Use the sample names in AGENTS.md (Bracket B-204 Shree Fabricators, Frame F-110 Om Engg Works, Stand S-031 Patil Steel, Handle H-007). Export simple getters: getJobs(), getJob(id), getWorkshops(), getParts(), getDrawings(), getAssemblySlots().
3. In /lib/rules.ts write pure, tested functions: getPaymentStatus(job), getRisk(job, today), getAssemblyShortfall(slots), canStartWork(job, drawings, acks), canApproveDrawing(). Follow the 5 business rules in AGENTS.md exactly. Add unit tests.
4. In /lib/permissions.ts export can(role, action) for actions like job.create, drawing.approve, inspection.record, payment.approve, vendor.manage, report.view.
5. Create /lib/role-context.tsx: a demo role switcher context (React context + hook useRole()) so the team can view the app as any of the 10 roles. Default role: Procurement.
Do not build any screens yet.
```

## Prompt 1: App shell with role-aware sidebar
```
Follow AGENTS.md. Build the app shell in components/layout: dark navy sidebar (Dashboard, RFQs, Jobs with badge, Vendors, Quality, Deliveries, Payments, Reports, Settings), footer "Deccan Boilers, Pune manufacturing unit / Demo workspace", top bar with search, filters (Project / Boiler, All vendors, Date range, Part type), notification bell and a demo role switcher dropdown from useRole().
Sidebar links go to: /, /rfqs, /jobs, /vendors, /quality, /deliveries, /payments, /reports, /settings. Also add a "Drawings" link to /drawings.
Hide sidebar items the current role cannot see (use can() from lib/permissions). For Workshop Owner and Workshop Staff roles, redirect to /workshop and show a simple phone-style layout instead of the sidebar.
Create placeholder pages (title only) for every route so links never 404.
```

## Prompt 2: Push and announce (manual, not an AI prompt)
1. `git add . && git commit -m "core scaffold, shared types, rules, shell"`
2. Push to `main`.
3. Message the team: "Base is ready. Pull main and start your branch."

## Prompt 3: Dashboard (attach the screenshot)
```
Follow AGENTS.md. Build the Dashboard page at app/page.tsx to match the attached mockup.
- Title "Dashboard", subtitle "Keep every part on track for assembly"; buttons Add Vendor (links /vendors), Upload Revision (links /drawings), orange New Job (links /jobs?new=1).
- 5 summary cards from real sample data counts: Active Jobs, At Risk, Overdue, Awaiting Drawing Acknowledgement, Invoices Pending.
- "Needs Action Today" list, 4 items, each with a one-click button: Remind vendor, Review schedule, Schedule inspection, Review. Buttons navigate to the right route or show a toast.
- 14-day Assembly Calendar (Recharts bar chart): needed vs ready, shortfall in clear red, legend, tooltip. Use getAssemblyShortfall().
- Jobs Overview table (25 jobs, paginated): Job, Vendor, Ordered / Accepted, Stage, Needed By, Risk. Fill every column. Risk badges: red May miss date, amber Reinspection due, green On track.
- Vendor Snapshot (on-time % with "No update in 2 days" warning), Quality Snapshot (first-pass yield, rework count), Payment Snapshot (Received, On hold for quality, Awaiting approval, Average days to pay).
Components go in components/dashboard. Add loading and empty states.
```

## Prompt 4: Dashboard interactivity
```
Follow AGENTS.md. Make the dashboard filters work on the cards and tables. Make "Remind vendor" open a confirmation dialog, then show a toast "Reminder sent to Workshop C". Add the term definitions as tooltips: Overdue = past due date; At Risk = predicted to miss due date or assembly need.
```

## Prompt 5: Integration (after others open pull requests)
```
Follow AGENTS.md. Check that every sidebar link, dashboard button and "Needs Action Today" action opens the right page built by the team. List any broken links or inconsistent vocabulary and fix only the shared files I own.
```

## Prompt 6: Final polish
```
Follow AGENTS.md. Review the whole app: empty and loading states, responsive layout, consistent badge colours, and the demo flow in docs/team/00_TEAM_PLAN.md. List bugs found; fix only what is in my files.
```

## Your checklist
- [ ] Base pushed to main on Day 1
- [ ] Every route has at least a placeholder page
- [ ] Rules tests pass
- [ ] Dashboard matches mockup with no empty columns
- [ ] All 7 branches merged
- [ ] Demo flow works end to end
