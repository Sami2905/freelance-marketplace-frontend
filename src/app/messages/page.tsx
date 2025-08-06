"use client";

import { MessagingLayout } from "@/components/messaging/messaging-layout";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function MessagesPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/orders`, { credentials: "include" });
        const data = await res.json();
        setOrders(data);
      } catch {
        toast({ description: "Failed to load orders", variant: "destructive" });
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [toast]);

  useEffect(() => {
    if (!selectedOrder) return;
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/messages/${selectedOrder._id}`, { credentials: "include" });
        const data = await res.json();
        setMessages(data);
      } catch {
        toast({ description: "Failed to load messages", variant: "destructive" });
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [selectedOrder, toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedOrder) return;
    setSending(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/messages/${selectedOrder._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Send failed");
      setMessages((msgs) => [...msgs, data]);
      setMessage("");
    } catch (e: any) {
      toast({ description: e.message || "Send failed", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="flex flex-col md:flex-row min-h-[60vh] w-full max-w-5xl mx-auto px-2 gap-6">
      <section className="md:w-1/3 w-full bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-md">
        <h1 className="text-xl font-bold mb-4">Inbox</h1>
        {loadingOrders ? (
          <div>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-gray-400">No orders found.</div>
        ) : (
          <ul className="space-y-2">
            {orders.map((order) => (
              <li key={order._id}>
                <button
                  className={`w-full text-left px-3 py-2 rounded transition font-medium ${selectedOrder?._id === order._id ? "bg-blue-700 text-white" : "bg-gray-700 text-gray-200 hover:bg-blue-800"}`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="truncate font-semibold">{order.gig?.title || "Gig"}</div>
                  <div className="text-xs text-gray-400">{order.buyer?.name || order.buyer} &ndash; {order.seller?.name || order.seller}</div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="flex-1 bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-md flex flex-col">
        {selectedOrder ? (
          <>
            <div className="font-bold text-lg mb-2">Chat: {selectedOrder.gig?.title || "Gig"}</div>
            <div className="flex-1 overflow-y-auto mb-2 max-h-96 border rounded bg-gray-900 p-2">
              {loadingMessages ? (
                <div>Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-gray-400">No messages yet.</div>
              ) : (
                messages.map((msg) => (
                  <div key={msg._id} className={`mb-2 flex ${msg.sender === user?._id ? "justify-end" : "justify-start"}`}>
                    <div className={`px-3 py-2 rounded-lg max-w-xs break-words ${msg.sender === user?._id ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-200"}`}>
                      <div className="text-xs font-semibold mb-1">{msg.sender === user?._id ? "You" : msg.sender === selectedOrder.buyer?._id ? selectedOrder.buyer?.name : selectedOrder.seller?.name}</div>
                      <div>{msg.content}</div>
                      <div className="text-xs text-gray-400 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="flex gap-2 mt-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 rounded bg-gray-700 text-white focus:outline-none"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={sending}
                aria-label="Message input"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold disabled:opacity-50"
                disabled={sending || !message.trim()}
                aria-label="Send message"
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-gray-400 flex items-center justify-center h-full">Select an order to start chatting.</div>
        )}
      </section>
    </main>
  );
} 