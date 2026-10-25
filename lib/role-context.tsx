'use client';

// ──────────────────────────────────────────────
// VendorFlow – Unified Role & Auth Context Bridge
// Bridges authenticated Supabase user role with role-aware UI.
// ──────────────────────────────────────────────
import { createContext, useContext, type ReactNode } from 'react';
import { AuthProvider, useAuth, ALL_ROLES } from '@/lib/auth-context';
import type { Role } from '@/types';

export { ALL_ROLES };

interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
  allRoles: Role[];
  isWorkshopRole: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

function RoleBridgeConsumer({ children }: { children: ReactNode }) {
  const { role, setViewAsRole, isAdmin, isWorkshopRole, signOut } = useAuth();

  const setRole = (newRole: Role) => {
    if (isAdmin) {
      setViewAsRole(newRole);
    }
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        allRoles: ALL_ROLES,
        isWorkshopRole,
        isAdmin,
        signOut,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function RoleProvider({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <RoleBridgeConsumer>{children}</RoleBridgeConsumer>
    </AuthProvider>
  );
}

export function useRole(): RoleContextValue {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a <RoleProvider>');
  }
  return context;
}
