import { useState } from 'react';
import { Part } from '@/types';
import { X, Upload, Loader2, AlertCircle } from 'lucide-react';
import { uploadFile } from '@/lib/storage';

interface UploadRevisionDialogProps {
  parts: Part[];
  isOpen: boolean;
  onClose: () => void;
  onUpload: (partId: string, revision: string, fileUrl: string, changeNote: string) => Promise<void> | void;
}

export function UploadRevisionDialog({ parts, isOpen, onClose, onUpload }: UploadRevisionDialogProps) {
  const [partId, setPartId] = useState('');
  const [revision, setRevision] = useState('');
  const [changeNote, setChangeNote] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partId || !revision || !selectedFile) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // 1. Upload file to Supabase private storage 'drawings'
      const uploadRes = await uploadFile('drawings', selectedFile);

      if (uploadRes.error) {
        setUploadError(uploadRes.error);
        setIsUploading(false);
        return;
      }

      // Use returned signed URL or storage path
      const fileUrl = uploadRes.url || uploadRes.path || `/drawings/${parts.find(p => p.id === partId)?.code}_${revision}.pdf`;

      // 2. Pass to parent callback
      await onUpload(partId, revision, fileUrl, changeNote);

      // Reset form state
      setPartId('');
      setRevision('');
      setChangeNote('');
      setSelectedFile(null);
      setIsUploading(false);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed. Please check permissions.';
      setUploadError(msg);
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Upload Revision</h2>
          <button onClick={onClose} disabled={isUploading} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {uploadError && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Part</label>
            <select
              required
              value={partId}
              onChange={e => setPartId(e.target.value)}
              disabled={isUploading}
              className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-slate-50"
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
              disabled={isUploading}
              className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-slate-50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Drawing File (PDF or Image, max 5 MB)</label>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-orange-500 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              {selectedFile ? (
                <div className="space-y-1">
                  <div className="text-sm text-slate-900 font-medium">{selectedFile.name}</div>
                  <div className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    disabled={isUploading}
                    className="text-xs text-red-600 hover:underline mt-1"
                  >
                    Change file
                  </button>
                </div>
              ) : (
                <>
                  <label className="cursor-pointer text-sm font-medium text-orange-600 hover:text-orange-700">
                    Click to select file
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,image/png,image/jpeg,image/svg+xml"
                      disabled={isUploading}
                      onChange={e => {
                        if (e.target.files?.[0]) {
                          setSelectedFile(e.target.files[0]);
                          setUploadError(null);
                        }
                      }}
                    />
                  </label>
                  <p className="text-xs text-slate-500 mt-1">PDF, PNG, JPG, or SVG up to 5 MB</p>
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
              disabled={isUploading}
              className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none disabled:bg-slate-50"
            />
          </div>
        </form>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 bg-slate-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            type="submit"
            disabled={!partId || !revision || !selectedFile || isUploading}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors shadow-sm"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload Revision'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
