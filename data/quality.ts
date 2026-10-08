import { getJobs, getDeliveries, getInspections, getDrawings } from './sample';
import { JobRisk } from '@/types';

export interface QualityQueueRow {
  id: string;
  jobId: string;
  partDisplayName: string;
  workshopName: string;
  quantityDelivered: number;
  drawingRevision: string;
  deliveredDate: string;
  risk: JobRisk;
  deliveryId: string;
  statusTab: 'To inspect' | 'Rework' | 'Reinspection due' | 'Completed';
}

export function getQualityQueue(): QualityQueueRow[] {
  const jobs = getJobs();
  const deliveries = getDeliveries();
  const inspections = getInspections();
  const drawings = getDrawings();
  
  const queue: QualityQueueRow[] = [];
  
  for (const delivery of deliveries) {
    const job = jobs.find(j => j.id === delivery.jobId);
    if (!job) continue;
    
    // Latest inspection for this delivery
    const deliveryInspections = inspections
      .filter(i => i.deliveryId === delivery.id)
      .sort((a, b) => new Date(b.inspectedDate).getTime() - new Date(a.inspectedDate).getTime());
      
    const latestInspection = deliveryInspections[0];
    
    let statusTab: QualityQueueRow['statusTab'] = 'To inspect';
    if (!latestInspection || latestInspection.result === 'Pending') {
      statusTab = 'To inspect';
    } else if (latestInspection.result === 'Accepted') {
      statusTab = 'Completed';
    } else if (latestInspection.result === 'Rejected') {
      if (latestInspection.reinspectionDate) {
        statusTab = 'Reinspection due';
      } else {
        statusTab = 'Rework';
      }
    }
    
    let drawingRevision = 'N/A';
    if (job.drawingId) {
      const drawing = drawings.find(d => d.id === job.drawingId);
      if (drawing) {
        drawingRevision = drawing.revision;
      }
    }
    
    queue.push({
      id: delivery.id,
      jobId: job.id,
      partDisplayName: job.partDisplayName,
      workshopName: job.workshopName,
      quantityDelivered: delivery.quantity,
      drawingRevision,
      deliveredDate: delivery.deliveredDate,
      risk: job.risk,
      deliveryId: delivery.id,
      statusTab
    });
  }
  
  return queue;
}
