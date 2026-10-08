import { JobRisk } from '@/types';
import { cn } from '@/lib/utils';

export function RiskBadge({ risk }: { risk: JobRisk }) {
  const riskStyles: Record<JobRisk, string> = {
    'On track': 'bg-emerald-100 text-emerald-800',
    'At risk': 'bg-amber-100 text-amber-800',
    'May miss date': 'bg-orange-100 text-orange-800',
    'Reinspection due': 'bg-purple-100 text-purple-800',
    'Overdue': 'bg-rose-100 text-rose-800',
  };

  return (
    <span className={cn('px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap', riskStyles[risk])}>
      {risk}
    </span>
  );
}
