// ──────────────────────────────────────────────
// VendorFlow – Role-based permissions (§4)
// ──────────────────────────────────────────────
import type { Role } from '@/types';

/** All permission actions in the app */
export type Action =
  | 'job.create'
  | 'job.view'
  | 'job.edit'
  | 'drawing.upload'
  | 'drawing.approve'
  | 'drawing.acknowledge'
  | 'inspection.record'
  | 'inspection.view'
  | 'delivery.record'
  | 'delivery.view'
  | 'payment.approve'
  | 'payment.view'
  | 'payment.upload_invoice'
  | 'vendor.manage'
  | 'vendor.view'
  | 'status.update'
  | 'report.view'
  | 'settings.manage'
  | 'user.manage'
  | 'reminder.send'
  | 'assembly.view';

/**
 * Permission matrix – maps each role to the set of actions it can perform.
 * Follows AGENTS.md §4 exactly.
 */
const permissionMatrix: Record<Role, Set<Action>> = {
  Procurement: new Set([
    'job.create', 'job.view', 'job.edit',
    'vendor.manage', 'vendor.view',
    'reminder.send',
    'delivery.view',
    'inspection.view',
    'payment.view',
    'report.view',
    'assembly.view',
  ]),
  Production: new Set([
    'job.view',
    'delivery.view',
    'inspection.view',
    'assembly.view',
    'report.view',
  ]),
  Engineering: new Set([
    'job.view',
    'drawing.upload', 'drawing.approve',
    'report.view',
  ]),
  Stores: new Set([
    'job.view',
    'delivery.record', 'delivery.view',
    'inspection.view',
  ]),
  Quality: new Set([
    'job.view',
    'inspection.record', 'inspection.view',
    'delivery.view',
    'report.view',
  ]),
  Finance: new Set([
    'job.view',
    'payment.approve', 'payment.view',
    'report.view',
  ]),
  Management: new Set([
    'job.view',
    'delivery.view',
    'inspection.view',
    'payment.view',
    'report.view',
    'assembly.view',
    'vendor.view',
  ]),
  'Workshop Owner': new Set([
    'job.view',
    'payment.upload_invoice',
    'payment.view',
    'status.update',
    'drawing.acknowledge',
  ]),
  'Workshop Staff': new Set([
    'job.view',
    'drawing.acknowledge',
    'status.update',
  ]),
  Admin: new Set([
    'job.create', 'job.view', 'job.edit',
    'drawing.upload', 'drawing.approve', 'drawing.acknowledge',
    'inspection.record', 'inspection.view',
    'delivery.record', 'delivery.view',
    'payment.approve', 'payment.view', 'payment.upload_invoice',
    'vendor.manage', 'vendor.view',
    'status.update',
    'report.view',
    'settings.manage',
    'user.manage',
    'reminder.send',
    'assembly.view',
  ]),
};

/**
 * Check whether a role is allowed to perform an action.
 */
export function can(role: Role, action: Action): boolean {
  const allowed = permissionMatrix[role];
  if (!allowed) return false;
  return allowed.has(action);
}

/**
 * Get all actions a role can perform.
 */
export function getActionsForRole(role: Role): Action[] {
  const allowed = permissionMatrix[role];
  return allowed ? Array.from(allowed) : [];
}

/**
 * Sidebar items each role can see.
 * Maps route paths to the minimum action needed to view that page.
 */
export const routePermissions: Record<string, Action> = {
  '/': 'job.view',           // Dashboard – everyone with job.view
  '/rfqs': 'job.create',     // RFQs – procurement / admin
  '/jobs': 'job.view',
  '/vendors': 'vendor.view',
  '/quality': 'inspection.view',
  '/deliveries': 'delivery.view',
  '/payments': 'payment.view',
  '/reports': 'report.view',
  '/settings': 'settings.manage',
  '/drawings': 'drawing.upload',
};
