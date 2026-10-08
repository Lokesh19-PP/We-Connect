# VendorFlow Team Plan (7 members)

Everyone puts `AGENTS.md` in the project root and reads it. Each person has their own prompt file (01 to 07).

## Who owns what

| # | Member | Owns | Routes | Files they may edit |
|---|---|---|---|---|
| 01 | Lokesh (team lead) | Project setup, app shell, Dashboard, shared types, sample data, rules, role switcher, merging | `/` | `app/layout`, `app/page`, `components/layout`, `components/dashboard`, `types/`, `data/sample.ts`, `lib/`, `messages/` |
| 02 | Tanmay | Jobs list, job detail, per-part timeline | `/jobs`, `/jobs/[id]` | `app/jobs`, `components/jobs`, `data/jobs.ts` |
| 03 | Suyash | Drawing revisions, approval, acknowledgement status, reminders | `/drawings` | `app/drawings`, `components/drawings`, `data/drawings.ts` |
| 04 | Vedant | Workshop phone-first view (home, job view, status, photo, invoice upload) | `/workshop`, `/workshop/jobs/[id]` | `app/workshop`, `components/workshop` |
| 05 | Shiva | Quality inspection, rework, reinspection, first-pass yield | `/quality` | `app/quality`, `components/quality`, `data/quality.ts` |
| 06 | Abhi | Deliveries, invoices, payment readiness and hold, finance approval | `/deliveries`, `/payments` | `app/deliveries`, `app/payments`, `components/payments`, `data/payments.ts` |
| 07 | Soham | Vendors, Reports, Settings (users and roles), RFQ placeholder, notifications | `/vendors`, `/reports`, `/settings`, `/rfqs` | `app/vendors`, `app/reports`, `app/settings`, `app/rfqs`, `components/vendors`, `components/reports`, `components/notifications` |

## The golden rules (stops merge conflicts)
1. Only edit files you own. Need a change in a shared file (`types/`, `lib/`, sidebar, `data/sample.ts`)? Ask Lokesh.
2. Import shared types from `@/types`. Never redefine them.
3. Business rules come from `@/lib/rules` and role checks from `@/lib/permissions`. Never copy the logic into your screen.
4. Use the exact vocabulary in `AGENTS.md` (stages, risk, payment status).
5. One Git branch per person: `feat/<name>-<module>`. Open a pull request into `main`. Lokesh merges.

## Order of work
| Step | Who | What |
|---|---|---|
| 1 (Day 1) | Lokesh | Prompt 0 in his file: scaffold, shared types, sample data, rules, permissions, shell. Push to `main` and tell the team. |
| 2 | Everyone else | `git pull`, create your branch, run your prompts in parallel. |
| 3 | Lokesh | Dashboard (while others build screens) |
| 4 | Everyone | Open pull requests. Lokesh merges and fixes links. |
| 5 | All | Integration test using the demo flow below, then polish. |

Nobody except Lokesh starts before step 1 is pushed.

## Demo flow to test at the end
1. Procurement creates a job for Bracket B-204 (Tanmay).
2. Engineering approves Rev v3; Workshop C has not acknowledged (Suyash).
3. Workshop staff opens the phone view, confirms the drawing, posts "Started" (Vedant).
4. Stores records the delivery (Abhi).
5. Quality rejects, then re-inspects and accepts (Shiva).
6. Workshop uploads the invoice; payment shows On hold, then Ready; Finance marks it paid (Abhi).
7. Dashboard and Reports reflect it (Lokesh, Soham).

## Standard first line for every prompt
> Follow AGENTS.md. I am <your name>. Only create or edit the files I own (listed in my prompt file). Use shared types from `@/types`, rules from `@/lib/rules`, and data from my own data file. Do not add login or a database. When done, tell me how to test it in 5 lines or fewer.
