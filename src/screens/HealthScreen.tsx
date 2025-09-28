import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useAppStore } from '../store/appStore';

export default function HealthScreen() {
  const { healthData, loading, error, fetchHealthStatus } = useAppStore();

  useEffect(() => {
    fetchHealthStatus();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Backend Health Check</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={fetchHealthStatus}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Checking...' : 'Refresh Health Status'}
        </Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#0066CC" style={styles.loader} />}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error:</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {healthData && (
        <View style={styles.healthContainer}>
          <Text style={styles.healthTitle}>Health Status:</Text>
          <View style={styles.healthItem}>
            <Text style={styles.label}>Status:</Text>
            <Text style={[styles.value, { color: healthData.status === 'ok' ? '#4CAF50' : '#F44336' }]}>
              {healthData.status}
            </Text>
          </View>
          <View style={styles.healthItem}>
            <Text style={styles.label}>Version:</Text>
            <Text style={styles.value}>{healthData.version}</Text>
          </View>
          <View style={styles.healthItem}>
            <Text style={styles.label}>Timestamp:</Text>
            <Text style={styles.value}>{new Date(healthData.timestamp).toLocaleString()}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 20,
    color: '#333',
  },
  button: {
    backgroundColor: '#0066CC',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {
    marginVertical: 20,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 5,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
  },
  healthContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  healthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  healthItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});