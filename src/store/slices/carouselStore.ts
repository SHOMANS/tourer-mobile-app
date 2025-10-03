import { create } from 'zustand';
import { CarouselItem } from '../types';
import { apiClient } from '../utils/apiClient';

interface CarouselState {
  // Carousel state
  carouselItems: CarouselItem[];
  carouselLoading: boolean;
  carouselError: string | null;

  // Carousel actions
  fetchCarouselItems: () => Promise<void>;
}

export const useCarouselStore = create<CarouselState>((set) => ({
  // Initial state
  carouselItems: [],
  carouselLoading: false,
  carouselError: null,

  // Actions
  fetchCarouselItems: async () => {
    set({ carouselLoading: true, carouselError: null });
    try {
      const response = await apiClient.get<CarouselItem[]>(`/carousel/active`);
      set({
        carouselItems: response.data,
        carouselLoading: false,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch carousel items';
      set({
        carouselError: errorMessage,
        carouselLoading: false,
      });
    }
  },
}));
