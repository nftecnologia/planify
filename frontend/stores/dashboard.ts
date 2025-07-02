import { create } from 'zustand';
import { DashboardMetrics, Product, AdCampaign } from '@/types';

interface DashboardState {
  metrics: DashboardMetrics | null;
  topProducts: Product[];
  recentCampaigns: AdCampaign[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setMetrics: (metrics: DashboardMetrics) => void;
  setTopProducts: (products: Product[]) => void;
  setRecentCampaigns: (campaigns: AdCampaign[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  metrics: null,
  topProducts: [],
  recentCampaigns: [],
  isLoading: false,
  error: null,
  
  setMetrics: (metrics) => set({ metrics }),
  setTopProducts: (topProducts) => set({ topProducts }),
  setRecentCampaigns: (recentCampaigns) => set({ recentCampaigns }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));