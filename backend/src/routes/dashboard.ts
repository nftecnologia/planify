import { Router, Response } from 'express';
import { DashboardService } from '../services/dashboardService';
import { authenticateToken } from '../middleware/auth';
import { AuthenticatedRequest, ApiResponse } from '../types';

const router = Router();
const dashboardService = new DashboardService();

// GET /api/dashboard/metrics - Métricas consolidadas
router.get('/metrics', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'Usuário não autenticado'
      };
      return res.status(401).json(response);
    }

    const metrics = await dashboardService.getConsolidatedMetrics(req.user.userId);

    const response: ApiResponse = {
      success: true,
      data: metrics
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar métricas do dashboard:', error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    };
    res.status(500).json(response);
  }
});

// GET /api/dashboard/quick-stats - Estatísticas rápidas
router.get('/quick-stats', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'Usuário não autenticado'
      };
      return res.status(401).json(response);
    }

    const stats = await dashboardService.getQuickStats(req.user.userId);

    const response: ApiResponse = {
      success: true,
      data: stats
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar estatísticas rápidas:', error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    };
    res.status(500).json(response);
  }
});

// GET /api/dashboard/recent-activity - Atividades recentes
router.get('/recent-activity', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'Usuário não autenticado'
      };
      return res.status(401).json(response);
    }

    const limit = parseInt(req.query.limit as string) || 10;
    const activities = await dashboardService.getRecentActivity(req.user.userId, limit);

    const response: ApiResponse = {
      success: true,
      data: activities
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar atividades recentes:', error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    };
    res.status(500).json(response);
  }
});

// GET /api/dashboard/top-products - Top produtos
router.get('/top-products', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'Usuário não autenticado'
      };
      return res.status(401).json(response);
    }

    const limit = parseInt(req.query.limit as string) || 5;
    const topProducts = await dashboardService.getTopProducts(req.user.userId, limit);

    const response: ApiResponse = {
      success: true,
      data: topProducts
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar top produtos:', error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    };
    res.status(500).json(response);
  }
});

// GET /api/dashboard/expenses-by-category - Despesas por categoria
router.get('/expenses-by-category', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'Usuário não autenticado'
      };
      return res.status(401).json(response);
    }

    const expensesByCategory = await dashboardService.getExpensesByCategory(req.user.userId);

    const response: ApiResponse = {
      success: true,
      data: expensesByCategory
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar despesas por categoria:', error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    };
    res.status(500).json(response);
  }
});

// GET /api/dashboard/cashflow-chart - Dados para gráfico de fluxo de caixa
router.get('/cashflow-chart', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'Usuário não autenticado'
      };
      return res.status(401).json(response);
    }

    const months = parseInt(req.query.months as string) || 6;
    const cashflowChart = await dashboardService.getCashflowChart(req.user.userId, months);

    const response: ApiResponse = {
      success: true,
      data: cashflowChart
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar dados de fluxo de caixa:', error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    };
    res.status(500).json(response);
  }
});

// GET /api/dashboard/overview - Visão geral completa
router.get('/overview', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'Usuário não autenticado'
      };
      return res.status(401).json(response);
    }

    // Buscar dados consolidados em paralelo
    const [
      metrics,
      quickStats,
      recentActivity,
      topProducts,
      expensesByCategory,
      cashflowChart
    ] = await Promise.all([
      dashboardService.getConsolidatedMetrics(req.user.userId),
      dashboardService.getQuickStats(req.user.userId),
      dashboardService.getRecentActivity(req.user.userId, 5),
      dashboardService.getTopProducts(req.user.userId, 3),
      dashboardService.getExpensesByCategory(req.user.userId),
      dashboardService.getCashflowChart(req.user.userId, 6)
    ]);

    const overview = {
      metrics,
      quickStats,
      recentActivity,
      topProducts,
      expensesByCategory,
      cashflowChart
    };

    const response: ApiResponse = {
      success: true,
      data: overview
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar visão geral:', error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    };
    res.status(500).json(response);
  }
});

export default router;