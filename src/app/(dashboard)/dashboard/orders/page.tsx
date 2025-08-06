'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';

interface Order {
  _id: string;
  gig: {
    _id: string;
    title: string;
    images: string[];
  };
  buyer: {
    _id: string;
    name: string;
    email: string;
  };
  seller: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'delivered' | 'completed' | 'cancelled' | 'disputed';
  requirements: string[];
  deliveryDate?: string;
  completedDate?: string;
  createdAt: string;
  deadline: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'buying' | 'selling'>('buying');

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      const endpoint = activeTab === 'buying' ? 'buyer' : 'seller';
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${endpoint}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.data || []);
      } else {
        console.error('Error fetching orders:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchOrders(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'disputed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const canAcceptOrder = (order: Order) => {
    return order.status === 'pending' && user?._id === order.seller._id;
  };

  const canDeliverOrder = (order: Order) => {
    return order.status === 'in_progress' && user?._id === order.seller._id;
  };

  const canCompleteOrder = (order: Order) => {
    return order.status === 'delivered' && user?._id === order.buyer._id;
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
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage your project orders</p>
        </div>
        <Button>
          <Icons.plus className="mr-2 h-4 w-4" />
          Browse Gigs
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={activeTab === 'buying' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('buying')}
        >
          Orders I'm Buying
        </Button>
        <Button
          variant={activeTab === 'selling' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('selling')}
        >
          Orders I'm Selling
        </Button>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order._id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={order.gig.images[0] || '/default-gig.png'}
                    alt={order.gig.title}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-medium">{order.gig.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {activeTab === 'buying' ? `Seller: ${order.seller.name}` : `Buyer: ${order.buyer.name}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(order.amount)}</div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                <span>Created: {formatDate(order.createdAt)}</span>
                <span>Deadline: {formatDate(order.deadline)}</span>
              </div>
                              <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => router.push(`/dashboard/orders/${order._id}`)}>
                    <Icons.eye className="mr-1 h-3 w-3" />
                    View Details
                  </Button>
                <Button size="sm" variant="outline">
                  <Icons.messageCircle className="mr-1 h-3 w-3" />
                  Contact {activeTab === 'buying' ? 'Seller' : 'Buyer'}
                </Button>
                {canAcceptOrder(order) && (
                  <Button 
                    size="sm"
                    onClick={() => updateOrderStatus(order._id, 'accepted')}
                  >
                    Accept Order
                  </Button>
                )}
                {canDeliverOrder(order) && (
                  <Button 
                    size="sm"
                    onClick={() => updateOrderStatus(order._id, 'delivered')}
                  >
                    Deliver
                  </Button>
                )}
                {canCompleteOrder(order) && (
                  <Button 
                    size="sm"
                    onClick={() => updateOrderStatus(order._id, 'completed')}
                  >
                    Complete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {orders.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Icons.shoppingCart className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No orders yet</h3>
            <p className="text-muted-foreground text-center">
              {activeTab === 'buying' 
                ? 'You haven\'t placed any orders yet. Browse gigs to find services you need.'
                : 'You don\'t have any orders yet. Start offering your services to get your first order.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 