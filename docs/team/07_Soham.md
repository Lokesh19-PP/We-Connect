# Soham: Vendors, Reports, Settings, RFQ Placeholder and Notifications

**Branch:** `feat/soham-vendors-reports`
**You own:** `app/vendors`, `app/reports`, `app/settings`, `app/rfqs`, `components/vendors`, `components/reports`, `components/notifications`
**Routes:** `/vendors`, `/reports`, `/settings`, `/rfqs`
**Wait for:** Lokesh's base on `main`. Then `git pull`.

## Prompt 1: Vendors
```
Follow AGENTS.md. I am Soham. Build /vendors: table of workshops (name, contact person, phone, location, status, open jobs, on-time %, rework count) from getWorkshops(). Search and filter. Add / edit / deactivate vendor dialogs with validation. Sample on-time rates: Workshop A 96%, Workshop B 88%, Workshop C 82% with a "No update in 2 days" warning. Row click opens a vendor detail with their jobs and performance chart.
```

**Git Commit:**
```bash
git add . && git commit -m "feat(vendors): build vendor management directory, CRUD dialogs, and performance snapshots"
```

## Prompt 2: Reports
```
Follow AGENTS.md. Build /reports for Management and Procurement roles (can(role, "report.view")). Four reports with Recharts and tables: vendor on-time rate, rework by vendor, pending payments, delivery performance (planned vs actual). Date range and vendor filters. Add a disabled "Export PDF / Excel" button with a "coming later" tooltip.
```

**Git Commit:**
```bash
git add . && git commit -m "feat(reports): build analytics dashboard with vendor on-time, rework, and payment charts"
```

## Prompt 3: Settings (users and roles)
```
Follow AGENTS.md. Build /settings for the Admin role: user table (name, email or phone, role, workshop) with add / edit / deactivate, a role dropdown with all 10 roles, and a workshop selector that appears only for Workshop Owner and Workshop Staff. Add a "Rules" section to configure thresholds (days without update before flagging a vendor, days before due date for alerts), saved in local state. Add a read-only role permission matrix built from can() in @/lib/permissions.
```

**Git Commit:**
```bash
git add . && git commit -m "feat(settings): build user management, threshold config, and role-permission matrix"
```

## Prompt 4: Notifications
```
Follow AGENTS.md. Build components/notifications: a bell dropdown showing in-app notifications from sample data (new drawing revision approved, revision not acknowledged, job nearing due date, no update for N days, inspection rejected, payment ready, payment paid). Unread count, mark as read, and a full /notifications-style list inside the dropdown. Export a <NotificationBell /> component and tell Lokesh to place it in the top bar.
```

**Git Commit:**
```bash
git add . && git commit -m "feat(notifications): build NotificationBell dropdown and notification center components"
```

## Prompt 5: RFQ placeholder
```
Follow AGENTS.md. Build /rfqs as a clean "Coming in a later version" page: short explanation (request and compare quotations from workshops), a mock empty-state illustration using simple shapes, and a "Notify me" button. Do not build RFQ logic.
```

**Git Commit:**
```bash
git add . && git commit -m "feat(rfqs): add RFQ feature preview placeholder screen"
```

## Prompt 6: Polish
```
Follow AGENTS.md. Add loading and empty states, make all pages responsive, and check the vendor on-time numbers match the Dashboard's Vendor Snapshot.
```

**Git Commit:**
```bash
git add . && git commit -m "style(vendors-reports): polish loading states, responsive layouts, and vendor metric synchronization"
```

## Done checklist
- [ ] Vendors CRUD with validation
- [ ] 4 reports with filters
- [ ] Settings: users, roles, thresholds, permission matrix
- [ ] NotificationBell handed to Lokesh
- [ ] RFQ placeholder only
- [ ] Pull request opened to main
