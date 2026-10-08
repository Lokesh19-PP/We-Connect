'use client';

// ──────────────────────────────────────────────
// VendorFlow – Vendor Management Directory (/vendors)
// Owned by Soham (§8)
// ──────────────────────────────────────────────
import { useState, useEffect } from 'react';
import {
  getAllVendors,
  toggleVendorStatus,
  type ExtendedVendor,
} from '@/data/vendors';
import { useRole } from '@/lib/role-context';
import { can } from '@/lib/permissions';
import { AddVendorDialog } from '@/components/vendors/add-vendor-dialog';
import { VendorDetailModal } from '@/components/vendors/vendor-detail-modal';
import {
  Building2,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Phone,
  MapPin,
  Filter,
  RefreshCw,
  Inbox,
} from 'lucide-react';

export default function VendorsPage() {
  const { role } = useRole();
  const canManageVendors = can(role, 'vendor.manage');

  const [isLoading, setIsLoading] = useState(true);
  const [vendors, setVendors] = useState<ExtendedVendor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [performanceFilter, setPerformanceFilter] = useState<'All' | 'High' | 'Low' | 'Warning'>('All');

  // Dialog & Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<ExtendedVendor | null>(null);

  // Simulate smooth loading state for polished UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setVendors(getAllVendors());
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Filter logic
  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.phone.includes(searchQuery) ||
      vendor.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || vendor.status === statusFilter;

    let matchesPerformance = true;
    if (performanceFilter === 'High') matchesPerformance = vendor.onTimePercent >= 90;
    if (performanceFilter === 'Low') matchesPerformance = vendor.onTimePercent < 90;
    if (performanceFilter === 'Warning') matchesPerformance = Boolean(vendor.warning);

    return matchesSearch && matchesStatus && matchesPerformance;
  });

  // Action handlers
  const handleVendorAdded = (newVendor: ExtendedVendor) => {
    setVendors(getAllVendors());
  };

  const handleToggleStatus = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    toggleVendorStatus(id);
    setVendors(getAllVendors());
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setPerformanceFilter('All');
  };

  // Metrics calculation
  const totalVendors = vendors.length;
  const activeCount = vendors.filter((v) => v.status === 'Active').length;
  const avgOnTime =
    vendors.length > 0
      ? Math.round(
          vendors.reduce((acc, v) => acc + v.onTimePercent, 0) / vendors.length
        )
      : 0;
  const warningCount = vendors.filter((v) => v.warning).length;

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Building2 className="w-7 h-7 text-blue-600 shrink-0" />
            <span>Vendor Management Directory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor workshop performance, capacity, and status across all subcontracting partners
          </p>
        </div>

        {canManageVendors && (
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Workshop Vendor</span>
          </button>
        )}
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Vendors</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {isLoading ? <span className="inline-block w-8 h-6 bg-slate-200 animate-pulse rounded-md" /> : totalVendors}
          </p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Workshops</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {isLoading ? <span className="inline-block w-8 h-6 bg-slate-200 animate-pulse rounded-md" /> : activeCount}
          </p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Avg On-Time Rate</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {isLoading ? <span className="inline-block w-12 h-6 bg-slate-200 animate-pulse rounded-md" /> : `${avgOnTime}%`}
          </p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Warnings / Flagged</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">
            {isLoading ? <span className="inline-block w-8 h-6 bg-slate-200 animate-pulse rounded-md" /> : warningCount}
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by vendor name, contact, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Performance Filter */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-semibold text-slate-500">Performance:</span>
            <select
              value={performanceFilter}
              onChange={(e) => setPerformanceFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
            >
              <option value="All">All Performance</option>
              <option value="High">High (&gt;=90%)</option>
              <option value="Low">Needs Attention (&lt;90%)</option>
              <option value="Warning">Has Warning</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-slate-400 font-medium shrink-0">
          Showing {filteredVendors.length} of {totalVendors} vendors
        </span>
      </div>

      {/* Vendors Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        {isLoading ? (
          // Skeleton Loader Rows
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredVendors.length === 0 ? (
          // Empty State UI
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No vendors found</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              No vendors matched your active search query or filter selection.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          // Data Table
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border-collapse min-w-[700px]">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-4">Workshop Name & Location</th>
                  <th className="p-4">Contact Person</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Open Jobs</th>
                  <th className="p-4 text-center">On-Time %</th>
                  <th className="p-4 text-center">Reworks</th>
                  <th className="p-4">Warnings / Alerts</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVendors.map((vendor) => (
                  <tr
                    key={vendor.id}
                    onClick={() => setSelectedVendor(vendor)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    {/* Name & Address */}
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">
                        {vendor.name}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-xs">{vendor.address}</span>
                      </div>
                    </td>

                    {/* Contact Person */}
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">
                        {vendor.contactPerson}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{vendor.phone}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          vendor.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {vendor.status === 'Active' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <XCircle className="w-3 h-3 text-slate-400" />
                        )}
                        <span>{vendor.status}</span>
                      </span>
                    </td>

                    {/* Open Jobs */}
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 bg-slate-100 font-bold text-slate-800 rounded-lg">
                        {vendor.activeJobs}
                      </span>
                    </td>

                    {/* On-Time Rate */}
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <span
                          className={`font-bold text-xs ${
                            vendor.onTimePercent >= 90
                              ? 'text-emerald-600'
                              : vendor.onTimePercent >= 80
                              ? 'text-amber-600'
                              : 'text-red-600'
                          }`}
                        >
                          {vendor.onTimePercent}%
                        </span>
                        <div className="w-16 bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              vendor.onTimePercent >= 90
                                ? 'bg-emerald-500'
                                : vendor.onTimePercent >= 80
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${vendor.onTimePercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Reworks */}
                    <td className="p-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          vendor.reworkCount > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {vendor.reworkCount}
                      </span>
                    </td>

                    {/* Warnings / Alert Chips */}
                    <td className="p-4">
                      {vendor.warning ? (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-[11px] font-semibold animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>{vendor.warning}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">None</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      {canManageVendors ? (
                        <button
                          type="button"
                          onClick={(e) => handleToggleStatus(e, vendor.id)}
                          className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                            vendor.status === 'Active'
                              ? 'bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-700'
                              : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          }`}
                        >
                          {vendor.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">View only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Vendor Dialog */}
      <AddVendorDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={handleVendorAdded}
      />

      {/* Vendor Detail Drawer / Modal */}
      <VendorDetailModal
        vendor={selectedVendor}
        onClose={() => setSelectedVendor(null)}
      />
    </div>
  );
}
