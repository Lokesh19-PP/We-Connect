// ──────────────────────────────────────────────
// VendorFlow – Jobs Data Module
// Owned by Tanmay (feat/tanmay-jobs)
// Wraps and enriches @/data/sample data for /jobs and /jobs/[id]
// ──────────────────────────────────────────────
import type {
  Job,
  JobStage,
  JobRisk,
  Part,
  Workshop,
  Drawing,
  DrawingAcknowledgement,
  Delivery,
  Inspection,
  InvoicePayment,
  StatusUpdate,
} from '@/types';
import {
  getJobs as getSampleJobs,
  getWorkshops,
  getParts,
  getPart,
  getWorkshop,
  getDrawings,
  getDrawingsForPart,
  getAcknowledgements,
  getAcknowledgementsForJob,
  getStatusUpdatesForJob,
  getDeliveriesForJob,
  getInspectionsForJob,
  getInvoicePaymentsForJob,
} from '@/data/sample';
import { getRisk } from '@/lib/rules';

/** Enriched Job type with neededBy date, material, accepted quantity and project */
export interface EnrichedJob extends Job {
  neededByDate: string;
  material: string;
  acceptedQuantity: number;
  project: string;
  partType: string;
}

export interface CreateJobInput {
  partId: string;
  quantity: number;
  workshopId: string;
  material: string;
  dueDate: string;
  neededByDate: string;
  project?: string;
  notes?: string;
}

export interface AuditEvent {
  id: string;
  jobId: string;
  type: 'stage_change' | 'acknowledgement' | 'inspection' | 'payment' | 'delivery' | 'status_update' | 'reminder';
  title: string;
  description: string;
  actor: string;
  timestamp: string;
  badgeVariant?: 'default' | 'success' | 'warning' | 'destructive' | 'info';
}

// Module-level in-memory stores
let initialised = false;
let jobsStore: EnrichedJob[] = [];
let acknowledgementsStore: DrawingAcknowledgement[] = [];
let auditHistoryStore: Record<string, AuditEvent[]> = {};

// Project mapping helper for realistic sample data
const PROJECT_MAP: Record<string, string> = {
  'job-1': 'Boiler #12',
  'job-2': 'Boiler B-200',
  'job-3': 'Boiler B-300',
  'job-4': 'Boiler B-200',
  'job-5': 'Boiler B-450',
  'job-6': 'Boiler B-300',
  'job-7': 'Boiler B-200',
  'job-8': 'Boiler B-450',
  'job-9': 'Boiler B-300',
  'job-10': 'Boiler B-200',
  'job-11': 'Boiler B-450',
  'job-12': 'Boiler #12',
  'job-13': 'Boiler B-200',
  'job-14': 'Boiler #12',
  'job-15': 'Boiler B-300',
  'job-16': 'Boiler B-200',
  'job-17': 'Boiler B-450',
  'job-18': 'Boiler B-300',
  'job-19': 'Boiler B-200',
  'job-20': 'Boiler #12',
  'job-21': 'Boiler B-300',
  'job-22': 'Boiler B-450',
  'job-23': 'Boiler B-200',
  'job-24': 'Boiler #12',
  'job-25': 'Boiler B-300',
};

// Material default mapping helper based on part type
function getDefaultMaterial(partType: string): string {
  switch (partType) {
    case 'Fitting':
      return 'Forged Carbon Steel A105';
    case 'Support':
      return 'Structural Steel IS 2062 Gr B';
    case 'Accessory':
      return 'Stainless Steel SS 304';
    case 'Structural':
    default:
      return 'Mild Steel IS 2062';
  }
}

// Compute neededBy assembly date (typically 2-4 days after due date)
function calculateNeededByDate(dueDate: string): string {
  try {
    const d = new Date(dueDate);
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  } catch {
    return dueDate;
  }
}

