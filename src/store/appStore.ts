import { create } from 'zustand';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface HealthData {
  status: string;
  version: string;
  timestamp: string;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

interface TourPackage {
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

interface PackagesResponse {
  data: TourPackage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface Review {
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

interface Booking {
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

interface BookingsResponse {
  data: Booking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface CreateBookingData {
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

interface ReviewsResponse {
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface CreateReviewData {
  packageId: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
}

interface PackageFilters {
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

interface AppState {
  // Health
  healthData: HealthData | null;
  loading: boolean;
  error: string | null;
  fetchHealthStatus: () => Promise<void>;

  // Auth
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  authError: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  googleSignIn: (idToken: string, userInfo?: any) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  verifyAuthentication: () => Promise<boolean>;

  // Tour Packages
  packages: TourPackage[];
  selectedPackage: TourPackage | null;
  categories: string[];
  popularPackages: TourPackage[];
  packagesLoading: boolean;
  loadingMore: boolean;
  packagesError: string | null;
  currentFilters: PackageFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;

  // Package methods
  fetchPackages: (filters?: PackageFilters) => Promise<void>;
  loadMorePackages: () => Promise<void>;
  fetchPackageById: (id: string) => Promise<void>;
  fetchPackageBySlug: (slug: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchPopularPackages: () => Promise<void>;
  searchPackages: (query: string) => Promise<void>;
  clearPackages: () => void;
  setFilters: (filters: PackageFilters) => void;

  // Reviews
  reviews: Review[];
  reviewsLoading: boolean;
  reviewsError: string | null;
  reviewsPagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;

  // Review methods
  fetchReviews: (
    packageId: string,
    page?: number,
    limit?: number
  ) => Promise<void>;
  createReview: (reviewData: CreateReviewData) => Promise<any>;
  clearReviews: () => void;
  addOptimisticReview: (
    reviewData: CreateReviewData,
    userId: string,
    userName: string
  ) => void;

  // Bookings
  bookings: Booking[];
  bookingsLoading: boolean;
  bookingsError: string | null;
  bookingsPagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  selectedBooking: Booking | null;

  // Booking methods
  fetchBookings: (page?: number, limit?: number) => Promise<void>;
  fetchBookingById: (id: string) => Promise<void>;
  createBooking: (bookingData: CreateBookingData) => Promise<void>;
  updateBooking: (
    id: string,
    updateData: Partial<CreateBookingData>
  ) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  clearBookings: () => void;
}

// Smart API URL selection based on platform
const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    console.log(
      'Using env API_BASE_URL:',
      process.env.EXPO_PUBLIC_API_BASE_URL
    );
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }

  // Fallback logic for development
  // Note: This requires Platform import from react-native
  console.log('Using fallback API_BASE_URL: http://10.0.0.121:3006');
  return 'http://10.0.0.121:3006'; // Your machine's IP with correct port
};

const API_BASE_URL = getApiBaseUrl();
console.log('Final API_BASE_URL:', API_BASE_URL);

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
};

// Create axios interceptor to handle authentication
let storeRef: any = null;

// Request interceptor to add auth token
axios.interceptors.request.use(
  async (config) => {
    if (storeRef) {
      const { accessToken } = storeRef.getState();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 responses
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loops and avoid retrying certain endpoints
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      if (storeRef) {
        const { refreshToken, refreshAccessToken, logout } =
          storeRef.getState();

        if (refreshToken) {
          try {
            console.log('Attempting to refresh token due to 401 error');
            // Try to refresh the token
            await refreshAccessToken();
            // Retry the original request with new token
            const { accessToken } = storeRef.getState();
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            console.log('Token refreshed, retrying original request');
            return axios(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
            console.log('Token refresh failed, logging out user');
            await logout();
            return Promise.reject(refreshError);
          }
        } else {
          // No refresh token, logout user
          console.log('No refresh token available, logging out user');
          await logout();
        }
      }
    }

    return Promise.reject(error);
  }
);

export const useAppStore = create<AppState>((set, get) => {
  // Set store reference for interceptors
  storeRef = { getState: get };

  return {
    // Health state
    healthData: null,
    loading: false,
    error: null,

    // Auth state
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: false,
    authError: null,

    // Tour Packages state
    packages: [],
    selectedPackage: null,
    categories: [],
    popularPackages: [],
    packagesLoading: false,
    loadingMore: false,
    packagesError: null,
    currentFilters: {},
    pagination: null,

    // Reviews state
    reviews: [],
    reviewsLoading: false,
    reviewsError: null,
    reviewsPagination: null,

    // Bookings state
    bookings: [],
    bookingsLoading: false,
    bookingsError: null,
    bookingsPagination: null,
    selectedBooking: null,

    fetchHealthStatus: async () => {
      set({ loading: true, error: null });
      try {
        const response = await axios.get(`${API_BASE_URL}/health`, {
          timeout: 5000,
        });
        set({ healthData: response.data, loading: false });
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : 'Failed to fetch health status',
          loading: false,
        });
      }
    },

    login: async (email: string, password: string) => {
      set({ isLoading: true, authError: null });
      try {
        const response = await axios.post<AuthResponse>(
          `${API_BASE_URL}/auth/login`,
          {
            email,
            password,
          }
        );

        const { access_token, refresh_token, user } = response.data;

        // Store tokens and user data
        await AsyncStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, access_token);
        await AsyncStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refresh_token);
        await AsyncStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));

        set({
          user,
          accessToken: access_token,
          refreshToken: refresh_token,
          isLoading: false,
          authError: null,
        });
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || 'Login failed';
        set({
          authError: errorMessage,
          isLoading: false,
        });
        throw new Error(errorMessage);
      }
    },

    register: async (
      email: string,
      password: string,
      firstName: string,
      lastName: string
    ) => {
      set({ isLoading: true, authError: null });
      try {
        const response = await axios.post<AuthResponse>(
          `${API_BASE_URL}/auth/register`,
          {
            email,
            password,
            firstName,
            lastName,
          }
        );

        const { access_token, refresh_token, user } = response.data;

        // Store tokens and user data
        await AsyncStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, access_token);
        await AsyncStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refresh_token);
        await AsyncStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));

        set({
          user,
          accessToken: access_token,
          refreshToken: refresh_token,
          isLoading: false,
          authError: null,
        });
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Registration failed';
        set({
          authError: errorMessage,
          isLoading: false,
        });
        throw new Error(errorMessage);
      }
    },

    googleSignIn: async (idToken: string, userInfo?: any) => {
      set({ isLoading: true, authError: null });
      try {
        if (!idToken) {
          throw new Error('Google sign-in failed to get ID token');
        }

        // Send Google token to backend for verification and JWT creation
        const response = await axios.post<AuthResponse>(
          `${API_BASE_URL}/auth/google`,
          {
            idToken,
            googleId: userInfo?.sub,
            email: userInfo?.email,
            firstName: userInfo?.given_name,
            lastName: userInfo?.family_name,
            photoUrl: userInfo?.picture,
          }
        );

        const { access_token, refresh_token, user } = response.data;

        // Store tokens and user data
        await AsyncStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, access_token);
        await AsyncStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refresh_token);
        await AsyncStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));

        set({
          user,
          accessToken: access_token,
          refreshToken: refresh_token,
          isLoading: false,
          authError: null,
        });
      } catch (error: any) {
        console.error('Google sign-in error:', error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Google sign-in failed';
        set({
          authError: errorMessage,
          isLoading: false,
        });
        throw new Error(errorMessage);
      }
    },

    logout: async () => {
      try {
        // Clear stored tokens and user data
        await AsyncStorage.multiRemove([
          TOKEN_KEYS.ACCESS_TOKEN,
          TOKEN_KEYS.REFRESH_TOKEN,
          TOKEN_KEYS.USER,
        ]);

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          authError: null,
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    },

    loadStoredAuth: async () => {
      try {
        const [accessToken, refreshToken, userString] =
          await AsyncStorage.multiGet([
            TOKEN_KEYS.ACCESS_TOKEN,
            TOKEN_KEYS.REFRESH_TOKEN,
            TOKEN_KEYS.USER,
          ]);

        if (accessToken[1] && refreshToken[1] && userString[1]) {
          const user = JSON.parse(userString[1]);
          set({
            user,
            accessToken: accessToken[1],
            refreshToken: refreshToken[1],
          });
        }
      } catch (error) {
        console.error('Error loading stored auth:', error);
      }
    },

    refreshAccessToken: async () => {
      const { refreshToken } = get();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      try {
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        const { access_token } = response.data;
        await AsyncStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, access_token);

        set({ accessToken: access_token });
        return access_token;
      } catch (error: any) {
        // If refresh fails, logout the user
        await get().logout();
        throw new Error('Session expired. Please login again.');
      }
    },

    verifyAuthentication: async () => {
      const { accessToken, refreshToken } = get();

      if (!accessToken || !refreshToken) {
        return false;
      }

      try {
        // Try to make a simple authenticated request to verify token
        await axios.get(`${API_BASE_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        return true;
      } catch (error: any) {
        if (error.response?.status === 401) {
          // Token is invalid, try to refresh
          try {
            await get().refreshAccessToken();
            return true;
          } catch (refreshError) {
            // Refresh failed, user is no longer authenticated
            await get().logout();
            return false;
          }
        }
        // Other errors, assume user is still authenticated
        return true;
      }
    },

    // Tour Package Methods
    fetchPackages: async (filters: PackageFilters = {}) => {
      set({ packagesLoading: true, packagesError: null });
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });

        const response = await axios.get<PackagesResponse>(
          `${API_BASE_URL}/packages?${params.toString()}`
        );

        set({
          packages: response.data.data,
          pagination: response.data.pagination,
          currentFilters: filters,
          packagesLoading: false,
        });
      } catch (error) {
        set({
          packagesError:
            error instanceof Error ? error.message : 'Failed to fetch packages',
          packagesLoading: false,
        });
      }
    },

    loadMorePackages: async () => {
      const { pagination, currentFilters, packages } = get();

      if (!pagination || pagination.page >= pagination.pages) {
        return; // No more pages to load
      }

      set({ loadingMore: true, packagesError: null });
      try {
        const nextPageFilters = {
          ...currentFilters,
          page: pagination.page + 1,
          limit: pagination.limit,
        };

        const params = new URLSearchParams();
        Object.entries(nextPageFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });

        const response = await axios.get<PackagesResponse>(
          `${API_BASE_URL}/packages?${params.toString()}`
        );

        set({
          packages: [...packages, ...response.data.data], // Append new packages
          pagination: response.data.pagination,
          loadingMore: false,
        });
      } catch (error) {
        set({
          packagesError:
            error instanceof Error
              ? error.message
              : 'Failed to load more packages',
          loadingMore: false,
        });
      }
    },

    fetchPackageById: async (id: string) => {
      set({ packagesLoading: true, packagesError: null });
      try {
        const response = await axios.get<TourPackage>(
          `${API_BASE_URL}/packages/${id}`
        );
        set({
          selectedPackage: response.data,
          packagesLoading: false,
        });
      } catch (error) {
        set({
          packagesError:
            error instanceof Error ? error.message : 'Failed to fetch package',
          packagesLoading: false,
        });
      }
    },

    fetchPackageBySlug: async (slug: string) => {
      set({ packagesLoading: true, packagesError: null });
      try {
        const response = await axios.get<TourPackage>(
          `${API_BASE_URL}/packages/slug/${slug}`
        );
        set({
          selectedPackage: response.data,
          packagesLoading: false,
        });
      } catch (error) {
        set({
          packagesError:
            error instanceof Error ? error.message : 'Failed to fetch package',
          packagesLoading: false,
        });
      }
    },

    fetchCategories: async () => {
      try {
        const response = await axios.get<string[]>(
          `${API_BASE_URL}/packages/categories`
        );
        set({ categories: response.data });
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    },

    fetchPopularPackages: async () => {
      try {
        const response = await axios.get<TourPackage[]>(
          `${API_BASE_URL}/packages/popular`
        );
        set({ popularPackages: response.data });
      } catch (error) {
        console.error('Failed to fetch popular packages:', error);
      }
    },

    searchPackages: async (query: string) => {
      await get().fetchPackages({ search: query, page: 1 });
    },

    clearPackages: () => {
      set({
        packages: [],
        selectedPackage: null,
        currentFilters: {},
        pagination: null,
        packagesError: null,
      });
    },

    setFilters: (filters: PackageFilters) => {
      set({ currentFilters: { ...get().currentFilters, ...filters } });
    },

    // Review methods
    fetchReviews: async (packageId: string, page = 1, limit = 10) => {
      set({ reviewsLoading: true, reviewsError: null });
      try {
        const { accessToken } = get();
        const response = await axios.get(
          `${API_BASE_URL}/packages/${packageId}/reviews?page=${page}&limit=${limit}`,
          {
            headers: accessToken
              ? { Authorization: `Bearer ${accessToken}` }
              : {},
          }
        );

        const reviewsResponse: ReviewsResponse = response.data;
        set({
          reviews:
            page === 1
              ? reviewsResponse.reviews
              : [...get().reviews, ...reviewsResponse.reviews],
          reviewsPagination: reviewsResponse.pagination,
          reviewsLoading: false,
        });
      } catch (error) {
        set({
          reviewsError:
            error instanceof Error ? error.message : 'Failed to fetch reviews',
          reviewsLoading: false,
        });
      }
    },

    createReview: async (reviewData: CreateReviewData) => {
      set({ reviewsError: null });
      try {
        const { accessToken } = get();
        if (!accessToken) {
          throw new Error('Authentication required');
        }

        const response = await axios.post(
          `${API_BASE_URL}/packages/${reviewData.packageId}/reviews`,
          reviewData,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        // Return the created review data for potential optimistic updates
        return response.data;
      } catch (error: any) {
        let errorMessage = 'Failed to create review';

        // Extract specific error message from axios error
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        set({ reviewsError: errorMessage });

        // Create a more detailed error object to throw
        const detailedError = new Error(errorMessage);
        (detailedError as any).originalError = error;
        throw detailedError;
      }
    },

    clearReviews: () => {
      set({ reviews: [], reviewsError: null, reviewsPagination: null });
    },

    addOptimisticReview: (
      reviewData: CreateReviewData,
      userId: string,
      userName: string
    ) => {
      const optimisticReview = {
        id: 'temp-' + Date.now(), // Temporary ID
        userId,
        packageId: reviewData.packageId,
        bookingId: undefined,
        rating: reviewData.rating,
        title: reviewData.title || undefined,
        comment: reviewData.comment || '',
        images: reviewData.images || [],
        isVerified: false,
        isApproved: true,
        helpfulVotes: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: {
          id: userId,
          firstName: userName.split(' ')[0] || 'You',
          lastName: userName.split(' ')[1] || '',
          photoUrl: undefined,
        },
      };

      const { reviews } = get();
      set({ reviews: [optimisticReview, ...reviews] });
    },

    // Booking methods
    fetchBookings: async (page = 1, limit = 10) => {
      console.log('fetchBookings called with page:', page, 'limit:', limit);
      set({ bookingsLoading: true, bookingsError: null });
      try {
        const { accessToken, user } = get();
        console.log(
          'Access token available:',
          !!accessToken,
          'User available:',
          !!user
        );

        if (!accessToken || !user) {
          console.log('No access token or user, authentication required');
          set({
            bookingsError: 'Authentication required',
            bookingsLoading: false,
          });
          return;
        }

        console.log(
          'Making API call to:',
          `${API_BASE_URL}/bookings/user-bookings?page=${page}&limit=${limit}`
        );

        // Add timeout to prevent hanging
        const response = await axios.get(
          `${API_BASE_URL}/bookings/user-bookings?page=${page}&limit=${limit}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            timeout: 10000, // 10 second timeout
          }
        );

        console.log('API response received:', response.status);
        const bookingsResponse: BookingsResponse = response.data;
        set({
          bookings:
            page === 1
              ? bookingsResponse.data
              : [...get().bookings, ...bookingsResponse.data],
          bookingsPagination: bookingsResponse.pagination,
          bookingsLoading: false,
        });
        console.log(
          'Bookings set successfully, count:',
          bookingsResponse.data.length
        );
      } catch (error) {
        console.error('fetchBookings error:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          response: (error as any)?.response?.data,
          status: (error as any)?.response?.status,
          code: (error as any)?.code,
        });

        // Check for authentication errors
        const isAuthError =
          (error as any)?.response?.status === 401 ||
          (error instanceof Error && error.message.includes('Authentication'));

        if (isAuthError) {
          console.log('Authentication error detected, will logout user');
          // Don't set error state for auth errors, let the logout handle it
          set({ bookingsLoading: false });
          // The axios interceptor should handle logout automatically
        } else {
          set({
            bookingsError:
              error instanceof Error
                ? error.message
                : 'Failed to fetch bookings',
            bookingsLoading: false,
          });
        }
      }
    },

    fetchBookingById: async (id: string) => {
      set({ bookingsLoading: true, bookingsError: null });
      try {
        const { accessToken } = get();
        if (!accessToken) {
          throw new Error('Authentication required');
        }

        const response = await axios.get(`${API_BASE_URL}/bookings/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        set({
          selectedBooking: response.data,
          bookingsLoading: false,
        });
      } catch (error) {
        set({
          bookingsError:
            error instanceof Error ? error.message : 'Failed to fetch booking',
          bookingsLoading: false,
        });
      }
    },

    createBooking: async (bookingData: CreateBookingData) => {
      set({ bookingsLoading: true, bookingsError: null });
      try {
        const { accessToken } = get();
        if (!accessToken) {
          throw new Error('Authentication required');
        }

        const response = await axios.post(
          `${API_BASE_URL}/bookings`,
          bookingData,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        // Add new booking to the beginning of the list
        set({
          bookings: [response.data, ...get().bookings],
          selectedBooking: response.data,
          bookingsLoading: false,
        });

        return response.data;
      } catch (error) {
        set({
          bookingsError:
            error instanceof Error ? error.message : 'Failed to create booking',
          bookingsLoading: false,
        });
        throw error;
      }
    },

    updateBooking: async (
      id: string,
      updateData: Partial<CreateBookingData>
    ) => {
      set({ bookingsLoading: true, bookingsError: null });
      try {
        const { accessToken } = get();
        if (!accessToken) {
          throw new Error('Authentication required');
        }

        const response = await axios.patch(
          `${API_BASE_URL}/bookings/${id}`,
          updateData,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        // Update booking in the list
        const updatedBookings = get().bookings.map((booking) =>
          booking.id === id ? response.data : booking
        );

        set({
          bookings: updatedBookings,
          selectedBooking: response.data,
          bookingsLoading: false,
        });

        return response.data;
      } catch (error) {
        set({
          bookingsError:
            error instanceof Error ? error.message : 'Failed to update booking',
          bookingsLoading: false,
        });
        throw error;
      }
    },

    cancelBooking: async (id: string) => {
      set({ bookingsLoading: true, bookingsError: null });
      try {
        const { accessToken } = get();
        if (!accessToken) {
          throw new Error('Authentication required');
        }

        const response = await axios.patch(
          `${API_BASE_URL}/bookings/${id}/cancel`,
          {},
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        // Update booking status in the list
        const updatedBookings = get().bookings.map((booking) =>
          booking.id === id ? response.data : booking
        );

        set({
          bookings: updatedBookings,
          selectedBooking: response.data,
          bookingsLoading: false,
        });

        return response.data;
      } catch (error) {
        set({
          bookingsError:
            error instanceof Error ? error.message : 'Failed to cancel booking',
          bookingsLoading: false,
        });
        throw error;
      }
    },

    clearBookings: () => {
      set({
        bookings: [],
        bookingsError: null,
        bookingsPagination: null,
        selectedBooking: null,
      });
    },
  };
});
