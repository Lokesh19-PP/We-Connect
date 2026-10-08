# Shiva: Quality Inspection

**Branch:** `feat/shiva-quality`
**You own:** `app/quality`, `components/quality`, `data/quality.ts`
**Routes:** `/quality`
**Wait for:** Lokesh's base on `main`. Then `git pull`.

## Prompt 1: Inspection queue
```
Follow AGENTS.md. I am Shiva. Build /quality: tabs "To inspect", "Rework", "Reinspection due", "Completed". Each row: job, part, vendor, quantity delivered, drawing revision, delivered date, risk badge. Use getJobs() and getInspections from @/data/sample (add helpers in data/quality.ts). Only jobs with a delivery appear in "To inspect".
```

**Git Commit:**
```bash
git add . && git commit -m "feat(quality): build quality inspection queue with tabbed status filters and risk badges"
```

## Prompt 2: Inspection form
```
Follow AGENTS.md. Build an inspection page/dialog for a job with this checklist: dimensions correct, workmanship OK, drawing revision correct (shows the approved revision and what the workshop acknowledged). Fields: quantity accepted, quantity rejected, remarks, photo upload (fake). Buttons: Accept and Reject. Only roles with can(role, "inspection.record") see them.
```

**Git Commit:**
```bash
git add . && git commit -m "feat(quality): add comprehensive inspection form dialog with checklist and accept/reject actions"
```

## Prompt 3: Reject, rework and reinspection
```
Follow AGENTS.md. On Reject: require remarks, create a rework record, set job risk to "Reinspection due", move the row to the Rework tab, and show a "Schedule reinspection" date picker. Show a banner "Payment on hold for quality" using getPaymentStatus() from @/lib/rules. On Accept after reinspection: clear the hold and update accepted quantity.
```

**Git Commit:**
```bash
git add . && git commit -m "feat(quality): implement rejection rework workflow, reinspection scheduling, and payment hold banner"
```

## Prompt 4: Quality metrics
```
Follow AGENTS.md. At the top of /quality show: first-pass yield % (parts passing on first attempt), rework count, and a small Recharts bar chart of rework by vendor. Calculate from sample data; the default demo numbers should be near 91% yield and 5 in rework so they match the Dashboard.
```

**Git Commit:**
```bash
git add . && git commit -m "feat(quality): add quality metrics header showing first-pass yield and vendor rework bar chart"
```

## Prompt 5: Inspection history and polish
```
Follow AGENTS.md. Add an inspection history view per job (each attempt, result, inspector, remarks, photos). Add empty and loading states, responsive layout, and links to /jobs/[id].
```

**Git Commit:**
```bash
git add . && git commit -m "feat(quality): add per-job inspection history modal and polish responsive layout"
```

## Done checklist
- [ ] Checklist includes "drawing revision correct"
- [ ] Reject creates rework and Reinspection due
- [ ] Payment hold banner appears and clears correctly
- [ ] First-pass yield and rework count shown
- [ ] Pull request opened to main
