'use client';

// ──────────────────────────────────────────────
// We Connect – 14-Day Assembly Calendar (§8)
// Recharts Bar Chart showing needed, ready & shortfall
// Ready in navy (#0F1B33), shortfall in red (#EF4444)
// ──────────────────────────────────────────────
import { useState, useEffect } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  const slots = getAssemblySlots();
  const calendarData = getAssemblyShortfall(slots).map((slot) => ({
    ...slot,
    label: `${slot.ready} / ${slot.needed}`,
    formattedDate: new Date(slot.date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
    }),
  }));

  const totalShortfall = calendarData.reduce((acc, c) => acc + c.shortfall, 0);

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[10px] shadow-xs p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-semibold text-gray-900 flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-[#F97316]" />
            <span>14-Day Assembly Schedule & Shortfall Calendar</span>
          </h2>
          <p className="text-[12px] text-gray-500 mt-0.5">
            Planned boiler assembly requirements vs ready inspected parts (Ready / Needed)
          </p>
        </div>

        {totalShortfall > 0 && !isLoading && (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Shortfall: {totalShortfall} Parts</span>
          </span>
        )}
      </div>

      {/* Recharts Bar Chart Container */}
      <div className="h-64 w-full">
        {isLoading ? (
          <div className="h-full w-full bg-gray-50 rounded-[10px] animate-pulse flex items-center justify-center text-gray-400 text-xs">
            Loading assembly schedule...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={calendarData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="formattedDate" stroke="#6B7280" fontSize={11} />
              <YAxis stroke="#6B7280" fontSize={11} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#0F1B33] text-white p-3 rounded-[8px] text-xs shadow-xl border border-slate-700 space-y-1">
                        <p className="font-semibold border-b border-slate-700 pb-1">{label}</p>
                        <p className="text-slate-300">Parts Needed: <span className="font-semibold text-white">{data.needed}</span></p>
                        <p className="text-slate-300">Parts Ready: <span className="font-semibold text-emerald-400">{data.ready}</span></p>
                        {data.shortfall > 0 ? (
                          <p className="text-red-400 font-semibold">Shortfall: {data.shortfall} units</p>
                        ) : (
                          <p className="text-emerald-400 font-semibold">Shortfall: None (On Track)</p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="needed" name="Parts Needed" fill="#94A3B8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ready" name="Parts Ready (Navy)" fill="#0F1B33" radius={[4, 4, 0, 0]} />
              <Bar dataKey="shortfall" name="Shortfall (Red)" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
