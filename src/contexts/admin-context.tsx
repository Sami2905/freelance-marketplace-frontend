'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';

interface AdminContextType {
  isAdmin: boolean;
  isLoading: boolean;
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalGigs: number;
    totalOrders: number;
    totalRevenue: number;
  };
  fetchStats: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalGigs: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  const { data: session, status } = useSession();
  const router = useRouter();

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard statistics',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (status === 'loading') return;
      
      if (!session) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('/api/admin/check-admin');
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.message || 'Not authorized');
        
        setIsAdmin(true);
        await fetchStats();
      } catch (error) {
        console.error('Admin access denied:', error);
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to access the admin dashboard.',
          variant: 'destructive',
        });
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [session, status, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <AdminContext.Provider value={{ isAdmin, isLoading, stats, fetchStats }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
