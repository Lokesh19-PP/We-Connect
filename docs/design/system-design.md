# VendorFlow: System Design and Flows

Diagrams use Mermaid and render automatically on GitHub and in VS Code (Markdown Preview Mermaid extension).

## 1. Architecture

```mermaid
flowchart LR
  subgraph Users
    M["Manufacturer teams<br/>(desktop)"]
    W["Workshop owner / staff<br/>(phone)"]
  end

  subgraph Vercel
    N["Next.js app<br/>dashboard + workshop view"]
  end

  subgraph Supabase
    A["Auth<br/>email / phone OTP"]
    D[("PostgreSQL<br/>+ row-level security")]
    S["Storage<br/>drawings, photos, invoices"]
    R["Realtime"]
  end

  E["Resend<br/>email"]

  M --> N
  W --> N
  N --> A
  N --> D
  N --> S
  D --> R --> N
  D -->|"notification events"| E
```

## 2. Application layers

```mermaid
flowchart TB
  UI["Screens: app/ routes"] --> C["Components: components/"]
  C --> L["Rules and permissions: lib/rules.ts, lib/permissions.ts"]
  C --> DA["Data access: data/ (sample now, Supabase later)"]
  L --> T["Shared types: types/"]
  DA --> T
  DA -.->|"Phase B"| SB[("Supabase")]
```

Rule: screens never contain business logic. They call `lib/rules.ts` and read data through small functions such as `getJobs()`, so Supabase can replace the sample data without changing screens.

## 3. Order to payment flow

```mermaid
flowchart TD
  A["Procurement creates job<br/>+ attaches approved drawing"] --> B["Workshop notified"]
  B --> C["Workshop accepts job"]
  C --> D{"Drawing<br/>acknowledged?"}
  D -->|No| D1["Status buttons locked<br/>reminder sent"]
  D1 --> D
  D -->|Yes| E["Workshop posts status<br/>Started, In progress, Ready"]
  E --> F["Parts delivered<br/>Stores records goods receipt"]
  F --> G["Quality inspects"]
  G --> H{"Accepted?"}
  H -->|No| I["Rework or replacement<br/>reinspection scheduled<br/>payment on hold"]
  I --> G
  H -->|Yes| J["Workshop uploads invoice"]
  J --> K["Payment becomes Ready"]
  K --> L["Finance approves<br/>and marks Paid"]
```

## 4. Drawing change flow

```mermaid
sequenceDiagram
  participant E as Design Engineer
  participant V as VendorFlow
  participant P as Procurement
  participant W as Workshop

  E->>V: Upload new revision (Rev B)
  E->>V: Approve Rev B
  V->>V: Mark Rev A superseded (one approved per part)
  V->>W: Notify workshops with open jobs on this part
  W->>V: Confirm drawing received (acknowledge Rev B)
  alt Not acknowledged
    V->>P: Show in Needs Action Today
    P->>V: Click Remind vendor
    V->>W: Reminder sent
  end
```

## 5. Payment readiness decision

```mermaid
flowchart TD
  A{"Delivery<br/>recorded?"} -->|No| N1["Not ready"]
  A -->|Yes| B{"Latest inspection<br/>Accepted?"}
  B -->|"No (rejected or pending)"| H["On hold for quality"]
  B -->|Yes| C{"Invoice<br/>uploaded?"}
  C -->|No| N2["Not ready"]
  C -->|Yes| R["Ready"]
  R --> AP["Awaiting approval"] --> P["Paid"]
```

Implemented once in `lib/rules.ts` (`getPaymentStatus`) and mirrored by `payment_readiness()` in `supabase/schema.sql`.

## 6. Job stages

```mermaid
stateDiagram-v2
  [*] --> Ordered
  Ordered --> Accepted
  Accepted --> InProgress: drawing acknowledged
  InProgress --> Ready
  Ready --> Delivered
  Delivered --> Inspected
  Inspected --> Paid: invoice + accepted + approved
  Inspected --> InProgress: rejected, rework
  Paid --> [*]
```

Risk values (separate from stage): On track, At risk, May miss date, Reinspection due, Overdue.

## 7. Data model

```mermaid
erDiagram
  WORKSHOPS ||--o{ USERS : has
  WORKSHOPS ||--o{ JOBS : receives
  PARTS ||--o{ DRAWINGS : "has revisions"
  PARTS ||--o{ JOBS : "made in"
  ASSEMBLY_STEPS ||--o{ JOBS : needs
  JOBS ||--o{ DRAWING_ACKNOWLEDGEMENTS : has
  DRAWINGS ||--o{ DRAWING_ACKNOWLEDGEMENTS : "acknowledged as"
  JOBS ||--o{ STATUS_UPDATES : has
  JOBS ||--o{ DELIVERIES : has
  JOBS ||--o{ INSPECTIONS : has
  JOBS ||--o| INVOICES_PAYMENTS : has
  USERS ||--o{ AUDIT_LOG : performs

  JOBS {
    uuid id
    uuid part_id
    uuid workshop_id
    int quantity_ordered
    int quantity_accepted
    date due_date
    date needed_by_date
    enum stage
    enum risk
  }
  DRAWINGS {
    uuid id
    uuid part_id
    text revision
    bool is_approved
  }
  INSPECTIONS {
    uuid id
    uuid job_id
    enum result
    jsonb checklist
  }
  INVOICES_PAYMENTS {
    uuid id
    uuid job_id
    text invoice_url
    enum payment_status
  }
```

## 8. Roles and access

```mermaid
flowchart LR
  subgraph Manufacturer
    PR[Procurement]
    PD[Production]
    EN[Engineering]
    ST[Stores]
    QL[Quality]
    FN[Finance]
    MG["Management (view only)"]
    AD[Admin]
  end
  subgraph Workshop
    WO["Workshop Owner"]
    WS["Workshop Staff"]
  end
  PR -->|"create jobs, remind vendors"| J[Jobs]
  EN -->|"upload and approve"| DR[Drawings]
  ST -->|"record goods receipt"| DL[Deliveries]
  QL -->|"accept or reject"| IN[Inspections]
  FN -->|"approve and mark paid"| PY[Payments]
  WS -->|"acknowledge, status, photos"| J
  WO -->|"invoices, payment status"| PY
  PD -->|"view"| J
  MG -->|"view"| RP[Reports]
  AD -->|"users, vendors, roles"| ST2[Settings]
```

A workshop user only ever sees its own jobs (row-level security in Phase B, filtering in the prototype).

## 9. Assembly shortfall

For each assembly date in the next 14 days:
- needed = sum of `parts_needed` of assembly steps on that date
- ready = sum of accepted quantity of the jobs linked to those steps
- shortfall = needed minus ready (shown in red, linked to the jobs causing it)

Example from the mockup: Fri 09, 60 needed, 45 ready, shortfall 15.

## 10. Notifications (version 1: in-app and email)

| Event | Notified | Channel |
|---|---|---|
| New revision approved | Affected workshops | In-app, email |
| Revision not acknowledged | Procurement; reminder to workshop | In-app, email |
| Job nearing due date | Procurement | In-app, email |
| No update for set days | Procurement | In-app |
| Inspection rejected | Procurement, workshop | In-app, email |
| Payment ready | Finance | In-app |
| Payment paid | Workshop | In-app, email |

## 11. Deployment

```mermaid
flowchart LR
  G["GitHub<br/>main branch"] -->|"auto deploy"| V["Vercel<br/>Next.js app"]
  V --> S["Supabase cloud<br/>DB, Auth, Storage"]
  F["Feature branches<br/>feat/name-module"] -->|"pull request"| G
```
