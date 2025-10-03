import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthResponse } from '../types';
import { apiClient, TOKEN_KEYS, setAuthStoreRef } from '../utils/apiClient';

interface AuthState {
  // Auth state
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  authError: string | null;

  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  googleSignIn: (idToken: string, userInfo?: any) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  verifyAuthentication: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Set the auth store reference for interceptors
  const storeInstance = {
    refreshAccessToken: async () => {
      const { refreshToken } = get();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      try {
        const response = await apiClient.post('/auth/refresh', {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token: new_refresh_token } =
          response.data;

        // Store new tokens
        await AsyncStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, access_token);
        if (new_refresh_token) {
          await AsyncStorage.setItem(
            TOKEN_KEYS.REFRESH_TOKEN,
            new_refresh_token
          );
        }

        set({
          accessToken: access_token,
          refreshToken: new_refresh_token || refreshToken,
          authError: null,
        });

        return access_token;
      } catch (error: any) {
        console.error('Token refresh failed:', error);
        // If refresh fails, logout the user
        await get().logout();
        throw new Error('Session expired. Please log in again.');
      }
    },
    logout: async () => {
      set({ isLoading: true });
      try {
        // Clear stored tokens
        await AsyncStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
        await AsyncStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
        await AsyncStorage.removeItem(TOKEN_KEYS.USER);

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isLoading: false,
          authError: null,
        });
      } catch (error) {
        console.error('Error during logout:', error);
        // Still clear the state even if AsyncStorage fails
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isLoading: false,
          authError: null,
        });
      }
    },
  };

  setAuthStoreRef(storeInstance);

  return {
    // Initial state
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: false,
    authError: null,

    // Actions
    login: async (email: string, password: string) => {
      set({ isLoading: true, authError: null });
      try {
        const response = await apiClient.post<AuthResponse>('/auth/login', {
          email,
          password,
        });

        const { access_token, refresh_token, user } = response.data;

        // Store tokens and user data
        await AsyncStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, access_token);
        await AsyncStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refresh_token);
        await AsyncStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));

        set({
          user,
          accessToken: access_token,
          refreshToken: refresh_token,
          isLoading: false,
          authError: null,
        });
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || 'Login failed';
        set({
          authError: errorMessage,
          isLoading: false,
        });
        throw new Error(errorMessage);
      }
    },

    register: async (
      email: string,
      password: string,
      firstName: string,
      lastName: string
    ) => {
      set({ isLoading: true, authError: null });
      try {
        const response = await apiClient.post<AuthResponse>('/auth/register', {
          email,
          password,
          firstName,
          lastName,
        });

        const { access_token, refresh_token, user } = response.data;

        // Store tokens and user data
        await AsyncStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, access_token);
        await AsyncStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refresh_token);
        await AsyncStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));

        set({
          user,
          accessToken: access_token,
          refreshToken: refresh_token,
          isLoading: false,
          authError: null,
        });
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Registration failed';
        set({
          authError: errorMessage,
          isLoading: false,
        });
        throw new Error(errorMessage);
      }
    },

    googleSignIn: async (idToken: string, userInfo?: any) => {
      set({ isLoading: true, authError: null });
      try {
        if (!idToken) {
          throw new Error('Google sign-in failed to get ID token');
        }

        // Send Google token to backend for verification and JWT creation
        const response = await apiClient.post<AuthResponse>('/auth/google', {
          idToken,
          googleId: userInfo?.sub,
          email: userInfo?.email,
          firstName: userInfo?.given_name,
          lastName: userInfo?.family_name,
          photoUrl: userInfo?.picture,
        });

        const { access_token, refresh_token, user } = response.data;

        // Store tokens and user data
        await AsyncStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, access_token);
        await AsyncStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refresh_token);
        await AsyncStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));

        set({
          user,
          accessToken: access_token,
          refreshToken: refresh_token,
          isLoading: false,
          authError: null,
        });
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Google sign-in failed';
        set({
          authError: errorMessage,
          isLoading: false,
        });
        throw new Error(errorMessage);
      }
    },

    logout: storeInstance.logout,

    loadStoredAuth: async () => {
      try {
        const [accessToken, refreshToken, userString] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN),
          AsyncStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN),
          AsyncStorage.getItem(TOKEN_KEYS.USER),
        ]);

        if (accessToken && refreshToken && userString) {
          const user = JSON.parse(userString);
          set({
            user,
            accessToken,
            refreshToken,
            authError: null,
          });
        }
      } catch (error) {
        console.error('Error loading stored auth:', error);
        set({ authError: 'Failed to load stored authentication' });
      }
    },

    refreshAccessToken: storeInstance.refreshAccessToken,

    verifyAuthentication: async () => {
      const { accessToken, refreshToken } = get();

      if (!accessToken || !refreshToken) {
        return false;
      }

      try {
        // Try to make a request with current token
        await apiClient.get('/auth/profile');
        return true;
      } catch (error: any) {
        if (error.response?.status === 401) {
          try {
            // Try to refresh the token
            await get().refreshAccessToken();
            return true;
          } catch (refreshError) {
            // If refresh fails, logout
            await get().logout();
            return false;
          }
        }
        return false;
      }
    },
  };
});
