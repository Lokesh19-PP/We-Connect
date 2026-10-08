# Vedant: Workshop Phone-First View

**Branch:** `feat/vedant-workshop`
**You own:** `app/workshop`, `components/workshop`
**Routes:** `/workshop`, `/workshop/jobs/[id]`
**Wait for:** Lokesh's base on `main`. Then `git pull`.
**This is the biggest design gap in the project. Design for a phone first (360px wide), big buttons, minimal typing, 3 taps or fewer from login to acknowledge a drawing and update status.**

## Prompt 1: Workshop home
```
Follow AGENTS.md. I am Vedant. Build /workshop as a mobile-first screen for the Workshop Owner and Workshop Staff roles. Show only jobs of the current workshop (demo: Workshop C, filter getJobs() by workshop). Sections: "Needs your action" (drawings to confirm first, in amber), "My jobs" as large cards (part name, quantity, due date, stage badge), and a payment status strip. Big tap targets (at least 48px). Bottom navigation: Jobs, Payments, Help. Test at 360px width.
```

## Prompt 2: Job view with drawing confirmation
```
Follow AGENTS.md. Build /workshop/jobs/[id]: part name and quantity at top, a drawing viewer (tap to zoom, shows "Rev B, approved by Engineering"), and one huge button "Confirm drawing received". After tapping: show a green confirmation, record acknowledgement time in local state, and unlock the status buttons. Before confirmation the status buttons are visibly disabled with the reason "Confirm the drawing first" (rule 2, use canStartWork() from @/lib/rules).
```

## Prompt 3: One-tap status and photos
```
Follow AGENTS.md. Add three large status buttons: Started, In progress, Ready for dispatch. One tap posts the update with time (optional short note). Add "Add photo" using the phone camera or file picker with a small preview. Show recent updates below as a simple list. Handle failed uploads with a clear "Try again" message.
```

## Prompt 4: Invoice upload and payment status
```
Follow AGENTS.md. Add an "Upload invoice" button on delivered jobs (file picker, amount field) and a payment status card: Not ready, Ready, On hold for quality (with the reason in plain words), Awaiting approval, Paid. Use getPaymentStatus() from @/lib/rules.
```

## Prompt 5: Low-literacy and slow-network polish
```
Follow AGENTS.md. Make the screens usable with minimal text: add icons next to every action, keep sentences short, put all text in /messages (add keys under a "workshop" namespace via a note to Lokesh if the file is shared). Compress image previews, show skeleton loaders, and add an offline banner "No network. Your update will be sent when you are online." Do not add Hindi/Marathi yet; keep the text structure ready for it.
```

## Prompt 6: Final check
```
Follow AGENTS.md. Test the full workshop journey at 360px width: open /workshop, open a job, confirm the drawing, post Started, post Ready for dispatch, upload an invoice. Count the taps. Fix anything over 3 taps for "acknowledge drawing and update status".
```

## Done checklist
- [ ] Works at 360px width
- [ ] Drawing confirmation needs one big tap
- [ ] Status buttons locked until acknowledgement
- [ ] Photo and invoice upload work
- [ ] Shows only this workshop's jobs
- [ ] Pull request opened to main
