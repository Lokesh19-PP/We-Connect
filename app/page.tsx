'use client';

// ──────────────────────────────────────────────
// We Connect – Executive Subcontracting Dashboard
// Route: / (app/page.tsx)
// Live Supabase integration with 60s auto-refresh,
// loading skeletons, and matching lib/rules.ts
// ──────────────────────────────────────────────
import { useState, useEffect, useCallback } from 'react';
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
import {
  LayoutDashboard,
  Plus,
  Upload,
  Building2,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { fetchDashboardData, type DashboardData } from '@/lib/data';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Interactive local filter toolbar
  const [selectedVendor, setSelectedVendor] = useState('All Vendors');
  const [selectedPartType, setSelectedPartType] = useState('All Part Types');
  const [selectedProject, setSelectedProject] = useState('All Projects');

  const loadData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    }
    setError(null);

    const res = await fetchDashboardData();
    if (res.error) {
      setError(res.error);
    } else if (res.data) {
      setDashboardData(res.data);
      setLastRefreshed(new Date());
    }

    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    async function initialLoad() {
      setIsLoading(true);
      const res = await fetchDashboardData();
      if (!isSubscribed) return;

      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        setDashboardData(res.data);
        setLastRefreshed(new Date());
      }
      setIsLoading(false);
    }

    initialLoad();

    // Auto-refresh every 60 seconds
    const intervalId = setInterval(() => {
      loadData(false);
    }, 60000);

    return () => {
      isSubscribed = false;
      clearInterval(intervalId);
    };
  }, [loadData]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8 animate-in fade-in duration-300">
      {/* Dashboard Top Header & Actions */}
      <PageHeader
        title="Dashboard"
        subtitle="Keep every part on track for assembly — Deccan Boilers Pune Unit"
        icon={LayoutDashboard}
        actions={
          <div className="flex items-center space-x-3">
            {/* 60s Live Sync Badge & Manual Refresh */}
            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={isRefreshing || isLoading}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-xs transition-colors disabled:opacity-60"
              title={`Last refreshed at ${lastRefreshed.toLocaleTimeString()}`}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#F97316] ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
              />
              <span className="hidden sm:inline">Refresh (60s)</span>
            </button>

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

      {/* Error Retry Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold">Unable to refresh dashboard metrics: </span>
              <span>{error}</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(true)}
            className="text-xs font-semibold text-red-700 border-red-300 hover:bg-red-100"
          >
            Retry Now
          </Button>
        </div>
      )}

      {/* Interactive Dashboard Local Filter Toolbar */}
      <div className="p-3.5 bg-white border border-[#E5E7EB] rounded-[10px] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center space-x-3 text-xs">
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
            <option value="Jadhav & Sons">Jadhav & Sons</option>
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
            <option value="Boiler B-450">Boiler B-450</option>
            <option value="Boiler #12">Boiler #12</option>
          </select>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-500 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Live Supabase Connected</span>
          </div>

          {(selectedVendor !== 'All Vendors' ||
            selectedPartType !== 'All Part Types' ||
            selectedProject !== 'All Projects') && (
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
      </div>

      {/* 1. 5 Summary Stat Cards */}
      <SummaryCards
        data={dashboardData}
        isLoading={isLoading}
        selectedVendor={selectedVendor}
        selectedPartType={selectedPartType}
        selectedProject={selectedProject}
      />

      {/* 2. Main 2-Column Grid: Needs Action Today & 14-Day Assembly Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NeedsActionList
          items={dashboardData?.actionItems}
          isLoading={isLoading}
          onRefresh={() => loadData(false)}
        />
        <AssemblyCalendar
          slots={dashboardData?.assemblySlots}
          isLoading={isLoading}
        />
      </div>

      {/* 3. Jobs Overview Table */}
      <JobsOverviewTable
        jobs={dashboardData?.jobs}
        parts={dashboardData?.parts}
        isLoading={isLoading}
        selectedVendor={selectedVendor}
        selectedPartType={selectedPartType}
        selectedProject={selectedProject}
      />

      {/* 4. Bottom 3 Snapshots: Vendor, Quality, Payment */}
      <SnapshotsSection
        vendorMetrics={dashboardData?.vendorMetrics}
        qualityMetrics={dashboardData?.qualityMetrics}
        paymentMetrics={dashboardData?.paymentMetrics}
        isLoading={isLoading}
      />
    </div>
  );
}
