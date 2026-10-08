'use client';

import { useState } from 'react';
import type { EnrichedJob } from '@/data/jobs';
import { remindVendor, acknowledgeJobDrawing } from '@/data/jobs';
import { getDrawingsForPart, getDrawing } from '@/data/sample';
import { useRole } from '@/lib/role-context';
import { can } from '@/lib/permissions';
import {
  FileCheck,
  AlertCircle,
  CheckCircle2,
  Bell,
  ExternalLink,
  ShieldAlert,
  Clock,
  UserCheck,
} from 'lucide-react';
import type { DrawingAcknowledgement } from '@/types';

interface DrawingAckCardProps {
  job: EnrichedJob;
  acknowledgement?: DrawingAcknowledgement;
  onRefresh?: () => void;
  showToast?: (title: string, message?: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export function DrawingAckCard({
  job,
  acknowledgement,
  onRefresh,
  showToast,
}: DrawingAckCardProps) {
  const { role } = useRole();
  const [isReminding, setIsReminding] = useState(false);
  const [lastReminderTime, setLastReminderTime] = useState<string | null>(null);

  // Find approved drawing revision for this part (Rule 1)
  const partDrawings = getDrawingsForPart(job.partId);
  const approvedDrawing = partDrawings.find((d) => d.approved);
  const drawing = job.drawingId ? getDrawing(job.drawingId) : approvedDrawing;

  const isAcknowledged = Boolean(
    acknowledgement && acknowledgement.acknowledgedAt !== null
  );

  const canSendReminder = can(role, 'reminder.send');

  const handleRemindVendor = () => {
    setIsReminding(true);
    try {
      const res = remindVendor(job.id, `${role} Specialist`);
      setLastReminderTime(res.timestamp);
      if (showToast) {
        showToast(
          'Reminder Sent to Workshop',
          `Notification dispatched to ${job.workshopName} to acknowledge ${approvedDrawing?.revision || 'approved drawing'}.`,
          'success'
        );
      }
      if (onRefresh) onRefresh();
    } finally {
      setIsReminding(false);
    }
  };

  const handleSimulateAcknowledgement = () => {
    const success = acknowledgeJobDrawing(job.id, `${job.workshopName} Owner`);
    if (success) {
      if (showToast) {
        showToast(
          'Drawing Acknowledged (Demo)',
          `${job.workshopName} has verified and acknowledged ${approvedDrawing?.revision || 'the drawing'}. Rule 2 unblocked!`,
          'success'
        );
      }
      if (onRefresh) onRefresh();
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <FileCheck className="w-5 h-5 text-blue-600" />
          <span>Approved Drawing & Workshop Acknowledgement</span>
        </div>

        {/* Rule 1 tag */}
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
          Rule 1 & Rule 2
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Approved Revision Info */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <p className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
            Approved Engineering Drawing
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-slate-900">
                {drawing ? drawing.revision : 'None approved'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {drawing ? `Uploaded on ${drawing.uploadedAt} by ${drawing.uploadedBy}` : 'Drawing pending upload'}
              </p>
            </div>
            {drawing && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Approved
              </span>
            )}
          </div>
          {drawing?.fileUrl && (
            <div className="pt-2">
              <span className="text-xs text-blue-600 font-medium inline-flex items-center gap-1 hover:underline cursor-pointer">
                <span>View Drawing Specification ({drawing.fileUrl.split('/').pop()})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </span>
            </div>
          )}
        </div>

        {/* Workshop Acknowledgement Status */}
        <div
          className={`p-4 border rounded-xl space-y-2 ${
            isAcknowledged
              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
              : 'bg-amber-50/70 border-amber-200 text-amber-950'
          }`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Workshop Acknowledgement
          </p>

          {isAcknowledged ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-bold text-emerald-900 text-sm">
                  Acknowledged by Vendor
                </span>
              </div>
              <p className="text-xs text-emerald-800">
                Acknowledged on{' '}
                <strong className="font-semibold">{acknowledgement?.acknowledgedAt}</strong> by{' '}
                <strong className="font-semibold">
                  {acknowledgement?.acknowledgedBy || 'Workshop Staff'}
                </strong>
              </p>
              <p className="text-[11px] text-emerald-700/90 pt-1">
                ✓ Rule 2 satisfied: Vendor confirmed receipt of current approved drawing revision.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-900">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="font-bold text-sm">Not Acknowledged Yet</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                {job.workshopName} has not acknowledged this drawing revision. Under{' '}
                <strong>Rule 2</strong>, fabrication work cannot begin until acknowledged.
              </p>
              {lastReminderTime && (
                <p className="text-[11px] text-slate-500 italic">
                  Last reminder dispatched: {lastReminderTime}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons if not acknowledged */}
      {!isAcknowledged && (
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 bg-amber-50/40 p-3 rounded-xl border border-amber-200/60">
          <div className="text-xs text-amber-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Action required: Workshop acknowledgement pending</span>
          </div>

          <div className="flex items-center gap-2">
            {canSendReminder && (
              <button
                type="button"
                onClick={handleRemindVendor}
                disabled={isReminding}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{isReminding ? 'Sending...' : 'Remind Vendor'}</span>
              </button>
            )}

            {/* Demo quick toggle button to test Rule 2 effortlessly */}
            <button
              type="button"
              onClick={handleSimulateAcknowledgement}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors cursor-pointer"
              title="Demo button to simulate workshop staff acknowledging the drawing on their mobile view"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Simulate Workshop Ack (Demo)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
