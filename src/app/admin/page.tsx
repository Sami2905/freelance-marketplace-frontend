"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import RequireAuth from "../RequireAuth";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default function AdminPaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [buyerFilter, setBuyerFilter] = useState("");
  const [gigFilter, setGigFilter] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      setError("");
      try {
        let query = [];
        if (statusFilter) query.push(`status=${statusFilter}`);
        if (buyerFilter) query.push(`user=${buyerFilter}`);
        if (gigFilter) query.push(`gig=${gigFilter}`);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/admin/payments${query.length ? "?" + query.join("&") : ""}`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || "Failed to fetch payments");
        setPayments(data);
      } catch (e: any) {
        setError(e.message || "Network error");
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [statusFilter, buyerFilter, gigFilter]);

  const buyers = Array.from(new Set(payments.map(p => p.buyer).filter(Boolean)));
  const gigs = Array.from(new Set(payments.map(p => p.gig).filter(Boolean)));

  return (
    <RequireAuth>
      <main className="flex flex-col items-center min-h-[60vh] px-2">
        <h1 className="text-2xl font-bold mb-4">Admin Payments Overview</h1>
        <div className="w-full max-w-5xl bg-gray-800 rounded-lg p-4 mb-4">
          <div className="flex flex-wrap gap-4 mb-4">
            <div>Total Payments: <span className="font-bold">{payments.length}</span></div>
            <div>Paid: <span className="font-bold">{payments.filter(p => p.status === 'paid').length}</span></div>
            <div>Refunded: <span className="font-bold">{payments.filter(p => p.status === 'refunded').length}</span></div>
            <div>Total Amount: <span className="font-bold">${payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0)}</span></div>
          </div>
          <div className="flex gap-4 mb-4">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-2 py-1 rounded bg-gray-700 text-white">
              <option value="">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <select value={buyerFilter} onChange={e => setBuyerFilter(e.target.value)} className="px-2 py-1 rounded bg-gray-700 text-white">
              <option value="">All Buyers</option>
              {buyers.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <select value={gigFilter} onChange={e => setGigFilter(e.target.value)} className="px-2 py-1 rounded bg-gray-700 text-white">
              <option value="">All Gigs</option>
              {gigs.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          {loading ? (
            <div>Loading payments...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead>
                  <tr className="bg-gray-700 text-white">
                    <th className="px-2 py-1">Order ID</th>
                    <th className="px-2 py-1">Gig</th>
                    <th className="px-2 py-1">Buyer</th>
                    <th className="px-2 py-1">Seller</th>
                    <th className="px-2 py-1">Status</th>
                    <th className="px-2 py-1">Amount</th>
                    <th className="px-2 py-1">Method</th>
                    <th className="px-2 py-1">Date</th>
                    <th className="px-2 py-1">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, idx) => (
                    <tr key={idx} className="border-b border-gray-700">
                      <td className="px-2 py-1">{p.orderId}</td>
                      <td className="px-2 py-1">{p.gig}</td>
                      <td className="px-2 py-1">{p.buyer}</td>
                      <td className="px-2 py-1">{p.seller}</td>
                      <td className="px-2 py-1">{p.status}</td>
                      <td className="px-2 py-1">${p.amount}</td>
                      <td className="px-2 py-1">{p.method}</td>
                      <td className="px-2 py-1">{new Date(p.date).toLocaleString()}</td>
                      <td className="px-2 py-1">{p.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </RequireAuth>
  );
} 