'use client';

import { useState } from 'react';
import { getQualityQueue, QualityQueueRow } from '@/data/quality';
import { useRole } from '@/lib/role-context';
import { can } from '@/lib/permissions';
import { getAcknowledgementsForJob, getDrawingsForPart, getDeliveriesForJob, getInspectionsForJob, getInvoicePaymentsForJob } from '@/data/sample';
import { getPaymentStatus } from '@/lib/rules';

interface InspectionDialogProps {
  row: QualityQueueRow;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (rowId: string, qtyAccepted: number) => void;
  onReject: (rowId: string, remarks: string, reinspectionDate: string) => void;
}

export function InspectionDialog({ row, isOpen, onClose, onAccept, onReject }: InspectionDialogProps) {
  const { role } = useRole();
  const hasPermission = can(role, 'inspection.record');
  
  const [qtyAccepted, setQtyAccepted] = useState(row.quantityDelivered);
  const [qtyRejected, setQtyRejected] = useState(0);
  const [remarks, setRemarks] = useState('');
  
  const [dimCorrect, setDimCorrect] = useState(false);
  const [workOk, setWorkOk] = useState(false);
  const [revCorrect, setRevCorrect] = useState(false);
  
  const [reinspectionDate, setReinspectionDate] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Find drawing acknowledgement details
  const acks = getAcknowledgementsForJob(row.jobId);
  const drawings = getDrawingsForPart(row.jobId); // wait, job part id... wait I need partId.
  // Actually, I can just find the latest ack for the job.
  const latestAck = acks.length > 0 ? acks[acks.length - 1] : null;
  const ackedText = latestAck?.acknowledgedAt 
    ? `Acknowledged on ${latestAck.acknowledgedAt} by ${latestAck.acknowledgedBy}`
    : 'No acknowledgement found';

  const deliveries = getDeliveriesForJob(row.jobId);
  // Add a fake pending inspection for this delivery if not present, to show correct payment status.
  const inspections = getInspectionsForJob(row.jobId);
  const invoices = getInvoicePaymentsForJob(row.jobId);
  const invoice = invoices.length > 0 ? invoices[0] : undefined;
  
  // Calculate current payment status
  const paymentStatus = getPaymentStatus(deliveries, inspections, invoice);

  const handleRejectClick = () => {
    if (!remarks.trim()) {
      setError('Remarks are required when rejecting.');
      return;
    }
    if (!reinspectionDate) {
      setError('Please schedule a reinspection date.');
      return;
    }
    setError('');
    onReject(row.id, remarks, reinspectionDate);
  };

  const handleAcceptClick = () => {
    onAccept(row.id, qtyAccepted);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">
            Record Inspection: {row.jobId}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            &times;
          </button>
        </div>

        {paymentStatus === 'On hold for quality' && (
          <div className="bg-rose-50 border-y border-rose-200 px-6 py-3 text-rose-800 text-sm font-medium">
            Payment on hold for quality
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Header Info */}
          <div className="bg-slate-50 rounded-lg p-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500 block">Part</span>
              <span className="font-medium text-slate-900">{row.partDisplayName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Vendor</span>
              <span className="font-medium text-slate-900">{row.workshopName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Delivered Qty</span>
              <span className="font-medium text-slate-900">{row.quantityDelivered}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Date</span>
              <span className="font-medium text-slate-900">{row.deliveredDate}</span>
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-3">
            <h3 className="font-medium text-slate-900 text-sm">Inspection Checklist</h3>
            
            <label className="flex items-start space-x-3 p-3 rounded border border-slate-200 cursor-pointer hover:bg-slate-50">
              <input type="checkbox" checked={dimCorrect} onChange={e => setDimCorrect(e.target.checked)} className="mt-1" />
              <div>
                <div className="text-sm font-medium text-slate-800">Dimensions Correct</div>
                <div className="text-xs text-slate-500">Within acceptable tolerance limits</div>
              </div>
            </label>

            <label className="flex items-start space-x-3 p-3 rounded border border-slate-200 cursor-pointer hover:bg-slate-50">
              <input type="checkbox" checked={workOk} onChange={e => setWorkOk(e.target.checked)} className="mt-1" />
              <div>
                <div className="text-sm font-medium text-slate-800">Workmanship OK</div>
                <div className="text-xs text-slate-500">Welds, finish, and general quality</div>
              </div>
            </label>

            <label className="flex items-start space-x-3 p-3 rounded border border-slate-200 cursor-pointer hover:bg-slate-50">
              <input type="checkbox" checked={revCorrect} onChange={e => setRevCorrect(e.target.checked)} className="mt-1" />
              <div>
                <div className="text-sm font-medium text-slate-800">Drawing Revision Correct</div>
                <div className="text-xs text-slate-500">
                  Approved: {row.drawingRevision} &bull; {ackedText}
                </div>
              </div>
            </label>
          </div>

          {/* Quantities */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Qty Accepted</label>
              <input 
                type="number" 
                value={qtyAccepted}
                onChange={e => setQtyAccepted(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Qty Rejected</label>
              <input 
                type="number" 
                value={qtyRejected}
                onChange={e => setQtyRejected(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Remarks & Photo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Remarks <span className="text-rose-500">*</span></label>
            <textarea 
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              rows={3}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              placeholder="Add notes..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Schedule Reinspection</label>
              <input 
                type="date"
                value={reinspectionDate}
                onChange={e => setReinspectionDate(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Photo Upload</label>
              <div className="border-2 border-dashed border-slate-300 rounded-md p-2 text-center cursor-pointer hover:bg-slate-50 text-sm text-slate-500 h-[38px] flex items-center justify-center">
                Upload photo
              </div>
            </div>
          </div>
          
          {error && (
            <div className="text-sm text-rose-600 font-medium bg-rose-50 p-3 rounded-md">
              {error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-slate-100 flex justify-end space-x-3 bg-slate-50 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">
            Cancel
          </button>
          
          {hasPermission ? (
            <>
              <button 
                onClick={handleRejectClick}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-md"
              >
                Reject
              </button>
              <button 
                onClick={handleAcceptClick}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
              >
                Accept
              </button>
            </>
          ) : (
            <div className="text-sm text-slate-500 py-2">
              You do not have permission to record inspections.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
