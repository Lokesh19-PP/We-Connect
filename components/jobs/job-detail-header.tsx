'use client';

import Link from 'next/link';
import type { EnrichedJob } from '@/data/jobs';
import { RiskBadge } from './risk-badge';
import { StageBadge } from './stage-badge';
import {
  ChevronLeft,
  Building2,
  Calendar,
  Clock,
  Layers,
  ArrowRight,
  Package,
  AlertTriangle,
} from 'lucide-react';

interface JobDetailHeaderProps {
  job: EnrichedJob;
}

export function JobDetailHeader({ job }: JobDetailHeaderProps) {
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

  const getDaysDiff = (dateStr: string) => {
    const today = new Date('2026-10-08');
    const target = new Date(dateStr);
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const dueDays = getDaysDiff(job.dueDate);
  const neededDays = getDaysDiff(job.neededByDate);

  const completionPercent = Math.min(
    100,
    Math.round((job.acceptedQuantity / (job.quantity || 1)) * 100)
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
      {/* Top breadcrumb & IDs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-600 font-semibold transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Jobs</span>
          </Link>
          <span>/</span>
          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
            {job.id}
          </span>
          <span>•</span>
          <span className="font-medium text-slate-600">{job.project}</span>
        </div>

        <div className="flex items-center gap-2">
          <StageBadge stage={job.stage} className="text-xs px-3 py-1 font-semibold" />
          <RiskBadge risk={job.risk} className="text-xs px-3 py-1" />
        </div>
      </div>

      {/* Main title & vendor row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {job.partDisplayName}
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {job.partType}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <span>Material: <strong className="text-slate-700">{job.material}</strong></span>
            {job.notes && (
              <>
                <span>•</span>
                <span className="italic">{job.notes}</span>
              </>
            )}
          </p>
        </div>

        {/* Vendor info badge */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <p className="text-[11px] font-medium text-slate-500">Assigned Vendor</p>
            <p className="font-bold text-slate-900">{job.workshopName}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid: Quantity, Due Date, Needed By Date */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        {/* Ordered vs Accepted Quantity */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-blue-600" />
              Quantity Ordered vs Accepted
            </span>
            <span className="font-bold text-slate-700">{completionPercent}%</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {job.quantity}
            </span>
            <span className="text-sm font-semibold text-slate-400">ordered</span>
            <span className="text-sm font-bold text-slate-300">/</span>
            <span className="text-xl font-bold text-emerald-700 font-mono">
              {job.acceptedQuantity}
            </span>
            <span className="text-sm font-semibold text-slate-500">accepted</span>
          </div>

          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        {/* Fabrication Due Date */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mb-1">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            Fabrication Due Date
          </div>
          <p className="text-xl font-bold text-slate-900 mt-2 font-mono">
            {formatDate(job.dueDate)}
          </p>
          <p className="text-xs mt-2 font-medium">
            {dueDays < 0 ? (
              <span className="text-red-700 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {Math.abs(dueDays)} days overdue
              </span>
            ) : dueDays === 0 ? (
              <span className="text-amber-700 font-bold">Due today</span>
            ) : (
              <span className="text-slate-600">{dueDays} days remaining</span>
            )}
          </p>
        </div>

        {/* Assembly Needed-By Date */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Needed-By Assembly Date
          </div>
          <p className="text-xl font-bold text-slate-900 mt-2 font-mono">
            {formatDate(job.neededByDate)}
          </p>
          <p className="text-xs text-slate-600 mt-2 font-medium">
            {neededDays < 0 ? (
              <span className="text-red-700 font-bold">Assembly schedule breached</span>
            ) : (
              <span>Assembly in {neededDays} days</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
