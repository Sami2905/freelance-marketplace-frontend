'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

import { DataTable } from '@/components/admin/data-table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { Order, OrderStatus } from '@/types';

const statuses: { label: string; value: OrderStatus }[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Disputed', value: 'disputed' },
];

const paymentStatuses = [
  { label: 'Paid', value: 'paid' },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' },
  { label: 'Refunded', value: 'refunded' },
];

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<Record<string, OrderStatus>>({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/admin/orders');
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        setOrders(data);
        
        // Initialize selected statuses
        const statusMap: Record<string, OrderStatus> = {};
        data.forEach((order: Order) => {
          statusMap[order.id] = order.status;
        });
        setSelectedStatus(statusMap);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setIsUpdating(orderId);
      
      // Update local state optimistically
      setSelectedStatus(prev => ({
        ...prev,
        [orderId]: newStatus
      }));
      
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update order status');
      
      // Update the orders list with the new status
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      toast.success('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
      
      // Revert local state on error
      const order = orders.find(o => o.id === orderId);
      if (order) {
        setSelectedStatus(prev => ({
          ...prev,
          [orderId]: order.status
        }));
      }
    } finally {
      setIsUpdating(null);
    }
  };

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
      case 'disputed':
        return 'destructive';
      case 'in_progress':
        return 'outline';
      case 'delivered':
        return 'default';
      default:
        return 'default';
    }
  };

  const columns: ColumnDef<Order>[] = [
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
      accessorKey: 'id',
      header: 'Order',
      cell: ({ row }) => (
        <div className="font-medium">
          #{row.original.id.substring(0, 8)}
        </div>
      ),
    },
    {
      accessorKey: 'gig',
      header: 'Gig',
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-md bg-gray-200 flex-shrink-0 overflow-hidden">
            {row.original.gig?.images?.[0] ? (
              <img 
                src={row.original.gig.images[0]} 
                alt={row.original.gig.title} 
                className="h-full w-full object-cover"
              />
            ) : (
              <Icons.image className="h-full w-full text-gray-400 p-2" />
            )}
          </div>
          <div className="line-clamp-1">
            {row.original.gig?.title || 'Gig not found'}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'buyer',
      header: 'Buyer',
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="font-medium">{row.original.buyer?.name || 'Unknown'}</div>
          <div className="text-muted-foreground">
            {row.original.buyer?.email || 'No email'}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'seller',
      header: 'Seller',
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="font-medium">{row.original.seller?.name || 'Unknown'}</div>
          <div className="text-muted-foreground">
            {row.original.seller?.email || 'No email'}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <div className="text-right font-medium">
          ${row.original.amount?.toFixed(2) || '0.00'}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <div className="flex flex-col space-y-1">
          <Badge variant={getStatusBadgeVariant(row.original.status)} className="w-fit">
            {statuses.find(s => s.value === row.original.status)?.label || row.original.status}
          </Badge>
          {row.original.deliveryDate && (
            <div className="text-xs text-muted-foreground">
              Due {formatDistanceToNow(new Date(row.original.deliveryDate), { addSuffix: true })}
            </div>
          )}
        </div>
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Order Date',
      cell: ({ row }) => format(new Date(row.original.createdAt), 'MMM d, yyyy'),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/admin/orders/${row.original.id}`)}
          >
            <Icons.eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>
          
          <select
            value={selectedStatus[row.original.id] || row.original.status}
            onChange={(e) => handleStatusChange(row.original.id, e.target.value as OrderStatus)}
            disabled={isUpdating === row.original.id}
            className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          
          {isUpdating === row.original.id && (
            <Icons.loader className="h-4 w-4 animate-spin" />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all orders in the marketplace
          </p>
        </div>
      </div>
      
      <div className="rounded-md border">
        <DataTable
          columns={columns}
          data={orders}
          searchKey="id"
          filterOptions={[
            {
              label: 'Status',
              value: 'status',
              options: statuses,
            },
            {
              label: 'Payment Status',
              value: 'paymentStatus',
              options: paymentStatuses,
            },
          ]}
        />
      </div>
    </div>
  );
}
