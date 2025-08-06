"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../AuthContext";
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

async function fetchGigReviews(gigId: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const res = await fetch(`${API_URL}/api/reviews/${gigId}`);
  if (!res.ok) return [];
  return res.json();
}

export default function GigsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();
  const [gigRatings, setGigRatings] = useState<Record<string, { avg: number, count: number }>>({});

  useEffect(() => {
    const fetchGigs = async () => {
      setLoading(true);
      setError("");
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/gigs`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch gigs");
        setGigs(data);
      } catch (e: any) {
        setError(e.message || "Network error");
      } finally {
        setLoading(false);
      }
    };
    fetchGigs();
  }, []);

  useEffect(() => {
    if (!gigs.length) return;
    const fetchRatings = async () => {
      const ratings: Record<string, { avg: number, count: number }> = {};
      await Promise.all(gigs.map(async (gig) => {
        const reviews = await fetchGigReviews(gig._id);
        const count = reviews.length;
        const avg = count ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / count : 0;
        ratings[gig._id] = { avg, count };
      }));
      setGigRatings(ratings);
    };
    fetchRatings();
  }, [gigs]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this gig?")) return;
    setDeletingId(id);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/gigs/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to delete gig");
      setGigs(gigs.filter(g => g._id !== id));
      toast({
        title: "Gig deleted",
        description: "Your gig has been deleted.",
        variant: "success",
      });
    } catch (e: any) {
      toast({
        title: "Delete failed",
        description: e.message || "Failed to delete gig.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleBuy = async (gig: any) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ gig: gig._id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Failed to create order');
      toast({
        title: "Order created",
        description: "Your order has been created (demo).",
        variant: "success",
      });
    } catch (e: any) {
      toast({
        title: "Order failed",
        description: e.message || "Failed to create order.",
        variant: "destructive",
      });
    }
  };

  const getImageSrc = (imageUrl: string) => {
    if (!imageUrl) return '/default-gig.png';
    if (imageUrl.startsWith('/uploads')) {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      return `${API_URL}${imageUrl}`;
    }
    return imageUrl;
  };

  let content = null;
  if (loading) {
    content = <div className="flex justify-center items-center h-40"><span className="loader" aria-label="Loading gigs..." /></div>;
  } else if (error) {
    content = <div className="text-red-500">{error}</div>;
  } else if (!gigs.length) {
    content = <div className="text-gray-400 text-center">No gigs found. Create your first gig!</div>;
  } else {
    content = (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {gigs.map(gig => {
          const imgSrc = getImageSrc(gig.imageUrl);
          console.log('GIG IMAGE DEBUG:', { imageUrl: gig.imageUrl, imgSrc });
          return (
            <div key={gig._id} className="bg-gray-800 rounded-lg p-4 flex flex-col gap-2 border border-gray-700 shadow-md hover:shadow-lg transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" tabIndex={0} aria-label={`Gig: ${gig.title}`}> 
              <img
                src={imgSrc}
                alt={gig.title}
                className="w-full h-40 object-cover rounded mb-2"
                onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/default-gig.png'; }}
              />
              <div className="font-bold text-lg truncate" title={gig.title}>{gig.title}</div>
              <div className="text-sm text-gray-400">{gig.category}</div>
              <div className="text-blue-400 font-semibold">${gig.price}</div>
              <div className="flex items-center gap-2 text-xs text-gray-300 mt-1">
                <StarRating rating={gigRatings[gig._id]?.avg || 0} />
                <span>({gigRatings[gig._id]?.count || 0} reviews)</span>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => router.push(`/gigs/${gig._id}`)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition"
                  aria-label="View Gig"
                >
                  View
                </button>
                {user?.role === "freelancer" && gig.user === user._id && (
                  <>
                    <button
                      onClick={() => router.push(`/gigs/${gig._id}/edit`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition"
                      aria-label="Edit Gig"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(gig._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition"
                      disabled={deletingId === gig._id}
                      aria-label="Delete Gig"
                    >
                      {deletingId === gig._id ? "Deleting..." : "Delete"}
                    </button>
                  </>
                )}
                {user?.role === 'client' && (
                  <button
                    onClick={() => handleBuy(gig)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 transition"
                    aria-label="Buy Gig (Demo)"
                  >
                    Buy
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center min-h-[60vh] px-2">
      <h1 className="text-2xl font-bold mb-4">Gigs</h1>
      <div className="mb-4 w-full max-w-6xl flex justify-end">
        {user?.role === "freelancer" && (
          <button
            onClick={() => router.push("/gigs/create")}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold shadow"
            aria-label="Create New Gig"
          >
            + Create New Gig
          </button>
        )}
      </div>
      {content}
    </main>
  );
}

// Tailwind loader spinner
// .loader { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 32px; height: 32px; animation: spin 1s linear infinite; }
// @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } 