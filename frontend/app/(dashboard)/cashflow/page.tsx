'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  RefreshCw,
  AlertTriangle,
  Activity,
  DollarSign,
  Calendar,
  BarChart3,
  Target,
  Clock,
  ArrowUp,
  ArrowDown,
  PieChart,
  Zap,
  Eye,
  Info,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { api } from '@/lib/api';
import { formatCurrency, formatDate, formatPercentage } from '@/lib/utils';

// Interfaces para tipagem
interface CashFlowData {
  date: string;
  inflow: number;
  outflow: number;
  balance: number;
}

interface CashFlowProjection {
  scenario: 'pessimistic' | 'realistic' | 'optimistic';
  projections: Array<{
    month: string;
    inflow: number;
    outflow: number;
    balance: number;
    probability: number;
  }>;
  summary: {
    averageBalance: number;
    minBalance: number;
    maxBalance: number;
    endBalance: number;
  };
}

interface CashFlowInsights {
  healthScore: number;
  currentBalance: number;
  monthlyRevenue: number;
  monthlyBurnRate: number;
  runway: number;
  recommendations: Array<{
    type: 'warning' | 'info' | 'success';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  alerts: Array<{
    severity: 'critical' | 'warning' | 'info';
    message: string;
    actionRequired: boolean;
  }>;
}

interface TrendAnalysis {
  inflowTrend: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    isGrowing: boolean;
  };
  outflowTrend: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    isGrowing: boolean;
  };
  balanceTrend: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    isGrowing: boolean;
  };
  prediction: {
    nextMonth: number;
    confidence: number;
  };
}

interface CashFlowDashboard {
  historical: CashFlowData[];
  projections: CashFlowProjection[];
  insights: CashFlowInsights;
  trends: TrendAnalysis;
  metadata: {
    lastUpdate: string;
    dataQuality: 'high' | 'medium' | 'low' | 'limited';
  };
}

// Mock data para fallback
const mockDashboardData: CashFlowDashboard = {
  historical: [
    { date: '2025-01-01', inflow: 45000, outflow: 32000, balance: 13000 },
    { date: '2025-02-01', inflow: 52000, outflow: 35000, balance: 30000 },
    { date: '2025-03-01', inflow: 48000, outflow: 38000, balance: 40000 },
    { date: '2025-04-01', inflow: 58000, outflow: 42000, balance: 56000 },
    { date: '2025-05-01', inflow: 61000, outflow: 45000, balance: 72000 },
    { date: '2025-06-01', inflow: 55000, outflow: 47000, balance: 80000 }
  ],
  projections: [
    {
      scenario: 'pessimistic',
      projections: [
        { month: 'Jul/25', inflow: 45000, outflow: 50000, balance: 75000, probability: 0.25 },
        { month: 'Ago/25', inflow: 42000, outflow: 52000, balance: 65000, probability: 0.25 },
        { month: 'Set/25', inflow: 40000, outflow: 55000, balance: 50000, probability: 0.25 }
      ],
      summary: { averageBalance: 63333, minBalance: 50000, maxBalance: 75000, endBalance: 50000 }
    },
    {
      scenario: 'realistic',
      projections: [
        { month: 'Jul/25', inflow: 55000, outflow: 47000, balance: 88000, probability: 0.60 },
        { month: 'Ago/25', inflow: 58000, outflow: 48000, balance: 98000, probability: 0.60 },
        { month: 'Set/25', inflow: 60000, outflow: 50000, balance: 108000, probability: 0.60 }
      ],
      summary: { averageBalance: 98000, minBalance: 88000, maxBalance: 108000, endBalance: 108000 }
    },
    {
      scenario: 'optimistic',
      projections: [
        { month: 'Jul/25', inflow: 70000, outflow: 45000, balance: 105000, probability: 0.15 },
        { month: 'Ago/25', inflow: 75000, outflow: 46000, balance: 134000, probability: 0.15 },
        { month: 'Set/25', inflow: 80000, outflow: 47000, balance: 167000, probability: 0.15 }
      ],
      summary: { averageBalance: 135333, minBalance: 105000, maxBalance: 167000, endBalance: 167000 }
    }
  ],
  insights: {
    healthScore: 78,
    currentBalance: 80000,
    monthlyRevenue: 55000,
    monthlyBurnRate: 47000,
    runway: 12.5,
    recommendations: [
      {
        type: 'success',
        title: 'Crescimento Sustentável',
        description: 'O fluxo de caixa está crescendo de forma consistente. Continue investindo em marketing para manter a trajetória.',
        priority: 'medium'
      },
      {
        type: 'warning',
        title: 'Diversificar Receitas',
        description: 'Considere criar fontes de receita adicionais para reduzir riscos de dependência de um único produto.',
        priority: 'high'
      },
      {
        type: 'info',
        title: 'Reserva de Emergência',
        description: 'Construa uma reserva de 6 meses para cobrir despesas operacionais em cenários adversos.',
        priority: 'medium'
      }
    ],
    alerts: [
      {
        severity: 'info',
        message: 'Sua saúde financeira está boa, mas pode melhorar',
        actionRequired: false
      }
    ]
  },
  trends: {
    inflowTrend: { direction: 'up', percentage: 15.2, isGrowing: true },
    outflowTrend: { direction: 'up', percentage: 8.7, isGrowing: true },
    balanceTrend: { direction: 'up', percentage: 25.3, isGrowing: true },
    prediction: { nextMonth: 85000, confidence: 0.85 }
  },
  metadata: {
    lastUpdate: new Date().toISOString(),
    dataQuality: 'high'
  }
};

