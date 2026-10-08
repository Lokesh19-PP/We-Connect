'use client';

// ──────────────────────────────────────────────
// We Connect – Dashboard Summary Stat Cards (§8)
// Interactive filters, top accent colors, and term tooltips
// ──────────────────────────────────────────────
import { useState } from 'react';
import Link from 'next/link';
import {
  getJobs,
  getAcknowledgements,
  getInvoicePayments,
  getParts,
} from '@/data/sample';
import {
  Briefcase,
  AlertTriangle,
  Clock,
  FileCheck,
  CreditCard,
  ChevronRight,
  Info,
} from 'lucide-react';

interface SummaryCardsProps {
  selectedProject?: string;
  selectedVendor?: string;
  selectedPartType?: string;
  selectedDateRange?: string;
}

export function SummaryCards({
  selectedProject = 'All Projects',
  selectedVendor = 'All Vendors',
  selectedPartType = 'All Part Types',
}: SummaryCardsProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const allJobs = getJobs();
  const allParts = getParts();
  const acks = getAcknowledgements();
  const payments = getInvoicePayments();

  // Filter jobs dynamically
  const filteredJobs = allJobs.filter((job) => {
    if (
      selectedVendor !== 'All Vendors' &&
      !job.workshopName.toLowerCase().includes(selectedVendor.toLowerCase())
    ) {
      return false;
    }

    if (selectedPartType !== 'All Part Types') {
      const part = allParts.find((p) => p.id === job.partId);
      if (part && !part.name.toLowerCase().includes(selectedPartType.toLowerCase())) {
        return false;
      }
    }

    if (selectedProject !== 'All Projects') {
      if (
        !job.notes.toLowerCase().includes(selectedProject.toLowerCase()) &&
        !job.partDisplayName.toLowerCase().includes(selectedProject.toLowerCase())
      ) {
        // match project if present
      }
    }

    return true;
  });

  const activeJobsCount = filteredJobs.filter(
    (j) => j.stage !== 'Paid' && j.stage !== 'Inspected'
  ).length;

  const atRiskCount = filteredJobs.filter(
    (j) => j.risk === 'At risk' || j.risk === 'May miss date'
  ).length;

  const overdueCount = filteredJobs.filter(
    (j) => j.risk === 'Overdue'
  ).length;

  const awaitingAckCount = acks.filter(
    (a) => a.acknowledgedAt === null
  ).length;

  const invoicesPendingCount = payments.filter(
    (p) => p.paymentStatus === 'Awaiting approval' || p.paymentStatus === 'Not ready'
  ).length;

  const cards = [
    {
      id: 'active',
      title: 'Active Jobs',
      count: activeJobsCount,
      subtitle: 'Across workshops',
      tooltip: 'Subcontracting jobs currently in progress or awaiting delivery',
      href: '/jobs',
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      topAccent: 'border-t-4 border-t-blue-500',
    },
    {
      id: 'at-risk',
      title: 'At Risk',
      count: atRiskCount,
      subtitle: 'Predicted to miss date',
      tooltip: 'At Risk = predicted to miss due date or assembly need',
      href: '/jobs?filter=risk',
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      topAccent: 'border-t-4 border-t-amber-500',
    },
    {
      id: 'overdue',
      title: 'Overdue',
      count: overdueCount,
      subtitle: 'Past due date',
      tooltip: 'Overdue = past due date and not yet delivered',
      href: '/jobs?filter=overdue',
      icon: Clock,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      topAccent: 'border-t-4 border-t-red-500',
    },
    {
      id: 'ack',
      title: 'Awaiting Drawing Ack',
      count: awaitingAckCount,
      subtitle: 'Revision not confirmed',
      tooltip: 'Approved drawing revision sent to workshop but not yet confirmed',
      href: '/drawings',
      icon: FileCheck,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      topAccent: 'border-t-4 border-t-indigo-500',
    },
    {
      id: 'pending',
      title: 'Invoices Pending',
      count: invoicesPendingCount,
      subtitle: 'Awaiting approval',
      tooltip: 'Invoices uploaded awaiting finance approval or hold resolution',
      href: '/payments',
      icon: CreditCard,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      topAccent: 'border-t-4 border-t-emerald-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`p-4 rounded-[10px] border border-gray-200 bg-white shadow-xs hover:shadow-md transition-all group relative ${card.topAccent}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-semibold text-gray-500">
                  {card.title}
                </span>

                <div
                  className="relative cursor-help"
                  onMouseEnter={() => setActiveTooltip(card.id)}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <Info className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 transition-colors" />

                  {activeTooltip === card.id && (
                    <div className="absolute left-0 bottom-6 w-48 bg-gray-900 text-white text-[11px] p-2.5 rounded-lg shadow-xl z-50 font-normal leading-tight pointer-events-none animate-in fade-in duration-150">
                      {card.tooltip}
                    </div>
                  )}
                </div>
              </div>

              <div className={`p-1.5 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>

            <Link href={card.href} className="block">
              <div className="mt-3 flex items-baseline justify-between">
                <p className="text-[24px] font-semibold text-gray-900 tracking-tight">
                  {card.count}
                </p>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#F97316] transition-colors" />
              </div>
              <p className="text-[12px] text-gray-500 mt-1">{card.subtitle}</p>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
