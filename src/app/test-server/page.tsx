"use client";

import { useState } from "react";

export default function TestServerPage() {
  const [serverStatus, setServerStatus] = useState<string>("");
  const [testResults, setTestResults] = useState<any[]>([]);

  const testServer = async () => {
    try {
      setServerStatus("Testing server connection...");
      
      // Always use port 5000 for API server
      const API_URL = 'http://localhost:5000';
      
      // Test health endpoint
      const healthResponse = await fetch(`${API_URL}/api/health`);
      const healthData = await healthResponse.json();
      
      // Test auth endpoint
      const authResponse = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'test@test.com', password: 'test' }),
      });
      
      const authData = await authResponse.json();
      
      const results = [
        {
          endpoint: '/api/health',
          status: healthResponse.status,
          success: healthResponse.ok,
          data: healthData
        },
        {
          endpoint: '/api/auth/login',
          status: authResponse.status,
          success: authResponse.ok,
          data: authData
        }
      ];
      
      setTestResults(results);
      
      if (healthResponse.ok) {
        setServerStatus("✅ Server is running and accessible");
      } else {
        setServerStatus("❌ Server health check failed");
      }
      
    } catch (error) {
      setServerStatus(`❌ Server connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTestResults([{
        endpoint: 'Connection Test',
        status: 'ERROR',
        success: false,
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      }]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Server Test Page</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Server Status</h2>
          <button
            onClick={testServer}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded mb-4"
          >
            Test Server Connection
          </button>
          <p className="text-lg">{serverStatus}</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="space-y-4">
            {testResults.map((test, index) => (
              <div key={index} className="border border-gray-700 p-4 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{test.endpoint}</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    test.success ? 'bg-green-600' : 'bg-red-600'
                  }`}>
                    {test.success ? 'SUCCESS' : 'FAILED'}
                  </span>
                </div>
                <p className="text-sm text-gray-400">Status: {test.status}</p>
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