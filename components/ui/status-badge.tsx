'use client';

// ──────────────────────────────────────────────
// We Connect – Unified StatusBadge Component
// Map-driven colors, borders & icons for all stages, risks & statuses
// ──────────────────────────────────────────────
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Truck,
  RotateCcw,
  ShieldAlert,
  CreditCard,
  Minus,
  Check,
} from 'lucide-react';

export type StatusCategory = 'green' | 'amber' | 'red' | 'blue' | 'grey';

interface StatusConfig {
  category: StatusCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

/** Unified Status Map for the whole application */
const STATUS_MAP: Record<string, StatusConfig> = {
  // Green Statuses (On track / Accepted / Paid / Active)
  'On track': {
    category: 'green',
    label: 'On track',
    icon: CheckCircle2,
    bgClass: 'bg-[#ECFDF5]',
    textClass: 'text-[#047857]',
    borderClass: 'border-[#A7F3D0]',
  },
  Accepted: {
    category: 'green',
    label: 'Accepted',
    icon: CheckCircle2,
    bgClass: 'bg-[#ECFDF5]',
    textClass: 'text-[#047857]',
    borderClass: 'border-[#A7F3D0]',
  },
  Paid: {
    category: 'green',
    label: 'Paid',
    icon: Check,
    bgClass: 'bg-[#ECFDF5]',
    textClass: 'text-[#047857]',
    borderClass: 'border-[#A7F3D0]',
  },
  Active: {
    category: 'green',
    label: 'Active',
    icon: CheckCircle2,
    bgClass: 'bg-[#ECFDF5]',
    textClass: 'text-[#047857]',
    borderClass: 'border-[#A7F3D0]',
  },
  Approved: {
    category: 'green',
    label: 'Approved',
    icon: CheckCircle2,
    bgClass: 'bg-[#ECFDF5]',
    textClass: 'text-[#047857]',
    borderClass: 'border-[#A7F3D0]',
  },

  // Amber Statuses (At risk / Reinspection due / Awaiting approval)
  'At risk': {
    category: 'amber',
    label: 'At risk',
    icon: AlertTriangle,
    bgClass: 'bg-[#FFFBEB]',
    textClass: 'text-[#B45309]',
    borderClass: 'border-[#FDE68A]',
  },
  'Reinspection due': {
    category: 'amber',
    label: 'Reinspection due',
    icon: RotateCcw,
    bgClass: 'bg-[#FFFBEB]',
    textClass: 'text-[#B45309]',
    borderClass: 'border-[#FDE68A]',
  },
  'Awaiting approval': {
    category: 'amber',
    label: 'Awaiting approval',
    icon: Clock,
    bgClass: 'bg-[#FFFBEB]',
    textClass: 'text-[#B45309]',
    borderClass: 'border-[#FDE68A]',
  },
  'Pending approval': {
    category: 'amber',
    label: 'Pending approval',
    icon: Clock,
    bgClass: 'bg-[#FFFBEB]',
    textClass: 'text-[#B45309]',
    borderClass: 'border-[#FDE68A]',
  },

  // Red Statuses (May miss date / Overdue / Rejected / On hold for quality)
  'May miss date': {
    category: 'red',
    label: 'May miss date',
    icon: XCircle,
    bgClass: 'bg-[#FFF1F2]',
    textClass: 'text-[#BE123C]',
    borderClass: 'border-[#FECDD3]',
  },
  Overdue: {
    category: 'red',
    label: 'Overdue',
    icon: XCircle,
    bgClass: 'bg-[#FFF1F2]',
    textClass: 'text-[#BE123C]',
    borderClass: 'border-[#FECDD3]',
  },
  Rejected: {
    category: 'red',
    label: 'Rejected',
    icon: XCircle,
    bgClass: 'bg-[#FFF1F2]',
    textClass: 'text-[#BE123C]',
    borderClass: 'border-[#FECDD3]',
  },
  'On hold for quality': {
    category: 'red',
    label: 'On hold for quality',
    icon: ShieldAlert,
    bgClass: 'bg-[#FFF1F2]',
    textClass: 'text-[#BE123C]',
    borderClass: 'border-[#FECDD3]',
  },
  Inactive: {
    category: 'red',
    label: 'Inactive',
    icon: XCircle,
    bgClass: 'bg-[#F3F4F6]',
    textClass: 'text-[#4B5563]',
    borderClass: 'border-[#E5E7EB]',
  },

  // Blue Statuses (In progress / Ready / Delivered / info)
  'In progress': {
    category: 'blue',
    label: 'In progress',
    icon: Clock,
    bgClass: 'bg-[#EFF6FF]',
    textClass: 'text-[#1D4ED8]',
    borderClass: 'border-[#BFDBFE]',
  },
  Ready: {
    category: 'blue',
    label: 'Ready',
    icon: CheckCircle2,
    bgClass: 'bg-[#EFF6FF]',
    textClass: 'text-[#1D4ED8]',
    borderClass: 'border-[#BFDBFE]',
  },
  Delivered: {
    category: 'blue',
    label: 'Delivered',
    icon: Truck,
    bgClass: 'bg-[#EFF6FF]',
    textClass: 'text-[#1D4ED8]',
    borderClass: 'border-[#BFDBFE]',
  },
  Inspected: {
    category: 'blue',
    label: 'Inspected',
    icon: CheckCircle2,
    bgClass: 'bg-[#EFF6FF]',
    textClass: 'text-[#1D4ED8]',
    borderClass: 'border-[#BFDBFE]',
  },

  // Neutral / Grey Statuses
  Ordered: {
    category: 'grey',
    label: 'Ordered',
    icon: Minus,
    bgClass: 'bg-[#F3F4F6]',
    textClass: 'text-[#374151]',
    borderClass: 'border-[#E5E7EB]',
  },
  Pending: {
    category: 'grey',
    label: 'Pending',
    icon: Clock,
    bgClass: 'bg-[#F3F4F6]',
    textClass: 'text-[#374151]',
    borderClass: 'border-[#E5E7EB]',
  },
  'Not ready': {
    category: 'grey',
    label: 'Not ready',
    icon: Minus,
    bgClass: 'bg-[#F3F4F6]',
    textClass: 'text-[#374151]',
    borderClass: 'border-[#E5E7EB]',
  },
  Superseded: {
    category: 'grey',
    label: 'Superseded',
    icon: Minus,
    bgClass: 'bg-[#F3F4F6]',
    textClass: 'text-[#6B7280]',
    borderClass: 'border-[#E5E7EB]',
  },
};

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  size = 'md',
  showIcon = true,
  className = '',
}: StatusBadgeProps) {
  const config = STATUS_MAP[status] || {
    category: 'grey',
    label: status,
    icon: Minus,
    bgClass: 'bg-[#F3F4F6]',
    textClass: 'text-[#374151]',
    borderClass: 'border-[#E5E7EB]',
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-[12px] gap-1.5',
    lg: 'px-3 py-1.5 text-[13px] gap-2',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-[6px] border ${config.bgClass} ${config.textClass} ${config.borderClass} ${sizeClasses} ${className}`}
    >
      {showIcon && <Icon className={`${iconSizes} shrink-0`} />}
      <span>{config.label}</span>
    </span>
  );
}
