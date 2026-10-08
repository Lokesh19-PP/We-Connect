'use client';

// ──────────────────────────────────────────────
// VendorFlow – Record Delivery / GRN Dialog
// Only rendered when can(role, "delivery.record") is true.
// ──────────────────────────────────────────────
import { useState, useRef } from 'react';
import type { Job } from '@/types';
import {
  X,
  Truck,
  CalendarDays,
  Hash,
  User,
  FileText,
  Upload,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface RecordDeliveryFormData {
  deliveredDate: string;
  quantity: string;
  challanNumber: string;
  challanFileName: string;
  vehicleNumber: string;
  transporterName: string;
  receivedBy: string;
  notes: string;
}

interface RecordDeliveryDialogProps {
  job: Job;
  onClose: () => void;
  onRecord: (data: {
    jobId: string;
    workshopId: string;
    deliveredDate: string;
    quantity: number;
    challanNumber: string;
    challanFileUrl: string;
    vehicleNumber: string;
    transporterName: string;
    receivedBy: string;
    notes: string;
  }) => void;
}

export function RecordDeliveryDialog({ job, onClose, onRecord }: RecordDeliveryDialogProps) {
  const today = new Date().toISOString().split('T')[0];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<RecordDeliveryFormData>({
    deliveredDate: today,
    quantity: String(job.quantity),
    challanNumber: '',
    challanFileName: '',
    vehicleNumber: '',
    transporterName: '',
    receivedBy: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RecordDeliveryFormData, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const receivedQty = parseInt(form.quantity, 10) || 0;
  const shortage = job.quantity - receivedQty;

  function handleChange(field: keyof RecordDeliveryFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleChange('challanFileName', file.name);
    }
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof RecordDeliveryFormData, string>> = {};
    if (!form.deliveredDate) newErrors.deliveredDate = 'Delivery date is required';
    if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) <= 0)
      newErrors.quantity = 'Enter a valid quantity';
    if (!form.challanNumber.trim()) newErrors.challanNumber = 'Challan number is required';
    if (!form.receivedBy.trim()) newErrors.receivedBy = 'Received by is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    onRecord({
      jobId: job.id,
      workshopId: job.workshopId,
      deliveredDate: form.deliveredDate,
      quantity: receivedQty,
      challanNumber: form.challanNumber.trim(),
      challanFileUrl: form.challanFileName ? `/challans/${form.challanFileName}` : '',
      vehicleNumber: form.vehicleNumber.trim(),
      transporterName: form.transporterName.trim(),
      receivedBy: form.receivedBy.trim(),
      notes: form.notes.trim(),
    });

    setSubmitted(true);
    setTimeout(onClose, 1200);
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="grn-dialog-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 id="grn-dialog-title" className="text-base font-bold text-white">
                Record Delivery
              </h2>
              <p className="text-xs text-blue-100 mt-0.5">
                {job.partDisplayName} · {job.workshopName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          // Success state
          <div className="flex flex-col items-center justify-center py-12 px-6 space-y-3">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-base font-semibold text-slate-800">Delivery Recorded</p>
            <p className="text-sm text-slate-500">
              GRN saved for {job.partDisplayName}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Expected vs Received summary */}
              <div className="flex items-center space-x-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex-1 text-center">
                  <p className="text-xs text-slate-500 font-medium">Expected</p>
                  <p className="text-lg font-bold text-slate-800">{job.quantity}</p>
                  <p className="text-[10px] text-slate-400">units ordered</p>
                </div>
                <div className="h-10 w-px bg-slate-200" />
                <div className="flex-1 text-center">
                  <p className="text-xs text-slate-500 font-medium">Receiving</p>
                  <p className={`text-lg font-bold ${shortage > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                    {receivedQty || '–'}
                  </p>
                  <p className="text-[10px] text-slate-400">units received</p>
                </div>
                {shortage > 0 && receivedQty > 0 && (
                  <>
                    <div className="h-10 w-px bg-slate-200" />
                    <div className="flex-1 text-center">
                      <p className="text-xs text-amber-600 font-medium">Shortage</p>
                      <p className="text-lg font-bold text-amber-600">−{shortage}</p>
                      <p className="text-[10px] text-amber-500">units short</p>
                    </div>
                  </>
                )}
              </div>

              {/* Shortage banner */}
              {shortage > 0 && receivedQty > 0 && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>
                    Short by <strong>{shortage} units</strong>. Procurement will be notified.
                  </span>
                </div>
              )}

              {/* Row 1: Date + Quantity */}
              <div className="grid grid-cols-2 gap-3">
                <Field
                  id="grn-date"
                  label="Delivery Date"
                  required
                  icon={<CalendarDays className="w-3.5 h-3.5" />}
                  error={errors.deliveredDate}
                >
                  <input
                    id="grn-date"
                    type="date"
                    value={form.deliveredDate}
                    max={today}
                    onChange={(e) => handleChange('deliveredDate', e.target.value)}
                    className={inputCls(!!errors.deliveredDate)}
                  />
                </Field>

                <Field
                  id="grn-qty"
                  label="Quantity Received"
                  required
                  icon={<Hash className="w-3.5 h-3.5" />}
                  error={errors.quantity}
                >
                  <input
                    id="grn-qty"
                    type="number"
                    min={1}
                    placeholder={String(job.quantity)}
                    value={form.quantity}
                    onChange={(e) => handleChange('quantity', e.target.value)}
                    className={inputCls(!!errors.quantity)}
                  />
                </Field>
              </div>

              {/* Row 2: Challan Number */}
              <Field
                id="grn-challan"
                label="Challan / Delivery Note No."
                required
                icon={<Hash className="w-3.5 h-3.5" />}
                error={errors.challanNumber}
              >
                <input
                  id="grn-challan"
                  type="text"
                  placeholder="e.g. CH-2026-0280"
                  value={form.challanNumber}
                  onChange={(e) => handleChange('challanNumber', e.target.value)}
                  className={inputCls(!!errors.challanNumber)}
                />
              </Field>

              {/* Row 3: Challan Upload */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Attach Challan / Delivery Note
                  <span className="text-slate-400 font-normal ml-1">(optional)</span>
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 px-3 py-2.5 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
                >
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-500 truncate">
                    {form.challanFileName || 'Click to upload PDF / image'}
                  </span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Row 4: Dispatch details */}
              <div className="grid grid-cols-2 gap-3">
                <Field
                  id="grn-vehicle"
                  label="Vehicle Number"
                  icon={<Truck className="w-3.5 h-3.5" />}
                >
                  <input
                    id="grn-vehicle"
                    type="text"
                    placeholder="e.g. MH12 AB1234"
                    value={form.vehicleNumber}
                    onChange={(e) => handleChange('vehicleNumber', e.target.value)}
                    className={inputCls(false)}
                  />
                </Field>

                <Field
                  id="grn-transporter"
                  label="Transporter Name"
                  icon={<Truck className="w-3.5 h-3.5" />}
                >
                  <input
                    id="grn-transporter"
                    type="text"
                    placeholder="e.g. Shiv Logistics"
                    value={form.transporterName}
                    onChange={(e) => handleChange('transporterName', e.target.value)}
                    className={inputCls(false)}
                  />
                </Field>
              </div>

              {/* Row 5: Received by */}
              <Field
                id="grn-received-by"
                label="Received By"
                required
                icon={<User className="w-3.5 h-3.5" />}
                error={errors.receivedBy}
              >
                <input
                  id="grn-received-by"
                  type="text"
                  placeholder="Your name"
                  value={form.receivedBy}
                  onChange={(e) => handleChange('receivedBy', e.target.value)}
                  className={inputCls(!!errors.receivedBy)}
                />
              </Field>

              {/* Row 6: Notes */}
              <Field
                id="grn-notes"
                label="Notes"
                icon={<FileText className="w-3.5 h-3.5" />}
              >
                <textarea
                  id="grn-notes"
                  rows={2}
                  placeholder="Condition on arrival, partial shipment, etc."
                  value={form.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className={`${inputCls(false)} resize-none`}
                />
              </Field>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="grn-submit-btn"
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:translate-y-px transition-all shadow-sm"
              >
                Record GRN
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────
function inputCls(hasError: boolean) {
  return [
    'w-full px-3 py-2 text-sm text-slate-800 bg-white border rounded-lg',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    'placeholder:text-slate-300 transition-colors',
    hasError ? 'border-red-400 bg-red-50/30' : 'border-slate-200 hover:border-slate-300',
  ].join(' ');
}

function Field({
  id,
  label,
  required,
  icon,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="flex items-center space-x-1 text-xs font-medium text-slate-600 mb-1.5">
        {icon && <span className="text-slate-400">{icon}</span>}
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-[11px] text-red-500 flex items-center space-x-1">
          <AlertTriangle className="w-3 h-3" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
