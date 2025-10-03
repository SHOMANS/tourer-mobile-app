import React, { useEffect } from 'react';
import { FlatList } from 'react-native';
import { useAppStore } from '../store/appStore';
import { Booking } from '../types';
import {
  ScreenContainer,
  LoadingState,
  ErrorState,
  EmptyState,
  BookingCard,
} from '../components';

export default function MyBookingsScreen({ navigation }: any) {
  const {
    bookings,
    bookingsLoading,
    bookingsError,
    fetchBookings,
    clearBookings,
    accessToken,
    user,
    logout,
  } = useAppStore();

  useEffect(() => {
    if (accessToken && user) {
      fetchBookings();
    }
    return () => {
      clearBookings();
    };
  }, [accessToken, user]);

  const handleRefresh = () => {
    if (accessToken && user) {
      fetchBookings();
    }
  };

  const handleBookingPress = (booking: Booking) => {
    navigation.navigate('BookingDetail', { bookingId: booking.id });
  };

  const handleExploreTours = () => {
    navigation.navigate('MainTabs', { screen: 'Tours' });
  };

  const handleLogin = () => {
    logout(); // This will move user back to AuthStack where Login screen exists
  };

  // Show login prompt if not authenticated
  if (!accessToken || !user) {
    return (
      <ScreenContainer>
        <EmptyState
          title="Login Required"
          message="Please log in to view your bookings."
          actionText="Login"
          onAction={handleLogin}
        />
      </ScreenContainer>
    );
  }

  // Show loading state
  if (bookingsLoading && bookings.length === 0) {
    return (
      <ScreenContainer>
        <LoadingState message="Loading your bookings..." />
      </ScreenContainer>
    );
  }

  // Show error state - but check if it's an auth error first
  if (bookingsError && bookings.length === 0) {
    // If it's an authentication error, show login prompt
    if (bookingsError.includes('Authentication') ||
      bookingsError.includes('Unauthorized') ||
      bookingsError.includes('401')) {
      return (
        <ScreenContainer>
          <EmptyState
            title="Session Expired"
            message="Your session has expired. Please log in again to view your bookings."
            actionText="Login"
            onAction={handleLogin}
          />
        </ScreenContainer>
      );
    }

    // Show regular error state for other errors
    return (
      <ScreenContainer>
        <ErrorState
          title="Unable to load bookings"
          message={bookingsError}
          onRetry={handleRefresh}
        />
      </ScreenContainer>
    );
  }

  // Show empty state
  if (!bookingsLoading && bookings.length === 0) {
    return (
      <ScreenContainer>
        <EmptyState
          title="No Bookings Yet"
          message="You haven't made any bookings yet. Start exploring our amazing tours!"
          actionText="Explore Tours"
          onAction={handleExploreTours}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        data={bookings}
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            onPress={() => handleBookingPress(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        refreshing={bookingsLoading}
        onRefresh={handleRefresh}
      />
    </ScreenContainer>
  );
}