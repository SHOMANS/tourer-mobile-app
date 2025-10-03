import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../config/colors';
import { TourPackage } from '../../store/types';

interface BookingBarProps {
  tourPackage: TourPackage;
  onBookNow: () => void;
}

export default function BookingBar({ tourPackage, onBookNow }: BookingBarProps) {
  return (
    <View style={styles.bottomBar}>
      <View style={styles.bottomPriceContainer}>
        <Text style={styles.bottomPrice}>${tourPackage.price}</Text>
        <Text style={styles.bottomPriceLabel}>per person</Text>
      </View>

      <TouchableOpacity style={styles.bookButton} onPress={onBookNow}>
        <Text style={styles.bookButtonText}>Book Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bottomPriceContainer: {
    flex: 1,
  },
  bottomPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  bottomPriceLabel: {
    fontSize: 14,
    color: '#666',
  },
  bookButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});