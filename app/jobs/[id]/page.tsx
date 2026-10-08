import { Suspense } from 'react';
import Link from 'next/link';
import { JobDetailClient } from '@/components/jobs/job-detail-client';
import { ArrowLeft, Inbox } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;

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
      <JobDetailClient id={id} />
    </Suspense>
  );
}
