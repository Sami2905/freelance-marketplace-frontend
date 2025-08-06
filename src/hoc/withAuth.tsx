import { ComponentType, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/app/AuthContext';
import { ROLES } from '@/lib/permissions';

interface WithAuthProps {
  user: any; // Replace with your user type
}

interface Options {
  requiredRole?: keyof typeof ROLES;
  requiredPermission?: string | string[];
  redirectTo?: string;
  loadingComponent?: React.ReactNode;
}

/**
 * Higher-Order Component for protecting routes based on authentication and permissions
 */
function withAuth<T extends WithAuthProps>(
  WrappedComponent: ComponentType<T>,
  options: Options = {}
) {
  const { 
    requiredRole, 
    requiredPermission, 
    redirectTo = '/login',
    loadingComponent = (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    ),
  } = options;

  return function WithAuthWrapper(props: Omit<T, keyof WithAuthProps>) {
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
      if (isLoading) return;

      // If user is not authenticated, redirect to login
      if (!user) {
        router.push(`${redirectTo}?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      // Check role if required
      const hasRequiredRole = !requiredRole || user.role === requiredRole.toLowerCase();
      
      // Check permission if required
      const hasRequiredPermission = !requiredPermission || 
        (Array.isArray(requiredPermission)
          ? requiredPermission.some(perm => 
              user.permissions?.includes(perm)
            )
          : user.permissions?.includes(requiredPermission));

      if (!hasRequiredRole || !hasRequiredPermission) {
        router.push('/unauthorized');
        return;
      }

      setIsAuthorized(true);
      setIsChecking(false);
    }, [user, isLoading, requiredRole, requiredPermission, router, redirectTo]);

    if (isLoading || isChecking) {
      return <>{loadingComponent}</>;
    }

    if (!isAuthorized) {
      return null;
    }

    return <WrappedComponent {...(props as T)} user={user} />;
  };
}

export default withAuth;
