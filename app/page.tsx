'use client';

// ──────────────────────────────────────────────
// VendorFlow – Executive Subcontracting Dashboard
// Route: / (app/page.tsx)
// Owned by Lokesh (Team Lead) (§8)
// ──────────────────────────────────────────────
import Link from 'next/link';
import {
  SummaryCards,
  NeedsActionList,
  AssemblyCalendar,
  JobsOverviewTable,
  SnapshotsSection,
} from '@/components/dashboard';
import { LayoutDashboard, Plus, Upload, Building2 } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <LayoutDashboard className="w-7 h-7 text-blue-600 shrink-0" />
            <span>Dashboard</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Keep every part on track for assembly — Deccan Boilers Pune Unit
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <Link
            href="/vendors"
            className="flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl shadow-2xs transition-colors"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Add Vendor</span>
          </Link>

          <Link
            href="/drawings"
            className="flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl shadow-2xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Revision</span>
          </Link>

          <Link
            href="/jobs?new=1"
            className="flex items-center space-x-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Job</span>
          </Link>
        </div>
      </div>

      {/* 1. 5 Summary Stat Cards */}
      <SummaryCards />

      {/* 2. Main 2-Column Grid: Needs Action Today & 14-Day Assembly Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NeedsActionList />
        <AssemblyCalendar />
      </div>

      {/* 3. Jobs Overview Table */}
      <JobsOverviewTable />

      {/* 4. Bottom 3 Snapshots: Vendor, Quality, Payment */}
      <SnapshotsSection />
    </div>
  );
}
