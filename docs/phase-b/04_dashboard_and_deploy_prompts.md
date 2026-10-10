# Dashboard and Deploy Prompts

Two copy-paste prompts for Lokesh. Use Prompt A after all members have merged their data swap. Use Prompt B when ready to go live.

---

## Prompt A — Real-data dashboard

```
Follow AGENTS.md. I am Lokesh. The team has merged their Supabase data swaps. Now make the dashboard (app/page.tsx and components/dashboard/*) show real data from Supabase instead of sample data. Only edit my files.

1. Summary cards: total active jobs, at-risk jobs, overdue payments, pending inspections — each from a Supabase query or RPC function. The numbers must match what the Jobs, Payments, and Quality pages show. If any number differs, list the difference and fix it.

2. 14-day assembly shortfall calendar: query assembly_steps joined with jobs to calculate parts received vs parts needed for each day. Use the same logic as lib/rules.ts. Highlight days with a shortfall in red.

3. Three snapshot sections:
   - "Needs Action Today" — jobs that are at risk or overdue, with a link to the job detail page.
   - "Recent Activity" — last 10 entries from audit_log, formatted as a timeline.
   - "Payment Summary" — count of jobs by payment status (not ready, ready, on hold, awaiting approval, paid).

4. Loading skeletons for every card and section while data loads.
5. Error states: if a query fails, show an error message with a retry button.
6. Auto-refresh every 60 seconds using setInterval or SWR/React Query.

After each section (cards, calendar, snapshots), run npm run build, fix errors, and commit. Compare each dashboard number with the matching page and list any differences. Do not push.
```

---

## Prompt B — Vercel deployment

```
Follow AGENTS.md. I am Lokesh. Deploy this app to Vercel. Only edit my files.

1. Run npm run build and fix every error in my files. List errors in other members' files so I can tell them.

2. Create app/api/health/route.ts that returns { status: "ok", timestamp: new Date().toISOString() }.

3. List every environment variable I need to set in Vercel:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY (mark as server-only / sensitive)
   - RESEND_API_KEY (mark as server-only / sensitive)
   - Any others the app needs

4. Deployment checklist:
   - [ ] All environment variables set in Vercel dashboard
   - [ ] Service role key is NOT prefixed with NEXT_PUBLIC_
   - [ ] Build succeeds on Vercel
   - [ ] /api/health returns 200
   - [ ] Login works with a test user
   - [ ] Workshop user sees only their own jobs
   - [ ] File uploads work (drawings, photos, invoices)
   - [ ] Dashboard loads real data
   - [ ] Notifications and emails fire correctly
   - [ ] Pages load in under 3 seconds on a phone over 4G

5. Rollback plan:
   - How to revert to the previous deployment on Vercel
   - How to disable auth and fall back to sample data if Supabase is down
   - How to rotate keys if they are leaked

Commit "vercel deployment prep". Do not push.
```
