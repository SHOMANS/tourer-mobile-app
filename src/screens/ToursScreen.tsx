import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAppStore } from '../store/appStore';

interface TourPackage {
  id: string;
  title: string;
  shortDescription?: string;
  price: string;
  originalPrice?: string;
  currency: string;
  duration: number;
  difficulty: string;
  category: string;
  locationName: string;
  country?: string;
  coverImage?: string;
  rating?: number;
  reviewCount: number;
}

export default function ToursScreen({ navigation }: any) {
  const {
    packages,
    categories,
    packagesLoading,
    loadingMore,
    packagesError,
    pagination,
    fetchPackages,
    loadMorePackages,
    fetchCategories,
    searchPackages,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    fetchPackages({ page: 1 });
    fetchCategories();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      searchPackages(query);
    } else {
      fetchPackages({ category: selectedCategory || undefined, page: 1 });
    }
  };

  const handleCategoryFilter = (category: string) => {
    const newCategory = category === selectedCategory ? '' : category;
    setSelectedCategory(newCategory);
    fetchPackages({
      category: newCategory || undefined,
      search: searchQuery || undefined,
      page: 1
    });
  };

  const handlePackagePress = (packageItem: TourPackage) => {
    navigation.navigate('TourDetail', { packageId: packageItem.id });
  };

  const handleLoadMore = () => {
    if (pagination && pagination.page < pagination.pages && !loadingMore) {
      loadMorePackages();
    }
  };

  const renderFooter = () => {
    if (!pagination || pagination.page >= pagination.pages) {
      return (
        <View style={styles.footerContainer}>
          <Text style={styles.endText}>You've seen all tours! 🎉</Text>
        </View>
      );
    }

    return (
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={[styles.loadMoreButton, loadingMore && styles.loadMoreButtonDisabled]}
          onPress={handleLoadMore}
          disabled={loadingMore}
        >
          {loadingMore ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.loadMoreText}>
              Load More Tours ({pagination.total - packages.length} remaining)
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderPackageCard = ({ item }: { item: TourPackage }) => (
    <TouchableOpacity
      style={styles.packageCard}
      onPress={() => handlePackagePress(item)}
    >
      {item.coverImage ? (
        <Image source={{ uri: item.coverImage }} style={styles.packageImage} />
      ) : (
        <View style={styles.placeholderImage}>
          <Text style={styles.placeholderText}>📷</Text>
        </View>
      )}

      <View style={styles.packageInfo}>
        <Text style={styles.packageTitle}>{item.title}</Text>
        <Text style={styles.packageDescription} numberOfLines={2}>
          {item.shortDescription || 'Exciting tour package'}
        </Text>

        <View style={styles.packageMeta}>
          <Text style={styles.location}>📍 {item.locationName}</Text>
          <Text style={styles.duration}>⏱️ {item.duration} days</Text>
        </View>

        <View style={styles.packageFooter}>
          <View style={styles.priceContainer}>
            {item.originalPrice && (
              <Text style={styles.originalPrice}>${item.originalPrice}</Text>
            )}
            <Text style={styles.price}>${item.price}</Text>
            <Text style={styles.currency}>/{item.currency}</Text>
          </View>

          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {item.rating?.toFixed(1) || 'N/A'}</Text>
            <Text style={styles.reviewCount}>({item.reviewCount})</Text>
          </View>
        </View>

        <View style={styles.tags}>
          <Text style={styles.categoryTag}>{item.category}</Text>
          <Text style={styles.difficultyTag}>{item.difficulty}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryFilter = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item && styles.categoryButtonActive,
      ]}
      onPress={() => handleCategoryFilter(item)}
    >
      <Text
        style={[
          styles.categoryButtonText,
          selectedCategory === item && styles.categoryButtonTextActive,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  if (packagesError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {packagesError}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchPackages({ page: 1 })}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search tours..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#999"
          />
        </View>

        {/* Category Filters */}
        <FlatList
          horizontal
          data={categories}
          renderItem={renderCategoryFilter}
          keyExtractor={(item) => item}
          style={styles.categoriesList}
          contentContainerStyle={styles.categoriesContent}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {packagesLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading tours...</Text>
        </View>
      ) : (
        <FlatList
          data={packages}
          renderItem={renderPackageCard}
          keyExtractor={(item) => item.id}
          style={styles.packagesList}
          contentContainerStyle={styles.packagesContent}
          onRefresh={() => fetchPackages({
            category: selectedCategory || undefined,
            search: searchQuery || undefined,
            page: 1
          })}
          refreshing={false}
          ListFooterComponent={packages.length > 0 ? renderFooter : null}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
          }}
          removeClippedSubviews={false}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10}
        />
      )}

      {pagination && packages.length > 0 && (
        <View style={styles.paginationInfo}>
          <Text style={styles.paginationText}>
            Showing {packages.length} of {pagination.total} tours • Page {pagination.page} of {pagination.pages}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 16,
    marginTop: 8,
  },
  searchInput: {
    height: 40,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  categoriesList: {
    marginBottom: 8,
  },
  categoriesContent: {
    paddingRight: 16,
  },
  categoryButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  packagesList: {
    flex: 1,
  },
  packagesContent: {
    padding: 16,
  },
  packageCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  packageImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 40,
    opacity: 0.5,
  },
  packageInfo: {
    padding: 16,
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  packageDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  packageMeta: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginRight: 16,
  },
  duration: {
    fontSize: 14,
    color: '#666',
  },
  packageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  currency: {
    fontSize: 14,
    color: '#666',
    marginLeft: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: '#333',
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#999',
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryTag: {
    backgroundColor: '#007AFF',
    color: 'white',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  difficultyTag: {
    backgroundColor: '#FF9500',
    color: 'white',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
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
  paginationInfo: {
    backgroundColor: 'white',
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  paginationText: {
    fontSize: 14,
    color: '#666',
  },
  footerContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadMoreButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  loadMoreButtonDisabled: {
    backgroundColor: '#99c9ff',
  },
  loadMoreText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  endText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
});