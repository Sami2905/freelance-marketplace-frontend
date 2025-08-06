"use client";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error, reset: () => void }) {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h1 className="text-3xl font-bold text-red-500 mb-4">Something went wrong</h1>
      <p className="text-lg text-gray-300 mb-6">{error.message || "An unexpected error occurred."}</p>
      <button onClick={reset} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold shadow mb-2">Try Again</button>
      <Link href="/" className="text-blue-400 hover:underline">Go Home</Link>
    </main>
  );
} 