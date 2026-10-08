'use client';

// ──────────────────────────────────────────────
// VendorFlow – "Needs Action Today" Dashboard Section
// 4 items with one-click buttons & confirmation toast
// ──────────────────────────────────────────────
import { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Bell,
  Calendar,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  X,
} from 'lucide-react';

interface ActionItem {
  id: string;
  title: string;
  subtitle: string;
  actionText: string;
  actionHref?: string;
  type: 'remind' | 'schedule' | 'inspection' | 'review';
  urgent?: boolean;
}

export function NeedsActionList() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmingRemindId, setConfirmingRemindId] = useState<string | null>(null);

  const actionItems: ActionItem[] = [
    {
      id: 'act-1',
      title: 'Drawing Rev B sent to Patil Steel — 2 days waiting for ack',
      subtitle: 'Workshop C has not acknowledged latest approved revision',
      actionText: 'Remind vendor',
      type: 'remind',
      urgent: true,
    },
    {
      id: 'act-2',
      title: 'Bracket B-204 assembly shortfall predicted on 14 Oct',
      subtitle: 'Assembly slot requires 15 units, only 10 ready',
      actionText: 'Review schedule',
      actionHref: '/jobs',
      type: 'schedule',
    },
    {
      id: 'act-3',
      title: 'Gusset G-045 delivered by Kulkarni Engg awaiting inspection',
      subtitle: 'Goods receipt recorded on 06 Oct — GRN #GRN-104',
      actionText: 'Schedule inspection',
      actionHref: '/quality',
      type: 'inspection',
    },
    {
      id: 'act-4',
      title: 'Invoice #INV-204 from Shree Fabricators awaiting finance approval',
      subtitle: 'Amount ₹1,50,000 — Quality inspection passed',
      actionText: 'Review',
      actionHref: '/payments',
      type: 'review',
    },
  ];

  const handleActionClick = (item: ActionItem) => {
    if (item.type === 'remind') {
      setConfirmingRemindId(item.id);
    }
  };

  const handleConfirmRemind = () => {
    setConfirmingRemindId(null);
    setToastMessage('Reminder sent to Workshop C (Patil Steel)');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-2xs p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Needs Action Today</span>
          <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-100 text-amber-800 rounded-full">
            4 Actionable
          </span>
        </h2>
        <span className="text-[11px] text-slate-400 font-medium">Updated just now</span>
      </div>

      {/* Action Items List */}
      <div className="space-y-2.5">
        {actionItems.map((item) => (
          <div
            key={item.id}
            className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
              item.urgent
                ? 'bg-amber-50/50 border-amber-200/80 hover:bg-amber-50'
                : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-white border border-slate-200 shrink-0 text-slate-700 mt-0.5">
                {item.type === 'remind' && <Bell className="w-4 h-4 text-amber-600" />}
                {item.type === 'schedule' && <Calendar className="w-4 h-4 text-blue-600" />}
                {item.type === 'inspection' && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                {item.type === 'review' && <CreditCard className="w-4 h-4 text-indigo-600" />}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-xs">{item.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{item.subtitle}</p>
              </div>
            </div>

            {/* Action Button */}
            <div className="shrink-0">
              {item.actionHref ? (
                <Link
                  href={item.actionHref}
                  className="inline-flex items-center px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs rounded-lg transition-colors shadow-2xs"
                >
                  {item.actionText}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => handleActionClick(item)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors shadow-2xs"
                >
                  {item.actionText}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal for Remind Vendor */}
      {confirmingRemindId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-amber-600">
              <Bell className="w-6 h-6" />
              <h3 className="font-bold text-slate-900 text-sm">Send Vendor Reminder?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              This will send an immediate alert notification to Workshop C (Patil Steel) to acknowledge approved drawing revision Rev B.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmingRemindId(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemind}
                className="px-4 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-2xs"
              >
                Send Reminder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Banner Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 text-xs border border-slate-800 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
