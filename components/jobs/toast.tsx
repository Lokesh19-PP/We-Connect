'use client';

import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useEffect } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const Icon =
    toast.type === 'success'
      ? CheckCircle2
      : toast.type === 'warning'
      ? AlertTriangle
      : Info;

  const bgStyles =
    toast.type === 'success'
      ? 'bg-slate-900 border-emerald-500/50 text-white'
      : toast.type === 'warning'
      ? 'bg-slate-900 border-amber-500/50 text-white'
      : 'bg-slate-900 border-blue-500/50 text-white';

  const iconStyles =
    toast.type === 'success'
      ? 'text-emerald-400'
      : toast.type === 'warning'
      ? 'text-amber-400'
      : 'text-blue-400';

  return (
    <div
      className={`pointer-events-auto p-4 rounded-xl border shadow-xl flex items-start gap-3 transition-all animate-in slide-in-from-bottom-3 duration-300 ${bgStyles}`}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconStyles}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
