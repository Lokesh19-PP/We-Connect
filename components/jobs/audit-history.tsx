'use client';

import type { AuditEvent } from '@/data/jobs';
import {
  History,
  FileCheck2,
  ShieldCheck,
  CreditCard,
  Truck,
  Activity,
  Bell,
  User,
  ArrowRightCircle,
} from 'lucide-react';

interface AuditHistoryProps {
  events: AuditEvent[];
}

export function AuditHistory({ events }: AuditHistoryProps) {
  if (events.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs text-center text-xs text-slate-400">
        No audit history records available for this job yet.
      </div>
    );
  }

  // Reverse sort so latest events are at the top
  const sortedEvents = [...events].reverse();

  const getEventIcon = (type: AuditEvent['type']) => {
    switch (type) {
      case 'stage_change':
        return ArrowRightCircle;
      case 'acknowledgement':
        return FileCheck2;
      case 'inspection':
        return ShieldCheck;
      case 'payment':
        return CreditCard;
      case 'delivery':
        return Truck;
      case 'status_update':
        return Activity;
      case 'reminder':
        return Bell;
      default:
        return History;
    }
  };

  const getBadgeColors = (variant?: AuditEvent['badgeVariant']) => {
    switch (variant) {
      case 'success':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'warning':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'destructive':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'info':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'default':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <History className="w-4 h-4 text-blue-600" />
          <span>Full Audit Trail & History Log</span>
        </h3>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
          {events.length} events logged
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {sortedEvents.map((event) => {
          const Icon = getEventIcon(event.type);
          const badgeClass = getBadgeColors(event.badgeVariant);

          return (
            <div key={event.id} className="py-3.5 flex items-start gap-3.5 text-xs">
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-bold text-slate-900 text-sm">
                    {event.title}
                  </span>
                  <span className="text-slate-400 text-[11px] font-mono">
                    {event.timestamp}
                  </span>
                </div>

                <p className="text-slate-600 leading-relaxed text-xs">
                  {event.description}
                </p>

                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    Action by: <strong className="text-slate-700">{event.actor}</strong>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
