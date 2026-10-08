// ──────────────────────────────────────────────
// VendorFlow – In-App Notifications State (§8)
// Interactive state for bell dropdown and notification center
// ──────────────────────────────────────────────
import type { AppNotification, Role } from '@/types';

// Sample notifications covering all requirements (§8 & Prompt 4)
let notificationsList: AppNotification[] = [
  {
    id: 'n-1',
    title: 'New drawing revision approved',
    message: 'Rev B for Bracket B-204 approved by Engineering. Sent to open workshops.',
    type: 'info',
    link: '/drawings',
    read: false,
    createdAt: '2026-10-08 14:30',
    forRoles: ['Procurement', 'Engineering', 'Production', 'Admin'],
  },
  {
    id: 'n-2',
    title: 'Revision not acknowledged',
    message: 'Rev B for Frame F-110 sent to Om Engg Works – no ack after 2 working days.',
    type: 'warning',
    link: '/drawings',
    read: false,
    createdAt: '2026-10-08 12:15',
    forRoles: ['Procurement', 'Engineering', 'Admin'],
  },
  {
    id: 'n-3',
    title: 'Job nearing due date',
    message: 'Stand S-031 (Patil Steel) is due in 2 days (10 Oct) and needed for assembly.',
    type: 'warning',
    link: '/jobs',
    read: false,
    createdAt: '2026-10-08 10:00',
    forRoles: ['Procurement', 'Production', 'Management', 'Admin'],
  },
  {
    id: 'n-4',
    title: 'No update from Patil Steel',
    message: 'Workshop C (Patil Steel) has not posted a status update in 2 days.',
    type: 'warning',
    link: '/vendors',
    read: false,
    createdAt: '2026-10-07 17:45',
    forRoles: ['Procurement', 'Management', 'Admin'],
  },
  {
    id: 'n-5',
    title: 'Inspection rejected',
    message: 'Gusset G-045 from Kulkarni Engineering failed quality inspection. Rework logged.',
    type: 'error',
    link: '/quality',
    read: false,
    createdAt: '2026-10-07 15:20',
    forRoles: ['Quality', 'Procurement', 'Management', 'Admin'],
  },
  {
    id: 'n-6',
    title: 'Payment ready for approval',
    message: 'Invoice #INV-204 (₹1,50,000) from Shree Fabricators is ready for Finance approval.',
    type: 'success',
    link: '/payments',
    read: false,
    createdAt: '2026-10-07 11:30',
    forRoles: ['Finance', 'Procurement', 'Admin'],
  },
  {
    id: 'n-7',
    title: 'Payment processed',
    message: 'Payment of ₹1,20,000 to Om Engg Works marked as paid (Ref #TXN-9982).',
    type: 'success',
    link: '/payments',
    read: true,
    createdAt: '2026-10-06 16:00',
    forRoles: ['Finance', 'Workshop Owner', 'Procurement', 'Admin'],
  },
];

/** Get notifications relevant for a given role */
export function getNotificationsForRoleState(role: Role): AppNotification[] {
  return notificationsList.filter(
    (n) => n.forRoles.length === 0 || n.forRoles.includes(role)
  );
}

/** Get count of unread notifications for role */
export function getUnreadCountForRole(role: Role): number {
  return getNotificationsForRoleState(role).filter((n) => !n.read).length;
}

/** Mark a single notification as read */
export function markNotificationAsRead(id: string): AppNotification[] {
  notificationsList = notificationsList.map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
  return [...notificationsList];
}

/** Mark all notifications as read for role */
export function markAllNotificationsAsRead(role: Role): AppNotification[] {
  notificationsList = notificationsList.map((n) => {
    if (n.forRoles.length === 0 || n.forRoles.includes(role)) {
      return { ...n, read: true };
    }
    return n;
  });
  return [...notificationsList];
}
