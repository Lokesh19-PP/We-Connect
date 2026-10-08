'use client';

// ──────────────────────────────────────────────
// We Connect – Executive Subcontracting Dashboard
// Route: / (app/page.tsx)
// Interactive filters, vendor reminder dialog, tooltips
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
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Plus, Upload, Building2, Filter } from 'lucide-react';

export default function DashboardPage() {
  const [selectedVendor, setSelectedVendor] = useState('All Vendors');
  const [selectedPartType, setSelectedPartType] = useState('All Part Types');
  const [selectedProject, setSelectedProject] = useState('All Projects');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8 animate-in fade-in duration-300">
      {/* Dashboard Top Header & Actions */}
      <PageHeader
        title="Dashboard"
        subtitle="Keep every part on track for assembly — Deccan Boilers Pune Unit"
        icon={LayoutDashboard}
        actions={
          <div className="flex items-center space-x-3">
            <Link href="/vendors">
              <Button variant="outline" size="sm">
                <Building2 className="w-3.5 h-3.5" />
                Add Vendor
              </Button>
            </Link>

            <Link href="/drawings">
              <Button variant="outline" size="sm">
                <Upload className="w-3.5 h-3.5" />
                Upload Revision
              </Button>
            </Link>

            <Link href="/jobs?new=1">
              <Button variant="default" size="sm">
                <Plus className="w-4 h-4" />
                New Job
              </Button>
            </Link>
          </div>
        }
      />

      {/* Interactive Dashboard Local Filter Toolbar */}
      <div className="p-3.5 bg-white border border-[#E5E7EB] rounded-[10px] shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 text-gray-500 font-semibold">
            <Filter className="w-4 h-4 text-[#F97316]" />
            <span>Dashboard Filters:</span>
          </div>

          {/* Vendor Filter */}
          <select
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
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
            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
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
            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
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
            className="text-[12px] font-semibold text-[#F97316] hover:underline"
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
