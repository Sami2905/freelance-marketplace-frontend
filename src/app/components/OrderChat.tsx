"use client";
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { useToast } from '@/components/ui/use-toast';

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500 text-white",
  paid: "bg-blue-500 text-white",
  refunded: "bg-green-500 text-white",
  failed: "bg-red-500 text-white",
};
function PaymentStatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${PAYMENT_STATUS_COLORS[status] || "bg-gray-400 text-white"}`}>{status}</span>
  );
}

export default function OrderChat({ order }: { order: any }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!order?._id) return;
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/messages/${order._id}`, { credentials: "include" });
        const data = await res.json();
        setMessages(data);
      } catch {
        toast({
          title: "Failed to load messages",
          description: "Failed to load messages. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [order, toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !order?._id) return;
    setSending(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/messages/${order._id}`, {
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
      toast({
        title: e.message || "Send failed",
        description: e.message || "Send failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-3 mb-4">
      <div className="font-bold mb-2">Order Chat</div>
      {order?.paymentStatus && (
        <div className="mb-2"><PaymentStatusBadge status={order.paymentStatus} /></div>
      )}
      <div className="overflow-y-auto max-h-48 border rounded bg-gray-800 p-2 mb-2">
        {loading ? (
          <div>Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-gray-400">No messages yet.</div>
        ) : (
          messages.map((msg) => (
            <div key={msg._id} className={`mb-2 flex ${msg.sender === user?._id ? "justify-end" : "justify-start"}`}>
              <div className={`px-3 py-2 rounded-lg max-w-xs break-words ${msg.sender === user?._id ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-200"}`}>
                <div className="text-xs font-semibold mb-1">{msg.sender === user?._id ? "You" : msg.sender === order.buyer?._id ? order.buyer?.name : order.seller?.name}</div>
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
    </div>
  );
} 