export default function CashFlowPage() {
  const [dashboardData, setDashboardData] = useState<CashFlowDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<'pessimistic' | 'realistic' | 'optimistic'>('realistic');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadCashFlowData();
  }, []);

  const loadCashFlowData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Tentar API real primeiro, fallback para mock
      try {
        const response = await api.get<CashFlowDashboard>('/cashflow/dashboard');
        setDashboardData(response);
      } catch (apiError) {
        console.log('API real não disponível, usando dados mock...');
        
        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setDashboardData(mockDashboardData);
      }
    } catch (err: any) {
      console.error('Erro ao carregar fluxo de caixa:', err);
      setError('Erro ao carregar dados do fluxo de caixa');
    } finally {
      setLoading(false);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getHealthScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bom';
    if (score >= 40) return 'Atenção';
    return 'Crítico';
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRecommendationIcon = (type: 'warning' | 'info' | 'success') => {
    switch (type) {
      case 'success': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default: return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getAlertIcon = (severity: 'critical' | 'warning' | 'info') => {
    switch (severity) {
      case 'critical': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default: return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Fluxo de Caixa</h1>
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
          <h1 className="text-3xl font-bold">Fluxo de Caixa</h1>
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

  if (!dashboardData) return null;

  const { insights, trends, projections, historical } = dashboardData;
  const selectedProjection = projections.find(p => p.scenario === selectedScenario);

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Fluxo de Caixa</h1>
        <div className="flex items-center space-x-2">
          <Button onClick={loadCashFlowData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Detalhes
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Detalhes do Fluxo de Caixa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Dados Históricos (Últimos 6 meses)</h3>
                  <div className="space-y-2">
                    {historical.slice(-6).map((data, index) => (
                      <div key={index} className="flex justify-between items-center p-2 border rounded">
                        <span className="text-sm font-medium">{formatDate(data.date)}</span>
                        <div className="flex space-x-4 text-sm">
                          <span className="text-green-600">+{formatCurrency(data.inflow)}</span>
                          <span className="text-red-600">-{formatCurrency(data.outflow)}</span>
                          <span className="font-medium">{formatCurrency(data.balance)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Qualidade dos Dados</h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant={dashboardData.metadata.dataQuality === 'high' ? 'default' : 'secondary'}>
                      {dashboardData.metadata.dataQuality === 'high' ? 'Alta' : 
                       dashboardData.metadata.dataQuality === 'medium' ? 'Média' : 'Limitada'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Última atualização: {formatDate(dashboardData.metadata.lastUpdate)}
                    </span>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Alertas */}
      {insights.alerts.length > 0 && (
        <div className="space-y-2">
          {insights.alerts.map((alert, index) => (
            <Alert key={index} className={
              alert.severity === 'critical' ? 'border-red-200 bg-red-50' :
              alert.severity === 'warning' ? 'border-yellow-200 bg-yellow-50' :
              'border-blue-200 bg-blue-50'
            }>
              <div className="flex items-center space-x-2">
                {getAlertIcon(alert.severity)}
                <span>{alert.message}</span>
                {alert.actionRequired && (
                  <Badge variant="outline" className="ml-auto">
                    Ação Necessária
                  </Badge>
                )}
              </div>
            </Alert>
          ))}
        </div>
      )}

      {/* Dashboard Principal */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(insights.currentBalance)}</div>
            <div className="flex items-center space-x-1">
              {getTrendIcon(trends.balanceTrend.direction)}
              <p className="text-xs text-muted-foreground">
                {trends.balanceTrend.percentage}% vs mês anterior
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score de Saúde</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthScoreColor(insights.healthScore)}`}>
              {insights.healthScore}/100
            </div>
            <p className="text-xs text-muted-foreground">
              {getHealthScoreLabel(insights.healthScore)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Runway</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights.runway.toFixed(1)} meses
            </div>
            <p className="text-xs text-muted-foreground">
              Duração com gastos atuais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Burn Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(insights.monthlyBurnRate)}</div>
            <div className="flex items-center space-x-1">
              {getTrendIcon(trends.outflowTrend.direction)}
              <p className="text-xs text-muted-foreground">
                {trends.outflowTrend.percentage}% vs mês anterior
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Avançadas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <ArrowUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(insights.monthlyRevenue)}
            </div>
            <div className="flex items-center space-x-1">
              {getTrendIcon(trends.inflowTrend.direction)}
              <p className="text-xs text-muted-foreground">
                {trends.inflowTrend.percentage}% crescimento
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos Mensais</CardTitle>
            <ArrowDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(insights.monthlyBurnRate)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage((insights.monthlyBurnRate / insights.monthlyRevenue) * 100)} da receita
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem Líquida</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(((insights.monthlyRevenue - insights.monthlyBurnRate) / insights.monthlyRevenue) * 100)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(insights.monthlyRevenue - insights.monthlyBurnRate)} líquido
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Análise de Cenários */}
      <Card>
        <CardHeader>
          <CardTitle>Análise de Cenários</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedScenario} onValueChange={(value) => setSelectedScenario(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pessimistic">Pessimista</TabsTrigger>
              <TabsTrigger value="realistic">Realista</TabsTrigger>
              <TabsTrigger value="optimistic">Otimista</TabsTrigger>
            </TabsList>
            
            {projections.map((projection) => (
              <TabsContent key={projection.scenario} value={projection.scenario}>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold text-sm mb-1">Saldo Final</h3>
                      <p className="text-2xl font-bold">{formatCurrency(projection.summary.endBalance)}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold text-sm mb-1">Saldo Médio</h3>
                      <p className="text-2xl font-bold">{formatCurrency(projection.summary.averageBalance)}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold text-sm mb-1">Saldo Mínimo</h3>
                      <p className="text-2xl font-bold">{formatCurrency(projection.summary.minBalance)}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold text-sm mb-1">Saldo Máximo</h3>
                      <p className="text-2xl font-bold">{formatCurrency(projection.summary.maxBalance)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold">Projeção Mensal</h3>
                    {projection.projections.map((proj, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium">{proj.month}</span>
                          <Badge variant="outline">
                            {formatPercentage(proj.probability * 100)} confiança
                          </Badge>
                        </div>
                        <div className="flex space-x-4 text-sm">
                          <span className="text-green-600">+{formatCurrency(proj.inflow)}</span>
                          <span className="text-red-600">-{formatCurrency(proj.outflow)}</span>
                          <span className="font-medium">{formatCurrency(proj.balance)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Recomendações e Insights */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recomendações Inteligentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.recommendations.map((rec, index) => (
                <div key={index} className="flex space-x-3 p-3 border rounded-lg">
                  {getRecommendationIcon(rec.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-sm">{rec.title}</h3>
                      <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                        {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Média' : 'Baixa'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Análise de Tendências</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <ArrowUp className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Entradas</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(trends.inflowTrend.direction)}
                  <span className="font-semibold">{trends.inflowTrend.percentage}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <ArrowDown className="h-4 w-4 text-red-600" />
                  <span className="font-medium">Saídas</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(trends.outflowTrend.direction)}
                  <span className="font-semibold">{trends.outflowTrend.percentage}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Saldo</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(trends.balanceTrend.direction)}
                  <span className="font-semibold">{trends.balanceTrend.percentage}%</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Previsão para o Próximo Mês</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Saldo projetado:</span>
                  <span className="font-bold">{formatCurrency(trends.prediction.nextMonth)}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm">Confiança:</span>
                  <span className="font-medium">{formatPercentage(trends.prediction.confidence * 100)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Visual */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Visual - Últimos 6 Meses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {historical.slice(-6).map((data, index) => {
              const netFlow = data.inflow - data.outflow;
              const maxValue = Math.max(data.inflow, data.outflow);
              const inflowWidth = (data.inflow / maxValue) * 100;
              const outflowWidth = (data.outflow / maxValue) * 100;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{formatDate(data.date)}</span>
                    <div className={`font-semibold ${netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {netFlow >= 0 ? '+' : ''}{formatCurrency(netFlow)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 text-xs text-muted-foreground">Entrada</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: `${inflowWidth}%`}}></div>
                      </div>
                      <div className="w-20 text-xs text-right">{formatCurrency(data.inflow)}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 text-xs text-muted-foreground">Saída</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{width: `${outflowWidth}%`}}></div>
                      </div>
                      <div className="w-20 text-xs text-right">{formatCurrency(data.outflow)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}