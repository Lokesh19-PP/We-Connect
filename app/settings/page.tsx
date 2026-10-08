'use client';

// ──────────────────────────────────────────────
// VendorFlow – System Settings & Admin (/settings)
// Owned by Soham (§8)
// ──────────────────────────────────────────────
import { useState } from 'react';
import { useRole } from '@/lib/role-context';
import { can } from '@/lib/permissions';
import { UserManagement } from '@/components/settings/user-management';
import { ThresholdConfigSection } from '@/components/settings/threshold-config';
import { PermissionMatrix } from '@/components/settings/permission-matrix';
import { Settings, Users, Sliders, ShieldCheck, Lock } from 'lucide-react';

export default function SettingsPage() {
  const { role } = useRole();
  const canManageSettings = can(role, 'settings.manage');

  const [activeTab, setActiveTab] = useState<'users' | 'rules' | 'matrix'>('users');

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Settings className="w-7 h-7 text-blue-600" />
            <span>Admin Settings & System Rules</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage user accounts, assign roles and workshops, configure automated thresholds, and inspect permission matrix
          </p>
        </div>
      </div>

      {/* Non-Admin Notice Banner */}
      {!canManageSettings && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center space-x-3 text-amber-800 text-xs">
          <Lock className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <span className="font-bold">Read-Only Mode:</span> You are currently viewing as{' '}
            <span className="font-semibold">{role}</span>. User creation and threshold modifications are restricted to Admin. Permission matrix remains visible below.
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="p-1.5 bg-slate-200/60 rounded-xl flex items-center space-x-2 max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-white text-blue-600 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Accounts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rules')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'rules'
              ? 'bg-white text-blue-600 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Rule Thresholds</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('matrix')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'matrix'
              ? 'bg-white text-blue-600 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Permissions</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'users' && <UserManagement />}
      {activeTab === 'rules' && <ThresholdConfigSection />}
      {activeTab === 'matrix' && <PermissionMatrix />}
    </div>
  );
}
