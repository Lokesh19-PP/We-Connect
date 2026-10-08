import Link from 'next/link';
import {
  getJobs,
  getAcknowledgements,
  getDeliveriesForJob,
  getInspectionsForJob,
  getInvoicePaymentsForJob,
} from '@/data/sample';
import { getPaymentStatus } from '@/lib/rules';
import { FileWarning, ChevronRight, Clock } from 'lucide-react';
import messages from '@/messages/en.json';

const WORKSHOP_ID = 'ws-3'; // Workshop C (Patil Steel)

export default function WorkshopPage() {
  const allJobs = getJobs().filter((j) => j.workshopId === WORKSHOP_ID);
  const allAcks = getAcknowledgements().filter((a) => a.workshopId === WORKSHOP_ID);

  // Unacknowledged drawings
  const unacknowledgedAcks = allAcks.filter((a) => !a.acknowledgedAt);
  const needsActionJobIds = new Set(unacknowledgedAcks.map((a) => a.jobId));

  const needsActionJobs = allJobs.filter((j) => needsActionJobIds.has(j.id));
  const myJobs = allJobs.filter((j) => !needsActionJobIds.has(j.id));

  return (
    <div className="space-y-6">
      {/* Needs Action Section */}
      {needsActionJobs.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-amber-500 uppercase tracking-wider px-1">
            {messages.workshop.needsAction}
          </h2>
          <div className="space-y-3">
            {needsActionJobs.map((job) => (
              <Link
                key={job.id}
                href={`/workshop/jobs/${job.id}`}
                className="block bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 active:scale-95 transition-transform"
                style={{ minHeight: '48px' }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-start space-x-3">
                    <FileWarning className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-base font-bold text-amber-50">
                        {job.partDisplayName}
                      </h3>
                      <p className="text-sm text-amber-200/80">
                        Confirm drawing to start
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-amber-500 shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* My Jobs Section */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-1">
          {messages.workshop.myJobs}
        </h2>
        <div className="space-y-3">
          {myJobs.map((job) => {
            const deliveries = getDeliveriesForJob(job.id);
            const inspections = getInspectionsForJob(job.id);
            const invoices = getInvoicePaymentsForJob(job.id);
            const paymentStatus = getPaymentStatus(deliveries, inspections, invoices[0]);

            return (
              <Link
                key={job.id}
                href={`/workshop/jobs/${job.id}`}
                className="block bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 active:scale-95 transition-transform"
                style={{ minHeight: '48px' }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      {job.partDisplayName}
                    </h3>
                    <div className="flex items-center space-x-3 text-sm text-slate-400">
                      <span>{messages.workshop.qty}: {job.quantity}</span>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(job.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold whitespace-nowrap">
                    {job.stage}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-700/50 flex justify-between items-center text-sm">
                  <span className="text-slate-400">{messages.workshop.paymentStatus}</span>
                  <span className={`font-semibold ${
                    paymentStatus === 'Paid' ? 'text-emerald-400' :
                    paymentStatus === 'Ready' ? 'text-blue-400' :
                    paymentStatus === 'On hold for quality' ? 'text-red-400' :
                    'text-amber-400'
                  }`}>
                    {paymentStatus}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
