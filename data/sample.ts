// ──────────────────────────────────────────────
// VendorFlow – realistic sample data (§8)
// ──────────────────────────────────────────────
import type {
  Workshop,
  Part,
  Drawing,
  DrawingAcknowledgement,
  Job,
  JobStage,
  JobRisk,
  StatusUpdate,
  Delivery,
  Inspection,
  InvoicePayment,
  AssemblySlot,
  AppNotification,
} from '@/types';

// ──────────────────────────────────────────────
// Workshops (6) – §8
// ──────────────────────────────────────────────
const workshops: Workshop[] = [
  {
    id: 'ws-1',
    name: 'Shree Fabricators',
    contactPerson: 'Ramesh Shinde',
    phone: '+91 98230 12345',
    email: 'ramesh@shreefab.in',
    address: '134 MIDC Bhosari, Pune 411026',
    onTimePercent: 96,
    activeJobs: 6,
  },
  {
    id: 'ws-2',
    name: 'Om Engg Works',
    contactPerson: 'Suresh Patil',
    phone: '+91 98765 43210',
    email: 'suresh@omengg.in',
    address: '56 Chakan Industrial Area, Pune 410501',
    onTimePercent: 88,
    activeJobs: 5,
  },
  {
    id: 'ws-3',
    name: 'Patil Steel',
    contactPerson: 'Anil Patil',
    phone: '+91 90112 34567',
    email: 'anil@patilsteel.in',
    address: '22 Hinjawadi Phase II, Pune 411057',
    onTimePercent: 82,
    activeJobs: 4,
    warning: 'No update in 2 days',
  },
  {
    id: 'ws-4',
    name: 'Kulkarni Engineering',
    contactPerson: 'Vijay Kulkarni',
    phone: '+91 88057 65432',
    email: 'vijay@kulkarniengg.in',
    address: '78 Ranjangaon MIDC, Pune 412210',
    onTimePercent: 91,
    activeJobs: 4,
  },
  {
    id: 'ws-5',
    name: 'Deshmukh Metalworks',
    contactPerson: 'Pramod Deshmukh',
    phone: '+91 77200 98765',
    email: 'pramod@deshmukhmet.in',
    address: '103 Sanaswadi, Pune 412208',
    onTimePercent: 94,
    activeJobs: 3,
  },
  {
    id: 'ws-6',
    name: 'Jadhav & Sons',
    contactPerson: 'Mahesh Jadhav',
    phone: '+91 93702 11223',
    email: 'mahesh@jadhavsons.in',
    address: '45 Shirwal Industrial, Satara 412801',
    onTimePercent: 87,
    activeJobs: 3,
  },
];

// ──────────────────────────────────────────────
// Parts (12) – §8
// ──────────────────────────────────────────────
const parts: Part[] = [
  { id: 'p-1', code: 'B-204', name: 'Bracket', displayName: 'Bracket B-204', type: 'Structural' },
  { id: 'p-2', code: 'F-110', name: 'Frame', displayName: 'Frame F-110', type: 'Structural' },
  { id: 'p-3', code: 'S-031', name: 'Stand', displayName: 'Stand S-031', type: 'Support' },
  { id: 'p-4', code: 'H-007', name: 'Handle', displayName: 'Handle H-007', type: 'Accessory' },
  { id: 'p-5', code: 'SP-012', name: 'Support Plate', displayName: 'Support Plate SP-012', type: 'Structural' },
  { id: 'p-6', code: 'G-045', name: 'Gusset', displayName: 'Gusset G-045', type: 'Structural' },
  { id: 'p-7', code: 'R-018', name: 'Rail', displayName: 'Rail R-018', type: 'Structural' },
  { id: 'p-8', code: 'CL-003', name: 'Clamp', displayName: 'Clamp CL-003', type: 'Accessory' },
  { id: 'p-9', code: 'B-205', name: 'Bracket', displayName: 'Bracket B-205', type: 'Structural' },
  { id: 'p-10', code: 'F-111', name: 'Frame', displayName: 'Frame F-111', type: 'Structural' },
  { id: 'p-11', code: 'FL-022', name: 'Flange', displayName: 'Flange FL-022', type: 'Fitting' },
  { id: 'p-12', code: 'NZ-009', name: 'Nozzle', displayName: 'Nozzle NZ-009', type: 'Fitting' },
];

