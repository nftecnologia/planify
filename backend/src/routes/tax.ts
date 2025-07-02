// Tax Routes - API de Cálculos Tributários
import { Router, Request, Response } from 'express';
import { TaxService, TaxSettings, MonthlyRevenue } from '../services/taxService';
import { auth } from '../middleware/auth';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const router = Router();

// Esquemas de validação
const TaxSettingsSchema = z.object({
  regime: z.enum(['MEI', 'SIMPLES_NACIONAL', 'LUCRO_PRESUMIDO']),
  cnpj: z.string().length(14),
  startDate: z.string().transform(str => new Date(str)),
  isServiceProvider: z.boolean(),
  mensalReservePercentage: z.number().min(0).max(100).optional()
});

const CalculateTaxSchema = z.object({
  revenue: z.number().positive(),
  regime: z.enum(['MEI', 'SIMPLES_NACIONAL', 'LUCRO_PRESUMIDO']),
  isServiceProvider: z.boolean().optional().default(true)
});

const CompareRegimesSchema = z.object({
  annualRevenue: z.number().positive(),
  isServiceProvider: z.boolean().optional().default(true)
});

const ReserveCalculationSchema = z.object({
  monthlyRevenues: z.array(z.object({
    month: z.number().min(1).max(12),
    year: z.number().min(2020),
    revenue: z.number().min(0)
  })),
  currentReserve: z.number().min(0).optional().default(0)
});

/**
 * GET /api/tax/settings
 * Obtém configurações tributárias do usuário
 */
router.get('/settings', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId },
      select: { taxSettings: true }
    });

    if (!userSettings?.taxSettings) {
      return res.json({
        success: true,
        data: null,
        message: 'Configurações tributárias não encontradas'
      });
    }

    res.json({
      success: true,
      data: userSettings.taxSettings,
      message: 'Configurações tributárias obtidas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao obter configurações tributárias:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/tax/settings
 * Salva/atualiza configurações tributárias do usuário
 */
router.post('/settings', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const validatedData = TaxSettingsSchema.parse(req.body);

    // Valida as configurações usando o TaxService
    const validation = TaxService.validateTaxSettings(validatedData);
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Configurações inválidas',
        details: validation.errors
      });
    }

    // Upsert das configurações
    await prisma.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        taxSettings: validatedData
      },
      update: {
        taxSettings: validatedData
      }
    });

    res.json({
      success: true,
      data: validatedData,
      message: 'Configurações tributárias salvas com sucesso'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      });
    }

    console.error('Erro ao salvar configurações tributárias:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/tax/calculate
 * Calcula impostos baseado no regime e receita
 */
router.post('/calculate', auth, async (req: Request, res: Response) => {
  try {
    const { revenue, regime, isServiceProvider } = CalculateTaxSchema.parse(req.body);
    
    let calculation;
    
    switch (regime) {
      case 'MEI':
        calculation = TaxService.calculateMEI(revenue, isServiceProvider);
        break;
      case 'SIMPLES_NACIONAL':
        calculation = TaxService.calculateSimplesNacional(revenue);
        break;
      case 'LUCRO_PRESUMIDO':
        calculation = TaxService.calculateLucroPresumido(revenue);
        break;
      default:
        throw new Error('Regime tributário não suportado');
    }

    res.json({
      success: true,
      data: calculation,
      message: 'Cálculo tributário realizado com sucesso'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      });
    }

    console.error('Erro no cálculo tributário:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro no cálculo tributário'
    });
  }
});

/**
 * POST /api/tax/compare-regimes
 * Compara custos entre regimes tributários
 */
