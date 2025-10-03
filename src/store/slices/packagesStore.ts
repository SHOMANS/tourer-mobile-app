import { create } from 'zustand';
import {
  TourPackage,
  PackagesResponse,
  PackageFilters,
  Pagination,
} from '../types';
import { apiClient } from '../utils/apiClient';

interface PackagesState {
  // Package state
  packages: TourPackage[];
  selectedPackage: TourPackage | null;
  categories: string[];
  popularPackages: TourPackage[];
  packagesLoading: boolean;
  loadingMore: boolean;
  packagesError: string | null;
  currentFilters: PackageFilters;
  pagination: Pagination | null;

  // Package actions
  fetchPackages: (filters?: PackageFilters) => Promise<void>;
  loadMorePackages: () => Promise<void>;
  fetchPackageById: (id: string) => Promise<void>;
  fetchPackageBySlug: (slug: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchPopularPackages: () => Promise<void>;
  searchPackages: (query: string) => Promise<void>;
  clearPackages: () => void;
  setFilters: (filters: PackageFilters) => void;
}

export const usePackagesStore = create<PackagesState>((set, get) => ({
  // Initial state
  packages: [],
  selectedPackage: null,
  categories: [],
  popularPackages: [],
  packagesLoading: false,
  loadingMore: false,
  packagesError: null,
  currentFilters: {},
  pagination: null,

  // Actions
  fetchPackages: async (filters: PackageFilters = {}) => {
    const { loadingMore } = get();

    if (!loadingMore) {
      set({ packagesLoading: true, packagesError: null });
    }

    try {
      const queryParams = new URLSearchParams();

      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await apiClient.get<PackagesResponse>(
        `/packages?${queryParams.toString()}`
      );

      const { data: newPackages, pagination } = response.data;

      set({
        packages:
          filters.page === 1 || !filters.page
            ? newPackages
            : [...get().packages, ...newPackages],
        pagination,
        currentFilters: filters,
        packagesLoading: false,
        loadingMore: false,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch packages';
      set({
        packagesError: errorMessage,
        packagesLoading: false,
        loadingMore: false,
      });
      throw new Error(errorMessage);
    }
  },

  loadMorePackages: async () => {
    const { pagination, currentFilters, loadingMore, packagesLoading } = get();

    if (
      loadingMore ||
      packagesLoading ||
      !pagination ||
      pagination.page >= pagination.pages
    ) {
      return;
    }

    set({ loadingMore: true });

    const nextPageFilters = {
      ...currentFilters,
      page: pagination.page + 1,
    };

    await get().fetchPackages(nextPageFilters);
  },

  fetchPackageById: async (id: string) => {
    set({ packagesLoading: true, packagesError: null });
    try {
      const response = await apiClient.get<TourPackage>(`/packages/${id}`);
      set({
        selectedPackage: response.data,
        packagesLoading: false,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch package';
      set({
        packagesError: errorMessage,
        packagesLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  fetchPackageBySlug: async (slug: string) => {
    set({ packagesLoading: true, packagesError: null });
    try {
      const response = await apiClient.get<TourPackage>(
        `/packages/slug/${slug}`
      );
      set({
        selectedPackage: response.data,
        packagesLoading: false,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch package';
      set({
        packagesError: errorMessage,
        packagesLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  fetchCategories: async () => {
    try {
      const response = await apiClient.get<string[]>(`/packages/categories`);
      set({ categories: response.data });
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  },

  fetchPopularPackages: async () => {
    try {
      const response = await apiClient.get<PackagesResponse>(
        `/packages?limit=6&sortBy=popularity`
      );
      set({ popularPackages: response.data.data });
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
      packagesError: null,
      pagination: null,
      currentFilters: {},
    });
  },

  setFilters: (filters: PackageFilters) => {
    set({ currentFilters: { ...get().currentFilters, ...filters } });
  },
}));
