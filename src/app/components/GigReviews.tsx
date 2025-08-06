"use client";
import { useEffect, useState } from "react";

function StarRating({ rating }: { rating: number }) {
  return (
    <span aria-label={`Rating: ${rating} out of 5`} className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="16" height="16" fill={i <= rating ? '#fbbf24' : '#d1d5db'} viewBox="0 0 20 20"><polygon points="10,1 12.59,6.99 19,7.24 14,11.97 15.18,18.02 10,14.77 4.82,18.02 6,11.97 1,7.24 7.41,6.99" /></svg>
      ))}
    </span>
  );
}

export default function GigReviews({ gigId }: { gigId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/reviews/${gigId}`);
        const data = await res.json();
        setReviews(data);
      } catch (err) {
        setError("Failed to fetch reviews. Please try again later.");
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    if (gigId) fetchReviews();
  }, [gigId]);

  if (loading) return (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mb-4" role="status" aria-label="Loading reviews">
        <span className="sr-only">Loading reviews...</span>
      </div>
      <p className="text-gray-400">Loading reviews...</p>
    </div>
  );

  if (!reviews.length && !loading && !error) return <div className="text-gray-400">No reviews yet.</div>;
  if (error) return (
    <div className="text-center py-8 text-red-500" aria-live="polite">
      {error}
    </div>
  );

  return (
    <ul className="space-y-3">
      {Array.isArray(reviews) ? (
        reviews.map((review) => (
          <li key={review._id} className="bg-gray-900 rounded p-3">
            <div className="flex items-center gap-2 mb-1">
              <StarRating rating={review.rating} />
              <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="font-semibold">{review.comment}</div>
            <div className="text-xs text-gray-400">By: {review.buyer?.name || review.buyer}</div>
          </li>
        ))
      ) : (
        <div className="text-red-500">Error fetching reviews. Please try again later.</div>
      )}
    </ul>
  );
} 