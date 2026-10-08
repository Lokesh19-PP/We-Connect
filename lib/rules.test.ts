// ──────────────────────────────────────────────
// VendorFlow – Unit tests for business rules
// ──────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import {
  getPaymentStatus,
  getRisk,
  getAssemblyShortfall,
  canStartWork,
  canApproveDrawing,
} from '@/lib/rules';
import type {
  Job,
  Drawing,
  DrawingAcknowledgement,
  Delivery,
  Inspection,
  InvoicePayment,
  AssemblySlot,
} from '@/types';

// ─── Helpers to build test data ──────────────

function makeJob(overrides: Partial<Job> = {}): Job {
  return {
    id: 'job-test',
    partId: 'p-1',
    workshopId: 'ws-1',
    partDisplayName: 'Bracket B-204',
    workshopName: 'Shree Fabricators',
    orderedDate: '2026-09-15',
    acceptedDate: '2026-09-16',
    stage: 'In progress',
    dueDate: '2026-10-12',
    risk: 'On track',
    quantity: 20,
    drawingId: 'd-3',
    notes: '',
    ...overrides,
  };
}

function makeDelivery(overrides: Partial<Delivery> = {}): Delivery {
  return {
    id: 'del-test',
    jobId: 'job-test',
    workshopId: 'ws-1',
    deliveredDate: '2026-10-06',
    receivedBy: 'Tester',
    quantity: 20,
    challanNumber: 'CH-TEST-001',
    notes: '',
    ...overrides,
  };
}

function makeInspection(overrides: Partial<Inspection> = {}): Inspection {
  return {
    id: 'insp-test',
    jobId: 'job-test',
    deliveryId: 'del-test',
    inspectedDate: '2026-10-07',
    inspectedBy: 'QC Tester',
    result: 'Accepted',
    remarks: '',
    reinspectionDate: null,
    ...overrides,
  };
}

function makeInvoice(overrides: Partial<InvoicePayment> = {}): InvoicePayment {
  return {
    id: 'inv-test',
    jobId: 'job-test',
    workshopId: 'ws-1',
    invoiceNumber: 'INV-TEST-001',
    invoiceDate: '2026-10-07',
    amount: 100000,
    invoiceFileUrl: '/invoices/test.pdf',
    paymentStatus: 'Not ready',
    paidDate: null,
    paidAmount: null,
    ...overrides,
  };
}

function makeDrawing(overrides: Partial<Drawing> = {}): Drawing {
  return {
    id: 'd-test',
    partId: 'p-1',
    revision: 'Rev A',
    approved: true,
    uploadedBy: 'Tester',
    uploadedAt: '2026-09-01',
    fileUrl: '/drawings/test.pdf',
    ...overrides,
  };
}

function makeAck(overrides: Partial<DrawingAcknowledgement> = {}): DrawingAcknowledgement {
  return {
    id: 'ack-test',
    drawingId: 'd-test',
    jobId: 'job-test',
    workshopId: 'ws-1',
    acknowledgedAt: '2026-09-05',
    acknowledgedBy: 'Workshop Owner',
    ...overrides,
  };
}

// ─── getPaymentStatus tests ──────────────────

describe('getPaymentStatus', () => {
  it('Rule 3: returns "Ready" when delivery + accepted inspection + invoice exist', () => {
    const result = getPaymentStatus(
      [makeDelivery()],
      [makeInspection({ result: 'Accepted' })],
      makeInvoice()
    );
    expect(result).toBe('Ready');
  });

  it('returns "Not ready" when no delivery exists', () => {
    const result = getPaymentStatus(
      [],
      [makeInspection({ result: 'Accepted' })],
      makeInvoice()
    );
    expect(result).toBe('Not ready');
  });

  it('returns "Not ready" when no invoice exists', () => {
    const result = getPaymentStatus(
      [makeDelivery()],
      [makeInspection({ result: 'Accepted' })],
      undefined
    );
    expect(result).toBe('Not ready');
  });

  it('Rule 4: returns "On hold for quality" when inspection is Rejected', () => {
    const result = getPaymentStatus(
      [makeDelivery()],
      [makeInspection({ result: 'Rejected' })],
      makeInvoice()
    );
    expect(result).toBe('On hold for quality');
  });

  it('Rule 4: returns "On hold for quality" when inspection is Pending', () => {
    const result = getPaymentStatus(
      [makeDelivery()],
      [makeInspection({ result: 'Pending' })],
      makeInvoice()
    );
    expect(result).toBe('On hold for quality');
  });

  it('returns "Paid" when invoice is already paid', () => {
    const result = getPaymentStatus(
      [makeDelivery()],
      [makeInspection({ result: 'Accepted' })],
      makeInvoice({ paymentStatus: 'Paid' })
    );
    expect(result).toBe('Paid');
  });

  it('returns "Awaiting approval" when invoice status is Awaiting approval', () => {
    const result = getPaymentStatus(
      [makeDelivery()],
      [makeInspection({ result: 'Accepted' })],
      makeInvoice({ paymentStatus: 'Awaiting approval' })
    );
    expect(result).toBe('Awaiting approval');
  });

  it('uses the latest inspection when multiple exist', () => {
    const result = getPaymentStatus(
      [makeDelivery()],
      [
        makeInspection({ id: 'insp-1', result: 'Accepted', inspectedDate: '2026-10-05' }),
        makeInspection({ id: 'insp-2', result: 'Rejected', inspectedDate: '2026-10-07' }), // later → rejected
      ],
      makeInvoice()
    );
    expect(result).toBe('On hold for quality');
  });
});

