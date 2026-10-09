import { Suspense } from 'react';
import { JobDetailClient } from '@/components/jobs/job-detail-client';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function JobContent({ params }: PageProps) {
  const { id } = await params;
  return <JobDetailClient id={id} />;
}

export default function JobDetailPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto space-y-6 animate-pulse p-4">
          <div className="h-8 w-48 bg-slate-200 rounded-lg" />
          <div className="h-44 bg-slate-200 rounded-2xl" />
          <div className="h-64 bg-slate-200 rounded-2xl" />
        </div>
      }
    >
      <JobContent params={params} />
    </Suspense>
  );
}
