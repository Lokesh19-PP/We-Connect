import { Drawing } from '@/types';

export function getDrawingStatus(drawing: Drawing, allDrawingsForPart: Drawing[]): 'Approved' | 'Superseded' | 'Pending approval' {
  if (drawing.approved) return 'Approved';
  
  const approvedDrawing = allDrawingsForPart.find(d => d.approved);
  if (approvedDrawing && drawing.uploadedAt < approvedDrawing.uploadedAt) {
    return 'Superseded';
  }
  
  const latestDrawing = [...allDrawingsForPart].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))[0];
  if (drawing.id !== latestDrawing.id) {
    return 'Superseded';
  }
  
  return 'Pending approval';
}
