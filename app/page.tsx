import { getUnacknowledgedCount } from '@/data/drawings';

export default function DashboardPage() {
  const unackCount = getUnacknowledgedCount();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Keep every part on track for assembly
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
          <h2 className="text-3xl font-bold text-orange-600 mb-2">{unackCount}</h2>
          <p className="text-slate-600 font-medium">Awaiting Drawing Acknowledgement</p>
        </div>
      </div>
      <div className="p-8 bg-white border border-slate-200 rounded-xl shadow-2xs text-center text-slate-500 text-sm">
        Dashboard module placeholder. Ready for Prompt 3 implementation.
      </div>
    </div>
  );
}
