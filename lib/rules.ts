// ──────────────────────────────────────────────
// VendorFlow – Business rules (§5 of AGENTS.md)
// Pure functions, no side-effects, fully testable.
// ──────────────────────────────────────────────
import type {
  Job,
  JobRisk,
  PaymentStatus,
  AssemblySlot,
  Drawing,
  DrawingAcknowledgement,
  Delivery,
  Inspection,
  InvoicePayment,
} from '@/types';

/**
 * Rule 3: Payment is "Ready" only when:
 *   (a) a delivery exists AND
 *   (b) the latest inspection is Accepted AND
 *   (c) an invoice is uploaded.
 *
 * Rule 4: A rejected (or pending) inspection → "On hold for quality".
 *
 * Also respects "Awaiting approval" and "Paid" from the invoice record.
 */
export function getPaymentStatus(
  deliveries: Delivery[],
  inspections: Inspection[],
  invoice: InvoicePayment | undefined
): PaymentStatus {
  // Already paid
  if (invoice?.paymentStatus === 'Paid') return 'Paid';

  // Awaiting finance approval
  if (invoice?.paymentStatus === 'Awaiting approval') return 'Awaiting approval';

  const hasDelivery = deliveries.length > 0;
  const hasInvoice = !!invoice && !!invoice.invoiceNumber;

  // Sort inspections by date (latest first)
  const sortedInspections = [...inspections].sort(
    (a, b) => new Date(b.inspectedDate).getTime() - new Date(a.inspectedDate).getTime()
  );
  const latestInspection = sortedInspections[0];

  // Rule 4: rejected or pending inspection → on hold
  if (latestInspection && (latestInspection.result === 'Rejected' || latestInspection.result === 'Pending')) {
    return 'On hold for quality';
  }

  // Rule 3: all three conditions met → Ready
  if (hasDelivery && latestInspection?.result === 'Accepted' && hasInvoice) {
    return 'Ready';
  }

  return 'Not ready';
}

/**
 * Rule 5: Risk assessment.
 *   Overdue = past due date.
 *   At Risk = predicted to miss due date or assembly need.
 *   Reinspection due = latest inspection was rejected.
 *   May miss date = close to due date and not progressing (within 3 days).
 *   On track = everything else.
 */
export function getRisk(
  job: Job,
  today: Date,
  inspections: Inspection[] = []
): JobRisk {
  const due = new Date(job.dueDate);
  const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Overdue: past due date and not completed
  if (daysUntilDue < 0 && !['Delivered', 'Inspected', 'Paid'].includes(job.stage)) {
    return 'Overdue';
  }

  // Reinspection due: latest inspection was rejected
  const sortedInspections = [...inspections].sort(
    (a, b) => new Date(b.inspectedDate).getTime() - new Date(a.inspectedDate).getTime()
  );
  if (sortedInspections[0]?.result === 'Rejected') {
    return 'Reinspection due';
  }

  // May miss date: within 3 days of due and not in Ready/Delivered/Inspected/Paid
  if (
    daysUntilDue >= 0 &&
    daysUntilDue <= 3 &&
    !['Ready', 'Delivered', 'Inspected', 'Paid'].includes(job.stage)
  ) {
    return 'May miss date';
  }

  // At risk: within 7 days of due and still early stages
  if (
    daysUntilDue > 3 &&
    daysUntilDue <= 7 &&
    ['Ordered', 'Accepted', 'In progress'].includes(job.stage)
  ) {
    return 'At risk';
  }

  return 'On track';
}

/**
 * Assembly shortfall: for each slot, shortfall = needed - ready (clamped to 0).
 */
export function getAssemblyShortfall(
  slots: AssemblySlot[]
): Array<AssemblySlot & { shortfall: number }> {
  return slots.map((slot) => ({
    ...slot,
    shortfall: Math.max(0, slot.needed - slot.ready),
  }));
}

/**
 * Rule 2: A job cannot move to "In progress" until the workshop
 * acknowledges the approved revision.
 *
 * Rule 1 (checked implicitly): Only ONE drawing revision per part
 * can be approved at a time.
 */
export function canStartWork(
  job: Job,
  drawings: Drawing[],
  acks: DrawingAcknowledgement[]
): { allowed: boolean; reason: string } {
  // Find approved drawing for this job's part
  const approvedDrawing = drawings.find(
    (d) => d.partId === job.partId && d.approved
  );

  if (!approvedDrawing) {
    return { allowed: false, reason: 'No approved drawing revision for this part' };
  }

  // Check if workshop acknowledged the approved drawing for this job
  const ack = acks.find(
    (a) =>
      a.drawingId === approvedDrawing.id &&
      a.jobId === job.id &&
      a.workshopId === job.workshopId &&
      a.acknowledgedAt !== null
  );

  if (!ack) {
    return { allowed: false, reason: 'Workshop has not acknowledged the approved drawing' };
  }

  return { allowed: true, reason: 'Drawing acknowledged – work can begin' };
}

/**
 * Rule 1: Only ONE drawing revision per part can be approved at a time.
 * Returns whether a new revision can be approved given existing drawings.
 */
export function canApproveDrawing(
  drawingToApprove: Drawing,
  allDrawingsForPart: Drawing[]
): { allowed: boolean; reason: string } {
  // Check if another revision is already approved (excluding this one)
  const otherApproved = allDrawingsForPart.find(
    (d) => d.id !== drawingToApprove.id && d.partId === drawingToApprove.partId && d.approved
  );

  if (otherApproved) {
    return {
      allowed: false,
      reason: `Cannot approve ${drawingToApprove.revision} – ${otherApproved.revision} is already approved. Revoke it first.`,
    };
  }

  return { allowed: true, reason: 'No other revision is approved – this one can be approved' };
}
