'use client';

// ──────────────────────────────────────────────
// VendorFlow – /deliveries page
// List all deliveries; Stores role can record a new GRN.
// ──────────────────────────────────────────────
import { useState, useMemo } from 'react';
import { useRole } from '@/lib/role-context';
import { can } from '@/lib/permissions';
import { getJobs, getInspectionsForJob } from '@/data/sample';
import { getDeliveries, addDelivery } from '@/data/deliveries';
import { RecordDeliveryDialog } from '@/components/payments/record-delivery-dialog';
import type { Job, Delivery } from '@/types';
import {
  Truck,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Package,
  CalendarDays,
  Hash,
  Building2,
  ChevronDown,
  ChevronUp,
  Minus,
} from 'lucide-react';

export default function DeliveriesPage() {
  const { role } = useRole();
  const canRecord = can(role, 'delivery.record');

  // ── Data (re-read every render to pick up local additions) ──
  const jobs = useMemo(() => getJobs(), []);

  // Local state for the deliveries list so new GRNs refresh the table
  const [deliveries, setDeliveries] = useState<Delivery[]>(() => getDeliveries());

  // ── Dialog state ─────────────────────────────
  const [dialogJob, setDialogJob] = useState<Job | null>(null);

  // ── Filters ──────────────────────────────────
  const [search, setSearch] = useState('');
  const [vendorFilter, setVendorFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Short' | 'Full'>('All');

  // ── Sort ─────────────────────────────────────
  const [sortField, setSortField] = useState<'date' | 'part' | 'vendor' | 'quantity'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Unique vendors from jobs for filter dropdown
  const vendorNames = useMemo(
    () => ['All', ...Array.from(new Set(jobs.map((j) => j.workshopName))).sort()],
    [jobs]
  );

  // ── Build enriched rows ───────────────────────
  type DeliveryRow = {
    delivery: Delivery;
    job: Job;
    expectedQty: number;
    shortage: number;
    inspectionResult: string | null;
  };

  const rows: DeliveryRow[] = useMemo(() => {
    return deliveries
      .map((d) => {
        const job = jobs.find((j) => j.id === d.jobId);
        if (!job) return null;
        const shortage = Math.max(0, job.quantity - d.quantity);
        const inspections = getInspectionsForJob(d.jobId);
        const sorted = [...inspections].sort(
          (a, b) => new Date(b.inspectedDate).getTime() - new Date(a.inspectedDate).getTime()
        );
        return {
          delivery: d,
          job,
          expectedQty: job.quantity,
          shortage,
          inspectionResult: sorted[0]?.result ?? null,
        };
      })
      .filter(Boolean) as DeliveryRow[];
  }, [deliveries, jobs]);

  // ── Filter + sort ─────────────────────────────
  const filteredRows = useMemo(() => {
    let result = rows;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.job.partDisplayName.toLowerCase().includes(q) ||
          r.job.workshopName.toLowerCase().includes(q) ||
          r.delivery.challanNumber.toLowerCase().includes(q)
      );
    }

    if (vendorFilter !== 'All') {
      result = result.filter((r) => r.job.workshopName === vendorFilter);
    }

    if (statusFilter === 'Short') result = result.filter((r) => r.shortage > 0);
    if (statusFilter === 'Full') result = result.filter((r) => r.shortage === 0);

    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date')
        cmp = new Date(a.delivery.deliveredDate).getTime() - new Date(b.delivery.deliveredDate).getTime();
      else if (sortField === 'part')
        cmp = a.job.partDisplayName.localeCompare(b.job.partDisplayName);
      else if (sortField === 'vendor')
        cmp = a.job.workshopName.localeCompare(b.job.workshopName);
      else if (sortField === 'quantity')
        cmp = a.delivery.quantity - b.delivery.quantity;
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [rows, search, vendorFilter, statusFilter, sortField, sortDir]);

  // ── Summary counts ────────────────────────────
  const totalDeliveries = rows.length;
  const shortageCount = rows.filter((r) => r.shortage > 0).length;
  const pendingInspection = rows.filter((r) => !r.inspectionResult || r.inspectionResult === 'Pending').length;
  const accepted = rows.filter((r) => r.inspectionResult === 'Accepted').length;

  // ── Handlers ──────────────────────────────────
  function handleRecord(data: Parameters<typeof addDelivery>[0]) {
    const newDelivery = addDelivery(data);
    setDeliveries((prev) => [newDelivery, ...prev]);
    setDialogJob(null);
  }

  function toggleSort(field: typeof sortField) {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  }

  function SortIcon({ field }: { field: typeof sortField }) {
    if (sortField !== field) return <Minus className="w-3 h-3 text-slate-300" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-blue-600" />
      : <ChevronDown className="w-3 h-3 text-blue-600" />;
  }

  // Jobs that have NOT yet been delivered (for the "Record" action)
  const deliveredJobIds = new Set(deliveries.map((d) => d.jobId));
  const deliverableJobs = jobs.filter(
    (j) => ['Ready', 'Delivered', 'Inspected'].includes(j.stage) || !deliveredJobIds.has(j.id)
  );

  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Deliveries &amp; Goods Receipt
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track incoming parts, record GRNs, and flag shortages
          </p>
        </div>

        {canRecord && (
          <button
            id="record-delivery-btn"
            type="button"
            onClick={() => setDialogJob(deliverableJobs[0] ?? jobs[0])}
            className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:translate-y-px transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Record Delivery</span>
          </button>
        )}
      </div>

      {/* ── Summary Cards ────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Received"
          value={totalDeliveries}
          icon={<Truck className="w-5 h-5" />}
          color="blue"
        />
        <SummaryCard
          label="Accepted"
          value={accepted}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="green"
        />
        <SummaryCard
          label="Awaiting Inspection"
          value={pendingInspection}
          icon={<Clock className="w-5 h-5" />}
          color="amber"
        />
        <SummaryCard
          label="Short Deliveries"
          value={shortageCount}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="red"
        />
      </div>

      {/* ── Filters ──────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="delivery-search"
            type="text"
            placeholder="Search part, vendor, challan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white placeholder:text-slate-400"
          />
        </div>

        {/* Vendor filter */}
        <select
          id="delivery-vendor-filter"
          value={vendorFilter}
          onChange={(e) => setVendorFilter(e.target.value)}
          className="py-1.5 px-2.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {vendorNames.map((v) => (
            <option key={v} value={v}>
              {v === 'All' ? 'All Vendors' : v}
            </option>
          ))}
        </select>

        {/* Status filter */}
        <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1">
          {(['All', 'Full', 'Short'] as const).map((s) => (
            <button
              key={s}
              id={`delivery-filter-${s.toLowerCase()}`}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                statusFilter === s
                  ? 'bg-white shadow-xs text-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <span className="ml-auto text-xs text-slate-400 font-medium">
          {filteredRows.length} of {totalDeliveries} deliveries
        </span>
      </div>

      {/* ── Table ────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {filteredRows.length === 0 ? (
          <EmptyState search={search} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <Th onClick={() => toggleSort('date')} label="Delivery Date" sort={<SortIcon field="date" />} />
                  <Th onClick={() => toggleSort('part')} label="Part / Job" sort={<SortIcon field="part" />} />
                  <Th onClick={() => toggleSort('vendor')} label="Vendor" sort={<SortIcon field="vendor" />} />
                  <Th
                    onClick={() => toggleSort('quantity')}
                    label="Expected / Received"
                    sort={<SortIcon field="quantity" />}
                  />
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Challan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Inspection
                  </th>
                  {canRecord && (
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredRows.map((row) => (
                  <DeliveryRow
                    key={row.delivery.id}
                    row={row}
                    canRecord={canRecord}
                    jobs={deliverableJobs}
                    onRecord={setDialogJob}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Record Dialog ────────────────────── */}
      {dialogJob && canRecord && (
        <RecordDeliveryDialog
          job={dialogJob}
          onClose={() => setDialogJob(null)}
          onRecord={handleRecord}
        />
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function DeliveryRow({
  row,
  canRecord,
  jobs,
  onRecord,
}: {
  row: {
    delivery: Delivery;
    job: Job;
    expectedQty: number;
    shortage: number;
    inspectionResult: string | null;
  };
  canRecord: boolean;
  jobs: Job[];
  onRecord: (job: Job) => void;
}) {
  const { delivery, job, expectedQty, shortage, inspectionResult } = row;
  const hasShortage = shortage > 0;

  return (
    <tr className="hover:bg-slate-50/60 transition-colors group">
      {/* Date */}
      <td className="px-4 py-3.5">
        <div className="flex items-center space-x-2">
          <CalendarDays className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="text-xs text-slate-700 font-medium">
            {formatDate(delivery.deliveredDate)}
          </span>
        </div>
      </td>

      {/* Part / Job */}
      <td className="px-4 py-3.5">
        <p className="text-xs font-semibold text-slate-800">{job.partDisplayName}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">#{job.id}</p>
      </td>

      {/* Vendor */}
      <td className="px-4 py-3.5">
        <div className="flex items-center space-x-1.5">
          <Building2 className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="text-xs text-slate-700">{job.workshopName}</span>
        </div>
      </td>

      {/* Expected vs Received */}
      <td className="px-4 py-3.5">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500">{expectedQty}</span>
          <span className="text-slate-300">→</span>
          <span className={`text-xs font-bold ${hasShortage ? 'text-amber-600' : 'text-green-600'}`}>
            {delivery.quantity}
          </span>
          {hasShortage && (
            <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 bg-amber-50 border border-amber-200 rounded text-[10px] font-semibold text-amber-700">
              <AlertTriangle className="w-2.5 h-2.5" />
              <span>−{shortage}</span>
            </span>
          )}
        </div>
      </td>

      {/* Challan */}
      <td className="px-4 py-3.5">
        <div className="flex items-center space-x-1.5">
          <Hash className="w-3 h-3 text-slate-300 shrink-0" />
          <span className="text-xs text-slate-600 font-mono">{delivery.challanNumber}</span>
        </div>
        {delivery.vehicleNumber && (
          <p className="text-[10px] text-slate-400 mt-0.5">
            🚚 {delivery.vehicleNumber}
            {delivery.transporterName ? ` · ${delivery.transporterName}` : ''}
          </p>
        )}
      </td>

      {/* Inspection badge */}
      <td className="px-4 py-3.5">
        <InspectionBadge result={inspectionResult} />
      </td>

      {/* Action */}
      {canRecord && (
        <td className="px-4 py-3.5 text-right">
          <button
            type="button"
            id={`record-another-${delivery.id}`}
            onClick={() => onRecord(job)}
            className="opacity-0 group-hover:opacity-100 text-[11px] font-medium text-blue-600 hover:text-blue-800 transition-all px-2 py-1 rounded hover:bg-blue-50"
          >
            + Add
          </button>
        </td>
      )}
    </tr>
  );
}

function InspectionBadge({ result }: { result: string | null }) {
  if (!result || result === 'Pending') {
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-slate-100 rounded-full text-[10px] font-medium text-slate-500">
        <Clock className="w-2.5 h-2.5" />
        <span>Pending</span>
      </span>
    );
  }
  if (result === 'Accepted') {
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-green-50 border border-green-200 rounded-full text-[10px] font-medium text-green-700">
        <CheckCircle2 className="w-2.5 h-2.5" />
        <span>Accepted</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-red-50 border border-red-200 rounded-full text-[10px] font-medium text-red-700">
      <XCircle className="w-2.5 h-2.5" />
      <span>Rejected</span>
    </span>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'amber' | 'red';
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    red: 'bg-red-50 text-red-600 border-red-100',
  };
  const valueColors = {
    blue: 'text-blue-700',
    green: 'text-green-700',
    amber: 'text-amber-700',
    red: 'text-red-700',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center space-x-4">
      <div className={`p-2.5 rounded-xl border ${colors[color]}`}>{icon}</div>
      <div>
        <p className={`text-2xl font-bold ${valueColors[color]}`}>{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function Th({
  label,
  sort,
  onClick,
}: {
  label: string;
  sort: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-700 transition-colors select-none"
      onClick={onClick}
    >
      <span className="inline-flex items-center space-x-1">
        <span>{label}</span>
        {sort}
      </span>
    </th>
  );
}

function EmptyState({ search }: { search: string }) {
  return (
    <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
        <Package className="w-6 h-6 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-600">
        {search ? 'No deliveries match your search' : 'No deliveries recorded yet'}
      </p>
      <p className="text-xs text-slate-400 max-w-xs">
        {search
          ? 'Try a different part name, vendor, or challan number.'
          : 'Stores will record GRNs here when parts arrive from vendors.'}
      </p>
    </div>
  );
}

// ── Helpers ───────────────────────────────────
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
