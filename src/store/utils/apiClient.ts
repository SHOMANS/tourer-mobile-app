import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use environment variable if available, otherwise fallback to localhost
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3006';

export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
};

// Create axios instance with interceptors
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Store reference for accessing auth state
let authStoreRef: any = null;

export const setAuthStoreRef = (storeRef: any) => {
  authStoreRef = storeRef;
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token for request:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem(
          TOKEN_KEYS.REFRESH_TOKEN
        );

        if (refreshToken && authStoreRef) {
          console.log('Attempting to refresh token due to 401 error');

          // Try to refresh the token
          await authStoreRef.refreshAccessToken();

          // Get the new token and retry the original request
          const newToken = await AsyncStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            console.log('Token refreshed, retrying original request');
            return apiClient(originalRequest);
          }
        } else {
          // No refresh token or store ref, logout user
          console.log('No refresh token available, logging out user');
          if (authStoreRef) {
            await authStoreRef.logout();
          }
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        console.log('Token refresh failed, logging out user');
        if (authStoreRef) {
          await authStoreRef.logout();
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
