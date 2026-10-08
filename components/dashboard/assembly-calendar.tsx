'use client';

// ──────────────────────────────────────────────
// VendorFlow – 14-Day Assembly Calendar (§8)
// Recharts Bar Chart showing needed, ready & shortfall
// ──────────────────────────────────────────────
import { getAssemblySlots } from '@/data/sample';
import { getAssemblyShortfall } from '@/lib/rules';
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
import { Calendar, AlertCircle } from 'lucide-react';

export function AssemblyCalendar() {
  const slots = getAssemblySlots();
  const calendarData = getAssemblyShortfall(slots).map((slot) => ({
    ...slot,
    // format date e.g. "08 Oct"
    formattedDate: new Date(slot.date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
    }),
  }));

  const totalShortfall = calendarData.reduce((acc, c) => acc + c.shortfall, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-2xs p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>14-Day Assembly Schedule & Shortfall Calendar</span>
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Planned boiler assembly requirements vs ready inspected parts
          </p>
        </div>

        {totalShortfall > 0 && (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg animate-pulse">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Shortfall: {totalShortfall} Parts</span>
          </span>
        )}
      </div>

      {/* Recharts Bar Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={calendarData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="formattedDate" stroke="#64748B" fontSize={11} />
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
            <Bar dataKey="needed" name="Parts Needed" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="ready" name="Parts Ready" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="shortfall" name="Shortfall (Red)" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
