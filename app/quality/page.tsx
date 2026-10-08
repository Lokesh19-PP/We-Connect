import { QualityQueue } from '@/components/quality/quality-queue';
import { QualityMetrics } from '@/components/quality/quality-metrics';

export default function QualityPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
        Quality Inspection
      </h1>
      <QualityMetrics />
      <QualityQueue />
    </div>
  );
}
