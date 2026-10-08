'use client';

// ──────────────────────────────────────────────
// VendorFlow – Admin Threshold Config Component
// Configure alert rules & threshold days
// ──────────────────────────────────────────────
import { useState } from 'react';
import {
  getThresholdConfig,
  updateThresholdConfig,
  type ThresholdConfig,
} from '@/data/settings';
import { Sliders, Save, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export function ThresholdConfigSection() {
  const [config, setConfig] = useState<ThresholdConfig>(getThresholdConfig());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateThresholdConfig(config);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="font-bold text-sm text-slate-900">
              System Rules & Threshold Thresholds
            </h2>
            <p className="text-[11px] text-slate-500">
              Set automated trigger thresholds for vendor warnings, overdue risk flags, and drawing acknowledgement alerts
            </p>
          </div>
        </div>

        {savedSuccess && (
          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 animate-in fade-in duration-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Thresholds Saved!</span>
          </span>
        )}
      </div>

      {/* Form Controls */}
      <form onSubmit={handleSave} className="p-6 space-y-6 text-xs">
        <div className="grid grid-cols-3 gap-6">
          {/* Threshold 1: No update flag */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center space-x-2 text-amber-700 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Vendor Warning Trigger</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Days without status update before flagging vendor with "No update in N days" warning chip.
            </p>
            <div className="pt-2 flex items-center space-x-2">
              <input
                type="number"
                min={1}
                max={14}
                value={config.noUpdateFlagDays}
                onChange={(e) =>
                  setConfig({ ...config, noUpdateFlagDays: Number(e.target.value) })
                }
                className="w-20 px-3 py-1.5 text-sm font-bold bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
              <span className="font-semibold text-slate-600 text-xs">Days without update</span>
            </div>
          </div>

          {/* Threshold 2: Due date risk alert */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center space-x-2 text-blue-700 font-bold">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Due Date Risk Alert</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Days before due date or needed assembly date to automatically flag job as "At Risk" or "May miss date".
            </p>
            <div className="pt-2 flex items-center space-x-2">
              <input
                type="number"
                min={1}
                max={14}
                value={config.dueDateAlertDays}
                onChange={(e) =>
                  setConfig({ ...config, dueDateAlertDays: Number(e.target.value) })
                }
                className="w-20 px-3 py-1.5 text-sm font-bold bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
              <span className="font-semibold text-slate-600 text-xs">Days before due date</span>
            </div>
          </div>

          {/* Threshold 3: Drawing ack alert */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center space-x-2 text-indigo-700 font-bold">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Drawing Ack Warning</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Days waiting for workshop drawing acknowledgement after revision approval before highlighting in red.
            </p>
            <div className="pt-2 flex items-center space-x-2">
              <input
                type="number"
                min={1}
                max={7}
                value={config.drawingAckAlertDays}
                onChange={(e) =>
                  setConfig({ ...config, drawingAckAlertDays: Number(e.target.value) })
                }
                className="w-20 px-3 py-1.5 text-sm font-bold bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
              <span className="font-semibold text-slate-600 text-xs">Working Days waiting</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end border-t border-slate-100 pt-4">
          <button
            type="submit"
            className="flex items-center space-x-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Threshold Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