router.post('/compare-regimes', auth, async (req: Request, res: Response) => {
  try {
    const { annualRevenue, isServiceProvider } = CompareRegimesSchema.parse(req.body);
    
    const comparison = TaxService.compareRegimes(annualRevenue, isServiceProvider);

    res.json({
      success: true,
      data: comparison,
      message: 'Comparação de regimes realizada com sucesso'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      });
    }

    console.error('Erro na comparação de regimes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/tax/calculate-reserve
 * Calcula reserva necessária baseada no histórico de receitas
 */
router.post('/calculate-reserve', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { monthlyRevenues, currentReserve } = ReserveCalculationSchema.parse(req.body);

    // Busca configurações tributárias do usuário
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId },
      select: { taxSettings: true }
    });

    if (!userSettings?.taxSettings) {
      return res.status(400).json({
        success: false,
        error: 'Configurações tributárias não encontradas. Configure primeiro seu regime tributário.'
      });
    }

    const taxSettings = userSettings.taxSettings as TaxSettings;
    const reserve = TaxService.calculateTaxReserve(taxSettings, monthlyRevenues, currentReserve);

    res.json({
      success: true,
      data: reserve,
      message: 'Cálculo de reserva realizado com sucesso'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      });
    }

    console.error('Erro no cálculo de reserva:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/tax/calendar/:year
 * Gera calendário de pagamentos DAS para o ano
 */
router.get('/calendar/:year', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const year = parseInt(req.params.year);
    
    if (year < 2020 || year > 2030) {
      return res.status(400).json({
        success: false,
        error: 'Ano deve estar entre 2020 e 2030'
      });
    }

    // Busca configurações e receitas do usuário
    const [userSettings, sales] = await Promise.all([
      prisma.userSettings.findUnique({
        where: { userId },
        select: { taxSettings: true }
      }),
      prisma.sale.findMany({
        where: { 
          userId,
          saleDate: {
            gte: new Date(year, 0, 1),
            lt: new Date(year + 1, 0, 1)
          },
          status: 'APPROVED'
        },
        select: {
          totalPrice: true,
          saleDate: true
        }
      })
    ]);

    if (!userSettings?.taxSettings) {
      return res.status(400).json({
        success: false,
        error: 'Configure primeiro suas configurações tributárias'
      });
    }

    const taxSettings = userSettings.taxSettings as TaxSettings;
    
    // Calcula receita média mensal para estimar DAS
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.totalPrice), 0);
    const avgMonthlyRevenue = totalRevenue / 12;
    
    let monthlyTax;
    
    switch (taxSettings.regime) {
      case 'MEI':
        const meiCalc = TaxService.calculateMEI(totalRevenue || 50000, taxSettings.isServiceProvider);
        monthlyTax = meiCalc.taxAmount;
        break;
      case 'SIMPLES_NACIONAL':
        const simplesCalc = TaxService.calculateSimplesNacional(totalRevenue || 200000);
        monthlyTax = simplesCalc.taxAmount;
        break;
      case 'LUCRO_PRESUMIDO':
        const presumidoCalc = TaxService.calculateLucroPresumido(avgMonthlyRevenue || 20000);
        monthlyTax = presumidoCalc.taxAmount;
        break;
      default:
        monthlyTax = 0;
    }

    const calendar = TaxService.generateDASCalendar(
      year, 
      taxSettings.regime === 'LUCRO_PRESUMIDO' ? 'SIMPLES_NACIONAL' : taxSettings.regime,
      monthlyTax
    );

    res.json({
      success: true,
      data: {
        year,
        regime: taxSettings.regime,
        monthlyTax,
        schedule: calendar,
        totalYear: monthlyTax * 12
      },
      message: 'Calendário tributário gerado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao gerar calendário tributário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/tax/dashboard
 * Dashboard com resumo tributário do usuário
 */
router.get('/dashboard', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const currentYear = new Date().getFullYear();
    
    const [userSettings, sales, expenses] = await Promise.all([
      prisma.userSettings.findUnique({
        where: { userId },
        select: { taxSettings: true }
      }),
      prisma.sale.findMany({
        where: { 
          userId,
          saleDate: {
            gte: new Date(currentYear, 0, 1),
            lt: new Date(currentYear + 1, 0, 1)
          },
          status: 'APPROVED'
        },
        select: {
          totalPrice: true,
          saleDate: true
        }
      }),
      prisma.expense.findMany({
        where: {
          userId,
          category: 'taxes',
          expenseDate: {
            gte: new Date(currentYear, 0, 1),
            lt: new Date(currentYear + 1, 0, 1)
          }
        },
        select: {
          amount: true,
          expenseDate: true
        }
      })
    ]);

    if (!userSettings?.taxSettings) {
      return res.json({
        success: true,
        data: {
          configured: false,
          message: 'Configure suas configurações tributárias para ver o dashboard'
        }
      });
    }

    const taxSettings = userSettings.taxSettings as TaxSettings;
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.totalPrice), 0);
    const totalTaxesPaid = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    
    // Calcula impostos devidos
    let taxCalculation;
    try {
      switch (taxSettings.regime) {
        case 'MEI':
          taxCalculation = TaxService.calculateMEI(totalRevenue, taxSettings.isServiceProvider);
          break;
        case 'SIMPLES_NACIONAL':
          taxCalculation = TaxService.calculateSimplesNacional(totalRevenue);
          break;
        case 'LUCRO_PRESUMIDO':
          taxCalculation = TaxService.calculateLucroPresumido(totalRevenue / 12);
          break;
      }
    } catch (error) {
      // Se houver erro (ex: excedeu limite MEI), usa valores padrão
      taxCalculation = {
        regime: taxSettings.regime,
        taxAmount: 0,
        taxRate: 0,
        dueDate: new Date()
      };
    }

    const monthlyRevenues: MonthlyRevenue[] = [];
    for (let month = 1; month <= 12; month++) {
      const monthSales = sales.filter(sale => {
        const saleMonth = sale.saleDate ? new Date(sale.saleDate).getMonth() + 1 : 0;
        return saleMonth === month;
      });
      const monthRevenue = monthSales.reduce((sum, sale) => sum + Number(sale.totalPrice), 0);
      monthlyRevenues.push({ month, year: currentYear, revenue: monthRevenue });
    }

    const reserve = TaxService.calculateTaxReserve(taxSettings, monthlyRevenues, totalTaxesPaid);

    res.json({
      success: true,
      data: {
        configured: true,
        regime: taxSettings.regime,
        currentYear,
        revenue: {
          total: totalRevenue,
          monthly: monthlyRevenues
        },
        taxes: {
          calculation: taxCalculation,
          paid: totalTaxesPaid,
          pending: (taxCalculation?.taxAmount || 0) * 12 - totalTaxesPaid,
          reserve
        },
        alerts: [
          ...(reserve.insufficientFunds ? ['Reserva insuficiente para próximo pagamento'] : []),
          ...(totalRevenue > 81000 && taxSettings.regime === 'MEI' ? ['Faturamento excedeu limite MEI'] : [])
        ]
      },
      message: 'Dashboard tributário carregado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao carregar dashboard tributário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

export default router;