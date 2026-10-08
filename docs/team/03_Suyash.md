# Suyash: Drawing Revisions and Acknowledgement

**Branch:** `feat/suyash-drawings`
**You own:** `app/drawings`, `components/drawings`, `data/drawings.ts`
**Routes:** `/drawings`
**Wait for:** Lokesh's base on `main`. Then `git pull`.
**This is VendorFlow's main differentiator. Make it excellent.**

## Prompt 1: Drawing register
```
Follow AGENTS.md. I am Suyash. Build /drawings: a register grouped by part (use getParts() and getDrawings() from @/data/sample). Each part shows its revisions (Rev A, B, C...) with status chips: Approved, Superseded, Pending approval; plus date, approver and change note. Search by part name or code. Only one revision per part can be Approved at a time.
```

**Git Commit:**
```bash
git add . && git commit -m "feat(drawings): build drawing register with part grouping, revision status, and search"
```

## Prompt 2: Upload revision
```
Follow AGENTS.md. Add an "Upload Revision" dialog: choose part, revision label, file (PDF or image, fake upload with filename and preview), change note. Only roles allowed by can(role, "drawing.approve") or procurement can open it. The new revision starts as "Pending approval".
```

**Git Commit:**
```bash
git add . && git commit -m "feat(drawings): add upload revision dialog with pending approval status and role checks"
```

## Prompt 3: Approve a revision
```
Follow AGENTS.md. Add an "Approve" action for Engineering. On approve: mark the new revision Approved, mark the previous one Superseded (business rule 1), record approver and time, list the workshops with open jobs on that part, and show a toast "N workshops notified". Use canApproveDrawing() from @/lib/rules. Keep changes in local state through data/drawings.ts helpers.
```

**Git Commit:**
```bash
git add . && git commit -m "feat(drawings): implement revision approval workflow, auto-superseding, and vendor notifications"
```

## Prompt 4: Acknowledgement status by workshop
```
Follow AGENTS.md. For each part's approved revision show a table of workshops with open jobs: Workshop, Job, Revision sent, Acknowledged (yes/no with date), Days waiting. Highlight unacknowledged rows in amber, and in red when waiting more than 1 working day. Add a "Remind vendor" button per row and "Remind all unacknowledged" at the top (confirmation dialog, then toast).
```

**Git Commit:**
```bash
git add . && git commit -m "feat(drawings): build workshop acknowledgement tracking table with reminder actions"
```

## Prompt 5: Revision history and viewer
```
Follow AGENTS.md. Add a revision history side panel (date, approver, change note) and a simple drawing viewer modal (image or PDF placeholder with zoom). Show a banner on parts where an unacknowledged revision exists: "Rev B not acknowledged by Workshop C".
```

**Git Commit:**
```bash
git add . && git commit -m "feat(drawings): add revision history side panel, drawing viewer modal, and warning banners"
```

## Prompt 6: Polish
```
Follow AGENTS.md. Add empty and loading states, make it responsive, and make sure the "3 Awaiting Drawing Acknowledgement" count shown on the Dashboard matches what /drawings displays by computing both from the same sample data.
```

**Git Commit:**
```bash
git add . && git commit -m "style(drawings): polish drawing register UI, loading states, and sync dashboard ack counts"
```

## Done checklist
- [ ] Only one approved revision per part, always
- [ ] Approving supersedes the old revision
- [ ] Acknowledgement table with reminders works
- [ ] Revision history visible
- [ ] Pull request opened to main
