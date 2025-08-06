import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROLES, canAccessRoute } from './lib/permissions';

type UserRole = typeof ROLES[keyof typeof ROLES];

// Define paths that don't require authentication
const publicPaths = ['/login', '/register', '/', '/_error', '/_404', '/_500', '/unauthorized', '/test-auth', '/test-login', '/test-server', '/debug-db', '/test-redirect'];

// Define role-based default paths
const roleBasedRedirects: Record<UserRole, string> = {
  [ROLES.ADMIN]: '/admin/dashboard',
  [ROLES.CLIENT]: '/gigs',
  [ROLES.FREELANCER]: '/dashboard',
};

// Paths that require authentication but no specific permission
const authenticatedPaths = ['/profile', '/settings'];

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;
  
  // Skip middleware for public paths, API routes, and static files
  if (
    publicPaths.some(path => pathname === path) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  try {
    // Skip middleware for API routes and static files
    if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.includes('.')) {
      return NextResponse.next();
    }

    // Skip middleware for auth-related pages
    if (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname === '/') {
      return NextResponse.next();
    }

    // Check for auth token in cookies
    const token = request.cookies.get('token')?.value;
    
    // If no token, redirect to login with callback URL
    if (!token) {
      const loginUrl = new URL('/login', origin);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify the token with the backend
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // If token verification fails, clear the token and redirect to login
        const loginUrl = new URL('/login', origin);
        loginUrl.searchParams.set('callbackUrl', pathname);
        loginUrl.searchParams.set('error', 'SessionExpired');
        
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete('token');
        return response;
      }
      
      // Token is valid, allow the request to proceed
      return NextResponse.next();
      
    } catch (error) {
      console.error('Token verification error:', error);
      const loginUrl = new URL('/login', origin);
      loginUrl.searchParams.set('error', 'AuthError');
      return NextResponse.redirect(loginUrl);
    }
    
  } catch (error) {
    console.error('Middleware error:', error);
    // In case of error, redirect to error page
    return NextResponse.redirect(new URL('/500', origin));
  }
}

// Configure which paths should be processed by this middleware
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth/.*).*)',
  ],
};