// ──────────────────────────────────────────────
// Drawings with revisions Rev A → Rev C
// ──────────────────────────────────────────────
const drawings: Drawing[] = [
  // Bracket B-204 – Rev A, B, C (only C approved)
  { id: 'd-1', partId: 'p-1', revision: 'Rev A', approved: false, uploadedBy: 'Amit Kumar', uploadedAt: '2026-09-01', fileUrl: '/drawings/B-204_RevA.pdf' },
  { id: 'd-2', partId: 'p-1', revision: 'Rev B', approved: false, uploadedBy: 'Amit Kumar', uploadedAt: '2026-09-10', fileUrl: '/drawings/B-204_RevB.pdf' },
  { id: 'd-3', partId: 'p-1', revision: 'Rev C', approved: true, uploadedBy: 'Amit Kumar', uploadedAt: '2026-09-20', fileUrl: '/drawings/B-204_RevC.pdf' },
  // Frame F-110 – Rev A, B (B approved)
  { id: 'd-4', partId: 'p-2', revision: 'Rev A', approved: false, uploadedBy: 'Priya Sharma', uploadedAt: '2026-09-05', fileUrl: '/drawings/F-110_RevA.pdf' },
  { id: 'd-5', partId: 'p-2', revision: 'Rev B', approved: true, uploadedBy: 'Priya Sharma', uploadedAt: '2026-09-15', fileUrl: '/drawings/F-110_RevB.pdf' },
  // Stand S-031 – Rev A (approved)
  { id: 'd-6', partId: 'p-3', revision: 'Rev A', approved: true, uploadedBy: 'Amit Kumar', uploadedAt: '2026-09-08', fileUrl: '/drawings/S-031_RevA.pdf' },
  // Handle H-007 – Rev A, B (B approved)
  { id: 'd-7', partId: 'p-4', revision: 'Rev A', approved: false, uploadedBy: 'Priya Sharma', uploadedAt: '2026-09-02', fileUrl: '/drawings/H-007_RevA.pdf' },
  { id: 'd-8', partId: 'p-4', revision: 'Rev B', approved: true, uploadedBy: 'Priya Sharma', uploadedAt: '2026-09-18', fileUrl: '/drawings/H-007_RevB.pdf' },
  // Support Plate SP-012 – Rev A (approved)
  { id: 'd-9', partId: 'p-5', revision: 'Rev A', approved: true, uploadedBy: 'Amit Kumar', uploadedAt: '2026-09-12', fileUrl: '/drawings/SP-012_RevA.pdf' },
  // Gusset G-045 – Rev A, B, C (C approved)
  { id: 'd-10', partId: 'p-6', revision: 'Rev A', approved: false, uploadedBy: 'Priya Sharma', uploadedAt: '2026-08-28', fileUrl: '/drawings/G-045_RevA.pdf' },
  { id: 'd-11', partId: 'p-6', revision: 'Rev B', approved: false, uploadedBy: 'Priya Sharma', uploadedAt: '2026-09-06', fileUrl: '/drawings/G-045_RevB.pdf' },
  { id: 'd-12', partId: 'p-6', revision: 'Rev C', approved: true, uploadedBy: 'Amit Kumar', uploadedAt: '2026-09-22', fileUrl: '/drawings/G-045_RevC.pdf' },
  // Rail R-018 – Rev A (approved)
  { id: 'd-13', partId: 'p-7', revision: 'Rev A', approved: true, uploadedBy: 'Amit Kumar', uploadedAt: '2026-09-14', fileUrl: '/drawings/R-018_RevA.pdf' },
  // Clamp CL-003 – Rev A, B (B approved)
  { id: 'd-14', partId: 'p-8', revision: 'Rev A', approved: false, uploadedBy: 'Priya Sharma', uploadedAt: '2026-09-03', fileUrl: '/drawings/CL-003_RevA.pdf' },
  { id: 'd-15', partId: 'p-8', revision: 'Rev B', approved: true, uploadedBy: 'Priya Sharma', uploadedAt: '2026-09-19', fileUrl: '/drawings/CL-003_RevB.pdf' },
  // Bracket B-205 – Rev A (approved)
  { id: 'd-16', partId: 'p-9', revision: 'Rev A', approved: true, uploadedBy: 'Amit Kumar', uploadedAt: '2026-09-16', fileUrl: '/drawings/B-205_RevA.pdf' },
  // Frame F-111 – Rev A (not approved yet)
  { id: 'd-17', partId: 'p-10', revision: 'Rev A', approved: false, uploadedBy: 'Priya Sharma', uploadedAt: '2026-09-25', fileUrl: '/drawings/F-111_RevA.pdf' },
  // Flange FL-022 – Rev A (approved)
  { id: 'd-18', partId: 'p-11', revision: 'Rev A', approved: true, uploadedBy: 'Amit Kumar', uploadedAt: '2026-09-11', fileUrl: '/drawings/FL-022_RevA.pdf' },
  // Nozzle NZ-009 – Rev A, B (B approved)
  { id: 'd-19', partId: 'p-12', revision: 'Rev A', approved: false, uploadedBy: 'Priya Sharma', uploadedAt: '2026-09-04', fileUrl: '/drawings/NZ-009_RevA.pdf' },
  { id: 'd-20', partId: 'p-12', revision: 'Rev B', approved: true, uploadedBy: 'Priya Sharma', uploadedAt: '2026-09-21', fileUrl: '/drawings/NZ-009_RevB.pdf' },
];

