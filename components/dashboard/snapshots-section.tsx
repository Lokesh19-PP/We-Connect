'use client';

// ──────────────────────────────────────────────
// VendorFlow – Dashboard 3 Snapshots Section (§8)
// Vendor Snapshot, Quality Snapshot, Payment Snapshot
// ──────────────────────────────────────────────
import Link from 'next/link';
import {
  Building2,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export function SnapshotsSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 1. Vendor Snapshot */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Vendor Snapshot</span>
          </h3>
          <Link
            href="/vendors"
            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-0.5"
          >
            <span>View directory</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
            <span className="font-semibold text-slate-800">Shree Fabricators</span>
            <span className="font-bold text-emerald-600">96% On-Time</span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
            <span className="font-semibold text-slate-800">Om Engg Works</span>
            <span className="font-bold text-blue-600">88% On-Time</span>
          </div>

          <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-lg flex items-center justify-between">
            <div>
              <span className="font-bold text-amber-900 block">Patil Steel</span>
              <span className="text-[10px] text-amber-700 flex items-center space-x-1 font-semibold mt-0.5">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                <span>No update in 2 days</span>
              </span>
            </div>
            <span className="font-bold text-amber-700">82% On-Time</span>
          </div>
        </div>
      </div>

      {/* 2. Quality Snapshot */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Quality Snapshot</span>
          </h3>
          <Link
            href="/quality"
            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-0.5"
          >
            <span>View quality</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
            <span className="text-[10px] text-emerald-700 font-semibold block">
              First-Pass Yield
            </span>
            <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">
              91%
            </span>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-center">
            <span className="text-[10px] text-amber-700 font-semibold block">
              Rework Count
            </span>
            <span className="text-2xl font-extrabold text-amber-600 mt-1 block">
              5
            </span>
          </div>
        </div>

        <div className="p-2.5 bg-slate-50 rounded-lg text-xs flex items-center justify-between text-slate-700">
          <span className="font-medium">Reinspection Queue:</span>
          <span className="font-bold text-slate-900">2 Jobs Pending</span>
        </div>
      </div>

      {/* 3. Payment Snapshot */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <span>Payment Snapshot</span>
          </h3>
          <Link
            href="/payments"
            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-0.5"
          >
            <span>View board</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-slate-50 rounded-lg">
            <span className="text-[10px] text-slate-400 block">Received</span>
            <span className="font-bold text-slate-900 text-sm">12 Paid</span>
          </div>

          <div className="p-2 bg-red-50 text-red-800 rounded-lg">
            <span className="text-[10px] text-red-600 block">Quality Hold</span>
            <span className="font-bold text-red-700 text-sm">2 Invoices</span>
          </div>

          <div className="p-2 bg-amber-50 text-amber-800 rounded-lg">
            <span className="text-[10px] text-amber-600 block">Awaiting Appr.</span>
            <span className="font-bold text-amber-700 text-sm">4 Invoices</span>
          </div>

          <div className="p-2 bg-slate-50 rounded-lg">
            <span className="text-[10px] text-slate-400 block">Avg Days Pay</span>
            <span className="font-bold text-slate-900 text-sm">18 Days</span>
          </div>
        </div>
      </div>
    </div>
  );
}
