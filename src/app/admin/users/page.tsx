'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { DataTable } from '@/components/admin/data-table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { User } from '@/types';

const statuses = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Suspended', value: 'suspended' },
];

const roles = [
  { label: 'User', value: 'USER' },
  { label: 'Freelancer', value: 'FREELANCER' },
  { label: 'Admin', value: 'ADMIN' },
];

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(userId);
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete user');
      
      setUsers(users.filter(user => user.id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleStatusChange = async (userId: string, status: string) => {
    try {
      setIsUpdating(userId);
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update user status');
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: status as 'active' | 'suspended' | 'pending' } : user
      ));
      toast.success('User status updated successfully');
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    } finally {
      setIsUpdating(null);
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {row.original.avatar ? (
              <img 
                src={row.original.avatar} 
                alt={row.original.name} 
                className="h-full w-full object-cover"
              />
            ) : (
              <Icons.user className="h-5 w-5 text-gray-500" />
            )}
          </div>
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-sm text-muted-foreground">{row.original.email}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const role = roles.find((r) => r.value === row.original.role);
        return (
          <Badge variant={row.original.role === 'admin' ? 'default' : 'secondary'}>
            {role?.label || row.original.role}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = statuses.find((s) => s.value === row.original.status);
        return (
          <Badge
            variant={
              row.original.status === 'active'
                ? 'success'
                : row.original.status === 'suspended'
                ? 'destructive'
                : 'outline'
            }
          >
            {status?.label || row.original.status}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined',
      cell: ({ row }) => format(new Date(row.original.createdAt), 'MMM d, yyyy'),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/admin/users/${row.original.id}`)}
          >
            <Icons.eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/admin/users/${row.original.id}/edit`)}
          >
            <Icons.edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(row.original.id)}
            disabled={isDeleting === row.original.id}
          >
            {isDeleting === row.original.id ? (
              <Icons.loader className="h-4 w-4 animate-spin" />
            ) : (
              <Icons.trash className="h-4 w-4 text-destructive" />
            )}
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage all users in the platform
          </p>
        </div>
        <Button onClick={() => router.push('/admin/users/new')}>
          <Icons.plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>
      
      <div className="rounded-md border">
        <DataTable
          columns={columns}
          data={users}
          searchKey="name"
          filterOptions={[
            {
              label: 'Status',
              value: 'status',
              options: statuses,
            },
            {
              label: 'Role',
              value: 'role',
              options: roles,
            },
          ]}
        />
      </div>
    </div>
  );
}
