import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Dimensions,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/appStore';
import { Colors } from '../config/colors';

const { width } = Dimensions.get('window');

interface CarouselItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  actionType: 'INTERNAL' | 'EXTERNAL';
  actionValue: string;
  isActive: boolean;
  sortOrder: number;
}

export default function MainScreen({ navigation }: any) {
  const {
    user,
    logout,
    fetchHealthStatus,
    healthData,
    loading,
    error,
    popularPackages,
    fetchPopularPackages,
    packagesLoading
  } = useAppStore();

  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [carouselLoading, setCarouselLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetchHealthStatus();
    fetchPopularPackages();
    fetchCarouselItems();
  }, [fetchHealthStatus, fetchPopularPackages]);

  const fetchCarouselItems = async () => {
    try {
      setCarouselLoading(true);
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3002'}/carousel`);

      if (response.ok) {
        const data = await response.json();
        setCarouselItems(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching carousel items:', error);
    } finally {
      setCarouselLoading(false);
    }
  };

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCarouselIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % carouselItems.length;
        scrollViewRef.current?.scrollTo({ x: nextIndex * width, animated: true });
        return nextIndex;
      });
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            Alert.alert('Success', 'Logged out successfully');
          },
        },
      ]
    );
  };

  const handleCarouselItemPress = (item: CarouselItem) => {
    if (item.actionType === 'INTERNAL') {
      navigation.navigate(item.actionValue);
    } else if (item.actionType === 'EXTERNAL') {
      Linking.openURL(item.actionValue);
    }
  };

  const onCarouselScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / width);
    setCurrentCarouselIndex(index);
  };

  const navigateToTours = () => {
    navigation.navigate('Tours');
  };

  const navigateToTourDetail = (tourId: string) => {
    navigation.navigate('TourDetail', { tourId });
  };

  if (loading && !healthData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Advertisement Carousel Section - Top of page */}
      {carouselLoading ? (
        <View style={[styles.carouselContainer, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={styles.loadingText}>Loading offers...</Text>
        </View>
      ) : (
        <View style={styles.carouselContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onCarouselScroll}
            scrollEventThrottle={16}
          >
            {carouselItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleCarouselItemPress(item)}
                style={styles.carouselItem}
              >
                <Image
                  source={{
                    uri: item.imageUrl.startsWith('http')
                      ? item.imageUrl
                      : `${process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3006'}${item.imageUrl}`
                  }}
                  style={styles.carouselImage}
                  resizeMode="cover"
                />
                <View style={styles.carouselOverlay}>
                  <Text style={styles.carouselTitle}>{item.title}</Text>
                  {item.description && (
                    <Text style={styles.carouselSubtitle}>{item.description}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Carousel Indicators */}
          <View style={styles.indicatorsContainer}>
            {carouselItems.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentCarouselIndex && styles.activeIndicator,
                ]}
              />
            ))}
          </View>
        </View>
      )}

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Content */}
        <View style={styles.content}>
          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity style={styles.quickActionCard} onPress={navigateToTours}>
                <Text style={styles.quickActionTitle}>Browse Tours</Text>
                <Text style={styles.quickActionSubtitle}>Discover amazing destinations</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate('Profile')}>
                <Text style={styles.quickActionTitle}>My Profile</Text>
                <Text style={styles.quickActionSubtitle}>Manage your account</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Popular Packages */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Tours</Text>
              <TouchableOpacity onPress={navigateToTours} style={styles.browseAllButton}>
                <Text style={styles.browseAllText}>Browse All</Text>
              </TouchableOpacity>
            </View>
            {packagesLoading ? (
              <Text style={styles.loadingText}>Loading tours...</Text>
            ) : popularPackages.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {popularPackages.slice(0, 5).map((pkg) => (
                  <TouchableOpacity
                    key={pkg.id}
                    style={styles.packageCard}
                    onPress={() => navigateToTourDetail(pkg.id)}
                  >
                    {pkg.coverImage ? (
                      <Image
                        source={{ uri: pkg.coverImage }}
                        style={styles.packageImage}
                      />
                    ) : (
                      <View style={styles.packageImagePlaceholder}>
                        <Text style={styles.packageImagePlaceholderText}>No Image</Text>
                      </View>
                    )}
                    <Text style={styles.packageTitle} numberOfLines={2}>
                      {pkg.title}
                    </Text>
                    <Text style={styles.packageLocation}>{pkg.location}</Text>
                    <Text style={styles.packagePrice}>${pkg.price}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.emptyText}>No tours available</Text>
            )}
          </View>

          {/* App Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Status</Text>
            <View style={styles.statusCard}>
              {error ? (
                <Text style={styles.errorText}>Error: {error}</Text>
              ) : healthData ? (
                <>
                  <Text style={styles.statusText}>Status: {healthData.status}</Text>
                  <Text style={styles.statusText}>Version: {healthData.version}</Text>
                  <Text style={styles.statusText}>Last Updated: {new Date(healthData.timestamp).toLocaleString()}</Text>
                </>
              ) : (
                <Text style={styles.statusText}>Loading status...</Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  carouselContainer: {
    height: 250,
    marginBottom: 0,
    marginTop: 0,
  },
  carouselItem: {
    width: width,
    height: 250,
    position: 'relative',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  carouselOverlay: {
    position: 'absolute',
    bottom: 0,
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 25,
    paddingTop: 100,
    paddingBottom: 30,
  },
  carouselTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  carouselSubtitle: {
    color: '#fff',
    fontSize: 16,
    marginTop: 8,
    opacity: 0.95,
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  indicatorsContainer: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
    marginHorizontal: 5,
  },
  activeIndicator: {
    backgroundColor: '#fff',
    width: 12,
    height: 8,
    borderRadius: 4,
  },
  content: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  browseAllButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  browseAllText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  packageCard: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 5
  },
  packageImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  packageImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  packageImagePlaceholderText: {
    color: '#999',
    fontSize: 14,
  },
  packageTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    padding: 12,
    paddingBottom: 5,
  },
  packageLocation: {
    fontSize: 12,
    color: '#666',
    paddingHorizontal: 12,
    paddingBottom: 5,
  },
  packagePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  statusCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  errorText: {
    fontSize: 14,
    color: '#ff0000',
  },
});
