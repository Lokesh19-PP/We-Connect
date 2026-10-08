'use client';

import type { StatusUpdate } from '@/types';
import { Activity, Clock, User, MessageSquare } from 'lucide-react';

interface JobStatusUpdatesProps {
  statusUpdates: StatusUpdate[];
}

export function JobStatusUpdates({ statusUpdates }: JobStatusUpdatesProps) {
  if (statusUpdates.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <span>Latest Workshop Status Updates</span>
        </h3>
        <p className="text-xs text-slate-400 italic pt-4 text-center">
          No live progress reports posted by workshop yet.
        </p>
      </div>
    );
  }

  const sortedUpdates = [...statusUpdates].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <span>Workshop Progress Feeds</span>
        </h3>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
          {statusUpdates.length} updates
        </span>
      </div>

      <div className="space-y-3">
        {sortedUpdates.map((update) => (
          <div
            key={update.id}
            className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded text-[11px]">
                {update.status}
              </span>
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {update.updatedAt}
              </span>
            </div>

            <p className="text-slate-800 font-medium leading-relaxed">
              {update.message}
            </p>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                Posted by <strong className="text-slate-700">{update.updatedBy}</strong>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
