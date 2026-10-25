// ──────────────────────────────────────────────
// VendorFlow – RLS Security Matrix Tests
// Verifies Row-Level Security and Database Rules
// using the seeded test users from scripts/seed-users.ts
// ──────────────────────────────────────────────

import { describe, it, expect, beforeAll } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const WORKSHOP_A_ID = 'c0000000-0000-0000-0000-000000000001';
const WORKSHOP_B_ID = 'c0000000-0000-0000-0000-000000000002';

// Helper to create an authenticated Supabase client for a specific seeded user
async function createAuthUserClient(email: string, password = 'test1234'): Promise<SupabaseClient> {
  const client = createClient(supabaseUrl, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(`Failed to sign in as ${email}: ${error.message}`);
  }

  return client;
}

const canRunRlsTests = Boolean(
  supabaseUrl &&
  anonKey &&
  !supabaseUrl.includes('your-project') &&
  !anonKey.includes('your-anon-key')
);

describe.runIf(canRunRlsTests)('Supabase Row-Level Security (RLS) Matrix', () => {
  let workshopAClient: SupabaseClient;
  let workshopBClient: SupabaseClient;
  let managementClient: SupabaseClient;
  let qualityClient: SupabaseClient;
  let financeClient: SupabaseClient;

  beforeAll(async () => {
    // Authenticate all test roles
    [workshopAClient, workshopBClient, managementClient, qualityClient, financeClient] =
      await Promise.all([
        createAuthUserClient('workshopA@test.com'),
        createAuthUserClient('workshopB@test.com'),
        createAuthUserClient('management@test.com'),
        createAuthUserClient('quality@test.com'),
        createAuthUserClient('finance@test.com'),
      ]);
  }, 20000);

  // ─── 1. Workshop Isolation ─────────────────────────────────
  describe('Workshop Isolation: Workshop sees only its own data', () => {
    it('Workshop A sees only Workshop A jobs', async () => {
      const { data, error } = await workshopAClient
        .from('jobs')
        .select('id, workshop_id');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBeGreaterThan(0);

      // Verify every returned job belongs to Workshop A
      for (const job of data!) {
        expect(job.workshop_id).toBe(WORKSHOP_A_ID);
        expect(job.workshop_id).not.toBe(WORKSHOP_B_ID);
      }
    });

    it('Workshop A cannot query Workshop B jobs directly', async () => {
      const { data, error } = await workshopAClient
        .from('jobs')
        .select('id, workshop_id')
        .eq('workshop_id', WORKSHOP_B_ID);

      expect(error).toBeNull();
      // RLS policy returns 0 rows because Workshop A cannot see Workshop B's rows
      expect(data).toEqual([]);
    });

    it('Workshop A cannot update a Workshop B job', async () => {
      // Find a job belonging to Workshop B using Workshop B client
      const { data: bJobs } = await workshopBClient
        .from('jobs')
        .select('id')
        .eq('workshop_id', WORKSHOP_B_ID)
        .limit(1);

      if (bJobs && bJobs.length > 0) {
        const targetJobId = bJobs[0].id;
        // Attempt update using Workshop A client
        const { data } = await workshopAClient
          .from('jobs')
          .update({ notes: 'Malicious modification attempt' })
          .eq('id', targetJobId)
          .select();

        // RLS prevents modification: either an error or 0 rows updated
        expect(data?.length || 0).toBe(0);
      }
    });

    it('Workshop A sees only its own deliveries and invoices', async () => {
      const { data: deliveries, error: delError } = await workshopAClient
        .from('deliveries')
        .select('id, job_id');

      expect(delError).toBeNull();

      // If deliveries exist, ensure none belong to Workshop B
      const { data: bJobs } = await workshopBClient
        .from('jobs')
        .select('id')
        .eq('workshop_id', WORKSHOP_B_ID);

      const bJobIds = new Set((bJobs || []).map((j) => j.id));
      for (const del of deliveries || []) {
        expect(bJobIds.has(del.job_id)).toBe(false);
      }
    });
  });

  // ─── 2. Management is Read-Only ────────────────────────────
  describe('Management Role: Read-only access across system', () => {
    it('Management can read all jobs', async () => {
      const { data, error } = await managementClient
        .from('jobs')
        .select('id, workshop_id');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBeGreaterThan(0);

      // Management is internal, so it sees multiple workshops
      const workshopIds = new Set(data!.map((j) => j.workshop_id));
      expect(workshopIds.size).toBeGreaterThan(1);
    });

    it('Management cannot insert a new job', async () => {
      const { data, error } = await managementClient
        .from('jobs')
        .insert({
          part_id: 'd0000000-0000-0000-0000-000000000001',
          workshop_id: WORKSHOP_A_ID,
          quantity_ordered: 10,
          due_date: '2026-12-31',
          stage: 'ordered',
        })
        .select();

      // RLS policy jobs_insert_procurement permits only 'procurement' and 'admin'
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/violates row-level security policy/i);
      expect(data).toBeNull();
    });

    it('Management cannot update an existing job', async () => {
      const { data: anyJob } = await managementClient
        .from('jobs')
        .select('id')
        .limit(1)
        .single();

      if (anyJob) {
        const { data } = await managementClient
          .from('jobs')
          .update({ notes: 'Management attempted edit' })
          .eq('id', anyJob.id)
          .select();

        // RLS policy jobs_update_workshop only allows workshop user for own job or procurement/admin
        expect(data?.length || 0).toBe(0);
      }
    });
  });

  // ─── 3. Quality Cannot Approve Payments ────────────────────
  describe('Quality Role: Inspection only; Cannot approve payments', () => {
    it('Quality cannot update invoice payment status to ready or paid', async () => {
      const { data: anyPayment } = await qualityClient
        .from('invoices_payments')
        .select('id, job_id, payment_status')
        .limit(1)
        .single();

      if (anyPayment) {
        const { data } = await qualityClient
          .from('invoices_payments')
          .update({ payment_status: 'ready' })
          .eq('id', anyPayment.id)
          .select();

        // payments_update_finance allows only finance and admin
        expect(data?.length || 0).toBe(0);
      }
    });

    it('Quality can record inspections', async () => {
      // Fetch a valid job
      const { data: job } = await qualityClient
        .from('jobs')
        .select('id')
        .limit(1)
        .single();

      expect(job).toBeDefined();
      if (job) {
        const { data: inspection, error } = await qualityClient
          .from('inspections')
          .insert({
            job_id: job.id,
            result: 'pending',
            remarks: 'Automated test inspection',
          })
          .select()
          .single();

        expect(error).toBeNull();
        expect(inspection).toBeDefined();
        expect(inspection.result).toBe('pending');
      }
    });
  });

  // ─── 4. Finance Cannot Approve Drawings ────────────────────
  describe('Finance Role: Payment only; Cannot approve drawings', () => {
    it('Finance cannot approve drawings', async () => {
      const { data: anyDrawing } = await financeClient
        .from('drawings')
        .select('id, is_approved')
        .limit(1)
        .single();

      if (anyDrawing) {
        const { data } = await financeClient
          .from('drawings')
          .update({ is_approved: true })
          .eq('id', anyDrawing.id)
          .select();

        // drawings_update_engineering allows only engineering and admin
        expect(data?.length || 0).toBe(0);
      }
    });
  });

  // ─── 5. Database Trigger Rule: No In Progress Without Ack ──
  describe('Database Trigger: enforce_ack_before_progress()', () => {
    it('Database blocks transition to in_progress without acknowledged drawing', async () => {
      // Find a job in 'ordered' stage without ack, or test the trigger directly
      const { data: candidateJobs } = await workshopAClient
        .from('jobs')
        .select('id, stage')
        .eq('stage', 'ordered')
        .limit(1);

      if (candidateJobs && candidateJobs.length > 0) {
        const job = candidateJobs[0];
        // Attempt transition to in_progress
        const { error } = await workshopAClient
          .from('jobs')
          .update({ stage: 'in_progress' })
          .eq('id', job.id);

        expect(error).toBeDefined();
        expect(error?.message).toMatch(/acknowledge the approved drawing revision before work starts/i);
      }
    });
  });
});
