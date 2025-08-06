import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // For now, return mock data since we don't have the full analytics setup
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const range = searchParams.get('range') || 'week';

    if (type === 'revenue') {
      // Mock revenue data
      const revenueData = [
        { date: '2024-01-01', revenue: 1200 },
        { date: '2024-01-02', revenue: 1800 },
        { date: '2024-01-03', revenue: 1500 },
        { date: '2024-01-04', revenue: 2200 },
        { date: '2024-01-05', revenue: 1900 },
        { date: '2024-01-06', revenue: 2400 },
        { date: '2024-01-07', revenue: 2100 },
      ];
      return NextResponse.json(revenueData);
    } else if (type === 'users') {
      // Mock user growth data
      const userData = [
        { date: '2024-01-01', users: 5 },
        { date: '2024-01-02', users: 8 },
        { date: '2024-01-03', users: 12 },
        { date: '2024-01-04', users: 15 },
        { date: '2024-01-05', users: 18 },
        { date: '2024-01-06', users: 22 },
        { date: '2024-01-07', users: 25 },
      ];
      return NextResponse.json(userData);
    } else if (type === 'categories') {
      // Mock category data
      const categoryData = [
        { name: 'Web Development', value: 45 },
        { name: 'Graphic Design', value: 32 },
        { name: 'Content Writing', value: 28 },
        { name: 'Digital Marketing', value: 24 },
        { name: 'Video Editing', value: 18 },
      ];
      return NextResponse.json(categoryData);
    } else if (type === 'stats') {
      // Mock dashboard stats
      return NextResponse.json({
        totalUsers: 1250,
        activeUsers: 890,
        totalGigs: 456,
        totalOrders: 234,
        totalRevenue: 45600
      });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
