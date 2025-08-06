"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import RequireAuth from "../RequireAuth";
import { useToast } from '@/components/ui/use-toast';

function StarRating({ rating }: { rating: number }) {
  return (
    <span aria-label={`Rating: ${rating} out of 5`} className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="16" height="16" fill={i <= rating ? '#fbbf24' : '#d1d5db'} viewBox="0 0 20 20"><polygon points="10,1 12.59,6.99 19,7.24 14,11.97 15.18,18.02 10,14.77 4.82,18.02 6,11.97 1,7.24 7.41,6.99" /></svg>
      ))}
    </span>
  );
}

export default function ReviewsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [myReviews, setMyReviews] = useState<any[]>([]);
  const [receivedReviews, setReceivedReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        // Reviews left by me
        const res1 = await fetch(`${API_URL}/api/reviews?buyer=${user?._id}`);
        const data1 = await res1.json();
        setMyReviews(data1);
        // Reviews for my gigs
        const res2 = await fetch(`${API_URL}/api/gigs?user=${user?._id}`);
        const gigs = await res2.json();
        let allReceived: any[] = [];
        for (const gig of gigs) {
          const res = await fetch(`${API_URL}/api/reviews/${gig._id}`);
          const reviews = await res.json();
          allReceived = allReceived.concat(reviews);
        }
        setReceivedReviews(allReceived);
      } catch {
        toast({
          title: "Failed to load reviews",
          description: "Failed to load reviews. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) fetchReviews();
  }, [user?._id]);

  return (
    <RequireAuth>
      <main className="flex flex-col md:flex-row min-h-[60vh] w-full max-w-5xl mx-auto px-2 gap-6">
        <section className="md:w-1/2 w-full bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-md">
          <h1 className="text-xl font-bold mb-4">Reviews Left By Me</h1>
          {loading ? (
            <div>Loading...</div>
          ) : myReviews.length === 0 ? (
            <div className="text-gray-400">You haven't left any reviews yet.</div>
          ) : (
            <ul className="space-y-3">
              {myReviews.map((review) => (
                <li key={review._id} className="bg-gray-900 rounded p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="font-semibold">{review.comment}</div>
                  <div className="text-xs text-gray-400">Gig: {review.gig}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="md:w-1/2 w-full bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-md">
          <h1 className="text-xl font-bold mb-4">Reviews For My Gigs</h1>
          {loading ? (
            <div>Loading...</div>
          ) : receivedReviews.length === 0 ? (
            <div className="text-gray-400">No reviews for your gigs yet.</div>
          ) : (
            <ul className="space-y-3">
              {receivedReviews.map((review) => (
                <li key={review._id} className="bg-gray-900 rounded p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="font-semibold">{review.comment}</div>
                  <div className="text-xs text-gray-400">By: {review.buyer?.name || review.buyer}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </RequireAuth>
  );
} 