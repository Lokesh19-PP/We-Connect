'use client';

// ──────────────────────────────────────────────
// VendorFlow – Report 4: Delivery Performance (Planned vs Actual)
// Recharts + Data Table
// ──────────────────────────────────────────────
import { getDeliveryPerformanceReport } from '@/data/reports';
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
import { Truck, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

export function DeliveryPerformanceReport({ vendorFilter }: { vendorFilter: string }) {
  const data = getDeliveryPerformanceReport(vendorFilter);

  const total = data.length;
  const onTimeCount = data.filter((d) => d.status === 'On Time').length;
  const delayedCount = data.filter((d) => d.status === 'Delayed').length;
  const onTimePercent = total > 0 ? Math.round((onTimeCount / total) * 100) : 0;

  // Chart data: count by delay days
  const chartData = [
    { name: 'On-Time (0 days)', count: data.filter((d) => d.delayDays === 0).length },
    { name: '1-3 Days Delay', count: data.filter((d) => d.delayDays >= 1 && d.delayDays <= 3).length },
    { name: '4-7 Days Delay', count: data.filter((d) => d.delayDays >= 4 && d.delayDays <= 7).length },
    { name: '>7 Days Delay', count: data.filter((d) => d.delayDays > 7).length },
  ];

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Planned vs Actual Accuracy</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-2">{onTimePercent}%</p>
          <p className="text-[11px] text-slate-400 mt-1">{onTimeCount} of {total} jobs on schedule</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Delayed Deliveries</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">{delayedCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Impacted assembly schedule</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Avg Delivery Delay</span>
            <Clock className="w-4 h-4 text-slate-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">1.8 Days</p>
          <p className="text-[11px] text-slate-400 mt-1">Within tolerable margin</p>
        </div>
      </div>

      {/* Chart */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
          Delivery Delay Distribution (Jobs Count)
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
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
              <Bar dataKey="count" name="Jobs Count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 font-bold text-xs text-slate-800">
          Job Delivery Schedule Performance
        </div>
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] sticky top-0">
              <tr>
                <th className="p-3">Job & Part</th>
                <th className="p-3">Workshop</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-center">Planned Date</th>
                <th className="p-3 text-center">Actual Date</th>
                <th className="p-3 text-center">Delay</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row) => (
                <tr key={row.jobId} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-slate-900">
                    {row.partDisplayName} <span className="text-[11px] text-slate-400">({row.jobId})</span>
                  </td>
                  <td className="p-3 text-slate-700 font-medium">{row.workshopName}</td>
                  <td className="p-3 text-center font-semibold">{row.quantity}</td>
                  <td className="p-3 text-center text-slate-600">{row.plannedDate}</td>
                  <td className="p-3 text-center text-slate-600">{row.actualDate}</td>
                  <td className="p-3 text-center font-bold">
                    {row.delayDays > 0 ? (
                      <span className="text-red-600">+{row.delayDays} days</span>
                    ) : (
                      <span className="text-emerald-600">0 days</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        row.status === 'On Time'
                          ? 'bg-emerald-100 text-emerald-800'
                          : row.status === 'Delayed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
