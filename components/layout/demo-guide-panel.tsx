'use client';

// ──────────────────────────────────────────────
// We Connect – Interactive Demo Guide Side Panel (§8)
// 7-Step end-to-end demo flow from docs/team/00_TEAM_PLAN.md
// ──────────────────────────────────────────────
import { useState } from 'react';
import { useRole } from '@/lib/role-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ToastContainer, type ToastMessage } from '@/components/ui/toast';
import {
  HelpCircle,
  X,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  FilePlus,
  FileCheck,
  Smartphone,
  Truck,
  ShieldCheck,
  CreditCard,
  LayoutDashboard,
} from 'lucide-react';
import type { Role } from '@/types';

interface DemoStep {
  step: number;
  title: string;
  role: Role;
  route: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function DemoGuidePanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const { setRole } = useRole();
  const router = useRouter();

  const demoSteps: DemoStep[] = [
    {
      step: 1,
      title: 'Create Job for Bracket B-204',
      role: 'Procurement',
      route: '/jobs?new=1',
      description: 'Procurement creates a new subcontracting job for Bracket B-204.',
      icon: FilePlus,
    },
    {
      step: 2,
      title: 'Approve Drawing Revision Rev B',
      role: 'Engineering',
      route: '/drawings',
      description: 'Engineering approves Rev B; Workshop C has not acknowledged yet.',
      icon: FileCheck,
    },
    {
      step: 3,
      title: 'Workshop Staff Confirms Drawing & Starts',
      role: 'Workshop Staff',
      route: '/workshop',
      description: 'Workshop staff opens 360px mobile view, confirms drawing, and posts status Started.',
      icon: Smartphone,
    },
    {
      step: 4,
      title: 'Stores Records Delivery',
      role: 'Stores',
      route: '/deliveries',
      description: 'Stores receives physical batch at factory gate and records delivery receipt.',
      icon: Truck,
    },
    {
      step: 5,
      title: 'Quality Inspection & Re-inspection',
      role: 'Quality',
      route: '/quality',
      description: 'Quality inspector logs first-pass inspection, handles rework, and accepts batch.',
      icon: ShieldCheck,
    },
    {
      step: 6,
      title: 'Finance Invoice Approval & Payment',
      role: 'Finance',
      route: '/payments',
      description: 'Workshop uploads invoice; status shows On Hold, then Ready; Finance marks Paid.',
      icon: CreditCard,
    },
    {
      step: 7,
      title: 'Executive Dashboard & Reports',
      role: 'Management',
      route: '/',
      description: 'Management reviews updated assembly calendar, shortfall counts, and KPI reports.',
      icon: LayoutDashboard,
    },
  ];

  const handleStepClick = (stepItem: DemoStep) => {
    setRole(stepItem.role);
    router.push(stepItem.route);
    addToast('info', `Switched to ${stepItem.role}`, `Navigated to ${stepItem.route}`);
  };

  const handleResetData = () => {
    addToast('success', 'Demo Data Reset', 'Sample data restored to initial state.');
  };

  const addToast = (
    type: 'success' | 'warning' | 'error' | 'info',
    title: string,
    message?: string
  ) => {
    const newToast: ToastMessage = {
      id: Date.now().toString(),
      type,
      title,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Demo Guide Trigger Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-1.5 border-[#F97316]/40 text-[#F97316] hover:bg-[#F97316]/10 font-semibold"
      >
        <HelpCircle className="w-4 h-4 text-[#F97316]" />
        <span>Demo Guide</span>
      </Button>

      {/* Slide-over Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          {/* Side Panel */}
          <div
            className="w-full max-w-md bg-white h-full shadow-2xl border-l border-gray-200 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-250"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel Header */}
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/80">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-[#F97316] rounded-lg text-white">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">7-Step Interactive Demo Guide</h2>
                  <p className="text-xs text-gray-500">End-to-end subcontracting workflow</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 transition-colors"
                aria-label="Close demo guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Steps List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {demoSteps.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.step}
                    onClick={() => handleStepClick(s)}
                    className="p-3.5 border border-gray-200 rounded-[10px] bg-white hover:border-[#F97316] hover:bg-orange-50/30 transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-gray-100 group-hover:bg-[#F97316]/10 rounded-lg text-[#F97316] shrink-0 mt-0.5">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-[#F97316]">Step {s.step}</span>
                            <span className="text-[10px] px-2 py-0.5 bg-gray-100 font-semibold text-gray-700 rounded-full">
                              Role: {s.role}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-gray-900 mt-1 leading-snug">
                            {s.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            {s.description}
                          </p>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#F97316] shrink-0 mt-2 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Panel Footer */}
            <div className="p-5 border-t border-gray-200 bg-gray-50/80 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetData}
                className="gap-1.5 text-xs text-gray-700 font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
                Reset Demo Data
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Close Guide
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
