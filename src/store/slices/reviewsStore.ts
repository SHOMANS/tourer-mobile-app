import { create } from 'zustand';
import {
  Review,
  ReviewsResponse,
  CreateReviewData,
  Pagination,
} from '../types';
import { apiClient } from '../utils/apiClient';

interface ReviewsState {
  // Review state
  reviews: Review[];
  reviewsLoading: boolean;
  reviewsError: string | null;
  reviewsPagination: Pagination | null;

  // Review actions
  fetchReviews: (
    packageId: string,
    page?: number,
    limit?: number
  ) => Promise<void>;
  createReview: (reviewData: CreateReviewData) => Promise<any>;
  clearReviews: () => void;
}

export const useReviewsStore = create<ReviewsState>((set, get) => ({
  // Initial state
  reviews: [],
  reviewsLoading: false,
  reviewsError: null,
  reviewsPagination: null,

  // Actions
  fetchReviews: async (packageId: string, page = 1, limit = 10) => {
    set({ reviewsLoading: true, reviewsError: null });
    try {
      const response = await apiClient.get(
        `/packages/${packageId}/reviews?page=${page}&limit=${limit}`
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
      const response = await apiClient.post(
        `/packages/${reviewData.packageId}/reviews`,
        reviewData
      );

      // Return the created review data for potential optimistic updates
      return response.data;
    } catch (error: any) {
      let errorMessage = 'Failed to create review';

      if (error.response?.status === 409) {
        errorMessage = 'You have already reviewed this tour package';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      set({ reviewsError: errorMessage });
      throw new Error(errorMessage);
    }
  },

  clearReviews: () => {
    set({
      reviews: [],
      reviewsError: null,
      reviewsPagination: null,
    });
  },
}));
