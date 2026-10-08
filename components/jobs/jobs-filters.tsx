'use client';

import { Search, X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import type { JobStage, JobRisk } from '@/types';

export interface FilterState {
  search: string;
  project: string;
  vendor: string;
  dateRange: string;
  partType: string;
  stage: string;
  risk: string;
}

interface JobsFiltersProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onReset: () => void;
  workshops: { id: string; name: string }[];
  partTypes: string[];
}

export function JobsFilters({
  filters,
  onFilterChange,
  onReset,
  workshops,
  partTypes,
}: JobsFiltersProps) {
  const isFiltered =
    Boolean(filters.search) ||
    filters.project !== 'all' ||
    filters.vendor !== 'all' ||
    filters.dateRange !== 'all' ||
    filters.partType !== 'all' ||
    filters.stage !== 'all' ||
    filters.risk !== 'all';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3.5">
      {/* Top row: Search and active filter badge */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Search by Job ID, part name, vendor, material or notes..."
            className="w-full pl-10 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 placeholder:text-slate-400 transition-all"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        )}
      </div>

      {/* Filter selectors row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
        {/* Project / Boiler */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Project / Boiler
          </label>
          <select
            value={filters.project}
            onChange={(e) => onFilterChange('project', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          >
            <option value="all">All Projects</option>
            <option value="Boiler B-200">Boiler B-200</option>
            <option value="Boiler B-300">Boiler B-300</option>
            <option value="Boiler B-450">Boiler B-450</option>
            <option value="Boiler #12">Boiler #12</option>
          </select>
        </div>

        {/* Vendor */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Vendor / Workshop
          </label>
          <select
            value={filters.vendor}
            onChange={(e) => onFilterChange('vendor', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          >
            <option value="all">All Vendors</option>
            {workshops.map((w) => (
              <option key={w.id} value={w.name}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date range */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Date Range
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => onFilterChange('dateRange', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          >
            <option value="all">All Dates</option>
            <option value="next7">Next 7 Days</option>
            <option value="next14">Next 14 Days</option>
            <option value="thisMonth">This Month</option>
            <option value="overdue">Overdue Due Dates</option>
          </select>
        </div>

        {/* Part Type */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Part Type
          </label>
          <select
            value={filters.partType}
            onChange={(e) => onFilterChange('partType', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          >
            <option value="all">All Part Types</option>
            {partTypes.map((pt) => (
              <option key={pt} value={pt}>
                {pt}
              </option>
            ))}
          </select>
        </div>

        {/* Stage */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Job Stage
          </label>
          <select
            value={filters.stage}
            onChange={(e) => onFilterChange('stage', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          >
            <option value="all">All Stages</option>
            <option value="Ordered">Ordered</option>
            <option value="Accepted">Accepted</option>
            <option value="In progress">In progress</option>
            <option value="Ready">Ready</option>
            <option value="Delivered">Delivered</option>
            <option value="Inspected">Inspected</option>
            <option value="Paid">Paid</option>
          </select>
        </div>

        {/* Risk */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Risk Status
          </label>
          <select
            value={filters.risk}
            onChange={(e) => onFilterChange('risk', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          >
            <option value="all">All Risk Levels</option>
            <option value="On track">On track</option>
            <option value="At risk">At risk</option>
            <option value="May miss date">May miss date</option>
            <option value="Reinspection due">Reinspection due</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>
    </div>
  );
}
