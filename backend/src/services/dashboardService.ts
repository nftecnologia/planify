import { prisma } from '../lib/prisma';
import { RevenueService } from './revenueService';
import { ExpenseService } from './expenseService';
import { TaxService } from './taxService';
import { CashFlowService } from './cashFlowService';

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
    runway: number; // meses
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
  date: Date;
  status?: string;
}

export class DashboardService {
  private revenueService: RevenueService;
  private expenseService: ExpenseService;
  private taxService: TaxService;
  private cashflowService: CashFlowService;

  constructor() {
    this.revenueService = new RevenueService();
    this.expenseService = new ExpenseService();
    this.taxService = new TaxService();
    this.cashflowService = new CashFlowService();
  }

  async getConsolidatedMetrics(userId: string): Promise<DashboardMetrics> {
    try {
      // Buscar dados de todos os módulos em paralelo
      const [
        revenueMetrics,
        expensesSummary,
        taxDashboard,
        cashflowDashboard
      ] = await Promise.all([
        this.revenueService.getMetrics(userId),
        this.expenseService.getSummary(userId),
        this.taxService.getDashboard(userId),
        this.cashflowService.getDashboard(userId)
      ]);

      // Calcular KPIs integrados
      const roi = this.calculateROI(revenueMetrics.totalRevenue, expensesSummary.totalAmount);
      const profitMargin = this.calculateProfitMargin(
        revenueMetrics.totalRevenue, 
        expensesSummary.totalAmount
      );
      const burnRate = this.calculateBurnRate(expensesSummary.monthlyAmount);
      const monthlyRecurring = this.calculateMonthlyRecurring(revenueMetrics.monthlyRevenue);

      return {
        revenue: {
          total: revenueMetrics.totalRevenue,
          monthly: revenueMetrics.monthlyRevenue,
          growth: revenueMetrics.growth,
          salesCount: revenueMetrics.totalSales,
          avgTicket: revenueMetrics.avgTicket
        },
        expenses: {
          total: expensesSummary.totalAmount,
          monthly: expensesSummary.monthlyAmount,
          percentOfRevenue: (expensesSummary.totalAmount / revenueMetrics.totalRevenue) * 100,
          byCategory: expensesSummary.byCategory
        },
        tax: {
          regime: taxDashboard.currentRegime,
          aliquota: taxDashboard.currentRate,
          reserveNeeded: taxDashboard.reserveNeeded,
          reserveCurrent: taxDashboard.reserveCurrent,
          nextDueDate: taxDashboard.nextPayment?.dueDate || null,
          nextDueAmount: taxDashboard.nextPayment?.amount || 0
        },
        cashflow: {
          currentBalance: cashflowDashboard.currentBalance,
          projectedBalance: cashflowDashboard.projections.realistic.endBalance,
          healthScore: cashflowDashboard.healthScore.score,
          trend: this.determineTrend(cashflowDashboard.trend.direction),
          runway: cashflowDashboard.runway.months
        },
        kpis: {
          roi,
          profitMargin,
          burnRate,
          monthlyRecurring
        }
      };
    } catch (error) {
      console.error('Erro ao buscar métricas consolidadas:', error);
      throw new Error('Erro interno do servidor');
    }
  }

