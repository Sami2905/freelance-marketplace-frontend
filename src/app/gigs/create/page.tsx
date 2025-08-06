'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../AuthContext';
import { useToast } from '@/components/ui/use-toast';

export default function CreateGigPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    subcategory: "",
    price: "",
    deliveryTime: "",
    revisions: "0",
    tags: "",
    requirements: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploadMode, setUploadMode] = useState('device');
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");

  // Check authentication and role
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a gig",
        variant: "destructive",
      });
      router.push('/login');
      return;
    }

    if (!isLoading && user && user.role !== 'freelancer') {
      toast({
        title: "Access denied",
        description: "Only freelancers can create gigs",
        variant: "destructive",
      });
      router.push('/dashboard');
      return;
    }
  }, [isLoading, isAuthenticated, user, router, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check authentication again before submitting
    if (!isAuthenticated || !user || user.role !== 'freelancer') {
      toast({
        title: "Authentication required",
        description: "Please log in as a freelancer to create a gig",
        variant: "destructive",
      });
      return;
    }

    // Client-side validation
    if (form.description.length < 50) {
      toast({
        title: "Description too short",
        description: "Description must be at least 50 characters long",
        variant: "destructive",
      });
      return;
    }

    if (form.description.length > 2000) {
      toast({
        title: "Description too long",
        description: "Description must be no more than 2000 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      // Convert tags and requirements from strings to arrays
      const tags = form.tags ? form.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
      const requirements = form.requirements ? form.requirements.split(',').map(req => req.trim()).filter(req => req) : [];

      const gigData = {
        title: form.title,
        description: form.description,
        category: form.category,
        subcategory: form.subcategory,
        price: parseFloat(form.price),
        deliveryTime: parseInt(form.deliveryTime),
        revisions: parseInt(form.revisions),
        tags: tags,
        requirements: requirements,
      };

      console.log('Sending gig data:', gigData);

      // Get the stored token
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      // Create the gig with Authorization header
      const res = await fetch(`${API_URL}/api/gigs`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(gigData),
      });

      console.log('Response status:', res.status);

      if (!res.ok) {
        const err = await res.json();
        console.error('Error response:', err);
        throw new Error(err.message || err.errors?.[0]?.msg || "Gig creation failed");
      }

      const data = await res.json();
      console.log('Success response:', data);
      
      toast({
        title: "Gig created successfully!",
        description: "Your gig has been created.",
        variant: "success",
      });
      
      setForm({
        title: "",
        description: "",
        category: "",
        subcategory: "",
        price: "",
        deliveryTime: "",
        revisions: "0",
        tags: "",
        requirements: "",
      });
      setImagePreview("");
      router.replace("/dashboard/gigs");
    } catch (e: any) {
      console.error('Gig creation error:', e);
      toast({
        title: "Error creating gig",
        description: e.message || "Network error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <main className="flex flex-col items-center min-h-[60vh] px-2">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </main>
    );
  }

  // Show access denied if not authenticated or not freelancer
  if (!isAuthenticated || !user || user.role !== 'freelancer') {
    return (
      <main className="flex flex-col items-center min-h-[60vh] px-2">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400">Only authenticated freelancers can create gigs.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center min-h-[60vh] px-2">
      <h1 className="text-2xl font-bold mb-4">Create Gig</h1>
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 w-full max-w-lg flex flex-col gap-4 border border-gray-700 shadow-md" aria-label="Create Gig Form">
        <label className="text-gray-300 font-semibold">Title
          <input name="title" value={form.title} onChange={handleChange} required maxLength={100} className="mt-1 p-2 rounded bg-gray-900 text-white border border-gray-700 w-full" aria-required="true" />
        </label>
        <label className="text-gray-300 font-semibold">Description
          <textarea 
            name="description" 
            value={form.description} 
            onChange={handleChange} 
            required 
            minLength={50}
            maxLength={2000} 
            rows={4} 
            placeholder="Describe your service in detail (minimum 50 characters). Include what you'll deliver, your process, and any important details clients should know."
            className="mt-1 p-2 rounded bg-gray-900 text-white border border-gray-700 w-full" 
            aria-required="true" 
          />
          <div className="text-xs text-gray-400 mt-1">
            {form.description.length}/2000 characters (minimum 50 required)
          </div>
        </label>
        <div className="flex gap-4">
          <label className="text-gray-300 font-semibold flex-1">Category
            <select name="category" value={form.category} onChange={handleChange} required className="mt-1 p-2 rounded bg-gray-900 text-white border border-gray-700 w-full" aria-required="true">
              <option value="">Select Category</option>
              <option value="Graphics & Design">Graphics & Design</option>
              <option value="Digital Marketing">Digital Marketing</option>
              <option value="Writing & Translation">Writing & Translation</option>
              <option value="Video & Animation">Video & Animation</option>
              <option value="Music & Audio">Music & Audio</option>
              <option value="Programming & Tech">Programming & Tech</option>
              <option value="Business">Business</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Data">Data</option>
              <option value="Photography">Photography</option>
            </select>
          </label>
          <label className="text-gray-300 font-semibold flex-1">Subcategory
            <input name="subcategory" value={form.subcategory} onChange={handleChange} required maxLength={50} className="mt-1 p-2 rounded bg-gray-900 text-white border border-gray-700 w-full" aria-required="true" />
          </label>
        </div>
        <div className="flex gap-4">
          <label className="text-gray-300 font-semibold flex-1">Price ($)
            <input name="price" type="number" min={5} value={form.price} onChange={handleChange} required className="mt-1 p-2 rounded bg-gray-900 text-white border border-gray-700 w-full" aria-required="true" />
          </label>
          <label className="text-gray-300 font-semibold flex-1">Delivery Time (days)
            <input name="deliveryTime" type="number" min={1} max={30} value={form.deliveryTime} onChange={handleChange} required className="mt-1 p-2 rounded bg-gray-900 text-white border border-gray-700 w-full" aria-required="true" />
          </label>
        </div>
        <label className="text-gray-300 font-semibold">Revisions
          <input name="revisions" type="number" min={0} max={10} value={form.revisions} onChange={handleChange} className="mt-1 p-2 rounded bg-gray-900 text-white border border-gray-700 w-full" />
        </label>
        <label className="text-gray-300 font-semibold">Tags (comma separated)
          <input name="tags" value={form.tags} onChange={handleChange} placeholder="logo, design, brand" className="mt-1 p-2 rounded bg-gray-900 text-white border border-gray-700 w-full" />
        </label>
        <label className="text-gray-300 font-semibold">Requirements (comma separated)
          <input name="requirements" value={form.requirements} onChange={handleChange} placeholder="brand guidelines, color preferences" className="mt-1 p-2 rounded bg-gray-900 text-white border border-gray-700 w-full" />
        </label>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded mt-2 disabled:opacity-50" disabled={loading} aria-busy={loading} aria-label="Create Gig">
          {loading ? "Creating..." : "Create Gig"}
        </button>
      </form>
    </main>
  );
} 