import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TourPackage } from '../../store/types';

interface TourDetailsProps {
  tourPackage: TourPackage;
}

export default function TourDetails({ tourPackage }: TourDetailsProps) {
  const renderHighlights = () => {
    if (!tourPackage.highlights || tourPackage.highlights.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Highlights</Text>
        {tourPackage.highlights.map((highlight: string, index: number) => (
          <View key={index} style={styles.highlightItem}>
            <Text style={styles.highlightBullet}>•</Text>
            <Text style={styles.highlightText}>{highlight}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderIncludes = () => {
    if (!tourPackage.includes || tourPackage.includes.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What's Included</Text>
        {tourPackage.includes.map((include: string, index: number) => (
          <View key={index} style={styles.includeItem}>
            <Text style={styles.includeIcon}>✓</Text>
            <Text style={styles.includeText}>{include}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderExcludes = () => {
    if (!tourPackage.excludes || tourPackage.excludes.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What's Not Included</Text>
        {tourPackage.excludes.map((exclude: string, index: number) => (
          <View key={index} style={styles.excludeItem}>
            <Text style={styles.excludeIcon}>✗</Text>
            <Text style={styles.excludeText}>{exclude}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <>
      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About This Tour</Text>
        <Text style={styles.description}>
          {tourPackage.description || tourPackage.shortDescription}
        </Text>
      </View>

      {renderHighlights()}
      {renderIncludes()}
      {renderExcludes()}
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
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  highlightBullet: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
    marginTop: 2,
  },
  highlightText: {
    flex: 1,
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  includeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  includeIcon: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 8,
    marginTop: 2,
  },
  includeText: {
    flex: 1,
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  excludeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  excludeIcon: {
    fontSize: 16,
    color: '#f44336',
    marginRight: 8,
    marginTop: 2,
  },
  excludeText: {
    flex: 1,
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
});