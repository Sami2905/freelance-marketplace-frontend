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

interface Order {
  _id: string;
  gig: {
    _id: string;
    title: string;
    images: string[];
    price: number;
  };
  buyer: {
    _id: string;
    name: string;
    email: string;
    profilePicture: string;
  };
  seller: {
    _id: string;
    name: string;
    email: string;
    profilePicture: string;
  };
  amount: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'delivered' | 'completed' | 'cancelled' | 'disputed';
  requirements: string[];
  deliveryFiles?: Array<{
    filename: string;
    url: string;
    uploadedAt: string;
  }>;
  deliveryMessage?: string;
  deliveryDate?: string;
  completedDate?: string;
  cancelledDate?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  createdAt: string;
  deadline: string;
}

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    name: string;
    profilePicture: string;
  };
  timestamp: string;
  read: boolean;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  const [deliveryFiles, setDeliveryFiles] = useState<File[]>([]);
  const [deliveryMessage, setDeliveryMessage] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchOrderDetails();
      fetchOrderMessages();
    }
  }, [params.id]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${params.id}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrder(data.data);
      } else {
        console.error('Error fetching order details:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderMessages = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${params.id}/messages`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const updateOrderStatus = async (status: string) => {
    setUpdatingStatus(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${params.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchOrderDetails();
      } else {
        console.error('Error updating order status:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setSendingMessage(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${params.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: newMessage
        })
      });

      if (response.ok) {
        setNewMessage('');
        fetchOrderMessages();
      } else {
        console.error('Error sending message:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const submitDelivery = async () => {
    setDeliveryDialogOpen(false);
    try {
      const formData = new FormData();
      formData.append('deliveryMessage', deliveryMessage);
      deliveryFiles.forEach(file => {
        formData.append('deliveryFiles', file);
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${params.id}/delivery`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        fetchOrderDetails();
        setDeliveryMessage('');
        setDeliveryFiles([]);
      } else {
        console.error('Error submitting delivery:', response.statusText);
      }
    } catch (error) {
      console.error('Error submitting delivery:', error);
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

  const canUpdateStatus = (status: string) => {
    if (!order) return false;
    
    const isSeller = user?._id === order.seller._id;
    const isBuyer = user?._id === order.buyer._id;
    
    switch (status) {
      case 'accepted':
        return isSeller && order.status === 'pending';
      case 'in_progress':
        return isSeller && order.status === 'accepted';
      case 'delivered':
        return isSeller && order.status === 'in_progress';
      case 'completed':
        return isBuyer && order.status === 'delivered';
      case 'cancelled':
        return (isBuyer || isSeller) && ['pending', 'accepted', 'in_progress'].includes(order.status);
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icons.loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Icons.alertCircle className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Order not found</h3>
            <p className="text-muted-foreground text-center">
              The order you're looking for doesn't exist or you don't have permission to view it.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isSeller = user?._id === order.seller._id;
  const isBuyer = user?._id === order.buyer._id;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{order.gig.title}</h1>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>Order #{order._id.slice(-8)}</span>
                    <span>•</span>
                    <span>Created {formatDate(order.createdAt)}</span>
                    <span>•</span>
                    <span>Due {formatDate(order.deadline)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(order.amount)}
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Gig Details */}
          <Card>
            <CardHeader>
              <CardTitle>Gig Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <img
                  src={order.gig.images[0] || '/default-gig.png'}
                  alt={order.gig.title}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <h3 className="font-medium">{order.gig.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Price: {formatCurrency(order.gig.price)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          {order.requirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Project Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {order.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Icons.check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{requirement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Delivery Files */}
          {order.deliveryFiles && order.deliveryFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Delivered Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {order.deliveryFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-2">
                        <Icons.file className="w-4 h-4" />
                        <span>{file.filename}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        <Icons.download className="mr-1 h-3 w-3" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
                {order.deliveryMessage && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <p className="text-sm">{order.deliveryMessage}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                {messages.map((message) => (
                  <div key={message._id} className={`flex ${message.sender._id === user?._id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                      message.sender._id === user?._id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-gray-100'
                    }`}>
                      <div className="flex items-center space-x-2 mb-1">
                        <img
                          src={message.sender.profilePicture || '/default-avatar.png'}
                          alt={message.sender.name}
                          className="w-4 h-4 rounded-full"
                        />
                        <span className="text-xs font-medium">{message.sender.name}</span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                  rows={2}
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={sendingMessage || !newMessage.trim()}
                >
                  {sendingMessage ? (
                    <Icons.loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Icons.send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Order Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {canUpdateStatus('accepted') && (
                <Button 
                  onClick={() => updateOrderStatus('accepted')}
                  disabled={updatingStatus}
                  className="w-full"
                >
                  Accept Order
                </Button>
              )}
              
              {canUpdateStatus('in_progress') && (
                <Button 
                  onClick={() => updateOrderStatus('in_progress')}
                  disabled={updatingStatus}
                  className="w-full"
                >
                  Start Work
                </Button>
              )}
              
              {canUpdateStatus('delivered') && (
                <Dialog open={deliveryDialogOpen} onOpenChange={setDeliveryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      Deliver Work
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Deliver Work</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="deliveryMessage">Delivery Message</Label>
                        <Textarea
                          id="deliveryMessage"
                          placeholder="Describe what you've delivered..."
                          value={deliveryMessage}
                          onChange={(e) => setDeliveryMessage(e.target.value)}
                          rows={4}
                        />
                      </div>
                      <div>
                        <Label htmlFor="deliveryFiles">Upload Files</Label>
                        <input
                          type="file"
                          multiple
                          onChange={(e) => setDeliveryFiles(Array.from(e.target.files || []))}
                          className="mt-1"
                        />
                      </div>
                      <Button onClick={submitDelivery} className="w-full">
                        Submit Delivery
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              
              {canUpdateStatus('completed') && (
                <Button 
                  onClick={() => updateOrderStatus('completed')}
                  disabled={updatingStatus}
                  className="w-full"
                >
                  Complete Order
                </Button>
              )}
              
              {canUpdateStatus('cancelled') && (
                <Button 
                  variant="destructive"
                  onClick={() => updateOrderStatus('cancelled')}
                  disabled={updatingStatus}
                  className="w-full"
                >
                  Cancel Order
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Order ID:</span>
                  <span className="font-mono">{order._id.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-medium">{formatCurrency(order.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span>{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Deadline:</span>
                  <span>{formatDate(order.deadline)}</span>
                </div>
                {order.deliveryDate && (
                  <div className="flex justify-between">
                    <span>Delivered:</span>
                    <span>{formatDate(order.deliveryDate)}</span>
                  </div>
                )}
                {order.completedDate && (
                  <div className="flex justify-between">
                    <span>Completed:</span>
                    <span>{formatDate(order.completedDate)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle>{isSeller ? 'Buyer' : 'Seller'} Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <img
                  src={(isSeller ? order.buyer : order.seller).profilePicture || '/default-avatar.png'}
                  alt={(isSeller ? order.buyer : order.seller).name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-medium">{(isSeller ? order.buyer : order.seller).name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {(isSeller ? order.buyer : order.seller).email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 