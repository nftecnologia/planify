import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { auth } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { RevenueService, SaleFilters } from '../services/revenueService';
import { AuthenticatedRequest, ApiResponse, PaginatedResponse } from '../types';

const router = Router();

// Middleware de autenticação para todas as rotas
router.use(auth);

/**
 * GET /api/revenue/sales
 * Lista vendas com filtros e paginação
 */
router.get(
  '/sales',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número maior que 0'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit deve estar entre 1 e 100'),
    query('startDate').optional().isISO8601().withMessage('Data inicial deve estar no formato ISO8601'),
    query('endDate').optional().isISO8601().withMessage('Data final deve estar no formato ISO8601'),
    query('status').optional().isIn(['APPROVED', 'PENDING', 'REFUNDED', 'CHARGEBACK']).withMessage('Status inválido'),
    query('productId').optional().isUUID().withMessage('ID do produto deve ser um UUID válido'),
    query('utmSource').optional().isString().withMessage('UTM Source deve ser uma string'),
    query('utmCampaign').optional().isString().withMessage('UTM Campaign deve ser uma string'),
    query('minValue').optional().isFloat({ min: 0 }).withMessage('Valor mínimo deve ser um número positivo'),
    query('maxValue').optional().isFloat({ min: 0 }).withMessage('Valor máximo deve ser um número positivo'),
    query('paymentMethod').optional().isString().withMessage('Método de pagamento deve ser uma string'),
  ],
  validateRequest,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const filters: SaleFilters = {};
      
      if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
      if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);
      if (req.query.status) filters.status = req.query.status as string;
      if (req.query.productId) filters.productId = req.query.productId as string;
      if (req.query.utmSource) filters.utmSource = req.query.utmSource as string;
      if (req.query.utmCampaign) filters.utmCampaign = req.query.utmCampaign as string;
      if (req.query.minValue) filters.minValue = parseFloat(req.query.minValue as string);
      if (req.query.maxValue) filters.maxValue = parseFloat(req.query.maxValue as string);
      if (req.query.paymentMethod) filters.paymentMethod = req.query.paymentMethod as string;

      const result = await RevenueService.getSales(userId, filters, page, limit);

      const response: PaginatedResponse<typeof result.sales[0]> = {
        success: true,
        data: result.sales,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      };

      res.json(response);
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
      });
    }
  }
);

/**
 * GET /api/revenue/metrics
 * Retorna métricas de receita
 */
router.get(
  '/metrics',
  [
    query('startDate').optional().isISO8601().withMessage('Data inicial deve estar no formato ISO8601'),
    query('endDate').optional().isISO8601().withMessage('Data final deve estar no formato ISO8601'),
  ],
  validateRequest,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const metrics = await RevenueService.getRevenueMetrics(userId, startDate, endDate);

      const response: ApiResponse<typeof metrics> = {
        success: true,
        data: metrics,
      };

      res.json(response);
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
      });
    }
  }
);

/**
 * POST /api/revenue/sales
 * Cria uma nova venda (simulação de webhook)
 */
