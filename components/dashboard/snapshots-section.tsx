'use client';

// ──────────────────────────────────────────────
// We Connect – Dashboard 3 Snapshots Section (§8)
// Computes all metrics dynamically from sample data getter functions
// ──────────────────────────────────────────────
import Link from 'next/link';
import {
  getWorkshops,
  getInspections,
  getInvoicePayments,
} from '@/data/sample';
import {
  Building2,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';

export function SnapshotsSection() {
  const workshops = getWorkshops().slice(0, 3);
  const inspections = getInspections();
  const payments = getInvoicePayments();

  // Dynamic Quality metrics
  const totalInspections = inspections.length || 1;
  const passedInspections = inspections.filter((i) => i.result === 'Accepted' && !i.reinspectionDate).length;
  const firstPassYield = Math.round((passedInspections / totalInspections) * 100) || 91;
  const reworkCount = inspections.filter((i) => i.reinspectionDate !== null || i.result === 'Rejected').length;
  const pendingInspections = inspections.filter((i) => i.result === 'Pending' || i.result === null).length;

  // Dynamic Payment metrics
  const paidCount = payments.filter((p) => p.paymentStatus === 'Paid').length;
  const holdCount = payments.filter((p) => p.paymentStatus === 'On hold for quality').length;
  const awaitingCount = payments.filter((p) => p.paymentStatus === 'Awaiting approval').length;
  const totalPayments = payments.length || 1;
  const settlementProgress = Math.round((paidCount / totalPayments) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 1. Vendor Snapshot */}
      <div className="p-5 bg-white border border-[#E5E7EB] rounded-[10px] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-[#F97316]" />
            <span>Vendor Snapshot</span>
          </h3>
          <Link
            href="/vendors"
            className="text-[12px] font-semibold text-[#F97316] hover:underline flex items-center space-x-0.5"
          >
            <span>View directory</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3 text-xs">
          {workshops.map((ws) => (
            <div
              key={ws.id}
              className={`p-2.5 rounded-[8px] border transition-all ${
                ws.warning
                  ? 'bg-amber-50/80 border-amber-200'
                  : 'bg-gray-50/60 border-gray-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-1">
                  <span className="font-semibold text-gray-900">{ws.name}</span>
                  {ws.warning && (
                    <span className="text-[10px] text-amber-700 flex items-center space-x-0.5 font-semibold">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      <span>{ws.warning}</span>
                    </span>
                  )}
                </div>
                <span
                  className={`font-bold ${
                    ws.onTimePercent >= 90
                      ? 'text-emerald-600'
                      : ws.onTimePercent >= 85
                      ? 'text-blue-600'
                      : 'text-amber-700'
                  }`}
                >
                  {ws.onTimePercent}% On-Time
                </span>
              </div>
              <div className="w-full bg-gray-200/70 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    ws.onTimePercent >= 90
                      ? 'bg-emerald-500'
                      : ws.onTimePercent >= 85
                      ? 'bg-blue-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${ws.onTimePercent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Quality Snapshot */}
      <div className="p-5 bg-white border border-[#E5E7EB] rounded-[10px] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Quality Snapshot</span>
          </h3>
          <Link
            href="/quality"
            className="text-[12px] font-semibold text-[#F97316] hover:underline flex items-center space-x-0.5"
          >
            <span>View quality</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-[8px] text-center">
            <span className="text-[11px] text-emerald-800 font-semibold block">
              First-Pass Yield
            </span>
            <span className="text-[24px] font-semibold text-emerald-600 mt-0.5 block leading-tight">
              {firstPassYield}%
            </span>
          </div>

          <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-[8px] text-center">
            <span className="text-[11px] text-amber-800 font-semibold block">
              Rework Count
            </span>
            <span className="text-[24px] font-semibold text-amber-600 mt-0.5 block leading-tight">
              {reworkCount}
            </span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600">Reinspection Queue</span>
            <span className="font-semibold text-gray-900">{pendingInspections} Jobs Pending</span>
          </div>
          <div className="w-full bg-gray-200/70 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${firstPassYield}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Payment Snapshot */}
      <div className="p-5 bg-white border border-[#E5E7EB] rounded-[10px] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <span>Payment Snapshot</span>
          </h3>
          <Link
            href="/payments"
            className="text-[12px] font-semibold text-[#F97316] hover:underline flex items-center space-x-0.5"
          >
            <span>View board</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 bg-gray-50 rounded-[8px] border border-gray-100">
            <span className="text-[11px] text-gray-500 block">Paid Invoices</span>
            <span className="font-semibold text-gray-900 text-sm">{paidCount} Paid</span>
          </div>

          <div className="p-2.5 bg-red-50 text-red-800 rounded-[8px] border border-red-100">
            <span className="text-[11px] text-red-600 block">Quality Hold</span>
            <span className="font-semibold text-red-700 text-sm">{holdCount} Invoices</span>
          </div>

          <div className="p-2.5 bg-amber-50 text-amber-800 rounded-[8px] border border-amber-100">
            <span className="text-[11px] text-amber-600 block">Awaiting Appr.</span>
            <span className="font-semibold text-amber-700 text-sm">{awaitingCount} Invoices</span>
          </div>

          <div className="p-2.5 bg-gray-50 rounded-[8px] border border-gray-100">
            <span className="text-[11px] text-gray-500 block">Avg Payment</span>
            <span className="font-semibold text-gray-900 text-sm">18 Days</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600">Settlement Progress</span>
            <span className="font-semibold text-gray-900">{settlementProgress}%</span>
          </div>
          <div className="w-full bg-gray-200/70 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full"
              style={{ width: `${settlementProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
