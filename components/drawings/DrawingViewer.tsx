import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';

interface DrawingViewerProps {
  url: string | null;
  onClose: () => void;
}

export function DrawingViewer({ url, onClose }: DrawingViewerProps) {
  const [zoom, setZoom] = useState(1);
  if (!url) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-900/95 animate-in fade-in">
      <div className="flex justify-between items-center p-4 text-white border-b border-slate-800 bg-slate-900">
        <h3 className="font-medium text-slate-200">{url.split('/').pop()}</h3>
        <div className="flex items-center space-x-4">
          <button onClick={() => setZoom(z => z + 0.25)} className="text-slate-400 hover:text-orange-500 transition-colors"><ZoomIn className="w-5 h-5" /></button>
          <button onClick={() => setZoom(z => Math.max(0.25, z - 0.25))} className="text-slate-400 hover:text-orange-500 transition-colors"><ZoomOut className="w-5 h-5" /></button>
          <button onClick={onClose} className="text-slate-400 hover:text-red-400 ml-4 transition-colors"><X className="w-6 h-6" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-auto flex items-center justify-center p-8">
         <div 
           className="bg-white rounded shadow-2xl transition-transform flex items-center justify-center text-slate-400 border border-slate-300" 
           style={{ transform: `scale(${zoom})`, width: 800, height: 1000, transformOrigin: 'center' }}
         >
           <p className="text-xl font-medium">Drawing preview placeholder for {url.split('/').pop()}</p>
         </div>
      </div>
    </div>
  )
}
