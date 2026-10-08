# VendorFlow: Step-by-step Prompt Plan for Antigravity

Rules: one screen per prompt. Test in the browser before moving on. Always say "follow AGENTS.md".
Keep 5 to 10 prompts as buffer for fixes.

## Phase A: Clickable prototype (about 20 prompts)

| # | Prompt (short form) |
|---|---|
| 1 | Paste MASTER_PROMPT.md with the mockup screenshot (shell + Dashboard) |
| 2 | Fix and polish the dashboard: spacing, colours, shortfall visibility, status badges |
| 3 | Make the Dashboard filters and "Needs Action Today" buttons interactive (Remind vendor shows a confirmation toast) |
| 4 | Jobs list page: search, filters (project, vendor, date range, part type), pagination |
| 5 | Job detail page: part info, quantity ordered/accepted, stage + risk, drawing revision status, history |
| 6 | Add a per-part timeline (Ordered to Paid) on the job detail page |
| 7 | Drawing revisions page: upload revision (fake upload), approve, mark previous as superseded |
| 8 | Acknowledgement status table by workshop with a "Remind vendor" button |
| 9 | Vendors page: list, contacts, on-time rate, add/edit vendor dialog |
| 10 | Workshop mobile layout: workshop home with "My jobs", due dates, payment status |
| 11 | Workshop job view: drawing viewer, big "Confirm drawing received" button |
| 12 | Workshop status buttons (Started, In progress, Ready for dispatch) + photo upload (fake) |
| 13 | Block "In progress" until the drawing is acknowledged (business rule 2) |
| 14 | Quality page: inspection queue + checklist (dimensions, workmanship, drawing revision correct) |
| 15 | Accept/reject with remarks; rejection creates rework and "Reinspection due" |
| 16 | Deliveries page: record delivery (date, quantity, challan) |
| 17 | Payments page: invoice upload, payment readiness and "On hold for quality" reasons |
| 18 | Finance approve / mark paid flow; workshop sees status |
| 19 | Role switcher (demo only) so we can view as Procurement, Quality, Finance, Workshop Staff, etc. |
| 20 | Final polish: empty states, loading states, responsive checks, fix bugs |

Leave out for the prototype: WhatsApp, SMS, Hindi/Marathi, real login, real database.

## Phase B: Working prototype (about 15 to 25 more prompts)

| # | Prompt (short form) |
|---|---|
| 21 | Create a Supabase project and run `supabase/schema.sql` |
| 22 | Connect Supabase Auth (email / phone OTP) and store the user role |
| 23 | Replace sample-data functions with Supabase queries, one table at a time (workshops, parts, jobs) |
| 24 | Drawing upload to Supabase Storage + approve (one approved revision per part) |
| 25 | Save acknowledgements; enforce rule 2 in the database or server |
| 26 | Save status updates and photos |
| 27 | Save inspections, deliveries, invoices; calculate payment status |
| 28 | Turn on row-level security and test that a workshop only sees its own jobs |
| 29 | Dashboard from real data: cards, assembly shortfall, snapshots |
| 30 | Email and in-app notifications (Resend) |
| 31 | Hindi and Marathi with next-intl |
| 32 | Deploy to Vercel and test on a phone over 4G |

## Tips
- Put the screenshot, roles and sample data in the first prompt only. After that, refer to `AGENTS.md`.
- Ask for exact changes: "make the shortfall bar red and add a legend", not "make it better".
- If the agent changes things you did not ask for, say: "Revert unrelated changes. Only touch X."
- Commit to Git after every working step.
