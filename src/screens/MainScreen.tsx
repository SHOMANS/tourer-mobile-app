import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/appStore';

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

  useEffect(() => {
    fetchHealthStatus();
    fetchPopularPackages();
  }, [fetchHealthStatus, fetchPopularPackages]);

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

  const navigateToHealth = () => {
    navigation.navigate('Health');
  };

  const navigateToTours = () => {
    navigation.navigate('Tours');
  };

  const navigateToTourDetail = (packageId: string) => {
    navigation.navigate('TourDetail', { packageId });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Tourer</Text>
        <Text style={styles.subtitle}>
          Hello, {user?.firstName || user?.email}!
        </Text>
      </View>

      <View style={styles.popularToursCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.cardTitle}>Popular Tours</Text>
          <TouchableOpacity onPress={navigateToTours}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {packagesLoading ? (
          <Text style={styles.loadingText}>Loading tours...</Text>
        ) : popularPackages.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {popularPackages.slice(0, 3).map((tour) => (
              <TouchableOpacity
                key={tour.id}
                style={styles.tourCard}
                onPress={() => navigateToTourDetail(tour.id)}
              >
                {tour.coverImage ? (
                  <Image source={{ uri: tour.coverImage }} style={styles.tourImage} />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Text style={styles.placeholderText}>📷</Text>
                  </View>
                )}
                <View style={styles.tourInfo}>
                  <Text style={styles.tourTitle} numberOfLines={2}>
                    {tour.title}
                  </Text>
                  <Text style={styles.tourLocation}>📍 {tour.location}</Text>
                  <View style={styles.tourFooter}>
                    <Text style={styles.tourPrice}>${tour.price}</Text>
                    <Text style={styles.tourRating}>⭐ {tour.rating?.toFixed(1) || 'N/A'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.noToursText}>No tours available</Text>
        )}
      </View>

      <View style={styles.userCard}>
        <Text style={styles.cardTitle}>Your Profile</Text>
        <Text style={styles.userInfo}>Name: {user?.firstName} {user?.lastName}</Text>
        <Text style={styles.userInfo}>Email: {user?.email}</Text>
        <Text style={styles.userInfo}>Role: {user?.role}</Text>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.cardTitle}>System Status</Text>
        {loading ? (
          <Text style={styles.loadingText}>Checking status...</Text>
        ) : error ? (
          <View>
            <Text style={styles.errorText}>Status: Error</Text>
            <Text style={styles.errorDetail}>{error}</Text>
          </View>
        ) : healthData ? (
          <View>
            <Text style={styles.statusText}>Status: {healthData.status}</Text>
            <Text style={styles.versionText}>Version: {healthData.version}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.refreshButton} onPress={fetchHealthStatus}>
          <Text style={styles.refreshButtonText}>Refresh Status</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionsCard}>
        <Text style={styles.cardTitle}>Quick Actions</Text>

        <TouchableOpacity style={styles.actionButton} onPress={navigateToHealth}>
          <Text style={styles.actionButtonText}>View Health Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={[styles.actionButtonText, styles.logoutButtonText]}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#0066CC',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.9,
  },
  userCard: {
    backgroundColor: 'white',
    margin: 20,
    marginBottom: 10,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statusCard: {
    backgroundColor: 'white',
    margin: 20,
    marginVertical: 10,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  actionsCard: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  userInfo: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  statusText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#28a745',
    fontWeight: '600',
  },
  versionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    fontWeight: '600',
    marginBottom: 4,
  },
  errorDetail: {
    fontSize: 14,
    color: '#dc3545',
  },
  refreshButton: {
    backgroundColor: '#0066CC',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#0066CC',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
  },
  logoutButtonText: {
    color: 'white',
  },
  popularToursCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  seeAllText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
  tourCard: {
    width: 200,
    marginHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tourImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  placeholderImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  placeholderText: {
    fontSize: 24,
    color: '#999',
  },
  tourInfo: {
    padding: 12,
  },
  tourTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  tourLocation: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  tourFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tourPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  tourRating: {
    fontSize: 12,
    color: '#666',
  },
  noToursText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
});