function initStoreIfNeeded() {
  if (initialised) return;

  acknowledgementsStore = [...getAcknowledgements()];

  const parts = getParts();
  const partMap = new Map(parts.map((p) => [p.id, p]));

  jobsStore = getSampleJobs().map((job) => {
    const part = partMap.get(job.partId);
    const partType = part ? part.type : 'Structural';
    const neededByDate = calculateNeededByDate(job.dueDate);
    const material = getDefaultMaterial(partType);
    const project = PROJECT_MAP[job.id] || 'Boiler B-200';

    // Accepted quantity calculation:
    // If job has not been accepted yet, accepted is 0; otherwise equal to job quantity or delivered qty
    let acceptedQuantity = 0;
    if (job.stage !== 'Ordered') {
      acceptedQuantity = job.quantity;
    }

    return {
      ...job,
      neededByDate,
      material,
      acceptedQuantity,
      project,
      partType,
    };
  });

  // Pre-populate realistic audit history for jobs
  jobsStore.forEach((job) => {
    const events: AuditEvent[] = [];

    // Order event
    events.push({
      id: `ev-${job.id}-ordered`,
      jobId: job.id,
      type: 'stage_change',
      title: 'Job Ordered',
      description: `Purchase order released for ${job.quantity} units of ${job.partDisplayName}`,
      actor: 'Amitabh Sen (Procurement)',
      timestamp: `${job.orderedDate} 10:30 AM`,
      badgeVariant: 'default',
    });

    // Drawing acknowledgement event
    const ack = acknowledgementsStore.find(
      (a) => a.jobId === job.id && a.acknowledgedAt !== null
    );
    if (ack && ack.acknowledgedAt) {
      events.push({
        id: `ev-${job.id}-ack`,
        type: 'acknowledgement',
        jobId: job.id,
        title: 'Drawing Revision Acknowledged',
        description: `Approved drawing revision acknowledged by workshop staff`,
        actor: ack.acknowledgedBy || 'Workshop Staff',
        timestamp: `${ack.acknowledgedAt} 02:15 PM`,
        badgeVariant: 'info',
      });
    }

    // Acceptance event
    if (job.acceptedDate && job.stage !== 'Ordered') {
      events.push({
        id: `ev-${job.id}-accepted`,
        jobId: job.id,
        type: 'stage_change',
        title: 'Job Accepted',
        description: `${job.workshopName} accepted fabrication order with delivery commitment`,
        actor: 'Workshop Manager',
        timestamp: `${job.acceptedDate} 04:00 PM`,
        badgeVariant: 'info',
      });
    }

    // Status updates
    const updates = getStatusUpdatesForJob(job.id);
    updates.forEach((u) => {
      events.push({
        id: `ev-${job.id}-status-${u.id}`,
        jobId: job.id,
        type: 'status_update',
        title: `Status: ${u.status}`,
        description: u.message,
        actor: u.updatedBy,
        timestamp: `${u.updatedAt} 11:00 AM`,
        badgeVariant: 'warning',
      });
    });

    // Deliveries
    const deliveries = getDeliveriesForJob(job.id);
    deliveries.forEach((del) => {
      events.push({
        id: `ev-${job.id}-del-${del.id}`,
        jobId: job.id,
        type: 'delivery',
        title: `Delivery Recorded (${del.quantity} units)`,
        description: `Challan #${del.challanNumber} received at gate. Notes: ${del.notes || 'None'}`,
        actor: del.receivedBy,
        timestamp: `${del.deliveredDate} 03:45 PM`,
        badgeVariant: 'info',
      });
    });

    // Inspections
    const inspections = getInspectionsForJob(job.id);
    inspections.forEach((insp) => {
      events.push({
        id: `ev-${job.id}-insp-${insp.id}`,
        jobId: job.id,
        type: 'inspection',
        title: `Quality Inspection: ${insp.result}`,
        description: `${insp.remarks}${insp.reinspectionDate ? ` | Reinspection due: ${insp.reinspectionDate}` : ''}`,
        actor: insp.inspectedBy,
        timestamp: `${insp.inspectedDate} 05:00 PM`,
        badgeVariant: insp.result === 'Accepted' ? 'success' : insp.result === 'Rejected' ? 'destructive' : 'warning',
      });
    });

    // Payments
    const payments = getInvoicePaymentsForJob(job.id);
    payments.forEach((pay) => {
      if (pay.invoiceNumber) {
        events.push({
          id: `ev-${job.id}-pay-${pay.id}`,
          jobId: job.id,
          type: 'payment',
          title: `Invoice ${pay.paymentStatus}: ${pay.invoiceNumber}`,
          description: `Amount: ₹${pay.amount.toLocaleString('en-IN')}${pay.paidDate ? ` (Paid on ${pay.paidDate})` : ''}`,
          actor: 'Finance Accounts',
          timestamp: `${pay.invoiceDate || job.orderedDate} 01:20 PM`,
          badgeVariant: pay.paymentStatus === 'Paid' ? 'success' : 'warning',
        });
      }
    });

    // Sort events chronologically
    events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    auditHistoryStore[job.id] = events;
  });

  initialised = true;
}

