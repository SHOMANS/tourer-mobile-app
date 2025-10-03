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
  Linking,
  Platform,
  Share,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppStore } from '../store/appStore';
import { Colors } from '../config/colors';

const { width } = Dimensions.get('window');

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
    accessToken,
    user,
    logout,
  } = useAppStore();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showFullscreenImage, setShowFullscreenImage] = useState(false);
  const [fullscreenImageUrl, setFullscreenImageUrl] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Helper function to check if current user has already reviewed this package
  const hasUserReviewed = () => {
    if (!user || !reviews.length) return false;
    return reviews.some(review => review.userId === user.id);
  };

  useEffect(() => {
    if (packageId) {
      fetchPackageById(packageId);
      fetchReviews(packageId, 1, 5); // Fetch first 5 reviews
    }
    return () => {
      clearReviews(); // Clear reviews when leaving the screen
    };
  }, [packageId]);

  if (packagesLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
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

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) {
      Alert.alert('Error', 'Please write a review comment');
      return;
    }

    setIsSubmittingReview(true);

    const reviewData = {
      packageId,
      rating: reviewRating,
      title: reviewTitle.trim() || undefined,
      comment: reviewComment.trim(),
      images: reviewImages,
    };

    try {
      const { createReview, addOptimisticReview, user } = useAppStore.getState();

      // Add optimistic review immediately for instant UI feedback
      if (user) {
        const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
        addOptimisticReview(reviewData, user.id, userName);
      }

      // Reset form and close modal immediately
      setReviewComment('');
      setReviewTitle('');
      setReviewRating(5);
      setReviewImages([]);
      setShowReviewModal(false);

      // Submit the review to backend
      await createReview(reviewData);

      // Add a small delay to ensure backend processing is complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // Refresh data to get the real review and updated counts
      await Promise.all([
        fetchReviews(packageId, 1, 5), // This will replace optimistic review with real one
        fetchPackageById(packageId) // Update review count
      ]);

      Alert.alert('Success', 'Your review has been submitted successfully!');
    } catch (error: any) {
      console.error('Review submission error:', error);

      // If submission failed, refresh to remove optimistic review
      await Promise.all([
        fetchReviews(packageId, 1, 5),
        fetchPackageById(packageId)
      ]);

      // Extract meaningful error message
      let errorMessage = 'Failed to submit review. Please try again.';

      if (error.message) {
        // Check for specific error types and provide user-friendly messages
        if (error.message.includes('already reviewed this package')) {
          errorMessage = 'You have already submitted a review for this tour. Each user can only review a tour once.';
        } else if (error.message.includes('Authentication required')) {
          errorMessage = 'Please log in to submit a review.';
        } else if (error.message.includes('Package not found')) {
          errorMessage = 'This tour is no longer available.';
        } else {
          // Use the backend error message if it's meaningful
          errorMessage = error.message;
        }
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleImagePress = (imageUrl: string) => {
    setFullscreenImageUrl(imageUrl);
    setShowFullscreenImage(true);
  };

  const pickImagesFromLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5 - reviewImages.length, // Limit to 5 total images
      });

      if (!result.canceled && result.assets) {
        // Upload images to backend first
        const uploadedImageUrls: string[] = [];

        for (const asset of result.assets) {
          // Here we would upload to the backend and get the URL
          // For now, we'll use the local URI
          uploadedImageUrls.push(asset.uri);
        }

        setReviewImages(prev => [...prev, ...uploadedImageUrls]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select images');
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        // Upload image to backend first
        const uploadedImageUrl = result.assets[0].uri; // For now, use local URI
        setReviewImages(prev => [...prev, uploadedImageUrl]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const removeReviewImage = (index: number) => {
    setReviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddImages = () => {
    Alert.alert(
      'Add Photos',
      'Choose how you want to add photos to your review',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImagesFromLibrary },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const renderStarRating = () => {
    return (
      <View style={styles.starRatingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setReviewRating(star)}
            style={[
              styles.starButton,
              star <= reviewRating ? styles.starButtonSelected : styles.starButtonUnselected
            ]}
          >
            <Text style={[
              styles.starText,
              star <= reviewRating ? styles.starTextSelected : styles.starTextUnselected
            ]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

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

  const renderReviewItem = ({ item }: { item: any }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewerName}>
          {item.user.firstName} {item.user.lastName}
        </Text>
        <View style={styles.reviewRating}>
          <Text style={styles.reviewStars}>
            {'⭐'.repeat(item.rating)}
          </Text>
        </View>
      </View>
      {item.title && (
        <Text style={styles.reviewTitle}>{item.title}</Text>
      )}
      {item.comment && (
        <Text style={styles.reviewComment}>{item.comment}</Text>
      )}
      {item.images && item.images.length > 0 && (
        <ScrollView
          horizontal
          style={styles.reviewImagesContainer}
          showsHorizontalScrollIndicator={false}
        >
          {item.images.map((imageUrl: string, index: number) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleImagePress(imageUrl)}
            >
              <Image
                source={{ uri: imageUrl }}
                style={styles.reviewImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      <Text style={styles.reviewDate}>
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>
      {item.isVerified && (
        <Text style={styles.verifiedBadge}>✓ Verified Purchase</Text>
      )}
    </View>
  );

  const handleBookNow = () => {
    navigation.navigate('BookingScreen', { packageId: selectedPackage.id });
  };

  // Create data structure for the main FlatList
  const getSections = () => {
    const sections = [
      { type: 'header', data: selectedPackage },
      { type: 'thumbnails', data: selectedPackage.images },
      { type: 'info', data: selectedPackage },
      { type: 'description', data: selectedPackage },
    ];

    if (selectedPackage.highlights && selectedPackage.highlights.length > 0) {
      sections.push({ type: 'highlights', data: selectedPackage.highlights });
    }

    if (selectedPackage.includes && selectedPackage.includes.length > 0) {
      sections.push({ type: 'includes', data: selectedPackage.includes });
    }

    if (selectedPackage.excludes && selectedPackage.excludes.length > 0) {
      sections.push({ type: 'excludes', data: selectedPackage.excludes });
    }

    sections.push({ type: 'location', data: selectedPackage });
    sections.push({ type: 'reviews', data: { reviews, reviewsPagination, reviewsLoading, reviewsError } as any });

    return sections;
  };

  const renderSection = ({ item }: any) => {
    switch (item.type) {
      case 'header':
        return (
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
        );

      case 'thumbnails':
        if (!selectedPackage.images || selectedPackage.images.length <= 1) return null;
        return (
          <FlatList
            horizontal
            data={selectedPackage.images}
            renderItem={renderImageItem}
            keyExtractor={(item, index) => `thumb-${index}`}
            style={styles.thumbnailsList}
            contentContainerStyle={styles.thumbnailsContent}
            showsHorizontalScrollIndicator={false}
          />
        );

      case 'info':
        return (
          <View style={styles.contentContainer}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{selectedPackage.title}</Text>
                <Text style={styles.location}>
                  📍 {selectedPackage.locationName}
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
          </View>
        );

      case 'description':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Tour</Text>
            <Text style={styles.description}>
              {selectedPackage.description || selectedPackage.shortDescription}
            </Text>
          </View>
        );

      case 'highlights':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Highlights</Text>
            {item.data.map((highlight: string, index: number) => (
              <View key={index} style={styles.highlightItem}>
                <Text style={styles.highlightBullet}>•</Text>
                <Text style={styles.highlightText}>{highlight}</Text>
              </View>
            ))}
          </View>
        );

      case 'includes':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What's Included</Text>
            {item.data.map((include: string, index: number) => (
              <View key={index} style={styles.includeItem}>
                <Text style={styles.includeIcon}>✓</Text>
                <Text style={styles.includeText}>{include}</Text>
              </View>
            ))}
          </View>
        );

      case 'excludes':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What's Not Included</Text>
            {item.data.map((exclude: string, index: number) => (
              <View key={index} style={styles.excludeItem}>
                <Text style={styles.excludeIcon}>✗</Text>
                <Text style={styles.excludeText}>{exclude}</Text>
              </View>
            ))}
          </View>
        );

      case 'location':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationInfo}>
              <Text style={styles.locationText}>📍 {selectedPackage.locationName}</Text>
              {selectedPackage.country && (
                <Text style={styles.countryText}>{selectedPackage.country}</Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => {
                const coords = selectedPackage.coordinates
                  ? JSON.parse(selectedPackage.coordinates)
                  : null;
                if (coords) {
                  const { lat, lng } = coords;
                  const url = Platform.OS === 'ios'
                    ? `http://maps.apple.com/?daddr=${lat},${lng}`
                    : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
                  Linking.openURL(url);
                }
              }}
            >
              <Text style={styles.mapButtonText}>📍 Open in Maps</Text>
            </TouchableOpacity>
          </View>
        );

      case 'reviews':
        return (
          <View style={styles.section}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>
                Reviews ({selectedPackage.reviewCount})
              </Text>
              <TouchableOpacity
                style={[
                  styles.writeReviewButton,
                  hasUserReviewed() && styles.writeReviewButtonDisabled
                ]}
                onPress={() => {
                  if (!accessToken) {
                    Alert.alert(
                      'Login Required',
                      'Please log in to write a review.',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Login', onPress: () => logout() }
                      ]
                    );
                    return;
                  }

                  if (hasUserReviewed()) {
                    Alert.alert(
                      'Review Already Submitted',
                      'You have already reviewed this tour. Each user can only submit one review per tour.',
                      [{ text: 'OK', style: 'default' }]
                    );
                    return;
                  }

                  setShowReviewModal(true);
                }}
              >
                <Text style={styles.writeReviewText}>
                  {hasUserReviewed() ? 'Review Submitted' : 'Write Review'}
                </Text>
              </TouchableOpacity>
            </View>

            {reviewsError ? (
              <Text style={styles.errorText}>{reviewsError}</Text>
            ) : item.data.reviews.length > 0 ? (
              <View>
                {item.data.reviews.map((review: any, index: number) => (
                  <View key={review.id}>
                    {renderReviewItem({ item: review })}
                    {index < item.data.reviews.length - 1 && <View style={styles.reviewSeparator} />}
                  </View>
                ))}
                {item.data.reviewsLoading && item.data.reviews.length > 0 && (
                  <View style={styles.loadingMoreContainer}>
                    <ActivityIndicator size="small" color={Colors.primary} />
                    <Text style={styles.loadingMoreText}>Loading more reviews...</Text>
                  </View>
                )}
              </View>
            ) : item.data.reviewsLoading ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={styles.noReviewsText}>No reviews yet. Be the first to review!</Text>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  const handleLoadMoreReviews = () => {
    if (reviewsPagination &&
      reviewsPagination.page < reviewsPagination.pages &&
      !reviewsLoading) {
      fetchReviews(packageId, reviewsPagination.page + 1, 5);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={getSections()}
        renderItem={renderSection}
        keyExtractor={(item, index) => `section-${item.type}-${index}`}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMoreReviews}
        onEndReachedThreshold={0.1}
        contentContainerStyle={styles.flatListContent}
      />

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

      {/* Write Review Modal */}
      <Modal
        visible={showReviewModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboardView}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setShowReviewModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Write a Review</Text>
              <View style={styles.modalHeaderPlaceholder} />
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Rating</Text>
                {renderStarRating()}
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Title (optional)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Give your review a title"
                  value={reviewTitle}
                  onChangeText={setReviewTitle}
                  maxLength={100}
                />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Review</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  placeholder="Share your experience with this tour..."
                  value={reviewComment}
                  onChangeText={setReviewComment}
                  multiline
                  numberOfLines={4}
                  maxLength={1000}
                />
                <Text style={styles.characterCount}>
                  {reviewComment.length}/1000 characters
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Photos (optional)</Text>
                <TouchableOpacity
                  style={styles.addPhotosButton}
                  onPress={handleAddImages}
                >
                  <Ionicons name="camera" size={20} color="#666" />
                  <Text style={styles.addPhotosText}>Add Photos ({reviewImages.length}/5)</Text>
                </TouchableOpacity>

                {reviewImages.length > 0 && (
                  <ScrollView
                    horizontal
                    style={styles.selectedImagesContainer}
                    showsHorizontalScrollIndicator={false}
                  >
                    {reviewImages.map((imageUri, index) => (
                      <View key={index} style={styles.selectedImageWrapper}>
                        <Image
                          source={{ uri: imageUri }}
                          style={styles.selectedImage}
                        />
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() => removeReviewImage(index)}
                        >
                          <Ionicons name="close-circle" size={20} color="#FF6B6B" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.submitReviewButton,
                  (!reviewComment.trim() || isSubmittingReview) && styles.submitReviewButtonDisabled
                ]}
                onPress={handleSubmitReview}
                disabled={!reviewComment.trim() || isSubmittingReview}
              >
                {isSubmittingReview ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.submitReviewButtonText}>Submit Review</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

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
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </Modal>
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
    color: Colors.primary,
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
    backgroundColor: Colors.primary,
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
    paddingHorizontal: 16,
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
    color: Colors.primary,
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
    color: Colors.primary,
    marginRight: 8,
  },
  bottomPriceLabel: {
    fontSize: 14,
    color: '#666',
  },
  bookButton: {
    backgroundColor: Colors.primary,
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
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Location styles
  locationInfo: {
    marginBottom: 12,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  countryText: {
    fontSize: 14,
    color: '#666',
  },
  mapButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  mapButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Review styles
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  writeReviewButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  writeReviewButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  writeReviewText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewItem: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewStars: {
    fontSize: 14,
  },
  reviewComment: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  verifiedBadge: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  reviewSeparator: {
    height: 12,
  },
  noReviewsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  viewAllReviewsButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
  },
  viewAllReviewsText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  reviewsContainer: {
    maxHeight: 400, // Limit height to make it scrollable
  },
  reviewsList: {
    flexGrow: 0, // Prevent FlatList from expanding
  },
  loadingMoreContainer: {
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loadingMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  flatListContent: {
    paddingBottom: 100, // Add padding for the bottom bar
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalKeyboardView: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalHeaderPlaceholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  starRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  starButton: {
    padding: 4,
    marginHorizontal: 2,
  },
  starButtonSelected: {
    borderRadius: 8,
    transform: [{ scale: 1.1 }],
  },
  starButtonUnselected: {
    backgroundColor: 'transparent',
  },
  starText: {
    fontSize: 32,
  },
  starTextSelected: {
    color: '#FFD700',
  },
  starTextUnselected: {
    color: '#DDD',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  modalTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  submitReviewButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitReviewButtonDisabled: {
    backgroundColor: '#CCC',
  },
  submitReviewButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Review image styles
  reviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  reviewImagesContainer: {
    marginVertical: 8,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  // Modal image picker styles
  addPhotosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    borderStyle: 'dashed',
    marginVertical: 8,
  },
  addPhotosText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  selectedImagesContainer: {
    marginTop: 12,
  },
  selectedImageWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  // Fullscreen image modal styles
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
    width: width,
    height: '80%',
  },
  fullscreenImageCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
});