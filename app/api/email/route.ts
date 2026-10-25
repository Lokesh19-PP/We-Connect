import { NextResponse } from 'next/server';
import {
  sendDrawingApprovedEmail,
  sendRevisionNotAcknowledgedEmail,
  sendInspectionRejectedEmail,
  sendPaymentReadyEmail,
  sendPaymentPaidEmail,
  type EmailEvent,
} from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const event = body.event as EmailEvent;
    const data = body.data || {};

    let result;

    switch (event) {
      case 'drawing_approved':
        result = await sendDrawingApprovedEmail({
          partName: data.partName || 'Part',
          partCode: data.partCode || '',
          revision: data.revision || 'Rev A',
          changeNote: data.changeNote,
          recipientEmail: data.recipientEmail,
        });
        break;

      case 'revision_not_acknowledged':
        result = await sendRevisionNotAcknowledgedEmail({
          workshopName: data.workshopName || 'Workshop',
          revision: data.revision || 'Rev A',
          partName: data.partName,
          daysWaiting: data.daysWaiting,
          recipientEmail: data.recipientEmail,
        });
        break;

      case 'inspection_rejected':
        result = await sendInspectionRejectedEmail({
          jobId: data.jobId || 'Unknown Job',
          partName: data.partName || 'Fabricated Part',
          workshopName: data.workshopName || 'Workshop',
          remarks: data.remarks || 'Dimensional non-conformance',
          recipientEmail: data.recipientEmail,
        });
        break;

      case 'payment_ready':
        result = await sendPaymentReadyEmail({
          invoiceNumber: data.invoiceNumber || 'INV-001',
          amount: Number(data.amount || 0),
          workshopName: data.workshopName || 'Workshop',
          jobId: data.jobId || '',
          recipientEmail: data.recipientEmail,
        });
        break;

      case 'payment_paid':
        result = await sendPaymentPaidEmail({
          invoiceNumber: data.invoiceNumber || 'INV-001',
          amount: Number(data.amount || 0),
          workshopName: data.workshopName || 'Workshop',
          paymentReference: data.paymentReference,
          recipientEmail: data.recipientEmail,
        });
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Unsupported email event: ${event}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to dispatch email';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
