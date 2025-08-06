'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { 
  Check, 
  X, 
  Star, 
  Trash2, 
  MessageSquare, 
  Flag, 
  MoreHorizontal, 
  Filter,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw
} from 'lucide-react';
import { 
  SortingState, 
  VisibilityState,
  RowSelectionState,
  Row,
  ColumnFiltersState,
  TableMeta,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

// Types
import type { 
  Review, 
  ReviewStatus, 
  User, 
  Gig, 
  AdminResponse
} from '@/types/review';
import { statusVariantMap, statusLabelMap, isReviewStatus } from '@/types/review';

type ReviewWithActions = Review & {
  _id: string;
  adminResponse?: AdminResponse;
  flagCount?: number;
  statusHistory?: Array<{
    status: ReviewStatus;
    changedAt: string;
    changedBy?: Pick<User, 'id' | 'name'>;
  }>;
};

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Extend the TableMeta interface to include our custom methods
declare module '@tanstack/table-core' {
  interface TableMeta<TData> {
    isUpdating?: string | null;
    updateStatus?: (id: string, status: ReviewStatus, reason?: string) => Promise<void>;
    handleFlagReview?: (id: string, reason: string, comment?: string) => Promise<void>;
    deleteReview?: (id: string) => Promise<void>;
  }
}

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by error boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <div className="text-2xl font-bold text-red-600">Something went wrong</div>
          <p className="text-muted-foreground">An error occurred while loading the reviews. Please try again later.</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default function AdminReviewsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State management
  const [reviews, setReviews] = useState<ReviewWithActions[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedRows, setSelectedRows] = useState<Row<ReviewWithActions>[]>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  
  // State for search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'all'>('all');
  
  // Ensure status is properly typed when fetching reviews
  const fetchReviews = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/reviews');
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const data = await response.json();
      
      // Ensure each review has a valid status and matches our type
      const typedReviews = data.reviews.map((review: any): ReviewWithActions => ({
        ...review,
        _id: review._id || review.id,
        status: isReviewStatus(review.status) ? review.status : 'pending',
        user: review.user || { id: 'unknown', name: 'Unknown User' },
        gig: review.gig || { id: 'unknown', title: 'Unknown Gig', slug: 'unknown' },
      }));
      
      setReviews(typedReviews);
      setPagination(prev => ({
        ...prev,
        pageCount: data.totalPages,
        totalCount: data.totalCount,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch reviews with filters
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        
        // Add filters to params
        if (statusFilter !== 'all') {
          params.append('status', statusFilter);
        }
        
        if (searchQuery) {
          params.append('search', searchQuery);
        }
        
        // Add sorting
        if (sorting.length > 0) {
          const sort = sorting[0];
          params.append('sort', `${sort.id}:${sort.desc ? 'desc' : 'asc'}`);
        }
        
        const queryString = params.toString();
        const url = `/api/admin/reviews${queryString ? `?${queryString}` : ''}`;
        
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch reviews');
        
        const data = await res.json();
        const fetchedReviews = (Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []).map((review: any): ReviewWithActions => ({
          ...review,
          _id: review._id || review.id,
          status: isReviewStatus(review.status) ? review.status : 'pending',
          user: review.user || { id: 'unknown', name: 'Unknown User' },
          gig: review.gig || { id: 'unknown', title: 'Unknown Gig', slug: 'unknown' },
        }));
        setReviews(fetchedReviews);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load reviews');
      } finally {
        setIsLoading(false);
      }
    };
    
    const debounceTimer = setTimeout(() => {
      fetchReviews();
    }, 300);
    
    return () => clearTimeout(debounceTimer);
  }, [statusFilter, searchQuery, sorting]);
  
  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter !== 'all') {
      params.set('status', statusFilter);
    }
    router.push(`/admin/reviews?${params.toString()}`, { scroll: false });
  }, [statusFilter, router]);

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    setStatusFilter((value === 'all' ? value : value) as ReviewStatus | 'all');
    setPage(1); // Reset to first page when filter changes
  };

  // Update review status
  const updateStatus = async (id: string, status: ReviewStatus, reason?: string) => {
    try {
      setIsUpdating(id);
      // API call to update status
      const response = await fetch(`/api/admin/reviews/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const updatedReview = await response.json();
      
      // Ensure the status is valid before updating state
      const newStatus = isReviewStatus(updatedReview.status) ? updatedReview.status : 'pending';
      
      // Update the reviews state with the updated review
      setReviews(prevReviews =>
        prevReviews.map(review =>
          review._id === id ? { ...review, status: newStatus } : review
        )
      );

      toast.success(`Review ${status} successfully`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(`Failed to ${status} review`);
    } finally {
      setIsUpdating(null);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (selectedRows.length === 0) {
      toast.warning('Please select at least one review');
      return;
    }

    const reviewIds = selectedRows.map(row => row.original._id);
    const isDelete = action === 'delete';

    // For reject action, get reason first
    let reason = '';
    if (action === 'reject') {
      reason = window.prompt('Please provide a reason for rejection:') || '';
      if (!reason) {
        toast.info('Rejection cancelled');
        return;
      }
    }

    try {
      setIsUpdating('bulk');
      
      const promises = reviewIds.map(id => {
        if (isDelete) {
          return deleteReview(id);
        } else {
          // Ensure we're passing a valid ReviewStatus
          const status = action === 'approve' ? 'approved' : 'rejected';
          return updateStatus(id, status, action === 'reject' ? reason : undefined);
        }
      });

      await Promise.all(promises);
      
      // Clear selection after action
      setRowSelection({});
      setSelectedRows([]);
      
      toast.success(`Successfully ${action}d ${reviewIds.length} review(s)`);
    } catch (error) {
      console.error('Error in bulk action:', error);
      toast.error(`Failed to ${action} selected reviews`);
    } finally {
      setIsUpdating(null);
    }
  };

  // Handle flag review
  const handleFlagReview = async (id: string, reason: string, comment?: string): Promise<void> => {
    try {
      setIsUpdating(id);
      const response = await fetch(`/api/admin/reviews/${id}/flag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason, comment }),
      });

      if (!response.ok) {
        throw new Error('Failed to flag review');
      }

      const updatedReview = await response.json();
      
      // Update the reviews state with the flagged review
      setReviews(prevReviews =>
        prevReviews.map(review =>
          review._id === id ? { ...review, status: 'flagged', flagCount: (review.flagCount || 0) + 1 } : review
        )
      );

      toast.success('Review flagged successfully');
    } catch (error) {
      console.error('Error flagging review:', error);
      toast.error('Failed to flag review');
    } finally {
      setIsUpdating(null);
    }
  };

  // Delete review
  const deleteReview = async (id: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
      setIsUpdating(id);
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete review');
      }

      // Remove the deleted review from state
      setReviews(prevReviews => prevReviews.filter(review => review._id !== id));
      toast.success('Review deleted successfully');
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    } finally {
      setIsUpdating(null);
    }
  };

  // Table columns configuration
  const columns = [
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: { original: ReviewWithActions } }) => {
        const status = row.original.status;
        const variant = statusVariantMap[status] as 'secondary' | 'default' | 'destructive' | 'outline';
        
        return (
          <Badge variant={variant} className="capitalize">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'user',
      header: 'User',
      cell: ({ row }: { row: { original: ReviewWithActions } }) => (
        <div className="font-medium">
          {row.original.user?.name || 'Unknown'}
        </div>
      ),
    },
    {
      accessorKey: 'gig',
      header: 'Gig',
      cell: ({ row }: { row: { original: ReviewWithActions } }) => (
        <div className="font-medium">
          {row.original.gig?.title || 'Unknown'}
        </div>
      ),
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }: { row: { original: ReviewWithActions } }) => (
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < (row.original.rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
            />
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'comment',
      header: 'Comment',
      cell: ({ row }: { row: { original: ReviewWithActions } }) => (
        <div className="max-w-xs truncate">
          {row.original.comment || 'No comment'}
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }: { row: { original: ReviewWithActions } }) => (
        <div>{format(new Date(row.original.createdAt), 'MMM d, yyyy')}</div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }: { row: { original: ReviewWithActions } }) => {
        const review = row.original;
        const isUpdatingThis = isUpdating === review._id;

        return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => updateStatus(review._id, 'approved')}
              disabled={isUpdatingThis}
              className="text-green-600"
            >
              <Check className="mr-2 h-4 w-4" />
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => {
                const reason = prompt('Reason for rejection:');
                if (reason) updateStatus(review._id, 'rejected', reason);
              }}
              disabled={isUpdatingThis}
              className="text-red-600"
            >
              <X className="mr-2 h-4 w-4" />
              Reject
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleFlagReview(review._id, 'inappropriate', 'Flagged by admin')}
              disabled={isUpdatingThis}
            >
              <Flag className="mr-2 h-4 w-4" />
              Flag
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => deleteReview(review._id)}
              disabled={isUpdatingThis}
              className="text-red-600"
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

