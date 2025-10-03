import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../config/colors';
import { Review, TourPackage, User } from '../../store/types';

interface TourReviewsProps {
  tourPackage: TourPackage;
  reviews: Review[];
  reviewsLoading: boolean;
  reviewsError: string | null;
  reviewsPagination: any;
  user: User | null;
  accessToken: string | null;
  onWriteReview: (reviewData: any) => Promise<void>;
  onLogin: () => void;
  onImagePress: (imageUrl: string) => void;
}

export default function TourReviews({
  tourPackage,
  reviews,
  reviewsLoading,
  reviewsError,
  reviewsPagination,
  user,
  accessToken,
  onWriteReview,
  onLogin,
  onImagePress,
}: TourReviewsProps) {
  const [showReviewModal, setShowReviewModal] = useState(false);
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

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) {
      Alert.alert('Error', 'Please write a review comment');
      return;
    }

    setIsSubmittingReview(true);

    const reviewData = {
      packageId: tourPackage.id,
      rating: reviewRating,
      title: reviewTitle.trim() || undefined,
      comment: reviewComment.trim(),
      images: reviewImages,
    };

    try {
      await onWriteReview(reviewData);

      // Reset form and close modal
      setReviewComment('');
      setReviewTitle('');
      setReviewRating(5);
      setReviewImages([]);
      setShowReviewModal(false);

      Alert.alert('Success', 'Your review has been submitted successfully!');
    } catch (error: any) {
      console.error('Review submission error:', error);
      Alert.alert('Error', error.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const pickImagesFromLibrary = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant photo library access to add images');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5 - reviewImages.length,
      });

      if (!result.canceled && result.assets) {
        const uploadedImageUrls = result.assets.map(asset => asset.uri);
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
        const uploadedImageUrl = result.assets[0].uri;
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

  const renderReviewItem = (review: Review) => (
    <View key={review.id} style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewerName}>
          {review.user.firstName} {review.user.lastName}
        </Text>
        <View style={styles.reviewRating}>
          <Text style={styles.reviewStars}>
            {'⭐'.repeat(review.rating)}
          </Text>
        </View>
      </View>
      {review.title && (
        <Text style={styles.reviewTitle}>{review.title}</Text>
      )}
      {review.comment && (
        <Text style={styles.reviewComment}>{review.comment}</Text>
      )}
      {review.images && review.images.length > 0 && (
        <ScrollView
          horizontal
          style={styles.reviewImagesContainer}
          showsHorizontalScrollIndicator={false}
        >
          {review.images.map((imageUrl: string, index: number) => (
            <TouchableOpacity
              key={index}
              onPress={() => onImagePress(imageUrl)}
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
        {new Date(review.createdAt).toLocaleDateString()}
      </Text>
      {review.isVerified && (
        <Text style={styles.verifiedBadge}>✓ Verified Purchase</Text>
      )}
    </View>
  );

  return (
    <>
      <View style={styles.section}>
        <View style={styles.reviewsHeader}>
          <Text style={styles.sectionTitle}>
            Reviews ({tourPackage.reviewCount})
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
                    { text: 'Login', onPress: onLogin }
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
        ) : reviews.length > 0 ? (
          <View>
            {reviews.map((review, index) => (
              <View key={review.id}>
                {renderReviewItem(review)}
                {index < reviews.length - 1 && <View style={styles.reviewSeparator} />}
              </View>
            ))}
            {reviewsLoading && reviews.length > 0 && (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.loadingMoreText}>Loading more reviews...</Text>
              </View>
            )}
          </View>
        ) : reviewsLoading ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <Text style={styles.noReviewsText}>No reviews yet. Be the first to review!</Text>
        )}
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
                <Text style={{ fontSize: 20, color: '#333' }}>✕</Text>
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
                  <Text style={{ fontSize: 16, color: '#666' }}>📷</Text>
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
                          <Text style={{ fontSize: 16, color: '#FF6B6B', backgroundColor: 'white', borderRadius: 10, padding: 2 }}>✕</Text>
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
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  writeReviewButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  writeReviewButtonDisabled: {
    backgroundColor: '#ccc',
  },
  writeReviewText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#f44336',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  noReviewsText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  reviewItem: {
    paddingVertical: 16,
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
    alignItems: 'center',
  },
  reviewStars: {
    fontSize: 14,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  reviewComment: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666',
    marginBottom: 8,
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
  reviewDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  verifiedBadge: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 4,
  },
  reviewSeparator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingMoreText: {
    color: '#666',
    fontSize: 14,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalHeaderPlaceholder: {
    width: 32,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalSection: {
    marginVertical: 16,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  starRatingContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  starButtonSelected: {
    // Selected star styling handled in text
  },
  starButtonUnselected: {
    // Unselected star styling handled in text
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
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
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
  addPhotosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 20,
    gap: 8,
  },
  addPhotosText: {
    fontSize: 16,
    color: '#666',
  },
  selectedImagesContainer: {
    marginTop: 12,
  },
  selectedImageWrapper: {
    position: 'relative',
    marginRight: 8,
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  submitReviewButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitReviewButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitReviewButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});