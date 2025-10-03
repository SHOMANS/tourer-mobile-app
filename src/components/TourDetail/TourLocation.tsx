import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Linking } from 'react-native';
import { TourPackage } from '../../store/types';
import { Colors } from '../../config/colors';

interface TourLocationProps {
  tourPackage: TourPackage;
}

export default function TourLocation({ tourPackage }: TourLocationProps) {
  const handleOpenMaps = () => {
    const coords = tourPackage.coordinates
      ? JSON.parse(tourPackage.coordinates)
      : null;
    if (coords) {
      const { lat, lng } = coords;
      const url = Platform.OS === 'ios'
        ? `http://maps.apple.com/?daddr=${lat},${lng}`
        : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Location</Text>
      <View style={styles.locationInfo}>
        <Text style={styles.locationText}>📍 {tourPackage.locationName}</Text>
        {tourPackage.country && (
          <Text style={styles.countryText}>{tourPackage.country}</Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.mapButton}
        onPress={handleOpenMaps}
      >
        <Text style={styles.mapButtonText}>📍 Open in Maps</Text>
      </TouchableOpacity>
    </View>
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
  locationInfo: {
    marginBottom: 16,
  },
  locationText: {
    fontSize: 16,
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
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  mapButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});