import { getParts as getSampleParts, getDrawings as getSampleDrawings, getAcknowledgements as getSampleAcks, getJobs } from '@/data/sample';
import { Part, Drawing, DrawingAcknowledgement, Job } from '@/types';
import { canApproveDrawing } from '@/lib/rules';

// Mutable store for the session
let parts: Part[] = [...getSampleParts()];
let drawings: Drawing[] = [...getSampleDrawings()];
let acknowledgements: DrawingAcknowledgement[] = [...getSampleAcks()];

export function getParts(): Part[] {
  return parts;
}

export function getDrawings(): Drawing[] {
  return drawings;
}

export function getDrawingsForPart(partId: string): Drawing[] {
  return drawings.filter(d => d.partId === partId);
}

export function getAcknowledgements(): DrawingAcknowledgement[] {
  return acknowledgements;
}

export function addDrawing(drawing: Omit<Drawing, 'id' | 'uploadedAt' | 'approved'>) {
  const newDrawing: Drawing = {
    ...drawing,
    id: `d-${Date.now()}`,
    uploadedAt: new Date().toISOString().split('T')[0],
    approved: false, // starts as pending approval
  };
  drawings = [...drawings, newDrawing];
  return newDrawing;
}

export function approveDrawing(drawingId: string, approverName: string): { success: boolean; notifiedCount: number; error?: string; updatedDrawings: Drawing[] } {
  const drawingIndex = drawings.findIndex(d => d.id === drawingId);
  if (drawingIndex === -1) return { success: false, notifiedCount: 0, error: 'Drawing not found', updatedDrawings: drawings };

  const drawing = drawings[drawingIndex];
  
  // Revoke currently approved drawing for this part to satisfy Rule 1
  const updatedDrawingsList = drawings.map(d => {
    if (d.partId === drawing.partId && d.approved) {
      return { ...d, approved: false };
    }
    return d;
  });

  // Now the new drawing can be safely approved, let's verify with rule:
  const newDrawingDraft = {
    ...drawing,
    approved: true,
    approvedBy: approverName,
    approvedAt: new Date().toISOString().split('T')[0]
  };

  const check = canApproveDrawing(newDrawingDraft, updatedDrawingsList);
  if (!check.allowed) {
    return { success: false, notifiedCount: 0, error: check.reason, updatedDrawings: drawings };
  }

  const targetIndex = updatedDrawingsList.findIndex(d => d.id === drawingId);
  updatedDrawingsList[targetIndex] = newDrawingDraft;

  drawings = updatedDrawingsList;

  // Find unique workshops with open jobs for this part
  const jobs = getJobs();
  const openJobs = jobs.filter(j => j.partId === drawing.partId && !['Delivered', 'Inspected', 'Paid'].includes(j.stage));
  const uniqueWorkshops = new Set(openJobs.map(j => j.workshopId));

  return { success: true, notifiedCount: uniqueWorkshops.size, updatedDrawings: drawings };
}
