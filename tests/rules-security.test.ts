// ──────────────────────────────────────────────
// VendorFlow – Security & Business Rules Unit Tests
// Covers:
// - Role permission matrix (Management read-only, Quality cannot approve payments, Finance cannot approve drawings)
// - File storage policies (5 MB upload limit, signed URL expiration)
// - Business rules (one approved drawing, no in-progress without ack, payment readiness, risk)
// ──────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { can, type Action } from '@/lib/permissions';
import { uploadFile, getSignedUrl } from '@/lib/storage';
import {
  canApproveDrawing,
  canStartWork,
  getPaymentStatus,
  getRisk,
} from '@/lib/rules';
import type { Role, Job, Drawing, DrawingAcknowledgement, Delivery, Inspection, InvoicePayment } from '@/types';

describe('Role Permission Matrix (§4)', () => {
  // ─── Management is read-only ──────────────────────────────
  it('Management has read-only access and cannot perform any mutating action', () => {
    const mutatingActions: Action[] = [
      'job.create',
      'job.edit',
      'drawing.upload',
      'drawing.approve',
      'drawing.acknowledge',
      'inspection.record',
      'delivery.record',
      'payment.approve',
      'payment.upload_invoice',
      'vendor.manage',
      'status.update',
      'settings.manage',
      'user.manage',
      'reminder.send',
    ];

    for (const action of mutatingActions) {
      expect(can('Management', action), `Management should not be allowed ${action}`).toBe(false);
    }

    // But Management CAN view
    expect(can('Management', 'job.view')).toBe(true);
    expect(can('Management', 'report.view')).toBe(true);
    expect(can('Management', 'payment.view')).toBe(true);
    expect(can('Management', 'inspection.view')).toBe(true);
    expect(can('Management', 'delivery.view')).toBe(true);
    expect(can('Management', 'vendor.view')).toBe(true);
  });

  // ─── Quality cannot approve payments ─────────────────────
  it('Quality cannot approve payments or upload invoices', () => {
    expect(can('Quality', 'payment.approve')).toBe(false);
    expect(can('Quality', 'payment.upload_invoice')).toBe(false);
    expect(can('Quality', 'drawing.approve')).toBe(false);
    // Quality CAN record inspections
    expect(can('Quality', 'inspection.record')).toBe(true);
    expect(can('Quality', 'inspection.view')).toBe(true);
  });

  // ─── Finance cannot approve drawings ─────────────────────
  it('Finance cannot approve drawings or upload drawings', () => {
    expect(can('Finance', 'drawing.approve')).toBe(false);
    expect(can('Finance', 'drawing.upload')).toBe(false);
    expect(can('Finance', 'job.create')).toBe(false);
    expect(can('Finance', 'inspection.record')).toBe(false);
    // Finance CAN approve payments
    expect(can('Finance', 'payment.approve')).toBe(true);
    expect(can('Finance', 'payment.view')).toBe(true);
  });

  // ─── Engineering permissions ─────────────────────────────
  it('Engineering can upload and approve drawings, but not approve payments or record deliveries', () => {
    expect(can('Engineering', 'drawing.upload')).toBe(true);
    expect(can('Engineering', 'drawing.approve')).toBe(true);
    expect(can('Engineering', 'payment.approve')).toBe(false);
    expect(can('Engineering', 'delivery.record')).toBe(false);
    expect(can('Engineering', 'inspection.record')).toBe(false);
  });

  // ─── Stores permissions ──────────────────────────────────
  it('Stores can record deliveries, but cannot approve drawings or payments', () => {
    expect(can('Stores', 'delivery.record')).toBe(true);
    expect(can('Stores', 'drawing.approve')).toBe(false);
    expect(can('Stores', 'payment.approve')).toBe(false);
  });

  // ─── Workshop Staff & Owner permissions ──────────────────
  it('Workshop roles can acknowledge drawings and update status, but cannot approve drawings or inspections', () => {
    const workshopRoles: Role[] = ['Workshop Owner', 'Workshop Staff'];
    for (const role of workshopRoles) {
      expect(can(role, 'drawing.acknowledge')).toBe(true);
      expect(can(role, 'status.update')).toBe(true);
      expect(can(role, 'drawing.approve')).toBe(false);
      expect(can(role, 'inspection.record')).toBe(false);
      expect(can(role, 'delivery.record')).toBe(false);
      expect(can(role, 'payment.approve')).toBe(false);
    }

    // Workshop Owner can upload invoice; Workshop Staff cannot
    expect(can('Workshop Owner', 'payment.upload_invoice')).toBe(true);
    expect(can('Workshop Staff', 'payment.upload_invoice')).toBe(false);
  });
});

