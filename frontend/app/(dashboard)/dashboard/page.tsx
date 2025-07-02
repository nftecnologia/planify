'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  Target, 
  AlertTriangle,
  Activity,
  TrendingDown,
  Calendar,
  CreditCard,
  PieChart,
  ArrowUpIcon,
  ArrowDownIcon
} from "lucide-react";
import { api } from '@/lib/api';
import { DashboardMockAPI } from '@/lib/dashboard-mock';
import { formatCurrency, formatPercentage, formatDate } from '@/lib/utils';

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

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Tentar API real primeiro, fallback para mock
      try {
        const overview = await api.get<{
          metrics: DashboardMetrics;
          quickStats: QuickStats;
          recentActivity: RecentActivity[];
          topProducts: TopProduct[];
        }>('/dashboard/overview');

        setMetrics(overview.metrics);
        setQuickStats(overview.quickStats);
        setRecentActivity(overview.recentActivity);
        setTopProducts(overview.topProducts);
      } catch (apiError) {
        console.log('API real não disponível, usando dados mock...');
        
        // Usar dados mock
        const overview = await DashboardMockAPI.getOverview();
        setMetrics(overview.metrics);
        setQuickStats(overview.quickStats);
        setRecentActivity(overview.recentActivity);
        setTopProducts(overview.topProducts);
      }
    } catch (err: any) {
      console.error('Erro ao carregar dashboard:', err);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowUpIcon className="h-4 w-4 text-green-600" />;
      case 'down':
        return <ArrowDownIcon className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'expense':
        return <CreditCard className="h-4 w-4 text-red-600" />;
      case 'tax':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const variants: Record<string, 'default' | 'destructive' | 'secondary'> = {
      'APPROVED': 'default',
      'PENDING': 'secondary',
      'REFUNDED': 'destructive',
      'CHARGEBACK': 'destructive'
    };

    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do seu negócio
        </p>
      </div>

      {/* Métricas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(quickStats?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {quickStats && quickStats.monthlyGrowth > 0 ? '+' : ''}
              {formatPercentage(quickStats?.monthlyGrowth || 0)} vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Despesas
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(quickStats?.totalExpenses || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(metrics?.expenses.percentOfRevenue || 0)} da receita
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lucro Líquido
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(quickStats?.netProfit || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Margem: {formatPercentage(quickStats?.profitMargin || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saúde Financeira
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthScoreColor(metrics?.cashflow.healthScore || 0)}`}>
              {metrics?.cashflow.healthScore || 0}/100
            </div>
            <div className="flex items-center space-x-1">
              {metrics && getTrendIcon(metrics.cashflow.trend)}
              <p className="text-xs text-muted-foreground">
                Runway: {metrics?.cashflow.runway || 0} meses
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Segunda linha de métricas - KPIs Avançados */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI Geral</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(metrics?.kpis.roi || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Burn Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics?.kpis.burnRate || 0)}
            </div>
            <p className="text-xs text-muted-foreground">por mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reserva Tributária</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics?.tax.reserveCurrent || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.tax.regime} ({formatPercentage(metrics?.tax.aliquota || 0)})
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics?.revenue.avgTicket || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.revenue.salesCount || 0} vendas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Seção Principal - Dados e Atividades */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Produtos */}
        <Card>
          <CardHeader>
            <CardTitle>Top Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.productId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.salesCount} vendas
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(product.totalRevenue)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(product.avgTicket)} médio
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Atividades Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{activity.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {activity.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs text-muted-foreground">
                        {formatDate(activity.date)}
                      </p>
                      {activity.status && getStatusBadge(activity.status)}
                    </div>
                  </div>
                  {activity.amount && (
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(activity.amount)}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Despesas por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Despesas por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            {metrics?.expenses.byCategory.map((category, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {formatPercentage(category.percentage)}
                </div>
                <div className="text-sm font-medium">{category.category}</div>
                <div className="text-xs text-muted-foreground">
                  {formatCurrency(category.amount)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertas Importantes */}
      {metrics?.tax.nextDueDate && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <span>Próximos Vencimentos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">DAS vence em breve</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(metrics.tax.nextDueDate)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">
                  {formatCurrency(metrics.tax.nextDueAmount)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Reserva atual: {formatCurrency(metrics.tax.reserveCurrent)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}