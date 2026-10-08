'use client';

// ──────────────────────────────────────────────
// VendorFlow – Phone-Style Layout for Workshop Roles
// Used when active role is Workshop Owner or Workshop Staff (§4)
// ──────────────────────────────────────────────
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from '@/lib/role-context';
import {
  Smartphone,
  Briefcase,
  CreditCard,
  HelpCircle,
  UserCheck,
  Wifi,
  BatteryCharging,
} from 'lucide-react';
import type { Role } from '@/types';

export function WorkshopShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { role, setRole, allRoles } = useRole();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-6 px-4">
      {/* Top Demo Bar for Role Switching */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-3 mb-6 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-2">
          <Smartphone className="w-5 h-5 text-amber-400" />
          <div>
            <h2 className="text-xs font-bold text-white">
              Workshop Mobile Mode
            </h2>
            <p className="text-[10px] text-slate-400">
              Simulating 360px phone layout
            </p>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1">
          <UserCheck className="w-4 h-4 text-blue-400" />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="bg-transparent text-xs font-bold text-white focus:outline-hidden cursor-pointer"
          >
            {allRoles.map((r) => (
              <option key={r} value={r} className="bg-slate-900 text-white">
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Phone Viewport Container (360px / max-w-sm) */}
      <div className="w-full max-w-[390px] bg-slate-900 border-4 border-slate-800 rounded-[36px] shadow-2xl flex flex-col overflow-hidden min-h-[720px] relative">
        {/* Mobile Header / Status Bar */}
        <div className="bg-slate-950 px-5 pt-3 pb-2 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] font-bold tracking-wide text-slate-200">
              Shree Fabricators
            </span>
          </div>
          <div className="flex items-center space-x-2 text-slate-400 text-[10px]">
            <Wifi className="w-3 h-3" />
            <BatteryCharging className="w-3.5 h-3.5" />
            <span>100%</span>
          </div>
        </div>

        {/* Active Role Indicator Strip */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 flex items-center justify-between text-xs">
          <span className="text-amber-400 font-semibold text-[11px]">
            Logged in as: {role}
          </span>
          <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
            Workshop C
          </span>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 bg-slate-900 text-slate-100 pb-20">
          {children}
        </main>

        {/* Bottom Phone Navigation Bar */}
        <nav className="absolute bottom-0 left-0 right-0 h-16 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-around px-2 z-20">
          <Link
            href="/workshop"
            className={`flex flex-col items-center justify-center space-y-1 py-1 px-4 rounded-xl text-xs font-semibold ${
              pathname.startsWith('/workshop')
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-5 h-5" />
            <span className="text-[10px]">My Jobs</span>
          </Link>

          <Link
            href="/payments"
            className={`flex flex-col items-center justify-center space-y-1 py-1 px-4 rounded-xl text-xs font-semibold ${
              pathname.startsWith('/payments')
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-[10px]">Payments</span>
          </Link>

          <Link
            href="/workshop"
            className="flex flex-col items-center justify-center space-y-1 py-1 px-4 rounded-xl text-xs text-slate-400 hover:text-slate-200"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="text-[10px]">Help</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
