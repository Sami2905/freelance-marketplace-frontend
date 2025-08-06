'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icons } from '@/components/icons';

const categories = [
  'Graphics & Design',
  'Digital Marketing',
  'Writing & Translation',
  'Video & Animation',
  'Music & Audio',
  'Programming & Tech',
  'Business',
  'Lifestyle',
  'Data',
  'Photography'
];

const subcategories = {
  'Graphics & Design': ['Logo Design', 'Brand Identity', 'Web Design', 'Print Design', 'Illustration', 'UI/UX Design'],
  'Digital Marketing': ['Social Media Marketing', 'SEO', 'Content Marketing', 'Email Marketing', 'PPC Advertising', 'Influencer Marketing'],
  'Writing & Translation': ['Content Writing', 'Copywriting', 'Translation', 'Technical Writing', 'Creative Writing', 'Editing & Proofreading'],
  'Video & Animation': ['Video Editing', 'Motion Graphics', '3D Animation', 'Video Production', 'Character Animation', 'Visual Effects'],
  'Music & Audio': ['Music Production', 'Voice Over', 'Sound Design', 'Audio Editing', 'Podcast Production', 'Jingle Creation'],
  'Programming & Tech': ['Web Development', 'Mobile App Development', 'Software Development', 'WordPress', 'E-commerce Development', 'API Development'],
  'Business': ['Business Plans', 'Market Research', 'Financial Modeling', 'Legal Consulting', 'Business Consulting', 'Data Analysis'],
  'Lifestyle': ['Fitness Training', 'Nutrition Consulting', 'Life Coaching', 'Personal Styling', 'Travel Planning', 'Event Planning'],
  'Data': ['Data Analysis', 'Data Visualization', 'Machine Learning', 'Database Design', 'Data Entry', 'Data Mining'],
  'Photography': ['Portrait Photography', 'Product Photography', 'Event Photography', 'Photo Editing', 'Aerial Photography', 'Fashion Photography']
};

export default function EditGigPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    price: '',
    deliveryTime: '',
    revisions: '0',
    tags: '',
    requirements: ''
  });

  useEffect(() => {
    if (params.id) {
      fetchGigDetails();
    }
  }, [params.id]);

  const fetchGigDetails = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gigs/${params.id}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        const gig = data.data;
        
        setFormData({
          title: gig.title || '',
          description: gig.description || '',
          category: gig.category || '',
          subcategory: gig.subcategory || '',
          price: gig.price?.toString() || '',
          deliveryTime: gig.deliveryTime?.toString() || '',
          revisions: gig.revisions?.toString() || '0',
          tags: gig.tags?.join(', ') || '',
          requirements: gig.requirements?.join('\n') || ''
        });
      } else {
        console.error('Error fetching gig details:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching gig details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gigs/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          deliveryTime: parseInt(formData.deliveryTime),
          revisions: parseInt(formData.revisions),
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          requirements: formData.requirements.split('\n').filter(req => req.trim())
        })
      });

      if (response.ok) {
        const data = await response.json();
        router.push('/dashboard/gigs');
      } else {
        const error = await response.json();
        console.error('Error updating gig:', error);
      }
    } catch (error) {
      console.error('Error updating gig:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icons.loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Edit Gig</h1>
        <p className="text-muted-foreground">Update your service details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Gig Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="I will create a professional logo design"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Start with "I will" to clearly describe what you offer
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your service in detail..."
                rows={6}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Explain what you'll deliver, your process, and why clients should choose you
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subcategory">Subcategory *</Label>
                <Select 
                  value={formData.subcategory} 
                  onValueChange={(value) => handleInputChange('subcategory', value)}
                  disabled={!formData.category}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.category && subcategories[formData.category as keyof typeof subcategories]?.map((subcategory) => (
                      <SelectItem key={subcategory} value={subcategory}>
                        {subcategory}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Delivery */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Delivery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Price (USD) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="5"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="50"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Minimum $5
                </p>
              </div>

              <div>
                <Label htmlFor="deliveryTime">Delivery Time (Days) *</Label>
                <Input
                  id="deliveryTime"
                  type="number"
                  min="1"
                  max="30"
                  value={formData.deliveryTime}
                  onChange={(e) => handleInputChange('deliveryTime', e.target.value)}
                  placeholder="3"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  1-30 days
                </p>
              </div>

              <div>
                <Label htmlFor="revisions">Revisions</Label>
                <Input
                  id="revisions"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.revisions}
                  onChange={(e) => handleInputChange('revisions', e.target.value)}
                  placeholder="0"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  0-10 revisions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="logo, branding, design, professional"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Separate tags with commas to help clients find your gig
              </p>
            </div>

            <div>
              <Label htmlFor="requirements">Requirements from Buyer</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                placeholder="What information do you need from clients?"
                rows={4}
              />
              <p className="text-sm text-muted-foreground mt-1">
                List what clients should provide (one per line)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Icons.loader className="mr-2 h-4 w-4 animate-spin" />}
            Update Gig
          </Button>
        </div>
      </form>
    </div>
  );
} 