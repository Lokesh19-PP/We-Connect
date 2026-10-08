'use client';

// ──────────────────────────────────────────────
// VendorFlow – Dark Navy Sidebar
// Uses can() from lib/permissions to hide links
// ──────────────────────────────────────────────
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from '@/lib/role-context';
import { can, type Action } from '@/lib/permissions';
import { getJobs } from '@/data/sample';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  FileCheck,
  Building2,
  ShieldCheck,
  Truck,
  CreditCard,
  BarChart3,
  Settings,
  Factory,
} from 'lucide-react';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  action: Action;
  badge?: number;
}

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useRole();
  const jobsCount = getJobs().length;

  const sidebarItems: SidebarItem[] = [
    {
      label: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      action: 'job.view',
    },
    {
      label: 'RFQs',
      href: '/rfqs',
      icon: FileText,
      action: 'job.create',
    },
    {
      label: 'Jobs',
      href: '/jobs',
      icon: Briefcase,
      action: 'job.view',
      badge: jobsCount,
    },
    {
      label: 'Drawings',
      href: '/drawings',
      icon: FileCheck,
      action: 'drawing.upload',
    },
    {
      label: 'Vendors',
      href: '/vendors',
      icon: Building2,
      action: 'vendor.view',
    },
    {
      label: 'Quality',
      href: '/quality',
      icon: ShieldCheck,
      action: 'inspection.view',
    },
    {
      label: 'Deliveries',
      href: '/deliveries',
      icon: Truck,
      action: 'delivery.view',
    },
    {
      label: 'Payments',
      href: '/payments',
      icon: CreditCard,
      action: 'payment.view',
    },
    {
      label: 'Reports',
      href: '/reports',
      icon: BarChart3,
      action: 'report.view',
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings,
      action: 'settings.manage',
    },
  ];

  // Helper to determine if a route is viewable by current role
  const isAllowed = (item: SidebarItem) => {
    if (item.href === '/drawings') {
      // Drawings viewable by Engineering, Admin, Procurement, Production, Quality
      return (
        can(role, 'drawing.upload') ||
        can(role, 'drawing.approve') ||
        role === 'Procurement' ||
        role === 'Production' ||
        role === 'Quality'
      );
    }
    return can(role, item.action);
  };

  const visibleItems = sidebarItems.filter(isAllowed);

  return (
    <aside className="w-64 bg-[#0B132B] text-slate-200 flex flex-col justify-between shrink-0 min-h-screen border-r border-slate-800">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <Factory className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-wide">
              VendorFlow
            </h1>
            <p className="text-xs text-slate-400">Subcontracting Portal</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-blue-800 text-white'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 bg-[#070D1E]/60 text-[11px] text-slate-400 leading-relaxed">
        <p className="font-semibold text-slate-300">Deccan Boilers</p>
        <p>Pune manufacturing unit / Demo workspace</p>
      </div>
    </aside>
  );
}