router.post(
  '/sales',
  [
    body('customerName').optional().isString().withMessage('Nome do cliente deve ser uma string'),
    body('customerEmail').optional().isEmail().withMessage('Email do cliente deve ser válido'),
    body('customerDocument').optional().isString().withMessage('Documento deve ser uma string'),
    body('customerPhone').optional().isString().withMessage('Telefone deve ser uma string'),
    body('paymentMethod').optional().isString().withMessage('Método de pagamento deve ser uma string'),
    body('paymentBrand').optional().isString().withMessage('Bandeira deve ser uma string'),
    body('paymentInstallments').optional().isInt({ min: 1 }).withMessage('Parcelas deve ser um número maior que 0'),
    body('totalPrice').isFloat({ min: 0 }).withMessage('Preço total deve ser um número positivo'),
    body('saleType').isIn(['ONE_TIME', 'RECURRING']).withMessage('Tipo de venda inválido'),
    body('status').isIn(['APPROVED', 'PENDING', 'REFUNDED', 'CHARGEBACK']).withMessage('Status inválido'),
    body('utmSource').optional().isString().withMessage('UTM Source deve ser uma string'),
    body('utmMedium').optional().isString().withMessage('UTM Medium deve ser uma string'),
    body('utmCampaign').optional().isString().withMessage('UTM Campaign deve ser uma string'),
    body('utmTerm').optional().isString().withMessage('UTM Term deve ser uma string'),
    body('utmContent').optional().isString().withMessage('UTM Content deve ser uma string'),
    body('saleDate').optional().isISO8601().withMessage('Data da venda deve estar no formato ISO8601'),
    body('products').isArray({ min: 1 }).withMessage('Produtos deve ser um array com pelo menos um item'),
    body('products.*.productName').isString().withMessage('Nome do produto é obrigatório'),
    body('products.*.offerName').optional().isString().withMessage('Nome da oferta deve ser uma string'),
    body('products.*.description').optional().isString().withMessage('Descrição deve ser uma string'),
    body('products.*.price').isFloat({ min: 0 }).withMessage('Preço do produto deve ser um número positivo'),
    body('products.*.isOrderBump').optional().isBoolean().withMessage('Order bump deve ser um boolean'),
    body('products.*.productId').optional().isUUID().withMessage('ID do produto deve ser um UUID válido'),
  ],
  validateRequest,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const saleData = req.body;

      const sale = await RevenueService.createSale(userId, saleData);

      const response: ApiResponse<typeof sale> = {
        success: true,
        data: sale,
        message: 'Venda criada com sucesso',
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Erro ao criar venda:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
      });
    }
  }
);

/**
 * PUT /api/revenue/sales/:saleId/status
 * Atualiza status de uma venda
 */
router.put(
  '/sales/:saleId/status',
  [
    param('saleId').isUUID().withMessage('ID da venda deve ser um UUID válido'),
    body('status').isIn(['APPROVED', 'PENDING', 'REFUNDED', 'CHARGEBACK']).withMessage('Status inválido'),
  ],
  validateRequest,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { saleId } = req.params;
      const { status } = req.body;

      const sale = await RevenueService.updateSaleStatus(saleId, userId, status);

      const response: ApiResponse<typeof sale> = {
        success: true,
        data: sale,
        message: 'Status da venda atualizado com sucesso',
      };

      res.json(response);
    } catch (error) {
      console.error('Erro ao atualizar status da venda:', error);
      
      if (error instanceof Error && error.message.includes('Record to update not found')) {
        res.status(404).json({
          success: false,
          error: 'Venda não encontrada',
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
      });
    }
  }
);

/**
 * DELETE /api/revenue/sales/:saleId
 * Deleta uma venda
 */
router.delete(
  '/sales/:saleId',
  [
    param('saleId').isUUID().withMessage('ID da venda deve ser um UUID válido'),
  ],
  validateRequest,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { saleId } = req.params;

      await RevenueService.deleteSale(saleId, userId);

      const response: ApiResponse<null> = {
        success: true,
        message: 'Venda deletada com sucesso',
      };

      res.json(response);
    } catch (error) {
      console.error('Erro ao deletar venda:', error);
      
      if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
        res.status(404).json({
          success: false,
          error: 'Venda não encontrada',
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
      });
    }
  }
);

/**
 * POST /api/revenue/mock-data
 * Gera dados mock para demonstração
 */
router.post(
  '/mock-data',
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;

      await RevenueService.generateMockData(userId);

      const response: ApiResponse<null> = {
        success: true,
        message: 'Dados mock gerados com sucesso',
      };

      res.json(response);
    } catch (error) {
      console.error('Erro ao gerar dados mock:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
      });
    }
  }
);

export default router;