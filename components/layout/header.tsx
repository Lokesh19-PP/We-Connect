'use client';

// ──────────────────────────────────────────────
// We Connect – Header / Top Bar
// Search, Filters, NotificationBell, DemoGuidePanel, Role Switcher
// ──────────────────────────────────────────────
import { useState } from 'react';
import { useRole } from '@/lib/role-context';
import { NotificationBell } from '@/components/notifications';
import { DemoGuidePanel } from './demo-guide-panel';
import { Search, UserCheck } from 'lucide-react';
import type { Role } from '@/types';

export function Header() {
  const { role, setRole, allRoles } = useRole();

  // Filters state (demo interactive)
  const [selectedProject, setSelectedProject] = useState('All Projects');
  const [selectedVendor, setSelectedVendor] = useState('All Vendors');
  const [selectedDateRange, setSelectedDateRange] = useState('Date range: All');
  const [selectedPartType, setSelectedPartType] = useState('All Part Types');

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Search Input & Filters */}
      <div className="flex items-center space-x-3 flex-1 max-w-4xl">
        {/* Search Box */}
        <div className="relative w-60">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs, parts, vendors..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:bg-white text-gray-900 placeholder-gray-400 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2 text-xs">
          {/* Project / Boiler filter */}
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F97316] font-medium transition-all"
          >
            <option value="All Projects">Project: All</option>
            <option value="Boiler B-200">Boiler B-200</option>
            <option value="Boiler B-300">Boiler B-300</option>
            <option value="Boiler B-450">Boiler B-450</option>
          </select>

          {/* All Vendors filter */}
          <select
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F97316] font-medium transition-all"
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
            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F97316] font-medium transition-all"
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
            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F97316] font-medium transition-all"
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

      {/* Right Controls: Demo Guide Panel, Notification Bell & Demo Role Switcher */}
      <div className="flex items-center space-x-3">
        {/* Interactive 7-Step Demo Guide */}
        <DemoGuidePanel />

        {/* Exported Notification Bell Component */}
        <NotificationBell />

        {/* Demo Role Switcher Dropdown */}
        <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg p-1 px-2.5">
          <UserCheck className="w-4 h-4 text-[#F97316]" />
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Demo Role
            </span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="bg-transparent text-xs font-bold text-gray-900 focus:outline-none cursor-pointer"
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
