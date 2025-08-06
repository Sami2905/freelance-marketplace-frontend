// Base types
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin' | 'moderator';
}

export interface Gig {
  id: string;
  title: string;
  slug: string;
  price: number;
  user: Pick<User, 'id' | 'name'>;
}

export interface AdminResponse {
  id: string;
  content: string;
  admin: {
    id: string;
    name: string;
  };
  respondedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  user: User;
  gig: Gig;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  flagCount?: number;
  sellerResponse?: string;
  adminResponse?: AdminResponse;
  flags?: Array<{
    id: string;
    reason: string;
    comment?: string;
    user: User;
    createdAt: string;
  }>;
  statusHistory?: Array<{
    id: string;
    status: ReviewStatus;
    changedBy?: User;
    reason?: string;
    changedAt: string;
  }>;
}

// Status related utilities
export const statusVariantMap: Record<ReviewStatus, 'secondary' | 'default' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  approved: 'default',
  rejected: 'destructive',
  flagged: 'outline'
};

export const statusLabelMap: Record<ReviewStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  flagged: 'Flagged',
};

// Type guard to check if a string is a valid ReviewStatus
export function isReviewStatus(status: string): status is ReviewStatus {
  return ['pending', 'approved', 'rejected', 'flagged'].includes(status);
}
