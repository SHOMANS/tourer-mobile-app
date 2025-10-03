import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAppStore } from '../store/appStore';
import { Colors } from '../config/colors';

export default function BookingDetailScreen({ route, navigation }: any) {
  const { bookingId } = route.params;
  const [bookingDetail, setBookingDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookingDetail();
  }, [bookingId]);

  const fetchBookingDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      // For now, let's get the booking detail from the existing bookings
      // Later we can create a dedicated API endpoint for single booking details
      const { bookings } = useAppStore.getState();
      const booking = bookings.find(b => b.id === bookingId);

      if (booking) {
        setBookingDetail(booking);
      } else {
        setError('Booking not found');
      }
    } catch (err) {
      console.error('Error fetching booking detail:', err);
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return Colors.status.success;
      case 'pending':
        return Colors.status.warning;
      case 'cancelled':
        return Colors.status.error;
      default:
        return Colors.text.primary;
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading booking details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchBookingDetail}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!bookingDetail) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Booking not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Booking Details</Text>
          <Text style={styles.bookingId}>ID: {bookingDetail.id}</Text>
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status:</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(bookingDetail.status) }]}>
            <Text style={styles.statusText}>{getStatusText(bookingDetail.status)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tour Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Package:</Text>
            <Text style={styles.value}>{bookingDetail.package?.title || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Duration:</Text>
            <Text style={styles.value}>{bookingDetail.package?.duration || 'N/A'} days</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Location:</Text>
            <Text style={styles.value}>{bookingDetail.package?.location || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Start Date:</Text>
            <Text style={styles.value}>{formatDate(bookingDetail.startDate)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>End Date:</Text>
            <Text style={styles.value}>{formatDate(bookingDetail.endDate)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Guests:</Text>
            <Text style={styles.value}>{bookingDetail.guests}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Total Price:</Text>
            <Text style={[styles.value, styles.priceText]}>
              ${parseFloat(bookingDetail.totalPrice || '0').toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{bookingDetail.contactEmail || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{bookingDetail.contactPhone || 'N/A'}</Text>
          </View>
        </View>

        {bookingDetail.guestNames && bookingDetail.guestNames.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Guest Names</Text>
            {bookingDetail.guestNames.map((name: string, index: number) => (
              <View key={index} style={styles.infoRow}>
                <Text style={styles.label}>Guest {index + 1}:</Text>
                <Text style={styles.value}>{name}</Text>
              </View>
            ))}
          </View>
        )}

        {bookingDetail.specialRequests && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Requests</Text>
            <Text style={styles.textContent}>{bookingDetail.specialRequests}</Text>
          </View>
        )}

        {bookingDetail.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.textContent}>{bookingDetail.notes}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Booked on:</Text>
            <Text style={styles.value}>{formatDate(bookingDetail.createdAt)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Last updated:</Text>
            <Text style={styles.value}>{formatDate(bookingDetail.updatedAt)}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back to Bookings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.text.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.status.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 5,
  },
  bookingId: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontFamily: 'monospace',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: Colors.text.white,
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    backgroundColor: Colors.background.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  label: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '400',
    flex: 2,
    textAlign: 'right',
  },
  priceText: {
    fontWeight: '600',
    color: Colors.primary,
    fontSize: 16,
  },
  textContent: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  backButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
});