// Store Types
export interface HealthData {
  status: string;
  version: string;
  timestamp: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface TourPackage {
  id: string;
  title: string;
  description?: string;
  shortDescription?: string;
  price: string;
  originalPrice?: string;
  currency: string;
  duration: number;
  maxGuests: number;
  minAge?: number;
  difficulty: string;
  category: string;
  locationName: string;
  country?: string;
  coordinates?: string;
  images: string[];
  coverImage?: string;
  highlights: string[];
  includes: string[];
  excludes: string[];
  itinerary?: any;
  isActive: boolean;
  isAvailable: boolean;
  availableFrom?: string;
  availableTo?: string;
  slug?: string;
  tags: string[];
  rating?: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PackagesResponse {
  data: TourPackage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface Review {
  id: string;
  userId: string;
  packageId: string;
  bookingId?: string;
  rating: number;
  title?: string;
  comment?: string;
  images: string[];
  isVerified: boolean;
  isApproved: boolean;
  helpfulVotes: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    photoUrl?: string;
  };
}

export interface Booking {
  id: string;
  userId: string;
  packageId: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  startDate: string;
  endDate?: string;
  guests: number;
  totalPrice: string; // Prisma Decimal fields are returned as strings
  currency: string;
  guestNames: string[];
  contactInfo?: any;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  package: {
    id: string;
    title: string;
    locationName: string;
    duration: number;
    coverImage?: string;
    price: number;
    currency: string;
  };
  reviews?: Review[];
}

export interface BookingsResponse {
  data: Booking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateBookingData {
  packageId: string;
  startDate: string;
  endDate?: string;
  guests: number;
  guestNames: string[];
  contactInfo?: any;
  notes?: string;
  totalPrice?: number;
  currency?: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateReviewData {
  packageId: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
}

export interface PackageFilters {
  search?: string;
  category?: string;
  difficulty?: string;
  locationName?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CarouselItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  actionType: 'INTERNAL' | 'EXTERNAL';
  actionValue: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
