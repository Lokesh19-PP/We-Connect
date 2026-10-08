import type { JobRisk } from '@/types';
import { AlertCircle, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface RiskBadgeProps {
  risk: JobRisk;
  showIcon?: boolean;
  className?: string;
}

/**
 * AGENTS.md Risk colours rule:
 * red = May miss date / Overdue
 * amber = Reinspection due / At risk
 * green = On track
 */
export function RiskBadge({ risk, showIcon = true, className = '' }: RiskBadgeProps) {
  let colorClasses = '';
  let Icon = CheckCircle2;

  switch (risk) {
    case 'Overdue':
      colorClasses = 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-500/20';
      Icon = AlertCircle;
      break;
    case 'May miss date':
      colorClasses = 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-500/20';
      Icon = AlertTriangle;
      break;
    case 'At risk':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20';
      Icon = AlertTriangle;
      break;
    case 'Reinspection due':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20';
      Icon = Clock;
      break;
    case 'On track':
    default:
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20';
      Icon = CheckCircle2;
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${colorClasses} ${className}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{risk}</span>
    </span>
  );
}
