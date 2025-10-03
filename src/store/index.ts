// Re-export all store slices for easy importing
export { useAuthStore } from './slices/authStore';
export { usePackagesStore } from './slices/packagesStore';
export { useBookingsStore } from './slices/bookingsStore';
export { useReviewsStore } from './slices/reviewsStore';
export { useHealthStore } from './slices/healthStore';
export { useCarouselStore } from './slices/carouselStore';

// Re-export types
export * from './types';

// For backward compatibility - legacy useAppStore hook
// This maintains the same interface as the old monolithic store
import { useAuthStore } from './slices/authStore';
import { usePackagesStore } from './slices/packagesStore';
import { useBookingsStore } from './slices/bookingsStore';
import { useReviewsStore } from './slices/reviewsStore';
import { useHealthStore } from './slices/healthStore';
import { useCarouselStore } from './slices/carouselStore';

export const useAppStore = () => {
  const auth = useAuthStore();
  const packages = usePackagesStore();
  const bookings = useBookingsStore();
  const reviews = useReviewsStore();
  const health = useHealthStore();
  const carousel = useCarouselStore();

  return {
    // Auth state and actions
    ...auth,

    // Packages state and actions
    ...packages,

    // Bookings state and actions
    ...bookings,

    // Reviews state and actions
    ...reviews,

    // Health state and actions
    ...health,

    // Carousel state and actions
    ...carousel,
  };
};
