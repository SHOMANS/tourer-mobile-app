// Backward compatibility - re-export the new store structure
// This file maintains compatibility with existing imports
export { useAppStore } from './index';
export * from './types';

// Individual store exports for components that want to use specific stores
export { useAuthStore } from './slices/authStore';
export { usePackagesStore } from './slices/packagesStore';
export { useBookingsStore } from './slices/bookingsStore';
export { useReviewsStore } from './slices/reviewsStore';
export { useHealthStore } from './slices/healthStore';
export { useCarouselStore } from './slices/carouselStore';
