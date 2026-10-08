'use client';

// ──────────────────────────────────────────────
// VendorFlow – Report 3: Pending Payments & Cashflow
// Recharts + Data Table
// Sample figures match AGENTS.md §8 (Received: 12, On Hold: 2, Awaiting: 4, Avg Days: 18)
// ──────────────────────────────────────────────
import { getPaymentReport } from '@/data/reports';
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
import { CreditCard, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

export function PaymentReport({ vendorFilter }: { vendorFilter: string }) {
  const data = getPaymentReport(vendorFilter);

  const totalInvoiced = data.reduce((acc, d) => acc + d.totalInvoiceAmount, 0);
  const totalOnHold = data.reduce((acc, d) => acc + d.onHoldQuality, 0);
  const totalAwaiting = data.reduce((acc, d) => acc + d.awaitingApproval, 0);
  const avgDays = Math.round(
    data.reduce((acc, d) => acc + d.avgDaysToPay, 0) / (data.length || 1)
  );

  const formatCurrency = (amount: number) =>
    `₹${(amount / 1000).toFixed(0)}k`;

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Invoiced</span>
            <CreditCard className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-2">{formatCurrency(totalInvoiced)}</p>
          <p className="text-[11px] text-slate-400 mt-1">12 Received payments</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">On Hold for Quality</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-xl font-bold text-red-600 mt-2">{formatCurrency(totalOnHold)}</p>
          <p className="text-[11px] text-slate-400 mt-1">2 invoices on hold</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Awaiting Approval</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold text-amber-600 mt-2">{formatCurrency(totalAwaiting)}</p>
          <p className="text-[11px] text-slate-400 mt-1">4 invoices pending finance</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Avg Days to Pay</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-2">{avgDays} Days</p>
          <p className="text-[11px] text-slate-400 mt-1">Benchmark: 18 Days</p>
        </div>
      </div>

      {/* Chart */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
          Invoice Payment Breakdown by Vendor (₹)
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="workshopName" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} />
              <Tooltip
                formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Amount']}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#1E293B',
                  color: '#FFF',
                  fontSize: '11px',
                  borderRadius: '8px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="paid" name="Paid" fill="#10B981" stackId="a" />
              <Bar dataKey="awaitingApproval" name="Awaiting Approval" fill="#F59E0B" stackId="a" />
              <Bar dataKey="onHoldQuality" name="On Hold for Quality" fill="#EF4444" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 font-bold text-xs text-slate-800">
          Vendor Payment Summary
        </div>
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-3">Workshop</th>
              <th className="p-3 text-right">Total Invoiced</th>
              <th className="p-3 text-right">On Hold for Quality</th>
              <th className="p-3 text-right">Awaiting Approval</th>
              <th className="p-3 text-right">Paid</th>
              <th className="p-3 text-center">Avg Days to Pay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr key={row.workshopId} className="hover:bg-slate-50">
                <td className="p-3 font-semibold text-slate-900">{row.workshopName}</td>
                <td className="p-3 text-right font-bold text-slate-900">
                  ₹{row.totalInvoiceAmount.toLocaleString()}
                </td>
                <td className="p-3 text-right text-red-600 font-bold">
                  {row.onHoldQuality > 0 ? `₹${row.onHoldQuality.toLocaleString()}` : '—'}
                </td>
                <td className="p-3 text-right text-amber-600 font-bold">
                  {row.awaitingApproval > 0 ? `₹${row.awaitingApproval.toLocaleString()}` : '—'}
                </td>
                <td className="p-3 text-right text-emerald-600 font-bold">
                  ₹{row.paid.toLocaleString()}
                </td>
                <td className="p-3 text-center font-medium text-slate-700">
                  {row.avgDaysToPay} Days
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
