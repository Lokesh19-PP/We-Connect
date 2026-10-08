// ──────────────────────────────────────────────
// VendorFlow – Vendors Data Management State (§8)
// Managed state for workshops/vendors
// ──────────────────────────────────────────────
import { getWorkshops, getJobs } from '@/data/sample';
import type { Workshop, Job } from '@/types';

export interface ExtendedVendor extends Workshop {
  status: 'Active' | 'Inactive';
  reworkCount: number;
}

// Initial state populated from sample data
let vendorsList: ExtendedVendor[] = getWorkshops().map((w, index) => {
  // Sample rework counts matching AGENTS.md / sample figures
  const reworkCounts: Record<string, number> = {
    'ws-1': 1,
    'ws-2': 2,
    'ws-3': 5,
    'ws-4': 0,
    'ws-5': 1,
    'ws-6': 0,
  };

  return {
    ...w,
    status: index === 5 ? 'Inactive' : 'Active', // 5 active, 1 inactive demo
    reworkCount: reworkCounts[w.id] ?? 0,
  };
});

/** Get all vendors */
export function getAllVendors(): ExtendedVendor[] {
  return [...vendorsList];
}

/** Get single vendor by ID */
export function getVendorById(id: string): ExtendedVendor | undefined {
  return vendorsList.find((v) => v.id === id);
}

/** Add a new vendor */
export function addVendor(data: Omit<ExtendedVendor, 'id' | 'activeJobs' | 'onTimePercent' | 'reworkCount'>): ExtendedVendor {
  const newVendor: ExtendedVendor = {
    ...data,
    id: `ws-${vendorsList.length + 1}-${Date.now()}`,
    onTimePercent: 100, // new vendors start at 100%
    activeJobs: 0,
    reworkCount: 0,
  };
  vendorsList = [newVendor, ...vendorsList];
  return newVendor;
}

/** Update existing vendor */
export function updateVendor(id: string, data: Partial<ExtendedVendor>): ExtendedVendor | undefined {
  const index = vendorsList.findIndex((v) => v.id === id);
  if (index === -1) return undefined;

  vendorsList[index] = {
    ...vendorsList[index],
    ...data,
  };
  return vendorsList[index];
}

/** Toggle vendor active / inactive status */
export function toggleVendorStatus(id: string): ExtendedVendor | undefined {
  const vendor = getVendorById(id);
  if (!vendor) return undefined;
  const updatedStatus = vendor.status === 'Active' ? 'Inactive' : 'Active';
  return updateVendor(id, { status: updatedStatus });
}

/** Get jobs assigned to a vendor */
export function getJobsForVendor(vendorId: string): Job[] {
  const allJobs = getJobs();
  const vendor = getVendorById(vendorId);
  if (!vendor) return [];
  return allJobs.filter((job) => job.workshopId === vendor.id || job.workshopName.toLowerCase().includes(vendor.name.toLowerCase()));
}

/** Get monthly performance trend for vendor chart */
export function getVendorPerformanceHistory(vendorId: string) {
  const vendor = getVendorById(vendorId);
  const baseRate = vendor ? vendor.onTimePercent : 90;

  return [
    { month: 'May', onTime: Math.min(100, baseRate + 2), target: 90 },
    { month: 'Jun', onTime: Math.max(70, baseRate - 4), target: 90 },
    { month: 'Jul', onTime: Math.min(100, baseRate + 1), target: 90 },
    { month: 'Aug', onTime: Math.max(75, baseRate - 2), target: 90 },
    { month: 'Sep', onTime: baseRate, target: 90 },
    { month: 'Oct', onTime: baseRate, target: 90 },
  ];
}
