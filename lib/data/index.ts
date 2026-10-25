import { createClient as createBrowserSupabase } from '@/lib/supabase/client';
import * as sample from '@/data/sample';
import { addDrawing as sampleAddDrawing, approveDrawing as sampleApproveDrawing } from '@/data/drawings';
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
 * Fetch drawing acknowledgements with optional jobId filter
 */
export async function fetchAcknowledgements(jobId?: string): Promise<FetchResult<DrawingAcknowledgement[]>> {
  if (isSampleMode()) {
    return {
      data: jobId ? sample.getAcknowledgementsForJob(jobId) : sample.getAcknowledgements(),
      error: null,
    };
  }

  try {
    const supabase = createBrowserSupabase();
    let query = supabase
      .from('drawing_acknowledgements')
      .select('*, jobs(workshop_id)');
    if (jobId) query = query.eq('job_id', jobId);

    const { data, error } = await query;
    if (error) throw error;

    const mapped: DrawingAcknowledgement[] = (data || []).map((row: {
      job_id: string;
      drawing_id: string;
      confirmed_at: string | null;
      confirmed_by: string | null;
      jobs?: { workshop_id: string } | null;
    }) => ({
      id: `ack-${row.job_id}-${row.drawing_id}`,
      drawingId: row.drawing_id,
      jobId: row.job_id,
      workshopId: row.jobs?.workshop_id || '',
      acknowledgedAt: row.confirmed_at ? row.confirmed_at.split('T')[0] : null,
      acknowledgedBy: row.confirmed_by || null,
    }));

    return { data: mapped, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch acknowledgements';
    return { data: null, error: msg };
  }
}

/**
 * Create a new drawing revision in Supabase
 */
export async function createDrawingRevision(params: {
  partId: string;
  revision: string;
  fileUrl: string;
  changeNote?: string;
}): Promise<FetchResult<Drawing>> {
  if (isSampleMode()) {
    const newDrawing = sampleAddDrawing({
      partId: params.partId,
      revision: params.revision,
      fileUrl: params.fileUrl,
      changeNote: params.changeNote,
      uploadedBy: 'Current User',
    });
    return { data: newDrawing, error: null };
  }

  try {
    const supabase = createBrowserSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('drawings')
      .insert({
        part_id: params.partId,
        revision: params.revision,
        file_url: params.fileUrl,
        change_note: params.changeNote || null,
        is_approved: false,
        uploaded_by: user?.id || null,
      })
      .select('*')
      .single();

    if (error) throw error;
    return { data: mapDbDrawingToDrawing(data), error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create drawing revision';
    return { data: null, error: msg };
  }
}

/**
 * Approve a drawing revision in Supabase:
 * Enforces Rule 1 (revokes other approved revisions for part) and creates notification
 */
export async function approveDrawingRevision(params: {
  drawingId: string;
  partId: string;
  approverName?: string;
}): Promise<{ success: boolean; notifiedCount: number; error: string | null }> {
  if (isSampleMode()) {
    const result = sampleApproveDrawing(params.drawingId, params.approverName || 'Engineering');
    return { success: result.success, notifiedCount: result.notifiedCount, error: result.error || null };
  }

  try {
    const supabase = createBrowserSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Revoke any currently approved drawings for this part to enforce Rule 1
    const { error: revokeError } = await supabase
      .from('drawings')
      .update({ is_approved: false })
      .eq('part_id', params.partId)
      .eq('is_approved', true);

    if (revokeError) throw revokeError;

    // 2. Mark target drawing revision as approved
    const { data: approvedRow, error: approveError } = await supabase
      .from('drawings')
      .update({
        is_approved: true,
        approved_by: user?.id || null,
        approved_at: new Date().toISOString(),
      })
      .eq('id', params.drawingId)
      .select('*, parts(name, part_code)')
      .single();

    if (approveError) throw approveError;

    // 3. Find open jobs for this part to count affected workshops
    const { data: openJobs } = await supabase
      .from('jobs')
      .select('id, workshop_id')
      .eq('part_id', params.partId)
      .not('stage', 'in', '("delivered","inspected","paid")');

    const uniqueWorkshops = new Set((openJobs || []).map((j: { workshop_id: string }) => j.workshop_id));
    const partName = approvedRow?.parts?.name || 'Part';
    const partCode = approvedRow?.parts?.part_code || '';

    // 4. Create notification row for the event
    await supabase.from('notifications').insert({
      type: 'info',
      title: `Drawing Approved: ${partCode} ${approvedRow.revision}`,
      body: `Revision ${approvedRow.revision} for ${partName} approved. Workshops must acknowledge before fabrication starts.`,
      link: '/drawings',
      read: false,
    });

    return { success: true, notifiedCount: uniqueWorkshops.size, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to approve drawing';
    return { success: false, notifiedCount: 0, error: msg };
  }
}

/**
 * Send drawing reminder notification to unacknowledged workshops
 */
export async function sendDrawingAcknowledgementReminder(params: {
  workshopName: string;
  revision: string;
  jobId?: string;
}): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = createBrowserSupabase();

    await supabase.from('notifications').insert({
      type: 'warning',
      title: `Drawing awaiting acknowledgement: ${params.workshopName}`,
      body: `Drawing revision ${params.revision} is awaiting acknowledgement from ${params.workshopName}. Work cannot proceed.`,
      link: '/drawings',
      read: false,
    });

    return { success: true, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to send reminder';
    return { success: false, error: msg };
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

/**
 * Mark a single notification as read in Supabase
 */
export async function markNotificationAsRead(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = createBrowserSupabase();
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to mark notification as read';
    return { success: false, error: msg };
  }
}

/**
 * Mark all unread notifications as read in Supabase
 */
export async function markAllNotificationsAsRead(): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = createBrowserSupabase();
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false);

    if (error) throw error;
    return { success: true, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to mark all notifications as read';
    return { success: false, error: msg };
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

export { fetchDashboardData, type DashboardData, type FetchDashboardResult, type ActionItem } from './dashboard';
