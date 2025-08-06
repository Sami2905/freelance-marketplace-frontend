import { Metadata } from 'next';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminHeader } from '@/components/admin/header';
import { AdminProvider } from '@/contexts/admin-context';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Freelance Marketplace',
  description: 'Admin dashboard for managing the freelance marketplace',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </AdminProvider>
  );
}
