// ──────────────────────────────────────────────
// VendorFlow – shared type definitions
// Vocabulary matches AGENTS.md §6 exactly.
// ──────────────────────────────────────────────

/** 10 app roles (§4) */
export type Role =
  | 'Procurement'
  | 'Production'
  | 'Engineering'
  | 'Stores'
  | 'Quality'
  | 'Finance'
  | 'Management'
  | 'Workshop Owner'
  | 'Workshop Staff'
  | 'Admin';

/** Job stages – ordered progression (§6) */
export type JobStage =
  | 'Ordered'
  | 'Accepted'
  | 'In progress'
  | 'Ready'
  | 'Delivered'
  | 'Inspected'
  | 'Paid';

/** Risk labels (§6) */
export type JobRisk =
  | 'On track'
  | 'At risk'
  | 'May miss date'
  | 'Reinspection due'
  | 'Overdue';

/** Payment status (§6) */
export type PaymentStatus =
  | 'Not ready'
  | 'Ready'
  | 'On hold for quality'
  | 'Awaiting approval'
  | 'Paid';

/** Inspection result */
export type InspectionResult = 'Pending' | 'Accepted' | 'Rejected';

/** Workshop status buttons (§6) */
export type WorkshopStatus = 'Started' | 'In progress' | 'Ready for dispatch';

// ──────────────────────────────────────────────
// Entities
// ──────────────────────────────────────────────

export interface Workshop {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  onTimePercent: number;
  /** Number of active jobs for this workshop */
  activeJobs: number;
  /** Optional warning label, e.g. "No update in 2 days" */
  warning?: string;
}

export interface Part {
  id: string;
  code: string;       // e.g. "B-204"
  name: string;       // e.g. "Bracket"
  /** Full display name, e.g. "Bracket B-204" */
  displayName: string;
  type: string;       // part family / category
}

export interface Drawing {
  id: string;
  partId: string;
  revision: string;   // "Rev A", "Rev B", "Rev C"
  /** Only ONE revision per part can be approved at a time (Rule 1) */
  approved: boolean;
  uploadedBy: string;
  uploadedAt: string; // ISO date
  fileUrl: string;
}

export interface DrawingAcknowledgement {
  id: string;
  drawingId: string;
  jobId: string;
  workshopId: string;
  acknowledgedAt: string | null; // ISO date, null = not yet acknowledged
  acknowledgedBy: string | null;
}

export interface Job {
  id: string;
  partId: string;
  workshopId: string;
  /** Display string, e.g. "Bracket B-204" */
  partDisplayName: string;
  /** Workshop name for display */
  workshopName: string;
  orderedDate: string;   // ISO date
  acceptedDate: string | null;
  stage: JobStage;
  dueDate: string;       // ISO date
  risk: JobRisk;
  quantity: number;
  /** Link to the current approved drawing revision */
  drawingId: string | null;
  notes: string;
}

export interface StatusUpdate {
  id: string;
  jobId: string;
  workshopId: string;
  status: WorkshopStatus;
  message: string;
  photoUrl: string | null;
  updatedAt: string; // ISO date
  updatedBy: string;
}

export interface Delivery {
  id: string;
  jobId: string;
  workshopId: string;
  deliveredDate: string; // ISO date
  receivedBy: string;
  quantity: number;
  challanNumber: string;
  notes: string;
  /** Dispatch details captured at goods receipt */
  vehicleNumber?: string;
  transporterName?: string;
  /** File name / URL of attached challan / delivery note scan */
  challanFileUrl?: string;
}

export interface Inspection {
  id: string;
  jobId: string;
  deliveryId: string;
  inspectedDate: string; // ISO date
  inspectedBy: string;
  result: InspectionResult;
  remarks: string;
  /** If rejected → next reinspection date */
  reinspectionDate: string | null;
}

export interface InvoicePayment {
  id: string;
  jobId: string;
  workshopId: string;
  invoiceNumber: string;
  invoiceDate: string;   // ISO date
  amount: number;
  invoiceFileUrl: string;
  paymentStatus: PaymentStatus;
  paidDate: string | null;
  paidAmount: number | null;
}

/** Assembly calendar slot (§8) */
export interface AssemblySlot {
  date: string;   // ISO date
  needed: number;
  ready: number;
}

/** In-app notification */
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  /** Route to navigate to when clicked */
  link: string | null;
  read: boolean;
  createdAt: string; // ISO date
  /** Role(s) this notification is for; empty = all */
  forRoles: Role[];
}
