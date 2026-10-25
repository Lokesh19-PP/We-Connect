import { X, ZoomIn, ZoomOut, Download, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface DrawingViewerProps {
  url: string | null;
  onClose: () => void;
}

export function DrawingViewer({ url, onClose }: DrawingViewerProps) {
  const [zoom, setZoom] = useState(1);
  if (!url) return null;

  const fileName = url.split('/').pop()?.split('?')[0] || 'Drawing File';
  const isImage = /\.(png|jpe?g|svg|webp)($|\?)/i.test(url);
  const isPdf = /\.pdf($|\?)/i.test(url);
  const isRealUrl = url.startsWith('http') || url.startsWith('blob:');

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-900/95 animate-in fade-in">
      <div className="flex justify-between items-center p-4 text-white border-b border-slate-800 bg-slate-900">
        <h3 className="font-medium text-slate-200 truncate max-w-md">{fileName}</h3>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setZoom(z => Math.min(2.5, z + 0.25))} 
            title="Zoom In"
            className="text-slate-400 hover:text-orange-500 transition-colors p-1"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} 
            title="Zoom Out"
            className="text-slate-400 hover:text-orange-500 transition-colors p-1"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          {isRealUrl && (
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer" 
              title="Open Original"
              className="text-slate-400 hover:text-orange-500 transition-colors p-1"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          )}
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-red-400 ml-2 transition-colors p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto flex items-center justify-center p-6">
        <div 
          className="bg-white rounded-lg shadow-2xl transition-transform flex items-center justify-center text-slate-500 border border-slate-700 overflow-hidden" 
          style={{ transform: `scale(${zoom})`, width: '85vw', maxWidth: 900, height: '80vh', transformOrigin: 'center' }}
        >
          {isRealUrl ? (
            isImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={url} alt={fileName} className="max-w-full max-h-full object-contain" />
            ) : isPdf ? (
              <iframe src={url} title={fileName} className="w-full h-full border-0" />
            ) : (
              <iframe src={url} title={fileName} className="w-full h-full border-0" />
            )
          ) : (
            <div className="text-center p-8 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Download className="w-8 h-8" />
              </div>
              <p className="text-lg font-semibold text-slate-800">{fileName}</p>
              <p className="text-sm text-slate-500 max-w-sm">
                Sample drawing revision template. Upload a real PDF or CAD image revision using the &quot;Upload Revision&quot; button to view live documents here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
