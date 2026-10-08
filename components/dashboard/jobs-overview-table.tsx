'use client';

// ──────────────────────────────────────────────
// We Connect – Jobs Overview Table (§8 & Prompt 4)
// 25 jobs paginated (10 per page) with StatusBadge & design system styling
// ──────────────────────────────────────────────
import { useState } from 'react';
import Link from 'next/link';
import { getJobs, getParts } from '@/data/sample';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';

interface JobsOverviewTableProps {
  selectedProject?: string;
  selectedVendor?: string;
  selectedPartType?: string;
  selectedDateRange?: string;
}

export function JobsOverviewTable({
  selectedProject = 'All Projects',
  selectedVendor = 'All Vendors',
  selectedPartType = 'All Part Types',
}: JobsOverviewTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const pageSize = 10;
  const allJobs = getJobs();
  const allParts = getParts();

  // Filter jobs dynamically
  const filteredJobs = allJobs.filter((job) => {
    if (
      selectedVendor !== 'All Vendors' &&
      !job.workshopName.toLowerCase().includes(selectedVendor.toLowerCase())
    ) {
      return false;
    }

    if (selectedPartType !== 'All Part Types') {
      const part = allParts.find((p) => p.id === job.partId);
      if (part && !part.name.toLowerCase().includes(selectedPartType.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  const totalPages = Math.ceil(filteredJobs.length / pageSize) || 1;

  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[10px] shadow-xs overflow-hidden space-y-0">
      {/* Header */}
      <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-semibold text-gray-900 flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-[#F97316]" />
            <span>Jobs Overview ({filteredJobs.length} Shown)</span>
          </h2>
          <p className="text-[12px] text-gray-500 mt-0.5">
            Subcontracting jobs status, stage progression, and assembly target dates
          </p>
        </div>

        <Link
          href="/jobs"
          className="text-xs font-semibold text-[#F97316] hover:underline flex items-center space-x-1"
        >
          <span>View all jobs</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-900 border-collapse min-w-[750px]">
          <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider text-xs border-b border-[#E5E7EB]">
            <tr>
              <th className="px-4 py-3">Job & Part</th>
              <th className="px-4 py-3">Vendor Workshop</th>
              <th className="px-4 py-3 text-center">Ordered / Accepted</th>
              <th className="px-4 py-3 text-center">Stage</th>
              <th className="px-4 py-3 text-center">Needed By</th>
              <th className="px-4 py-3 text-right">
                <div className="flex items-center justify-end space-x-1">
                  <span>Risk Assessment</span>
                  <div
                    className="relative cursor-help text-gray-400 hover:text-gray-600"
                    onMouseEnter={() => setActiveTooltip('risk')}
                    onMouseLeave={() => setActiveTooltip(null)}
                  >
                    <Info className="w-3.5 h-3.5" />
                    {activeTooltip === 'risk' && (
                      <div className="absolute right-0 bottom-6 w-56 bg-gray-900 text-white text-[11px] p-2.5 rounded-lg shadow-xl font-normal leading-normal z-50 text-left normal-case">
                        <p className="font-semibold text-amber-400">Term Definitions:</p>
                        <p className="mt-1">
                          • <span className="font-semibold text-red-300">Overdue</span> = past due date
                        </p>
                        <p>
                          • <span className="font-semibold text-amber-300">At Risk</span> = predicted to miss due date or assembly need
                        </p>
                        <p>
                          • <span className="font-semibold text-emerald-300">On track</span> = on schedule
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {paginatedJobs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500 text-sm">
                  No jobs found matching your selected dashboard filters.
                </td>
              </tr>
            ) : (
              paginatedJobs.map((job) => (
                <tr
                  key={job.id}
                  className="hover:bg-orange-50/30 transition-colors"
                >
                  {/* Job & Part */}
                  <td className="px-4 py-3">
                    <Link href={`/jobs/${job.id}`} className="block">
                      <div className="font-semibold text-gray-900 text-sm hover:text-[#F97316] transition-colors">
                        {job.partDisplayName}
                      </div>
                      <div className="text-[12px] text-gray-500 font-mono">
                        {job.id} • Qty: {job.quantity}
                      </div>
                    </Link>
                  </td>

                  {/* Vendor Workshop */}
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <span className="font-medium text-gray-900">
                      {job.workshopName}
                    </span>
                  </td>

                  {/* Ordered / Accepted Dates */}
                  <td className="px-4 py-3 text-center text-sm">
                    <div className="text-gray-900 font-medium">
                      {job.orderedDate}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {job.acceptedDate ? `Ack: ${job.acceptedDate}` : 'Pending Ack'}
                    </div>
                  </td>

                  {/* Stage StatusBadge */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center">
                      <StatusBadge status={job.stage} />
                    </div>
                  </td>

                  {/* Needed By / Due Date */}
                  <td className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                    {job.dueDate}
                  </td>

                  {/* Risk StatusBadge */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end">
                      <StatusBadge status={job.risk} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 bg-gray-50/50 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-gray-600">
        <div>
          Showing <span className="font-semibold text-gray-900">{filteredJobs.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to{' '}
          <span className="font-semibold text-gray-900">{Math.min(currentPage * pageSize, filteredJobs.length)}</span> of{' '}
          <span className="font-semibold text-gray-900">{filteredJobs.length}</span> jobs
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-2.5 py-1 rounded-[8px] border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Prev
          </button>
          <span className="text-xs text-gray-700 font-medium px-1">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-2.5 py-1 rounded-[8px] border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition-all"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
