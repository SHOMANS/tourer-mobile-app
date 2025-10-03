import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../config/colors';
import { TourPackage } from '../../types';

interface TourCardProps {
  tour: TourPackage;
  onPress: () => void;
}

export const TourCard: React.FC<TourCardProps> = ({ tour, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {tour.coverImage ? (
        <Image source={{ uri: tour.coverImage }} style={styles.image} />
      ) : (
        <View style={styles.placeholderImage}>
          <Text style={styles.placeholderText}>No Image</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {tour.title}
        </Text>

        {tour.shortDescription && (
          <Text style={styles.description} numberOfLines={2}>
            {tour.shortDescription}
          </Text>
        )}

        <View style={styles.details}>
          <Text style={styles.location}>{tour.locationName}</Text>
          <Text style={styles.duration}>{tour.duration} days</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            {tour.originalPrice && tour.originalPrice !== tour.price && (
              <Text style={styles.originalPrice}>${tour.originalPrice}</Text>
            )}
            <Text style={styles.price}>${tour.price}</Text>
          </View>

          {tour.rating && (
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>⭐ {tour.rating.toFixed(1)}</Text>
              <Text style={styles.reviewCount}>({tour.reviewCount})</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: Colors.text.secondary,
    fontSize: 16,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  location: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  duration: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: 14,
    color: Colors.text.secondary,
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: Colors.text.primary,
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
});