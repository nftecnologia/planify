// Mock API para o dashboard quando backend não estiver disponível

interface DashboardMetrics {
  revenue: {
    total: number;
    monthly: number;
    growth: number;
    salesCount: number;
    avgTicket: number;
  };
  expenses: {
    total: number;
    monthly: number;
    percentOfRevenue: number;
    byCategory: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
  };
  tax: {
    regime: string;
    aliquota: number;
    reserveNeeded: number;
    reserveCurrent: number;
    nextDueDate: string | null;
    nextDueAmount: number;
  };
  cashflow: {
    currentBalance: number;
    projectedBalance: number;
    healthScore: number;
    trend: 'up' | 'down' | 'stable';
    runway: number;
  };
  kpis: {
    roi: number;
    profitMargin: number;
    burnRate: number;
    monthlyRecurring: number;
  };
}

interface QuickStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  monthlyGrowth: number;
  cashflowHealth: number;
}

interface RecentActivity {
  type: 'sale' | 'expense' | 'tax' | 'alert';
  title: string;
  description: string;
  amount?: number;
  date: string;
  status?: string;
}

interface TopProduct {
  productId: string;
  productName: string;
  totalRevenue: number;
  salesCount: number;
  avgTicket: number;
}

export class DashboardMockAPI {
  static async getOverview(): Promise<{
    metrics: DashboardMetrics;
    quickStats: QuickStats;
    recentActivity: RecentActivity[];
    topProducts: TopProduct[];
  }> {
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 800));

    const mockData = {
      metrics: {
        revenue: {
          total: 245380,
          monthly: 45280,
          growth: 23.5,
          salesCount: 285,
          avgTicket: 861
        },
        expenses: {
          total: 87650,
          monthly: 16630,
          percentOfRevenue: 35.7,
          byCategory: [
            { category: 'Marketing', amount: 58800, percentage: 67.1 },
            { category: 'Ferramentas', amount: 14200, percentage: 16.2 },
            { category: 'Operacional', amount: 8900, percentage: 10.2 },
            { category: 'Educação', amount: 3500, percentage: 4.0 },
            { category: 'Tributário', amount: 2250, percentage: 2.5 }
          ]
        },
        tax: {
          regime: 'Simples Nacional',
          aliquota: 15.5,
          reserveNeeded: 38034,
          reserveCurrent: 35420,
          nextDueDate: '2025-07-20T10:00:00.000Z',
          nextDueAmount: 7018
        },
        cashflow: {
          currentBalance: 89450,
          projectedBalance: 125800,
          healthScore: 84,
          trend: 'up' as const,
          runway: 8.2
        },
        kpis: {
          roi: 180.2,
          profitMargin: 64.3,
          burnRate: 16630,
          monthlyRecurring: 31696
        }
      },
      quickStats: {
        totalRevenue: 245380,
        totalExpenses: 87650,
        netProfit: 157730,
        profitMargin: 64.3,
        monthlyGrowth: 23.5,
        cashflowHealth: 84
      },
      recentActivity: [
        {
          type: 'sale' as const,
          title: 'Nova venda - Curso Marketing Digital',
          description: 'João Silva',
          amount: 497,
          date: '2025-06-27T14:32:00.000Z',
          status: 'APPROVED'
        },
        {
          type: 'sale' as const,
          title: 'Nova venda - Ebook Copywriting',
          description: 'Maria Santos',
          amount: 67,
          date: '2025-06-27T14:28:00.000Z',
          status: 'PENDING'
        },
        {
          type: 'expense' as const,
          title: 'Despesa - Meta Ads',
          description: 'Categoria: Marketing',
          amount: 1250,
          date: '2025-06-27T10:15:00.000Z'
        },
        {
          type: 'tax' as const,
          title: 'DAS vencendo em 23 dias',
          description: 'Referência: Maio/2025',
          amount: 7018,
          date: '2025-07-20T10:00:00.000Z'
        },
        {
          type: 'sale' as const,
          title: 'Nova venda - Mentoria Premium',
          description: 'Carlos Rocha',
          amount: 1997,
          date: '2025-06-27T09:45:00.000Z',
          status: 'APPROVED'
        }
      ],
      topProducts: [
        {
          productId: '1',
          productName: 'Curso Marketing Digital',
          totalRevenue: 98500,
          salesCount: 198,
          avgTicket: 497
        },
        {
          productId: '2',
          productName: 'Ebook Copywriting',
          totalRevenue: 75600,
          salesCount: 1128,
          avgTicket: 67
        },
        {
          productId: '3',
          productName: 'Mentoria Premium',
          totalRevenue: 71280,
          salesCount: 36,
          avgTicket: 1980
        }
      ]
    };

    return mockData;
  }

  static async getMetrics(): Promise<DashboardMetrics> {
    const overview = await this.getOverview();
    return overview.metrics;
  }

  static async getQuickStats(): Promise<QuickStats> {
    const overview = await this.getOverview();
    return overview.quickStats;
  }

  static async getRecentActivity(): Promise<RecentActivity[]> {
    const overview = await this.getOverview();
    return overview.recentActivity;
  }

  static async getTopProducts(): Promise<TopProduct[]> {
    const overview = await this.getOverview();
    return overview.topProducts;
  }
}