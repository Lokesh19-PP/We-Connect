# Abhi: Deliveries and Payments

**Branch:** `feat/abhi-payments`
**You own:** `app/deliveries`, `app/payments`, `components/payments`, `data/payments.ts`
**Routes:** `/deliveries`, `/payments`
**Wait for:** Lokesh's base on `main`. Then `git pull`.
**Your key rule (rules 3 and 4): payment is Ready only when delivery exists AND latest inspection is Accepted AND invoice is uploaded. A rejected or pending inspection means "On hold for quality". Always use getPaymentStatus() from @/lib/rules. Never rewrite this logic.**

## Prompt 1: Deliveries and goods receipt
```
Follow AGENTS.md. I am Abhi. Build /deliveries: a list of deliveries (job, part, vendor, quantity, delivery date, challan) and a "Record delivery" dialog for the Stores role (date, quantity, challan or delivery note upload, dispatch details such as vehicle number and transporter name). Show expected vs received quantity and flag shortages in amber. Use can(role, "delivery.record").
```

## Prompt 2: Payments board
```
Follow AGENTS.md. Build /payments with summary cards: Received, On hold for quality, Awaiting approval, Average days to pay (sample numbers should match AGENTS.md: 12, 2, 4, 18). Below, a table of jobs: job, vendor, invoice amount, delivery (yes/no), inspection result, invoice (yes/no), payment status badge. Tabs: All, Ready, On hold for quality, Awaiting approval, Paid.
```

## Prompt 3: Readiness checklist per job
```
Follow AGENTS.md. Opening a payment row shows a 3-item checklist: Delivery recorded, Inspection accepted, Invoice uploaded, each with a green tick or a red cross and a link to fix it (/deliveries, /quality, workshop invoice). If any item fails, show the reason in plain words, for example "On hold for quality: inspection rejected on 6 Oct". Status comes only from getPaymentStatus().
```

## Prompt 4: Invoice review and finance approval
```
Follow AGENTS.md. For Finance (can(role, "payment.approve")): "Review invoice" dialog with invoice preview, amount, and Approve / Send back with reason. After approval and when Ready, show "Mark as paid" (payment date and reference). Update status to Paid in local state through data/payments.ts. Other roles see the buttons disabled with a tooltip.
```

## Prompt 5: Pending invoices and polish
```
Follow AGENTS.md. Add a "6 Invoices Pending" view (filter) that matches the Dashboard count by using the same sample data, and show days since delivery in red after 30 days. Add empty/loading states and a responsive layout.
```

## Done checklist
- [ ] Payment status never typed by hand; always from rules
- [ ] On hold for quality shows the reason
- [ ] Finance approval and Mark as paid work
- [ ] Dashboard payment numbers match
- [ ] Pull request opened to main
