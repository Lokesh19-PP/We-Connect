"use client"

import React, { useEffect } from "react"
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react"

export interface ToastMessage {
  id: string
  type?: "success" | "warning" | "error" | "info"
  title: string
  message?: string
}

export interface ToastContainerProps {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (!toasts || toasts.length === 0) return null

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage
  onDismiss: (id: string) => void
}) {
  const type = toast.type || "info"

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id)
    }, 4500)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  const iconMap = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />,
    info: <Info className="h-5 w-5 text-blue-500 shrink-0" />,
  }

  const borderMap = {
    success: "border-l-4 border-l-emerald-500 border-gray-200",
    warning: "border-l-4 border-l-amber-500 border-gray-200",
    error: "border-l-4 border-l-red-500 border-gray-200",
    info: "border-l-4 border-l-blue-500 border-gray-200",
  }

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 rounded-[10px] bg-white p-4 text-gray-900 shadow-lg border transition-all animate-in slide-in-from-bottom-2 duration-200 ${borderMap[type]}`}
    >
      {iconMap[type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 leading-tight">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="rounded-md p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]"
        aria-label="Dismiss toast"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
