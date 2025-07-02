import { prisma } from '../lib/prisma';

// Tipos para o sistema de fluxo de caixa
export interface CashFlowData {
  date: Date;
  inflow: number;      // Entradas (vendas)
  outflow: number;     // Saídas (despesas + impostos)
  balance: number;     // Saldo
  cumulativeBalance: number; // Saldo acumulado
}

export interface ScenarioProjection {
  scenario: 'pessimistic' | 'realistic' | 'optimistic';
  multiplier: number;
  projections: CashFlowData[];
  summary: {
    totalInflow: number;
    totalOutflow: number;
    finalBalance: number;
    runway: number; // Meses até zero
  };
}

export interface TrendAnalysis {
  inflowTrend: {
    slope: number;
    correlation: number;
    isGrowing: boolean;
  };
  outflowTrend: {
    slope: number;
    correlation: number;
    isGrowing: boolean;
  };
  seasonality: {
    hasSeasonality: boolean;
    peakMonths: number[];
    lowMonths: number[];
  };
}

export interface CashFlowInsights {
  currentBalance: number;
  monthlyBurnRate: number;
  monthlyRevenue: number;
  runway: number;
  healthScore: number; // 0-100
  alerts: Array<{
    type: 'warning' | 'danger' | 'info';
    message: string;
    priority: number;
  }>;
  recommendations: string[];
}

export class CashFlowService {
  
  /**
   * Obtém dados históricos consolidados de fluxo de caixa
   */
  async getHistoricalData(userId: string, months: number = 6): Promise<CashFlowData[]> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    // Buscar vendas por mês
    const salesData = await prisma.sale.groupBy({
      by: ['saleDate'],
      where: {
        userId,
        saleDate: {
          gte: startDate
        },
        status: 'APPROVED'
      },
      _sum: {
        totalPrice: true
      }
    });

    // Buscar despesas por mês
    const expensesData = await prisma.expense.groupBy({
      by: ['expenseDate'],
      where: {
        userId,
        expenseDate: {
          gte: startDate
        }
      },
      _sum: {
        amount: true
      }
    });

    // Buscar gastos com anúncios por mês
    const adSpendsData = await prisma.adSpend.groupBy({
      by: ['date'],
      where: {
        userId,
        date: {
          gte: startDate
        }
      },
      _sum: {
        amount: true
      }
    });

