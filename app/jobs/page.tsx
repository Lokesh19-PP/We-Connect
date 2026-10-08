'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { getJobs, subscribeJobs, type EnrichedJob } from '@/data/jobs';
import { getWorkshops, getParts } from '@/data/sample';
import { JobsTable } from '@/components/jobs/jobs-table';
import { JobsFilters, type FilterState } from '@/components/jobs/jobs-filters';
import { NewJobDialog, NewJobButton } from '@/components/jobs/new-job-dialog';
import { ToastContainer, type ToastMessage } from '@/components/jobs/toast';
import { useRole } from '@/lib/role-context';
import { can } from '@/lib/permissions';
import { Briefcase, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

export default function JobsPage() {
  const { role } = useRole();
  const searchParams = useSearchParams();

  const [jobs, setJobs] = useState<EnrichedJob[]>(() => getJobs());
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (
    title: string,
    message?: string,
    type: 'success' | 'warning' | 'error' | 'info' = 'success'
  ) => {
    setToasts((prev) => [
      ...prev,
      { id: `toast-${Date.now()}-${Math.random()}`, title, message, type },
    ]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Subscribe to jobs mutations (e.g. created jobs or stage updates)
  useEffect(() => {
    return subscribeJobs(() => {
      setJobs([...getJobs()]);
    });
  }, []);

  // Filter State
  const initialFilters: FilterState = {
    search: '',
    project: 'all',
    vendor: 'all',
    dateRange: 'all',
    partType: 'all',
    stage: 'all',
    risk: 'all',
  };
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  // Workshop & Part Type lists for filter dropdowns
  const workshops = useMemo(() => getWorkshops(), []);
  const partTypes = useMemo(() => {
    const types = new Set(getParts().map((p) => p.type));
    return Array.from(types);
  }, []);

  // Filtered jobs calculation
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // 1. Text search
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const matchesQuery =
          job.id.toLowerCase().includes(query) ||
          job.partDisplayName.toLowerCase().includes(query) ||
          job.workshopName.toLowerCase().includes(query) ||
          job.material.toLowerCase().includes(query) ||
          job.notes.toLowerCase().includes(query) ||
          job.project.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // 2. Project / Boiler
      if (filters.project !== 'all') {
        if (job.project !== filters.project) return false;
      }

      // 3. Vendor
      if (filters.vendor !== 'all') {
        if (job.workshopName !== filters.vendor) return false;
      }

      // 4. Part Type
      if (filters.partType !== 'all') {
        if (job.partType !== filters.partType) return false;
      }

      // 5. Stage
      if (filters.stage !== 'all') {
        if (job.stage !== filters.stage) return false;
      }

      // 6. Risk
      if (filters.risk !== 'all') {
        if (job.risk !== filters.risk) return false;
      }

      // 7. Date range filter
      if (filters.dateRange !== 'all') {
        const today = new Date('2026-10-08'); // App demo date context
        const dueDate = new Date(job.dueDate);
        const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (filters.dateRange === 'next7') {
          if (diffDays < 0 || diffDays > 7) return false;
        } else if (filters.dateRange === 'next14') {
          if (diffDays < 0 || diffDays > 14) return false;
        } else if (filters.dateRange === 'thisMonth') {
          if (dueDate.getMonth() !== today.getMonth() || dueDate.getFullYear() !== today.getFullYear()) {
            return false;
          }
        } else if (filters.dateRange === 'overdue') {
          if (diffDays >= 0) return false;
        }
      }

      return true;
    });
  }, [jobs, filters]);

  // Summary counts
  const totalCount = jobs.length;
  const overdueCount = jobs.filter((j) => j.risk === 'Overdue').length;
  const atRiskCount = jobs.filter((j) => j.risk === 'At risk' || j.risk === 'May miss date').length;
  const onTrackCount = jobs.filter((j) => j.risk === 'On track').length;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Jobs</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              {totalCount} Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Fabrication purchase orders, workshop allocation, stage progression, and risk monitoring
          </p>
        </div>

        {/* Orange "New Job" Button */}
        <div className="flex items-center gap-2">
          <NewJobButton onClick={() => setIsDialogOpen(true)} />
        </div>
      </div>

      {/* Quick Status KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-[11px] font-medium">Total Jobs</p>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{totalCount}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Briefcase className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-[11px] font-medium">On Track</p>
            <p className="text-lg font-bold text-emerald-700 mt-0.5">{onTrackCount}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-[11px] font-medium">At Risk / Alert</p>
            <p className="text-lg font-bold text-amber-700 mt-0.5">{atRiskCount}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-[11px] font-medium">Overdue</p>
            <p className="text-lg font-bold text-red-700 mt-0.5">{overdueCount}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <JobsFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
        workshops={workshops}
        partTypes={partTypes}
      />

      {/* Jobs Table */}
      <JobsTable
        jobs={filteredJobs}
        loading={loading}
        onClearFilters={resetFilters}
        openNewJobDialog={() => setIsDialogOpen(true)}
        canCreateJob={can(role, 'job.create')}
      />

      {/* New Job Dialog */}
      <NewJobDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onJobCreated={(newJob) => {
          setJobs([...getJobs()]);
        }}
        showToast={addToast}
      />
    </div>
  );
}
