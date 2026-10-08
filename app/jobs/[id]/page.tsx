export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
        Job Detail: {id}
      </h1>
      <div className="p-8 bg-white border border-slate-200 rounded-xl shadow-2xs text-center text-slate-500 text-sm">
        Job detail view for {id}. Owned by Tanmay.
      </div>
    </div>
  );
}