// ──────────────────────────────────────────────
// Drawing Acknowledgements
// 3 awaiting acknowledgement (matches §8 dashboard card)
// ──────────────────────────────────────────────
const acknowledgements: DrawingAcknowledgement[] = [
  { id: 'ack-1', drawingId: 'd-3', jobId: 'job-1', workshopId: 'ws-1', acknowledgedAt: '2026-09-22', acknowledgedBy: 'Ramesh Shinde' },
  { id: 'ack-2', drawingId: 'd-5', jobId: 'job-2', workshopId: 'ws-2', acknowledgedAt: '2026-09-17', acknowledgedBy: 'Suresh Patil' },
  { id: 'ack-3', drawingId: 'd-6', jobId: 'job-3', workshopId: 'ws-3', acknowledgedAt: '2026-09-10', acknowledgedBy: 'Anil Patil' },
  { id: 'ack-4', drawingId: 'd-8', jobId: 'job-4', workshopId: 'ws-1', acknowledgedAt: '2026-09-20', acknowledgedBy: 'Ramesh Shinde' },
  { id: 'ack-5', drawingId: 'd-9', jobId: 'job-5', workshopId: 'ws-2', acknowledgedAt: '2026-09-14', acknowledgedBy: 'Suresh Patil' },
  { id: 'ack-6', drawingId: 'd-12', jobId: 'job-6', workshopId: 'ws-4', acknowledgedAt: '2026-09-24', acknowledgedBy: 'Vijay Kulkarni' },
  { id: 'ack-7', drawingId: 'd-13', jobId: 'job-7', workshopId: 'ws-5', acknowledgedAt: '2026-09-16', acknowledgedBy: 'Pramod Deshmukh' },
  { id: 'ack-8', drawingId: 'd-15', jobId: 'job-8', workshopId: 'ws-6', acknowledgedAt: '2026-09-21', acknowledgedBy: 'Mahesh Jadhav' },
  { id: 'ack-9', drawingId: 'd-16', jobId: 'job-9', workshopId: 'ws-4', acknowledgedAt: '2026-09-18', acknowledgedBy: 'Vijay Kulkarni' },
  // 3 NOT acknowledged (awaiting) → dashboard card "3 Awaiting Drawing Acknowledgement"
  { id: 'ack-10', drawingId: 'd-18', jobId: 'job-11', workshopId: 'ws-5', acknowledgedAt: null, acknowledgedBy: null },
  { id: 'ack-11', drawingId: 'd-20', jobId: 'job-12', workshopId: 'ws-6', acknowledgedAt: null, acknowledgedBy: null },
  { id: 'ack-12', drawingId: 'd-3', jobId: 'job-14', workshopId: 'ws-1', acknowledgedAt: null, acknowledgedBy: null },
];

