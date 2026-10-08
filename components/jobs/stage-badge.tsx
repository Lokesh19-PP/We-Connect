import type { JobStage } from '@/types';

interface StageBadgeProps {
  stage: JobStage;
  className?: string;
}

export function StageBadge({ stage, className = '' }: StageBadgeProps) {
  let colorClasses = '';

  switch (stage) {
    case 'Ordered':
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
      break;
    case 'Accepted':
      colorClasses = 'bg-sky-50 text-sky-700 border-sky-200';
      break;
    case 'In progress':
      colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
      break;
    case 'Ready':
      colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      break;
    case 'Delivered':
      colorClasses = 'bg-cyan-50 text-cyan-700 border-cyan-200';
      break;
    case 'Inspected':
      colorClasses = 'bg-teal-50 text-teal-700 border-teal-200';
      break;
    case 'Paid':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      break;
    default:
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${colorClasses} ${className}`}
    >
      {stage}
    </span>
  );
}
