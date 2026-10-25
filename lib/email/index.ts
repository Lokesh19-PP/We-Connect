// ──────────────────────────────────────────────
// VendorFlow – Resend Email Notification Service (Server Only)
// Handles:
// 1. New drawing revision approved
// 2. Revision not acknowledged
// 3. Inspection rejected
// 4. Payment ready
// 5. Payment paid
// If RESEND_API_KEY is empty, logs to console instead of sending.
// ──────────────────────────────────────────────
import { Resend } from 'resend';

export type EmailEvent =
  | 'drawing_approved'
  | 'revision_not_acknowledged'
  | 'inspection_rejected'
  | 'payment_ready'
  | 'payment_paid';

export interface SendEmailPayload {
  to?: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailResult {
  success: boolean;
  logged?: boolean;
  id?: string;
  error?: string;
}

const DEFAULT_FROM = process.env.RESEND_FROM || 'VendorFlow <onboarding@resend.dev>';
const DEFAULT_FALLBACK_EMAIL = process.env.NOTIFICATION_EMAIL || 'workshop@vendorflow.internal';

/**
 * Low-level email sender using Resend.
 * Falls back to structured console logging when RESEND_API_KEY is not configured.
 */
export async function sendEmail(payload: SendEmailPayload): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = payload.to || DEFAULT_FALLBACK_EMAIL;

  if (!apiKey || apiKey.trim() === '' || apiKey.startsWith('re_xxxx')) {
    console.log('─────────────────────────────────────────────────────────────────');
    console.log('[Resend Email - MOCK / LOGGED]');
    console.log(`To:      ${Array.isArray(to) ? to.join(', ') : to}`);
    console.log(`From:    ${DEFAULT_FROM}`);
    console.log(`Subject: ${payload.subject}`);
    console.log(`Body (snippet): ${payload.text || payload.html.replace(/<[^>]*>/g, '').slice(0, 150)}...`);
    console.log('─────────────────────────────────────────────────────────────────');
    return {
      success: true,
      logged: true,
      id: `logged-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    };
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: Array.isArray(to) ? to : [to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });

    if (error) {
      console.error('[Resend Email Error]:', error);
      return { success: false, error: error.message };
    }

    console.log(`[Resend Email Sent] Message ID: ${data?.id}`);
    return { success: true, id: data?.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown email send error';
    console.error('[Resend Email Exception]:', msg);
    return { success: false, error: msg };
  }
}

// ──────────────────────────────────────────────
// 1. New Drawing Revision Approved
// ──────────────────────────────────────────────
export async function sendDrawingApprovedEmail(params: {
  partName: string;
  partCode: string;
  revision: string;
  changeNote?: string;
  recipientEmail?: string;
}): Promise<SendEmailResult> {
  const subject = `[VendorFlow] Drawing Approved: ${params.partCode} (${params.revision})`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; rounded: 12px; color: #1e293b;">
      <div style="background-color: #0f172a; color: #ffffff; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="margin: 0; font-size: 18px;">Engineering Blueprint Approved</h2>
      </div>
      <p>Hello Workshop Team,</p>
      <p>A new engineering drawing revision has been approved by Engineering for fabrication:</p>
      <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 14px 18px; margin: 18px 0; border-radius: 4px;">
        <p style="margin: 4px 0;"><strong>Part Code:</strong> ${params.partCode}</p>
        <p style="margin: 4px 0;"><strong>Part Name:</strong> ${params.partName}</p>
        <p style="margin: 4px 0;"><strong>Approved Revision:</strong> <span style="color: #2563eb; font-weight: bold;">${params.revision}</span></p>
        ${params.changeNote ? `<p style="margin: 4px 0;"><strong>Change Notes:</strong> ${params.changeNote}</p>` : ''}
      </div>
      <p style="color: #dc2626; font-weight: 600;">
        ⚠️ IMPORTANT (Rule 2): Fabrication work cannot proceed to "In progress" until your workshop acknowledges this approved revision in the portal.
      </p>
      <div style="margin-top: 24px; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/drawings" style="background-color: #f97316; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">
          View & Acknowledge Drawing
        </a>
      </div>
    </div>
  `;

  return sendEmail({
    to: params.recipientEmail,
    subject,
    html,
    text: `New drawing approved: ${params.partCode} ${params.revision}. Please acknowledge in VendorFlow before fabrication begins.`,
  });
}

// ──────────────────────────────────────────────
// 2. Revision Not Acknowledged (Reminder)
// ──────────────────────────────────────────────
export async function sendRevisionNotAcknowledgedEmail(params: {
  workshopName: string;
  revision: string;
  partName?: string;
  daysWaiting?: number;
  recipientEmail?: string;
}): Promise<SendEmailResult> {
  const subject = `[VendorFlow] URGENT: Drawing Revision ${params.revision} Awaiting Acknowledgement`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; color: #1e293b;">
      <div style="background-color: #b45309; color: #ffffff; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="margin: 0; font-size: 18px;">Action Required: Drawing Awaiting Acknowledgement</h2>
      </div>
      <p>Dear <strong>${params.workshopName}</strong> team,</p>
      <p>Drawing revision <strong>${params.revision}</strong> ${params.partName ? `for <strong>${params.partName}</strong>` : ''} was issued and is currently waiting for your acknowledgement.</p>
      <p style="color: #b45309; font-weight: 600;">
        Fabrication stage progression is blocked until drawing acknowledgement is recorded.
      </p>
      <div style="margin-top: 24px; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/drawings" style="background-color: #f97316; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">
          Confirm Drawing Receipt
        </a>
      </div>
    </div>
  `;

  return sendEmail({
    to: params.recipientEmail,
    subject,
    html,
    text: `Drawing revision ${params.revision} is awaiting acknowledgement from ${params.workshopName}. Please log in to acknowledge.`,
  });
}

// ──────────────────────────────────────────────
// 3. Inspection Rejected
// ──────────────────────────────────────────────
export async function sendInspectionRejectedEmail(params: {
  jobId: string;
  partName: string;
  workshopName: string;
  remarks: string;
  recipientEmail?: string;
}): Promise<SendEmailResult> {
  const subject = `[VendorFlow] Quality Inspection REJECTED: Job ${params.jobId}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #fca5a5; color: #1e293b;">
      <div style="background-color: #dc2626; color: #ffffff; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="margin: 0; font-size: 18px;">Quality Inspection Rejected (Rework Required)</h2>
      </div>
      <p>Hello Quality & Fabrication Teams,</p>
      <p>A delivered batch has failed goods receipt quality inspection:</p>
      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 14px 18px; margin: 18px 0; border-radius: 4px;">
        <p style="margin: 4px 0;"><strong>Job ID:</strong> ${params.jobId}</p>
        <p style="margin: 4px 0;"><strong>Part:</strong> ${params.partName}</p>
        <p style="margin: 4px 0;"><strong>Workshop:</strong> ${params.workshopName}</p>
        <p style="margin: 4px 0;"><strong>Rejection Remarks:</strong> <span style="color: #b91c1c;">${params.remarks}</span></p>
      </div>
      <p style="color: #991b1b; font-weight: 600;">
        ⛔ Rule 4 Enforced: Payment is automatically placed ON HOLD for quality until reinspection is passed.
      </p>
      <div style="margin-top: 24px; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/quality" style="background-color: #dc2626; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">
          View Rework Queue
        </a>
      </div>
    </div>
  `;

  return sendEmail({
    to: params.recipientEmail,
    subject,
    html,
    text: `Job ${params.jobId} (${params.partName}) failed quality inspection: ${params.remarks}. Payment on hold.`,
  });
}

// ──────────────────────────────────────────────
// 4. Payment Ready
// ──────────────────────────────────────────────
export async function sendPaymentReadyEmail(params: {
  invoiceNumber: string;
  amount: number;
  workshopName: string;
  jobId: string;
  recipientEmail?: string;
}): Promise<SendEmailResult> {
  const subject = `[VendorFlow] Payment Ready for Approval: Invoice #${params.invoiceNumber}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #bbf7d0; color: #1e293b;">
      <div style="background-color: #166534; color: #ffffff; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="margin: 0; font-size: 18px;">Invoice Payment Ready for Approval</h2>
      </div>
      <p>Hello Finance & Procurement Teams,</p>
      <p>All 3 business prerequisites (Rule 3) have been satisfied for invoice clearance:</p>
      <ul style="color: #15803d; line-height: 1.8;">
        <li>✔ Goods delivery received and logged by Stores</li>
        <li>✔ Quality inspection accepted (Passed)</li>
        <li>✔ Valid tax invoice uploaded</li>
      </ul>
      <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 14px 18px; margin: 18px 0; border-radius: 4px;">
        <p style="margin: 4px 0;"><strong>Invoice Number:</strong> ${params.invoiceNumber}</p>
        <p style="margin: 4px 0;"><strong>Amount:</strong> ₹${params.amount.toLocaleString('en-IN')}</p>
        <p style="margin: 4px 0;"><strong>Workshop:</strong> ${params.workshopName}</p>
        <p style="margin: 4px 0;"><strong>Linked Job:</strong> ${params.jobId}</p>
      </div>
      <div style="margin-top: 24px; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payments" style="background-color: #15803d; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">
          Review & Approve in Payments
        </a>
      </div>
    </div>
  `;

  return sendEmail({
    to: params.recipientEmail,
    subject,
    html,
    text: `Invoice #${params.invoiceNumber} for ₹${params.amount} from ${params.workshopName} is ready for finance approval.`,
  });
}

