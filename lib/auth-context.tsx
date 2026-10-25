'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Role } from '@/types';
import type { User } from '@supabase/supabase-js';

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

export const DB_TO_ROLE: Record<string, Role> = {
  procurement: 'Procurement',
  production: 'Production',
  engineering: 'Engineering',
  stores: 'Stores',
  quality: 'Quality',
  finance: 'Finance',
  management: 'Management',
  workshop_owner: 'Workshop Owner',
  workshop_staff: 'Workshop Staff',
  admin: 'Admin',
};

export const ROLE_TO_DB: Record<Role, string> = {
  Procurement: 'procurement',
  Production: 'production',
  Engineering: 'engineering',
  Stores: 'stores',
  Quality: 'quality',
  Finance: 'finance',
  Management: 'management',
  'Workshop Owner': 'workshop_owner',
  'Workshop Staff': 'workshop_staff',
  Admin: 'admin',
};

export interface UserProfile {
  id: string;
  name: string;
  email: string | null;
  role: Role;
  workshopId: string | null;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  /** Effective role (if admin uses 'view as', reflects simulated role; otherwise real role) */
  role: Role;
  /** Authenticated user's real database role */
  realRole: Role;
  workshopId: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  isWorkshopRole: boolean;
  viewAsRole: Role | null;
  setViewAsRole: (role: Role | null) => void;
  signOut: () => Promise<void>;
  allRoles: Role[];
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [realRole, setRealRole] = useState<Role>('Procurement');
  const [viewAsRole, setViewAsRole] = useState<Role | null>(null);
  const [workshopId, setWorkshopId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const supabase = createClient();

  const fetchProfile = useCallback(async (authUser: User) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, workshop_id')
        .eq('id', authUser.id)
        .single();

      if (error || !data) {
        // Fallback using user metadata if public.users record is pending
        const metaRole = (authUser.user_metadata?.role as string) || 'procurement';
        const mappedRole = DB_TO_ROLE[metaRole] || 'Procurement';
        const fallbackProfile: UserProfile = {
          id: authUser.id,
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email || null,
          role: mappedRole,
          workshopId: authUser.user_metadata?.workshop_id || null,
        };
        setProfile(fallbackProfile);
        setRealRole(mappedRole);
        setWorkshopId(fallbackProfile.workshopId);
        return;
      }

      const mappedRole = DB_TO_ROLE[data.role] || 'Procurement';
      const userProfile: UserProfile = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: mappedRole,
        workshopId: data.workshop_id,
      };

      setProfile(userProfile);
      setRealRole(mappedRole);
      setWorkshopId(data.workshop_id);
    } catch {
      // In case of network error, use safe defaults
      setRealRole('Procurement');
    }
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user && mounted) {
          setUser(session.user);
          await fetchProfile(session.user);
        } else if (mounted) {
          setUser(null);
          setProfile(null);
        }
      } catch {
        // Safe build / client fallback
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
        setViewAsRole(null);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setUser(null);
      setProfile(null);
      setViewAsRole(null);
      router.push('/login');
    }
  }, [supabase, router]);

  const isAdmin = realRole === 'Admin';
  // If user is Admin and has chosen a simulated view-as role, use that; otherwise real role
  const effectiveRole: Role = isAdmin && viewAsRole ? viewAsRole : realRole;
  const isWorkshopRole = effectiveRole === 'Workshop Owner' || effectiveRole === 'Workshop Staff';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: effectiveRole,
        realRole,
        workshopId,
        isLoading,
        isAdmin,
        isWorkshopRole,
        viewAsRole,
        setViewAsRole,
        signOut,
        allRoles: ALL_ROLES,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return context;
}
