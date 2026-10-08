'use client';

// ──────────────────────────────────────────────
// VendorFlow – Dashboard Summary Stat Cards (§8)
// 5 real count cards from sample data
// ──────────────────────────────────────────────
import Link from 'next/link';
import {
  getJobs,
  getAcknowledgements,
  getInvoicePayments,
} from '@/data/sample';
import {
  Briefcase,
  AlertTriangle,
  Clock,
  FileCheck,
  CreditCard,
  ChevronRight,
} from 'lucide-react';

export function SummaryCards() {
  const jobs = getJobs();
  const acks = getAcknowledgements();
  const payments = getInvoicePayments();

  // Real sample data counts
  const activeJobsCount = jobs.filter(
    (j) => j.stage !== 'Paid' && j.stage !== 'Inspected'
  ).length; // 25 total active jobs

  const atRiskCount = jobs.filter(
    (j) => j.risk === 'At risk' || j.risk === 'May miss date'
  ).length;

  const overdueCount = jobs.filter(
    (j) => j.risk === 'Overdue'
  ).length;

  const awaitingAckCount = acks.filter(
    (a) => a.acknowledgedAt === null
  ).length; // 3 awaiting ack

  const invoicesPendingCount = payments.filter(
    (p) => p.paymentStatus === 'Awaiting approval' || p.paymentStatus === 'Not ready'
  ).length; // 6 invoices pending

  const cards = [
    {
      title: 'Active Jobs',
      count: activeJobsCount,
      subtitle: 'Across 6 workshops',
      href: '/jobs',
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-100',
    },
    {
      title: 'At Risk',
      count: atRiskCount,
      subtitle: 'Predicted delay',
      href: '/jobs?filter=risk',
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 border-amber-100',
    },
    {
      title: 'Overdue',
      count: overdueCount,
      subtitle: 'Past due date',
      href: '/jobs?filter=overdue',
      icon: Clock,
      color: 'text-red-600',
      bgColor: 'bg-red-50 border-red-100',
    },
    {
      title: 'Awaiting Drawing Ack',
      count: awaitingAckCount,
      subtitle: 'Revision not confirmed',
      href: '/drawings',
      icon: FileCheck,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 border-indigo-100',
    },
    {
      title: 'Invoices Pending',
      count: invoicesPendingCount,
      subtitle: 'Awaiting approval',
      href: '/payments',
      icon: CreditCard,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 border-emerald-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.title}
            href={card.href}
            className={`p-4 rounded-xl border bg-white shadow-2xs hover:shadow-md transition-all group relative overflow-hidden`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <p className="text-2xl font-extrabold text-slate-900">
                {card.count}
              </p>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{card.subtitle}</p>
          </Link>
        );
      })}
    </div>
  );
}
