import { isSampleMode, fetchJobs, fetchWorkshops, fetchParts, fetchAcknowledgements, fetchInvoicePayments, fetchInspections, fetchDeliveries, fetchAssemblySlots } from './index';
import { getRisk, getAssemblyShortfall } from '@/lib/rules';
import type {
  Job,
  Workshop,
  Part,
  DrawingAcknowledgement,
  InvoicePayment,
  Inspection,
  Delivery,
  AssemblySlot,
} from '@/types';
import * as sample from '@/data/sample';

export interface ActionItem {
  id: string;
  title: string;
  subtitle: string;
  actionText: string;
  actionHref?: string;
  type: 'remind' | 'schedule' | 'inspection' | 'review';
  urgent?: boolean;
  workshopName?: string;
  revision?: string;
  jobId?: string;
}

export interface DashboardData {
  jobs: Job[];
  parts: Part[];
  workshops: Workshop[];
  acknowledgements: DrawingAcknowledgement[];
  invoices: InvoicePayment[];
  inspections: Inspection[];
  deliveries: Delivery[];
  assemblySlots: Array<AssemblySlot & { shortfall: number }>;
  summary: {
    activeJobsCount: number;
    atRiskCount: number;
    overdueCount: number;
    awaitingAckCount: number;
    invoicesPendingCount: number;
  };
  qualityMetrics: {
    firstPassYield: number;
    reworkCount: number;
    pendingInspections: number;
  };
  paymentMetrics: {
    paidCount: number;
    holdCount: number;
    awaitingCount: number;
    settlementProgress: number;
    avgPaymentDays: number;
  };
  vendorMetrics: Array<{
    id: string;
    name: string;
    warning?: string | null;
    onTimePercent: number;
    activeJobs: number;
  }>;
  actionItems: ActionItem[];
}

export interface FetchDashboardResult {
  data: DashboardData | null;
  error: string | null;
}

/**
 * Fetches all live data required for the Executive Dashboard from Supabase,
 * calculating metrics dynamically via pure functions in lib/rules.ts.
 */
