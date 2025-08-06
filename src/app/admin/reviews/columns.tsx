import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Flag, Trash2, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Review, ReviewStatus, AdminResponse } from '@/types/review';

type ReviewWithActions = Review & {
  _id: string;
  adminResponse?: AdminResponse;
  flagCount?: number;
  statusHistory?: Array<{
    status: ReviewStatus;
    changedAt: string;
    changedBy?: { id: string; name: string };
  }>;
};

declare module '@tanstack/table-core' {
  interface TableMeta<TData> {
    isUpdating?: string | null;
    updateStatus?: (id: string, status: ReviewStatus, reason?: string) => Promise<void>;
    handleFlagReview?: (id: string, reason: string, comment?: string) => Promise<void>;
    deleteReview?: (id: string) => Promise<void>;
  }
}

// Status badge variants
const statusVariantMap: Record<ReviewStatus, 'secondary' | 'default' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  approved: 'default',
  rejected: 'destructive',
  flagged: 'outline',
};

export const columns: ColumnDef<ReviewWithActions>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as ReviewStatus;
      return (
        <Badge variant={statusVariantMap[status]} className="capitalize">
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'user.name',
    header: 'User',
    cell: ({ row }) => {
      const user = row.original.user;
      return <div className="font-medium">{user.name}</div>;
    },
  },
  {
    accessorKey: 'gig.title',
    header: 'Gig',
    cell: ({ row }) => {
      const gig = row.original.gig;
      return <div className="font-medium">{gig.title}</div>;
    },
  },
  {
    accessorKey: 'rating',
    header: 'Rating',
    cell: ({ row }) => {
      const rating = row.getValue('rating') as number;
      return <div className="flex items-center">{'★'.repeat(rating)}</div>;
    },
  },
  {
    accessorKey: 'comment',
    header: 'Comment',
    cell: ({ row }) => {
      const comment = row.getValue('comment') as string;
      return <div className="max-w-xs truncate">{comment}</div>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      return <div>{format(date, 'MMM d, yyyy')}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const review = row.original;
      const isUpdating = table.options.meta?.isUpdating === review._id;
      const updateStatus = table.options.meta?.updateStatus as (id: string, status: ReviewStatus, reason?: string) => Promise<void>;
      const handleFlagReview = table.options.meta?.handleFlagReview as (id: string, reason: string, comment?: string) => Promise<void>;
      const deleteReview = table.options.meta?.deleteReview as (id: string) => Promise<void>;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {review.status !== 'approved' && (
              <DropdownMenuItem
                onClick={() => updateStatus(review._id, 'approved')}
                disabled={isUpdating}
                className="cursor-pointer"
              >
                <Check className="mr-2 h-4 w-4" />
                Approve
              </DropdownMenuItem>
            )}
            {review.status !== 'rejected' && (
              <DropdownMenuItem
                onClick={() => updateStatus(review._id, 'rejected')}
                disabled={isUpdating}
                className="cursor-pointer"
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </DropdownMenuItem>
            )}
            {review.status !== 'flagged' && (
              <DropdownMenuItem
                onClick={() => handleFlagReview(review._id, 'inappropriate')}
                disabled={isUpdating}
                className="cursor-pointer"
              >
                <Flag className="mr-2 h-4 w-4" />
                Flag
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => deleteReview(review._id)}
              disabled={isUpdating}
              className="cursor-pointer text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