// ──────────────────────────────────────────────
// Jobs (25) – §8: 25 Active Jobs
// ──────────────────────────────────────────────
const jobs: Job[] = [
  // ── Shree Fabricators (ws-1) ──
  { id: 'job-1', partId: 'p-1', workshopId: 'ws-1', partDisplayName: 'Bracket B-204', workshopName: 'Shree Fabricators', orderedDate: '2026-09-15', acceptedDate: '2026-09-16', stage: 'In progress', dueDate: '2026-10-12', risk: 'At risk', quantity: 20, drawingId: 'd-3', notes: 'Priority job for Boiler #12' },
  { id: 'job-4', partId: 'p-4', workshopId: 'ws-1', partDisplayName: 'Handle H-007', workshopName: 'Shree Fabricators', orderedDate: '2026-09-20', acceptedDate: '2026-09-21', stage: 'In progress', dueDate: '2026-10-18', risk: 'On track', quantity: 50, drawingId: 'd-8', notes: '' },
  { id: 'job-13', partId: 'p-9', workshopId: 'ws-1', partDisplayName: 'Bracket B-205', workshopName: 'Shree Fabricators', orderedDate: '2026-09-28', acceptedDate: '2026-09-29', stage: 'Accepted', dueDate: '2026-10-20', risk: 'On track', quantity: 15, drawingId: 'd-16', notes: '' },
  { id: 'job-14', partId: 'p-1', workshopId: 'ws-1', partDisplayName: 'Bracket B-204', workshopName: 'Shree Fabricators', orderedDate: '2026-10-01', acceptedDate: null, stage: 'Ordered', dueDate: '2026-10-22', risk: 'On track', quantity: 30, drawingId: 'd-3', notes: 'Second batch' },
  { id: 'job-19', partId: 'p-5', workshopId: 'ws-1', partDisplayName: 'Support Plate SP-012', workshopName: 'Shree Fabricators', orderedDate: '2026-09-25', acceptedDate: '2026-09-26', stage: 'Ready', dueDate: '2026-10-10', risk: 'On track', quantity: 10, drawingId: 'd-9', notes: '' },
  { id: 'job-24', partId: 'p-11', workshopId: 'ws-1', partDisplayName: 'Flange FL-022', workshopName: 'Shree Fabricators', orderedDate: '2026-10-02', acceptedDate: '2026-10-03', stage: 'In progress', dueDate: '2026-10-15', risk: 'At risk', quantity: 8, drawingId: 'd-18', notes: 'Critical path item' },

  // ── Om Engg Works (ws-2) ──
  { id: 'job-2', partId: 'p-2', workshopId: 'ws-2', partDisplayName: 'Frame F-110', workshopName: 'Om Engg Works', orderedDate: '2026-09-10', acceptedDate: '2026-09-11', stage: 'Delivered', dueDate: '2026-10-08', risk: 'On track', quantity: 12, drawingId: 'd-5', notes: '' },
  { id: 'job-5', partId: 'p-5', workshopId: 'ws-2', partDisplayName: 'Support Plate SP-012', workshopName: 'Om Engg Works', orderedDate: '2026-09-18', acceptedDate: '2026-09-19', stage: 'In progress', dueDate: '2026-10-14', risk: 'On track', quantity: 25, drawingId: 'd-9', notes: '' },
  { id: 'job-15', partId: 'p-7', workshopId: 'ws-2', partDisplayName: 'Rail R-018', workshopName: 'Om Engg Works', orderedDate: '2026-09-22', acceptedDate: '2026-09-23', stage: 'In progress', dueDate: '2026-10-16', risk: 'On track', quantity: 18, drawingId: 'd-13', notes: '' },
  { id: 'job-20', partId: 'p-12', workshopId: 'ws-2', partDisplayName: 'Nozzle NZ-009', workshopName: 'Om Engg Works', orderedDate: '2026-09-30', acceptedDate: '2026-10-01', stage: 'Accepted', dueDate: '2026-10-19', risk: 'On track', quantity: 6, drawingId: 'd-20', notes: '' },
  { id: 'job-25', partId: 'p-6', workshopId: 'ws-2', partDisplayName: 'Gusset G-045', workshopName: 'Om Engg Works', orderedDate: '2026-10-03', acceptedDate: '2026-10-04', stage: 'Accepted', dueDate: '2026-10-21', risk: 'On track', quantity: 14, drawingId: 'd-12', notes: '' },

  // ── Patil Steel (ws-3) ──
  { id: 'job-3', partId: 'p-3', workshopId: 'ws-3', partDisplayName: 'Stand S-031', workshopName: 'Patil Steel', orderedDate: '2026-09-08', acceptedDate: '2026-09-09', stage: 'In progress', dueDate: '2026-10-05', risk: 'Overdue', quantity: 8, drawingId: 'd-6', notes: 'Workshop has gone silent' },
  { id: 'job-10', partId: 'p-2', workshopId: 'ws-3', partDisplayName: 'Frame F-110', workshopName: 'Patil Steel', orderedDate: '2026-09-20', acceptedDate: '2026-09-21', stage: 'In progress', dueDate: '2026-10-06', risk: 'Overdue', quantity: 10, drawingId: 'd-5', notes: '' },
  { id: 'job-16', partId: 'p-8', workshopId: 'ws-3', partDisplayName: 'Clamp CL-003', workshopName: 'Patil Steel', orderedDate: '2026-09-24', acceptedDate: '2026-09-25', stage: 'In progress', dueDate: '2026-10-17', risk: 'On track', quantity: 40, drawingId: 'd-15', notes: '' },
  { id: 'job-21', partId: 'p-1', workshopId: 'ws-3', partDisplayName: 'Bracket B-204', workshopName: 'Patil Steel', orderedDate: '2026-10-01', acceptedDate: '2026-10-02', stage: 'Accepted', dueDate: '2026-10-23', risk: 'On track', quantity: 22, drawingId: 'd-3', notes: '' },

  // ── Kulkarni Engineering (ws-4) ──
  { id: 'job-6', partId: 'p-6', workshopId: 'ws-4', partDisplayName: 'Gusset G-045', workshopName: 'Kulkarni Engineering', orderedDate: '2026-09-12', acceptedDate: '2026-09-13', stage: 'Inspected', dueDate: '2026-10-09', risk: 'Reinspection due', quantity: 16, drawingId: 'd-12', notes: 'Minor weld quality issue' },
  { id: 'job-9', partId: 'p-9', workshopId: 'ws-4', partDisplayName: 'Bracket B-205', workshopName: 'Kulkarni Engineering', orderedDate: '2026-09-16', acceptedDate: '2026-09-17', stage: 'Delivered', dueDate: '2026-10-11', risk: 'On track', quantity: 12, drawingId: 'd-16', notes: '' },
  { id: 'job-17', partId: 'p-4', workshopId: 'ws-4', partDisplayName: 'Handle H-007', workshopName: 'Kulkarni Engineering', orderedDate: '2026-09-26', acceptedDate: '2026-09-27', stage: 'In progress', dueDate: '2026-10-13', risk: 'At risk', quantity: 35, drawingId: 'd-8', notes: '' },
  { id: 'job-22', partId: 'p-3', workshopId: 'ws-4', partDisplayName: 'Stand S-031', workshopName: 'Kulkarni Engineering', orderedDate: '2026-10-02', acceptedDate: '2026-10-03', stage: 'Accepted', dueDate: '2026-10-24', risk: 'On track', quantity: 6, drawingId: 'd-6', notes: '' },

  // ── Deshmukh Metalworks (ws-5) ──
  { id: 'job-7', partId: 'p-7', workshopId: 'ws-5', partDisplayName: 'Rail R-018', workshopName: 'Deshmukh Metalworks', orderedDate: '2026-09-14', acceptedDate: '2026-09-15', stage: 'Paid', dueDate: '2026-10-07', risk: 'On track', quantity: 20, drawingId: 'd-13', notes: 'Completed and paid' },
  { id: 'job-11', partId: 'p-11', workshopId: 'ws-5', partDisplayName: 'Flange FL-022', workshopName: 'Deshmukh Metalworks', orderedDate: '2026-09-22', acceptedDate: '2026-09-23', stage: 'Ordered', dueDate: '2026-10-20', risk: 'On track', quantity: 10, drawingId: 'd-18', notes: '' },
  { id: 'job-23', partId: 'p-5', workshopId: 'ws-5', partDisplayName: 'Support Plate SP-012', workshopName: 'Deshmukh Metalworks', orderedDate: '2026-10-03', acceptedDate: '2026-10-04', stage: 'In progress', dueDate: '2026-10-25', risk: 'On track', quantity: 14, drawingId: 'd-9', notes: '' },

  // ── Jadhav & Sons (ws-6) ──
  { id: 'job-8', partId: 'p-8', workshopId: 'ws-6', partDisplayName: 'Clamp CL-003', workshopName: 'Jadhav & Sons', orderedDate: '2026-09-16', acceptedDate: '2026-09-17', stage: 'Inspected', dueDate: '2026-10-10', risk: 'On track', quantity: 30, drawingId: 'd-15', notes: '' },
  { id: 'job-12', partId: 'p-12', workshopId: 'ws-6', partDisplayName: 'Nozzle NZ-009', workshopName: 'Jadhav & Sons', orderedDate: '2026-09-24', acceptedDate: '2026-09-25', stage: 'Ordered', dueDate: '2026-10-22', risk: 'On track', quantity: 8, drawingId: 'd-20', notes: '' },
  { id: 'job-18', partId: 'p-10', workshopId: 'ws-6', partDisplayName: 'Frame F-111', workshopName: 'Jadhav & Sons', orderedDate: '2026-09-28', acceptedDate: null, stage: 'Ordered', dueDate: '2026-10-15', risk: 'May miss date', quantity: 5, drawingId: 'd-17', notes: 'Drawing not approved yet' },
];

