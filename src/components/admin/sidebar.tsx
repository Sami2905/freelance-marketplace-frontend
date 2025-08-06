'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: Icons.dashboard,
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Icons.users,
    },
    {
      name: 'Gigs',
      href: '/admin/gigs',
      icon: Icons.briefcase,
    },
    {
      name: 'Orders',
      href: '/admin/orders',
      icon: Icons.shoppingCart,
    },
    {
      name: 'Categories',
      href: '/admin/categories',
      icon: Icons.menu,
    },
    {
      name: 'Reviews',
      href: '/admin/reviews',
      icon: Icons.star,
    },
    {
      name: 'Reports',
      href: '/admin/reports',
      icon: Icons.dashboard,
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Icons.settings,
    },
  ];

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <Icons.logo className="w-8 h-8 text-primary" />
            <span className="ml-2 text-xl font-bold text-gray-900">Admin Panel</span>
          </div>
          <div className="flex flex-col flex-1 mt-5">
            <nav className="flex-1 px-2 space-y-1 bg-white">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <Icon
                      className={cn(
                        'mr-3 flex-shrink-0 h-6 w-6',
                        isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
        <div className="flex flex-shrink-0 p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div>
              <Icons.user className="w-10 h-10 rounded-full text-gray-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Admin User</p>
              <Link
                href="/admin/settings"
                className="text-xs font-medium text-gray-500 hover:text-gray-700"
              >
                View profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
