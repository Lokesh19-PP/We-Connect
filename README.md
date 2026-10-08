# VendorFlow

A web app that helps a boiler manufacturer manage fabrication work outsourced to small external workshops (brackets, frames, stands, handles, supports).

For every outsourced part, VendorFlow gives one shared place for the **approved drawing and workshop acknowledgement, progress updates, quality inspection, delivery, invoice and payment readiness**, and shows which late parts threaten which assembly dates.

Study area: boiler factories and fabrication workshops in Chakan, Bhosari and Chinchwad (Pune), Maharashtra, India.

## Why it is different
1. **Drawing acknowledgement:** a workshop must confirm it has the current approved revision before work starts.
2. **Assembly shortfall calendar:** parts needed against parts ready for each assembly date, shortfall in red.
3. **Payment hold on quality:** payment is Ready only when delivery, accepted inspection and invoice all exist; a rejected inspection puts payment on hold.
4. **Phone-first workshop view:** large buttons, minimal typing.

## Tech stack
Next.js (App Router) + TypeScript, Tailwind CSS, shadcn/ui, Recharts, Supabase (PostgreSQL, Auth, Storage) from Phase B, Resend for email, next-intl for English / Hindi / Marathi, hosted on Vercel.

## Project status
| Phase | What | Status |
|---|---|---|
| A | Clickable prototype, sample data, no login or database | In progress |
| B | Supabase auth, database, storage, notifications | Not started |
| C | Pilot with a real workshop, Hindi and Marathi | Not started |

## Getting started
```bash
git clone <repo-url>
cd vendorflow
npm install
npm run dev        # http://localhost:3000
```
Phase B only: copy `.env.example` to `.env.local`, fill the keys, and run `supabase/schema.sql` in the Supabase SQL editor.

## Repository layout
```
vendorflow/
  AGENTS.md            rules for the AI coding agent (read first)
  README.md            this file
  docs/                project documents (SRS, system design, prompts, team plan)
  supabase/            database schema
  app/ components/ data/ lib/ types/ messages/    application code
```
Full tree with owners: `docs/REPO_STRUCTURE.md`.

## Documentation
| Document | Where |
|---|---|
| System design and flows | `docs/design/system-design.md` |
| Software Requirements Specification | `docs/SRS.md` (export from the shared Claude doc) |
| Team plan and file ownership | `docs/team/00_TEAM_PLAN.md` |
| Prompts for each member | `docs/team/01_Lokesh.md` to `07_Soham.md` |
| Prompt plan for the prototype | `docs/prompts/PROMPT_PLAN.md` |
| Database schema | `supabase/schema.sql` |

## Team
| Member | Area |
|---|---|
| Lokesh (lead) | Setup, shell, Dashboard, shared types and rules |
| Tanmay | Jobs |
| Suyash | Drawing revisions and acknowledgement |
| Vedant | Workshop phone-first view |
| Shiva | Quality inspection |
| Abhi | Deliveries and payments |
| Soham | Vendors, reports, settings, notifications |

## Git workflow
1. `git pull origin main`
2. Create your branch: `git checkout -b feat/<name>-<module>`
3. Edit only the files you own (see `docs/team/00_TEAM_PLAN.md`).
4. Commit small and often, push, open a pull request. Lokesh merges.

## Business rules
1. Only one drawing revision per part is approved at a time.
2. A job cannot move to In progress until the workshop acknowledges the approved revision.
3. Payment is Ready only with a delivery, an Accepted latest inspection and an uploaded invoice.
4. A rejected or pending inspection means "On hold for quality".
5. Overdue = past due date. At Risk = predicted to miss due date or assembly need.

## Out of scope for version 1
Full ERP functions, CAD, online payment processing, WhatsApp/SMS, RFQ comparison (placeholder page only).

## Note on research
Competitor findings in the project documents come from public vendor pages, not hands-on testing. "Not mentioned" does not prove a feature is absent. Validate with demos and factory interviews.
