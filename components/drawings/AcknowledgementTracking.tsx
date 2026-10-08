import { useState } from 'react';
import { Job, Drawing, DrawingAcknowledgement } from '@/types';
import { Bell } from 'lucide-react';

interface AcknowledgementTrackingProps {
  approvedDrawing: Drawing;
  jobs: Job[];
  acknowledgements: DrawingAcknowledgement[];
}

export function AcknowledgementTracking({ approvedDrawing, jobs, acknowledgements }: AcknowledgementTrackingProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const openJobs = jobs.filter(j => 
    j.partId === approvedDrawing.partId && 
    !['Delivered', 'Inspected', 'Paid'].includes(j.stage)
  );

  if (openJobs.length === 0) return null;

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRemindAll = () => {
    if (confirm('Remind all unacknowledged vendors?')) {
      showToast('All unacknowledged vendors have been reminded.');
    }
  };

  const handleRemind = (workshopName: string) => {
    showToast(`Reminder sent to ${workshopName}`);
  };

  const today = new Date('2026-10-08');

  return (
    <div className="border-t border-slate-100 bg-slate-50/50 p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-slate-800">Workshop Acknowledgement Tracking</h3>
        <button 
          onClick={handleRemindAll}
          className="text-xs font-medium text-orange-600 bg-orange-100 hover:bg-orange-200 px-3 py-1.5 rounded transition-colors"
        >
          Remind all unacknowledged
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-slate-500 border-b border-slate-200">
            <tr>
              <th className="py-2.5 font-medium">Workshop</th>
              <th className="py-2.5 font-medium">Job</th>
              <th className="py-2.5 font-medium">Revision Sent</th>
              <th className="py-2.5 font-medium">Acknowledged</th>
              <th className="py-2.5 font-medium text-center">Days Waiting</th>
              <th className="py-2.5 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {openJobs.map(job => {
              const ack = acknowledgements.find(a => a.jobId === job.id && a.drawingId === approvedDrawing.id);
              const isAcknowledged = !!ack?.acknowledgedAt;
              
              const sentDate = new Date(approvedDrawing.approvedAt || approvedDrawing.uploadedAt);
              const daysWaiting = Math.max(0, Math.floor((today.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24)));
              
              let rowClass = "hover:bg-slate-100/50 transition-colors";
              if (!isAcknowledged) {
                 if (daysWaiting > 1) rowClass = "bg-red-50 hover:bg-red-100/80 transition-colors";
                 else rowClass = "bg-amber-50 hover:bg-amber-100/80 transition-colors";
              }

              return (
                <tr key={job.id} className={rowClass}>
                  <td className="py-2.5 font-medium text-slate-900 px-2">{job.workshopName}</td>
                  <td className="py-2.5 text-slate-600">{job.id}</td>
                  <td className="py-2.5 text-slate-600">{approvedDrawing.revision}</td>
                  <td className="py-2.5">
                    {isAcknowledged ? (
                      <span className="text-green-700 font-medium">Yes ({ack.acknowledgedAt})</span>
                    ) : (
                      <span className="text-slate-500">No</span>
                    )}
                  </td>
                  <td className="py-2.5 text-center text-slate-600 font-medium">
                    {!isAcknowledged ? daysWaiting : '-'}
                  </td>
                  <td className="py-2.5 text-right pr-2">
                    {!isAcknowledged && (
                      <button 
                        onClick={() => handleRemind(job.workshopName)}
                        className="inline-flex items-center text-slate-600 hover:text-orange-600 text-xs font-medium px-2.5 py-1.5 bg-white border border-slate-200 rounded shadow-sm hover:border-orange-200 transition-colors"
                      >
                        <Bell className="w-3 h-3 mr-1" /> Remind
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-5 z-50">
          {toastMessage}
        </div>
      )}
    </div>
  )
}
