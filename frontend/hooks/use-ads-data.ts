import { useState, useCallback, useEffect } from 'react';
import { AdCampaign, Product } from '@/types';

// Mock de dados de produtos (em um app real viria de uma API)
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Curso de Marketing Digital',
    price: 297.00,
    monthlyGoal: 100,
    tags: ['marketing', 'digital', 'curso', 'online'],
    salesCount: 45,
    revenue: 13365.00,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-06-27T10:00:00Z',
  },
  {
    id: '2',
    name: 'E-book Estratégias de Vendas',
    price: 47.00,
    monthlyGoal: 200,
    tags: ['vendas', 'ebook', 'estratégia', 'digital'],
    salesCount: 128,
    revenue: 6016.00,
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-06-27T10:00:00Z',
  },
  {
    id: '3',
    name: 'Mentoria em Growth Hacking',
    price: 997.00,
    monthlyGoal: 20,
    tags: ['mentoria', 'growth', 'hacking', 'premium'],
    salesCount: 12,
    revenue: 11964.00,
    createdAt: '2024-03-10T10:00:00Z',
    updatedAt: '2024-06-27T10:00:00Z',
  },
  {
    id: '4',
    name: 'Planilha de Controle Financeiro',
    price: 27.00,
    monthlyGoal: 300,
    tags: ['planilha', 'financeiro', 'controle', 'excel'],
    salesCount: 89,
    revenue: 2403.00,
    createdAt: '2024-04-05T10:00:00Z',
    updatedAt: '2024-06-27T10:00:00Z',
  },
  {
    id: '5',
    name: 'Workshop de Facebook Ads',
    price: 197.00,
    monthlyGoal: 50,
    tags: ['workshop', 'facebook', 'ads', 'online'],
    salesCount: 34,
    revenue: 6698.00,
    createdAt: '2024-05-01T10:00:00Z',
    updatedAt: '2024-06-27T10:00:00Z',
  },
];

export interface AdsDataState {
  campaigns: AdCampaign[];
  products: Product[];
  isLoading: boolean;
  error: string | null;
  importHistory: Array<{
    id: string;
    fileName: string;
    campaignCount: number;
    importedAt: string;
  }>;
}

export interface AdsDataActions {
  addCampaigns: (campaigns: AdCampaign[]) => void;
  updateCampaign: (campaignId: string, updates: Partial<AdCampaign>) => void;
  deleteCampaign: (campaignId: string) => void;
  clearCampaigns: () => void;
  refreshProducts: () => Promise<void>;
  calculateROI: (campaignId: string, productId: string) => number;
  getTopPerformers: (metric: 'roas' | 'ctr' | 'spent') => AdCampaign[];
  getCampaignsByProduct: (productId: string) => AdCampaign[];
  getUnlinkedCampaigns: () => AdCampaign[];
}

export function useAdsData(): AdsDataState & AdsDataActions {
  const [state, setState] = useState<AdsDataState>({
    campaigns: [],
    products: mockProducts,
    isLoading: false,
    error: null,
    importHistory: [],
  });

  // Simular carregamento inicial de produtos
  useEffect(() => {
    refreshProducts();
  }, []);

  const addCampaigns = useCallback((newCampaigns: AdCampaign[]) => {
    setState(prev => {
      const existingIds = new Set(prev.campaigns.map(c => c.id));
      const uniqueNewCampaigns = newCampaigns.filter(c => !existingIds.has(c.id));
      
      // Adicionar ao histórico de importação
      const importRecord = {
        id: Date.now().toString(),
        fileName: `Import_${new Date().toISOString().split('T')[0]}`,
        campaignCount: uniqueNewCampaigns.length,
        importedAt: new Date().toISOString(),
      };

      return {
        ...prev,
        campaigns: [...prev.campaigns, ...uniqueNewCampaigns],
        importHistory: [importRecord, ...prev.importHistory.slice(0, 9)], // Manter apenas últimos 10
      };
    });
  }, []);

  const updateCampaign = useCallback((campaignId: string, updates: Partial<AdCampaign>) => {
    setState(prev => ({
      ...prev,
      campaigns: prev.campaigns.map(campaign =>
        campaign.id === campaignId
          ? { ...campaign, ...updates, updatedAt: new Date().toISOString() }
          : campaign
      ),
    }));
  }, []);

  const deleteCampaign = useCallback((campaignId: string) => {
    setState(prev => ({
      ...prev,
      campaigns: prev.campaigns.filter(campaign => campaign.id !== campaignId),
    }));
  }, []);

  const clearCampaigns = useCallback(() => {
    setState(prev => ({
      ...prev,
      campaigns: [],
      importHistory: [],
    }));
  }, []);

  const refreshProducts = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Simular chamada de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setState(prev => ({
        ...prev,
        products: mockProducts,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Erro ao carregar produtos',
        isLoading: false,
      }));
    }
  }, []);

  const calculateROI = useCallback((campaignId: string, productId: string): number => {
    const campaign = state.campaigns.find(c => c.id === campaignId);
    const product = state.products.find(p => p.id === productId);
    
    if (!campaign || !product) return 0;
    
    // ROI = (Receita - Investimento) / Investimento * 100
    // Assumindo conversões como vendas diretas
    const revenue = campaign.conversions * product.price;
    const investment = campaign.spent;
    
    if (investment === 0) return 0;
    
    return Math.round(((revenue - investment) / investment) * 100);
  }, [state.campaigns, state.products]);

  const getTopPerformers = useCallback((metric: 'roas' | 'ctr' | 'spent'): AdCampaign[] => {
    return [...state.campaigns]
      .sort((a, b) => {
        switch (metric) {
          case 'roas':
            return b.roas - a.roas;
          case 'ctr':
            return b.ctr - a.ctr;
          case 'spent':
            return b.spent - a.spent;
          default:
            return 0;
        }
      })
      .slice(0, 5);
  }, [state.campaigns]);

  const getCampaignsByProduct = useCallback((productId: string): AdCampaign[] => {
    return state.campaigns.filter(campaign => campaign.productId === productId);
  }, [state.campaigns]);

  const getUnlinkedCampaigns = useCallback((): AdCampaign[] => {
    return state.campaigns.filter(campaign => !campaign.productId);
  }, [state.campaigns]);

  return {
    ...state,
    addCampaigns,
    updateCampaign,
    deleteCampaign,
    clearCampaigns,
    refreshProducts,
    calculateROI,
    getTopPerformers,
    getCampaignsByProduct,
    getUnlinkedCampaigns,
  };
}