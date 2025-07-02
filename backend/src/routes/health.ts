import { Router, Request, Response } from 'express';
import { ApiResponse } from '../types';

const router = Router();

/**
 * GET /api/health
 * Health check endpoint para verificar se a API está funcionando
 */
router.get('/health', (_req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: true,
    message: 'FinanceInfo Pro API está funcionando',
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env['NODE_ENV'] || 'development',
      version: '1.0.0'
    }
  };

  res.status(200).json(response);
});

/**
 * GET /api/health/detailed
 * Health check detalhado com informações do sistema
 */
router.get('/health/detailed', async (_req: Request, res: Response): Promise<void> => {
  try {
    // Aqui poderia adicionar verificações de banco de dados, Redis, etc.
    const healthData = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env['NODE_ENV'] || 'development',
      version: '1.0.0',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      },
      database: {
        status: 'connected', // Será implementado com Prisma
        latency: null
      },
      redis: {
        status: 'not_implemented', // Será implementado com Bull/Redis
        latency: null
      }
    };

    const response: ApiResponse = {
      success: true,
      message: 'Sistema operacional',
      data: healthData
    };

    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Erro ao verificar status do sistema',
      data: {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    };

    res.status(500).json(response);
  }
});

export default router;