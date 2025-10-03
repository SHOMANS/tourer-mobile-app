import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useBookingsStore } from '../store/slices/bookingsStore';
import { Booking } from '../types';
import {
  ScreenContainer,
  LoadingState,
  ErrorState,
  Card,
  InfoRow,
  StatusBadge,
  Button,
} from '../components';

export default function BookingDetailScreen({ route, navigation }: any) {
  const { bookingId } = route.params;
  const {
    selectedBooking,
    bookingsLoading,
    bookingsError,
    fetchBookingById
  } = useBookingsStore();

  useEffect(() => {
    fetchBookingDetail();
  }, [bookingId]);

  const fetchBookingDetail = async () => {
    try {
      await fetchBookingById(bookingId);
    } catch (err) {
      // Error is handled by the store
      console.error('Failed to fetch booking:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (bookingsLoading) {
    return (
      <ScreenContainer>
        <LoadingState message="Loading booking details..." />
      </ScreenContainer>
    );
  }

  if (bookingsError) {
    return (
      <ScreenContainer>
        <ErrorState
          message={bookingsError}
          onRetry={fetchBookingDetail}
        />
      </ScreenContainer>
    );
  }

  if (!selectedBooking) {
    return (
      <ScreenContainer>
        <ErrorState
          message="Booking not found"
          onRetry={() => navigation.goBack()}
          retryText="Go Back"
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView style={{ flex: 1, padding: 20 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Card style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 5 }}>
            Booking Details
          </Text>
          <Text style={{ fontSize: 14, color: '#666', fontFamily: 'monospace' }}>
            ID: {selectedBooking.id}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginRight: 10 }}>
              Status:
            </Text>
            <StatusBadge status={selectedBooking.status} />
          </View>
        </Card>

        {/* Tour Information */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            Tour Information
          </Text>
          <InfoRow
            label="Package"
            value={selectedBooking.package?.title || 'N/A'}
          />
          <InfoRow
            label="Duration"
            value={`${selectedBooking.package?.duration || 'N/A'} days`}
          />
          <InfoRow
            label="Location"
            value={selectedBooking.package?.locationName || 'N/A'}
          />
        </Card>

        {/* Booking Details */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            Booking Details
          </Text>
          <InfoRow
            label="Start Date"
            value={formatDate(selectedBooking.startDate)}
          />
          {selectedBooking.endDate && (
            <InfoRow
              label="End Date"
              value={formatDate(selectedBooking.endDate)}
            />
          )}
          <InfoRow
            label="Guests"
            value={selectedBooking.guests.toString()}
          />
          <InfoRow
            label="Total Price"
            value={`${selectedBooking.currency} ${parseFloat(selectedBooking.totalPrice || '0').toFixed(2)}`}
            valueStyle={{ fontWeight: '600', fontSize: 16 }}
          />
          <InfoRow
            label="Payment Status"
            value={selectedBooking.paymentStatus || 'N/A'}
          />
        </Card>

        {/* Contact Information */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            Contact Information
          </Text>
          <InfoRow
            label="Email"
            value={selectedBooking.user?.email || selectedBooking.contactEmail || 'N/A'}
          />
          <InfoRow
            label="Name"
            value={selectedBooking.user ? `${selectedBooking.user.firstName} ${selectedBooking.user.lastName}` : 'N/A'}
          />
        </Card>

        {/* Guest Names */}
        {selectedBooking.guestNames && selectedBooking.guestNames.length > 0 && (
          <Card style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
              Guest Names
            </Text>
            {selectedBooking.guestNames.map((name: string, index: number) => (
              <InfoRow
                key={index}
                label={`Guest ${index + 1}`}
                value={name}
              />
            ))}
          </Card>
        )}

        {/* Special Requests */}
        {selectedBooking.specialRequests && (
          <Card style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
              Special Requests
            </Text>
            <Text style={{ fontSize: 14, lineHeight: 20 }}>
              {selectedBooking.specialRequests}
            </Text>
          </Card>
        )}

        {/* Notes */}
        {selectedBooking.notes && (
          <Card style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
              Notes
            </Text>
            <Text style={{ fontSize: 14, lineHeight: 20 }}>
              {selectedBooking.notes}
            </Text>
          </Card>
        )}

        {/* Booking Information */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            Booking Information
          </Text>
          <InfoRow
            label="Booked on"
            value={formatDate(selectedBooking.createdAt)}
          />
          <InfoRow
            label="Last updated"
            value={formatDate(selectedBooking.updatedAt)}
          />
        </Card>

        {/* Back Button */}
        <View style={{ marginTop: 20, marginBottom: 40 }}>
          <Button
            title="Back to Bookings"
            onPress={() => navigation.goBack()}
            variant="primary"
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}