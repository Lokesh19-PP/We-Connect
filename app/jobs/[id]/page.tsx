import { Suspense } from 'react';

async function JobContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="p-8 bg-white border border-slate-200 rounded-xl shadow-2xs text-center text-slate-500 text-sm">
      Job detail view for {id}. Owned by Tanmay.
    </div>
  );
}

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
        Job Detail
      </h1>
      <Suspense fallback={<div className="p-8 bg-white border border-slate-200 rounded-xl text-center text-slate-400 text-sm">Loading job detail...</div>}>
        <JobContent params={params} />
      </Suspense>
    </div>
  );
}
