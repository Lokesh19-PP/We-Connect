'use client';

// ──────────────────────────────────────────────
// VendorFlow – Root App Shell Container
// Connects RoleProvider, Sidebar, Header, WorkshopShell
// ──────────────────────────────────────────────
import { Suspense } from 'react';
import { useRole } from '@/lib/role-context';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { WorkshopShell } from './workshop-shell';

function MainAppLayout({ children }: { children: React.ReactNode }) {
  const { isWorkshopRole } = useRole();

  if (isWorkshopRole) {
    return <WorkshopShell>{children}</WorkshopShell>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Dark Navy Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar / Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <MainAppLayout>{children}</MainAppLayout>
    </Suspense>
  );
}

