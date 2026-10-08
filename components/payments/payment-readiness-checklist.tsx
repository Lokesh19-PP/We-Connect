'use client';

// ──────────────────────────────────────────────
// VendorFlow – Payment Readiness Checklist
// 3-item checklist driven ONLY by getPaymentStatus().
// Shows plain-language failure reasons with fix links.
// ──────────────────────────────────────────────
import Link from 'next/link';
import { getPaymentStatus } from '@/lib/rules';
import type { Delivery, Inspection, InvoicePayment, PaymentStatus } from '@/types';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  ShieldCheck,
  FileText,
  ExternalLink,
} from 'lucide-react';

interface ChecklistProps {
  deliveries: Delivery[];
  inspections: Inspection[];
  invoice: InvoicePayment | undefined;
}

interface CheckItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  passed: boolean;
  failReason?: string;
  fixLink?: string;
  fixLabel?: string;
}

export function PaymentReadinessChecklist({ deliveries, inspections, invoice }: ChecklistProps) {
  // ── Derive each check independently ──────────
  const hasDelivery = deliveries.length > 0;

  const sortedInspections = [...inspections].sort(
    (a, b) => new Date(b.inspectedDate).getTime() - new Date(a.inspectedDate).getTime()
  );
  const latestInspection = sortedInspections[0];
  const inspectionAccepted = latestInspection?.result === 'Accepted';
  const inspectionRejected = latestInspection?.result === 'Rejected';
  const inspectionPending = latestInspection?.result === 'Pending';

  const hasInvoice = !!invoice?.invoiceNumber;

  // ── Compute status via the canonical rule function ──
  const status: PaymentStatus = getPaymentStatus(deliveries, inspections, invoice);

  // ── Build failure reasons in plain language ───
  function inspectionReason(): string {
    if (!latestInspection) return 'No inspection recorded yet';
    if (inspectionRejected) {
      const dateStr = formatDate(latestInspection.inspectedDate);
      return `Inspection rejected on ${dateStr}${latestInspection.remarks ? ` – ${latestInspection.remarks}` : ''}`;
    }
    if (inspectionPending) {
      const dateStr = formatDate(latestInspection.inspectedDate);
      return `Inspection pending since ${dateStr}`;
    }
    return 'Inspection not yet accepted';
  }

  const items: CheckItem[] = [
    {
      id: 'check-delivery',
      label: 'Delivery recorded',
      icon: <Truck className="w-4 h-4" />,
      passed: hasDelivery,
      failReason: 'No delivery has been recorded in the system yet',
      fixLink: '/deliveries',
      fixLabel: 'Record delivery →',
    },
    {
      id: 'check-inspection',
      label: 'Inspection accepted',
      icon: <ShieldCheck className="w-4 h-4" />,
      passed: inspectionAccepted,
      failReason: inspectionReason(),
      fixLink: '/quality',
      fixLabel: 'Go to Quality →',
    },
    {
      id: 'check-invoice',
      label: 'Invoice uploaded',
      icon: <FileText className="w-4 h-4" />,
      passed: hasInvoice,
      failReason: 'No invoice has been submitted by the workshop',
      fixLink: invoice?.invoiceFileUrl || undefined,
      fixLabel: 'View / upload invoice →',
    },
  ];

  // ── Status banner message ─────────────────────
  const bannerMessage = (() => {
    if (status === 'Paid') return null; // no banner needed
    if (status === 'Ready') return null;
    if (status === 'On hold for quality') {
      if (inspectionRejected && latestInspection) {
        return `On hold for quality: inspection rejected on ${formatDate(latestInspection.inspectedDate)}`;
      }
      if (inspectionPending && latestInspection) {
        return `On hold for quality: inspection pending since ${formatDate(latestInspection.inspectedDate)}`;
      }
      return 'On hold for quality: awaiting inspection outcome';
    }
    if (status === 'Awaiting approval') return 'Invoice submitted — awaiting Finance approval';
    if (status === 'Not ready') return 'Payment is not ready — complete the checklist below';
    return null;
  })();

  const allPassed = items.every((i) => i.passed);

  return (
    <div className="space-y-3">
      {/* Overall status pill */}
      <div className="flex items-center space-x-2">
        <StatusBadge status={status} />
      </div>

      {/* Plain-language banner for failures */}
      {bannerMessage && (
        <div className="flex items-start space-x-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
          <span>{bannerMessage}</span>
        </div>
      )}

      {/* 3-item checklist */}
      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
        {items.map((item) => (
          <div
            key={item.id}
            id={item.id}
            className={`flex items-start space-x-3 px-4 py-3 ${
              item.passed ? 'bg-green-50/40' : 'bg-white'
            }`}
          >
            {/* Icon */}
            <div className={`mt-0.5 shrink-0 ${item.passed ? 'text-green-500' : 'text-slate-300'}`}>
              {item.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-semibold ${item.passed ? 'text-green-800' : 'text-slate-700'}`}>
                  {item.label}
                </span>
                {item.passed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                )}
              </div>

              {!item.passed && item.failReason && (
                <p className="text-[11px] text-slate-500 mt-0.5">{item.failReason}</p>
              )}

              {!item.passed && item.fixLink && (
                <Link
                  href={item.fixLink}
                  className="inline-flex items-center space-x-1 mt-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <ExternalLink className="w-2.5 h-2.5" />
                  <span>{item.fixLabel}</span>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {allPassed && status !== 'Paid' && (
        <p className="text-xs text-green-700 font-medium text-center py-1">
          ✓ All conditions met — payment can proceed
        </p>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────

function StatusBadge({ status }: { status: PaymentStatus }) {
  const config: Record<PaymentStatus, { cls: string; label: string }> = {
    'Paid': { cls: 'bg-green-100 text-green-800 border border-green-200', label: '✓ Paid' },
    'Ready': { cls: 'bg-blue-100 text-blue-800 border border-blue-200', label: '✓ Ready for payment' },
    'On hold for quality': { cls: 'bg-amber-100 text-amber-800 border border-amber-200', label: '⚠ On hold for quality' },
    'Awaiting approval': { cls: 'bg-purple-100 text-purple-800 border border-purple-200', label: '○ Awaiting approval' },
    'Not ready': { cls: 'bg-slate-100 text-slate-600 border border-slate-200', label: '✗ Not ready' },
  };
  const { cls, label } = config[status];
  return (
    <span className={`inline-block px-2.5 py-1 text-[11px] font-semibold rounded-full ${cls}`}>
      {label}
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
