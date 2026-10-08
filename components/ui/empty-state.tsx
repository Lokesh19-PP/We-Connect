'use client';

// ──────────────────────────────────────────────
// We Connect – EmptyState Component
// Icon, Title, One-line help, Action Button / Node
// ──────────────────────────────────────────────
import React from 'react';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?:
    | {
        label: string;
        onClick: () => void;
      }
    | React.ReactNode;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="p-12 bg-white border border-[#E5E7EB] rounded-[10px] text-center space-y-3 shadow-xs">
      <div className="w-12 h-12 rounded-full bg-[#F6F7F9] text-[#6B7280] flex items-center justify-center mx-auto">
        <Icon className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h3 className="text-[16px] font-semibold text-[#111827]">
          {title}
        </h3>
        {description && (
          <p className="text-[14px] text-[#6B7280] max-w-sm mx-auto leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="pt-2">
          {React.isValidElement(action) ? (
            action
          ) : typeof action === 'object' && 'label' in action ? (
            <button
              type="button"
              onClick={action.onClick}
              className="px-4 py-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold text-[14px] rounded-[8px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2 shadow-2xs"
            >
              {action.label}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
