'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Gig {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  deliveryTime: number;
  revisions: number;
  images: string[];
  tags: string[];
  requirements: string[];
  status: string;
  rating: number;
  totalReviews: number;
  totalOrders: number;
  totalViews: number;
  totalEarnings: number;
  seller: {
    _id: string;
    name: string;
    email: string;
    profilePicture: string;
    bio: string;
    location: string;
    averageRating: number;
    totalReviews: number;
    totalOrders: number;
    responseTime: number;
    completionRate: number;
    memberSince: string;
  };
  createdAt: string;
}

interface Review {
  _id: string;
  rating: number;
  comment: string;
  reviewer: {
    name: string;
    profilePicture: string;
  };
  createdAt: string;
}

export default function GigDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [gig, setGig] = useState<Gig | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [orderRequirements, setOrderRequirements] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchGigDetails();
      fetchGigReviews();
    }
  }, [params.id]);

  const fetchGigDetails = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gigs/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setGig(data.data);
      } else {
        console.error('Error fetching gig details:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching gig details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGigReviews = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/gig/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      router.push('/login?callbackUrl=' + encodeURIComponent(window.location.pathname));
      return;
    }

    setPlacingOrder(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          gigId: gig?._id,
          requirements: orderRequirements.split('\n').filter(req => req.trim()),
          amount: gig?.price
        })
      });

      if (response.ok) {
        const data = await response.json();
        setOrderDialogOpen(false);
        router.push(`/dashboard/orders`);
      } else {
        const error = await response.json();
        console.error('Error placing order:', error);
      }
    } catch (error) {
      console.error('Error placing order:', error);
    } finally {
      setPlacingOrder(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Icons.star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
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

  if (!gig) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Icons.alertCircle className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Gig not found</h3>
            <p className="text-muted-foreground text-center">
              The gig you're looking for doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwner = user?._id === gig.seller._id;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gig Images */}
          <Card>
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={gig.images[selectedImage] || '/default-gig.png'}
                  alt={gig.title}
                  className="w-full h-96 object-cover rounded-t-lg"
                />
                {gig.images.length > 1 && (
                  <div className="absolute bottom-4 left-4 flex space-x-2">
                    {gig.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`w-16 h-16 rounded border-2 ${
                          selectedImage === index ? 'border-primary' : 'border-white'
                        } overflow-hidden`}
                      >
                        <img
                          src={image}
                          alt={`${gig.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Gig Title and Basic Info */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{gig.title}</h1>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>Category: {gig.category}</span>
                    <span>•</span>
                    <span>Subcategory: {gig.subcategory}</span>
                    <span>•</span>
                    <span>Created {formatDate(gig.createdAt)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">
                    {formatCurrency(gig.price)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {gig.deliveryTime} day{gig.deliveryTime !== 1 ? 's' : ''} delivery
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About This Gig</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{gig.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          {gig.requirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements from Buyer</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {gig.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Icons.check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{requirement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Reviews ({gig.totalReviews})</CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <img
                          src={review.reviewer.profilePicture || '/default-avatar.png'}
                          alt={review.reviewer.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <div className="font-medium">{review.reviewer.name}</div>
                          <div className="flex items-center space-x-1">
                            {renderStars(review.rating)}
                            <span className="text-sm text-muted-foreground">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No reviews yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Card */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Price:</span>
                <span className="font-bold">{formatCurrency(gig.price)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Time:</span>
                <span>{gig.deliveryTime} day{gig.deliveryTime !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span>Revisions:</span>
                <span>{gig.revisions}</span>
              </div>
              
              {isOwner ? (
                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    onClick={() => router.push(`/dashboard/gigs/edit/${gig._id}`)}
                  >
                    <Icons.edit className="mr-2 h-4 w-4" />
                    Edit Gig
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push('/dashboard/gigs')}
                  >
                    <Icons.eye className="mr-2 h-4 w-4" />
                    View My Gigs
                  </Button>
                </div>
              ) : (
                <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      <Icons.shoppingCart className="mr-2 h-4 w-4" />
                      Order Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Place Order</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="requirements">Project Requirements</Label>
                        <Textarea
                          id="requirements"
                          placeholder="Describe your project requirements..."
                          value={orderRequirements}
                          onChange={(e) => setOrderRequirements(e.target.value)}
                          rows={4}
                        />
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Total:</span>
                        <span>{formatCurrency(gig.price)}</span>
                      </div>
                      <Button 
                        onClick={handlePlaceOrder} 
                        disabled={placingOrder}
                        className="w-full"
                      >
                        {placingOrder && <Icons.loader className="mr-2 h-4 w-4 animate-spin" />}
                        Place Order
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>

          {/* Seller Info */}
          <Card>
            <CardHeader>
              <CardTitle>About the Seller</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={gig.seller.profilePicture || '/default-avatar.png'}
                  alt={gig.seller.name}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="font-medium">{gig.seller.name}</h3>
                  <div className="flex items-center space-x-1">
                    {renderStars(gig.seller.averageRating)}
                    <span className="text-sm text-muted-foreground">
                      ({gig.seller.totalReviews} reviews)
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Response Time:</span>
                  <span>{gig.seller.responseTime} hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Completion Rate:</span>
                  <span>{gig.seller.completionRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Member Since:</span>
                  <span>{formatDate(gig.seller.memberSince)}</span>
                </div>
                {gig.seller.location && (
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span>{gig.seller.location}</span>
                  </div>
                )}
              </div>

              {gig.seller.bio && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">{gig.seller.bio}</p>
                </div>
              )}

              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => router.push(`/seller/${gig.seller._id}`)}
              >
                <Icons.user className="mr-2 h-4 w-4" />
                View Profile
              </Button>
            </CardContent>
          </Card>

          {/* Gig Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Gig Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Orders:</span>
                  <span>{gig.totalOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Views:</span>
                  <span>{gig.totalViews.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rating:</span>
                  <div className="flex items-center space-x-1">
                    {renderStars(gig.rating)}
                    <span>({gig.totalReviews})</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 