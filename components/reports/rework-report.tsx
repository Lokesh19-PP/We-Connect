'use client';

// ──────────────────────────────────────────────
// VendorFlow – Report 2: Quality Rework by Vendor
// Recharts + Data Table
// ──────────────────────────────────────────────
import { getReworkReport } from '@/data/reports';
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
import { ShieldCheck, ShieldAlert, Award } from 'lucide-react';

export function ReworkReport({ vendorFilter }: { vendorFilter: string }) {
  const data = getReworkReport(vendorFilter);

  const totalInspections = data.reduce((acc, d) => acc + d.totalInspections, 0);
  const totalReworks = data.reduce((acc, d) => acc + d.reworkCount, 0);
  const avgYield =
    totalInspections > 0
      ? Math.round(
          ((totalInspections - totalReworks) / totalInspections) * 100
        )
      : 91;

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">First-Pass Yield</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{avgYield}%</p>
          <p className="text-[11px] text-slate-400 mt-1">Sample target: ~91%</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Quality Reworks</span>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">{totalReworks}</p>
          <p className="text-[11px] text-slate-400 mt-1">Reinspections pending</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Zero-Rework Workshops</span>
            <Award className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {data.filter((d) => d.reworkCount === 0).length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">100% first-pass yield</p>
        </div>
      </div>

      {/* Chart */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
          Quality Inspections & Rework Counts by Vendor
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
              <Bar dataKey="passedFirstTime" name="Passed First Time" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="reworkCount" name="Rework Count" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 font-bold text-xs text-slate-800">
          Vendor Quality Metrics
        </div>
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-3">Workshop</th>
              <th className="p-3 text-center">Total Inspections</th>
              <th className="p-3 text-center">Passed First Time</th>
              <th className="p-3 text-center">Rework Count</th>
              <th className="p-3 text-right">First-Pass Yield %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr key={row.workshopId} className="hover:bg-slate-50">
                <td className="p-3 font-semibold text-slate-900">{row.workshopName}</td>
                <td className="p-3 text-center font-medium">{row.totalInspections}</td>
                <td className="p-3 text-center text-emerald-600 font-bold">{row.passedFirstTime}</td>
                <td className="p-3 text-center font-bold">
                  <span
                    className={`px-2 py-0.5 rounded-md ${
                      row.reworkCount > 0
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {row.reworkCount}
                  </span>
                </td>
                <td className="p-3 text-right font-bold text-emerald-600">
                  {row.firstPassYieldPercent}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
