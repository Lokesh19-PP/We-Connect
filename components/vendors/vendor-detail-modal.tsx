'use client';

// ──────────────────────────────────────────────
// VendorFlow – Vendor Detail Drawer / Modal
// Performance Recharts chart + Jobs list
// ──────────────────────────────────────────────
import {
  type ExtendedVendor,
  getJobsForVendor,
  getVendorPerformanceHistory,
} from '@/data/vendors';
import {
  X,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Briefcase,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

interface VendorDetailModalProps {
  vendor: ExtendedVendor | null;
  onClose: () => void;
}

export function VendorDetailModal({ vendor, onClose }: VendorDetailModalProps) {
  if (!vendor) return null;

  const assignedJobs = getJobsForVendor(vendor.id);
  const performanceHistory = getVendorPerformanceHistory(vendor.id);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-end">
      <div className="bg-white h-full w-full max-w-2xl border-l border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold tracking-tight">
                {vendor.name}
              </h2>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  vendor.status === 'Active'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {vendor.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{vendor.address}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs bg-slate-50/50">
          {/* Warning Banner */}
          {vendor.warning && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center space-x-3 text-amber-800">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold text-xs">Attention Required</p>
                <p className="text-[11px] text-amber-700">{vendor.warning}</p>
              </div>
            </div>
          )}

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <p className="text-[11px] text-slate-500 font-medium">On-Time Rate</p>
              <div className="flex items-baseline space-x-2 mt-1">
                <span
                  className={`text-2xl font-bold ${
                    vendor.onTimePercent >= 90
                      ? 'text-emerald-600'
                      : vendor.onTimePercent >= 80
                      ? 'text-amber-600'
                      : 'text-red-600'
                  }`}
                >
                  {vendor.onTimePercent}%
                </span>
                <span className="text-[10px] text-slate-400 font-medium">target: 90%</span>
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <p className="text-[11px] text-slate-500 font-medium">Active Jobs</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {vendor.activeJobs}
              </p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <p className="text-[11px] text-slate-500 font-medium">Quality Reworks</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {vendor.reworkCount}
              </p>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-2">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-500">
              Contact Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400">Contact Person:</span>
                <p className="font-semibold text-slate-800">{vendor.contactPerson}</p>
              </div>
              <div>
                <span className="text-slate-400">Phone:</span>
                <p className="font-semibold text-slate-800 flex items-center space-x-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{vendor.phone}</span>
                </p>
              </div>
              <div>
                <span className="text-slate-400">Email:</span>
                <p className="font-semibold text-slate-800 flex items-center space-x-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>{vendor.email}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-xs flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>On-Time Delivery Trend (%)</span>
              </h3>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} domain={[50, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1E293B',
                      color: '#FFF',
                      fontSize: '11px',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="onTime" name="On-Time %" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" name="Target (90%)" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Assigned Jobs */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-800 text-xs flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-slate-600" />
              <span>Active Assigned Jobs ({assignedJobs.length})</span>
            </h3>

            {assignedJobs.length === 0 ? (
              <p className="text-slate-400 text-xs py-4 text-center">
                No active jobs currently assigned to this workshop.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
                {assignedJobs.map((job) => (
                  <div key={job.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <p className="font-bold text-slate-800 text-xs">
                        {job.partDisplayName} <span className="font-normal text-slate-400">({job.id})</span>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Qty: {job.quantity} • Due: {job.dueDate}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded-md">
                        {job.stage}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                          job.risk === 'On track'
                            ? 'bg-emerald-100 text-emerald-800'
                            : job.risk === 'Reinspection due'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {job.risk}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