// ──────────────────────────────────────────────
// 5. Payment Paid
// ──────────────────────────────────────────────
export async function sendPaymentPaidEmail(params: {
  invoiceNumber: string;
  amount: number;
  workshopName: string;
  paymentReference?: string;
  recipientEmail?: string;
}): Promise<SendEmailResult> {
  const subject = `[VendorFlow] Payment Settlement Completed: Invoice #${params.invoiceNumber}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; color: #1e293b;">
      <div style="background-color: #0f766e; color: #ffffff; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="margin: 0; font-size: 18px;">Payment Settlement Processed</h2>
      </div>
      <p>Dear <strong>${params.workshopName}</strong> Finance Team,</p>
      <p>We are pleased to inform you that your invoice has been processed and marked as <strong>Paid</strong>:</p>
      <div style="background-color: #f0fdfa; border-left: 4px solid #14b8a6; padding: 14px 18px; margin: 18px 0; border-radius: 4px;">
        <p style="margin: 4px 0;"><strong>Invoice Number:</strong> ${params.invoiceNumber}</p>
        <p style="margin: 4px 0;"><strong>Settled Amount:</strong> ₹${params.amount.toLocaleString('en-IN')}</p>
        ${params.paymentReference ? `<p style="margin: 4px 0;"><strong>Payment Reference:</strong> ${params.paymentReference}</p>` : ''}
        <p style="margin: 4px 0;"><strong>Settlement Date:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
      </div>
      <p>Thank you for your partnership with Deccan Boilers.</p>
    </div>
  `;

  return sendEmail({
    to: params.recipientEmail,
    subject,
    html,
    text: `Payment of ₹${params.amount} for invoice #${params.invoiceNumber} has been processed for ${params.workshopName}.`,
  });
}
