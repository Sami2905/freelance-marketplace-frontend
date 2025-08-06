import { useAuth } from '@/app/AuthContext';
import { hasPermission as checkPermission, ROLES } from '@/lib/permissions';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

type Role = typeof ROLES[keyof typeof ROLES];

/**
 * Hook to check if the current user has specific permissions
 */
export function usePermissions(requiredPermission?: string | string[]) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoadingCheck, setIsLoadingCheck] = useState(true);

  useEffect(() => {
    if (isLoading) {
      setIsLoadingCheck(true);
      return;
    }

    if (!user) {
      setIsAuthorized(false);
      setIsLoadingCheck(false);
      return;
    }

    // If no specific permission is required, just check if user is authenticated
    if (!requiredPermission) {
      setIsAuthorized(true);
      setIsLoadingCheck(false);
      return;
    }

    // Check if user has the required permission
    const hasPerm = checkPermission(user.role as Role, requiredPermission as any);
    setIsAuthorized(hasPerm);
    setIsLoadingCheck(false);
  }, [user, isLoading, requiredPermission, pathname]);

  return {
    isAuthorized,
    isLoading: isLoading || isLoadingCheck,
    userRole: user?.role,
    hasPermission: (permission: string | string[]) => {
      if (!user) return false;
      return checkPermission(user.role as Role, permission as any);
    },
    hasAnyRole: (...roles: string[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
  };
}

/**
 * Hook to check if the current user has a specific role
 */
export function useRole(requiredRole: keyof typeof ROLES) {
  const { user, isLoading } = useAuth();
  const [hasRole, setHasRole] = useState(false);
  const [isLoadingCheck, setIsLoadingCheck] = useState(true);

  useEffect(() => {
    if (isLoading) {
      setIsLoadingCheck(true);
      return;
    }

    setHasRole(user?.role === ROLES[requiredRole]);
    setIsLoadingCheck(false);
  }, [user, isLoading, requiredRole]);

  return {
    hasRole,
    isLoading: isLoading || isLoadingCheck,
  };
}

/**
 * Hook to get the current user's role
 */
export function useUserRole() {
  const { user } = useAuth();
  return user?.role as keyof typeof ROLES | null;
}

/**
 * Hook to check if the current user is an admin
 */
export function useIsAdmin() {
  const { hasRole, isLoading } = useRole('ADMIN');
  return { isAdmin: hasRole, isLoading };
}

/**
 * Hook to check if the current user is a client
 */
export function useIsClient() {
  const { hasRole, isLoading } = useRole('CLIENT');
  return { isClient: hasRole, isLoading };
}

/**
 * Hook to check if the current user is a freelancer
 */
export function useIsFreelancer() {
  const { hasRole, isLoading } = useRole('FREELANCER');
  return { isFreelancer: hasRole, isLoading };
}
