'use client';

import { useState } from 'react';
import type { EnrichedJob } from '@/data/jobs';
import { updateJobStage, getAllAcknowledgements } from '@/data/jobs';
import { canStartWork } from '@/lib/rules';
import { getDrawings } from '@/data/sample';
import type { JobStage } from '@/types';
import {
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  AlertTriangle,
  Play,
  Check,
  ShieldAlert,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const ALL_STAGES: JobStage[] = [
  'Ordered',
  'Accepted',
  'In progress',
  'Ready',
  'Delivered',
  'Inspected',
  'Paid',
];

interface JobTimelineProps {
  job: EnrichedJob;
  onRefresh?: () => void;
  showToast?: (title: string, message?: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export function JobTimeline({ job, onRefresh, showToast }: JobTimelineProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const drawings = getDrawings();
  const acks = getAllAcknowledgements();

  // Rule 2 verification
  const rule2Result = canStartWork(job, drawings, acks);

  const currentStageIndex = ALL_STAGES.indexOf(job.stage);

  // Helper to get stage details (who did it, estimated or actual dates)
  const getStageMeta = (stage: JobStage, index: number) => {
    const isDone = index < currentStageIndex;
    const isCurrent = index === currentStageIndex;
    const isUpcoming = index > currentStageIndex;

    let actor = 'System / Scheduled';
    let date = 'Pending';

    switch (stage) {
      case 'Ordered':
        actor = 'Procurement Specialist';
        date = job.orderedDate;
        break;
      case 'Accepted':
        actor = `${job.workshopName} Owner`;
        date = job.acceptedDate || (isDone ? job.orderedDate : 'Awaiting confirmation');
        break;
      case 'In progress':
        actor = `${job.workshopName} Workshop Staff`;
        date = isDone || isCurrent ? (job.acceptedDate || job.orderedDate) : `Target: ${job.dueDate}`;
        break;
      case 'Ready':
        actor = `${job.workshopName} QA Team`;
        date = isDone || isCurrent ? 'Completed at workshop' : `Due by ${job.dueDate}`;
        break;
      case 'Delivered':
        actor = 'Stores Department Gate';
        date = isDone || isCurrent ? 'Delivery Received' : `Needed by ${job.neededByDate}`;
        break;
      case 'Inspected':
        actor = 'Quality Inspection Team';
        date = isDone || isCurrent ? 'QC Cleared' : 'Pending Gate Arrival';
        break;
      case 'Paid':
        actor = 'Finance Accounts';
        date = isDone ? 'Payment Disbursed' : 'Awaiting 3-way match';
        break;
    }

    return { isDone, isCurrent, isUpcoming, actor, date };
  };

  const handleMoveToInProgress = () => {
    if (!rule2Result.allowed) return;

    setIsUpdating(true);
    try {
      const updated = updateJobStage(job.id, 'In progress');
      if (updated && showToast) {
        showToast(
          'Moved to "In progress"',
          `Rule 2 satisfied: drawing was acknowledged. Job ${job.id} is now actively fabricating at ${job.workshopName}.`,
          'success'
        );
      }
      if (onRefresh) onRefresh();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAdvanceNextStage = () => {
    if (currentStageIndex >= ALL_STAGES.length - 1) return;
    const nextStage = ALL_STAGES[currentStageIndex + 1];

    if (nextStage === 'In progress' && !rule2Result.allowed) return;

    setIsUpdating(true);
    try {
      const updated = updateJobStage(job.id, nextStage);
      if (updated && showToast) {
        showToast(
          `Stage Advanced to "${nextStage}"`,
          `Job ${job.id} workflow progressed to ${nextStage}.`,
          'success'
        );
      }
      if (onRefresh) onRefresh();
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Per-Part Stage Timeline
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Sequential progression across all 7 manufacturing subcontracting stages
          </p>
        </div>

        {/* Demo Stage Transition Controls (Prompt 5) */}
        <div className="flex flex-wrap items-center gap-2">
          {job.stage !== 'In progress' && currentStageIndex < 2 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMoveToInProgress}
                disabled={!rule2Result.allowed || isUpdating}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all ${
                  rule2Result.allowed
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-98'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-75'
                }`}
                title={
                  rule2Result.allowed
                    ? 'Drawing acknowledged – click to start work'
                    : `Disabled by Rule 2: ${rule2Result.reason}`
                }
              >
                <Play className="w-3.5 h-3.5" />
                <span>Move to In progress</span>
              </button>

              {!rule2Result.allowed ? (
                <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-amber-600" />
                  <span>Rule 2: Ack required</span>
                </span>
              ) : (
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Rule 2: Cleared</span>
                </span>
              )}
            </div>
          )}

          {currentStageIndex < ALL_STAGES.length - 1 && (
            <button
              type="button"
              onClick={handleAdvanceNextStage}
              disabled={
                (ALL_STAGES[currentStageIndex + 1] === 'In progress' && !rule2Result.allowed) ||
                isUpdating
              }
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Next Stage ({ALL_STAGES[currentStageIndex + 1]})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Rule 2 Notice Banner (Prompt 5) */}
      {!rule2Result.allowed && currentStageIndex < 2 && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3 text-xs text-amber-900">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-amber-950">
              Rule 2 Enforced: &quot;Move to In progress&quot; Disabled
            </p>
            <p className="leading-relaxed">
              {rule2Result.reason}. Under subcontracting governance, fabrication work cannot commence
              until the workshop acknowledges the approved revision. Use the{' '}
              <strong>&quot;Simulate Workshop Ack (Demo)&quot;</strong> button above to unblock.
            </p>
          </div>
        </div>
      )}

      {/* Vertical Timeline */}
      <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {ALL_STAGES.map((stageName, idx) => {
          const { isDone, isCurrent, isUpcoming, actor, date } = getStageMeta(
            stageName,
            idx
          );

          return (
            <div key={stageName} className="relative group">
              {/* Timeline Node Icon */}
              <div
                className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ring-4 ring-white transition-all ${
                  isDone
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : isCurrent
                    ? 'bg-blue-600 text-white ring-blue-100 ring-8 shadow-sm animate-pulse'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                ) : isCurrent ? (
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                ) : (
                  <Circle className="w-2.5 h-2.5" />
                )}
              </div>

              {/* Stage Content Card */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-blue-50/70 border-blue-200 shadow-2xs'
                    : isDone
                    ? 'bg-white border-slate-200 hover:border-slate-300'
                    : 'bg-slate-50/50 border-slate-200/60 opacity-65'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {stageName}
                    </span>

                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider">
                        Current Stage
                      </span>
                    )}

                    {isDone && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        Completed
                      </span>
                    )}

                    {isUpcoming && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                        Upcoming
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-medium text-slate-500 font-mono">
                    {date}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 mt-1 flex items-center gap-1.5">
                  <span className="text-slate-400">Actor / Owner:</span>
                  <strong className="text-slate-700 font-semibold">{actor}</strong>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