// ──────────────────────────────────────────────
// Status Updates
// ──────────────────────────────────────────────
const statusUpdates: StatusUpdate[] = [
  { id: 'su-1', jobId: 'job-1', workshopId: 'ws-1', status: 'In progress', message: 'Cutting and bending started, material received', photoUrl: null, updatedAt: '2026-09-28', updatedBy: 'Ramesh Shinde' },
  { id: 'su-2', jobId: 'job-2', workshopId: 'ws-2', status: 'Ready for dispatch', message: 'All frames welded and painted, ready for pickup', photoUrl: null, updatedAt: '2026-10-04', updatedBy: 'Suresh Patil' },
  { id: 'su-3', jobId: 'job-4', workshopId: 'ws-1', status: 'Started', message: 'Material procurement in progress', photoUrl: null, updatedAt: '2026-09-25', updatedBy: 'Ramesh Shinde' },
  { id: 'su-4', jobId: 'job-5', workshopId: 'ws-2', status: 'In progress', message: '60% plates cut, welding started', photoUrl: null, updatedAt: '2026-10-02', updatedBy: 'Suresh Patil' },
  { id: 'su-5', jobId: 'job-6', workshopId: 'ws-4', status: 'Ready for dispatch', message: 'Gussets completed, dispatched for inspection', photoUrl: null, updatedAt: '2026-10-01', updatedBy: 'Vijay Kulkarni' },
  { id: 'su-6', jobId: 'job-8', workshopId: 'ws-6', status: 'Ready for dispatch', message: 'All clamps completed and quality-checked', photoUrl: null, updatedAt: '2026-10-05', updatedBy: 'Mahesh Jadhav' },
];

// ──────────────────────────────────────────────
// Deliveries
// ──────────────────────────────────────────────
const deliveries: Delivery[] = [
  { id: 'del-1', jobId: 'job-2', workshopId: 'ws-2', deliveredDate: '2026-10-06', receivedBy: 'Rajendra More', quantity: 12, challanNumber: 'CH-2026-0234', notes: 'All frames in good condition' },
  { id: 'del-2', jobId: 'job-7', workshopId: 'ws-5', deliveredDate: '2026-10-02', receivedBy: 'Rajendra More', quantity: 20, challanNumber: 'CH-2026-0198', notes: '' },
  { id: 'del-3', jobId: 'job-9', workshopId: 'ws-4', deliveredDate: '2026-10-07', receivedBy: 'Sanjay Kale', quantity: 12, challanNumber: 'CH-2026-0251', notes: '' },
  { id: 'del-4', jobId: 'job-8', workshopId: 'ws-6', deliveredDate: '2026-10-06', receivedBy: 'Sanjay Kale', quantity: 30, challanNumber: 'CH-2026-0245', notes: 'Partial shipment – full qty' },
  { id: 'del-5', jobId: 'job-6', workshopId: 'ws-4', deliveredDate: '2026-10-03', receivedBy: 'Rajendra More', quantity: 16, challanNumber: 'CH-2026-0210', notes: '' },
  { id: 'del-6', jobId: 'job-19', workshopId: 'ws-1', deliveredDate: '2026-10-07', receivedBy: 'Sanjay Kale', quantity: 10, challanNumber: 'CH-2026-0260', notes: 'Support plates delivered' },
];

