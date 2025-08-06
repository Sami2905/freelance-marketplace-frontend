"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../AuthContext";
import GigReviews from "../../components/GigReviews";

export default function GigDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [gig, setGig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchGig = async () => {
      setLoading(true);
      setError("");
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${API_URL}/api/gigs/${id}`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch gig");
        setGig(data);
      } catch (e: any) {
        setError(e.message || "Network error");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchGig();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this gig?")) return;
    setDeleting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_URL}/api/gigs/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete gig");
      router.push("/dashboard");
    } catch (e) {
      alert("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <main className="flex items-center justify-center min-h-[60vh]">Loading...</main>;
  if (error) return <main className="flex items-center justify-center min-h-[60vh] text-red-500">{error}</main>;
  if (!gig) return <main className="flex items-center justify-center min-h-[60vh]">Gig not found.</main>;

  const isOwner = user && gig.userId === user._id;

  const getImageSrc = (imageUrl: string) => {
    if (!imageUrl) return '/default-gig.png';
    if (imageUrl.startsWith('/uploads')) {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      return `${API_URL}${imageUrl}`;
    }
    return imageUrl;
  };

  return (
    <main className="flex flex-col items-center min-h-[60vh] px-2">
      <div className="w-full max-w-xl bg-gray-800 rounded-lg p-6 border border-gray-700 flex flex-col gap-4">
        <h1 className="text-2xl font-bold">{gig.title}</h1>
        {(() => {
          const imgSrc = getImageSrc(gig.imageUrl);
          console.log('GIG IMAGE DEBUG:', { imageUrl: gig.imageUrl, imgSrc });
          return <img src={imgSrc} alt={gig.title} className="w-full h-48 object-cover rounded" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/default-gig.png'; }} />;
        })()}
        <div className="text-gray-400">{gig.category}</div>
        <div className="text-blue-400 font-semibold">${gig.price}</div>
        <div className="text-xs text-gray-500">Delivery: {gig.deliveryTime} days</div>
        <div className="text-sm text-gray-300">{gig.description}</div>
        <div className="text-xs text-gray-400">Tags: {gig.tags}</div>
        {isOwner && (
          <div className="flex gap-2 mt-4">
            <button onClick={() => router.push(`/gigs/${id}/edit`)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Edit</button>
            <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded" disabled={deleting}>{deleting ? "Deleting..." : "Delete"}</button>
          </div>
        )}
      </div>
      {/* Reviews section */}
      <section className="mt-6 w-full max-w-xl">
        <h2 className="text-lg font-bold mb-2">Reviews</h2>
        <GigReviews gigId={id as string} />
      </section>
    </main>
  );
} 