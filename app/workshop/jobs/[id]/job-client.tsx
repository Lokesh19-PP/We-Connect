'use client';

import { useState } from 'react';
import { getJob, getDrawings, getAcknowledgementsForJob } from '@/data/sample';
import { canStartWork } from '@/lib/rules';
import { CheckCircle2, FileText, ZoomIn, Lock } from 'lucide-react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function JobClient({ jobId }: { jobId: string }) {
  const job = getJob(jobId);
  const [localAckTime, setLocalAckTime] = useState<string | null>(null);

  if (!job) {
    return <div className="text-slate-400 p-6 text-center">Job not found.</div>;
  }

  const allDrawings = getDrawings();
  const acks = getAcknowledgementsForJob(jobId);
  const approvedDrawing = allDrawings.find((d) => d.partId === job.partId && d.approved);

  // Check initial ack state from sample data or local state
  const initialAck = acks.find((a) => a.drawingId === approvedDrawing?.id && a.acknowledgedAt !== null);
  const isAcknowledged = !!initialAck || !!localAckTime;

  // Use rule 2
  // We need to pass a mock of acks that includes our local ack if present
  const mockAcks = isAcknowledged 
    ? [...acks, { drawingId: approvedDrawing?.id, jobId, workshopId: job.workshopId, acknowledgedAt: localAckTime || initialAck?.acknowledgedAt }] as any
    : acks;
  
  const startWorkCheck = canStartWork(job, allDrawings, mockAcks);
  const canStart = startWorkCheck.allowed;

  const handleConfirmDrawing = () => {
    setLocalAckTime(new Date().toISOString());
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center space-x-3 text-slate-400 mb-2">
        <Link href="/workshop" className="p-2 -ml-2 active:bg-slate-800 rounded-full">
          <ChevronLeft className="w-6 h-6 text-slate-300" />
        </Link>
        <span className="text-sm font-semibold">Back to Jobs</span>
      </div>

      <div className="bg-slate-900 border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white leading-tight">
          {job.partDisplayName}
        </h1>
        <div className="mt-2 flex items-center space-x-4 text-slate-300 text-base">
          <span className="font-semibold bg-slate-800 px-3 py-1 rounded-lg">
            Qty: {job.quantity}
          </span>
          <span>Due: {new Date(job.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
        </div>
      </div>

      {approvedDrawing && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-1">
            Drawing Reference
          </h2>
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500/20 p-2 rounded-xl">
                  <FileText className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-200">{approvedDrawing.revision}</h3>
                  <p className="text-xs text-emerald-400">Approved by Engineering</p>
                </div>
              </div>
              <button className="p-3 bg-slate-700 rounded-xl active:bg-slate-600 transition-colors">
                <ZoomIn className="w-5 h-5 text-slate-300" />
              </button>
            </div>

            {!isAcknowledged ? (
              <Button 
                onClick={handleConfirmDrawing}
                className="w-full min-h-[56px] text-lg bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl active:scale-95 transition-transform"
              >
                Confirm drawing received
              </Button>
            ) : (
              <div className="flex items-center space-x-3 bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                <div>
                  <p className="text-sm font-bold text-emerald-400">Drawing acknowledged</p>
                  <p className="text-xs text-emerald-500/80">You can now post updates</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-1">
          Post Status Update
        </h2>
        
        {!canStart && (
          <div className="flex items-center space-x-2 text-amber-500/80 text-sm px-2 mb-2">
            <Lock className="w-4 h-4" />
            <span>{startWorkCheck.reason}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          <Button disabled={!canStart} variant="outline" className="min-h-[56px] text-base justify-start px-6 bg-slate-800 border-slate-700">
            Started
          </Button>
          <Button disabled={!canStart} variant="outline" className="min-h-[56px] text-base justify-start px-6 bg-slate-800 border-slate-700">
            In progress
          </Button>
          <Button disabled={!canStart} variant="outline" className="min-h-[56px] text-base justify-start px-6 bg-slate-800 border-slate-700">
            Ready for dispatch
          </Button>
        </div>
      </section>
    </div>
  );
}