// ──────────────────────────────────────────────
// Inspections
// ──────────────────────────────────────────────
const inspections: Inspection[] = [
  { id: 'insp-1', jobId: 'job-7', deliveryId: 'del-2', inspectedDate: '2026-10-03', inspectedBy: 'Deepak Joshi', result: 'Accepted', remarks: 'All dimensions within tolerance', reinspectionDate: null },
  { id: 'insp-2', jobId: 'job-6', deliveryId: 'del-5', inspectedDate: '2026-10-05', inspectedBy: 'Deepak Joshi', result: 'Rejected', remarks: 'Weld quality below spec on 3 pieces', reinspectionDate: '2026-10-12' },
  { id: 'insp-3', jobId: 'job-8', deliveryId: 'del-4', inspectedDate: '2026-10-07', inspectedBy: 'Neha Kulkarni', result: 'Accepted', remarks: 'All clamps passed', reinspectionDate: null },
  { id: 'insp-4', jobId: 'job-9', deliveryId: 'del-3', inspectedDate: '2026-10-08', inspectedBy: 'Deepak Joshi', result: 'Pending', remarks: 'Inspection scheduled', reinspectionDate: null },
  { id: 'insp-5', jobId: 'job-2', deliveryId: 'del-1', inspectedDate: '2026-10-07', inspectedBy: 'Neha Kulkarni', result: 'Pending', remarks: 'Awaiting QC review', reinspectionDate: null },
];

