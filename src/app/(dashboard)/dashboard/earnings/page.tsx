'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';

interface Earning {
  _id: string;
  amount: number;
  gig: {
    title: string;
  };
  buyer: {
    name: string;
  };
  completedDate: string;
  status: string;
}

interface EarningsStats {
  totalEarnings: number;
  pendingEarnings: number;
  thisMonthEarnings: number;
  lastMonthEarnings: number;
}

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default function EarningsPage() {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [stats, setStats] = useState<EarningsStats>({
    totalEarnings: 0,
    pendingEarnings: 0,
    thisMonthEarnings: 0,
    lastMonthEarnings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      // Fetch completed orders (earnings)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/seller`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        const completedOrders = data.data?.filter((order: any) => 
          order.status === 'completed' || order.status === 'delivered'
        ) || [];
        
        setEarnings(completedOrders);
        
        // Calculate stats
        const totalEarnings = completedOrders.reduce((sum: number, order: any) => sum + order.amount, 0);
        const pendingOrders = data.data?.filter((order: any) => 
          order.status === 'in_progress' || order.status === 'accepted'
        ) || [];
        const pendingEarnings = pendingOrders.reduce((sum: number, order: any) => sum + order.amount, 0);
        
        // Calculate this month and last month earnings
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        
        const thisMonthEarnings = completedOrders
          .filter((order: any) => {
            const orderDate = new Date(order.completedDate || order.createdAt);
            return orderDate.getMonth() === thisMonth && orderDate.getFullYear() === thisYear;
          })
          .reduce((sum: number, order: any) => sum + order.amount, 0);
        
        const lastMonthEarnings = completedOrders
          .filter((order: any) => {
            const orderDate = new Date(order.completedDate || order.createdAt);
            const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
            const lastYear = thisMonth === 0 ? thisYear - 1 : thisYear;
            return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastYear;
          })
          .reduce((sum: number, order: any) => sum + order.amount, 0);
        
        setStats({
          totalEarnings,
          pendingEarnings,
          thisMonthEarnings,
          lastMonthEarnings
        });
      } else {
        console.error('Error fetching earnings:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
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

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
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
          <h1 className="text-2xl font-bold">Earnings</h1>
          <p className="text-muted-foreground">Track your income and payments</p>
        </div>
        <Button>
          <Icons.download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <Icons.dollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Icons.clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.pendingEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Icons.calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.thisMonthEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              {getPercentageChange(stats.thisMonthEarnings, stats.lastMonthEarnings)} from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Earnings List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {earnings.map((earning) => (
              <div key={earning._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Icons.dollarSign className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{earning.gig.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Client: {earning.buyer.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(earning.amount)}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(earning.completedDate || earning._id)}
                  </div>
                  <Badge 
                    variant="default"
                    className="mt-1"
                  >
                    Completed
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {earnings.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Icons.dollarSign className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No earnings yet</h3>
            <p className="text-muted-foreground text-center">
              You don't have any earnings yet. Complete your first project to start earning.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 