// ──────────────────────────────────────────────
// VendorFlow – Admin Settings & User Management State (§8)
// Stores users, threshold configs, and rules
// ──────────────────────────────────────────────
import type { Role } from '@/types';

export interface AppUser {
  id: string;
  name: string;
  contact: string; // Email or phone
  role: Role;
  workshopId?: string;
  workshopName?: string;
  status: 'Active' | 'Inactive';
}

export interface ThresholdConfig {
  noUpdateFlagDays: number; // Days without update before flagging vendor (default 2)
  dueDateAlertDays: number; // Days before due date for alerts (default 3)
  drawingAckAlertDays: number; // Days waiting for drawing ack before alert (default 1)
}

// Initial sample users
let usersList: AppUser[] = [
  {
    id: 'u-1',
    name: 'Lokesh TeamLead',
    contact: 'lokesh@deccanboilers.in',
    role: 'Procurement',
    status: 'Active',
  },
  {
    id: 'u-2',
    name: 'Suyash Engg',
    contact: 'suyash@deccanboilers.in',
    role: 'Engineering',
    status: 'Active',
  },
  {
    id: 'u-3',
    name: 'Ramesh Shinde',
    contact: '+91 98230 12345',
    role: 'Workshop Owner',
    workshopId: 'ws-1',
    workshopName: 'Shree Fabricators',
    status: 'Active',
  },
  {
    id: 'u-4',
    name: 'Suresh Patil',
    contact: '+91 98765 43210',
    role: 'Workshop Staff',
    workshopId: 'ws-2',
    workshopName: 'Om Engg Works',
    status: 'Active',
  },
  {
    id: 'u-5',
    name: 'Shiva Quality',
    contact: 'shiva@deccanboilers.in',
    role: 'Quality',
    status: 'Active',
  },
  {
    id: 'u-6',
    name: 'Abhi Finance',
    contact: 'abhi@deccanboilers.in',
    role: 'Finance',
    status: 'Active',
  },
  {
    id: 'u-7',
    name: 'Soham Admin',
    contact: 'admin@deccanboilers.in',
    role: 'Admin',
    status: 'Active',
  },
];

// Initial threshold config
let thresholdConfig: ThresholdConfig = {
  noUpdateFlagDays: 2,
  dueDateAlertDays: 3,
  drawingAckAlertDays: 1,
};

/** Get all users */
export function getUsers(): AppUser[] {
  return [...usersList];
}

/** Add a new user */
export function addUser(user: Omit<AppUser, 'id'>): AppUser {
  const newUser: AppUser = {
    ...user,
    id: `u-${usersList.length + 1}-${Date.now()}`,
  };
  usersList = [newUser, ...usersList];
  return newUser;
}

/** Update existing user */
export function updateUser(id: string, data: Partial<AppUser>): AppUser | undefined {
  const index = usersList.findIndex((u) => u.id === id);
  if (index === -1) return undefined;

  usersList[index] = {
    ...usersList[index],
    ...data,
  };
  return usersList[index];
}

/** Toggle user active / inactive status */
export function toggleUserStatus(id: string): AppUser | undefined {
  const user = usersList.find((u) => u.id === id);
  if (!user) return undefined;
  const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
  return updateUser(id, { status: newStatus });
}

/** Get current threshold config */
export function getThresholdConfig(): ThresholdConfig {
  return { ...thresholdConfig };
}

/** Update threshold config */
export function updateThresholdConfig(config: Partial<ThresholdConfig>): ThresholdConfig {
  thresholdConfig = {
    ...thresholdConfig,
    ...config,
  };
  return { ...thresholdConfig };
}
