import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useAppStore } from '../store/appStore';
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
  const [bookingDetail, setBookingDetail] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookingDetail();
  }, [bookingId]);

  const fetchBookingDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const { bookings } = useAppStore.getState();
      const booking = bookings.find(b => b.id === bookingId);

      if (booking) {
        setBookingDetail(booking as Booking);
      } else {
        setError('Booking not found');
      }
    } catch (err) {
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <ScreenContainer>
        <LoadingState message="Loading booking details..." />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <ErrorState
          message={error}
          onRetry={fetchBookingDetail}
        />
      </ScreenContainer>
    );
  }

  if (!bookingDetail) {
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
            ID: {bookingDetail.id}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginRight: 10 }}>
              Status:
            </Text>
            <StatusBadge status={bookingDetail.status} />
          </View>
        </Card>

        {/* Tour Information */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            Tour Information
          </Text>
          <InfoRow
            label="Package"
            value={bookingDetail.package?.title || 'N/A'}
          />
          <InfoRow
            label="Duration"
            value={`${bookingDetail.package?.duration || 'N/A'} days`}
          />
          <InfoRow
            label="Location"
            value={bookingDetail.package?.locationName || 'N/A'}
          />
        </Card>

        {/* Booking Details */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            Booking Details
          </Text>
          <InfoRow
            label="Start Date"
            value={formatDate(bookingDetail.startDate)}
          />
          {bookingDetail.endDate && (
            <InfoRow
              label="End Date"
              value={formatDate(bookingDetail.endDate)}
            />
          )}
          <InfoRow
            label="Guests"
            value={bookingDetail.guests.toString()}
          />
          <InfoRow
            label="Total Price"
            value={`${bookingDetail.currency} ${parseFloat(bookingDetail.totalPrice || '0').toFixed(2)}`}
            valueStyle={{ fontWeight: '600', fontSize: 16 }}
          />
          <InfoRow
            label="Payment Status"
            value={bookingDetail.paymentStatus || 'N/A'}
          />
        </Card>

        {/* Contact Information */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            Contact Information
          </Text>
          <InfoRow
            label="Email"
            value={bookingDetail.user?.email || bookingDetail.contactEmail || 'N/A'}
          />
          <InfoRow
            label="Name"
            value={bookingDetail.user ? `${bookingDetail.user.firstName} ${bookingDetail.user.lastName}` : 'N/A'}
          />
        </Card>

        {/* Guest Names */}
        {bookingDetail.guestNames && bookingDetail.guestNames.length > 0 && (
          <Card style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
              Guest Names
            </Text>
            {bookingDetail.guestNames.map((name: string, index: number) => (
              <InfoRow
                key={index}
                label={`Guest ${index + 1}`}
                value={name}
              />
            ))}
          </Card>
        )}

        {/* Special Requests */}
        {bookingDetail.specialRequests && (
          <Card style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
              Special Requests
            </Text>
            <Text style={{ fontSize: 14, lineHeight: 20 }}>
              {bookingDetail.specialRequests}
            </Text>
          </Card>
        )}

        {/* Notes */}
        {bookingDetail.notes && (
          <Card style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
              Notes
            </Text>
            <Text style={{ fontSize: 14, lineHeight: 20 }}>
              {bookingDetail.notes}
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
            value={formatDate(bookingDetail.createdAt)}
          />
          <InfoRow
            label="Last updated"
            value={formatDate(bookingDetail.updatedAt)}
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