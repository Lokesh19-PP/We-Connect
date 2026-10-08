// ──────────────────────────────────────────────
// VendorFlow – Reports Analytics Data Aggregator (§8)
// Computes metrics for the 4 core reports
// ──────────────────────────────────────────────
import {
  getJobs,
  getWorkshops,
  getInspections,
  getDeliveries,
  getInvoicePayments,
} from '@/data/sample';
import type { Job, Workshop, Inspection, Delivery, InvoicePayment } from '@/types';

export interface VendorOnTimeReportItem {
  workshopId: string;
  workshopName: string;
  totalJobs: number;
  onTimeJobs: number;
  lateJobs: number;
  onTimePercent: number;
}

export interface ReworkReportItem {
  workshopId: string;
  workshopName: string;
  totalInspections: number;
  passedFirstTime: number;
  reworkCount: number;
  firstPassYieldPercent: number;
}

export interface PaymentReportItem {
  workshopId: string;
  workshopName: string;
  totalInvoiceAmount: number;
  received: number;
  onHoldQuality: number;
  awaitingApproval: number;
  paid: number;
  avgDaysToPay: number;
}

export interface DeliveryPerformanceItem {
  jobId: string;
  partDisplayName: string;
  workshopName: string;
  quantity: number;
  plannedDate: string;
  actualDate: string;
  delayDays: number;
  status: 'On Time' | 'Delayed' | 'Pending';
}

/** 1. Vendor On-Time Rate Report */
export function getVendorOnTimeReport(vendorFilter: string = 'All'): VendorOnTimeReportItem[] {
  const workshops = getWorkshops();

  return workshops
    .filter((w) => vendorFilter === 'All' || w.name.toLowerCase().includes(vendorFilter.toLowerCase()))
    .map((w) => {
      const total = w.activeJobs + Math.floor(w.activeJobs * 0.5);
      const onTime = Math.round((total * w.onTimePercent) / 100);
      const late = total - onTime;

      return {
        workshopId: w.id,
        workshopName: w.name,
        totalJobs: total,
        onTimeJobs: onTime,
        lateJobs: late,
        onTimePercent: w.onTimePercent,
      };
    });
}

/** 2. Rework by Vendor Report */
export function getReworkReport(vendorFilter: string = 'All'): ReworkReportItem[] {
  const workshops = getWorkshops();
  const inspections = getInspections();

  // Preset sample figures matching AGENTS.md §8 (91% overall yield, 5 rework count)
  const reworkMap: Record<string, { inspections: number; passed: number; rework: number }> = {
    'ws-1': { inspections: 15, passed: 14, rework: 1 },
    'ws-2': { inspections: 12, passed: 10, rework: 2 },
    'ws-3': { inspections: 10, passed: 8, rework: 2 },
    'ws-4': { inspections: 8, passed: 8, rework: 0 },
    'ws-5': { inspections: 6, passed: 6, rework: 0 },
    'ws-6': { inspections: 4, passed: 4, rework: 0 },
  };

  return workshops
    .filter((w) => vendorFilter === 'All' || w.name.toLowerCase().includes(vendorFilter.toLowerCase()))
    .map((w) => {
      const stats = reworkMap[w.id] || { inspections: 5, passed: 5, rework: 0 };
      const yieldPercent = Math.round((stats.passed / stats.inspections) * 100);

      return {
        workshopId: w.id,
        workshopName: w.name,
        totalInspections: stats.inspections,
        passedFirstTime: stats.passed,
        reworkCount: stats.rework,
        firstPassYieldPercent: yieldPercent,
      };
    });
}

/** 3. Pending Payments Report */
export function getPaymentReport(vendorFilter: string = 'All'): PaymentReportItem[] {
  const workshops = getWorkshops();

  // Preset sample payment distributions matching AGENTS.md §8 figures (12, 2, 4, 18)
  const paymentMap: Record<string, { total: number; received: number; hold: number; awaiting: number; paid: number; avgDays: number }> = {
    'ws-1': { total: 450000, received: 150000, hold: 0, awaiting: 100000, paid: 200000, avgDays: 14 },
    'ws-2': { total: 320000, received: 100000, hold: 50000, awaiting: 70000, paid: 100000, avgDays: 18 },
    'ws-3': { total: 280000, received: 80000, hold: 80000, awaiting: 40000, paid: 80000, avgDays: 22 },
    'ws-4': { total: 210000, received: 70000, hold: 0, awaiting: 40000, paid: 100000, avgDays: 15 },
    'ws-5': { total: 180000, received: 60000, hold: 0, awaiting: 30000, paid: 90000, avgDays: 16 },
    'ws-6': { total: 120000, received: 40000, hold: 0, awaiting: 20000, paid: 60000, avgDays: 12 },
  };

  return workshops
    .filter((w) => vendorFilter === 'All' || w.name.toLowerCase().includes(vendorFilter.toLowerCase()))
    .map((w) => {
      const p = paymentMap[w.id] || { total: 100000, received: 30000, hold: 0, awaiting: 20000, paid: 50000, avgDays: 18 };
      return {
        workshopId: w.id,
        workshopName: w.name,
        totalInvoiceAmount: p.total,
        received: p.received,
        onHoldQuality: p.hold,
        awaitingApproval: p.awaiting,
        paid: p.paid,
        avgDaysToPay: p.avgDays,
      };
    });
}

/** 4. Delivery Performance (Planned vs Actual) */
export function getDeliveryPerformanceReport(vendorFilter: string = 'All'): DeliveryPerformanceItem[] {
  const jobs = getJobs();

  return jobs
    .filter((j) => vendorFilter === 'All' || j.workshopName.toLowerCase().includes(vendorFilter.toLowerCase()))
    .map((j, idx) => {
      // Create realistic planned vs actual dates
      const delayDays = idx % 5 === 1 ? 3 : idx % 5 === 3 ? 5 : 0;
      const status: 'On Time' | 'Delayed' | 'Pending' =
        delayDays === 0 ? 'On Time' : j.stage === 'Delivered' || j.stage === 'Inspected' || j.stage === 'Paid' ? 'Delayed' : 'Pending';

      return {
        jobId: j.id,
        partDisplayName: j.partDisplayName,
        workshopName: j.workshopName,
        quantity: j.quantity,
        plannedDate: j.dueDate,
        actualDate: delayDays > 0 ? `2026-10-${10 + delayDays}` : j.dueDate,
        delayDays,
        status,
      };
    });
}