  async getQuickStats(userId: string): Promise<QuickStats> {
    try {
      const [revenueMetrics, expensesSummary, cashflowHealth] = await Promise.all([
        this.revenueService.getMetrics(userId),
        this.expenseService.getSummary(userId),
        this.cashflowService.getHealthScore(userId)
      ]);

      const netProfit = revenueMetrics.totalRevenue - expensesSummary.totalAmount;
      const profitMargin = (netProfit / revenueMetrics.totalRevenue) * 100;

      return {
        totalRevenue: revenueMetrics.totalRevenue,
        totalExpenses: expensesSummary.totalAmount,
        netProfit,
        profitMargin,
        monthlyGrowth: revenueMetrics.growth,
        cashflowHealth: cashflowHealth.score
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas rápidas:', error);
      throw new Error('Erro interno do servidor');
    }
  }

  async getRecentActivity(userId: string, limit: number = 10): Promise<RecentActivity[]> {
    try {
      const activities: RecentActivity[] = [];

      // Vendas recentes
      const recentSales = await prisma.sale.findMany({
        where: { userId },
        orderBy: { saleDate: 'desc' },
        take: 5,
        include: {
          saleProducts: {
            include: { product: true }
          }
        }
      });

      recentSales.forEach(sale => {
        const productName = sale.saleProducts[0]?.product?.name || 'Produto';
        activities.push({
          type: 'sale',
          title: `Nova venda - ${productName}`,
          description: `${sale.customerName}`,
          amount: sale.totalPrice,
          date: sale.saleDate,
          status: sale.status
        });
      });

      // Despesas recentes
      const recentExpenses = await prisma.expense.findMany({
        where: { userId },
        orderBy: { expenseDate: 'desc' },
        take: 5
      });

      recentExpenses.forEach(expense => {
        activities.push({
          type: 'expense',
          title: `Despesa - ${expense.description}`,
          description: `Categoria: ${expense.category}`,
          amount: expense.amount,
          date: expense.expenseDate
        });
      });

      // Alertas tributários
      const taxSettings = await this.taxService.getSettings(userId);
      const nextPayment = await this.taxService.getUpcomingPayments(userId);
      
      if (nextPayment.length > 0) {
        const payment = nextPayment[0];
        const daysUntilDue = Math.ceil((payment.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDue <= 15) {
          activities.push({
            type: 'tax',
            title: `DAS vencendo em ${daysUntilDue} dias`,
            description: `Referência: ${payment.referenceMonth}`,
            amount: payment.amount,
            date: payment.dueDate
          });
        }
      }

      // Alertas de fluxo de caixa
      const healthScore = await this.cashflowService.getHealthScore(userId);
      if (healthScore.score < 70) {
        activities.push({
          type: 'alert',
          title: 'Atenção ao fluxo de caixa',
          description: `Score de saúde: ${healthScore.score}/100`,
          date: new Date()
        });
      }

      // Ordenar por data e limitar
      return activities
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, limit);

    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error);
      throw new Error('Erro interno do servidor');
    }
  }

  async getTopProducts(userId: string, limit: number = 5) {
    try {
      return await this.revenueService.getTopProducts(userId, limit);
    } catch (error) {
      console.error('Erro ao buscar top produtos:', error);
      throw new Error('Erro interno do servidor');
    }
  }

  async getExpensesByCategory(userId: string) {
    try {
      const analysis = await this.expenseService.getAnalysisByCategory(userId);
      return analysis.categories;
    } catch (error) {
      console.error('Erro ao buscar despesas por categoria:', error);
      throw new Error('Erro interno do servidor');
    }
  }

  async getCashflowChart(userId: string, months: number = 6) {
    try {
      const historical = await this.cashflowService.getHistoricalData(userId, months);
      const projections = await this.cashflowService.getProjections(userId, 3);

      return {
        historical: historical.monthlyData,
        projections: projections.realistic.monthlyProjections
      };
    } catch (error) {
      console.error('Erro ao buscar dados de fluxo de caixa:', error);
      throw new Error('Erro interno do servidor');
    }
  }

  // Métodos auxiliares privados
  private calculateROI(revenue: number, expenses: number): number {
    if (expenses === 0) return 0;
    return ((revenue - expenses) / expenses) * 100;
  }

  private calculateProfitMargin(revenue: number, expenses: number): number {
    if (revenue === 0) return 0;
    return ((revenue - expenses) / revenue) * 100;
  }

  private calculateBurnRate(monthlyExpenses: number): number {
    return monthlyExpenses;
  }

  private calculateMonthlyRecurring(monthlyRevenue: number): number {
    // Aproximação - poderia ser mais precisa com dados de assinatura
    return monthlyRevenue * 0.7; // Assume 70% é recorrente
  }

  private determineTrend(direction: number): 'up' | 'down' | 'stable' {
    if (direction > 0.05) return 'up';
    if (direction < -0.05) return 'down';
    return 'stable';
  }
}