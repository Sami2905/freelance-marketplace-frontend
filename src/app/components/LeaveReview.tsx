"use client";
import { useState } from "react";
import { useToast } from '@/components/ui/use-toast';

export default function LeaveReview({ order, onReviewSubmitted }: { order: any, onReviewSubmitted: () => void }) {
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/reviews/${order._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to submit review");
      toast({
        title: "Review submitted!",
        description: "Your review has been submitted.",
        variant: "success",
      });
      setRating(5);
      setComment("");
      onReviewSubmitted();
    } catch (e: any) {
      toast({
        title: "Failed to submit review",
        description: e.message || "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 rounded-lg p-3 mt-4">
      <div className="font-bold mb-2">Leave a Review</div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">Rating:</span>
        {[1,2,3,4,5].map(i => (
          <button
            key={i}
            type="button"
            className={`text-2xl ${i <= rating ? "text-yellow-400" : "text-gray-400"}`}
            onClick={() => setRating(i)}
            aria-label={`Set rating to ${i}`}
            disabled={loading}
          >★</button>
        ))}
      </div>
      <textarea
        className="w-full rounded bg-gray-800 text-white p-2 mb-2"
        placeholder="Write your review..."
        value={comment}
        onChange={e => setComment(e.target.value)}
        rows={3}
        disabled={loading}
        aria-label="Review comment"
      />
      <button
        type="submit"
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold disabled:opacity-50"
        disabled={loading || !rating}
        aria-label="Submit review"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
} 