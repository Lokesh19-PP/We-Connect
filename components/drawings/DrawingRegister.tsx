"use client";

import { useState, useEffect, useCallback } from 'react';
import { Part, Drawing, Job, DrawingAcknowledgement } from '@/types';
import { getDrawingStatus } from '@/lib/drawing-utils';
import { UploadRevisionDialog } from './UploadRevisionDialog';
import { AcknowledgementTracking } from './AcknowledgementTracking';
import { RevisionHistoryPanel } from './RevisionHistoryPanel';
import { DrawingViewer } from './DrawingViewer';
import { useRole } from '@/lib/role-context';
import { can } from '@/lib/permissions';
import {
  fetchParts,
  fetchDrawings,
  fetchJobs,
  fetchAcknowledgements,
  createDrawingRevision,
  approveDrawingRevision,
} from '@/lib/data';
import { getSignedUrl } from '@/lib/storage';
import {
  AlertTriangle,
  History,
  Search,
  Plus,
  Check,
  FileText,
  Loader2,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';

interface DrawingRegisterProps {
  initialParts?: Part[];
  initialDrawings?: Drawing[];
}

export function DrawingRegister({ initialParts, initialDrawings }: DrawingRegisterProps) {
  const [parts, setParts] = useState<Part[]>(initialParts || []);
  const [drawings, setDrawings] = useState<Drawing[]>(initialDrawings || []);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [acknowledgements, setAcknowledgements] = useState<DrawingAcknowledgement[]>([]);

  const [isLoading, setIsLoading] = useState(!initialParts || initialParts.length === 0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const [historyPart, setHistoryPart] = useState<Part | null>(null);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);

  const { role } = useRole();
  const canUpload = can(role, 'drawing.upload') || role === 'Admin' || role === 'Engineering';
  const canApprove = can(role, 'drawing.approve') || role === 'Admin' || role === 'Engineering';

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load all live Supabase data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const [partsRes, drawingsRes, jobsRes, acksRes] = await Promise.all([
        fetchParts(),
        fetchDrawings(),
        fetchJobs(),
        fetchAcknowledgements(),
      ]);

      if (partsRes.error) throw new Error(partsRes.error);
      if (drawingsRes.error) throw new Error(drawingsRes.error);

      setParts(partsRes.data || []);
      setDrawings(drawingsRes.data || []);
      setJobs(jobsRes.data || []);
      setAcknowledgements(acksRes.data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load drawings data from Supabase.';
      setLoadError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const [partsRes, drawingsRes, jobsRes, acksRes] = await Promise.all([
          fetchParts(),
          fetchDrawings(),
          fetchJobs(),
          fetchAcknowledgements(),
        ]);
        if (!ignore) {
          if (partsRes.error) throw new Error(partsRes.error);
          if (drawingsRes.error) throw new Error(drawingsRes.error);
          setParts(partsRes.data || []);
          setDrawings(drawingsRes.data || []);
          setJobs(jobsRes.data || []);
          setAcknowledgements(acksRes.data || []);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : 'Failed to load drawings data from Supabase.';
          setLoadError(msg);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  // Handle opening viewer with signed URL if storage path
  const handleViewDrawing = async (fileUrl: string) => {
    if (fileUrl.startsWith('http') || fileUrl.startsWith('/') || fileUrl.startsWith('blob:')) {
      setViewerUrl(fileUrl);
      return;
    }

    // Try generating signed URL from Supabase Storage
    const { signedUrl, error } = await getSignedUrl('drawings', fileUrl);
    if (error || !signedUrl) {
      showToast('Could not load drawing file: ' + (error || 'Unknown error'), 'error');
      setViewerUrl(fileUrl);
    } else {
      setViewerUrl(signedUrl);
    }
  };

  // Handle uploading revision to Supabase
  const handleUploadSuccess = async (partId: string, revision: string, fileUrl: string, changeNote: string) => {
    const res = await createDrawingRevision({
      partId,
      revision,
      fileUrl,
      changeNote,
    });

    if (res.error) {
      showToast(`Upload failed: ${res.error}`, 'error');
    } else if (res.data) {
      setDrawings(prev => [res.data!, ...prev]);
      showToast(`Revision ${revision} uploaded successfully. Pending engineering approval.`);
      // Refresh to ensure any DB triggers/updates are in sync
      loadData();
    }
  };

  // Handle approving revision in Supabase
  const handleApprove = async (drawing: Drawing) => {
    if (!canApprove) {
      showToast('Permission denied: Only Engineering and Admin can approve drawings.', 'error');
      return;
    }

    setApprovingId(drawing.id);
    const result = await approveDrawingRevision({
      drawingId: drawing.id,
      partId: drawing.partId,
      approverName: `Current User (${role})`,
    });
    setApprovingId(null);

    if (result.success) {
      showToast(
        `Revision ${drawing.revision} approved! ${result.notifiedCount} workshop(s) with open jobs notified.`
      );
      // Reload drawings to reflect updated approval state and superseded revisions
      loadData();
    } else {
      showToast(`Approval failed: ${result.error}`, 'error');
    }
  };

  const filteredParts = parts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search parts by name or code..."
            className="w-full border border-slate-300 py-2 pl-9 pr-4 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <button
            onClick={loadData}
            disabled={isLoading}
            title="Refresh drawings data"
            className="p-2 border border-slate-300 rounded-md text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {canUpload && (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Upload Revision
            </button>
          )}
        </div>
      </div>

      {/* Error state banner */}
      {loadError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-red-800 text-sm">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{loadError}</span>
          </div>
          <button
            onClick={loadData}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-900 rounded font-medium text-xs transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && parts.length === 0 && (
        <div className="space-y-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden h-44">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between">
                <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                <div className="h-6 bg-slate-200 rounded w-20"></div>
              </div>
              <div className="p-5 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-4/5"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Parts & Drawings Register */}
      {!isLoading && filteredParts.length === 0 && !loadError && (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-500 space-y-3">
          <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-base font-medium text-slate-700">
            {search ? `No parts found matching "${search}"` : 'No parts available in catalogue.'}
          </p>
          <p className="text-sm text-slate-400">
            {search ? 'Try clearing your search query.' : 'Add parts in Supabase database to view drawing registers.'}
          </p>
        </div>
      )}

      <div className="space-y-6">
        {filteredParts.map(part => {
          const partDrawings = drawings
            .filter(d => d.partId === part.id)
            .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));

          const approvedDrawing = partDrawings.find(d => d.approved);
          const unackJobs = jobs
            .filter(j => j.partId === part.id && !['Delivered', 'Inspected', 'Paid'].includes(j.stage))
            .filter(job => {
              const ack = acknowledgements.find(a => a.jobId === job.id && a.drawingId === approvedDrawing?.id);
              return !ack?.acknowledgedAt;
            });

          return (
            <div key={part.id} className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
              {/* Part Header */}
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h2 className="font-semibold text-slate-900">
                  {part.displayName}{' '}
                  <span className="text-slate-500 font-normal text-sm ml-2">({part.type})</span>
                </h2>
                <button
                  onClick={() => setHistoryPart(part)}
                  className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-md shadow-sm transition-colors"
                >
                  <History className="w-4 h-4 mr-1.5" /> History
                </button>
              </div>

              {/* Acknowledgment Warning Banner */}
              {approvedDrawing && unackJobs.length > 0 && (
                <div className="px-5 py-3 bg-amber-50 border-b border-amber-100 flex items-center text-amber-800 text-sm font-medium">
                  <AlertTriangle className="w-4 h-4 mr-2 shrink-0 text-amber-600" />
                  <span>
                    Revision {approvedDrawing.revision} not acknowledged yet by:{' '}
                    {unackJobs.map(j => j.workshopName).join(', ')}
                  </span>
                </div>
              )}

              {/* Revisions Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-slate-500 bg-white border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3 font-medium">Revision</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Date</th>
                      <th className="px-5 py-3 font-medium">Uploaded By</th>
                      <th className="px-5 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {partDrawings.map(d => {
                      const status = getDrawingStatus(d, partDrawings);
                      const isApprovingThis = approvingId === d.id;

                      return (
                        <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3 font-medium text-slate-900">{d.revision}</td>
                          <td className="px-5 py-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center ${
                                status === 'Approved'
                                  ? 'bg-green-100 text-green-800'
                                  : status === 'Superseded'
                                  ? 'bg-slate-100 text-slate-600'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-slate-600">
                            <div>{d.uploadedAt}</div>
                            {d.approved && d.approvedBy && (
                              <div className="text-xs text-green-600 mt-1 font-medium">
                                Approved on {d.approvedAt ? d.approvedAt.split('T')[0] : ''}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-3 text-slate-600">{d.uploadedBy || 'Engineering'}</td>
                          <td className="px-5 py-3 text-right space-x-3">
                            {!d.approved && canApprove && (
                              <button
                                onClick={() => handleApprove(d)}
                                disabled={isApprovingThis}
                                className="inline-flex items-center text-green-700 hover:text-green-900 text-sm font-medium transition-colors disabled:opacity-50"
                              >
                                {isApprovingThis ? (
                                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                ) : (
                                  <Check className="w-4 h-4 mr-1" />
                                )}
                                Approve
                              </button>
                            )}
                            <button
                              onClick={() => handleViewDrawing(d.fileUrl)}
                              className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              <FileText className="w-4 h-4 mr-1" /> View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {partDrawings.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-6 text-center text-slate-500">
                          No drawing revisions found for this part.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Acknowledgement Tracking section */}
              {approvedDrawing && (
                <AcknowledgementTracking
                  approvedDrawing={approvedDrawing}
                  jobs={jobs}
                  acknowledgements={acknowledgements}
                  onReminded={loadData}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Upload Revision Dialog */}
      <UploadRevisionDialog
        parts={parts}
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUploadSuccess}
      />

      {/* Revision History Slide-over */}
      <RevisionHistoryPanel
        part={historyPart}
        drawings={historyPart ? drawings.filter(d => d.partId === historyPart.id) : []}
        onClose={() => setHistoryPart(null)}
      />

      {/* Drawing PDF / CAD viewer */}
      <DrawingViewer url={viewerUrl} onClose={() => setViewerUrl(null)} />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-xl text-white text-sm font-medium animate-in fade-in slide-in-from-bottom-5 z-50 flex items-center space-x-2 ${
            toastType === 'error' ? 'bg-red-700' : 'bg-slate-900'
          }`}
        >
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
