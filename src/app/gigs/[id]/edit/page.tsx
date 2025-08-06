"use client";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../AuthContext";
import { useToast } from '@/components/ui/use-toast';

export default function EditGigPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const gigId = params?.id as string;
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    deliveryTime: "",
    tags: "",
    image: null as File | null,
    imageUrl: "",
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadMode, setUploadMode] = useState<'device' | 'url'>('device');
  const [imageUrlInput, setImageUrlInput] = useState('');

  useEffect(() => {
    const fetchGig = async () => {
      setFetching(true);
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/gigs/${gigId}`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch gig");
        setForm({
          title: data.title || "",
          description: data.description || "",
          category: data.category || "",
          price: data.price?.toString() || "",
          deliveryTime: data.deliveryTime?.toString() || "",
          tags: data.tags?.join(", ") || "",
          image: null,
          imageUrl: data.image || "",
        });
        setImagePreview(data.image ? `${API_URL}/uploads/${data.image}` : "");
      } catch (e: any) {
        toast({
          title: e.message || "Failed to fetch gig",
          description: "Failed to fetch gig",
          variant: "destructive",
        });
      } finally {
        setFetching(false);
      }
    };
    if (gigId) fetchGig();
  }, [gigId, toast]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm(f => ({ ...f, image: file }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(form.imageUrl || "");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("price", form.price);
      formData.append("deliveryTime", form.deliveryTime);
      formData.append("tags", form.tags);
      if (form.image) formData.append("image", form.image);
      if (uploadMode === 'url' && imageUrlInput) {
        formData.append("imageUrl", imageUrlInput);
      }
      formData.append("userId", user?._id || "");
      const res = await fetch(`${API_URL}/api/gigs/${gigId}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gig update failed");
      }
      toast({
        title: "Gig updated successfully!",
        description: "Gig updated successfully!",
      });
      router.replace("/gigs");
    } catch (e: any) {
      toast({
        title: e.message || "Network error",
        description: "Network error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="flex justify-center items-center h-40"><span className="loader" aria-label="Loading gig..." /></div>;
  }

  return (
    <main className="flex flex-col items-center min-h-[60vh] px-2">
      <h1 className="text-2xl font-bold mb-4">Edit Gig</h1>
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 w-full max-w-lg flex flex-col gap-4 border border-gray-700 shadow-md" aria-label="Edit Gig Form">
        <label className="text-gray-300 font-semibold">Title
          <input name="title" value={form.title} onChange={handleChange} required maxLength={100} className="mt-1 p-2 rounded bg-gray-900 text-white border border-gray-700 w-full" aria-required="true" />
        </label>
        <label className="text-gray-300 font-semibold">Description
          <textarea name="description" value={form.description} onChange={handleChange} required maxLength={1000} rows={4} className="mt-1 p-2 rounded bg-gray-900 text-white border border-gray-700 w-full" aria-required="true" />
        </label>
        <label className="text-gray-300 font-semibold">Category
          <input name="category" value={form.category} onChange={handleChange} required maxLength={50} className="mt-1 p-2 rounded bg-gray-900 text-white border border-gray-700 w-full" aria-required="true" />
        </label>
        <div className="flex gap-4">
          <label className="text-gray-300 font-semibold flex-1">Price ($)
            <input name="price" type="number" min={1} value={form.price} onChange={handleChange} required className="mt-1 p-2 rounded bg-gray-900 text-white border border-gray-700 w-full" aria-required="true" />
          </label>
          <label className="text-gray-300 font-semibold flex-1">Delivery Time (days)
            <input name="deliveryTime" type="number" min={1} value={form.deliveryTime} onChange={handleChange} required className="mt-1 p-2 rounded bg-gray-900 text-white border border-gray-700 w-full" aria-required="true" />
          </label>
        </div>
        <label className="text-gray-300 font-semibold">Tags (comma separated)
          <input name="tags" value={form.tags} onChange={handleChange} className="mt-1 p-2 rounded bg-gray-900 text-white border border-gray-700 w-full" />
        </label>
        <div className="flex items-center gap-2">
          <input
            type="radio"
            id="device"
            name="uploadMode"
            value="device"
            checked={uploadMode === 'device'}
            onChange={() => setUploadMode('device')}
            className="text-blue-600 focus:ring-blue-500 border-gray-600"
          />
          <label htmlFor="device" className="text-gray-300">Upload from device</label>
          <input
            type="radio"
            id="url"
            name="uploadMode"
            value="url"
            checked={uploadMode === 'url'}
            onChange={() => setUploadMode('url')}
            className="text-blue-600 focus:ring-blue-500 border-gray-600"
          />
          <label htmlFor="url" className="text-gray-300">Provide image URL</label>
        </div>
        {uploadMode === 'device' && (
          <label className="text-gray-300 font-semibold">Image
            <input name="image" type="file" accept="image/*" onChange={handleImageChange} className="mt-1 text-sm text-gray-300" />
            {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded border border-gray-700" />}
          </label>
        )}
        {uploadMode === 'url' && (
          <label className="text-gray-300 font-semibold">Image URL
            <input name="imageUrl" type="url" value={imageUrlInput} onChange={e => setImageUrlInput(e.target.value)} className="mt-1 p-2 rounded bg-gray-900 text-white border border-gray-700 w-full" />
          </label>
        )}
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded mt-2 disabled:opacity-50" disabled={loading} aria-busy={loading} aria-label="Update Gig">
          {loading ? "Updating..." : "Update Gig"}
        </button>
      </form>
    </main>
  );
} 