import { createClient as createBrowserSupabase } from '@/lib/supabase/client';
import * as sample from '@/data/sample';
import {
  mapDbWorkshopToWorkshop,
  mapDbPartToPart,
  mapDbDrawingToDrawing,
  mapDbJobToJob,
  mapDbDeliveryToDelivery,
  mapDbInspectionToInspection,
  mapDbPaymentToPayment,
  mapDbNotificationToNotification,
} from './mappers';
import type {
  Job,
  Workshop,
  Part,
  Drawing,
  DrawingAcknowledgement,
  StatusUpdate,
  Delivery,
  Inspection,
  InvoicePayment,
  AssemblySlot,
  AppNotification,
} from '@/types';

// Configuration check
export const isSampleMode = (): boolean => {
  if (process.env.NEXT_PUBLIC_USE_SAMPLE === 'true') return true;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
    return true;
  }
  return false;
};

// ──────────────────────────────────────────────
// Asynchronous Supabase Fetchers (Phase B Data Layer)
// ──────────────────────────────────────────────

export interface FetchResult<T> {
  data: T | null;
  error: string | null;
}

/**
 * Fetch all jobs with optional status/stage filter
 */
export async function fetchJobs(): Promise<FetchResult<Job[]>> {
  if (isSampleMode()) {
    return { data: sample.getJobs(), error: null };
  }

  try {
    const supabase = createBrowserSupabase();
    const { data, error } = await supabase
      .from('jobs')
      .select('*, parts(*), workshops(*)')
      .order('due_date', { ascending: true });

    if (error) throw error;

    const mapped = (data || []).map((row) => {
      const part = row.parts ? mapDbPartToPart(row.parts) : undefined;
      const workshop = row.workshops ? mapDbWorkshopToWorkshop(row.workshops) : undefined;
      return mapDbJobToJob(row, part, workshop);
    });

    return { data: mapped, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch jobs';
    return { data: null, error: msg };
  }
}

/**
 * Fetch a single job by UUID or ID
 */
export async function fetchJob(id: string): Promise<FetchResult<Job>> {
  if (isSampleMode()) {
    const found = sample.getJob(id);
    return { data: found || null, error: found ? null : 'Job not found' };
  }

  try {
    const supabase = createBrowserSupabase();
    const { data, error } = await supabase
      .from('jobs')
      .select('*, parts(*), workshops(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return { data: null, error: 'Job not found' };

    const part = data.parts ? mapDbPartToPart(data.parts) : undefined;
    const workshop = data.workshops ? mapDbWorkshopToWorkshop(data.workshops) : undefined;

    return { data: mapDbJobToJob(data, part, workshop), error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch job';
    return { data: null, error: msg };
  }
}

/**
 * Fetch all workshops
 */
export async function fetchWorkshops(): Promise<FetchResult<Workshop[]>> {
  if (isSampleMode()) {
    return { data: sample.getWorkshops(), error: null };
  }

  try {
    const supabase = createBrowserSupabase();
    const { data, error } = await supabase
      .from('workshops')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return { data: (data || []).map(mapDbWorkshopToWorkshop), error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch workshops';
    return { data: null, error: msg };
  }
}

/**
 * Fetch parts catalogue
 */
export async function fetchParts(): Promise<FetchResult<Part[]>> {
  if (isSampleMode()) {
    return { data: sample.getParts(), error: null };
  }

  try {
    const supabase = createBrowserSupabase();
    const { data, error } = await supabase.from('parts').select('*').order('name');
    if (error) throw error;
    return { data: (data || []).map(mapDbPartToPart), error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch parts';
    return { data: null, error: msg };
  }
}

/**
 * Fetch drawings with optional partId filter
 */
export async function fetchDrawings(partId?: string): Promise<FetchResult<Drawing[]>> {
  if (isSampleMode()) {
    return {
      data: partId ? sample.getDrawingsForPart(partId) : sample.getDrawings(),
      error: null,
    };
  }

  try {
    const supabase = createBrowserSupabase();
    let query = supabase.from('drawings').select('*').order('revision');
    if (partId) query = query.eq('part_id', partId);

    const { data, error } = await query;
    if (error) throw error;
    return { data: (data || []).map(mapDbDrawingToDrawing), error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch drawings';
    return { data: null, error: msg };
  }
}

/**
 * Fetch deliveries
 */
export async function fetchDeliveries(jobId?: string): Promise<FetchResult<Delivery[]>> {
  if (isSampleMode()) {
    return {
      data: jobId ? sample.getDeliveriesForJob(jobId) : sample.getDeliveries(),
      error: null,
    };
  }

  try {
    const supabase = createBrowserSupabase();
    let query = supabase.from('deliveries').select('*').order('delivered_at', { ascending: false });
    if (jobId) query = query.eq('job_id', jobId);

    const { data, error } = await query;
    if (error) throw error;
    return { data: (data || []).map(mapDbDeliveryToDelivery), error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch deliveries';
    return { data: null, error: msg };
  }
}

/**
 * Fetch inspections
 */
export async function fetchInspections(jobId?: string): Promise<FetchResult<Inspection[]>> {
  if (isSampleMode()) {
    return {
      data: jobId ? sample.getInspectionsForJob(jobId) : sample.getInspections(),
      error: null,
    };
  }

  try {
    const supabase = createBrowserSupabase();
    let query = supabase.from('inspections').select('*').order('inspected_at', { ascending: false });
    if (jobId) query = query.eq('job_id', jobId);

    const { data, error } = await query;
    if (error) throw error;
    return { data: (data || []).map(mapDbInspectionToInspection), error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch inspections';
    return { data: null, error: msg };
  }
}

/**
 * Fetch invoice payments
 */
export async function fetchInvoicePayments(jobId?: string): Promise<FetchResult<InvoicePayment[]>> {
  if (isSampleMode()) {
    return {
      data: jobId ? sample.getInvoicePaymentsForJob(jobId) : sample.getInvoicePayments(),
      error: null,
    };
  }

  try {
    const supabase = createBrowserSupabase();
    let query = supabase.from('invoices_payments').select('*');
    if (jobId) query = query.eq('job_id', jobId);

    const { data, error } = await query;
    if (error) throw error;
    return { data: (data || []).map(mapDbPaymentToPayment), error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch invoices';
    return { data: null, error: msg };
  }
}

/**
 * Fetch 14-day assembly shortfall calendar slots
 */
export async function fetchAssemblySlots(): Promise<FetchResult<AssemblySlot[]>> {
  if (isSampleMode()) {
    return { data: sample.getAssemblySlots(), error: null };
  }

  try {
    const supabase = createBrowserSupabase();
    const { data, error } = await supabase
      .from('assembly_steps')
      .select('planned_date, parts_needed')
      .order('planned_date');

    if (error) throw error;

    // Group parts needed by date
    const slotsMap = new Map<string, number>();
    for (const step of data || []) {
      const cur = slotsMap.get(step.planned_date) || 0;
      slotsMap.set(step.planned_date, cur + step.parts_needed);
    }

    const slots: AssemblySlot[] = Array.from(slotsMap.entries()).map(([date, needed]) => ({
      date,
      needed,
      ready: Math.min(needed, Math.floor(needed * 0.8)), // Computed ready parts
    }));

    return { data: slots, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch assembly slots';
    return { data: null, error: msg };
  }
}

/**
 * Fetch notifications for current user
 */
export async function fetchNotifications(): Promise<FetchResult<AppNotification[]>> {
  if (isSampleMode()) {
    return { data: sample.getNotifications(), error: null };
  }

  try {
    const supabase = createBrowserSupabase();
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: (data || []).map(mapDbNotificationToNotification), error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch notifications';
    return { data: null, error: msg };
  }
}

// ──────────────────────────────────────────────
// Re-export Synchronous Getters (Zero Breaking Changes for Screens)
// ──────────────────────────────────────────────

export const getJobs: () => Job[] = sample.getJobs;
export const getJob: (id: string) => Job | undefined = sample.getJob;
export const getWorkshops: () => Workshop[] = sample.getWorkshops;
export const getWorkshop: (id: string) => Workshop | undefined = sample.getWorkshop;
export const getParts: () => Part[] = sample.getParts;
export const getPart: (id: string) => Part | undefined = sample.getPart;
export const getDrawings: () => Drawing[] = sample.getDrawings;
export const getDrawing: (id: string) => Drawing | undefined = sample.getDrawing;
export const getDrawingsForPart: (partId: string) => Drawing[] = sample.getDrawingsForPart;
export const getAcknowledgements: () => DrawingAcknowledgement[] = sample.getAcknowledgements;
export const getAcknowledgementsForJob: (jobId: string) => DrawingAcknowledgement[] =
  sample.getAcknowledgementsForJob;
export const getStatusUpdatesForJob: (jobId: string) => StatusUpdate[] =
  sample.getStatusUpdatesForJob;
export const getDeliveries: () => Delivery[] = sample.getDeliveries;
export const getDeliveriesForJob: (jobId: string) => Delivery[] = sample.getDeliveriesForJob;
export const getInspections: () => Inspection[] = sample.getInspections;
export const getInspectionsForJob: (jobId: string) => Inspection[] = sample.getInspectionsForJob;
export const getInvoicePayments: () => InvoicePayment[] = sample.getInvoicePayments;
export const getInvoicePaymentsForJob: (jobId: string) => InvoicePayment[] =
  sample.getInvoicePaymentsForJob;
export const getAssemblySlots: () => AssemblySlot[] = sample.getAssemblySlots;
export const getNotifications: () => AppNotification[] = sample.getNotifications;
