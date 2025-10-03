import { create } from 'zustand';
import {
  Booking,
  BookingsResponse,
  CreateBookingData,
  Pagination,
} from '../types';
import { apiClient } from '../utils/apiClient';

interface BookingsState {
  // Booking state
  bookings: Booking[];
  selectedBooking: Booking | null;
  bookingsLoading: boolean;
  bookingsError: string | null;
  bookingsPagination: Pagination | null;

  // Booking actions
  fetchBookings: (page?: number, limit?: number) => Promise<void>;
  fetchBookingById: (id: string) => Promise<void>;
  createBooking: (bookingData: CreateBookingData) => Promise<string>;
  updateBookingStatus: (id: string, status: string) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  clearBookings: () => void;
}

export const useBookingsStore = create<BookingsState>((set, get) => ({
  // Initial state
  bookings: [],
  selectedBooking: null,
  bookingsLoading: false,
  bookingsError: null,
  bookingsPagination: null,

  // Actions
  fetchBookings: async (page = 1, limit = 10) => {
    console.log('fetchBookings called with page:', page, 'limit:', limit);
    set({ bookingsLoading: true, bookingsError: null });
    try {
      console.log(
        'Making API call to:',
        `/bookings/user-bookings?page=${page}&limit=${limit}`
      );

      // Add timeout to prevent hanging
      const response = await apiClient.get(
        `/bookings/user-bookings?page=${page}&limit=${limit}`,
        {
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

      if (!isAuthError) {
        set({
          bookingsError:
            error instanceof Error ? error.message : 'Failed to fetch bookings',
          bookingsLoading: false,
        });
      } else {
        set({ bookingsLoading: false });
      }
    }
  },

  fetchBookingById: async (id: string) => {
    set({ bookingsLoading: true, bookingsError: null });
    try {
      const response = await apiClient.get(`/bookings/${id}`);
      set({
        selectedBooking: response.data,
        bookingsLoading: false,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch booking';
      set({
        bookingsError: errorMessage,
        bookingsLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  createBooking: async (bookingData: CreateBookingData) => {
    set({ bookingsLoading: true, bookingsError: null });
    try {
      const response = await apiClient.post(`/bookings`, bookingData);

      // Add the new booking to the list
      const newBooking = response.data;
      set({
        bookings: [newBooking, ...get().bookings],
        bookingsLoading: false,
      });

      return newBooking.id;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to create booking';
      set({
        bookingsError: errorMessage,
        bookingsLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  updateBookingStatus: async (id: string, status: string) => {
    try {
      const response = await apiClient.patch(`/bookings/${id}/status`, {
        status,
      });

      // Update the booking in the list
      const updatedBooking = response.data;
      set({
        bookings: get().bookings.map((booking) =>
          booking.id === id ? updatedBooking : booking
        ),
        selectedBooking:
          get().selectedBooking?.id === id
            ? updatedBooking
            : get().selectedBooking,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to update booking';
      set({ bookingsError: errorMessage });
      throw new Error(errorMessage);
    }
  },

  cancelBooking: async (id: string) => {
    await get().updateBookingStatus(id, 'CANCELLED');
  },

  clearBookings: () => {
    set({
      bookings: [],
      selectedBooking: null,
      bookingsError: null,
      bookingsPagination: null,
    });
  },
}));
