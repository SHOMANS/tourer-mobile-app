import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../config/colors';
import { TourPackage } from '../../store/types';

interface TourInfoProps {
  tourPackage: TourPackage;
}

export default function TourInfo({ tourPackage }: TourInfoProps) {
  return (
    <View style={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{tourPackage.title}</Text>
          <Text style={styles.location}>
            📍 {tourPackage.locationName}
            {tourPackage.country && `, ${tourPackage.country}`}
          </Text>
        </View>

        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>
            ⭐ {tourPackage.rating?.toFixed(1) || 'N/A'}
          </Text>
          <Text style={styles.reviewCount}>
            ({tourPackage.reviewCount} reviews)
          </Text>
        </View>
      </View>

      {/* Price and Tags */}
      <View style={styles.priceSection}>
        <View style={styles.priceContainer}>
          {tourPackage.originalPrice && (
            <Text style={styles.originalPrice}>
              ${tourPackage.originalPrice}
            </Text>
          )}
          <Text style={styles.price}>${tourPackage.price}</Text>
          <Text style={styles.priceLabel}>per person</Text>
        </View>

        <View style={styles.tags}>
          <Text style={styles.categoryTag}>{tourPackage.category}</Text>
          <Text style={styles.difficultyTag}>{tourPackage.difficulty}</Text>
        </View>
      </View>

      {/* Quick Info */}
      <View style={styles.quickInfo}>
        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>⏱️</Text>
          <Text style={styles.infoLabel}>Duration</Text>
          <Text style={styles.infoValue}>{tourPackage.duration} days</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>👥</Text>
          <Text style={styles.infoLabel}>Max Guests</Text>
          <Text style={styles.infoValue}>{tourPackage.maxGuests}</Text>
        </View>

        {tourPackage.minAge && (
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>🎂</Text>
            <Text style={styles.infoLabel}>Min Age</Text>
            <Text style={styles.infoValue}>{tourPackage.minAge}+</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  header: {
    marginBottom: 16,
  },
  titleContainer: {
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  tags: {
    alignItems: 'flex-end',
    gap: 4,
  },
  categoryTag: {
    backgroundColor: Colors.primary,
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 12,
    fontWeight: '600',
  },
  difficultyTag: {
    backgroundColor: '#f0f0f0',
    color: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 12,
    fontWeight: '600',
  },
  quickInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingVertical: 16,
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});