# VendorFlow: Project Rules for the AI Coding Agent

Read this file before every task. It is the single source of truth for the project.

## 1. What we are building
VendorFlow is a web app for a boiler manufacturer (demo workspace: "Deccan Boilers, Pune manufacturing unit") to manage fabrication work outsourced to small external workshops (brackets, frames, stands, handles, supports).
For every outsourced part it manages: approved drawing + workshop acknowledgement, progress updates, quality inspection, delivery/goods receipt, invoice, and payment readiness. It also shows which late parts threaten which assembly dates.

## 2. Tech stack (do not change without asking)
- Next.js (App Router) + TypeScript + React
- Tailwind CSS + shadcn/ui
- Recharts for charts
- next-intl for English / Hindi / Marathi (later phase)
- Supabase later (PostgreSQL, Auth, Storage, RLS). See `supabase/schema.sql`.
- Resend for email later
- Hosting: Vercel + Supabase cloud

## 3. Current phase
**Phase A: clickable prototype, frontend only, sample data in local files (e.g. `/data/sample.ts`).**
No real login, no database, no API calls yet. Keep data access behind small functions (e.g. `getJobs()`) so Supabase can replace them later.

## 4. App roles (10)
Procurement, Production, Engineering, Stores, Quality, Finance, Management (view only), Workshop Owner, Workshop Staff, Admin.

| Role | Can do |
|---|---|
| Procurement | Create jobs, manage vendors, send reminders, view all jobs |
| Production | View jobs, progress, assembly calendar |
| Engineering | Upload and approve drawing revisions |
| Stores | Record goods receipt / deliveries |
| Quality | Inspect, accept or reject, schedule reinspection |
| Finance | Approve invoices, mark payments paid |
| Management | View dashboard and reports only |
| Workshop Owner | See own jobs, upload invoices, see payment status |
| Workshop Staff | Acknowledge drawings, post status updates and photos |
| Admin | Manage users, vendors, roles |

A workshop user must only ever see its own jobs.

## 5. Business rules (never break these)
1. Only ONE drawing revision per part can be approved at a time.
2. A job cannot move to "In progress" until the workshop acknowledges the approved revision.
3. Payment is "Ready" only when: a delivery exists AND the latest inspection is Accepted AND an invoice is uploaded.
4. A rejected (or pending) inspection sets payment to "On hold for quality".
5. Overdue = past due date. At Risk = predicted to miss due date or assembly need.

## 6. Vocabulary (use these exact words in the UI)
- Job stages: Ordered, Accepted, In progress, Ready, Delivered, Inspected, Paid
- Risk: On track, At risk, May miss date, Reinspection due, Overdue
- Workshop status buttons: Started, In progress, Ready for dispatch
- Payment status: Not ready, Ready, On hold for quality, Awaiting approval, Paid

## 7. Design rules
- Dark navy sidebar, white content area, orange primary button ("New Job").
- Risk colours: red = May miss date / Overdue, amber = Reinspection due / At risk, green = On track.
- Sidebar: Dashboard, RFQs (placeholder, "coming soon"), Jobs (badge), Vendors, Quality, Deliveries, Payments, Reports, Settings. Footer: workspace name + "Demo workspace".
- Manufacturer UI: desktop-first, dense tables, clear status badges.
- Workshop UI: PHONE-FIRST, large buttons, minimal typing, 3 taps or fewer to acknowledge a drawing and post a status.
- Always provide loading, empty and error states.

## 8. Sample data (use realistic data, never lorem ipsum)
- Bracket B-204, Shree Fabricators, due 12 Oct, Rev v3
- Frame F-110, Om Engg Works
- Stand S-031, Patil Steel
- Handle H-007
- Workshops in the dashboard: Workshop A (96% on time), Workshop B (88%), Workshop C (82%, "No update in 2 days")
- Dashboard cards: 25 Active Jobs, 4 At Risk, 2 Overdue, 3 Awaiting Drawing Acknowledgement, 6 Invoices Pending
- Assembly calendar (needed/ready): Fri 09: 60/45, Mon 12: 80/80, Thu 15: 40/28, Mon 19: 30/30
- Quality: first-pass yield 91%, 5 in rework
- Payments: Received 12, On hold for quality 2, Awaiting approval 4, Average days to pay 18

## 9. Code conventions
- TypeScript strict. No `any`.
- Small reusable components in `/components`, one screen per route in `/app`.
- Shared types in `/types`. Sample data in `/data`.
- Business rules live in `/lib/rules.ts` as pure, testable functions (payment readiness, risk, shortfall).
- Role checks in one helper, `/lib/permissions.ts`.
- All visible text goes through a single place (`/messages/en.json`) so Hindi/Marathi can be added later.
- Do not add libraries without saying why.

## 10. Working rules for the agent
- One screen or feature per task. Finish it, then stop and summarise what changed.
- Do not touch files unrelated to the task.
- Do not invent features outside this file. If something is unclear, ask ONE question.
- Out of scope: ERP functions, CAD, online payment processing, WhatsApp/SMS (later), RFQ comparison (later).
- After each task, say how to run and test it (`npm run dev`) and what to click.
