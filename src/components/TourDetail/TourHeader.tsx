import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Text,
} from 'react-native';
import { Colors } from '../../config/colors';

interface TourHeaderProps {
  images: string[];
  onBackPress: () => void;
}

export default function TourHeader({ images, onBackPress }: TourHeaderProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const renderImageItem = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity onPress={() => setSelectedImageIndex(index)}>
      <Image source={{ uri: item }} style={styles.thumbnailImage} />
    </TouchableOpacity>
  );

  return (
    <>
      {/* Main Image */}
      <View style={styles.imageContainer}>
        {images && images.length > 0 ? (
          <Image
            source={{ uri: images[selectedImageIndex] }}
            style={styles.mainImage}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>📷</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.backButton}
          onPress={onBackPress}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
      </View>

      {/* Thumbnails */}
      {images && images.length > 1 && (
        <FlatList
          horizontal
          data={images}
          renderItem={renderImageItem}
          keyExtractor={(item, index) => `thumb-${index}`}
          style={styles.thumbnailsList}
          contentContainerStyle={styles.thumbnailsContent}
          showsHorizontalScrollIndicator={false}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    height: 300,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    opacity: 0.5,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  thumbnailsList: {
    marginVertical: 10,
  },
  thumbnailsContent: {
    paddingHorizontal: 20,
  },
  thumbnailImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    resizeMode: 'cover',
  },
});