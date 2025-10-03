import React, { useEffect, useState } from 'react';
import { FlatList, View, Text } from 'react-native';
import { useAppStore } from '../store/appStore';
import { TourPackage } from '../types';
import {
  ScreenContainer,
  LoadingState,
  ErrorState,
  EmptyState,
  TourCard,
  SearchBar,
  CategoryFilter,
  Button,
} from '../components';

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
    fetchPackages();
    fetchCategories();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchPackages(searchQuery);
    } else {
      fetchPackages({ category: selectedCategory || undefined });
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    if (searchQuery.trim()) {
      // For search with category, we need to fetch with filters
      fetchPackages({ search: searchQuery, category: category || undefined });
    } else {
      fetchPackages({ category: category || undefined });
    }
  };

  const handleTourPress = (tour: TourPackage) => {
    navigation.navigate('TourDetail', { packageId: tour.id });
  };

  const handleLoadMore = () => {
    if (pagination && pagination.page < pagination.pages && !loadingMore) {
      loadMorePackages();
    }
  };

  const renderTourItem = ({ item }: { item: TourPackage }) => (
    <TourCard tour={item} onPress={() => handleTourPress(item)} />
  );

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={{ padding: 20 }}>
          <LoadingState message="Loading more tours..." size="small" />
        </View>
      );
    }

    if (pagination && pagination.page < pagination.pages) {
      return (
        <View style={{ padding: 20 }}>
          <Button
            title="Load More"
            onPress={handleLoadMore}
            variant="outline"
          />
        </View>
      );
    }

    if (packages.length > 0) {
      return (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: '#666', fontStyle: 'italic' }}>
            You've seen all tours! 🎉
          </Text>
        </View>
      );
    }

    return null;
  };

  // Show loading state on initial load
  if (packagesLoading && packages.length === 0) {
    return (
      <ScreenContainer>
        <LoadingState message="Loading tours..." />
      </ScreenContainer>
    );
  }

  // Show error state
  if (packagesError && packages.length === 0) {
    return (
      <ScreenContainer>
        <ErrorState
          title="Unable to load tours"
          message={packagesError}
          onRetry={() => fetchPackages()}
        />
      </ScreenContainer>
    );
  }

  // Show empty state
  if (!packagesLoading && packages.length === 0) {
    return (
      <ScreenContainer>
        <EmptyState
          title="No Tours Found"
          message={
            searchQuery || selectedCategory
              ? "No tours match your search criteria. Try adjusting your filters."
              : "No tours are currently available. Please check back later."
          }
          actionText={searchQuery || selectedCategory ? "Clear Filters" : undefined}
          onAction={
            searchQuery || selectedCategory
              ? () => {
                setSearchQuery('');
                setSelectedCategory('');
                fetchPackages();
              }
              : undefined
          }
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={{ flex: 1, padding: 20 }}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search tours..."
          onSearch={handleSearch}
        />

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />

        <FlatList
          data={packages}
          renderItem={renderTourItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshing={packagesLoading && packages.length > 0}
          onRefresh={() => {
            setSearchQuery('');
            setSelectedCategory('');
            fetchPackages();
          }}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
        />
      </View>
    </ScreenContainer>
  );
}