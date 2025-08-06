'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';

interface Review {
  _id: string;
  rating: number;
  comment: string;
  reviewer: {
    _id: string;
    name: string;
    email: string;
  };
  reviewee: {
    _id: string;
    name: string;
    email: string;
  };
  order: {
    _id: string;
    gig: {
      title: string;
    };
  };
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'received' | 'given'>('received');

  useEffect(() => {
    fetchReviews();
  }, [activeTab]);

  const fetchReviews = async () => {
    try {
      const endpoint = activeTab === 'received' ? 'user' : 'reviewer';
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${endpoint}/${user?._id}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setReviews(data.data || []);
      } else {
        console.error('Error fetching reviews:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Icons.star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icons.loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reviews</h1>
          <p className="text-muted-foreground">Manage your reviews and feedback</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={activeTab === 'received' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('received')}
        >
          Reviews Received
        </Button>
        <Button
          variant={activeTab === 'given' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('given')}
        >
          Reviews Given
        </Button>
      </div>

      <div className="grid gap-4">
        {reviews.map((review) => (
          <Card key={review._id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{review.order.gig.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {activeTab === 'received' 
                      ? `From: ${review.reviewer.name}`
                      : `To: ${review.reviewee.name}`
                    }
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 mb-1">
                    {renderStars(review.rating)}
                  </div>
                  <Badge className={getStatusColor(review.status)}>
                    {review.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                "{review.comment}"
              </p>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Posted: {formatDate(review.createdAt)}</span>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Icons.messageCircle className="mr-1 h-3 w-3" />
                    Reply
                  </Button>
                  {review.status === 'pending' && activeTab === 'received' && (
                    <>
                      <Button size="sm" variant="outline">
                        <Icons.checkCircle className="mr-1 h-3 w-3" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline">
                        <Icons.x className="mr-1 h-3 w-3" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {reviews.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Icons.star className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
            <p className="text-muted-foreground text-center">
              {activeTab === 'received'
                ? 'You don\'t have any reviews yet. Complete your first project to get reviews from clients.'
                : 'You haven\'t given any reviews yet. Complete an order to leave a review for the seller.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 