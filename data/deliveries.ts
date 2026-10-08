// ──────────────────────────────────────────────
// VendorFlow – Deliveries local-state store
// Seeds from sample data; addDelivery() writes to this
// in-memory array (Supabase replaces later).
// ──────────────────────────────────────────────
import type { Delivery } from '@/types';
import { getDeliveries as getSampleDeliveries } from '@/data/sample';

// Mutable in-memory store seeded from sample data
let deliveriesStore: Delivery[] = getSampleDeliveries();

/** Return all deliveries (sorted most-recent first) */
export function getDeliveries(): Delivery[] {
  return [...deliveriesStore].sort(
    (a, b) => new Date(b.deliveredDate).getTime() - new Date(a.deliveredDate).getTime()
  );
}

/** Return deliveries for a specific job */
export function getDeliveriesForJob(jobId: string): Delivery[] {
  return deliveriesStore.filter((d) => d.jobId === jobId);
}

/** Record a new delivery (GRN). Returns the new record. */
export function addDelivery(delivery: Omit<Delivery, 'id'>): Delivery {
  const newDelivery: Delivery = {
    ...delivery,
    id: `del-${Date.now()}`,
  };
  deliveriesStore = [newDelivery, ...deliveriesStore];
  return newDelivery;
}