// Subscribers for reactive state in React components
type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeJobs(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Error notifying jobs listener', e);
    }
  });
}

// ──────────────────────────────────────────────
// API / Data access methods
// ──────────────────────────────────────────────

export function getJobs(): EnrichedJob[] {
  initStoreIfNeeded();
  return [...jobsStore];
}

export function getJobById(id: string): EnrichedJob | undefined {
  initStoreIfNeeded();
  return jobsStore.find((j) => j.id === id);
}

export function getJobDrawingAcknowledgement(jobId: string, drawingId?: string | null): DrawingAcknowledgement | undefined {
  initStoreIfNeeded();
  if (drawingId) {
    return acknowledgementsStore.find((a) => a.jobId === jobId && a.drawingId === drawingId);
  }
  return acknowledgementsStore.find((a) => a.jobId === jobId);
}

export function getAllAcknowledgements(): DrawingAcknowledgement[] {
  initStoreIfNeeded();
  return [...acknowledgementsStore];
}

export function getJobHistory(jobId: string): AuditEvent[] {
  initStoreIfNeeded();
  return auditHistoryStore[jobId] || [];
}

export function createJob(input: CreateJobInput): EnrichedJob {
  initStoreIfNeeded();

  const part = getPart(input.partId);
  const workshop = getWorkshop(input.workshopId);

  if (!part) throw new Error(`Part with id ${input.partId} not found`);
  if (!workshop) throw new Error(`Workshop with id ${input.workshopId} not found`);

  // Attach currently approved drawing revision for the part (Rule 1)
  const partDrawings = getDrawingsForPart(input.partId);
  const approvedDrawing = partDrawings.find((d) => d.approved);

  const todayStr = new Date().toISOString().split('T')[0];
  const newId = `job-${Date.now().toString().slice(-4)}`;

  const newJob: EnrichedJob = {
    id: newId,
    partId: input.partId,
    workshopId: input.workshopId,
    partDisplayName: part.displayName,
    workshopName: workshop.name,
    orderedDate: todayStr,
    acceptedDate: null,
    stage: 'Ordered',
    dueDate: input.dueDate,
    neededByDate: input.neededByDate,
    material: input.material,
    quantity: Number(input.quantity),
    acceptedQuantity: 0,
    drawingId: approvedDrawing ? approvedDrawing.id : null,
    risk: 'On track',
    project: input.project || 'Boiler B-200',
    notes: input.notes || '',
    partType: part.type,
  };

  jobsStore.unshift(newJob);

  // Create an initial drawing acknowledgement entry awaiting ack
  if (approvedDrawing) {
    const ack: DrawingAcknowledgement = {
      id: `ack-${Date.now()}`,
      drawingId: approvedDrawing.id,
      jobId: newJob.id,
      workshopId: input.workshopId,
      acknowledgedAt: null,
      acknowledgedBy: null,
    };
    acknowledgementsStore.push(ack);
  }

  // Create initial audit trail entry
  auditHistoryStore[newJob.id] = [
    {
      id: `ev-${newJob.id}-created`,
      jobId: newJob.id,
      type: 'stage_change',
      title: 'Job Created',
      description: `Purchase order created for ${newJob.quantity} units of ${newJob.partDisplayName} (${newJob.material})`,
      actor: 'Procurement Specialist',
      timestamp: `${todayStr} ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
      badgeVariant: 'default',
    },
  ];

  notifyListeners();
  return newJob;
}

export function updateJobStage(jobId: string, newStage: JobStage): EnrichedJob | undefined {
  initStoreIfNeeded();
  const index = jobsStore.findIndex((j) => j.id === jobId);
  if (index === -1) return undefined;

  const currentJob = jobsStore[index];
  const todayStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const updatedJob: EnrichedJob = {
    ...currentJob,
    stage: newStage,
    acceptedDate: newStage === 'Accepted' && !currentJob.acceptedDate ? todayStr : currentJob.acceptedDate,
    acceptedQuantity: newStage === 'Ordered' ? 0 : currentJob.quantity,
  };

  jobsStore[index] = updatedJob;

  // Add audit trail event
  if (!auditHistoryStore[jobId]) {
    auditHistoryStore[jobId] = [];
  }

  auditHistoryStore[jobId].push({
    id: `ev-${jobId}-stage-${Date.now()}`,
    jobId,
    type: 'stage_change',
    title: `Stage Changed to "${newStage}"`,
    description: `Workflow stage advanced from ${currentJob.stage} to ${newStage}`,
    actor: 'Tanmay (Demo User)',
    timestamp: `${todayStr} ${timeStr}`,
    badgeVariant: newStage === 'Paid' ? 'success' : 'info',
  });

  notifyListeners();
  return updatedJob;
}

export function acknowledgeJobDrawing(jobId: string, actorName = 'Workshop Manager'): boolean {
  initStoreIfNeeded();
  const job = jobsStore.find((j) => j.id === jobId);
  if (!job || !job.drawingId) return false;

  const todayStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const ackIndex = acknowledgementsStore.findIndex(
    (a) => a.jobId === jobId && a.drawingId === job.drawingId
  );

  if (ackIndex >= 0) {
    acknowledgementsStore[ackIndex] = {
      ...acknowledgementsStore[ackIndex],
      acknowledgedAt: todayStr,
      acknowledgedBy: actorName,
    };
  } else {
    acknowledgementsStore.push({
      id: `ack-${Date.now()}`,
      drawingId: job.drawingId,
      jobId,
      workshopId: job.workshopId,
      acknowledgedAt: todayStr,
      acknowledgedBy: actorName,
    });
  }

  // Add audit event
  if (!auditHistoryStore[jobId]) {
    auditHistoryStore[jobId] = [];
  }

  auditHistoryStore[jobId].push({
    id: `ev-${jobId}-ack-${Date.now()}`,
    jobId,
    type: 'acknowledgement',
    title: 'Approved Drawing Acknowledged',
    description: `Drawing revision was acknowledged by ${actorName}`,
    actor: actorName,
    timestamp: `${todayStr} ${timeStr}`,
    badgeVariant: 'success',
  });

  notifyListeners();
  return true;
}

export function remindVendor(jobId: string, senderName = 'Procurement Team'): { success: boolean; message: string; timestamp: string } {
  initStoreIfNeeded();
  const job = jobsStore.find((j) => j.id === jobId);
  if (!job) return { success: false, message: 'Job not found', timestamp: '' };

  const todayStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const timestamp = `${todayStr} ${timeStr}`;

  if (!auditHistoryStore[jobId]) {
    auditHistoryStore[jobId] = [];
  }

  auditHistoryStore[jobId].push({
    id: `ev-${jobId}-reminder-${Date.now()}`,
    jobId,
    type: 'reminder',
    title: 'Drawing Acknowledgement Reminder Sent',
    description: `Urgent notification dispatched to ${job.workshopName} to review and acknowledge approved drawing`,
    actor: senderName,
    timestamp,
    badgeVariant: 'warning',
  });

  notifyListeners();
  return {
    success: true,
    message: `Reminder sent to ${job.workshopName} for ${job.partDisplayName}`,
    timestamp,
  };
}
