import React from 'react';

export default function LegalPage() {
  return (
    <main className="flex flex-col items-center min-h-[60vh] px-2">
      <h1 className="text-2xl font-bold mb-4">Legal & Policies</h1>
      <section className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mb-6">
        <h2 className="text-lg font-bold mb-2">Terms of Service</h2>
        <p className="text-gray-300 mb-4">This is a demo freelance marketplace. Use at your own risk. No real transactions occur.</p>
        <h2 className="text-lg font-bold mb-2">Privacy Policy</h2>
        <p className="text-gray-300 mb-4">We do not collect or share your data. All data is for demo purposes only.</p>
        <h2 className="text-lg font-bold mb-2">Legal Notice</h2>
        <p className="text-gray-300">This project is for educational/demo use. No warranties or guarantees are provided.</p>
      </section>
    </main>
  );
} 