// ──────────────────────────────────────────────
// Invoice / Payment
// 6 invoices pending (matches §8), plus paid ones
// ──────────────────────────────────────────────
const invoicePayments: InvoicePayment[] = [
  // Paid
  { id: 'inv-1', jobId: 'job-7', workshopId: 'ws-5', invoiceNumber: 'INV-DM-2026-034', invoiceDate: '2026-10-04', amount: 185000, invoiceFileUrl: '/invoices/INV-DM-2026-034.pdf', paymentStatus: 'Paid', paidDate: '2026-10-06', paidAmount: 185000 },
  // Ready (delivery + accepted inspection + invoice)
  { id: 'inv-2', jobId: 'job-8', workshopId: 'ws-6', invoiceNumber: 'INV-JS-2026-019', invoiceDate: '2026-10-07', amount: 92000, invoiceFileUrl: '/invoices/INV-JS-2026-019.pdf', paymentStatus: 'Ready', paidDate: null, paidAmount: null },
  // On hold for quality (inspection rejected / pending)
  { id: 'inv-3', jobId: 'job-6', workshopId: 'ws-4', invoiceNumber: 'INV-KE-2026-041', invoiceDate: '2026-10-05', amount: 124000, invoiceFileUrl: '/invoices/INV-KE-2026-041.pdf', paymentStatus: 'On hold for quality', paidDate: null, paidAmount: null },
  { id: 'inv-4', jobId: 'job-2', workshopId: 'ws-2', invoiceNumber: 'INV-OE-2026-028', invoiceDate: '2026-10-07', amount: 210000, invoiceFileUrl: '/invoices/INV-OE-2026-028.pdf', paymentStatus: 'On hold for quality', paidDate: null, paidAmount: null },
  // Awaiting approval
  { id: 'inv-5', jobId: 'job-9', workshopId: 'ws-4', invoiceNumber: 'INV-KE-2026-042', invoiceDate: '2026-10-08', amount: 78000, invoiceFileUrl: '/invoices/INV-KE-2026-042.pdf', paymentStatus: 'Awaiting approval', paidDate: null, paidAmount: null },
  { id: 'inv-6', jobId: 'job-19', workshopId: 'ws-1', invoiceNumber: 'INV-SF-2026-055', invoiceDate: '2026-10-08', amount: 65000, invoiceFileUrl: '/invoices/INV-SF-2026-055.pdf', paymentStatus: 'Awaiting approval', paidDate: null, paidAmount: null },
  // Not ready (no delivery / no inspection / no invoice yet)
  { id: 'inv-7', jobId: 'job-1', workshopId: 'ws-1', invoiceNumber: '', invoiceDate: '', amount: 0, invoiceFileUrl: '', paymentStatus: 'Not ready', paidDate: null, paidAmount: null },
  { id: 'inv-8', jobId: 'job-3', workshopId: 'ws-3', invoiceNumber: '', invoiceDate: '', amount: 0, invoiceFileUrl: '', paymentStatus: 'Not ready', paidDate: null, paidAmount: null },
  // More awaiting approval to reach 4 total
  { id: 'inv-9', jobId: 'job-5', workshopId: 'ws-2', invoiceNumber: 'INV-OE-2026-030', invoiceDate: '2026-10-06', amount: 145000, invoiceFileUrl: '/invoices/INV-OE-2026-030.pdf', paymentStatus: 'Awaiting approval', paidDate: null, paidAmount: null },
  { id: 'inv-10', jobId: 'job-4', workshopId: 'ws-1', invoiceNumber: 'INV-SF-2026-056', invoiceDate: '2026-10-07', amount: 55000, invoiceFileUrl: '/invoices/INV-SF-2026-056.pdf', paymentStatus: 'Awaiting approval', paidDate: null, paidAmount: null },
  // More paid to reach 12 "Received" total
  { id: 'inv-11', jobId: 'job-7', workshopId: 'ws-5', invoiceNumber: 'INV-DM-2026-029', invoiceDate: '2026-09-20', amount: 45000, invoiceFileUrl: '/invoices/INV-DM-2026-029.pdf', paymentStatus: 'Paid', paidDate: '2026-09-25', paidAmount: 45000 },
  { id: 'inv-12', jobId: 'job-7', workshopId: 'ws-5', invoiceNumber: 'INV-DM-2026-030', invoiceDate: '2026-09-22', amount: 52000, invoiceFileUrl: '/invoices/INV-DM-2026-030.pdf', paymentStatus: 'Paid', paidDate: '2026-09-28', paidAmount: 52000 },
  { id: 'inv-13', jobId: 'job-8', workshopId: 'ws-6', invoiceNumber: 'INV-JS-2026-014', invoiceDate: '2026-09-18', amount: 38000, invoiceFileUrl: '/invoices/INV-JS-2026-014.pdf', paymentStatus: 'Paid', paidDate: '2026-09-24', paidAmount: 38000 },
  { id: 'inv-14', jobId: 'job-8', workshopId: 'ws-6', invoiceNumber: 'INV-JS-2026-015', invoiceDate: '2026-09-25', amount: 41000, invoiceFileUrl: '/invoices/INV-JS-2026-015.pdf', paymentStatus: 'Paid', paidDate: '2026-10-01', paidAmount: 41000 },
  { id: 'inv-15', jobId: 'job-9', workshopId: 'ws-4', invoiceNumber: 'INV-KE-2026-035', invoiceDate: '2026-09-19', amount: 67000, invoiceFileUrl: '/invoices/INV-KE-2026-035.pdf', paymentStatus: 'Paid', paidDate: '2026-09-26', paidAmount: 67000 },
  { id: 'inv-16', jobId: 'job-6', workshopId: 'ws-4', invoiceNumber: 'INV-KE-2026-036', invoiceDate: '2026-09-21', amount: 73000, invoiceFileUrl: '/invoices/INV-KE-2026-036.pdf', paymentStatus: 'Paid', paidDate: '2026-09-29', paidAmount: 73000 },
  { id: 'inv-17', jobId: 'job-2', workshopId: 'ws-2', invoiceNumber: 'INV-OE-2026-022', invoiceDate: '2026-09-15', amount: 95000, invoiceFileUrl: '/invoices/INV-OE-2026-022.pdf', paymentStatus: 'Paid', paidDate: '2026-09-22', paidAmount: 95000 },
  { id: 'inv-18', jobId: 'job-1', workshopId: 'ws-1', invoiceNumber: 'INV-SF-2026-048', invoiceDate: '2026-09-17', amount: 82000, invoiceFileUrl: '/invoices/INV-SF-2026-048.pdf', paymentStatus: 'Paid', paidDate: '2026-09-24', paidAmount: 82000 },
  { id: 'inv-19', jobId: 'job-3', workshopId: 'ws-3', invoiceNumber: 'INV-PS-2026-011', invoiceDate: '2026-09-16', amount: 55000, invoiceFileUrl: '/invoices/INV-PS-2026-011.pdf', paymentStatus: 'Paid', paidDate: '2026-09-23', paidAmount: 55000 },
  { id: 'inv-20', jobId: 'job-5', workshopId: 'ws-2', invoiceNumber: 'INV-OE-2026-024', invoiceDate: '2026-09-23', amount: 48000, invoiceFileUrl: '/invoices/INV-OE-2026-024.pdf', paymentStatus: 'Paid', paidDate: '2026-09-30', paidAmount: 48000 },
  { id: 'inv-21', jobId: 'job-4', workshopId: 'ws-1', invoiceNumber: 'INV-SF-2026-050', invoiceDate: '2026-09-20', amount: 32000, invoiceFileUrl: '/invoices/INV-SF-2026-050.pdf', paymentStatus: 'Paid', paidDate: '2026-09-27', paidAmount: 32000 },
  { id: 'inv-22', jobId: 'job-10', workshopId: 'ws-3', invoiceNumber: 'INV-PS-2026-013', invoiceDate: '2026-09-28', amount: 61000, invoiceFileUrl: '/invoices/INV-PS-2026-013.pdf', paymentStatus: 'Paid', paidDate: '2026-10-05', paidAmount: 61000 },
];

