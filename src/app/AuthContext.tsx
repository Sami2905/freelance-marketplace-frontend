"use client";
import { useRouter } from "next/navigation";
import { createContext, useState, useEffect, useContext, useRef } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'client' | 'freelancer' | 'admin';
  profilePicture?: string;
  bio?: string;
  skills?: string[];
  hourlyRate?: number;
  location?: string;
  phone?: string;
  website?: string;
  isVerified?: boolean;
  isActive?: boolean;
  totalEarnings?: number;
  totalOrders?: number;
  averageRating?: number;
  totalReviews?: number;
  responseTime?: number;
  completionRate?: number;
  memberSince?: string;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [requireManualLogin, setRequireManualLogin] = useState(false);
  const router = useRouter();
  const isFetchingRef = useRef(false);

  // Development flag to force manual login (set to true to disable auto-login)
  const FORCE_MANUAL_LOGIN = false;

  const getApiUrl = () => {
    // Always use port 5000 for the API server
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  };

  const clearExistingTokens = () => {
    // Clear any existing tokens from cookies
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    // Also clear from localStorage if any
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  };

  const fetchProfile = async () => {
    if (isFetchingRef.current) return; // Prevent multiple simultaneous calls
    
    isFetchingRef.current = true;
    setIsLoading(true);
    try {
      const API_URL = getApiUrl();
      console.log('🔍 Fetching profile from:', `${API_URL}/api/auth/profile`);
      
      // Get the stored token
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'GET',
        credentials: 'include',
        headers
      });
      
      console.log('📡 Profile response status:', res.status);
      
      if (res.status === 401) {
        console.log('❌ Authentication failed, clearing user state');
        setUser(null);
        setRequireManualLogin(true);
        localStorage.removeItem('authToken');
        return;
      }
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Profile fetch failed with status:', res.status, 'Response:', errorText);
        setUser(null);
        setRequireManualLogin(true);
        localStorage.removeItem('authToken');
        return;
      }
      
      const data = await res.json();
      console.log('✅ Profile data received:', data);
      
      if (data.user) {
        setUser(data.user);
        setRequireManualLogin(false);
        console.log('👤 User state updated with profile data');
      } else {
        console.error('❌ No user data in response:', data);
        setUser(null);
        setRequireManualLogin(true);
      }
    } catch (error) {
      console.error('❌ Error in fetchProfile:', error);
      setUser(null);
      setRequireManualLogin(true);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const API_URL = getApiUrl();
      console.log('🔍 Sending login request to:', `${API_URL}/api/auth/login`);
      console.log('📧 Email:', email);
      console.log('🔑 Password length:', password.length);
      
      const requestBody = { email, password };
      console.log('📦 Request body:', { email, password: '***' });
      
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include', // Important for receiving cookies
        body: JSON.stringify(requestBody),
      });
      
      console.log('📡 Response status:', res.status);
      console.log('📡 Response headers:', Object.fromEntries(res.headers.entries()));
      
      const data = await res.json();
      console.log('📄 Response data:', data);
      
      if (!res.ok) {
        console.error('❌ Login failed with status:', res.status);
        console.error('❌ Error data:', data);
        throw new Error(data.message || data.errors?.[0]?.msg || 'Login failed');
      }
      
      if (!data.user) {
        throw new Error('No user data received from server');
      }
      
      // Store the token in localStorage for Authorization headers
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        console.log('💾 Token stored in localStorage');
      }
      
      console.log('✅ Login successful, setting user state');
      // Set user state immediately from login response
      setUser(data.user);
      setRequireManualLogin(false);
      
      // Check for callback URL from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const callbackUrl = urlParams.get('callbackUrl');
      
      // Determine redirect path based on role or callback URL
      let redirectPath = '/';
      if (callbackUrl) {
        redirectPath = callbackUrl;
        console.log('🔄 Redirecting to callback URL:', redirectPath);
      } else {
        const userRole = data.user.role;
        if (userRole === 'freelancer') {
          redirectPath = '/dashboard';
        } else if (userRole === 'client') {
          redirectPath = '/gigs';
        } else if (userRole === 'admin') {
          redirectPath = '/admin/dashboard';
        }
        console.log('🔄 Redirecting to role-based path:', redirectPath);
      }
      
      // Set loading to false before redirect
      setIsLoading(false);
      
      // Use Next.js router instead of window.location.href to prevent page reload
      try {
        await router.push(redirectPath);
      } catch (redirectError) {
        console.error('❌ Redirect failed:', redirectError);
        // Fallback to window.location if router fails
        window.location.href = redirectPath;
      }
      
    } catch (error: unknown) {
      console.error('❌ Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setIsLoading(false);
      setUser(null);
      setRequireManualLogin(true);
      throw new Error(errorMessage);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const API_URL = getApiUrl();
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear user state and require manual login
      setUser(null);
      setRequireManualLogin(true);
      // Clear stored token
      localStorage.removeItem('authToken');
      // Use Next.js router instead of window.location.href
      router.push('/login');
    }
  };

  // Check for existing session on mount (only once)
  useEffect(() => {
    if (!hasCheckedAuth && !isFetchingRef.current) {
      const checkAuth = async () => {
        try {
          console.log('🔍 Starting authentication check...');
          
          // Only check auth if we're not on login/register pages
          const currentPath = window.location.pathname;
          console.log('📍 Current path:', currentPath);
          
          if (currentPath === '/login' || currentPath === '/register') {
            console.log('🚫 On auth page, requiring manual login');
            setRequireManualLogin(true);
            setHasCheckedAuth(true);
            setIsLoading(false);
            return;
          }
          
          // For development/testing: use the flag to force manual login
          if (FORCE_MANUAL_LOGIN) {
            console.log('🔒 Force manual login enabled');
            setRequireManualLogin(true);
            setHasCheckedAuth(true);
            setIsLoading(false);
            return;
          }
          
          console.log('🔐 Checking existing session...');
          await fetchProfile();
        } catch (error) {
          console.error('❌ Initial auth check failed:', error);
          setUser(null);
          setRequireManualLogin(true);
        } finally {
          setHasCheckedAuth(true);
        }
      };
      
      checkAuth();
    }
  }, [hasCheckedAuth]);

  const value = {
    user,
    isLoading,
    login,
    logout,
    fetchProfile,
    isAuthenticated: !!user && !requireManualLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}