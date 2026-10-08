'use client';

// ──────────────────────────────────────────────
// VendorFlow – Header / Top Bar
// Search, Filters, Notifications, Role Switcher
// ──────────────────────────────────────────────
import { useState } from 'react';
import { useRole } from '@/lib/role-context';
import { getNotificationsForRole } from '@/data/sample';
import {
  Search,
  Bell,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronDown,
} from 'lucide-react';
import type { Role } from '@/types';

export function Header() {
  const { role, setRole, allRoles } = useRole();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  // Filters state (demo interactive)
  const [selectedProject, setSelectedProject] = useState('All Projects');
  const [selectedVendor, setSelectedVendor] = useState('All Vendors');
  const [selectedDateRange, setSelectedDateRange] = useState('Date range: All');
  const [selectedPartType, setSelectedPartType] = useState('All Part Types');

  const notifications = getNotificationsForRole(role);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Search Input & Filters */}
      <div className="flex items-center space-x-3 flex-1 max-w-4xl">
        {/* Search Box */}
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search jobs, parts, vendors..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2 text-xs">
          {/* Project / Boiler filter */}
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="All Projects">Project / Boiler: All</option>
            <option value="Boiler B-200">Boiler B-200</option>
            <option value="Boiler B-300">Boiler B-300</option>
            <option value="Boiler B-450">Boiler B-450</option>
          </select>

          {/* All Vendors filter */}
          <select
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="All Vendors">All Vendors</option>
            <option value="Shree Fabricators">Shree Fabricators</option>
            <option value="Om Engg Works">Om Engg Works</option>
            <option value="Patil Steel">Patil Steel</option>
            <option value="TechFab Pune">TechFab Pune</option>
          </select>

          {/* Date Range filter */}
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="Date range: All">Date range: All</option>
            <option value="Today">Today</option>
            <option value="Next 7 Days">Next 7 Days</option>
            <option value="Next 14 Days">Next 14 Days</option>
            <option value="This Month">This Month</option>
          </select>

          {/* Part Type filter */}
          <select
            value={selectedPartType}
            onChange={(e) => setSelectedPartType(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="All Part Types">Part Type: All</option>
            <option value="Bracket">Bracket</option>
            <option value="Frame">Frame</option>
            <option value="Stand">Stand</option>
            <option value="Handle">Handle</option>
            <option value="Flange">Flange</option>
          </select>
        </div>
      </div>

      {/* Right Controls: Notifications & Demo Role Switcher */}
      <div className="flex items-center space-x-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (unreadCount > 0) setUnreadCount(0);
            }}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full relative transition-colors focus:outline-hidden"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-800">
                  Notifications ({notifications.length})
                </span>
                <span className="text-[10px] text-blue-600 font-medium">
                  {role} view
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-xs text-slate-400">
                    No new notifications
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-3 hover:bg-slate-50 text-xs">
                      <div className="flex items-start space-x-2">
                        {n.type === 'error' ? (
                          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        ) : n.type === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        ) : (
                          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-medium text-slate-800">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {n.createdAt}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Demo Role Switcher Dropdown */}
        <div className="flex items-center space-x-2 bg-slate-100 border border-slate-200 rounded-lg p-1 px-2.5">
          <UserCheck className="w-4 h-4 text-blue-600" />
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              Demo Role
            </span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              {allRoles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
