import type {
  Workshop,
  Part,
  Drawing,
  DrawingAcknowledgement,
  Job,
  JobStage,
  JobRisk,
  StatusUpdate,
  Delivery,
  Inspection,
  InvoicePayment,
  PaymentStatus,
  InspectionResult,
  WorkshopStatus,
  AppNotification,
} from '@/types';

// Role and Enum mappers
export const DB_STAGE_TO_APP: Record<string, JobStage> = {
  ordered: 'Ordered',
  accepted: 'Accepted',
  in_progress: 'In progress',
  ready: 'Ready',
  delivered: 'Delivered',
  inspected: 'Inspected',
  paid: 'Paid',
};

export const DB_RISK_TO_APP: Record<string, JobRisk> = {
  on_track: 'On track',
  at_risk: 'At risk',
  may_miss_date: 'May miss date',
  reinspection_due: 'Reinspection due',
  overdue: 'Overdue',
};

export const DB_PAYMENT_STATUS_TO_APP: Record<string, PaymentStatus> = {
  not_ready: 'Not ready',
  ready: 'Ready',
  on_hold_quality: 'On hold for quality',
  awaiting_approval: 'Awaiting approval',
  paid: 'Paid',
};

export const DB_INSPECTION_RESULT_TO_APP: Record<string, InspectionResult> = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

/* eslint-disable @typescript-eslint/no-explicit-any */

export function mapDbWorkshopToWorkshop(row: any): Workshop {
  return {
    id: row.id,
    name: row.name,
    contactPerson: row.contact_person || '',
    phone: row.phone || '',
    email: row.email || '',
    address: row.address || row.location || '',
    onTimePercent: row.on_time_percent ?? 90,
    activeJobs: row.active_jobs ?? 0,
    warning: row.warning || undefined,
  };
}

export function mapDbPartToPart(row: any): Part {
  return {
    id: row.id,
    code: row.part_code || row.code,
    name: row.name,
    displayName: `${row.name} ${row.part_code || row.code}`,
    type: row.part_type || row.type || 'Structural',
  };
}

export function mapDbDrawingToDrawing(row: any): Drawing {
  return {
    id: row.id,
    partId: row.part_id,
    revision: row.revision,
    approved: !!row.is_approved,
    approvedBy: row.approved_by,
    approvedAt: row.approved_at,
    changeNote: row.change_note,
    uploadedBy: row.uploaded_by || 'Engineering',
    uploadedAt: row.created_at ? row.created_at.split('T')[0] : '',
    fileUrl: row.file_url,
  };
}

export function mapDbJobToJob(row: any, part?: Part, workshop?: Workshop): Job {
  const partName = part?.displayName || row.part_display_name || 'Part';
  const wsName = workshop?.name || row.workshop_name || 'Workshop';

  return {
    id: row.id,
    partId: row.part_id,
    workshopId: row.workshop_id,
    partDisplayName: partName,
    workshopName: wsName,
    orderedDate: row.created_at ? row.created_at.split('T')[0] : row.ordered_date,
    acceptedDate: row.accepted_date || null,
    stage: DB_STAGE_TO_APP[row.stage] || 'Ordered',
    dueDate: row.due_date,
    risk: DB_RISK_TO_APP[row.risk] || 'On track',
    quantity: row.quantity_ordered ?? row.quantity ?? 0,
    drawingId: row.drawing_id || null,
    notes: row.notes || '',
  };
}

export function mapDbAckToAck(row: any): DrawingAcknowledgement {
  return {
    id: row.id || `ack-${row.job_id}-${row.drawing_id}`,
    drawingId: row.drawing_id,
    jobId: row.job_id,
    workshopId: row.workshop_id || '',
    acknowledgedAt: row.confirmed_at ? row.confirmed_at.split('T')[0] : null,
    acknowledgedBy: row.confirmed_by || null,
  };
}

export function mapDbStatusUpdateToStatusUpdate(row: any): StatusUpdate {
  return {
    id: row.id,
    jobId: row.job_id,
    workshopId: row.workshop_id || '',
    status: (row.status as WorkshopStatus) || 'Started',
    message: row.note || row.message || '',
    photoUrl: row.photo_url || null,
    updatedAt: row.created_at ? row.created_at.split('T')[0] : '',
    updatedBy: row.created_by || 'Workshop Staff',
  };
}

export function mapDbDeliveryToDelivery(row: any): Delivery {
  return {
    id: row.id,
    jobId: row.job_id,
    workshopId: row.workshop_id || '',
    deliveredDate: row.delivered_at ? row.delivered_at.split('T')[0] : '',
    receivedBy: row.received_by || 'Stores',
    quantity: row.quantity,
    challanNumber: row.challan_number || '',
    notes: row.notes || '',
    vehicleNumber: row.vehicle_number,
    transporterName: row.transporter_name,
    challanFileUrl: row.challan_url,
  };
}

export function mapDbInspectionToInspection(row: any): Inspection {
  return {
    id: row.id,
    jobId: row.job_id,
    deliveryId: row.delivery_id || '',
    inspectedDate: row.inspected_at ? row.inspected_at.split('T')[0] : '',
    inspectedBy: row.inspector_id || 'Quality Inspector',
    result: DB_INSPECTION_RESULT_TO_APP[row.result] || 'Pending',
    remarks: row.remarks || '',
    reinspectionDate: row.reinspection_date || null,
  };
}

export function mapDbPaymentToPayment(row: any): InvoicePayment {
  return {
    id: row.id,
    jobId: row.job_id,
    workshopId: row.workshop_id || '',
    invoiceNumber: row.invoice_number || '',
    invoiceDate: row.invoice_date || '',
    amount: Number(row.invoice_amount || 0),
    invoiceFileUrl: row.invoice_url || '',
    paymentStatus: DB_PAYMENT_STATUS_TO_APP[row.payment_status] || 'Not ready',
    paidDate: row.paid_at ? row.paid_at.split('T')[0] : null,
    paidAmount: row.paid_amount ? Number(row.paid_amount) : null,
  };
}

export function mapDbNotificationToNotification(row: any): AppNotification {
  return {
    id: row.id,
    title: row.title,
    message: row.body || row.message || '',
    type: row.type || 'info',
    link: row.link || null,
    read: !!row.read,
    createdAt: row.created_at ? row.created_at.split('T')[0] : '',
    forRoles: [],
  };
}
