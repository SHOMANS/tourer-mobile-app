import { create } from 'zustand';
import { HealthData } from '../types';
import { apiClient } from '../utils/apiClient';

interface HealthState {
  // Health state
  healthData: HealthData | null;
  loading: boolean;
  error: string | null;

  // Health actions
  fetchHealthStatus: () => Promise<void>;
}

export const useHealthStore = create<HealthState>((set) => ({
  // Initial state
  healthData: null,
  loading: false,
  error: null,

  // Actions
  fetchHealthStatus: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get<HealthData>(`/health`);
      set({
        healthData: response.data,
        loading: false,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch health status';
      set({
        error: errorMessage,
        loading: false,
      });
      throw new Error(errorMessage);
    }
  },
}));
