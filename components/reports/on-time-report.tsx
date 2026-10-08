'use client';

// ──────────────────────────────────────────────
// VendorFlow – Report 1: Vendor On-Time Rate
// Recharts + Data Table
// ──────────────────────────────────────────────
import { getVendorOnTimeReport } from '@/data/reports';
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
import { TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react';

export function OnTimeReport({ vendorFilter }: { vendorFilter: string }) {
  const data = getVendorOnTimeReport(vendorFilter);

  const avgOnTime =
    data.length > 0
      ? Math.round(data.reduce((acc, d) => acc + d.onTimePercent, 0) / data.length)
      : 0;

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Average On-Time Rate</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-2">{avgOnTime}%</p>
          <p className="text-[11px] text-slate-400 mt-1">Target benchmark: 90%</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Top Performing Vendor</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 mt-2">
            {data.find((d) => d.onTimePercent === Math.max(...data.map((x) => x.onTimePercent)))?.workshopName || 'N/A'}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">96% On-Time</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Needs Improvement</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 mt-2">
            {data.find((d) => d.onTimePercent === Math.min(...data.map((x) => x.onTimePercent)))?.workshopName || 'N/A'}
          </p>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">82% On-Time (Flagged)</p>
        </div>
      </div>

      {/* Chart */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
          On-Time vs Late Jobs by Vendor
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="workshopName" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} />
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
              <Bar dataKey="onTimeJobs" name="On-Time Jobs" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="lateJobs" name="Late Jobs" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 font-bold text-xs text-slate-800">
          Vendor On-Time Breakdown
        </div>
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-3">Workshop</th>
              <th className="p-3 text-center">Total Jobs</th>
              <th className="p-3 text-center">On-Time</th>
              <th className="p-3 text-center">Late</th>
              <th className="p-3 text-right">On-Time Rate %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr key={row.workshopId} className="hover:bg-slate-50">
                <td className="p-3 font-semibold text-slate-900">{row.workshopName}</td>
                <td className="p-3 text-center font-medium">{row.totalJobs}</td>
                <td className="p-3 text-center text-emerald-600 font-bold">{row.onTimeJobs}</td>
                <td className="p-3 text-center text-red-600 font-bold">{row.lateJobs}</td>
                <td className="p-3 text-right">
                  <span
                    className={`font-bold ${
                      row.onTimePercent >= 90
                        ? 'text-emerald-600'
                        : row.onTimePercent >= 80
                        ? 'text-amber-600'
                        : 'text-red-600'
                    }`}
                  >
                    {row.onTimePercent}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
