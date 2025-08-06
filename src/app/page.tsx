'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import Link from 'next/link';

interface Gig {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  seller: {
    name: string;
    profilePicture: string;
    averageRating: number;
    totalReviews: number;
  };
  rating: number;
  totalReviews: number;
  totalOrders: number;
}

const categories = [
  { name: 'Graphics & Design', icon: '🎨', color: 'bg-blue-500' },
  { name: 'Digital Marketing', icon: '📈', color: 'bg-green-500' },
  { name: 'Writing & Translation', icon: '✍️', color: 'bg-purple-500' },
  { name: 'Video & Animation', icon: '🎬', color: 'bg-red-500' },
  { name: 'Music & Audio', icon: '🎵', color: 'bg-yellow-500' },
  { name: 'Programming & Tech', icon: '💻', color: 'bg-indigo-500' },
  { name: 'Business', icon: '💼', color: 'bg-gray-500' },
  { name: 'Lifestyle', icon: '🌟', color: 'bg-pink-500' },
  { name: 'Data', icon: '📊', color: 'bg-teal-500' },
  { name: 'Photography', icon: '📷', color: 'bg-orange-500' }
];

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchGigs();
  }, []);

  const fetchGigs = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gigs?limit=12`);
      if (response.ok) {
        const data = await response.json();
        setGigs(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching gigs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Icons.star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Find the perfect <span className="text-yellow-300">freelance</span> services
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Millions of people use SkillBridge to turn their ideas into reality
          </p>
          
          {/* Search Bar */}
          <form onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim()) {
              window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
            }
          }} className="max-w-2xl mx-auto relative" data-tour="hero-search">
            <Input
              type="text"
              placeholder="What service are you looking for today?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg border-0 rounded-full shadow-lg"
            />
            <Icons.search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
            <Button 
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full"
              size="lg"
            >
              Search
            </Button>
          </form>

          <div className="mt-8 flex items-center justify-center space-x-4 text-sm">
            <span>Popular:</span>
            <div className="flex space-x-2">
              {['Website Design', 'Logo Design', 'AI Artists', 'Voice Over'].map((tag) => (
                <Button key={tag} variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-blue-600">
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50" data-tour="categories">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">You need it, we've got it</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {categories.map((category) => (
              <Link key={category.name} href={`/search?category=${encodeURIComponent(category.name)}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer text-center">
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center text-2xl mx-auto mb-4`}>
                      {category.icon}
                    </div>
                    <h3 className="font-semibold">{category.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Gigs Section */}
      <section className="py-16" data-tour="featured-gigs">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Popular services</h2>
            <Link href="/search">
              <Button variant="outline">
                View All
                <Icons.arrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-48 bg-gray-200 animate-pulse" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {gigs.map((gig) => (
                <Link key={gig._id} href={`/gig/${gig._id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="relative">
                      <img
                        src={gig.images[0] || '/default-gig.png'}
                        alt={gig.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="bg-white/90 text-black">
                          {gig.category}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-sm line-clamp-2 flex-1 mr-2">
                          {gig.title}
                        </h3>
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(gig.price)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          {renderStars(gig.rating)}
                          <span>({gig.totalReviews})</span>
                        </div>
                        <span>{gig.totalOrders} orders</span>
                      </div>
                      
                      <div className="flex items-center mt-3">
                        <img
                          src={gig.seller.profilePicture || '/default-avatar.png'}
                          alt={gig.seller.name}
                          className="w-6 h-6 rounded-full mr-2"
                        />
                        <span className="text-sm text-gray-600">{gig.seller.name}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {isAuthenticated ? 'Ready to start earning?' : 'Ready to get started?'}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            {isAuthenticated 
              ? 'Create your first gig and start earning money today'
              : 'Join millions of people who use SkillBridge to turn their ideas into reality'
            }
          </p>
          <div className="flex justify-center space-x-4" data-tour="auth-buttons">
            {isAuthenticated ? (
              <Link href="/dashboard/gigs/create">
                <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                  Create Your First Gig
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                    Get Started
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
