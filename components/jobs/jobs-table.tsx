'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { EnrichedJob } from '@/data/jobs';
import { RiskBadge } from './risk-badge';
import { StageBadge } from './stage-badge';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Clock,
  Calendar,
  Layers,
  Building,
} from 'lucide-react';

export type SortField =
  | 'id'
  | 'partDisplayName'
  | 'workshopName'
  | 'quantity'
  | 'stage'
  | 'dueDate'
  | 'neededByDate'
  | 'risk';

export type SortDirection = 'asc' | 'desc';

interface JobsTableProps {
  jobs: EnrichedJob[];
  loading?: boolean;
  onClearFilters?: () => void;
  openNewJobDialog?: () => void;
  canCreateJob?: boolean;
}

export function JobsTable({
  jobs,
  loading = false,
  onClearFilters,
  openNewJobDialog,
  canCreateJob = false,
}: JobsTableProps) {
  const router = useRouter();

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Sort logic
  const sortedJobs = [...jobs].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'id':
        comparison = a.id.localeCompare(b.id, undefined, { numeric: true });
        break;
      case 'partDisplayName':
        comparison = a.partDisplayName.localeCompare(b.partDisplayName);
        break;
      case 'workshopName':
        comparison = a.workshopName.localeCompare(b.workshopName);
        break;
      case 'quantity':
        comparison = a.quantity - b.quantity;
        break;
      case 'stage':
        comparison = a.stage.localeCompare(b.stage);
        break;
      case 'dueDate':
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        break;
      case 'neededByDate':
        comparison = new Date(a.neededByDate).getTime() - new Date(b.neededByDate).getTime();
        break;
      case 'risk':
        // Sort order: Overdue, May miss date, Reinspection due, At risk, On track
        const riskPriority: Record<string, number> = {
          Overdue: 1,
          'May miss date': 2,
          'Reinspection due': 3,
          'At risk': 4,
          'On track': 5,
        };
        comparison = (riskPriority[a.risk] || 99) - (riskPriority[b.risk] || 99);
        break;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Pagination slice
  const totalEntries = sortedJobs.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentJobs = sortedJobs.slice(startIndex, startIndex + pageSize);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60 group-hover:opacity-100" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-600 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-600 font-bold" />
    );
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="h-5 w-32 bg-slate-200 rounded-md animate-pulse" />
          <div className="h-5 w-24 bg-slate-200 rounded-md animate-pulse" />
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="h-4 w-16 bg-slate-200 rounded-md animate-pulse" />
              <div className="h-4 w-32 bg-slate-200 rounded-md animate-pulse" />
              <div className="h-4 w-28 bg-slate-200 rounded-md animate-pulse" />
              <div className="h-4 w-16 bg-slate-200 rounded-md animate-pulse" />
              <div className="h-4 w-20 bg-slate-200 rounded-md animate-pulse" />
              <div className="h-4 w-24 bg-slate-200 rounded-md animate-pulse" />
              <div className="h-4 w-20 bg-slate-200 rounded-md animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-2xs">
        <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">No jobs found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
          No jobs match your current search and filter criteria. Try adjusting the filters or create a new job.
        </p>
        <div className="flex items-center justify-center gap-3">
          {onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Clear all filters
            </button>
          )}
          {canCreateJob && openNewJobDialog && (
            <button
              type="button"
              onClick={openNewJobDialog}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#FF6B00] hover:bg-[#E05E00] rounded-lg transition-colors shadow-xs"
            >
              + Create New Job
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs flex flex-col">
      {/* Table header bar */}
      <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing{' '}
          <span className="font-semibold text-slate-900">
            {startIndex + 1}–{Math.min(startIndex + pageSize, totalEntries)}
          </span>{' '}
          of <span className="font-semibold text-slate-900">{totalEntries}</span> jobs
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span>Click row to view details</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold tracking-wider select-none">
              <th
                onClick={() => handleSort('id')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Job</span>
                  {getSortIcon('id')}
                </div>
              </th>

              <th
                onClick={() => handleSort('partDisplayName')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Part</span>
                  {getSortIcon('partDisplayName')}
                </div>
              </th>

              <th
                onClick={() => handleSort('workshopName')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Vendor</span>
                  {getSortIcon('workshopName')}
                </div>
              </th>

              <th
                onClick={() => handleSort('quantity')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Ordered / Accepted</span>
                  {getSortIcon('quantity')}
                </div>
              </th>

              <th
                onClick={() => handleSort('stage')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Stage</span>
                  {getSortIcon('stage')}
                </div>
              </th>

              <th
                onClick={() => handleSort('dueDate')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Due Date</span>
                  {getSortIcon('dueDate')}
                </div>
              </th>

              <th
                onClick={() => handleSort('neededByDate')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Needed By</span>
                  {getSortIcon('neededByDate')}
                </div>
              </th>

              <th
                onClick={() => handleSort('risk')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Risk</span>
                  {getSortIcon('risk')}
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {currentJobs.map((job) => (
              <tr
                key={job.id}
                onClick={() => router.push(`/jobs/${job.id}`)}
                className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
              >
                {/* Job ID & Project */}
                <td className="py-3.5 px-4 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {job.id}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {job.project}
                    </span>
                  </div>
                </td>

                {/* Part Name & Material */}
                <td className="py-3.5 px-4">
                  <div>
                    <div className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {job.partDisplayName}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span className="inline-block px-1.5 py-0.2 bg-slate-100 rounded text-[10px] text-slate-600 font-medium">
                        {job.partType}
                      </span>
                      <span>•</span>
                      <span className="truncate max-w-[140px]">{job.material}</span>
                    </div>
                  </div>
                </td>

                {/* Vendor / Workshop */}
                <td className="py-3.5 px-4">
                  <div className="font-medium text-slate-800 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{job.workshopName}</span>
                  </div>
                </td>

                {/* Ordered / Accepted */}
                <td className="py-3.5 px-4 text-right">
                  <div className="inline-flex items-baseline justify-end gap-1 font-mono">
                    <span className="font-bold text-slate-900 text-sm">
                      {job.quantity}
                    </span>
                    <span className="text-slate-400 text-xs">/</span>
                    <span
                      className={`text-xs font-semibold ${
                        job.acceptedQuantity > 0
                          ? 'text-emerald-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {job.acceptedQuantity}
                    </span>
                  </div>
                </td>

                {/* Stage */}
                <td className="py-3.5 px-4">
                  <StageBadge stage={job.stage} />
                </td>

                {/* Due Date */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDate(job.dueDate)}</span>
                  </div>
                </td>

                {/* Needed By */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDate(job.neededByDate)}</span>
                  </div>
                </td>

                {/* Risk */}
                <td className="py-3.5 px-4">
                  <RiskBadge risk={job.risk} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-600">
          <div className="text-slate-500">
            Page <span className="font-semibold text-slate-800">{currentPage}</span> of{' '}
            <span className="font-semibold text-slate-800">{totalPages}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1;
              return (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                    currentPage === pageNumber
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
