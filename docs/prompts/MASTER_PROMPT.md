# Master Prompt (paste this FIRST into Antigravity)

Attach the dashboard mockup screenshot to this message. Also keep `AGENTS.md` in the project root.

---

You are building **VendorFlow**, a web app for a boiler manufacturer in Pune to manage fabrication work outsourced to small workshops. Read `AGENTS.md` fully first. It has the roles, business rules, vocabulary, design rules and sample data.

**Goal of this task:** set up the project and build the app shell and the Dashboard screen so it matches the attached mockup.

**Do this:**
1. Create a Next.js (App Router) + TypeScript + Tailwind CSS project and add shadcn/ui and Recharts.
2. Create the folders: `/app`, `/components`, `/data`, `/lib`, `/types`, `/messages`.
3. Build the app shell: dark navy sidebar (Dashboard, RFQs, Jobs with badge 24, Vendors, Quality, Deliveries, Payments, Reports, Settings), footer showing "Deccan Boilers, Pune manufacturing unit" and "Demo workspace", and a top bar with search, filters (Project / Boiler, All vendors, Date range, Part type), notification bell and the user "Procurement Manager".
4. Build the Dashboard page: title "Dashboard", subtitle "Keep every part on track for assembly", buttons Add Vendor, Upload Revision, and an orange New Job button.
5. Add the 5 summary cards, the "Needs Action Today" list (4 items with action buttons), the 14-day Assembly Calendar bar chart (shortfall in clear red), the Jobs Overview table (fully filled with realistic data: Job, Vendor, Ordered / Accepted, Stage, Needed By, Risk), and the Vendor, Quality and Payment snapshots.
6. Put all numbers in `/data/sample.ts` and read them through small functions like `getJobs()`.
7. Put the business rules (payment readiness, risk, assembly shortfall) in `/lib/rules.ts` as pure functions, with simple tests.

**Do NOT:** add login, a database, API calls, WhatsApp/SMS, or any screen other than the Dashboard. Do not leave table columns empty.

**When done:** tell me how to run it, and list what you built in 5 lines or fewer. Then stop and wait for my next prompt.