// ─── getRisk tests ───────────────────────────

describe('getRisk', () => {
  const today = new Date('2026-10-08');

  it('Rule 5: returns "Overdue" when past due date and not completed', () => {
    const job = makeJob({ dueDate: '2026-10-05', stage: 'In progress' });
    expect(getRisk(job, today)).toBe('Overdue');
  });

  it('does NOT return "Overdue" for completed jobs past due', () => {
    const job = makeJob({ dueDate: '2026-10-05', stage: 'Delivered' });
    expect(getRisk(job, today)).not.toBe('Overdue');
  });

  it('returns "Reinspection due" when latest inspection is Rejected', () => {
    const job = makeJob({ dueDate: '2026-10-20', stage: 'Inspected' });
    const inspections = [makeInspection({ result: 'Rejected' })];
    expect(getRisk(job, today, inspections)).toBe('Reinspection due');
  });

  it('returns "May miss date" when within 3 days of due and not ready', () => {
    const job = makeJob({ dueDate: '2026-10-10', stage: 'In progress' });
    expect(getRisk(job, today)).toBe('May miss date');
  });

  it('returns "At risk" when within 7 days of due and in early stages', () => {
    const job = makeJob({ dueDate: '2026-10-12', stage: 'In progress' });
    expect(getRisk(job, today)).toBe('At risk');
  });

  it('returns "On track" when due date is far away', () => {
    const job = makeJob({ dueDate: '2026-10-25', stage: 'In progress' });
    expect(getRisk(job, today)).toBe('On track');
  });

  it('returns "On track" when Ready stage even if due is close', () => {
    const job = makeJob({ dueDate: '2026-10-10', stage: 'Ready' });
    expect(getRisk(job, today)).toBe('On track');
  });
});

// ─── getAssemblyShortfall tests ──────────────

describe('getAssemblyShortfall', () => {
  it('calculates shortfall as needed - ready (clamped to 0)', () => {
    const slots: AssemblySlot[] = [
      { date: '2026-10-09', needed: 60, ready: 45 },
      { date: '2026-10-12', needed: 80, ready: 80 },
      { date: '2026-10-15', needed: 40, ready: 28 },
    ];
    const result = getAssemblyShortfall(slots);
    expect(result[0].shortfall).toBe(15);
    expect(result[1].shortfall).toBe(0);
    expect(result[2].shortfall).toBe(12);
  });

  it('never returns negative shortfall', () => {
    const slots: AssemblySlot[] = [
      { date: '2026-10-09', needed: 30, ready: 50 }, // over-ready
    ];
    const result = getAssemblyShortfall(slots);
    expect(result[0].shortfall).toBe(0);
  });
});

// ─── canStartWork tests ─────────────────────

describe('canStartWork', () => {
  it('Rule 2: blocks work when no approved drawing exists', () => {
    const job = makeJob();
    const drawings = [makeDrawing({ approved: false })];
    const acks = [makeAck()];
    const result = canStartWork(job, drawings, acks);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('No approved drawing');
  });

  it('Rule 2: blocks work when workshop has not acknowledged', () => {
    const job = makeJob();
    const drawings = [makeDrawing({ approved: true })];
    const acks = [makeAck({ acknowledgedAt: null, acknowledgedBy: null })]; // not acknowledged
    const result = canStartWork(job, drawings, acks);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('not acknowledged');
  });

  it('Rule 2: allows work when drawing is approved and acknowledged', () => {
    const job = makeJob();
    const drawings = [makeDrawing({ approved: true })];
    const acks = [makeAck()]; // acknowledged
    const result = canStartWork(job, drawings, acks);
    expect(result.allowed).toBe(true);
  });
});

// ─── canApproveDrawing tests ─────────────────

describe('canApproveDrawing', () => {
  it('Rule 1: blocks approval when another revision is already approved', () => {
    const drawingA = makeDrawing({ id: 'd-a', revision: 'Rev A', approved: true });
    const drawingB = makeDrawing({ id: 'd-b', revision: 'Rev B', approved: false });
    const result = canApproveDrawing(drawingB, [drawingA, drawingB]);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Rev A');
  });

  it('Rule 1: allows approval when no other revision is approved', () => {
    const drawingA = makeDrawing({ id: 'd-a', revision: 'Rev A', approved: false });
    const drawingB = makeDrawing({ id: 'd-b', revision: 'Rev B', approved: false });
    const result = canApproveDrawing(drawingB, [drawingA, drawingB]);
    expect(result.allowed).toBe(true);
  });

  it('Rule 1: allows re-approving the same drawing (idempotent)', () => {
    const drawingA = makeDrawing({ id: 'd-a', revision: 'Rev A', approved: true });
    const result = canApproveDrawing(drawingA, [drawingA]);
    expect(result.allowed).toBe(true);
  });
});
