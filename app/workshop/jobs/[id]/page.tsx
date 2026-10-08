import { Suspense } from 'react';
import JobClient from './job-client';

export default async function WorkshopJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="space-y-4">
      <Suspense fallback={<div className="text-slate-400 text-xs p-6">Loading...</div>}>
        <JobClient jobId={id} />
      </Suspense>
    </div>
  );
}
