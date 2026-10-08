'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRole } from '@/lib/role-context';
import { can } from '@/lib/permissions';
import { getParts, getWorkshops, getDrawingsForPart } from '@/data/sample';
import { createJob, type EnrichedJob } from '@/data/jobs';
import {
  Plus,
  X,
  FileCheck2,
  Calendar,
  Layers,
  AlertCircle,
  Building,
  CheckCircle2,
} from 'lucide-react';

interface NewJobDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onJobCreated?: (newJob: EnrichedJob) => void;
  showToast?: (title: string, message?: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export function NewJobDialog({
  isOpen,
  onOpenChange,
  onJobCreated,
  showToast,
}: NewJobDialogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role } = useRole();

  const parts = getParts();
  const workshops = getWorkshops();

  // Form State
  const [partId, setPartId] = useState(parts[0]?.id || '');
  const [quantity, setQuantity] = useState('25');
  const [workshopId, setWorkshopId] = useState(workshops[0]?.id || '');
  const [material, setMaterial] = useState('Mild Steel IS 2062');
  const [dueDate, setDueDate] = useState('');
  const [neededByDate, setNeededByDate] = useState('');
  const [project, setProject] = useState('Boiler B-200');
  const [notes, setNotes] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default dates on mount
  useEffect(() => {
    const today = new Date();
    const defaultDue = new Date();
    defaultDue.setDate(today.getDate() + 14);
    const defaultNeeded = new Date();
    defaultNeeded.setDate(today.getDate() + 17);

    setDueDate(defaultDue.toISOString().split('T')[0]);
    setNeededByDate(defaultNeeded.toISOString().split('T')[0]);
  }, []);

  // Sync with ?new=1 query param
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      if (can(role, 'job.create')) {
        onOpenChange(true);
      }
    }
  }, [searchParams, role, onOpenChange]);

  // Find currently approved drawing for selected part (Rule 1 & Rule 2 requirement)
  const partDrawings = getDrawingsForPart(partId);
  const approvedDrawing = partDrawings.find((d) => d.approved);

  // Reset form
  const resetForm = () => {
    setPartId(parts[0]?.id || '');
    setQuantity('25');
    setWorkshopId(workshops[0]?.id || '');
    setMaterial('Mild Steel IS 2062');
    setProject('Boiler B-200');
    setNotes('');
    setErrors({});
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!partId) newErrors.partId = 'Please select a part';
    const numQty = Number(quantity);
    if (!quantity || isNaN(numQty) || numQty <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    if (!workshopId) newErrors.workshopId = 'Please select a workshop';
    if (!material.trim()) newErrors.material = 'Material specification is required';
    if (!dueDate) newErrors.dueDate = 'Due date is required';
    if (!neededByDate) newErrors.neededByDate = 'Assembly needed-by date is required';

    if (dueDate && neededByDate) {
      const due = new Date(dueDate).getTime();
      const needed = new Date(neededByDate).getTime();
      if (needed < due) {
        newErrors.neededByDate = 'Assembly date must be on or after fabrication due date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const newJob = createJob({
        partId,
        quantity: Number(quantity),
        workshopId,
        material: material.trim(),
        dueDate,
        neededByDate,
        project,
        notes: notes.trim(),
      });

      if (onJobCreated) {
        onJobCreated(newJob);
      }

      if (showToast) {
        showToast(
          `Job ${newJob.id} Created Successfully`,
          `${newJob.partDisplayName} (${newJob.quantity} pcs) assigned to ${newJob.workshopName} with ${approvedDrawing?.revision || 'Rev A'}.`,
          'success'
        );
      }

      // Close dialog and clean query param if present
      onOpenChange(false);
      resetForm();

      if (searchParams.get('new') === '1') {
        const url = new URL(window.location.href);
        url.searchParams.delete('new');
        router.replace(url.pathname);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create job';
      setErrors({ form: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Create New Job</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Issue fabrication purchase order to external workshop
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5 text-xs">
          {errors.form && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Part Selection & Approved Revision Info */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Part <span className="text-red-500">*</span>
            </label>
            <select
              value={partId}
              onChange={(e) => {
                setPartId(e.target.value);
                const selected = parts.find((p) => p.id === e.target.value);
                if (selected?.type === 'Fitting') setMaterial('Forged Carbon Steel A105');
                else if (selected?.type === 'Accessory') setMaterial('Stainless Steel SS 304');
                else if (selected?.type === 'Support') setMaterial('Structural Steel IS 2062');
              }}
              className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                errors.partId ? 'border-red-400 bg-red-50/50' : 'border-slate-300'
              }`}
            >
              {parts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.displayName} ({p.type})
                </option>
              ))}
            </select>
            {errors.partId && (
              <p className="text-red-600 mt-1 text-[11px]">{errors.partId}</p>
            )}

            {/* Approved drawing revision association notice */}
            <div className="mt-2 p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 text-blue-900">
                <FileCheck2 className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <span className="font-semibold text-blue-950">
                    Approved Revision: {approvedDrawing ? approvedDrawing.revision : 'None approved'}
                  </span>
                  {approvedDrawing && (
                    <span className="text-[11px] text-blue-700 block">
                      Uploaded by {approvedDrawing.uploadedBy} ({approvedDrawing.uploadedAt})
                    </span>
                  )}
                </div>
              </div>
              {approvedDrawing ? (
                <span className="text-emerald-700 font-semibold bg-emerald-100 px-2.5 py-1 rounded-md text-[10px] border border-emerald-300/50">
                  Rule 1 Compliant (Approved)
                </span>
              ) : (
                <span className="text-amber-700 font-semibold bg-amber-100 px-2.5 py-1 rounded-md text-[10px] border border-amber-300/50">
                  Awaiting Engineering Approval
                </span>
              )}
            </div>
          </div>

          {/* Workshop & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Workshop / Vendor <span className="text-red-500">*</span>
              </label>
              <select
                value={workshopId}
                onChange={(e) => setWorkshopId(e.target.value)}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                  errors.workshopId ? 'border-red-400 bg-red-50/50' : 'border-slate-300'
                }`}
              >
                {workshops.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.onTimePercent}% on time)
                  </option>
                ))}
              </select>
              {errors.workshopId && (
                <p className="text-red-600 mt-1 text-[11px]">{errors.workshopId}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 20"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                  errors.quantity ? 'border-red-400 bg-red-50/50' : 'border-slate-300'
                }`}
              />
              {errors.quantity && (
                <p className="text-red-600 mt-1 text-[11px]">{errors.quantity}</p>
              )}
            </div>
          </div>

          {/* Material & Project / Boiler */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Material Specification <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="e.g. Mild Steel IS 2062"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                  errors.material ? 'border-red-400 bg-red-50/50' : 'border-slate-300'
                }`}
              />
              {errors.material && (
                <p className="text-red-600 mt-1 text-[11px]">{errors.material}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Project / Boiler Unit
              </label>
              <select
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="Boiler B-200">Boiler B-200</option>
                <option value="Boiler B-300">Boiler B-300</option>
                <option value="Boiler B-450">Boiler B-450</option>
                <option value="Boiler #12">Boiler #12</option>
              </select>
            </div>
          </div>

          {/* Dates: Due Date & Needed-by assembly date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Fabrication Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                  errors.dueDate ? 'border-red-400 bg-red-50/50' : 'border-slate-300'
                }`}
              />
              {errors.dueDate && (
                <p className="text-red-600 mt-1 text-[11px]">{errors.dueDate}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Needed-By Assembly Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={neededByDate}
                onChange={(e) => setNeededByDate(e.target.value)}
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                  errors.neededByDate ? 'border-red-400 bg-red-50/50' : 'border-slate-300'
                }`}
              />
              {errors.neededByDate && (
                <p className="text-red-600 mt-1 text-[11px]">{errors.neededByDate}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Job Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Critical path item for Boiler #12 fabrication schedule"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 font-semibold text-white bg-[#FF6B00] hover:bg-[#E05E00] active:scale-[0.98] rounded-lg transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Create Job</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Orange "New Job" Button trigger with Role permission check
 */
export function NewJobButton({ onClick }: { onClick: () => void }) {
  const { role } = useRole();
  const allowed = can(role, 'job.create');

  if (!allowed) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF6B00] hover:bg-[#E05E00] active:scale-98 text-white font-semibold text-xs shadow-xs transition-all tracking-wide cursor-pointer"
      title="Create new fabrication job"
    >
      <Plus className="w-4 h-4" />
      <span>New Job</span>
    </button>
  );
}