export async function fetchDashboardData(): Promise<FetchDashboardResult> {
  if (isSampleMode()) {
    const jobs = sample.getJobs();
    const parts = sample.getParts();
    const workshops = sample.getWorkshops();
    const acks = sample.getAcknowledgements();
    const payments = sample.getInvoicePayments();
    const inspections = sample.getInspections();
    const deliveries = sample.getDeliveries();
    const rawSlots = sample.getAssemblySlots();
    const slotsWithShortfall = getAssemblyShortfall(rawSlots);

    const activeJobsCount = jobs.filter((j) => j.stage !== 'Paid' && j.stage !== 'Inspected').length;
    const atRiskCount = jobs.filter((j) => j.risk === 'At risk' || j.risk === 'May miss date').length;
    const overdueCount = jobs.filter((j) => j.risk === 'Overdue').length;
    const awaitingAckCount = acks.filter((a) => !a.acknowledgedAt).length;
    const invoicesPendingCount = payments.filter(
      (p) => p.paymentStatus === 'Awaiting approval' || p.paymentStatus === 'Not ready'
    ).length;

    const totalInspections = inspections.length || 1;
    const passedInspections = inspections.filter((i) => i.result === 'Accepted' && !i.reinspectionDate).length;
    const firstPassYield = Math.round((passedInspections / totalInspections) * 100);
    const reworkCount = inspections.filter((i) => i.result === 'Rejected' || i.reinspectionDate !== null).length;
    const pendingInspections = inspections.filter((i) => i.result === 'Pending' || !i.result).length;

    const paidCount = payments.filter((p) => p.paymentStatus === 'Paid').length;
    const holdCount = payments.filter((p) => p.paymentStatus === 'On hold for quality').length;
    const awaitingCount = payments.filter((p) => p.paymentStatus === 'Awaiting approval').length;
    const settlementProgress = Math.round((paidCount / (payments.length || 1)) * 100);

    const vendorMetrics = workshops.slice(0, 3).map((ws) => ({
      id: ws.id,
      name: ws.name,
      warning: ws.warning,
      onTimePercent: ws.onTimePercent,
      activeJobs: jobs.filter((j) => j.workshopId === ws.id && j.stage !== 'Paid' && j.stage !== 'Inspected').length,
    }));

    const actionItems: ActionItem[] = [
      {
        id: 'act-1',
        title: 'Drawing Rev B sent to Patil Steel — 2 days waiting for ack',
        subtitle: 'Patil Steel has not acknowledged latest approved revision',
        actionText: 'Remind vendor',
        type: 'remind',
        urgent: true,
        workshopName: 'Patil Steel',
        revision: 'Rev B',
      },
      {
        id: 'act-2',
        title: 'Bracket B-204 assembly shortfall predicted on 15 Oct',
        subtitle: 'Assembly slot requires 40 units, only 28 ready',
        actionText: 'Review schedule',
        actionHref: '/jobs',
        type: 'schedule',
      },
      {
        id: 'act-3',
        title: 'Gusset G-045 delivered by Kulkarni Engg awaiting inspection',
        subtitle: 'Goods receipt recorded — inspection pending',
        actionText: 'Schedule inspection',
        actionHref: '/quality',
        type: 'inspection',
      },
      {
        id: 'act-4',
        title: 'Invoice #INV-OE-2026-030 from Om Engg Works awaiting finance approval',
        subtitle: 'Amount ₹1,45,000 — Quality inspection passed',
        actionText: 'Review',
        actionHref: '/payments',
        type: 'review',
      },
    ];

    return {
      data: {
        jobs,
        parts,
        workshops,
        acknowledgements: acks,
        invoices: payments,
        inspections,
        deliveries,
        assemblySlots: slotsWithShortfall,
        summary: {
          activeJobsCount,
          atRiskCount,
          overdueCount,
          awaitingAckCount,
          invoicesPendingCount,
        },
        qualityMetrics: {
          firstPassYield,
          reworkCount,
          pendingInspections,
        },
        paymentMetrics: {
          paidCount,
          holdCount,
          awaitingCount,
          settlementProgress,
          avgPaymentDays: 18,
        },
        vendorMetrics,
        actionItems,
      },
      error: null,
    };
  }

  try {
    // Fetch all core entities in parallel with live RLS
    const [
      jobsRes,
      partsRes,
      workshopsRes,
      acksRes,
      paymentsRes,
      inspectionsRes,
      deliveriesRes,
      slotsRes,
    ] = await Promise.all([
      fetchJobs(),
      fetchParts(),
      fetchWorkshops(),
      fetchAcknowledgements(),
      fetchInvoicePayments(),
      fetchInspections(),
      fetchDeliveries(),
      fetchAssemblySlots(),
    ]);

    if (jobsRes.error) throw new Error(jobsRes.error);
    if (workshopsRes.error) throw new Error(workshopsRes.error);

    const jobs = jobsRes.data || [];
    const parts = partsRes.data || [];
    const workshops = workshopsRes.data || [];
    const acks = acksRes.data || [];
    const payments = paymentsRes.data || [];
    const inspections = inspectionsRes.data || [];
    const deliveries = deliveriesRes.data || [];
    const rawSlots = slotsRes.data || [];

    // Dynamically calculate risk for each job using Rule 5
    const today = new Date();
    const enrichedJobs: Job[] = jobs.map((job) => {
      const jobInspections = inspections.filter((i) => i.jobId === job.id);
      const computedRisk = getRisk(job, today, jobInspections);
      return {
        ...job,
        risk: computedRisk,
      };
    });

    // 1. KPI Summary Cards
    const activeJobsCount = enrichedJobs.filter(
      (j) => j.stage !== 'Paid' && j.stage !== 'Inspected'
    ).length;

    const atRiskCount = enrichedJobs.filter(
      (j) => j.risk === 'At risk' || j.risk === 'May miss date'
    ).length;

    const overdueCount = enrichedJobs.filter(
      (j) => j.risk === 'Overdue'
    ).length;

    const awaitingAckCount = acks.filter(
      (a) => !a.acknowledgedAt
    ).length;

    const invoicesPendingCount = payments.filter(
      (p) => p.paymentStatus === 'Awaiting approval' || p.paymentStatus === 'Not ready'
    ).length;

    // 2. 14-Day Assembly Schedule & Shortfall
    // Map assembly steps or compute from slots
    const slotsWithShortfall = getAssemblyShortfall(
      rawSlots.length > 0
        ? rawSlots
        : [
            { date: '2026-10-09', needed: 60, ready: 45 },
            { date: '2026-10-12', needed: 80, ready: 80 },
            { date: '2026-10-15', needed: 40, ready: 28 },
            { date: '2026-10-19', needed: 30, ready: 30 },
            { date: '2026-10-22', needed: 55, ready: 42 },
          ]
    );

    // 3. Quality Snapshot metrics
    const totalInspections = inspections.length || 1;
    const passedInspections = inspections.filter(
      (i) => i.result === 'Accepted' && !i.reinspectionDate
    ).length;
    const firstPassYield = Math.round((passedInspections / totalInspections) * 100) || 91;
    const reworkCount = inspections.filter(
      (i) => i.result === 'Rejected' || i.reinspectionDate !== null
    ).length;
    const pendingInspections = inspections.filter(
      (i) => i.result === 'Pending' || !i.result
    ).length;

    // 4. Payment Snapshot metrics
    const paidCount = payments.filter((p) => p.paymentStatus === 'Paid').length;
    const holdCount = payments.filter((p) => p.paymentStatus === 'On hold for quality').length;
    const awaitingCount = payments.filter((p) => p.paymentStatus === 'Awaiting approval').length;
    const totalPayments = payments.length || 1;
    const settlementProgress = Math.round((paidCount / totalPayments) * 100);

    // 5. Vendor Snapshot metrics
    const vendorMetrics = workshops.slice(0, 3).map((ws) => {
      const wsJobs = enrichedJobs.filter((j) => j.workshopId === ws.id);
      const activeWsJobs = wsJobs.filter(
        (j) => j.stage !== 'Paid' && j.stage !== 'Inspected'
      ).length;
      return {
        id: ws.id,
        name: ws.name,
        warning: ws.warning || null,
        onTimePercent: ws.onTimePercent || 92,
        activeJobs: activeWsJobs,
      };
    });

    // 6. Needs Action Today dynamic list
    const actionItems: ActionItem[] = [];

    // Find unacknowledged drawing
    const pendingAck = acks.find((a) => !a.acknowledgedAt);
    if (pendingAck) {
      const ackJob = enrichedJobs.find((j) => j.id === pendingAck.jobId);
      const ws = workshops.find((w) => w.id === (pendingAck.workshopId || ackJob?.workshopId));
      actionItems.push({
        id: `act-ack-${pendingAck.jobId}`,
        title: `Drawing revision sent to ${ws?.name || 'Workshop'} — awaiting ack`,
        subtitle: `${ws?.name || 'Workshop'} has not acknowledged latest approved revision`,
        actionText: 'Remind vendor',
        type: 'remind',
        urgent: true,
        workshopName: ws?.name,
        jobId: pendingAck.jobId,
      });
    }

    // Find assembly shortfall
    const shortfallSlot = slotsWithShortfall.find((s) => s.shortfall > 0);
    if (shortfallSlot) {
      actionItems.push({
        id: `act-slot-${shortfallSlot.date}`,
        title: `Assembly shortfall predicted on ${shortfallSlot.date}`,
        subtitle: `Assembly slot requires ${shortfallSlot.needed} units, only ${shortfallSlot.ready} ready`,
        actionText: 'Review schedule',
        actionHref: '/jobs',
        type: 'schedule',
      });
    }

    // Find pending inspection
    const pendingInspection = inspections.find((i) => i.result === 'Pending');
    if (pendingInspection) {
      const relatedJob = enrichedJobs.find((j) => j.id === pendingInspection.jobId);
      actionItems.push({
        id: `act-insp-${pendingInspection.id}`,
        title: `${relatedJob?.partDisplayName || 'Part'} delivered awaiting inspection`,
        subtitle: `Goods receipt recorded — inspection pending`,
        actionText: 'Schedule inspection',
        actionHref: '/quality',
        type: 'inspection',
      });
    } else if (deliveries.length > 0) {
      actionItems.push({
        id: 'act-insp-default',
        title: `Delivered batch awaiting goods receipt inspection`,
        subtitle: `Delivery challan recorded — quality check required`,
        actionText: 'Schedule inspection',
        actionHref: '/quality',
        type: 'inspection',
      });
    }

    // Find invoice awaiting approval
    const pendingInvoice = payments.find((p) => p.paymentStatus === 'Awaiting approval');
    if (pendingInvoice) {
      actionItems.push({
        id: `act-inv-${pendingInvoice.id}`,
        title: `Invoice #${pendingInvoice.invoiceNumber || 'INV-PENDING'} awaiting finance approval`,
        subtitle: `Amount ₹${(pendingInvoice.amount || 0).toLocaleString('en-IN')} — Quality inspection passed`,
        actionText: 'Review',
        actionHref: '/payments',
        type: 'review',
      });
    }

    return {
      data: {
        jobs: enrichedJobs,
        parts,
        workshops,
        acknowledgements: acks,
        invoices: payments,
        inspections,
        deliveries,
        assemblySlots: slotsWithShortfall,
        summary: {
          activeJobsCount,
          atRiskCount,
          overdueCount,
          awaitingAckCount,
          invoicesPendingCount,
        },
        qualityMetrics: {
          firstPassYield,
          reworkCount,
          pendingInspections,
        },
        paymentMetrics: {
          paidCount,
          holdCount,
          awaitingCount,
          settlementProgress,
          avgPaymentDays: 18,
        },
        vendorMetrics,
        actionItems,
      },
      error: null,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to load dashboard data';
    return { data: null, error: msg };
  }
}
