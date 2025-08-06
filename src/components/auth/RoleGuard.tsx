'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/AuthContext';
import { ROLES, hasPermission, PERMISSIONS } from '@/lib/permissions';
import { Loader2 } from 'lucide-react';
import type { Role } from '@/types';

interface RoleGuardProps {
  children: ReactNode;
  requiredRole?: keyof typeof ROLES;
  requiredPermission?: typeof PERMISSIONS[keyof typeof PERMISSIONS] | (typeof PERMISSIONS[keyof typeof PERMISSIONS])[];
  showForbidden?: boolean;
  loadingComponent?: ReactNode;
}

export function RoleGuard({
  children,
  requiredRole,
  requiredPermission,
  showForbidden = true,
  loadingComponent,
}: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Show loading state while checking auth
  if (isLoading || !user) {
    return loadingComponent || (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Check role if required
  const hasRequiredRole = !requiredRole || user.role === requiredRole.toLowerCase();
  
  // Check permission if required
  const hasRequiredPerm = !requiredPermission || 
    hasPermission(user.role.toLowerCase() as Role, requiredPermission);

  // If user has the required role and permission, render children
  if (hasRequiredRole && hasRequiredPerm) {
    return <>{children}</>;
  }

  // If we shouldn't show forbidden state, return null
  if (!showForbidden) {
    return null;
  }

  // Otherwise, show forbidden state
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">
          You don't have permission to access this page.
        </p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

// Helper components for common role-based guards
export function AdminOnly({ children, ...props }: Omit<RoleGuardProps, 'requiredRole'>) {
  return (
    <RoleGuard requiredRole="ADMIN" {...props}>
      {children}
    </RoleGuard>
  );
}

export function ClientOnly({ children, ...props }: Omit<RoleGuardProps, 'requiredRole'>) {
  return (
    <RoleGuard requiredRole="CLIENT" {...props}>
      {children}
    </RoleGuard>
  );
}

export function FreelancerOnly({ children, ...props }: Omit<RoleGuardProps, 'requiredRole'>) {
  return (
    <RoleGuard requiredRole="FREELANCER" {...props}>
      {children}
    </RoleGuard>
  );
}
