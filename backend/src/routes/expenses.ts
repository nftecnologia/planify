import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { ExpenseService, CreateExpenseData, UpdateExpenseData } from '../services/expenseService';

import { Request, Response } from 'express';

interface ExpenseFilters {
  category?: string;
  startDate?: Date;
  endDate?: Date;
  isRecurring?: boolean;
  recurrenceType?: 'monthly' | 'yearly';
}

const router = Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

/**
 * GET /api/expenses
 * Lista despesas com filtros e paginação
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const filters: ExpenseFilters = {
      ...(req.query.category && { category: req.query.category as string }),
      ...(req.query.isRecurring && { isRecurring: req.query.isRecurring === 'true' }),
      ...(req.query.recurrenceType && { recurrenceType: req.query.recurrenceType as 'monthly' | 'yearly' }),
      ...(req.query.startDate && { startDate: new Date(req.query.startDate as string) }),
      ...(req.query.endDate && { endDate: new Date(req.query.endDate as string) }),
    };

    const result = await ExpenseService.getExpenses(userId, filters, page, limit);
    
    res.json({
      success: true,
      data: result.expenses,
      pagination: {
        page,
        limit,
        total: result.total,
        hasMore: result.hasMore,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar despesas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

/**
 * GET /api/expenses/summary
 * Resumo de despesas por período
 */
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const summary = await ExpenseService.getExpenseSummary(userId, startDate, endDate);
    
    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Erro ao buscar resumo de despesas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

/**
 * GET /api/expenses/categories
 * Lista de categorias disponíveis
 */
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = ExpenseService.getAvailableCategories();
    
    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

/**
 * GET /api/expenses/analysis
 * Análise de despesas por categoria
 */
router.get('/analysis', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const analysis = await ExpenseService.getCategoryAnalysis(userId, startDate, endDate);
    
    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('Erro ao buscar análise de despesas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

/**
 * GET /api/expenses/:id
 * Busca uma despesa específica
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const expenseId = req.params.id;

    const expense = await ExpenseService.getExpenseById(userId, expenseId);
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Despesa não encontrada',
      });
    }

    res.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error('Erro ao buscar despesa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

/**
 * POST /api/expenses
 * Cria uma nova despesa
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const data: CreateExpenseData = {
      description: req.body.description,
      amount: parseFloat(req.body.amount),
      category: req.body.category,
      expenseDate: new Date(req.body.expenseDate),
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
      isRecurring: req.body.isRecurring || false,
      recurrenceType: req.body.recurrenceType,
      invoiceUrl: req.body.invoiceUrl,
      invoiceData: req.body.invoiceData,
    };

    // Validações básicas
    if (!data.description || data.description.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Descrição é obrigatória',
      });
    }

    if (!data.amount || data.amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valor deve ser maior que zero',
      });
    }

    if (!data.expenseDate) {
      return res.status(400).json({
        success: false,
        message: 'Data da despesa é obrigatória',
      });
    }

    if (data.isRecurring && !data.recurrenceType) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de recorrência é obrigatório para despesas recorrentes',
      });
    }

    const expense = await ExpenseService.createExpense(userId, data);
    
    res.status(201).json({
      success: true,
      data: expense,
      message: 'Despesa criada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao criar despesa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

/**
 * PUT /api/expenses/:id
 * Atualiza uma despesa
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const expenseId = req.params.id;
    
    const data: UpdateExpenseData = {
      ...(req.body.description && { description: req.body.description }),
      ...(req.body.amount && { amount: parseFloat(req.body.amount) }),
      ...(req.body.category && { category: req.body.category }),
      ...(req.body.expenseDate && { expenseDate: new Date(req.body.expenseDate) }),
      ...(req.body.dueDate !== undefined && { 
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined 
      }),
      ...(req.body.isRecurring !== undefined && { isRecurring: req.body.isRecurring }),
      ...(req.body.recurrenceType !== undefined && { recurrenceType: req.body.recurrenceType }),
      ...(req.body.invoiceUrl !== undefined && { invoiceUrl: req.body.invoiceUrl }),
      ...(req.body.invoiceData !== undefined && { invoiceData: req.body.invoiceData }),
    };

    // Validações
    if (data.amount && data.amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valor deve ser maior que zero',
      });
    }

    if (data.isRecurring && !data.recurrenceType) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de recorrência é obrigatório para despesas recorrentes',
      });
    }

    const expense = await ExpenseService.updateExpense(userId, expenseId, data);
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Despesa não encontrada',
      });
    }

    res.json({
      success: true,
      data: expense,
      message: 'Despesa atualizada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar despesa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

/**
 * DELETE /api/expenses/:id
 * Remove uma despesa
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const expenseId = req.params.id;

    const deleted = await ExpenseService.deleteExpense(userId, expenseId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Despesa não encontrada',
      });
    }

    res.json({
      success: true,
      message: 'Despesa removida com sucesso',
    });
  } catch (error) {
    console.error('Erro ao remover despesa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

/**
 * POST /api/expenses/ocr
 * Processa OCR de nota fiscal (mock)
 */
router.post('/ocr', async (req: Request, res: Response) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'URL da imagem é obrigatória',
      });
    }

    const result = await ExpenseService.processInvoiceOCR(imageUrl);
    
    res.json({
      success: true,
      data: result,
      message: 'OCR processado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao processar OCR:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

export default router;