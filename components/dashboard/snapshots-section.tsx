'use client';

// ──────────────────────────────────────────────
// We Connect – Dashboard 3 Snapshots Section (§8)
// Vendor Snapshot, Quality Snapshot, Payment Snapshot with progress bars
// ──────────────────────────────────────────────
import Link from 'next/link';
import {
  Building2,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';

export function SnapshotsSection() {
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
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-gray-900">Shree Fabricators</span>
              <span className="font-bold text-emerald-600">96% On-Time</span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '96%' }} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-gray-900">Om Engg Works</span>
              <span className="font-bold text-blue-600">88% On-Time</span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: '88%' }} />
            </div>
          </div>

          <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-[8px]">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-amber-900">Patil Steel</span>
                <span className="text-[10px] text-amber-700 flex items-center space-x-0.5 font-semibold">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  <span>No update in 2d</span>
                </span>
              </div>
              <span className="font-bold text-amber-700">82% On-Time</span>
            </div>
            <div className="w-full bg-amber-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: '82%' }} />
            </div>
          </div>
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
              91%
            </span>
          </div>

          <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-[8px] text-center">
            <span className="text-[11px] text-amber-800 font-semibold block">
              Rework Count
            </span>
            <span className="text-[24px] font-semibold text-amber-600 mt-0.5 block leading-tight">
              5
            </span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600">Inspection Pass Rate</span>
            <span className="font-semibold text-gray-900">91%</span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '91%' }} />
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
            <span className="font-semibold text-gray-900 text-sm">12 Paid</span>
          </div>

          <div className="p-2.5 bg-red-50 text-red-800 rounded-[8px] border border-red-100">
            <span className="text-[11px] text-red-600 block">Quality Hold</span>
            <span className="font-semibold text-red-700 text-sm">2 Invoices</span>
          </div>

          <div className="p-2.5 bg-amber-50 text-amber-800 rounded-[8px] border border-amber-100">
            <span className="text-[11px] text-amber-600 block">Awaiting Appr.</span>
            <span className="font-semibold text-amber-700 text-sm">4 Invoices</span>
          </div>

          <div className="p-2.5 bg-gray-50 rounded-[8px] border border-gray-100">
            <span className="text-[11px] text-gray-500 block">Avg Payment</span>
            <span className="font-semibold text-gray-900 text-sm">18 Days</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600">Settlement Progress</span>
            <span className="font-semibold text-gray-900">67%</span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: '67%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
