'use client';

// ──────────────────────────────────────────────
// VendorFlow – Executive Subcontracting Dashboard
// Route: / (app/page.tsx)
// Interactive filters, vendor reminder dialog, tooltips
// Owned by Lokesh (Team Lead) (§8 & Prompt 4)
// ──────────────────────────────────────────────
import { useState } from 'react';
import Link from 'next/link';
import {
  SummaryCards,
  NeedsActionList,
  AssemblyCalendar,
  JobsOverviewTable,
  SnapshotsSection,
} from '@/components/dashboard';
import { LayoutDashboard, Plus, Upload, Building2, Filter } from 'lucide-react';

export default function DashboardPage() {
  const [selectedVendor, setSelectedVendor] = useState('All Vendors');
  const [selectedPartType, setSelectedPartType] = useState('All Part Types');
  const [selectedProject, setSelectedProject] = useState('All Projects');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Dashboard Top Header & Actions */}
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

        {/* Header Action Buttons */}
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

      {/* Interactive Dashboard Local Filter Toolbar */}
      <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs flex items-center justify-between">
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-500 font-bold">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Dashboard Filters:</span>
          </div>

          {/* Vendor Filter */}
          <select
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="All Vendors">All Vendors</option>
            <option value="Shree Fabricators">Shree Fabricators</option>
            <option value="Om Engg Works">Om Engg Works</option>
            <option value="Patil Steel">Patil Steel</option>
            <option value="Kulkarni Engineering">Kulkarni Engineering</option>
            <option value="Deshmukh Metalworks">Deshmukh Metalworks</option>
          </select>

          {/* Part Type Filter */}
          <select
            value={selectedPartType}
            onChange={(e) => setSelectedPartType(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="All Part Types">Part Type: All</option>
            <option value="Bracket">Bracket</option>
            <option value="Frame">Frame</option>
            <option value="Stand">Stand</option>
            <option value="Handle">Handle</option>
            <option value="Flange">Flange</option>
          </select>

          {/* Project Filter */}
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="All Projects">Project: All</option>
            <option value="Boiler B-200">Boiler B-200</option>
            <option value="Boiler B-300">Boiler B-300</option>
          </select>
        </div>

        {(selectedVendor !== 'All Vendors' || selectedPartType !== 'All Part Types' || selectedProject !== 'All Projects') && (
          <button
            type="button"
            onClick={() => {
              setSelectedVendor('All Vendors');
              setSelectedPartType('All Part Types');
              setSelectedProject('All Projects');
            }}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-800"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* 1. 5 Summary Stat Cards */}
      <SummaryCards
        selectedVendor={selectedVendor}
        selectedPartType={selectedPartType}
        selectedProject={selectedProject}
      />

      {/* 2. Main 2-Column Grid: Needs Action Today & 14-Day Assembly Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NeedsActionList />
        <AssemblyCalendar />
      </div>

      {/* 3. Jobs Overview Table */}
      <JobsOverviewTable
        selectedVendor={selectedVendor}
        selectedPartType={selectedPartType}
        selectedProject={selectedProject}
      />

      {/* 4. Bottom 3 Snapshots: Vendor, Quality, Payment */}
      <SnapshotsSection />
    </div>
  );
}
