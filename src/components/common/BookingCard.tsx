import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../config/colors';
import { Booking } from '../../types';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';

interface BookingCardProps {
  booking: Booking;
  onPress: () => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, onPress }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'CONFIRMED':
        return 'Confirmed';
      case 'CANCELLED':
        return 'Cancelled';
      case 'COMPLETED':
        return 'Completed';
      default:
        return status;
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.packageTitle} numberOfLines={2}>
            {booking.package?.title || 'Unknown Package'}
          </Text>
          <StatusBadge status={getStatusText(booking.status)} />
        </View>

        <View style={styles.content}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Start Date:</Text>
            <Text style={styles.value}>{formatDate(booking.startDate)}</Text>
          </View>

          {booking.endDate && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>End Date:</Text>
              <Text style={styles.value}>{formatDate(booking.endDate)}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.label}>Duration:</Text>
            <Text style={styles.value}>{booking.package?.duration || 'N/A'} days</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Guests:</Text>
            <Text style={styles.value}>{booking.guests}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Total:</Text>
            <Text style={styles.price}>
              ${parseFloat(booking.totalPrice || '0').toFixed(2)}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
    marginRight: 12,
  },
  content: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '400',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
});