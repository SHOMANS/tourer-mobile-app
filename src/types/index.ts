export interface TourPackage {
  id: string;
  title: string;
  shortDescription?: string;
  price: string;
  originalPrice?: string;
  currency: string;
  duration: number;
  difficulty: string;
  category: string;
  locationName: string;
  country?: string;
  coverImage?: string;
  rating?: number;
  reviewCount: number;
}

export interface Booking {
  id: string;
  userId: string;
  packageId: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  startDate: string;
  endDate?: string;
  guests: number;
  totalPrice: string;
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
  // Optional fields for legacy data
  contactEmail?: string;
  contactPhone?: string;
  specialRequests?: string;
}

export interface CarouselItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  actionType: 'INTERNAL' | 'EXTERNAL';
  actionValue: string;
  isActive: boolean;
  sortOrder: number;
}

export interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface NavigationProps {
  navigation: any;
  route?: any;
}
