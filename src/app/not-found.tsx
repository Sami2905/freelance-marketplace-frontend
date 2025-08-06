"use client";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h1 className="text-5xl font-bold text-blue-500 mb-4">404</h1>
      <p className="text-lg text-gray-300 mb-6">Sorry, the page you are looking for does not exist.</p>
      <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold shadow">Go Home</Link>
    </main>
  );
} 