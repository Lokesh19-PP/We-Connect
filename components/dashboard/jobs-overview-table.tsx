'use client';

// ──────────────────────────────────────────────
// VendorFlow – Jobs Overview Table (§8)
// 25 jobs paginated (10 per page) with risk badges
// ──────────────────────────────────────────────
import { useState } from 'react';
import Link from 'next/link';
import { getJobs } from '@/data/sample';
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import type { JobRisk, JobStage } from '@/types';

export function JobsOverviewTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const allJobs = getJobs();
  const totalPages = Math.ceil(allJobs.length / pageSize);

  const paginatedJobs = allJobs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden space-y-4">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span>Active Jobs Overview ({allJobs.length} Total)</span>
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Subcontracting jobs status, stage progression, and assembly target dates
          </p>
        </div>

        <Link
          href="/jobs"
          className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
        >
          <span>View all jobs</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 border-collapse min-w-[750px]">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
            <tr>
              <th className="p-4">Job & Part</th>
              <th className="p-4">Vendor Workshop</th>
              <th className="p-4 text-center">Ordered / Accepted</th>
              <th className="p-4 text-center">Stage</th>
              <th className="p-4 text-center">Needed By</th>
              <th className="p-4 text-right">Risk Assessment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedJobs.map((job) => (
              <tr
                key={job.id}
                className="hover:bg-slate-50/80 cursor-pointer transition-colors"
              >
                {/* Job & Part */}
                <td className="p-4">
                  <Link href={`/jobs/${job.id}`} className="block">
                    <div className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors">
                      {job.partDisplayName}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {job.id} • Qty: {job.quantity}
                    </div>
                  </Link>
                </td>

                {/* Vendor Workshop */}
                <td className="p-4">
                  <span className="font-semibold text-slate-800">
                    {job.workshopName}
                  </span>
                </td>

                {/* Ordered / Accepted Dates */}
                <td className="p-4 text-center">
                  <div className="text-slate-800 font-medium">
                    {job.orderedDate}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {job.acceptedDate ? `Ack: ${job.acceptedDate}` : 'Pending Ack'}
                  </div>
                </td>

                {/* Stage Badge */}
                <td className="p-4 text-center">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-extrabold text-[10px] rounded-md border border-slate-200">
                    {job.stage}
                  </span>
                </td>

                {/* Needed By / Due Date */}
                <td className="p-4 text-center">
                  <span className="font-bold text-slate-800">{job.dueDate}</span>
                </td>

                {/* Risk Assessment Badge */}
                <td className="p-4 text-right">
                  <span
                    className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full font-extrabold text-[10px] ${
                      job.risk === 'On track'
                        ? 'bg-emerald-100 text-emerald-800'
                        : job.risk === 'Reinspection due' || job.risk === 'At risk'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800 animate-pulse'
                    }`}
                  >
                    {job.risk === 'On track' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                    {(job.risk === 'Reinspection due' || job.risk === 'At risk') && (
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                    )}
                    {(job.risk === 'May miss date' || job.risk === 'Overdue') && (
                      <XCircle className="w-3 h-3 text-red-600" />
                    )}
                    <span>{job.risk}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">
          Showing {(currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, allJobs.length)} of {allJobs.length} jobs
        </span>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-slate-800">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
