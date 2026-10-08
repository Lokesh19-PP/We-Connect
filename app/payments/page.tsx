'use client';

// ──────────────────────────────────────────────
// VendorFlow – /payments page
// Summary cards · Tabbed invoice table · Row drawer
// with 3-item readiness checklist · Finance review dialog.
//
// KEY RULE: Status is ALWAYS from getPaymentStatus().
// Never hand-type a PaymentStatus string.
// ──────────────────────────────────────────────
import { useState, useMemo } from 'react';
import { useRole } from '@/lib/role-context';
import { can } from '@/lib/permissions';
import { getPaymentStatus } from '@/lib/rules';
import {
  getJobs,
  getDeliveriesForJob,
  getInspectionsForJob,
} from '@/data/sample';
import {
  getPayments,
  approveInvoice,
  sendBackInvoice,
  markAsPaid,
} from '@/data/payments';
import { PaymentReadinessChecklist } from '@/components/payments/payment-readiness-checklist';
import { ReviewInvoiceDialog } from '@/components/payments/review-invoice-dialog';
import type { InvoicePayment, PaymentStatus, Job, Delivery, Inspection } from '@/types';
import {
  CreditCard,
  ShieldAlert,
  Clock,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Truck,
  FileText,
  ShieldCheck,
  Package,
  Search,
  Filter,
} from 'lucide-react';

// ── Enriched row type ─────────────────────────
type PaymentRow = {
  invoice: InvoicePayment;
  job: Job;
  deliveries: Delivery[];
  inspections: Inspection[];
  /** Computed via getPaymentStatus() — never hand-coded */
  status: PaymentStatus;
  hasDelivery: boolean;
  latestInspectionResult: string | null;
  hasInvoice: boolean;
  /** Days since earliest delivery date */
  daysSinceDelivery: number | null;
};

// ── Tab options ───────────────────────────────
type Tab = 'All' | 'Ready' | 'On hold for quality' | 'Awaiting approval' | 'Paid' | 'Pending';

const TABS: Tab[] = ['All', 'Pending', 'Ready', 'On hold for quality', 'Awaiting approval', 'Paid'];

