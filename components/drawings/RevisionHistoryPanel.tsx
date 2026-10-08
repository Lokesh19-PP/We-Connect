import { Drawing, Part } from '@/types';
import { X } from 'lucide-react';

interface RevisionHistoryPanelProps {
  part: Part | null;
  drawings: Drawing[];
  onClose: () => void;
}

export function RevisionHistoryPanel({ part, drawings, onClose }: RevisionHistoryPanelProps) {
  if (!part) return null;
  
  return (
    <div className="fixed inset-y-0 right-0 z-50 w-80 bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right">
      <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
        <h3 className="font-semibold text-slate-900">Revision History</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-4 bg-slate-100 border-b border-slate-200 text-sm font-medium text-slate-700">
        {part.displayName}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {drawings.sort((a,b) => b.uploadedAt.localeCompare(a.uploadedAt)).map((d, i) => (
           <div key={d.id} className="relative pl-6 border-l-2 border-slate-200 pb-2 last:border-0 last:pb-0">
             <div className="absolute w-3 h-3 bg-slate-300 rounded-full -left-[7px] top-1 border-2 border-white"></div>
             <div className="font-medium text-sm text-slate-900">{d.revision} <span className="text-slate-500 font-normal ml-2">{d.uploadedAt}</span></div>
             <div className="text-xs text-slate-600 mt-1">Uploaded by {d.uploadedBy}</div>
             {d.approved && <div className="text-xs text-green-600 mt-1 font-medium">Approved by {d.approvedBy || d.uploadedBy}</div>}
             {d.changeNote && <div className="text-xs text-slate-700 bg-slate-50 p-2 rounded mt-2 border border-slate-200 italic">"{d.changeNote}"</div>}
           </div>
        ))}
      </div>
    </div>
  )
}
