import { Router, Request, Response } from 'express';
import { cashFlowService } from '../services/cashFlowService';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route GET /api/cashflow/historical
 * @desc Obter dados históricos de fluxo de caixa
 * @access Private
 */
router.get('/historical', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        error: 'Token inválido', 
        code: 'INVALID_TOKEN' 
      });
    }

    const months = parseInt(req.query.months as string) || 6;
    const historicalData = await cashFlowService.getHistoricalData(userId, months);

    res.json({
      success: true,
      data: {
        historicalData,
        metadata: {
          periods: historicalData.length,
          startDate: historicalData[0]?.date || null,
          endDate: historicalData[historicalData.length - 1]?.date || null
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dados históricos:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor', 
      code: 'INTERNAL_ERROR' 
    });
  }
});

/**
 * @route GET /api/cashflow/projections
 * @desc Obter projeções de fluxo de caixa para cenários
 * @access Private
 */
router.get('/projections', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        error: 'Token inválido', 
        code: 'INVALID_TOKEN' 
      });
    }

    const periods = parseInt(req.query.periods as string) || 3;
    const projections = await cashFlowService.generateProjections(userId, periods);

    res.json({
      success: true,
      data: {
        projections,
        metadata: {
          scenarios: projections.length,
          periods,
          generatedAt: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Erro ao gerar projeções:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor', 
      code: 'INTERNAL_ERROR' 
    });
  }
});

/**
 * @route GET /api/cashflow/insights
 * @desc Obter insights e recomendações de fluxo de caixa
 * @access Private
 */
router.get('/insights', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        error: 'Token inválido', 
        code: 'INVALID_TOKEN' 
      });
    }

    const insights = await cashFlowService.generateInsights(userId);

    res.json({
      success: true,
      data: {
        insights,
        metadata: {
          generatedAt: new Date().toISOString(),
          version: '1.0'
        }
      }
    });
  } catch (error) {
    console.error('Erro ao gerar insights:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor', 
      code: 'INTERNAL_ERROR' 
    });
  }
});

/**
 * @route GET /api/cashflow/trend-analysis
 * @desc Obter análise de tendências dos dados históricos
 * @access Private
 */
router.get('/trend-analysis', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        error: 'Token inválido', 
        code: 'INVALID_TOKEN' 
      });
    }

    const months = parseInt(req.query.months as string) || 6;
    const historicalData = await cashFlowService.getHistoricalData(userId, months);
    const trendAnalysis = cashFlowService.analyzeTrend(historicalData);

    res.json({
      success: true,
      data: {
        trendAnalysis,
        metadata: {
          dataPoints: historicalData.length,
          analysisDate: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Erro ao analisar tendências:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor', 
      code: 'INTERNAL_ERROR' 
    });
  }
});

/**
 * @route GET /api/cashflow/dashboard
 * @desc Obter dados consolidados para dashboard de fluxo de caixa
 * @access Private
 */
router.get('/dashboard', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        error: 'Token inválido', 
        code: 'INVALID_TOKEN' 
      });
    }

    // Buscar todos os dados necessários em paralelo
    const [historicalData, projections, insights] = await Promise.all([
      cashFlowService.getHistoricalData(userId, 6),
      cashFlowService.generateProjections(userId, 3),
      cashFlowService.generateInsights(userId)
    ]);

    const trendAnalysis = cashFlowService.analyzeTrend(historicalData);

    res.json({
      success: true,
      data: {
        historical: historicalData,
        projections,
        insights,
        trends: trendAnalysis,
        metadata: {
          lastUpdate: new Date().toISOString(),
          dataQuality: historicalData.length >= 3 ? 'high' : 'limited'
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dashboard:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor', 
      code: 'INTERNAL_ERROR' 
    });
  }
});

/**
 * @route GET /api/cashflow/scenarios/:scenario
 * @desc Obter detalhes de um cenário específico
 * @access Private
 */
router.get('/scenarios/:scenario', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        error: 'Token inválido', 
        code: 'INVALID_TOKEN' 
      });
    }

    const scenario = req.params.scenario as 'pessimistic' | 'realistic' | 'optimistic';
    
    if (!['pessimistic', 'realistic', 'optimistic'].includes(scenario)) {
      return res.status(400).json({
        error: 'Cenário inválido. Use: pessimistic, realistic ou optimistic',
        code: 'INVALID_SCENARIO'
      });
    }

    const periods = parseInt(req.query.periods as string) || 3;
    const allProjections = await cashFlowService.generateProjections(userId, periods);
    const specificProjection = allProjections.find(p => p.scenario === scenario);

    if (!specificProjection) {
      return res.status(404).json({
        error: 'Cenário não encontrado',
        code: 'SCENARIO_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: {
        scenario: specificProjection,
        metadata: {
          scenario,
          periods,
          generatedAt: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar cenário:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor', 
      code: 'INTERNAL_ERROR' 
    });
  }
});

/**
 * @route GET /api/cashflow/health-score
 * @desc Obter score de saúde financeira detalhado
 * @access Private
 */
router.get('/health-score', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        error: 'Token inválido', 
        code: 'INVALID_TOKEN' 
      });
    }

    const insights = await cashFlowService.generateInsights(userId);
    const historicalData = await cashFlowService.getHistoricalData(userId, 6);
    const trends = cashFlowService.analyzeTrend(historicalData);

    // Detalhamento dos fatores do score
    const scoreFactors = {
      balance: insights.currentBalance > 0 ? 20 : 0,
      revenueGrowth: trends.inflowTrend.isGrowing ? 15 : 0,
      costControl: !trends.outflowTrend.isGrowing ? 10 : 0,
      runway: insights.runway >= 6 ? 15 : insights.runway >= 3 ? 10 : 0,
      profitability: insights.monthlyRevenue > insights.monthlyBurnRate ? 10 : 0
    };

    res.json({
      success: true,
      data: {
        healthScore: insights.healthScore,
        scoreFactors,
        breakdown: {
          excellent: insights.healthScore >= 80,
          good: insights.healthScore >= 60 && insights.healthScore < 80,
          warning: insights.healthScore >= 40 && insights.healthScore < 60,
          critical: insights.healthScore < 40
        },
        recommendations: insights.recommendations,
        metadata: {
          calculatedAt: new Date().toISOString(),
          maxScore: 100
        }
      }
    });
  } catch (error) {
    console.error('Erro ao calcular health score:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor', 
      code: 'INTERNAL_ERROR' 
    });
  }
});

export default router;