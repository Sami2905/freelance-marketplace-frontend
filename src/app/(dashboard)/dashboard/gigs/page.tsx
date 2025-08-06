'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Gig {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  status: string;
  images: Array<{
    url: string;
    filename: string;
    originalName: string;
    isPrimary: boolean;
  }>;
  rating: number;
  totalReviews: number;
  totalOrders: number;
  totalViews: number;
  totalEarnings: number;
  createdAt: string;
  updatedAt: string;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  paused: 'bg-orange-100 text-orange-800',
  rejected: 'bg-red-100 text-red-800'
};

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default function GigsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === 'freelancer') {
      fetchGigs();
    } else if (user && user.role !== 'freelancer') {
      // Redirect non-freelancers
      router.push('/dashboard');
    }
  }, [user]);

  const fetchGigs = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gigs/user/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setGigs(data.data || []);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch gigs",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching gigs:', error);
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (gigId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gigs/${gigId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setGigs(prev => prev.map(gig => 
          gig._id === gigId ? { ...gig, status: newStatus } : gig
        ));
        toast({
          title: "Success",
          description: `Gig status updated to ${newStatus}`,
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to update status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating gig status:', error);
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGig = async (gigId: string) => {
    if (!confirm('Are you sure you want to delete this gig? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gigs/${gigId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setGigs(prev => prev.filter(gig => gig._id !== gigId));
        toast({
          title: "Success",
          description: "Gig deleted successfully",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to delete gig",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting gig:', error);
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show loading if user is not yet authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Redirect non-freelancers
  if (user.role !== 'freelancer') {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Gigs</h1>
          <p className="text-muted-foreground">
            Manage your freelance services and track their performance.
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/gigs/create')}>
          <Icons.plus className="mr-2 h-4 w-4" />
          Create New Gig
        </Button>
      </div>

      {gigs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Icons.folder className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No gigs yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first gig to start earning money on SkillBridge.
            </p>
            <Button onClick={() => router.push('/dashboard/gigs/create')}>
              Create Your First Gig
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {gigs.map((gig) => (
            <Card key={gig._id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{gig.title}</h3>
                      <Badge className={statusColors[gig.status as keyof typeof statusColors]}>
                        {gig.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {gig.category} • {gig.subcategory}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>${gig.price}</span>
                      <span>•</span>
                      <span>{gig.totalOrders} orders</span>
                      <span>•</span>
                      <span>{gig.totalViews} views</span>
                      <span>•</span>
                      <span>{formatCurrency(gig.totalEarnings)} earned</span>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Icons.moreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/gigs/${gig._id}/edit`)}>
                        <Icons.edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/gigs/${gig._id}`)}>
                        <Icons.eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      {gig.status === 'active' && (
                        <DropdownMenuItem onClick={() => handleStatusChange(gig._id, 'paused')}>
                          <Icons.pause className="mr-2 h-4 w-4" />
                          Pause
                        </DropdownMenuItem>
                      )}
                      {gig.status === 'paused' && (
                        <DropdownMenuItem onClick={() => handleStatusChange(gig._id, 'active')}>
                          <Icons.play className="mr-2 h-4 w-4" />
                          Activate
                        </DropdownMenuItem>
                      )}
                      {gig.status === 'draft' && (
                        <DropdownMenuItem onClick={() => handleStatusChange(gig._id, 'pending')}>
                          <Icons.send className="mr-2 h-4 w-4" />
                          Submit for Review
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => handleDeleteGig(gig._id)}
                        className="text-red-600"
                      >
                        <Icons.trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Gig Images */}
                {gig.images && gig.images.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Images ({gig.images.length})</h4>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {gig.images.map((image, index) => (
                        <div key={index} className="relative flex-shrink-0">
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL}${image.url}`}
                            alt={`Gig image ${index + 1}`}
                            className="w-16 h-16 object-cover rounded border"
                          />
                          {image.isPrimary && (
                            <Badge className="absolute -top-1 -left-1 text-xs px-1 py-0">
                              Primary
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gig Description */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {gig.description}
                </p>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-lg font-semibold">{gig.totalOrders}</div>
                    <div className="text-xs text-muted-foreground">Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{gig.totalViews}</div>
                    <div className="text-xs text-muted-foreground">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{gig.rating.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground">Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{formatCurrency(gig.totalEarnings)}</div>
                    <div className="text-xs text-muted-foreground">Earnings</div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground mt-4">
                  Created: {formatDate(gig.createdAt)} • Last updated: {formatDate(gig.updatedAt)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 