// ──────────────────────────────────────────────
// Assembly Calendar Slots (§8)
// ──────────────────────────────────────────────
const assemblySlots: AssemblySlot[] = [
  { date: '2026-10-09', needed: 60, ready: 45 },
  { date: '2026-10-12', needed: 80, ready: 80 },
  { date: '2026-10-15', needed: 40, ready: 28 },
  { date: '2026-10-19', needed: 30, ready: 30 },
  { date: '2026-10-22', needed: 55, ready: 42 },
  { date: '2026-10-24', needed: 35, ready: 35 },
  { date: '2026-10-26', needed: 45, ready: 38 },
  { date: '2026-10-29', needed: 70, ready: 65 },
  { date: '2026-11-02', needed: 50, ready: 50 },
  { date: '2026-11-05', needed: 65, ready: 48 },
  { date: '2026-11-09', needed: 40, ready: 40 },
  { date: '2026-11-12', needed: 55, ready: 50 },
  { date: '2026-11-15', needed: 30, ready: 25 },
  { date: '2026-11-19', needed: 45, ready: 45 },
];

// ──────────────────────────────────────────────
// Notifications
// ──────────────────────────────────────────────
const notifications: AppNotification[] = [
  { id: 'n-1', title: 'Overdue: Stand S-031', message: 'Job job-3 at Patil Steel is past due date (05 Oct)', type: 'error', link: '/jobs', read: false, createdAt: '2026-10-06', forRoles: ['Procurement', 'Production', 'Management'] },
  { id: 'n-2', title: 'Inspection rejected', message: 'Gusset G-045 from Kulkarni Engineering failed inspection – weld quality', type: 'warning', link: '/quality', read: false, createdAt: '2026-10-05', forRoles: ['Quality', 'Procurement'] },
  { id: 'n-3', title: 'Drawing awaiting acknowledgement', message: 'Flange FL-022 Rev A sent to Deshmukh Metalworks – no ack yet', type: 'info', link: '/drawings', read: false, createdAt: '2026-10-04', forRoles: ['Engineering', 'Procurement'] },
  { id: 'n-4', title: 'Payment ready', message: 'Clamp CL-003 from Jadhav & Sons – invoice ready for approval', type: 'success', link: '/payments', read: true, createdAt: '2026-10-07', forRoles: ['Finance'] },
  { id: 'n-5', title: 'No update from Patil Steel', message: 'Workshop C has not posted an update in 2 days', type: 'warning', link: '/vendors', read: false, createdAt: '2026-10-07', forRoles: ['Procurement'] },
];

// ──────────────────────────────────────────────
// Getters (thin functions – Supabase replaces later)
// ──────────────────────────────────────────────

export function getJobs(): Job[] {
  return jobs;
}

export function getJob(id: string): Job | undefined {
  return jobs.find((j) => j.id === id);
}

export function getWorkshops(): Workshop[] {
  return workshops;
}

export function getWorkshop(id: string): Workshop | undefined {
  return workshops.find((w) => w.id === id);
}

export function getParts(): Part[] {
  return parts;
}

export function getPart(id: string): Part | undefined {
  return parts.find((p) => p.id === id);
}

export function getDrawings(): Drawing[] {
  return drawings;
}

export function getDrawing(id: string): Drawing | undefined {
  return drawings.find((d) => d.id === id);
}

export function getDrawingsForPart(partId: string): Drawing[] {
  return drawings.filter((d) => d.partId === partId);
}

export function getAcknowledgements(): DrawingAcknowledgement[] {
  return acknowledgements;
}

export function getAcknowledgementsForJob(jobId: string): DrawingAcknowledgement[] {
  return acknowledgements.filter((a) => a.jobId === jobId);
}

export function getStatusUpdates(): StatusUpdate[] {
  return statusUpdates;
}

export function getStatusUpdatesForJob(jobId: string): StatusUpdate[] {
  return statusUpdates.filter((s) => s.jobId === jobId);
}

export function getDeliveries(): Delivery[] {
  return deliveries;
}

export function getDeliveriesForJob(jobId: string): Delivery[] {
  return deliveries.filter((d) => d.jobId === jobId);
}

export function getInspections(): Inspection[] {
  return inspections;
}

export function getInspectionsForJob(jobId: string): Inspection[] {
  return inspections.filter((i) => i.jobId === jobId);
}

export function getInvoicePayments(): InvoicePayment[] {
  return invoicePayments;
}

export function getInvoicePaymentsForJob(jobId: string): InvoicePayment[] {
  return invoicePayments.filter((p) => p.jobId === jobId);
}

export function getAssemblySlots(): AssemblySlot[] {
  return assemblySlots;
}

export function getNotifications(): AppNotification[] {
  return notifications;
}

export function getNotificationsForRole(role: string): AppNotification[] {
  return notifications.filter(
    (n) => n.forRoles.length === 0 || n.forRoles.includes(role as import('@/types').Role)
  );
}
