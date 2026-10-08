'use client';

// ──────────────────────────────────────────────
// VendorFlow – Demo Role Switcher Context
// Lets the team view the app as any of the 10 roles.
// Default role: Procurement (§4).
// ──────────────────────────────────────────────
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { Role } from '@/types';

/** All 10 roles in display order */
export const ALL_ROLES: Role[] = [
  'Procurement',
  'Production',
  'Engineering',
  'Stores',
  'Quality',
  'Finance',
  'Management',
  'Workshop Owner',
  'Workshop Staff',
  'Admin',
];

interface RoleContextValue {
  /** The currently active role */
  role: Role;
  /** Switch to a different role */
  setRole: (role: Role) => void;
  /** All available roles */
  allRoles: Role[];
  /** Whether the current role is a workshop role (phone-first UI) */
  isWorkshopRole: boolean;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>('Procurement');

  const setRole = useCallback((newRole: Role) => {
    setRoleState(newRole);
  }, []);

  const isWorkshopRole = role === 'Workshop Owner' || role === 'Workshop Staff';

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        allRoles: ALL_ROLES,
        isWorkshopRole,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

/**
 * Hook to access the current role and role switcher.
 * Must be used within a <RoleProvider>.
 */
export function useRole(): RoleContextValue {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a <RoleProvider>');
  }
  return context;
}
