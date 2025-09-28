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
  location: string;
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

interface PackageFilters {
  search?: string;
  category?: string;
  difficulty?: string;
  location?: string;
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

  // Tour Packages
  packages: TourPackage[];
  selectedPackage: TourPackage | null;
  categories: string[];
  popularPackages: TourPackage[];
  packagesLoading: boolean;
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
  fetchPackageById: (id: string) => Promise<void>;
  fetchPackageBySlug: (slug: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchPopularPackages: () => Promise<void>;
  searchPackages: (query: string) => Promise<void>;
  clearPackages: () => void;
  setFilters: (filters: PackageFilters) => void;
}

// Smart API URL selection based on platform
const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }

  // Fallback logic for development
  // Note: This requires Platform import from react-native
  return 'http://10.0.0.169:3000'; // Your machine's IP
};

const API_BASE_URL = getApiBaseUrl();

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
};

export const useAppStore = create<AppState>((set, get) => ({
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
  packagesError: null,
  currentFilters: {},
  pagination: null,

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
        error.response?.data?.message || error.message || 'Registration failed';
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
}));
