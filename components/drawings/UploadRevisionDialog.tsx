import { useState } from 'react';
import { Part } from '@/types';
import { X, Upload } from 'lucide-react';

interface UploadRevisionDialogProps {
  parts: Part[];
  isOpen: boolean;
  onClose: () => void;
  onUpload: (partId: string, revision: string, fileUrl: string, changeNote: string) => void;
}

export function UploadRevisionDialog({ parts, isOpen, onClose, onUpload }: UploadRevisionDialogProps) {
  const [partId, setPartId] = useState('');
  const [revision, setRevision] = useState('');
  const [changeNote, setChangeNote] = useState('');
  const [fakeFile, setFakeFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partId || !revision || !fakeFile) return;
    
    // Fake upload URL
    const fileUrl = `/drawings/${parts.find(p => p.id === partId)?.code}_${revision.replace(/\s+/g, '')}.pdf`;
    
    onUpload(partId, revision, fileUrl, changeNote);
    
    // Reset
    setPartId('');
    setRevision('');
    setChangeNote('');
    setFakeFile(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Upload Revision</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Part</label>
            <select 
              required
              value={partId}
              onChange={e => setPartId(e.target.value)}
              className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="" disabled>Select a part</option>
              {parts.map(p => (
                <option key={p.id} value={p.id}>{p.displayName}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Revision Label</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Rev D"
              value={revision}
              onChange={e => setRevision(e.target.value)}
              className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Drawing File (PDF/Image)</label>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-orange-500 transition-colors">
               <Upload className="w-8 h-8 text-slate-400 mb-2" />
               {fakeFile ? (
                 <div className="text-sm text-slate-700 font-medium">{fakeFile.name}</div>
               ) : (
                 <>
                   <label className="cursor-pointer text-sm font-medium text-orange-600 hover:text-orange-700">
                     Click to upload
                     <input type="file" className="hidden" accept=".pdf,image/*" onChange={e => {
                       if (e.target.files?.[0]) setFakeFile(e.target.files[0]);
                     }} />
                   </label>
                   <p className="text-xs text-slate-500 mt-1">or drag and drop</p>
                 </>
               )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Change Note (Optional)</label>
            <textarea 
              rows={3}
              placeholder="What changed in this revision?"
              value={changeNote}
              onChange={e => setChangeNote(e.target.value)}
              className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>
        </form>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 bg-slate-100 rounded-md transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} type="submit" disabled={!partId || !revision || !fakeFile} className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors shadow-sm">
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}
