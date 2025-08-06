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
import { Gig } from '@/types';

const statuses = [
  { label: 'Draft', value: 'draft' },
  { label: 'Pending', value: 'pending' },
  { label: 'Active', value: 'active' },
  { label: 'Paused', value: 'paused' },
  { label: 'Rejected', value: 'rejected' },
];

const categories = [
  { label: 'Graphic Design', value: 'graphic-design' },
  { label: 'Web Development', value: 'web-dev' },
  { label: 'Content Writing', value: 'content-writing' },
  { label: 'Digital Marketing', value: 'digital-marketing' },
  { label: 'Video & Animation', value: 'video-animation' },
];

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default function GigsPage() {
  const router = useRouter();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const response = await fetch('/api/admin/gigs');
        if (!response.ok) throw new Error('Failed to fetch gigs');
        const data = await response.json();
        setGigs(data);
      } catch (error) {
        console.error('Error fetching gigs:', error);
        toast.error('Failed to load gigs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGigs();
  }, []);

  const handleDelete = async (gigId: string) => {
    if (!confirm('Are you sure you want to delete this gig? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(gigId);
      const response = await fetch(`/api/admin/gigs/${gigId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete gig');
      
      setGigs(gigs.filter(gig => gig.id !== gigId));
      toast.success('Gig deleted successfully');
    } catch (error) {
      console.error('Error deleting gig:', error);
      toast.error('Failed to delete gig');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleStatusChange = async (gigId: string, status: string) => {
    try {
      setIsUpdating(gigId);
      const response = await fetch(`/api/admin/gigs/${gigId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update gig status');
      
      setGigs(gigs.map(gig => 
        gig.id === gigId ? { ...gig, status: status as 'active' | 'inactive' | 'draft' } : gig
      ));
      toast.success('Gig status updated successfully');
    } catch (error) {
      console.error('Error updating gig status:', error);
      toast.error('Failed to update gig status');
    } finally {
      setIsUpdating(null);
    }
  };

  const columns: ColumnDef<Gig>[] = [
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
      accessorKey: 'title',
      header: 'Gig',
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-md bg-gray-200 flex-shrink-0 overflow-hidden">
            {row.original.images?.[0] ? (
              <img 
                src={row.original.images[0]} 
                alt={row.original.title} 
                className="h-full w-full object-cover"
              />
            ) : (
              <Icons.image className="h-full w-full text-gray-400 p-2" />
            )}
          </div>
          <div>
            <div className="font-medium line-clamp-1">{row.original.title}</div>
            <div className="text-sm text-muted-foreground">
              by {row.original.seller?.name || 'Unknown'}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.category || 'Uncategorized'}
        </Badge>
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.original.category);
      },
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => (
        <span className="font-medium">
          ${row.original.price?.toFixed(2) || '0.00'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = statuses.find((s) => s.value === row.original.status);
        return (
          <div className="flex items-center">
            <Badge
              variant={
                row.original.status === 'active'
                  ? 'success'
                  : row.original.status === 'rejected'
                  ? 'destructive'
                  : row.original.status === 'pending'
                  ? 'warning'
                  : 'outline'
              }
            >
              {status?.label || row.original.status}
            </Badge>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => format(new Date(row.original.createdAt), 'MMM d, yyyy'),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/gigs/${row.original.id}`)}
          >
            <Icons.eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>
          
          {row.original.status === 'pending' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleStatusChange(row.original.id, 'active')}
              disabled={isUpdating === row.original.id}
            >
              {isUpdating === row.original.id ? (
                <Icons.loader className="h-4 w-4 animate-spin" />
              ) : (
                <Icons.check className="h-4 w-4 text-green-600" />
              )}
              <span className="sr-only">Approve</span>
            </Button>
          )}
          
          {row.original.status === 'active' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleStatusChange(row.original.id, 'paused')}
              disabled={isUpdating === row.original.id}
            >
              {isUpdating === row.original.id ? (
                <Icons.loader className="h-4 w-4 animate-spin" />
              ) : (
                <Icons.pause className="h-4 w-4 text-amber-600" />
              )}
              <span className="sr-only">Pause</span>
            </Button>
          )}
          
          {(row.original.status === 'paused' || row.original.status === 'rejected') && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleStatusChange(row.original.id, 'active')}
              disabled={isUpdating === row.original.id}
            >
              {isUpdating === row.original.id ? (
                <Icons.loader className="h-4 w-4 animate-spin" />
              ) : (
                <Icons.play className="h-4 w-4 text-green-600" />
              )}
              <span className="sr-only">Activate</span>
            </Button>
          )}
          
          {row.original.status !== 'rejected' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleStatusChange(row.original.id, 'rejected')}
              disabled={isUpdating === row.original.id}
            >
              {isUpdating === row.original.id ? (
                <Icons.loader className="h-4 w-4 animate-spin" />
              ) : (
                <Icons.x className="h-4 w-4 text-destructive" />
              )}
              <span className="sr-only">Reject</span>
            </Button>
          )}
          
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
          <h1 className="text-2xl font-bold tracking-tight">Gigs</h1>
          <p className="text-muted-foreground">
            Manage all gigs in the marketplace
          </p>
        </div>
      </div>
      
      <div className="rounded-md border">
        <DataTable
          columns={columns}
          data={gigs}
          searchKey="title"
          filterOptions={[
            {
              label: 'Status',
              value: 'status',
              options: statuses,
            },
            {
              label: 'Category',
              value: 'category',
              options: categories,
            },
          ]}
        />
      </div>
    </div>
  );
}
