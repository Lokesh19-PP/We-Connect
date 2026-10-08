'use client';

// ──────────────────────────────────────────────
// VendorFlow – Reports & Analytics (/reports)
// Guarded by can(role, "report.view") (§4)
// Owned by Soham (§8)
// ──────────────────────────────────────────────
import { useState } from 'react';
import { useRole } from '@/lib/role-context';
import { can } from '@/lib/permissions';
import { OnTimeReport } from '@/components/reports/on-time-report';
import { ReworkReport } from '@/components/reports/rework-report';
import { PaymentReport } from '@/components/reports/payment-report';
import { DeliveryPerformanceReport } from '@/components/reports/delivery-performance-report';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  Truck,
  Download,
  Calendar,
  Filter,
  Lock,
  Info,
} from 'lucide-react';

export default function ReportsPage() {
  const { role } = useRole();
  const canViewReports = can(role, 'report.view');

  // Filters state
  const [activeTab, setActiveTab] = useState<'ontime' | 'rework' | 'payment' | 'delivery'>('ontime');
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [vendorFilter, setVendorFilter] = useState('All');
  const [showTooltip, setShowTooltip] = useState(false);

  // Guard: Role permission check
  if (!canViewReports) {
    return (
      <div className="p-12 bg-white border border-slate-200 rounded-2xl text-center space-y-4 max-w-md mx-auto mt-12 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          The active role <span className="font-semibold text-slate-700">"{role}"</span> is not authorized to view management analytics and financial reports. Switch to Management, Procurement, Engineering, Quality, or Finance role to view.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Export Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <BarChart3 className="w-7 h-7 text-blue-600" />
            <span>Analytics & Executive Reports</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time data visualization across workshop on-time rates, quality reworks, cashflow, and delivery performance
          </p>
        </div>

        {/* Disabled Export Buttons with Tooltip */}
        <div className="relative">
          <div className="flex items-center space-x-2">
            <div
              className="relative inline-block"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <button
                type="button"
                disabled
                className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 text-slate-400 font-semibold text-xs rounded-xl cursor-not-allowed opacity-75 border border-slate-200"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
            </div>

            <div
              className="relative inline-block"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <button
                type="button"
                disabled
                className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 text-slate-400 font-semibold text-xs rounded-xl cursor-not-allowed opacity-75 border border-slate-200"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>

          {/* Tooltip */}
          {showTooltip && (
            <div className="absolute right-0 top-11 bg-slate-900 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg shadow-xl z-50 whitespace-nowrap flex items-center space-x-1.5 animate-in fade-in duration-150">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span>Exporting reports is coming in a later version</span>
            </div>
          )}
        </div>
      </div>

      {/* Global Filter Toolbar */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs flex items-center justify-between">
        {/* Report Selector Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('ontime')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'ontime'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>On-Time Rates</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rework')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'rework'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Quality Rework</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payment')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'payment'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Pending Payments</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('delivery')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'delivery'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Delivery Performance</span>
          </button>
        </div>

        {/* Date & Vendor Dropdowns */}
        <div className="flex items-center space-x-3 text-xs">
          {/* Date Range Selector */}
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="This Quarter">This Quarter</option>
              <option value="Year to Date">Year to Date</option>
              <option value="All Time">All Time</option>
            </select>
          </div>

          {/* Vendor Filter Selector */}
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Vendors</option>
              <option value="Shree Fabricators">Shree Fabricators</option>
              <option value="Om Engg Works">Om Engg Works</option>
              <option value="Patil Steel">Patil Steel</option>
              <option value="Kulkarni Engineering">Kulkarni Engineering</option>
              <option value="Deshmukh Metalworks">Deshmukh Metalworks</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Report View */}
      {activeTab === 'ontime' && <OnTimeReport vendorFilter={vendorFilter} />}
      {activeTab === 'rework' && <ReworkReport vendorFilter={vendorFilter} />}
      {activeTab === 'payment' && <PaymentReport vendorFilter={vendorFilter} />}
      {activeTab === 'delivery' && <DeliveryPerformanceReport vendorFilter={vendorFilter} />}
    </div>
  );
}
