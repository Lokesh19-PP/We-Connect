'use client';

// ──────────────────────────────────────────────
// VendorFlow – Read-Only Role Permission Matrix
// Dynamically built from can() in @/lib/permissions (§4)
// ──────────────────────────────────────────────
import { can, type Action } from '@/lib/permissions';
import { ALL_ROLES } from '@/lib/role-context';
import type { Role } from '@/types';
import { ShieldCheck, Check, Minus } from 'lucide-react';

interface ActionMeta {
  key: Action;
  label: string;
  category: string;
}

const ALL_ACTIONS: ActionMeta[] = [
  // Jobs
  { key: 'job.create', label: 'Create Jobs', category: 'Jobs' },
  { key: 'job.view', label: 'View Jobs List & Detail', category: 'Jobs' },
  { key: 'job.edit', label: 'Edit Job Details', category: 'Jobs' },

  // Drawings
  { key: 'drawing.upload', label: 'Upload Drawing Revision', category: 'Drawings' },
  { key: 'drawing.approve', label: 'Approve Revision', category: 'Drawings' },
  { key: 'drawing.acknowledge', label: 'Acknowledge Revision', category: 'Drawings' },

  // Inspections
  { key: 'inspection.record', label: 'Record Quality Inspection', category: 'Quality' },
  { key: 'inspection.view', label: 'View Quality Queue & Reports', category: 'Quality' },

  // Deliveries
  { key: 'delivery.record', label: 'Record Goods Receipt (GRN)', category: 'Deliveries' },
  { key: 'delivery.view', label: 'View Deliveries List', category: 'Deliveries' },

  // Payments
  { key: 'payment.upload_invoice', label: 'Upload Invoice', category: 'Payments' },
  { key: 'payment.approve', label: 'Approve Payment / Mark Paid', category: 'Payments' },
  { key: 'payment.view', label: 'View Payments Board', category: 'Payments' },

  // Vendors
  { key: 'vendor.manage', label: 'Add / Edit / Deactivate Vendors', category: 'Vendors' },
  { key: 'vendor.view', label: 'View Vendor Directory', category: 'Vendors' },

  // Workshop & Reports & System
  { key: 'status.update', label: 'Post Workshop Status Update', category: 'Workshop' },
  { key: 'report.view', label: 'View Analytics & Reports', category: 'Reports' },
  { key: 'settings.manage', label: 'Manage Settings & Thresholds', category: 'Admin' },
  { key: 'user.manage', label: 'Manage User Accounts', category: 'Admin' },
  { key: 'reminder.send', label: 'Send Vendor Reminders', category: 'Operations' },
  { key: 'assembly.view', label: 'View Assembly Calendar', category: 'Operations' },
];

export function PermissionMatrix() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden space-y-4">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <div>
            <h2 className="font-bold text-sm text-slate-900">
              Role Permission Matrix (Read-Only)
            </h2>
            <p className="text-[11px] text-slate-500">
              Enforced dynamically across all features via <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[10px]">can(role, action)</code>
            </p>
          </div>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto px-5 pb-5">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px] sticky top-0">
            <tr>
              <th className="p-3 border-r border-slate-800 min-w-[200px]">Permission Action</th>
              {ALL_ROLES.map((r) => (
                <th key={r} className="p-2 text-center border-r border-slate-800 last:border-r-0 min-w-[90px]">
                  <span className="block text-[10px] font-extrabold whitespace-nowrap">{r}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ALL_ACTIONS.map((actionItem) => (
              <tr key={actionItem.key} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3 border-r border-slate-100 font-semibold text-slate-800">
                  <div>{actionItem.label}</div>
                  <div className="text-[10px] text-slate-400 font-mono font-normal">
                    {actionItem.key}
                  </div>
                </td>
                {ALL_ROLES.map((r) => {
                  const allowed = can(r, actionItem.key);
                  return (
                    <td
                      key={r}
                      className={`p-2 text-center border-r border-slate-100 last:border-r-0 ${
                        allowed ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      {allowed ? (
                        <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center w-5 h-5 text-slate-300">
                          <Minus className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
