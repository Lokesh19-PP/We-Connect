// ──────────────────────────────────────────────
// VendorFlow – Payments local-state store (data/payments.ts)
// Seeds from sample data; mutations update the in-memory array.
// Supabase replaces this later.
//
// KEY RULE: Payment status is NEVER computed here.
// Always call getPaymentStatus() from @/lib/rules.
// ──────────────────────────────────────────────
import type { InvoicePayment, PaymentStatus } from '@/types';
import { getInvoicePayments as getSampleInvoicePayments } from '@/data/sample';

// Mutable in-memory store seeded from sample data
let paymentsStore: InvoicePayment[] = getSampleInvoicePayments();

// ── Getters ───────────────────────────────────

/** All invoice payment records */
export function getPayments(): InvoicePayment[] {
  return [...paymentsStore];
}

/** Single record by id */
export function getPayment(id: string): InvoicePayment | undefined {
  return paymentsStore.find((p) => p.id === id);
}

/** All records for a specific job */
export function getPaymentsForJob(jobId: string): InvoicePayment[] {
  return paymentsStore.filter((p) => p.jobId === jobId);
}

// ── Mutations ─────────────────────────────────

/**
 * Finance approves the invoice → status moves to "Awaiting approval".
 * The actual final status (Ready / Not ready / On hold) is always
 * recomputed via getPaymentStatus() on the page; here we just record
 * the intent so Finance can move it forward.
 */
export function approveInvoice(id: string): InvoicePayment | undefined {
  paymentsStore = paymentsStore.map((p) =>
    p.id === id ? { ...p, paymentStatus: 'Awaiting approval' as PaymentStatus } : p
  );
  return paymentsStore.find((p) => p.id === id);
}

/**
 * Finance sends back the invoice with a reason.
 * Status reverts to "Not ready" so the workshop can correct and resubmit.
 */
export function sendBackInvoice(id: string): InvoicePayment | undefined {
  paymentsStore = paymentsStore.map((p) =>
    p.id === id ? { ...p, paymentStatus: 'Not ready' as PaymentStatus } : p
  );
  return paymentsStore.find((p) => p.id === id);
}

/**
 * Finance marks payment as made.
 * Sets status to "Paid", records paidDate and paidAmount.
 */
export function markAsPaid(
  id: string,
  paidDate: string,
  paidAmount: number,
  paymentReference: string
): InvoicePayment | undefined {
  paymentsStore = paymentsStore.map((p) =>
    p.id === id
      ? {
          ...p,
          paymentStatus: 'Paid' as PaymentStatus,
          paidDate,
          paidAmount,
          // Store reference in notes field (no dedicated column in type yet)
          notes: paymentReference,
        } as InvoicePayment & { notes?: string }
      : p
  );
  return paymentsStore.find((p) => p.id === id);
}

/**
 * Upload invoice details (for Workshop Owner role).
 * Attaches invoice number, date, amount, and file URL.
 */
export function uploadInvoice(
  id: string,
  invoiceNumber: string,
  invoiceDate: string,
  amount: number,
  invoiceFileUrl: string
): InvoicePayment | undefined {
  paymentsStore = paymentsStore.map((p) =>
    p.id === id ? { ...p, invoiceNumber, invoiceDate, amount, invoiceFileUrl } : p
  );
  return paymentsStore.find((p) => p.id === id);
}
