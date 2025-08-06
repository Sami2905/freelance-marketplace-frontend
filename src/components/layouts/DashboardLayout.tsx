'use client';

import { ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/AuthContext';
import { ROLES } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RoleGuard } from '../auth/RoleGuard';
import { useRouter } from 'next/navigation';

interface NavItem {
  title: string;
  href: string;
  icon: keyof typeof Icons;
  roles?: (keyof typeof ROLES)[];
  permission?: string | string[];
}

const navigation: NavItem[] = [
  // Admin navigation
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: 'dashboard',
    roles: ['ADMIN'],
    permission: 'view:analytics',
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: 'users',
    roles: ['ADMIN'],
    permission: 'manage:users',
  },
  {
    title: 'Gigs',
    href: '/admin/gigs',
    icon: 'briefcase',
    roles: ['ADMIN'],
    permission: 'manage:all_gigs',
  },
  // Freelancer navigation
  {
    title: 'My Gigs',
    href: '/freelancer/gigs',
    icon: 'briefcase',
    roles: ['FREELANCER'],
    permission: 'view:own_gigs',
  },
  {
    title: 'Orders',
    href: '/freelancer/orders',
    icon: 'shoppingCart',
    roles: ['FREELANCER'],
    permission: 'view:own_orders',
  },
  // Client navigation
  {
    title: 'Browse Gigs',
    href: '/gigs',
    icon: 'search',
    roles: ['CLIENT'],
  },
  {
    title: 'My Orders',
    href: '/orders',
    icon: 'shoppingCart',
    roles: ['CLIENT'],
    permission: 'view:own_orders',
  },
  // Shared navigation
  {
    title: 'Messages',
    href: '/messages',
    icon: 'messageSquare',
    roles: ['ADMIN', 'FREELANCER', 'CLIENT'],
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: 'settings',
    roles: ['ADMIN', 'FREELANCER', 'CLIENT'],
  },
];

interface DashboardLayoutProps {
  children: ReactNode;
  header?: ReactNode;
}

export function DashboardLayout({ children, header }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (!user) {
    return null; // or redirect to login
  }

  const filteredNav = navigation.filter((item) => {
    // Filter by role if specified
    if (item.roles && !item.roles.includes(user.role.toUpperCase() as keyof typeof ROLES)) {
      return false;
    }
    return true;
  });

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile menu */}
      <div
        className={cn(
          'fixed inset-0 z-40 lg:hidden',
          mobileMenuOpen ? 'block' : 'hidden'
        )}
      >
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileMenuOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 flex-shrink-0 items-center px-4 bg-white">
            <Icons.logo className="h-8 w-auto" />
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto">
            <nav className="flex-1 space-y-1 px-2 py-4">
              {filteredNav.map((item) => {
                const Icon = Icons[item.icon] || Icons['fileText'];
                const isActive = pathname === item.href;
                
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={cn(
                      isActive
                        ? 'bg-gray-100 text-primary'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-md'
                    )}
                  >
                    <Icon
                      className={cn(
                        isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500',
                        'mr-3 flex-shrink-0 h-5 w-5'
                      )}
                      aria-hidden="true"
                    />
                    {item.title}
                  </a>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          <div className="flex flex-1 flex-col overflow-y-auto">
            <div className="flex flex-shrink-0 items-center px-4 py-5">
              <Icons.logo className="h-8 w-auto" />
            </div>
            <nav className="flex-1 space-y-1 bg-white px-2">
              {filteredNav.map((item) => {
                const Icon = Icons[item.icon] || Icons['fileText'];
                const isActive = pathname === item.href;
                
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={cn(
                      isActive
                        ? 'bg-gray-100 text-primary'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-md'
                    )}
                  >
                    <Icon
                      className={cn(
                        isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500',
                        'mr-3 flex-shrink-0 h-5 w-5'
                      )}
                      aria-hidden="true"
                    />
                    {item.title}
                  </a>
                );
              })}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
            <div className="group block w-full flex-shrink-0">
              <div className="flex items-center">
                <div>
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.profilePicture} alt={user.name} />
                    <AvatarFallback>
                      {user.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {user.name}
                  </p>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-medium text-gray-500 group-hover:text-gray-700"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
          <button
            type="button"
            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Icons.menu className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1">
              {header || (
                <div className="flex w-full max-w-lg lg:max-w-xs items-center">
                  <label htmlFor="search" className="sr-only">
                    Search
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Icons.search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <input
                      id="search"
                      name="search"
                      className="block w-full rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                      placeholder="Search"
                      type="search"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="ml-4 flex items-center lg:ml-6">
              <button
                type="button"
                className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <span className="sr-only">View notifications</span>
                <Icons.bell className="h-6 w-6" aria-hidden="true" />
              </button>

              {/* Profile dropdown */}
              <div className="relative ml-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      <span className="sr-only">Open user menu</span>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profilePicture} alt={user.name} />
                        <AvatarFallback>
                          {user.name
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => router.push('/profile')}>
                        <Icons.user className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/settings')}>
                        <Icons.settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <RoleGuard requiredRole="ADMIN">
                        <DropdownMenuItem onClick={() => router.push('/admin')}>
                          <Icons.shield className="mr-2 h-4 w-4" />
                          <span>Admin Panel</span>
                        </DropdownMenuItem>
                      </RoleGuard>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <Icons.logOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
