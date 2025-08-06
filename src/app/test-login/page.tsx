"use client";

import { useState } from "react";
import { useAuth } from "../AuthContext";

export default function TestLoginPage() {
  const { login, isLoading, user, isAuthenticated } = useAuth();
  const [result, setResult] = useState<string>("");
  const [testResults, setTestResults] = useState<any[]>([]);

  const testCredentials = [
    { email: "alice@example.com", password: "password", role: "client" },
    { email: "bob@example.com", password: "password", role: "freelancer" },
    { email: "admin@example.com", password: "adminpass", role: "admin" },
  ];

  const testLogin = async (email: string, password: string) => {
    try {
      setResult(`Testing login with ${email}...`);
      
      // Test the API endpoint directly
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      const testResult = {
        email,
        status: response.status,
        success: response.ok,
        data: data,
        timestamp: new Date().toISOString()
      };
      
      setTestResults(prev => [...prev, testResult]);
      
      if (response.ok) {
        setResult(`✅ Login successful for ${email}`);
        // Try the actual login function
        await login(email, password);
      } else {
        setResult(`❌ Login failed for ${email}: ${data.message || data.errors?.[0]?.msg || 'Unknown error'}`);
      }
    } catch (error) {
      const testResult = {
        email,
        status: 'ERROR',
        success: false,
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date().toISOString()
      };
      
      setTestResults(prev => [...prev, testResult]);
      setResult(`❌ Error testing ${email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    setResult("Running all tests...");
    
    for (const cred of testCredentials) {
      await testLogin(cred.email, cred.password);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
    }
    
    setResult("All tests completed!");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Login Test Page</h1>
        
        <div className="grid md:grid-cols-2 gap-8 mb-8">
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
            <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
            <div className="space-y-4">
              <button
                onClick={runAllTests}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
                disabled={isLoading}
              >
                Run All Tests
              </button>
              
              {testCredentials.map((cred, index) => (
                <button
                  key={index}
                  onClick={() => testLogin(cred.email, cred.password)}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
                  disabled={isLoading}
                >
                  Test {cred.role} Login
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Current Result</h2>
          <p className="text-lg">{result}</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="space-y-4">
            {testResults.map((test, index) => (
              <div key={index} className="border border-gray-700 p-4 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{test.email}</span>
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
      </div>
    </div>
  );
} 