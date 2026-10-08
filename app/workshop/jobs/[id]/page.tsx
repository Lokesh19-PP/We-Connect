import { Suspense } from 'react';

async function WorkshopJobContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="p-6 bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-sm text-center text-slate-300 text-xs">
      Workshop detail view for job {id}. Owned by Vedant.
    </div>
  );
}

export default function WorkshopJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="space-y-4 text-slate-100">
      <h1 className="text-xl font-bold text-white tracking-tight">
        Job Details
      </h1>
      <Suspense fallback={<div className="p-6 bg-slate-800/80 border border-slate-700/80 rounded-2xl text-center text-slate-400 text-xs">Loading workshop job detail...</div>}>
        <WorkshopJobContent params={params} />
      </Suspense>
    </div>
  );
}