export default function PaymentsPage() {
  const { role } = useRole();
  const canApprove = can(role, 'payment.approve');

  // ── Local state seeded from payments store ────
  const [payments, setPayments] = useState<InvoicePayment[]>(() => getPayments());
  const [activeTab, setActiveTab] = useState<Tab>('All');
  const [search, setSearch] = useState('');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [reviewInvoice, setReviewInvoice] = useState<InvoicePayment | null>(null);

  const jobs = useMemo(() => getJobs(), []);

  // ── Build enriched rows ────────────────────────
  const rows: PaymentRow[] = useMemo(() => {
    // Only show jobs that have an invoice record (i.e., they're in payments store)
    return payments.map((inv) => {
      const job = jobs.find((j) => j.id === inv.jobId);
      if (!job) return null;

      const deliveries = getDeliveriesForJob(inv.jobId);
      const inspections = getInspectionsForJob(inv.jobId);

      // ⚠️ Status ALWAYS from getPaymentStatus()
      const status = getPaymentStatus(deliveries, inspections, inv);

      const sortedInspections = [...inspections].sort(
        (a, b) => new Date(b.inspectedDate).getTime() - new Date(a.inspectedDate).getTime()
      );
      const latestInspectionResult = sortedInspections[0]?.result ?? null;

      const earliestDelivery = [...deliveries].sort(
        (a, b) => new Date(a.deliveredDate).getTime() - new Date(b.deliveredDate).getTime()
      )[0];
      const daysSinceDelivery = earliestDelivery
        ? Math.floor((Date.now() - new Date(earliestDelivery.deliveredDate).getTime()) / 86_400_000)
        : null;

      return {
        invoice: inv,
        job,
        deliveries,
        inspections,
        status,
        hasDelivery: deliveries.length > 0,
        latestInspectionResult,
        hasInvoice: !!inv.invoiceNumber,
        daysSinceDelivery,
      } satisfies PaymentRow;
    }).filter(Boolean) as PaymentRow[];
  }, [payments, jobs]);

  // ── Summary card numbers ───────────────────────
  // Received = invoices with Paid status (matches sample §8: 12)
  const received = rows.filter((r) => r.status === 'Paid').length;
  // On hold for quality (§8: 2)
  const onHold = rows.filter((r) => r.status === 'On hold for quality').length;
  // Awaiting approval (§8: 4)
  const awaitingApproval = rows.filter((r) => r.status === 'Awaiting approval').length;
  // Average days to pay (§8: 18)
  const avgDaysToPay = useMemo(() => {
    const paidRows = rows.filter(
      (r) => r.status === 'Paid' && r.invoice.paidDate && r.invoice.invoiceDate
    );
    if (!paidRows.length) return 0;
    const total = paidRows.reduce((sum, r) => {
      const inv = new Date(r.invoice.invoiceDate).getTime();
      const paid = new Date(r.invoice.paidDate!).getTime();
      return sum + Math.round((paid - inv) / 86_400_000);
    }, 0);
    return Math.round(total / paidRows.length);
  }, [rows]);

  // "6 Invoices Pending" count = invoices not Paid (Ready + On hold + Awaiting + Not ready)
  const pendingCount = rows.filter((r) => r.status !== 'Paid').length;

  // ── Filtering ──────────────────────────────────
  const filteredRows = useMemo(() => {
    let result = rows;

    // Tab filter
    if (activeTab === 'Pending') {
      result = result.filter((r) => r.status !== 'Paid');
    } else if (activeTab !== 'All') {
      result = result.filter((r) => r.status === activeTab);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.job.partDisplayName.toLowerCase().includes(q) ||
          r.job.workshopName.toLowerCase().includes(q) ||
          r.invoice.invoiceNumber.toLowerCase().includes(q)
      );
    }

    return result;
  }, [rows, activeTab, search]);

  // ── Mutation handlers ──────────────────────────
  function handleApprove(id: string) {
    approveInvoice(id);
    setPayments(getPayments());
  }

  function handleSendBack(id: string, _reason: string) {
    sendBackInvoice(id);
    setPayments(getPayments());
    setReviewInvoice(null);
  }

  function handleMarkPaid(id: string, paidDate: string, paidAmount: number, reference: string) {
    markAsPaid(id, paidDate, paidAmount, reference);
    setPayments(getPayments());
  }

  function toggleRow(id: string) {
    setExpandedRowId((prev) => (prev === id ? null : id));
  }

  // ── Tab counts ────────────────────────────────
  function tabCount(tab: Tab) {
    if (tab === 'All') return rows.length;
    if (tab === 'Pending') return pendingCount;
    return rows.filter((r) => r.status === tab).length;
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ──────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payments Board</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Invoice readiness, approval flow, and payment tracking
        </p>
      </div>

      {/* ── Summary Cards ────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          id="card-received"
          label="Invoices Received"
          value={received}
          sub="paid this period"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="green"
        />
        <SummaryCard
          id="card-on-hold"
          label="On Hold for Quality"
          value={onHold}
          sub="inspection pending"
          icon={<ShieldAlert className="w-5 h-5" />}
          color="amber"
          clickTab="On hold for quality"
          onTabClick={setActiveTab}
        />
        <SummaryCard
          id="card-awaiting"
          label="Awaiting Approval"
          value={awaitingApproval}
          sub="Finance review needed"
          icon={<Clock className="w-5 h-5" />}
          color="purple"
          clickTab="Awaiting approval"
          onTabClick={setActiveTab}
        />
        <SummaryCard
          id="card-avg-days"
          label="Avg. Days to Pay"
          value={avgDaysToPay}
          sub="from invoice date"
          icon={<TrendingUp className="w-5 h-5" />}
          color="blue"
        />
      </div>

      {/* ── "Pending Invoices" banner ─────────── */}
      {pendingCount > 0 && (
        <button
          id="pending-invoices-filter-btn"
          type="button"
          onClick={() => setActiveTab('Pending')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
            activeTab === 'Pending'
              ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
              : 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>
              <strong>{pendingCount} invoice{pendingCount !== 1 ? 's' : ''} pending</strong>
              {' '}— not yet paid
            </span>
          </div>
          <span className={`text-xs ${activeTab === 'Pending' ? 'text-orange-100' : 'text-orange-500'}`}>
            {activeTab === 'Pending' ? 'Showing pending ✓' : 'Click to filter →'}
          </span>
        </button>
      )}

      {/* ── Tabs ─────────────────────────────── */}
      <div className="flex items-center space-x-1 overflow-x-auto border-b border-slate-200">
        {TABS.map((tab) => {
          const count = tabCount(tab);
          return (
            <button
              key={tab}
              id={`tab-${tab.toLowerCase().replace(/\s+/g, '-')}`}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 flex items-center space-x-1.5 px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <span>{tab}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === tab ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}

        {/* Search */}
        <div className="ml-auto flex-shrink-0 relative">
          <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="payments-search"
            type="text"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7 pr-3 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
          />
        </div>
      </div>

      {/* ── Payments Table ────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {filteredRows.length === 0 ? (
          <EmptyState tab={activeTab} search={search} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Job / Part</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Vendor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Invoice Amt</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Delivery</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Inspection</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Invoice</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <PaymentTableRow
                    key={row.invoice.id}
                    row={row}
                    isExpanded={expandedRowId === row.invoice.id}
                    canApprove={canApprove}
                    onToggle={() => toggleRow(row.invoice.id)}
                    onReview={() => setReviewInvoice(row.invoice)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Review Invoice Dialog ─────────────── */}
      {reviewInvoice && (
        <ReviewInvoiceDialog
          invoice={reviewInvoice}
          canApprove={canApprove}
          onClose={() => setReviewInvoice(null)}
          onApprove={handleApprove}
          onSendBack={handleSendBack}
          onMarkPaid={handleMarkPaid}
        />
      )}
    </div>
  );
}

// ── Row component (with expandable checklist) ──

function PaymentTableRow({
  row,
  isExpanded,
  canApprove,
  onToggle,
  onReview,
}: {
  row: PaymentRow;
  isExpanded: boolean;
  canApprove: boolean;
  onToggle: () => void;
  onReview: () => void;
}) {
  const { invoice, job, deliveries, inspections, status, hasDelivery, latestInspectionResult, hasInvoice, daysSinceDelivery } = row;
  const overdueDays = daysSinceDelivery !== null && daysSinceDelivery > 30;

  return (
    <>
      <tr
        className={`border-b border-slate-50 transition-colors hover:bg-slate-50/60 cursor-pointer ${
          isExpanded ? 'bg-blue-50/30' : ''
        }`}
        onClick={onToggle}
      >
        {/* Job / Part */}
        <td className="px-4 py-3.5">
          <p className="text-xs font-semibold text-slate-800">{job.partDisplayName}</p>
          <p className="text-[11px] text-slate-400">
            #{job.id}
            {daysSinceDelivery !== null && (
              <span className={`ml-1.5 ${overdueDays ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
                · {daysSinceDelivery}d since delivery{overdueDays ? ' ⚠' : ''}
              </span>
            )}
          </p>
        </td>

        {/* Vendor */}
        <td className="px-4 py-3.5">
          <span className="text-xs text-slate-700">{job.workshopName}</span>
        </td>

        {/* Invoice Amount */}
        <td className="px-4 py-3.5">
          <span className="text-xs font-semibold text-slate-800">
            {invoice.amount > 0 ? `₹${invoice.amount.toLocaleString('en-IN')}` : <span className="text-slate-300">—</span>}
          </span>
        </td>

        {/* Delivery yes/no */}
        <td className="px-4 py-3.5 text-center">
          {hasDelivery ? (
            <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
          ) : (
            <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
          )}
        </td>

        {/* Inspection result */}
        <td className="px-4 py-3.5 text-center">
          <InspectionDot result={latestInspectionResult} />
        </td>

        {/* Invoice uploaded */}
        <td className="px-4 py-3.5 text-center">
          {hasInvoice ? (
            <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
          ) : (
            <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
          )}
        </td>

        {/* Status badge */}
        <td className="px-4 py-3.5">
          <StatusBadge status={status} />
        </td>

        {/* Action */}
        <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-end space-x-2">
            <button
              id={`review-invoice-${invoice.id}`}
              type="button"
              onClick={onReview}
              className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              Review
            </button>
            <button
              id={`expand-row-${invoice.id}`}
              type="button"
              onClick={onToggle}
              className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {isExpanded
                ? <ChevronUp className="w-3.5 h-3.5" />
                : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded readiness checklist row */}
      {isExpanded && (
        <tr className="border-b border-blue-100 bg-blue-50/20">
          <td colSpan={8} className="px-6 py-4">
            <div className="max-w-lg">
              <p className="text-xs font-semibold text-slate-600 mb-3 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Payment readiness checklist</span>
              </p>
              <PaymentReadinessChecklist
                deliveries={deliveries}
                inspections={inspections}
                invoice={invoice}
              />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── Summary Card ──────────────────────────────
function SummaryCard({
  id,
  label,
  value,
  sub,
  icon,
  color,
  clickTab,
  onTabClick,
}: {
  id: string;
  label: string;
  value: number;
  sub: string;
  icon: React.ReactNode;
  color: 'green' | 'amber' | 'purple' | 'blue';
  clickTab?: Tab;
  onTabClick?: (tab: Tab) => void;
}) {
  const colors = {
    green: { icon: 'bg-green-50 text-green-600 border-green-100', value: 'text-green-700' },
    amber: { icon: 'bg-amber-50 text-amber-600 border-amber-100', value: 'text-amber-700' },
    purple: { icon: 'bg-purple-50 text-purple-600 border-purple-100', value: 'text-purple-700' },
    blue: { icon: 'bg-blue-50 text-blue-600 border-blue-100', value: 'text-blue-700' },
  };
  const c = colors[color];
  const isClickable = !!clickTab && !!onTabClick;

  const inner = (
    <div className="flex items-center space-x-4">
      <div className={`p-2.5 rounded-xl border ${c.icon} shrink-0`}>{icon}</div>
      <div>
        <p className={`text-2xl font-bold ${c.value}`}>{value}</p>
        <p className="text-[11px] font-semibold text-slate-700 leading-tight">{label}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );

  if (isClickable) {
    return (
      <button
        id={id}
        type="button"
        onClick={() => onTabClick!(clickTab!)}
        className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-md hover:border-slate-300 transition-all text-left w-full"
      >
        {inner}
      </button>
    );
  }

  return (
    <div id={id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
      {inner}
    </div>
  );
}

// ── Small helpers ─────────────────────────────
function StatusBadge({ status }: { status: PaymentStatus }) {
  const config: Record<PaymentStatus, string> = {
    Paid: 'bg-green-100 text-green-800 border-green-200',
    Ready: 'bg-blue-100 text-blue-800 border-blue-200',
    'On hold for quality': 'bg-amber-100 text-amber-800 border-amber-200',
    'Awaiting approval': 'bg-purple-100 text-purple-800 border-purple-200',
    'Not ready': 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return (
    <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full border ${config[status]}`}>
      {status}
    </span>
  );
}

function InspectionDot({ result }: { result: string | null }) {
  if (!result || result === 'Pending') {
    return <Clock className="w-4 h-4 text-amber-400 mx-auto" title="Pending" />;
  }
  if (result === 'Accepted') {
    return <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" title="Accepted" />;
  }
  return <XCircle className="w-4 h-4 text-red-400 mx-auto" title="Rejected" />;
}

function EmptyState({ tab, search }: { tab: Tab; search: string }) {
  return (
    <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
        <Package className="w-6 h-6 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-600">
        {search ? 'No invoices match your search' : `No invoices in "${tab}"`}
      </p>
      <p className="text-xs text-slate-400 max-w-xs">
        {search ? 'Try a different part name, vendor, or invoice number.' : 'Switch tabs to see other invoices.'}
      </p>
    </div>
  );
}
