"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import RequireAuth from "../RequireAuth";
import { useToast } from '@/components/ui/use-toast';
import OrderChat from "../components/OrderChat";
import LeaveReview from "../components/LeaveReview";

const STATUS_COLORS: Record<string, string> = {
  inquiry: "bg-yellow-500 text-white",
  paid: "bg-blue-500 text-white",
  in_progress: "bg-indigo-500 text-white",
  delivered: "bg-green-500 text-white",
  completed: "bg-gray-500 text-white",
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500 text-white",
  paid: "bg-blue-500 text-white",
  refunded: "bg-green-500 text-white",
  failed: "bg-red-500 text-white",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${STATUS_COLORS[status] || "bg-gray-400 text-white"}`}>{status.replace(/_/g, " ")}</span>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${PAYMENT_STATUS_COLORS[status] || "bg-gray-400 text-white"}`}>{status}</span>
  );
}

const getOrderImageSrc = (imageUrl: string) => {
  if (!imageUrl) return '/default-gig.png';
  if (imageUrl.startsWith('/uploads')) return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${imageUrl}`;
  return imageUrl;
};

export default function OrdersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingId, setPayingId] = useState<string | null>(null);
  const [viewOrder, setViewOrder] = useState<any | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/orders`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch orders");
        setOrders(data);
      } catch (e: any) {
        setError(e.message || "Network error");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!orders.length || !user?._id) return;
    const fetchAllUnread = async () => {
      const counts: Record<string, number> = {};
      await Promise.all(orders.map(async (order) => {
        counts[order._id] = await fetchUnreadCount(order._id);
      }));
      setUnreadCounts(counts);
    };
    fetchAllUnread();
  }, [orders, user]);

  async function fetchUnreadCount(orderId: string) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const res = await fetch(`${API_URL}/api/messages/${orderId}`, { credentials: "include" });
    if (!res.ok) {
      if (res.status === 403 || res.status === 401) {
        return 0;
      }
      throw new Error(`Failed to fetch unread count for order ${orderId}: ${res.statusText}`);
    }
    const messages = await res.json();
    return messages.filter((m: any) => m.unread && m.receiver === user?._id).length;
  }

  const handleMarkAsPaid = async (id: string) => {
    setPayingId(id);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/orders/${id}/pay`, {
        method: "PUT",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to mark as paid");
      setOrders(orders.map(o => o._id === id ? { ...o, status: "paid" } : o));
      toast({
        title: "Order marked as paid (demo)",
        description: "Order marked as paid (demo)",
        variant: "success",
      });
    } catch (e: any) {
      toast({
        title: e.message || "Payment failed",
        description: e.message || "Payment failed",
        variant: "destructive",
      });
    } finally {
      setPayingId(null);
    }
  };

  const handleRefund = async (id: string) => {
    setPayingId(id);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/orders/${id}/refund`, {
        method: "PUT",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to refund");
      setOrders(orders.map(o => o._id === id ? { ...o, paymentStatus: "refunded", status: o.status } : o));
      toast({
        title: "Order refunded (demo)",
        description: "Order refunded (demo)",
        variant: "success",
      });
    } catch (e: any) {
      toast({
        title: e.message || "Refund failed",
        description: e.message || "Refund failed",
        variant: "destructive",
      });
    } finally {
      setPayingId(null);
    }
  };

  const handleViewReceipt = async (id: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/orders/${id}/receipt`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to fetch receipt");
      // Show receipt in a modal or alert for demo
      alert(`Receipt for Order ${data.orderId}\nGig: ${data.gig}\nBuyer: ${data.buyer}\nSeller: ${data.seller}\nAmount: $${data.amount}\nStatus: ${data.status}\nDate: ${new Date(data.date).toLocaleString()}\nNote: ${data.note}`);
    } catch (e: any) {
      toast({
        title: e.message || "Failed to fetch receipt",
        description: e.message || "Failed to fetch receipt",
        variant: "destructive",
      });
    }
  };

  let content = null;
  if (loading) {
    content = <div className="flex justify-center items-center h-40"><span className="loader" aria-label="Loading orders..." /></div>;
  } else if (error) {
    content = <div className="text-red-500">{error}</div>;
  } else if (!orders.length) {
    content = <div className="text-gray-400 text-center">No orders found. Start by purchasing a gig!</div>;
  } else {
    content = (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        {Array.isArray(orders) ? (
          orders.map(order => (
            <div key={order._id} className="bg-gray-800 rounded-lg p-4 flex flex-col gap-2 border border-gray-700 shadow-md">
              <div className="flex items-center gap-3">
                <img
                  src={getOrderImageSrc(order.gig?.imageUrl)}
                  alt={order.gig?.title || "Gig"}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="font-bold text-lg">{order.gig?.title || "N/A"}</div>
                  <StatusBadge status={order.status} />
                  {unreadCounts[order._id] > 0 && (
                    <span className="ml-2 bg-red-600 text-white text-xs rounded-full px-2 py-0.5" aria-label="Unread messages">
                      {unreadCounts[order._id]} unread
                    </span>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-400">Buyer: {order.buyer?.name || order.buyer}</div>
              <div className="text-sm text-gray-400">Seller: {order.seller?.name || order.seller}</div>
              <div className="flex gap-2 mt-2">
                {user?.role === "client" && order.status === "inquiry" && (
                  <button
                    onClick={() => handleMarkAsPaid(order._id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition"
                    disabled={payingId === order._id}
                    aria-label="Mark as Paid (Demo)"
                  >
                    {payingId === order._id ? "Processing..." : "Mark as Paid (Demo)"}
                  </button>
                )}
                {user?.role === "client" && order.paymentStatus === "paid" && (
                  <button
                    onClick={() => handleRefund(order._id)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 transition"
                    disabled={payingId === order._id}
                    aria-label="Request Refund (Demo)"
                  >
                    {payingId === order._id ? "Processing..." : "Request Refund (Demo)"}
                  </button>
                )}
                {order.paymentStatus === "paid" && (
                  <button
                    onClick={() => handleViewReceipt(order._id)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition"
                    aria-label="View Receipt (Demo)"
                  >
                    View Receipt
                  </button>
                )}
                {/* Seller action example: Deliver Work */}
                {user?.role === "freelancer" && order.status === "paid" && (
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition"
                    aria-label="Deliver Work (Demo)"
                    // onClick={...} // Implement delivery logic
                  >
                    Deliver Work
                  </button>
                )}
                <button
                  onClick={() => setViewOrder(order)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm ml-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition"
                  aria-label="View Order Details"
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-red-500 text-center">Failed to load orders. Please try again later.</div>
        )}
      </div>
    );
  }

  return (
    <RequireAuth>
      <main className="flex flex-col items-center min-h-[60vh] px-2">
        <h1 className="text-2xl font-bold mb-4">Orders</h1>
        {content}
        {/* Order Details Modal */}
        {viewOrder && (
          <div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
            role="dialog"
            aria-modal="true"
            aria-label="Order Details"
            tabIndex={-1}
            onClick={() => setViewOrder(null)}
          >
            <div
              className="bg-gray-900 rounded-lg p-6 w-full max-w-lg relative shadow-lg"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl"
                onClick={() => setViewOrder(null)}
                aria-label="Close order details"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-2">Order Details</h2>
              <div className="mb-2"><StatusBadge status={viewOrder.status} /></div>
              <div className="mb-2 font-semibold">Gig: {viewOrder.gig?.title || "N/A"}</div>
              <div className="mb-2">Buyer: {viewOrder.buyer?.name || viewOrder.buyer}</div>
              <div className="mb-2">Seller: {viewOrder.seller?.name || viewOrder.seller}</div>
              <div className="mb-2">Created: {new Date(viewOrder.createdAt).toLocaleString()}</div>
              {viewOrder?.paymentHistory && viewOrder.paymentHistory.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Payment History</h3>
                  <ul className="text-sm bg-gray-800 rounded p-2">
                    {viewOrder.paymentHistory.map((event: any, idx: number) => (
                      <li key={idx} className="mb-1">
                        <span className="font-bold">{event.status}</span> - ${event.amount} via {event.method} on {new Date(event.date).toLocaleString()} <span className="text-gray-400">({event.note})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Add chat/messages, delivery files, review options here */}
              <div className="mt-4">
                {/* Chat UI */}
                <OrderChat order={viewOrder} />
                {/* Review UI (if order completed and not reviewed) */}
                {user?.role === "client" && viewOrder.status === "completed" && !viewOrder.reviewed && (
                  <LeaveReview order={viewOrder} onReviewSubmitted={() => {/* refresh order/reviews */}} />
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </RequireAuth>
  );
}

// Tailwind loader spinner
// Add this to your global CSS or as a component
// .loader { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 32px; height: 32px; animation: spin 1s linear infinite; }
// @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } 