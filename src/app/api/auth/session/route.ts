import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // First try to get token from Authorization header
    const authHeader = request.headers.get('authorization');
    let token: string | null = authHeader ? authHeader.split(' ')[1] : null;
    
    // If not in header, try to get from cookies
    if (!token) {
      const cookieStore = cookies();
      const cookieToken = cookieStore.get('token')?.value;
      token = cookieToken || null;
    }

    if (!token) {
      return NextResponse.json({ error: 'No token found' }, { status: 401 });
    }

    // Verify token with backend
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${API_URL}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      // Clear invalid token
      const res = NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      res.cookies.delete('token');
      return res;
    }

    const data = await response.json();
    
    return NextResponse.json({
      user: {
        _id: data.user._id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        createdAt: data.user.createdAt,
      }
    });

  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

