'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  getJobById,
  getJobDrawingAcknowledgement,
  getJobHistory,
  subscribeJobs,
  type EnrichedJob,
} from '@/data/jobs';
import {
  getStatusUpdatesForJob,
  getDeliveriesForJob,
  getInspectionsForJob,
  getInvoicePaymentsForJob,
} from '@/data/sample';
import { JobDetailHeader } from './job-detail-header';
import { DrawingAckCard } from './drawing-ack-card';
import { PaymentQualitySummary } from './payment-quality-summary';
import { JobStatusUpdates } from './job-status-updates';
import { JobTimeline } from './job-timeline';
import { AuditHistory } from './audit-history';
import { ToastContainer, type ToastMessage } from './toast';
import { ArrowLeft, Inbox, RefreshCw } from 'lucide-react';

interface JobDetailClientProps {
  id: string;
}

export function JobDetailClient({ id }: JobDetailClientProps) {
  const [job, setJob] = useState<EnrichedJob | undefined>(() => getJobById(id));
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (
      title: string,
      message?: string,
      type: 'success' | 'warning' | 'error' | 'info' = 'success'
    ) => {
      setToasts((prev) => [
        ...prev,
        { id: `toast-${Date.now()}-${Math.random()}`, title, message, type },
      ]);
    },
    []
  );

  const removeToast = useCallback((toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  }, []);

  const refreshJob = useCallback(() => {
    const updated = getJobById(id);
    setJob(updated ? { ...updated } : undefined);
  }, [id]);

  useEffect(() => {
    return subscribeJobs(() => {
      refreshJob();
    });
  }, [refreshJob]);

  // Handle "Job not found" state (Prompt 3 requirement)
  if (!job) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-10 shadow-2xs space-y-4">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <Inbox className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Job Not Found</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            The fabrication job ID <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-bold">{id}</code> does not exist or has been removed.
          </p>
          <div className="pt-2">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Jobs Overview</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Load related records
  const ack = getJobDrawingAcknowledgement(job.id, job.drawingId);
  const statusUpdates = getStatusUpdatesForJob(job.id);
  const deliveries = getDeliveriesForJob(job.id);
  const inspections = getInspectionsForJob(job.id);
  const invoicePayments = getInvoicePaymentsForJob(job.id);
  const invoice = invoicePayments[0];
  const historyEvents = getJobHistory(job.id);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* 1. Header with Part, Vendor, Stages, Quantities, Dates */}
      <JobDetailHeader job={job} />

      {/* 2. Drawing Revision & Acknowledgement Card (Rule 1 & Rule 2) */}
      <DrawingAckCard
        job={job}
        acknowledgement={ack}
        onRefresh={refreshJob}
        showToast={addToast}
      />

      {/* 3. Delivery, Quality Inspection, and Payment Summary (Rules 3 & 4) */}
      <PaymentQualitySummary
        deliveries={deliveries}
        inspections={inspections}
        invoice={invoice}
      />

      {/* 4. Timeline (7 stages) & Rule 2 "Move to In progress" Button */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <JobTimeline job={job} onRefresh={refreshJob} showToast={addToast} />

          {/* Full History Audit Trail (Prompt 4) */}
          <AuditHistory events={historyEvents} />
        </div>

        {/* Sidebar: Latest Workshop Status Feeds */}
        <div className="space-y-6">
          <JobStatusUpdates statusUpdates={statusUpdates} />
        </div>
      </div>
    </div>
  );
}
