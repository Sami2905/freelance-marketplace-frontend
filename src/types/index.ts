export type Role = 'admin' | 'client' | 'freelancer';
export type Permission = string;
// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'freelancer';
  status: 'active' | 'suspended' | 'pending';
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  bio?: string;
  skills?: string[];
  hourlyRate?: number;
  location?: string;
  phone?: string;
  isVerified?: boolean;
  lastActive?: string;
}

// Gig types
export interface Gig {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  deliveryTime: number;
  revisions: number;
  features: string[];
  images: string[];
  status: 'active' | 'inactive' | 'draft' | 'pending' | 'paused' | 'rejected';
  userId: string;
  createdAt: string;
  updatedAt: string;
  rating?: number;
  reviewCount?: number;
  orderCount?: number;
  seller?: User;
}

// Order types
export type OrderStatus = 'pending' | 'in_progress' | 'delivered' | 'completed' | 'cancelled' | 'disputed';

export interface Order {
  id: string;
  gigId: string;
  buyerId: string;
  sellerId: string;
  status: OrderStatus;
  amount: number;
  deliveryDate: string;
  requirements: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  gig?: Gig;
  buyer?: User;
  seller?: User;
}

// Review types
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

export interface Review {
  id: string;
  gigId: string;
  userId: string;
  orderId: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  gig?: Gig;
  user?: User;
}

// Category types
export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  parentId?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  subcategories?: Category[];
}

// Message types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'file' | 'image';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  createdAt: string;
  updatedAt: string;
  sender?: User;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
  participantsData?: User[];
}

// Admin types
export interface AdminResponse {
  id: string;
  reviewId: string;
  adminId: string;
  response: string;
  createdAt: string;
  admin?: User;
}

// Analytics types
export interface AnalyticsData {
  date: string;
  value: number;
  label?: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalGigs: number;
  totalOrders: number;
  totalRevenue: number;
  recentUsers?: User[];
  recentOrders?: Order[];
} 