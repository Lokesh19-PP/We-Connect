import { getParts as getSampleParts, getDrawings as getSampleDrawings, getAcknowledgements as getSampleAcks } from '@/data/sample';
import { Part, Drawing, DrawingAcknowledgement } from '@/types';

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
