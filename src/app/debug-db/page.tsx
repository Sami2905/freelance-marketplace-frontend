"use client";

import { useState } from "react";

export default function DebugDBPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const testCredentials = [
    { email: "alice@example.com", password: "password", role: "client" },
    { email: "bob@example.com", password: "password", role: "freelancer" },
    { email: "admin@example.com", password: "adminpass", role: "admin" },
    { email: "dev1@gmail.com", password: "password", role: "client" }, // The one from your image
  ];

  const testLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Always use port 5000 for API server
      const API_URL = 'http://localhost:5000';
      
      console.log(`🔍 Testing login for: ${email}`);
      console.log(`🔑 Password: ${password}`);
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      const result = {
        email,
        password: password,
        status: response.status,
        success: response.ok,
        data: data,
        timestamp: new Date().toISOString()
      };
      
      setTestResults(prev => [...prev, result]);
      
      if (response.ok) {
        console.log(`✅ Login successful for ${email}`);
      } else {
        console.log(`❌ Login failed for ${email}:`, data);
      }
      
    } catch (error) {
      const result = {
        email,
        password: password,
        status: 'ERROR',
        success: false,
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date().toISOString()
      };
      
      setTestResults(prev => [...prev, result]);
      console.error(`❌ Error testing ${email}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    setIsLoading(true);
    
    for (const cred of testCredentials) {
      await testLogin(cred.email, cred.password);
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait 0.5 seconds between tests
    }
    
    setIsLoading(false);
  };

  const testSpecificLogin = async () => {
    const email = prompt("Enter email:");
    const password = prompt("Enter password:");
    
    if (email && password) {
      await testLogin(email, password);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Database Debug Page</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-y-4">
            <button
              onClick={runAllTests}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
              disabled={isLoading}
            >
              {isLoading ? 'Testing...' : 'Test All Credentials'}
            </button>
            
            <button
              onClick={testSpecificLogin}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
              disabled={isLoading}
            >
              Test Custom Credentials
            </button>
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="space-y-4">
            {testResults.map((test, index) => (
              <div key={index} className="border border-gray-700 p-4 rounded">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="font-semibold">{test.email}</span>
                    <span className="text-sm text-gray-400 ml-2">({test.password})</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-sm ${
                    test.success ? 'bg-green-600' : 'bg-red-600'
                  }`}>
                    {test.success ? 'SUCCESS' : 'FAILED'}
                  </span>
                </div>
                <p className="text-sm text-gray-400">Status: {test.status}</p>
                <p className="text-sm text-gray-400">Time: {test.timestamp}</p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-blue-400">View Response</summary>
                  <pre className="mt-2 text-xs bg-gray-900 p-2 rounded overflow-auto">
                    {JSON.stringify(test.data, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg mt-8">
          <h2 className="text-xl font-semibold mb-4">Expected Test Users</h2>
          <div className="space-y-2">
            {testCredentials.map((cred, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                <div>
                  <span className="font-medium">{cred.email}</span>
                  <span className="text-sm text-gray-400 ml-2">({cred.role})</span>
                </div>
                <span className="text-sm text-gray-400">{cred.password}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 