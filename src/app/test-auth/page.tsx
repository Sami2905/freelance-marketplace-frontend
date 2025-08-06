"use client";

import { useAuth } from "../AuthContext";
import { useState } from "react";

export default function TestAuthPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [showDebug, setShowDebug] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Test Page</h1>
        
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
            
            {user && (
              <button
                onClick={logout}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
              >
                Logout
              </button>
            )}
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-4">
              <a
                href="/login"
                className="block px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-center"
              >
                Go to Login
              </a>
              <a
                href="/register"
                className="block px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-center"
              >
                Go to Register
              </a>
              <a
                href="/dashboard"
                className="block px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-center"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
          >
            {showDebug ? 'Hide' : 'Show'} Debug Info
          </button>
          
          {showDebug && (
            <div className="mt-4 bg-gray-800 p-4 rounded">
              <h3 className="font-semibold mb-2">Debug Information</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify({
                  user,
                  isAuthenticated,
                  isLoading,
                  cookies: document.cookie,
                  localStorage: typeof window !== 'undefined' ? Object.keys(localStorage) : [],
                }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 