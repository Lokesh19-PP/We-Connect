# Repository Structure and File Placement

Folders marked **(Antigravity creates)** do not exist yet. They appear when Lokesh runs Prompt 0. Everything else is already in place in this repo skeleton.

```
vendorflow/
├── README.md                          project overview, setup, workflow
├── AGENTS.md                          AI agent rules (Antigravity reads this first)
├── .gitignore
├── .env.example                       copy to .env.local (Phase B)
│
├── .agent/
│   └── rules/
│       └── vendorflow.md              pointer that tells the agent to read AGENTS.md
│
├── docs/
│   ├── REPO_STRUCTURE.md              this file
│   ├── SRS.md                         export your SRS from the Claude doc and save here
│   ├── design/
│   │   └── system-design.md           architecture, flows, ER diagram (Mermaid)
│   ├── prompts/
│   │   ├── MASTER_PROMPT.md           first prompt for Antigravity (Lokesh)
│   │   └── PROMPT_PLAN.md             prototype and Phase B prompt list
│   └── team/
│       ├── 00_TEAM_PLAN.md            ownership, order of work, demo flow
│       ├── 01_Lokesh.md
│       ├── 02_Tanmay.md
│       ├── 03_Suyash.md
│       ├── 04_Vedant.md
│       ├── 05_Shiva.md
│       ├── 06_Abhi.md
│       └── 07_Soham.md
│
├── supabase/
│   └── schema.sql                     PostgreSQL tables, rules, RLS (Phase B)
│
├── app/                               (Antigravity creates) Next.js routes
│   ├── layout.tsx                     Lokesh
│   ├── page.tsx                       Lokesh   /  (Dashboard)
│   ├── jobs/                          Tanmay   /jobs, /jobs/[id]
│   ├── drawings/                      Suyash   /drawings
│   ├── workshop/                      Vedant   /workshop, /workshop/jobs/[id]
│   ├── quality/                       Shiva    /quality
│   ├── deliveries/                    Abhi     /deliveries
│   ├── payments/                      Abhi     /payments
│   ├── vendors/                       Soham    /vendors
│   ├── reports/                       Soham    /reports
│   ├── settings/                      Soham    /settings
│   └── rfqs/                          Soham    /rfqs (placeholder)
│
├── components/                        (Antigravity creates)
│   ├── ui/                            shadcn/ui (generated)
│   ├── layout/                        Lokesh   sidebar, top bar, role switcher
│   ├── dashboard/                     Lokesh
│   ├── jobs/                          Tanmay
│   ├── drawings/                      Suyash
│   ├── workshop/                      Vedant
│   ├── quality/                       Shiva
│   ├── payments/                      Abhi
│   ├── vendors/                       Soham
│   ├── reports/                       Soham
│   └── notifications/                 Soham
│
├── data/                              (Antigravity creates) sample data, replaced by Supabase later
│   ├── sample.ts                      Lokesh (shared data and getters)
│   ├── jobs.ts                        Tanmay
│   ├── drawings.ts                    Suyash
│   ├── quality.ts                     Shiva
│   └── payments.ts                    Abhi
│
├── lib/                               (Antigravity creates) Lokesh only
│   ├── rules.ts                       business rules (payment, risk, shortfall)
│   ├── rules.test.ts
│   ├── permissions.ts                 can(role, action)
│   └── role-context.tsx               demo role switcher
│
├── types/
│   └── index.ts                       (Antigravity creates) shared types, Lokesh only
│
├── messages/
│   └── en.json                        (Antigravity creates) all UI text; hi.json, mr.json later
│
└── public/                            (Antigravity creates) images, icons
```

## Placement table for the files I gave you

| File | Put it here |
|---|---|
| README.md | repo root |
| AGENTS.md | repo root |
| .gitignore, .env.example | repo root |
| vendorflow.md (rules pointer) | `.agent/rules/` |
| system-design.md | `docs/design/` |
| REPO_STRUCTURE.md | `docs/` |
| SRS (export from the Claude doc) | `docs/SRS.md` |
| MASTER_PROMPT.md, PROMPT_PLAN.md | `docs/prompts/` |
| 00_TEAM_PLAN.md and 01 to 07 member files | `docs/team/` |
| schema.sql | `supabase/` |

## First-day steps
1. Lokesh creates the GitHub repo (empty, private) and clones it.
2. Lokesh copies this whole skeleton into the clone and commits: `git add . && git commit -m "docs and rules skeleton" && git push`.
3. Lokesh opens the folder in Antigravity and runs Prompt 0 from `docs/team/01_Lokesh.md` (the agent creates `app/`, `components/`, `data/`, `lib/`, `types/`, `messages/`).
   - If `create-next-app` refuses because the folder is not empty, scaffold into a temporary folder and move the generated files in, keeping the existing ones.
4. Lokesh finishes Prompts 0 to 2, pushes to `main`, and messages the team.
5. The other six `git pull`, create their branch, and open their own file in `docs/team/`.

## Rules for the repo
- Only edit files you own.
- `main` stays working: merge only through pull requests.
- Never commit `.env.local` or real keys.
- Branch names: `feat/<name>-<module>`.
