'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/AuthContext';
import { DashboardLayout } from './DashboardLayout';
import { RoleGuard } from '../auth/RoleGuard';
import { Button } from '../ui/button';
import { Icons } from '../icons';

interface RoleDashboardLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  loadingComponent?: ReactNode;
}

// Admin-specific content
const AdminDashboardHeader = () => (
  <div className="flex items-center justify-between">
    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
    <div className="flex space-x-3">
      <Button variant="outline" size="sm">
        <Icons.download className="mr-2 h-4 w-4" />
        Export
      </Button>
      <Button size="sm">
        <Icons.plus className="mr-2 h-4 w-4" />
        Add User
      </Button>
    </div>
  </div>
);

// Freelancer-specific content
const FreelancerDashboardHeader = () => {
  const router = useRouter();
  
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
      <div className="flex space-x-3">
        <Button variant="outline" size="sm" onClick={() => router.push('/gigs/create')}>
          <Icons.plus className="mr-2 h-4 w-4" />
          Create Gig
        </Button>
      </div>
    </div>
  );
};

// Client-specific content
const ClientDashboardHeader = () => {
  const router = useRouter();
  
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-900">Find Services</h1>
      <div className="flex space-x-3">
        <Button variant="outline" size="sm">
          <Icons.filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
        <Button size="sm" onClick={() => router.push('/gigs/create-request')}>
          <Icons.plus className="mr-2 h-4 w-4" />
          Post a Request
        </Button>
      </div>
    </div>
  );
};

export function RoleDashboardLayout({
  children,
  header,
  loadingComponent,
}: RoleDashboardLayoutProps) {
  const { user } = useAuth();
  const role = user?.role?.toUpperCase();

  // Show loading state if user data is not available yet
  if (!user || !role) {
    return loadingComponent || (
      <div className="flex items-center justify-center min-h-screen">
        <Icons.loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Get role-specific header if not provided
  const getRoleHeader = () => {
    if (header) return header;
    
    switch (role) {
      case 'ADMIN':
        return <AdminDashboardHeader />;
      case 'FREELANCER':
        return <FreelancerDashboardHeader />;
      case 'CLIENT':
        return <ClientDashboardHeader />;
      default:
        return null;
    }
  };

  // Get role-specific dashboard content
  const getDashboardContent = () => {
    return (
      <RoleGuard requiredRole={role as any}>
        {children}
      </RoleGuard>
    );
  };

  return (
    <DashboardLayout header={getRoleHeader()}>
      {getDashboardContent()}
    </DashboardLayout>
  );
}

// Role-specific layout components
export function AdminDashboardLayout({
  children,
  header,
  loadingComponent,
}: RoleDashboardLayoutProps) {
  return (
    <RoleGuard requiredRole="ADMIN">
      <RoleDashboardLayout 
        header={header || <AdminDashboardHeader />}
        loadingComponent={loadingComponent}
      >
        {children}
      </RoleDashboardLayout>
    </RoleGuard>
  );
}

export function FreelancerDashboardLayout({
  children,
  header,
  loadingComponent,
}: RoleDashboardLayoutProps) {
  return (
    <RoleGuard requiredRole="FREELANCER">
      <RoleDashboardLayout 
        header={header || <FreelancerDashboardHeader />}
        loadingComponent={loadingComponent}
      >
        {children}
      </RoleDashboardLayout>
    </RoleGuard>
  );
}

export function ClientDashboardLayout({
  children,
  header,
  loadingComponent,
}: RoleDashboardLayoutProps) {
  return (
    <RoleGuard requiredRole="CLIENT">
      <RoleDashboardLayout 
        header={header || <ClientDashboardHeader />}
        loadingComponent={loadingComponent}
      >
        {children}
      </RoleDashboardLayout>
    </RoleGuard>
  );
}
