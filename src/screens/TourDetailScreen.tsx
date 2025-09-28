import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import { useAppStore } from '../store/appStore';

const { width } = Dimensions.get('window');

export default function TourDetailScreen({ route, navigation }: any) {
  const { packageId } = route.params;
  const {
    selectedPackage,
    packagesLoading,
    packagesError,
    fetchPackageById,
  } = useAppStore();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (packageId) {
      fetchPackageById(packageId);
    }
  }, [packageId]);

  if (packagesLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading tour details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (packagesError || !selectedPackage) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {packagesError || 'Tour not found'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderImageItem = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity onPress={() => setSelectedImageIndex(index)}>
      <Image source={{ uri: item }} style={styles.thumbnailImage} />
    </TouchableOpacity>
  );

  const renderHighlightItem = ({ item }: { item: string }) => (
    <View style={styles.highlightItem}>
      <Text style={styles.highlightBullet}>•</Text>
      <Text style={styles.highlightText}>{item}</Text>
    </View>
  );

  const renderIncludeItem = ({ item }: { item: string }) => (
    <View style={styles.includeItem}>
      <Text style={styles.includeIcon}>✓</Text>
      <Text style={styles.includeText}>{item}</Text>
    </View>
  );

  const renderExcludeItem = ({ item }: { item: string }) => (
    <View style={styles.excludeItem}>
      <Text style={styles.excludeIcon}>✗</Text>
      <Text style={styles.excludeText}>{item}</Text>
    </View>
  );

  const handleBookNow = () => {
    // TODO: Navigate to booking screen
    console.log('Booking tour:', selectedPackage.id);
    // navigation.navigate('BookingScreen', { packageId: selectedPackage.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Main Image */}
        <View style={styles.imageContainer}>
          {selectedPackage.images && selectedPackage.images.length > 0 ? (
            <Image
              source={{ uri: selectedPackage.images[selectedImageIndex] }}
              style={styles.mainImage}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>📷</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        </View>

        {/* Image Thumbnails */}
        {selectedPackage.images && selectedPackage.images.length > 1 && (
          <FlatList
            horizontal
            data={selectedPackage.images}
            renderItem={renderImageItem}
            keyExtractor={(item, index) => index.toString()}
            style={styles.thumbnailsList}
            contentContainerStyle={styles.thumbnailsContent}
            showsHorizontalScrollIndicator={false}
          />
        )}

        {/* Tour Info */}
        <View style={styles.contentContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{selectedPackage.title}</Text>
              <Text style={styles.location}>
                📍 {selectedPackage.location}
                {selectedPackage.country && `, ${selectedPackage.country}`}
              </Text>
            </View>

            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>
                ⭐ {selectedPackage.rating?.toFixed(1) || 'N/A'}
              </Text>
              <Text style={styles.reviewCount}>
                ({selectedPackage.reviewCount} reviews)
              </Text>
            </View>
          </View>

          {/* Price and Tags */}
          <View style={styles.priceSection}>
            <View style={styles.priceContainer}>
              {selectedPackage.originalPrice && (
                <Text style={styles.originalPrice}>
                  ${selectedPackage.originalPrice}
                </Text>
              )}
              <Text style={styles.price}>${selectedPackage.price}</Text>
              <Text style={styles.priceLabel}>per person</Text>
            </View>

            <View style={styles.tags}>
              <Text style={styles.categoryTag}>{selectedPackage.category}</Text>
              <Text style={styles.difficultyTag}>{selectedPackage.difficulty}</Text>
            </View>
          </View>

          {/* Quick Info */}
          <View style={styles.quickInfo}>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>⏱️</Text>
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>{selectedPackage.duration} days</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>👥</Text>
              <Text style={styles.infoLabel}>Max Guests</Text>
              <Text style={styles.infoValue}>{selectedPackage.maxGuests}</Text>
            </View>

            {selectedPackage.minAge && (
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>🎂</Text>
                <Text style={styles.infoLabel}>Min Age</Text>
                <Text style={styles.infoValue}>{selectedPackage.minAge}+</Text>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Tour</Text>
            <Text style={styles.description}>
              {selectedPackage.description || selectedPackage.shortDescription}
            </Text>
          </View>

          {/* Highlights */}
          {selectedPackage.highlights && selectedPackage.highlights.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Highlights</Text>
              <FlatList
                data={selectedPackage.highlights}
                renderItem={renderHighlightItem}
                keyExtractor={(item, index) => index.toString()}
                scrollEnabled={false}
              />
            </View>
          )}

          {/* What's Included */}
          {selectedPackage.includes && selectedPackage.includes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What's Included</Text>
              <FlatList
                data={selectedPackage.includes}
                renderItem={renderIncludeItem}
                keyExtractor={(item, index) => index.toString()}
                scrollEnabled={false}
              />
            </View>
          )}

          {/* What's Not Included */}
          {selectedPackage.excludes && selectedPackage.excludes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What's Not Included</Text>
              <FlatList
                data={selectedPackage.excludes}
                renderItem={renderExcludeItem}
                keyExtractor={(item, index) => index.toString()}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceContainer}>
          <Text style={styles.bottomPrice}>${selectedPackage.price}</Text>
          <Text style={styles.bottomPriceLabel}>per person</Text>
        </View>

        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  mainImage: {
    width: width,
    height: 300,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: width,
    height: 300,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 60,
    opacity: 0.5,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  thumbnailsList: {
    backgroundColor: 'white',
  },
  thumbnailsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  thumbnailImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    resizeMode: 'cover',
  },
  contentContainer: {
    padding: 16,
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
  },
  rating: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: '#999',
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryTag: {
    backgroundColor: '#007AFF',
    color: 'white',
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
  },
  difficultyTag: {
    backgroundColor: '#FF9500',
    color: 'white',
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
  },
  quickInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
  },
  infoItem: {
    alignItems: 'center',
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  highlightBullet: {
    fontSize: 16,
    color: '#007AFF',
    marginRight: 12,
    marginTop: 2,
  },
  highlightText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    lineHeight: 22,
  },
  includeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  includeIcon: {
    fontSize: 16,
    color: '#34C759',
    marginRight: 12,
    marginTop: 2,
  },
  includeText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    lineHeight: 22,
  },
  excludeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  excludeIcon: {
    fontSize: 16,
    color: '#FF3B30',
    marginRight: 12,
    marginTop: 2,
  },
  excludeText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    lineHeight: 22,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  bottomPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 8,
  },
  bottomPriceLabel: {
    fontSize: 14,
    color: '#666',
  },
  bookButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});