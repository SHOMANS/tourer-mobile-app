import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import { useAppStore } from '../store/appStore';
import { Colors } from '../config/colors';
import {
  TourHeader,
  TourInfo,
  TourDetails,
  TourLocation,
  TourReviews,
  BookingBar,
} from '../components/TourDetail';

export default function TourDetailScreen({ route, navigation }: any) {
  const { packageId } = route.params;
  const {
    selectedPackage,
    packagesLoading,
    packagesError,
    fetchPackageById,
    reviews,
    reviewsLoading,
    reviewsError,
    reviewsPagination,
    fetchReviews,
    clearReviews,
    createReview,
    accessToken,
    user,
    logout,
  } = useAppStore();

  const [showFullscreenImage, setShowFullscreenImage] = useState(false);
  const [fullscreenImageUrl, setFullscreenImageUrl] = useState('');

  useEffect(() => {
    if (packageId) {
      fetchPackageById(packageId);
      fetchReviews(packageId, 1, 5); // Fetch first 5 reviews
    }
    return () => {
      clearReviews(); // Clear reviews when leaving the screen
    };
  }, [packageId]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleBookNow = () => {
    if (!selectedPackage) return;
    navigation.navigate('BookingScreen', { packageId: selectedPackage.id });
  };

  const handleImagePress = (imageUrl: string) => {
    setFullscreenImageUrl(imageUrl);
    setShowFullscreenImage(true);
  };

  const handleWriteReview = async (reviewData: any) => {
    try {
      await createReview(reviewData);

      // Refresh data to get the real review and updated counts
      await Promise.all([
        fetchReviews(packageId, 1, 5), // This will replace optimistic review with real one
        fetchPackageById(packageId) // Update review count
      ]);
    } catch (error) {
      // Re-fetch to remove any optimistic updates
      await Promise.all([
        fetchReviews(packageId, 1, 5),
        fetchPackageById(packageId)
      ]);
      throw error;
    }
  };

  const handleLoadMoreReviews = () => {
    if (reviewsPagination &&
      reviewsPagination.page < reviewsPagination.pages &&
      !reviewsLoading) {
      fetchReviews(packageId, reviewsPagination.page + 1, 5);
    }
  };

  // Create data structure for the main FlatList
  const getSections = () => {
    if (!selectedPackage) return [];

    return [
      { type: 'header', data: selectedPackage },
      { type: 'info', data: selectedPackage },
      { type: 'details', data: selectedPackage },
      { type: 'location', data: selectedPackage },
      { type: 'reviews', data: selectedPackage },
    ];
  };

  const renderSection = ({ item }: any) => {
    if (!selectedPackage) return null;

    switch (item.type) {
      case 'header':
        return (
          <TourHeader
            images={selectedPackage.images}
            onBackPress={handleBackPress}
          />
        );
      case 'info':
        return <TourInfo tourPackage={selectedPackage} />;
      case 'details':
        return <TourDetails tourPackage={selectedPackage} />;
      case 'location':
        return <TourLocation tourPackage={selectedPackage} />;
      case 'reviews':
        return (
          <TourReviews
            tourPackage={selectedPackage}
            reviews={reviews}
            reviewsLoading={reviewsLoading}
            reviewsError={reviewsError}
            reviewsPagination={reviewsPagination}
            user={user}
            accessToken={accessToken}
            onWriteReview={handleWriteReview}
            onLogin={logout}
            onImagePress={handleImagePress}
          />
        );
      default:
        return null;
    }
  };

  if (packagesLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading tour details...</Text>
        </View>
      </View>
    );
  }

  if (packagesError || !selectedPackage) {
    return (
      <View style={styles.container}>
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={getSections()}
        renderItem={renderSection}
        keyExtractor={(item, index) => `section-${item.type}-${index}`}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMoreReviews}
        onEndReachedThreshold={0.1}
        contentContainerStyle={styles.flatListContent}
      />

      <BookingBar
        tourPackage={selectedPackage!}
        onBookNow={handleBookNow}
      />

      {/* Fullscreen Image Modal */}
      <Modal
        visible={showFullscreenImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFullscreenImage(false)}
      >
        <View style={styles.fullscreenImageContainer}>
          <TouchableOpacity
            style={styles.fullscreenImageCloseArea}
            onPress={() => setShowFullscreenImage(false)}
            activeOpacity={1}
          >
            <Image
              source={{ uri: fullscreenImageUrl }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.fullscreenImageCloseButton}
              onPress={() => setShowFullscreenImage(false)}
            >
              <Text style={styles.fullscreenCloseText}>✕</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  flatListContent: {
    paddingBottom: 100, // Space for bottom bar
  },
  fullscreenImageContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImageCloseArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '90%',
    height: '70%',
  },
  fullscreenImageCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenCloseText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});