'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { useToast } from '@/components/ui/use-toast';

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

interface ImageFile {
  file: File;
  preview: string;
  isPrimary: boolean;
  id: string;
}

export default function CreateGigPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'tags') {
          formDataToSend.append(key, value.split(',').map(tag => tag.trim()).filter(tag => tag).join(','));
        } else if (key === 'requirements') {
          formDataToSend.append(key, value.split('\n').filter(req => req.trim()).join('\n'));
        } else {
          formDataToSend.append(key, value);
        }
      });

      // Add images
      images.forEach((image, index) => {
        formDataToSend.append('images', image.file);
        if (image.isPrimary) {
          formDataToSend.append('primaryImageIndex', index.toString());
        }
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gigs`, {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: "Gig created successfully!",
        });
        router.push('/dashboard/gigs');
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to create gig",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating gig:', error);
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const newImages: ImageFile[] = [];
    
    Array.from(files).forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select only image files",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select files smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage: ImageFile = {
          file,
          preview: e.target?.result as string,
          isPrimary: images.length === 0, // First image is primary
          id: Math.random().toString(36).substr(2, 9)
        };
        
        setImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
  }, [images.length, toast]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  const removeImage = (id: string) => {
    setImages(prev => {
      const newImages = prev.filter(img => img.id !== id);
      // If we removed the primary image and there are other images, make the first one primary
      if (newImages.length > 0 && !newImages.some(img => img.isPrimary)) {
        newImages[0].isPrimary = true;
      }
      return newImages;
    });
  };

  const setPrimaryImage = (id: string) => {
    setImages(prev => prev.map(img => ({
      ...img,
      isPrimary: img.id === id
    })));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Create New Gig</h1>
        <p className="text-muted-foreground">Set up your service to start earning money</p>
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
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="5"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="50"
                  required
                />
              </div>

              <div>
                <Label htmlFor="deliveryTime">Delivery Time (days) *</Label>
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Gig Images</CardTitle>
            <p className="text-sm text-muted-foreground">
              Upload high-quality images that showcase your work. First image will be the primary image.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Image Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Icons.upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose Images
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  or drag and drop images here
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG, GIF up to 5MB each (max 10 images)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
            </div>

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border">
                      <img
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={image.isPrimary ? "default" : "secondary"}
                        onClick={() => setPrimaryImage(image.id)}
                        className="text-xs"
                      >
                        {image.isPrimary ? "Primary" : "Set Primary"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => removeImage(image.id)}
                        className="text-xs"
                      >
                        Remove
                      </Button>
                    </div>

                    {/* Primary badge */}
                    {image.isPrimary && (
                      <Badge className="absolute top-2 left-2 bg-primary">
                        Primary
                      </Badge>
                    )}

                    {/* File info */}
                    <div className="mt-2 text-xs text-gray-500">
                      <p className="truncate">{image.file.name}</p>
                      <p>{formatFileSize(image.file.size)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                placeholder="logo, design, brand, professional (comma separated)"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Add relevant tags to help clients find your gig
              </p>
            </div>

            <div>
              <Label htmlFor="requirements">Requirements from Buyer</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                placeholder="What information do you need from buyers to get started?"
                rows={4}
              />
              <p className="text-sm text-muted-foreground mt-1">
                List the information you need from clients to deliver their project
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Gig'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 