// Loading state
if (isLoading) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground">Loading reviews...</p>
      </div>
    </div>
  );
}

// Error state
if (error) {
  return (
    <div className="p-6 space-y-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center space-x-2 text-red-600">
        <XCircle className="w-5 h-5" />
        <h3 className="font-medium">Error loading reviews</h3>
      </div>
      <p className="text-sm text-red-600">{error}</p>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => {
          setError(null);
          fetchReviews();
        }}
      >
        Retry
      </Button>
    </div>
  );
}

// Empty state
if (reviews.length === 0) {
  return (
    <div className="p-8 text-center border rounded-lg">
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <MessageSquare className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium">No reviews found</h3>
      <p className="text-sm text-muted-foreground mt-1">
        There are no reviews to display. Check back later or try adjusting your filters.
      </p>
    </div>
  );
}

return (
  <ErrorBoundary>
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>
            <p className="text-muted-foreground">Manage and moderate user reviews</p>
          </div>
          <div className="flex items-center space-x-2">
            <Select onValueChange={handleStatusChange} value={statusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[250px]"
            />
          </div>
        </div>
      </div>
      {/* Bulk Actions Bar */}
      {Object.keys(rowSelection).length > 0 && (
        <div className="flex items-center justify-between bg-muted/50 p-3 rounded-md border">
          <div className="text-sm text-muted-foreground">
            {Object.keys(rowSelection).length} selected
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('approve')}
              disabled={isUpdating === 'bulk'}
            >
              {isUpdating === 'bulk' ? (
                <>Approving...</>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Approve Selected
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('reject')}
              disabled={isUpdating === 'bulk'}
            >
              {isUpdating === 'bulk' ? (
                <>Rejecting...</>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Reject Selected
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('delete')}
              disabled={isUpdating === 'bulk'}
              className="text-destructive hover:text-destructive"
            >
              {isUpdating === 'bulk' ? (
                <>Deleting...</>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRowSelection({})}
              disabled={isUpdating === 'bulk'}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}
      
      <Card>
        <CardContent className="p-0">
          <DataTable
            data={reviews}
            columns={columns}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
      
      {/* Bulk Actions Bar */}
      {Object.keys(rowSelection).length > 0 && (
        <div className="flex items-center justify-between bg-muted/50 p-3 rounded-md border">
        <div className="text-sm text-muted-foreground">
          {Object.keys(rowSelection).length} selected
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction('approve')}
            disabled={isUpdating === 'bulk'}
          >
            {isUpdating === 'bulk' ? (
              <>Approving...</>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Approve Selected
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction('reject')}
            disabled={isUpdating === 'bulk'}
          >
            {isUpdating === 'bulk' ? (
              <>Rejecting...</>
            ) : (
              <>
                <X className="mr-2 h-4 w-4" />
                Reject Selected
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction('delete')}
            disabled={isUpdating === 'bulk'}
            className="text-destructive hover:text-destructive"
          >
            {isUpdating === 'bulk' ? (
              <>Deleting...</>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRowSelection({})}
            disabled={isUpdating === 'bulk'}
          >
            Clear Selection
          </Button>
        </div>
      </div>
    )}
    
    <Card>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="flex flex-col items-center space-y-2">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Loading reviews...</p>
            </div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No reviews found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'There are no reviews to display.'}
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <DataTable
              data={reviews}
              columns={columns}
              isLoading={isLoading}
            />
          </div>
        )}
      </CardContent>
    </Card>
  </div>
  </ErrorBoundary>
  );
}
