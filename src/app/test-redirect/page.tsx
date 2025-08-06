"use client";

import { useAuth } from "../AuthContext";
import { useEffect, useState } from "react";

export default function TestRedirectPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [redirectInfo, setRedirectInfo] = useState<any>({});

  useEffect(() => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const callbackUrl = urlParams.get('callbackUrl');
    const error = urlParams.get('error');
    
    setRedirectInfo({
      callbackUrl,
      error,
      currentPath: window.location.pathname,
      isAuthenticated,
      user: user ? { name: user.name, email: user.email, role: user.role } : null
    });
  }, [isAuthenticated, user]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Redirect Test Page</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Current State</h2>
            <div className="space-y-2">
              <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
              <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
              <p><strong>User:</strong> {user ? user.name : 'None'}</p>
              <p><strong>Email:</strong> {user ? user.email : 'None'}</p>
              <p><strong>Role:</strong> {user ? user.role : 'None'}</p>
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Redirect Information</h2>
            <div className="space-y-2">
              <p><strong>Current Path:</strong> {redirectInfo.currentPath}</p>
              <p><strong>Callback URL:</strong> {redirectInfo.callbackUrl || 'None'}</p>
              <p><strong>Error:</strong> {redirectInfo.error || 'None'}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Test Links</h2>
          <div className="space-y-4">
            <a
              href="/login?callbackUrl=/dashboard"
              className="block px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-center"
            >
              Test Login with Dashboard Callback
            </a>
            <a
              href="/login?callbackUrl=/gigs"
              className="block px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-center"
            >
              Test Login with Gigs Callback
            </a>
            <a
              href="/dashboard"
              className="block px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-center"
            >
              Test Protected Route (should redirect to login)
            </a>
          </div>
        </div>
        
        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <pre className="text-sm overflow-auto bg-gray-900 p-4 rounded">
            {JSON.stringify(redirectInfo, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
} 