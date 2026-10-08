'use client';

import type { Delivery, Inspection, InvoicePayment, PaymentStatus } from '@/types';
import { getPaymentStatus } from '@/lib/rules';
import {
  Truck,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';

interface PaymentQualitySummaryProps {
  deliveries: Delivery[];
  inspections: Inspection[];
  invoice?: InvoicePayment;
}

export function PaymentQualitySummary({
  deliveries,
  inspections,
  invoice,
}: PaymentQualitySummaryProps) {
  // Pure business rule invocation from @/lib/rules
  const paymentStatus = getPaymentStatus(deliveries, inspections, invoice);

  // Latest delivery
  const latestDelivery = deliveries[deliveries.length - 1];

  // Latest inspection
  const sortedInspections = [...inspections].sort(
    (a, b) => new Date(b.inspectedDate).getTime() - new Date(a.inspectedDate).getTime()
  );
  const latestInspection = sortedInspections[0];

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'Paid':
        return {
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200 ring-1 ring-emerald-500/20',
          icon: CheckCircle2,
          desc: 'Payment completed and disbursed to vendor',
        };
      case 'Ready':
        return {
          color: 'bg-blue-50 text-blue-800 border-blue-200 ring-1 ring-blue-500/20',
          icon: CheckCircle2,
          desc: 'Rule 3 satisfied: Delivery received, inspection accepted, and invoice present',
        };
      case 'On hold for quality':
        return {
          color: 'bg-amber-50 text-amber-800 border-amber-200 ring-1 ring-amber-500/20',
          icon: AlertTriangle,
          desc: 'Rule 4 active: Inspection rejected or pending quality clearance',
        };
      case 'Awaiting approval':
        return {
          color: 'bg-indigo-50 text-indigo-800 border-indigo-200 ring-1 ring-indigo-500/20',
          icon: Clock,
          desc: 'Awaiting finance officer approval',
        };
      case 'Not ready':
      default:
        return {
          color: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: Clock,
          desc: 'Awaiting delivery, inspection sign-off, or vendor invoice upload',
        };
    }
  };

  const paymentMeta = getPaymentStatusBadge(paymentStatus);
  const PaymentIcon = paymentMeta.icon;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">
          Delivery, Quality & Payment Summary
        </h3>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
          Rules 3 & 4
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Delivery Summary */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-blue-600" />
              Goods Receipt / Delivery
            </span>
            <span className="text-slate-400 font-mono">
              {deliveries.length} recorded
            </span>
          </div>

          {latestDelivery ? (
            <div className="text-xs space-y-1 pt-1">
              <p className="font-semibold text-slate-900">
                Challan #{latestDelivery.challanNumber}
              </p>
              <p className="text-slate-600">
                Quantity: <strong className="text-slate-900">{latestDelivery.quantity} pcs</strong>
              </p>
              <p className="text-slate-500 text-[11px]">
                Received on {latestDelivery.deliveredDate} by {latestDelivery.receivedBy}
              </p>
            </div>
          ) : (
            <div className="text-xs text-slate-500 pt-1">
              <p className="italic">No shipments delivered to stores yet</p>
            </div>
          )}
        </div>

        {/* Inspection Summary */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Quality Inspection
            </span>
            {latestInspection && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  latestInspection.result === 'Accepted'
                    ? 'bg-emerald-100 text-emerald-800'
                    : latestInspection.result === 'Rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {latestInspection.result}
              </span>
            )}
          </div>

          {latestInspection ? (
            <div className="text-xs space-y-1 pt-1">
              <p className="font-semibold text-slate-900">
                Inspector: {latestInspection.inspectedBy} ({latestInspection.inspectedDate})
              </p>
              <p className="text-slate-600 line-clamp-2">
                Remarks: {latestInspection.remarks}
              </p>
              {latestInspection.reinspectionDate && (
                <p className="text-red-700 font-semibold text-[11px]">
                  Reinspection Due: {latestInspection.reinspectionDate}
                </p>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-500 pt-1">
              <p className="italic">Awaiting delivery before quality inspection</p>
            </div>
          )}
        </div>

        {/* Payment Summary */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-blue-600" />
              Payment Status
            </span>
          </div>

          <div className="pt-1 space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${paymentMeta.color}`}
              >
                <PaymentIcon className="w-3.5 h-3.5" />
                <span>{paymentStatus}</span>
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              {paymentMeta.desc}
            </p>

            {invoice?.invoiceNumber && (
              <p className="text-[11px] text-slate-500 font-mono">
                Invoice: {invoice.invoiceNumber} (₹{invoice.amount.toLocaleString('en-IN')})
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
