'use client';

// ──────────────────────────────────────────────
// VendorFlow – Review Invoice Dialog
// Finance: Approve / Send back / Mark as Paid.
// Other roles: buttons visible but disabled w/ tooltip.
// ──────────────────────────────────────────────
import { useState } from 'react';
import type { InvoicePayment } from '@/types';
import {
  X,
  FileText,
  CheckCircle2,
  XCircle,
  DollarSign,
  AlertTriangle,
  CalendarDays,
  Hash,
  ExternalLink,
  Banknote,
} from 'lucide-react';

interface ReviewInvoiceDialogProps {
  invoice: InvoicePayment;
  canApprove: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onSendBack: (id: string, reason: string) => void;
  onMarkPaid: (id: string, paidDate: string, paidAmount: number, reference: string) => void;
}

type DialogView = 'review' | 'send-back' | 'mark-paid' | 'approved' | 'paid';

export function ReviewInvoiceDialog({
  invoice,
  canApprove,
  onClose,
  onApprove,
  onSendBack,
  onMarkPaid,
}: ReviewInvoiceDialogProps) {
  const [view, setView] = useState<DialogView>(
    invoice.paymentStatus === 'Paid' ? 'paid' : 'review'
  );
  const [sendBackReason, setSendBackReason] = useState('');
  const [sendBackError, setSendBackError] = useState('');
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidAmount, setPaidAmount] = useState(String(invoice.amount));
  const [paidRef, setPaidRef] = useState('');
  const [paidError, setPaidError] = useState('');

  const isReady = invoice.paymentStatus === 'Ready';
  const isAwaiting = invoice.paymentStatus === 'Awaiting approval';
  const isPaid = invoice.paymentStatus === 'Paid';

  function handleApprove() {
    onApprove(invoice.id);
    setView('approved');
  }

  function handleSendBack() {
    if (!sendBackReason.trim()) {
      setSendBackError('Please enter a reason for sending back');
      return;
    }
    onSendBack(invoice.id, sendBackReason.trim());
    onClose();
  }

  function handleMarkPaid() {
    const amt = parseFloat(paidAmount);
    if (!paidDate) { setPaidError('Payment date is required'); return; }
    if (isNaN(amt) || amt <= 0) { setPaidError('Enter a valid payment amount'); return; }
    onMarkPaid(invoice.id, paidDate, amt, paidRef.trim());
    setView('paid');
    setTimeout(onClose, 1200);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="invoice-dialog-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-600 to-indigo-700">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 id="invoice-dialog-title" className="text-base font-bold text-white">
                Invoice Review
              </h2>
              <p className="text-xs text-indigo-100 mt-0.5">
                {invoice.invoiceNumber || '(no invoice number)'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Invoice summary */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <InfoRow icon={<Hash className="w-3.5 h-3.5" />} label="Invoice No." value={invoice.invoiceNumber || '—'} />
            <InfoRow icon={<CalendarDays className="w-3.5 h-3.5" />} label="Invoice Date" value={invoice.invoiceDate ? fmtDate(invoice.invoiceDate) : '—'} />
            <InfoRow
              icon={<DollarSign className="w-3.5 h-3.5" />}
              label="Amount"
              value={invoice.amount > 0 ? `₹${invoice.amount.toLocaleString('en-IN')}` : '—'}
              highlight
            />
            <InfoRow icon={<FileText className="w-3.5 h-3.5" />} label="Status" value={invoice.paymentStatus} />
          </div>

          {/* Invoice file preview link */}
          {invoice.invoiceFileUrl && (
            <a
              href={invoice.invoiceFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">View invoice document</span>
            </a>
          )}

          {/* ── Success / final states ── */}
          {view === 'approved' && (
            <div className="flex flex-col items-center py-4 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
              <p className="text-sm font-semibold text-slate-800">Invoice Approved</p>
              <p className="text-xs text-slate-500 text-center">
                Status moved to "Awaiting approval". Finance can now mark as paid.
              </p>
            </div>
          )}

          {view === 'paid' && (
            <div className="flex flex-col items-center py-4 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
              <p className="text-sm font-semibold text-slate-800">Payment Recorded</p>
              <p className="text-xs text-slate-500 text-center">
                Invoice marked as Paid. Record updated.
              </p>
            </div>
          )}

          {/* ── Send back form ── */}
          {view === 'send-back' && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-slate-700">
                Reason for sending back <span className="text-red-500">*</span>
              </p>
              <textarea
                autoFocus
                rows={3}
                placeholder="e.g. Invoice amount doesn't match PO, GST number missing…"
                value={sendBackReason}
                onChange={(e) => { setSendBackReason(e.target.value); setSendBackError(''); }}
                className={`w-full text-xs px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 ${sendBackError ? 'border-red-400' : 'border-slate-200'}`}
              />
              {sendBackError && (
                <p className="text-[11px] text-red-500 flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{sendBackError}</span>
                </p>
              )}
            </div>
          )}

          {/* ── Mark as paid form ── */}
          {view === 'mark-paid' && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-700">Payment details</p>
              <div className="space-y-2">
                <label className="block text-[11px] font-medium text-slate-600">
                  Payment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={paidDate}
                  onChange={(e) => { setPaidDate(e.target.value); setPaidError(''); }}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-medium text-slate-600">
                  Amount Paid (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => { setPaidAmount(e.target.value); setPaidError(''); }}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-medium text-slate-600">
                  Payment Reference / UTR
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTR123456789"
                  value={paidRef}
                  onChange={(e) => setPaidRef(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {paidError && (
                <p className="text-[11px] text-red-500 flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{paidError}</span>
                </p>
              )}
            </div>
          )}

          {/* Role restriction notice */}
          {!canApprove && view === 'review' && (
            <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
              Only <strong>Finance</strong> can approve or send back invoices.
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end space-x-2 px-6 py-4 border-t border-slate-100 bg-slate-50/60">
          {view === 'review' && !isPaid && !isApprovedOrPaid(view) && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Close
              </button>

              {/* Send back */}
              <DisableableButton
                id="invoice-send-back-btn"
                label="Send back"
                icon={<XCircle className="w-3.5 h-3.5" />}
                enabled={canApprove && (isReady || isAwaiting)}
                disabledTooltip={!canApprove ? 'Finance only' : 'Not available in current status'}
                variant="outline"
                onClick={() => setView('send-back')}
              />

              {/* Approve */}
              {!isAwaiting && (
                <DisableableButton
                  id="invoice-approve-btn"
                  label="Approve"
                  icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  enabled={canApprove && isReady}
                  disabledTooltip={!canApprove ? 'Finance only' : 'Invoice must be Ready to approve'}
                  variant="primary"
                  onClick={handleApprove}
                />
              )}

              {/* Mark as paid (available when Awaiting approval) */}
              {isAwaiting && (
                <DisableableButton
                  id="invoice-mark-paid-btn"
                  label="Mark as paid"
                  icon={<Banknote className="w-3.5 h-3.5" />}
                  enabled={canApprove}
                  disabledTooltip="Finance only"
                  variant="primary"
                  onClick={() => setView('mark-paid')}
                />
              )}
            </>
          )}

          {view === 'send-back' && (
            <>
              <button
                type="button"
                onClick={() => setView('review')}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Back
              </button>
              <button
                id="invoice-send-back-confirm-btn"
                type="button"
                onClick={handleSendBack}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Confirm send back
              </button>
            </>
          )}

          {view === 'mark-paid' && (
            <>
              <button
                type="button"
                onClick={() => setView('review')}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Back
              </button>
              <button
                id="invoice-mark-paid-confirm-btn"
                type="button"
                onClick={handleMarkPaid}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                Confirm payment
              </button>
            </>
          )}

          {(view === 'approved' || view === 'paid' || isPaid) && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────

function isApprovedOrPaid(view: DialogView) {
  return view === 'approved' || view === 'paid';
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function InfoRow({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col space-y-0.5 p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
      <span className="flex items-center space-x-1 text-[10px] text-slate-400 font-medium uppercase tracking-wide">
        <span className="text-slate-300">{icon}</span>
        <span>{label}</span>
      </span>
      <span className={`text-xs font-semibold truncate ${highlight ? 'text-indigo-700' : 'text-slate-800'}`}>
        {value}
      </span>
    </div>
  );
}

function DisableableButton({
  id,
  label,
  icon,
  enabled,
  disabledTooltip,
  variant,
  onClick,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  enabled: boolean;
  disabledTooltip: string;
  variant: 'primary' | 'outline';
  onClick: () => void;
}) {
  const base =
    'inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all';
  const primary = 'text-white bg-indigo-600 hover:bg-indigo-700 active:translate-y-px';
  const outline = 'text-slate-700 bg-white border border-slate-200 hover:bg-slate-50';
  const disabledCls = 'opacity-40 cursor-not-allowed';

  return (
    <div className="relative group/btn">
      <button
        id={id}
        type="button"
        onClick={enabled ? onClick : undefined}
        disabled={!enabled}
        aria-disabled={!enabled}
        title={!enabled ? disabledTooltip : undefined}
        className={`${base} ${variant === 'primary' ? primary : outline} ${!enabled ? disabledCls : ''}`}
      >
        {icon}
        <span>{label}</span>
      </button>
      {/* Tooltip for non-Finance roles */}
      {!enabled && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/btn:block z-10">
          <div className="bg-slate-900 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
            {disabledTooltip}
          </div>
        </div>
      )}
    </div>
  );
}