    return this.consolidateMonthlyData(salesData, expensesData, adSpendsData, months);
  }

  /**
   * Consolida dados mensais em estrutura de fluxo de caixa
   */
  private consolidateMonthlyData(
    sales: any[],
    expenses: any[],
    adSpends: any[],
    months: number
  ): CashFlowData[] {
    const monthlyData: CashFlowData[] = [];
    let cumulativeBalance = 0;

    // Gerar meses
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      date.setDate(1); // Primeiro dia do mês

      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      // Calcular entradas do mês
      const monthSales = sales.filter(s => 
        s.saleDate >= monthStart && s.saleDate <= monthEnd
      );
      const inflow = monthSales.reduce((sum, s) => sum + Number(s._sum.totalPrice || 0), 0);

      // Calcular saídas do mês
      const monthExpenses = expenses.filter(e => 
        e.expenseDate >= monthStart && e.expenseDate <= monthEnd
      );
      const monthAdSpends = adSpends.filter(a => 
        a.date >= monthStart && a.date <= monthEnd
      );
      
      const expensesTotal = monthExpenses.reduce((sum, e) => sum + Number(e._sum.amount || 0), 0);
      const adSpendsTotal = monthAdSpends.reduce((sum, a) => sum + Number(a._sum.amount || 0), 0);
      const outflow = expensesTotal + adSpendsTotal;

      const balance = inflow - outflow;
      cumulativeBalance += balance;

      monthlyData.push({
        date: new Date(date),
        inflow,
        outflow,
        balance,
        cumulativeBalance
      });
    }

    return monthlyData;
  }

  /**
   * Análise de tendência usando regressão linear simples
   */
  analyzeTrend(data: CashFlowData[]): TrendAnalysis {
    if (data.length < 3) {
      return {
        inflowTrend: { slope: 0, correlation: 0, isGrowing: false },
        outflowTrend: { slope: 0, correlation: 0, isGrowing: false },
        seasonality: { hasSeasonality: false, peakMonths: [], lowMonths: [] }
      };
    }

    const inflowTrend = this.calculateLinearRegression(data.map((d, i) => ({ x: i, y: d.inflow })));
    const outflowTrend = this.calculateLinearRegression(data.map((d, i) => ({ x: i, y: d.outflow })));
    const seasonality = this.detectSeasonality(data);

    return {
      inflowTrend: {
        slope: inflowTrend.slope,
        correlation: inflowTrend.correlation,
        isGrowing: inflowTrend.slope > 0
      },
      outflowTrend: {
        slope: outflowTrend.slope,
        correlation: outflowTrend.correlation,
        isGrowing: outflowTrend.slope > 0
      },
      seasonality
    };
  }

  /**
   * Regressão linear simples
   */
  private calculateLinearRegression(points: { x: number; y: number }[]): { slope: number; intercept: number; correlation: number } {
    const n = points.length;
    if (n === 0) return { slope: 0, intercept: 0, correlation: 0 };

    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0);
    const sumYY = points.reduce((sum, p) => sum + p.y * p.y, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calcular correlação
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    const correlation = denominator === 0 ? 0 : numerator / denominator;

    return { slope, intercept, correlation };
  }

  /**
   * Detecta padrões sazonais nos dados
   */
  private detectSeasonality(data: CashFlowData[]): TrendAnalysis['seasonality'] {
    if (data.length < 6) {
      return { hasSeasonality: false, peakMonths: [], lowMonths: [] };
    }

    const monthlyAvg = data.reduce((sum, d) => sum + d.inflow, 0) / data.length;
    const monthlyData = data.map(d => ({
      month: d.date.getMonth(),
      value: d.inflow,
      deviation: d.inflow - monthlyAvg
    }));

    // Calcular desvio padrão
    const stdDev = Math.sqrt(
      monthlyData.reduce((sum, d) => sum + Math.pow(d.deviation, 2), 0) / data.length
    );

    const threshold = stdDev * 0.5; // 50% do desvio padrão
    const peakMonths = monthlyData.filter(d => d.deviation > threshold).map(d => d.month);
    const lowMonths = monthlyData.filter(d => d.deviation < -threshold).map(d => d.month);

    return {
      hasSeasonality: peakMonths.length > 0 || lowMonths.length > 0,
      peakMonths: [...new Set(peakMonths)],
      lowMonths: [...new Set(lowMonths)]
    };
  }

  /**
   * Gera projeções para diferentes cenários
   */
  async generateProjections(userId: string, periods: number = 3): Promise<ScenarioProjection[]> {
    const historicalData = await this.getHistoricalData(userId, 6);
    const trendAnalysis = this.analyzeTrend(historicalData);

    if (historicalData.length === 0) {
      return this.generateMockProjections(periods);
    }

    const scenarios: Array<{ scenario: 'pessimistic' | 'realistic' | 'optimistic'; multiplier: number }> = [
      { scenario: 'pessimistic', multiplier: 0.8 },
      { scenario: 'realistic', multiplier: 1.0 },
      { scenario: 'optimistic', multiplier: 1.3 }
    ];

    return scenarios.map(({ scenario, multiplier }) => {
      const projections = this.projectFuture(historicalData, trendAnalysis, periods, multiplier);
      const summary = this.calculateProjectionSummary(projections);

      return {
        scenario,
        multiplier,
        projections,
        summary
      };
    });
  }

  /**
   * Projeta dados futuros baseado em tendências
   */
  private projectFuture(
    historical: CashFlowData[],
    trends: TrendAnalysis,
    periods: number,
    multiplier: number
  ): CashFlowData[] {
    const projections: CashFlowData[] = [];
    const lastData = historical[historical.length - 1];
    let cumulativeBalance = lastData ? lastData.cumulativeBalance : 0;

    for (let i = 1; i <= periods; i++) {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + i);

      // Projetar entrada baseada na tendência
      const lastInflow = historical.length > 0 ? historical[historical.length - 1].inflow : 0;
      const inflowGrowth = trends.inflowTrend.slope * i;
      const seasonalityFactor = this.getSeasonalityFactor(futureDate.getMonth(), trends.seasonality);
      const projectedInflow = Math.max(0, (lastInflow + inflowGrowth) * multiplier * seasonalityFactor);

      // Projetar saída baseada na tendência
      const lastOutflow = historical.length > 0 ? historical[historical.length - 1].outflow : 0;
      const outflowGrowth = trends.outflowTrend.slope * i;
      const projectedOutflow = Math.max(0, (lastOutflow + outflowGrowth) * multiplier);

      const balance = projectedInflow - projectedOutflow;
      cumulativeBalance += balance;

      projections.push({
        date: new Date(futureDate),
        inflow: projectedInflow,
        outflow: projectedOutflow,
        balance,
        cumulativeBalance
      });
    }

    return projections;
  }

  /**
   * Fator de sazonalidade para o mês
   */
  private getSeasonalityFactor(month: number, seasonality: TrendAnalysis['seasonality']): number {
    if (!seasonality.hasSeasonality) return 1;

    if (seasonality.peakMonths.includes(month)) return 1.2;
    if (seasonality.lowMonths.includes(month)) return 0.8;
    return 1;
  }

  /**
   * Calcula resumo da projeção
   */
  private calculateProjectionSummary(projections: CashFlowData[]): ScenarioProjection['summary'] {
    const totalInflow = projections.reduce((sum, p) => sum + p.inflow, 0);
    const totalOutflow = projections.reduce((sum, p) => sum + p.outflow, 0);
    const finalBalance = projections.length > 0 ? projections[projections.length - 1].cumulativeBalance : 0;

    // Calcular runway (meses até zero)
    let runway = 12; // Máximo 12 meses
    for (let i = 0; i < projections.length; i++) {
      if (projections[i].cumulativeBalance <= 0) {
        runway = i + 1;
        break;
      }
    }

    return {
      totalInflow,
      totalOutflow,
      finalBalance,
      runway
    };
  }

  /**
   * Gera insights e recomendações baseadas nos dados
   */
  async generateInsights(userId: string): Promise<CashFlowInsights> {
    const historicalData = await this.getHistoricalData(userId, 6);
    const trends = this.analyzeTrend(historicalData);

    if (historicalData.length === 0) {
      return this.generateMockInsights();
    }

    const currentBalance = historicalData.length > 0 ? historicalData[historicalData.length - 1].cumulativeBalance : 0;
    const monthlyBurnRate = this.calculateMonthlyBurnRate(historicalData);
    const monthlyRevenue = this.calculateMonthlyRevenue(historicalData);
    const runway = this.calculateRunway(currentBalance, monthlyBurnRate);
    const healthScore = this.calculateHealthScore(currentBalance, monthlyRevenue, monthlyBurnRate, trends);

    const alerts = this.generateAlerts(currentBalance, monthlyBurnRate, runway, trends);
    const recommendations = this.generateRecommendations(trends, currentBalance, monthlyBurnRate);

    return {
      currentBalance,
      monthlyBurnRate,
      monthlyRevenue,
      runway,
      healthScore,
      alerts,
      recommendations
    };
  }

  /**
   * Calcula taxa de queima mensal
   */
  private calculateMonthlyBurnRate(data: CashFlowData[]): number {
    if (data.length === 0) return 0;
    
    const lastThreeMonths = data.slice(-3);
    const avgOutflow = lastThreeMonths.reduce((sum, d) => sum + d.outflow, 0) / lastThreeMonths.length;
    return avgOutflow;
  }

  /**
   * Calcula receita mensal média
   */
  private calculateMonthlyRevenue(data: CashFlowData[]): number {
    if (data.length === 0) return 0;
    
    const lastThreeMonths = data.slice(-3);
    const avgInflow = lastThreeMonths.reduce((sum, d) => sum + d.inflow, 0) / lastThreeMonths.length;
    return avgInflow;
  }

  /**
   * Calcula runway em meses
   */
  private calculateRunway(currentBalance: number, monthlyBurnRate: number): number {
    if (monthlyBurnRate <= 0) return 12; // Máximo 12 meses
    return Math.max(0, Math.floor(currentBalance / monthlyBurnRate));
  }

  /**
   * Calcula score de saúde financeira (0-100)
   */
  private calculateHealthScore(
    balance: number,
    revenue: number,
    burnRate: number,
    trends: TrendAnalysis
  ): number {
    let score = 50; // Base

    // Saldo positivo (+20 pontos)
    if (balance > 0) score += 20;
    
    // Receita crescente (+15 pontos)
    if (trends.inflowTrend.isGrowing) score += 15;
    
    // Gastos controlados (+10 pontos)
    if (!trends.outflowTrend.isGrowing) score += 10;
    
    // Runway saudável (+15 pontos)
    const runway = this.calculateRunway(balance, burnRate);
    if (runway >= 6) score += 15;
    else if (runway >= 3) score += 10;
    
    // Receita > gastos (+10 pontos)
    if (revenue > burnRate) score += 10;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Gera alertas baseados nos dados
   */
  private generateAlerts(
    balance: number,
    burnRate: number,
    runway: number,
    trends: TrendAnalysis
  ): CashFlowInsights['alerts'] {
    const alerts: CashFlowInsights['alerts'] = [];

    // Saldo baixo
    if (balance < burnRate * 2) {
      alerts.push({
        type: 'danger',
        message: 'Saldo baixo! Menos de 2 meses de operação.',
        priority: 1
      });
    } else if (balance < burnRate * 6) {
      alerts.push({
        type: 'warning',
        message: 'Atenção ao saldo. Menos de 6 meses de operação.',
        priority: 2
      });
    }

    // Gastos crescendo
    if (trends.outflowTrend.isGrowing && trends.outflowTrend.slope > 0) {
      alerts.push({
        type: 'warning',
        message: 'Gastos em tendência de crescimento.',
        priority: 2
      });
    }

    // Receita decrescendo
    if (!trends.inflowTrend.isGrowing && trends.inflowTrend.slope < 0) {
      alerts.push({
        type: 'warning',
        message: 'Receita em tendência de queda.',
        priority: 2
      });
    }

    // Runway crítico
    if (runway <= 3) {
      alerts.push({
        type: 'danger',
        message: `Runway crítico: ${runway} meses restantes.`,
        priority: 1
      });
    }

    return alerts.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Gera recomendações baseadas nos dados
   */
  private generateRecommendations(
    trends: TrendAnalysis,
    balance: number,
    burnRate: number
  ): string[] {
    const recommendations: string[] = [];

    // Recomendações baseadas em tendências
    if (!trends.inflowTrend.isGrowing) {
      recommendations.push('Considere estratégias para aumentar receita: novos produtos, campanhas de marketing ou aumento de preços.');
    }

    if (trends.outflowTrend.isGrowing) {
      recommendations.push('Revise gastos recorrentes e identifique oportunidades de otimização.');
    }

    // Recomendações baseadas em sazonalidade
    if (trends.seasonality.hasSeasonality) {
      recommendations.push('Prepare-se para sazonalidade: reserve recursos para meses baixos e aproveite picos de vendas.');
    }

    // Recomendações baseadas em runway
    const runway = this.calculateRunway(balance, burnRate);
    if (runway <= 6) {
      recommendations.push('Runway baixo: priorize geração de receita e corte gastos não essenciais.');
    }

    // Recomendações gerais
    if (balance > burnRate * 12) {
      recommendations.push('Saldo saudável: considere investir em crescimento ou novos projetos.');
    }

    return recommendations;
  }

  /**
   * Gera projeções mock para novos usuários
   */
  private generateMockProjections(periods: number): ScenarioProjection[] {
    const scenarios: Array<{ scenario: 'pessimistic' | 'realistic' | 'optimistic'; multiplier: number }> = [
      { scenario: 'pessimistic', multiplier: 0.8 },
      { scenario: 'realistic', multiplier: 1.0 },
      { scenario: 'optimistic', multiplier: 1.3 }
    ];

    return scenarios.map(({ scenario, multiplier }) => {
      const projections: CashFlowData[] = [];
      let cumulativeBalance = 10000; // Saldo inicial mock

      for (let i = 1; i <= periods; i++) {
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + i);

        const baseInflow = 15000 + (Math.random() * 5000) - 2500; // ±2500 variação
        const baseOutflow = 8000 + (Math.random() * 2000) - 1000; // ±1000 variação

        const inflow = baseInflow * multiplier;
        const outflow = baseOutflow * multiplier;
        const balance = inflow - outflow;
        cumulativeBalance += balance;

        projections.push({
          date: new Date(futureDate),
          inflow,
          outflow,
          balance,
          cumulativeBalance
        });
      }

      const totalInflow = projections.reduce((sum, p) => sum + p.inflow, 0);
      const totalOutflow = projections.reduce((sum, p) => sum + p.outflow, 0);
      const finalBalance = projections.length > 0 ? projections[projections.length - 1].cumulativeBalance : 0;

      return {
        scenario,
        multiplier,
        projections,
        summary: {
          totalInflow,
          totalOutflow,
          finalBalance,
          runway: Math.floor(finalBalance / 8000) // Mock runway
        }
      };
    });
  }

  /**
   * Gera insights mock para novos usuários
   */
  private generateMockInsights(): CashFlowInsights {
    return {
      currentBalance: 25000,
      monthlyBurnRate: 8000,
      monthlyRevenue: 15000,
      runway: 3,
      healthScore: 75,
      alerts: [
        {
          type: 'info',
          message: 'Configure suas integrações para análises mais precisas.',
          priority: 3
        }
      ],
      recommendations: [
        'Configure a integração com Kirvano para dados de vendas precisos.',
        'Adicione suas despesas recorrentes para melhor projeção.',
        'Upload do CSV de anúncios para análise completa de ROI.'
      ]
    };
  }
}

export const cashFlowService = new CashFlowService();