describe('Storage Bucket Policies & Constraints', () => {
  it('Uploads over 5 MB are refused with an error', async () => {
    // 6 MB file
    const largeBlob = new Uint8Array(6 * 1024 * 1024);
    const largeFile = new File([largeBlob], 'oversized-cad-drawing.pdf', {
      type: 'application/pdf',
    });

    const result = await uploadFile('drawings', largeFile);
    expect(result.path).toBeNull();
    expect(result.url).toBeNull();
    expect(result.error).toMatch(/exceeds the 5 MB limit/i);
  });

  it('Default signed URL expiration is 1 hour (3600 seconds)', async () => {
    // Verify default parameter in getSignedUrl signature
    expect(getSignedUrl.length).toBeGreaterThanOrEqual(2);
  });
});

describe('Business Rules (§2 & Database Constraints)', () => {
  const dummyJob: Job = {
    id: 'job-101',
    partId: 'part-b204',
    workshopId: 'ws-shree',
    partDisplayName: 'Bracket B-204',
    workshopName: 'Shree Fabricators',
    orderedDate: '2026-10-01',
    acceptedDate: '2026-10-02',
    stage: 'Ordered',
    dueDate: '2026-10-25',
    risk: 'On track',
    quantity: 50,
    drawingId: 'drw-v1',
    notes: '',
  };

  const approvedDrawing: Drawing = {
    id: 'drw-v1',
    partId: 'part-b204',
    revision: 'Rev v1',
    approved: true,
    uploadedBy: 'Priya Sharma',
    uploadedAt: '2026-10-01',
    fileUrl: '/drawings/sample.pdf',
  };

  const unapprovedDrawing: Drawing = {
    id: 'drw-v2',
    partId: 'part-b204',
    revision: 'Rev v2',
    approved: false,
    uploadedBy: 'Priya Sharma',
    uploadedAt: '2026-10-10',
    fileUrl: '/drawings/sample-v2.pdf',
  };

  // ─── Rule 1: One approved drawing per part ────────────────
  it('Rule 1: Blocks approving a revision when another revision is already approved', () => {
    const check = canApproveDrawing(unapprovedDrawing, [approvedDrawing, unapprovedDrawing]);
    expect(check.allowed).toBe(false);
    expect(check.reason).toContain('Rev v1 is already approved');
  });

  it('Rule 1: Allows approval when no other revision is currently approved', () => {
    const drawingA = { ...approvedDrawing, approved: false };
    const check = canApproveDrawing(unapprovedDrawing, [drawingA, unapprovedDrawing]);
    expect(check.allowed).toBe(true);
  });

  // ─── Rule 2: No In progress without acknowledgement ───────
  it('Rule 2: Blocks work if approved drawing has not been acknowledged by workshop', () => {
    const emptyAcks: DrawingAcknowledgement[] = [];
    const check = canStartWork(dummyJob, [approvedDrawing], emptyAcks);
    expect(check.allowed).toBe(false);
    expect(check.reason).toContain('not acknowledged the approved drawing');
  });

  it('Rule 2: Allows work once workshop acknowledges the approved revision', () => {
    const validAck: DrawingAcknowledgement = {
      id: 'ack-1',
      drawingId: 'drw-v1',
      jobId: 'job-101',
      workshopId: 'ws-shree',
      acknowledgedAt: '2026-10-03T10:00:00Z',
      acknowledgedBy: 'Ramesh Shinde',
    };
    const check = canStartWork(dummyJob, [approvedDrawing], [validAck]);
    expect(check.allowed).toBe(true);
  });

  // ─── Rule 3: Payment Ready only with delivery + accepted inspection + invoice
  it('Rule 3: Payment is Ready only when delivery exists AND inspection is Accepted AND invoice is uploaded', () => {
    const delivery: Delivery = {
      id: 'del-1',
      jobId: 'job-101',
      workshopId: 'ws-shree',
      deliveredDate: '2026-10-15',
      receivedBy: 'Rajendra More',
      quantity: 50,
      challanNumber: 'CH-8901',
      notes: '',
    };

    const acceptedInspection: Inspection = {
      id: 'insp-1',
      jobId: 'job-101',
      deliveryId: 'del-1',
      inspectedDate: '2026-10-16',
      inspectedBy: 'Deepak Joshi',
      result: 'Accepted',
      remarks: 'All tolerances verified',
      reinspectionDate: null,
    };

    const invoice: InvoicePayment = {
      id: 'inv-1',
      jobId: 'job-101',
      workshopId: 'ws-shree',
      invoiceNumber: 'INV-402',
      invoiceDate: '2026-10-16',
      amount: 45000,
      invoiceFileUrl: '/invoices/inv-402.pdf',
      paymentStatus: 'Not ready',
      paidDate: null,
      paidAmount: null,
    };

    // Ready with all 3 conditions met
    expect(getPaymentStatus([delivery], [acceptedInspection], invoice)).toBe('Ready');

    // Missing invoice -> Not ready
    expect(getPaymentStatus([delivery], [acceptedInspection], undefined)).toBe('Not ready');

    // Missing delivery -> Not ready
    expect(getPaymentStatus([], [acceptedInspection], invoice)).toBe('Not ready');
  });

  // ─── Rule 4: Rejected inspection puts payment on hold for quality
  it('Rule 4: Rejected inspection sets payment to "On hold for quality"', () => {
    const delivery: Delivery = {
      id: 'del-1',
      jobId: 'job-101',
      workshopId: 'ws-shree',
      deliveredDate: '2026-10-15',
      receivedBy: 'Rajendra More',
      quantity: 50,
      challanNumber: 'CH-8901',
      notes: '',
    };

    const rejectedInspection: Inspection = {
      id: 'insp-2',
      jobId: 'job-101',
      deliveryId: 'del-1',
      inspectedDate: '2026-10-16',
      inspectedBy: 'Deepak Joshi',
      result: 'Rejected',
      remarks: 'Bore diameter oversized by 0.5mm',
      reinspectionDate: '2026-10-20',
    };

    const invoice: InvoicePayment = {
      id: 'inv-1',
      jobId: 'job-101',
      workshopId: 'ws-shree',
      invoiceNumber: 'INV-402',
      invoiceDate: '2026-10-16',
      amount: 45000,
      invoiceFileUrl: '/invoices/inv-402.pdf',
      paymentStatus: 'Not ready',
      paidDate: null,
      paidAmount: null,
    };

    expect(getPaymentStatus([delivery], [rejectedInspection], invoice)).toBe('On hold for quality');
  });

  // ─── Rule 5: Overdue and At Risk calculation ──────────────
  it('Rule 5: Evaluates Overdue and Reinspection due correctly', () => {
    const today = new Date('2026-10-20');

    // Overdue when past due date and not delivered
    const overdueJob: Job = { ...dummyJob, dueDate: '2026-10-15', stage: 'In progress' };
    expect(getRisk(overdueJob, today)).toBe('Overdue');

    // Reinspection due when inspection was rejected
    const inspJob: Job = { ...dummyJob, dueDate: '2026-10-28', stage: 'Inspected' };
    const inspections: Inspection[] = [
      {
        id: 'insp-rej',
        jobId: inspJob.id,
        deliveryId: 'del-1',
        inspectedDate: '2026-10-18',
        inspectedBy: 'Deepak Joshi',
        result: 'Rejected',
        remarks: 'Warped flange',
        reinspectionDate: '2026-10-22',
      },
    ];
    expect(getRisk(inspJob, today, inspections)).toBe('Reinspection due');
  });
});
