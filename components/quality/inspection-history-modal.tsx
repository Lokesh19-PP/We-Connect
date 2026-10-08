'use client';

import { QualityQueueRow } from '@/data/quality';
import { getInspectionsForJob } from '@/data/sample';
import Link from 'next/link';

interface InspectionHistoryModalProps {
  row: QualityQueueRow;
  isOpen: boolean;
  onClose: () => void;
}

export function InspectionHistoryModal({ row, isOpen, onClose }: InspectionHistoryModalProps) {
  if (!isOpen) return null;

  const inspections = getInspectionsForJob(row.jobId).sort(
    (a, b) => new Date(b.inspectedDate).getTime() - new Date(a.inspectedDate).getTime()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Inspection History
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {row.partDisplayName} &bull; {row.workshopName} &bull; <Link href={`/jobs/${row.jobId}`} className="text-indigo-600 hover:underline">{row.jobId}</Link>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            &times;
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {inspections.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-slate-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900">No inspections yet</h3>
              <p className="text-slate-500 text-sm mt-1">This job hasn't had any recorded inspections.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {inspections.map((insp, index) => (
                <div key={insp.id} className="bg-slate-50 rounded-lg p-5 border border-slate-100 relative">
                  {index === 0 && (
                    <span className="absolute top-4 right-4 px-2 py-1 bg-slate-200 text-slate-700 text-xs font-semibold rounded-full">
                      Latest
                    </span>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          insp.result === 'Accepted' ? 'bg-emerald-100 text-emerald-800' :
                          insp.result === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {insp.result}
                        </span>
                        <span className="text-sm text-slate-500 font-medium">
                          {insp.inspectedDate}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-slate-600 flex items-center">
                      <svg className="w-4 h-4 mr-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {insp.inspectedBy}
                    </div>
                  </div>
                  
                  <div className="text-sm text-slate-700 bg-white p-3 rounded border border-slate-200">
                    <span className="font-medium text-slate-900 mb-1 block">Remarks:</span>
                    {insp.remarks || <span className="text-slate-400 italic">No remarks provided.</span>}
                  </div>
                  
                  {insp.reinspectionDate && (
                    <div className="mt-3 text-sm text-slate-600 bg-white p-2 rounded border border-slate-200 inline-block">
                      <span className="font-medium mr-2">Reinspection Scheduled:</span> 
                      {insp.reinspectionDate}
                    </div>
                  )}

                  <div className="mt-4 border-t border-slate-200 pt-3">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 block">Attached Photos</span>
                    <div className="flex space-x-3">
                      <div className="w-16 h-16 bg-slate-200 rounded flex items-center justify-center text-slate-400">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="w-16 h-16 bg-slate-200 rounded flex items-center justify-center text-slate-400">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
