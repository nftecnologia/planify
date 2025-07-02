import { prisma } from '../lib/prisma';
import { Expense } from '@prisma/client';

export interface CreateExpenseData {
  description: string;
  amount: number;
  category?: string;
  expenseDate: Date;
  dueDate?: Date;
  isRecurring?: boolean;
  recurrenceType?: 'monthly' | 'yearly';
  invoiceUrl?: string;
  invoiceData?: any;
}

export interface UpdateExpenseData extends Partial<CreateExpenseData> {}

interface ExpenseFilters {
  category?: string;
  startDate?: Date;
  endDate?: Date;
  isRecurring?: boolean;
  recurrenceType?: 'monthly' | 'yearly';
}

export interface ExpenseSummary {
  totalAmount: number;
  byCategory: { [key: string]: number };
  recurringTotal: number;
  oneTimeTotal: number;
}

export class ExpenseService {
  // Categorias padrão e suas keywords para classificação automática
  private static readonly CATEGORY_KEYWORDS = {
    marketing: ['meta', 'facebook', 'instagram', 'google ads', 'adwords', 'tiktok', 'anuncio', 'publicidade', 'marketing', 'ads'],
    tools: ['github', 'vercel', 'aws', 'azure', 'figma', 'notion', 'slack', 'zoom', 'ferramentas', 'software', 'saas'],
    education: ['curso', 'treinamento', 'udemy', 'alura', 'rocketseat', 'educacao', 'capacitacao', 'livro'],
    operational: ['energia', 'internet', 'telefone', 'aluguel', 'escritorio', 'limpeza', 'manutencao', 'operacional'],
    taxes: ['imposto', 'taxa', 'irpf', 'inss', 'pis', 'cofins', 'csll', 'icms', 'iss', 'tributario', 'contabilidade']
  };

  /**
   * Classifica automaticamente uma despesa baseada na descrição
   */
  private static classifyExpense(description: string): string {
    const normalizedDescription = description.toLowerCase();
    
    for (const [category, keywords] of Object.entries(this.CATEGORY_KEYWORDS)) {
      if (keywords.some(keyword => normalizedDescription.includes(keyword))) {
        return category;
      }
    }
    
    return 'operational'; // categoria padrão
  }

  /**
   * Cria uma nova despesa
   */
  static async createExpense(userId: string, data: CreateExpenseData): Promise<Expense> {
    // Auto-classificação se categoria não foi fornecida
    const category = data.category || this.classifyExpense(data.description);
    
    const expense = await prisma.expense.create({
      data: {
        userId,
        description: data.description,
        amount: data.amount,
        category,
        expenseDate: data.expenseDate,
        dueDate: data.dueDate || null,
        isRecurring: data.isRecurring || false,
        recurrenceType: data.recurrenceType || null,
        invoiceUrl: data.invoiceUrl || null,
        invoiceData: data.invoiceData ? JSON.stringify(data.invoiceData) : null,
      },
    });

    // Se é uma despesa recorrente, criar as próximas ocorrências
    if (expense.isRecurring && expense.recurrenceType) {
      await this.createRecurringExpenses(expense);
    }

    return expense;
  }

  /**
   * Cria despesas recorrentes futuras (próximos 6 meses)
   */
  private static async createRecurringExpenses(baseExpense: Expense): Promise<void> {
    if (!baseExpense.recurrenceType) return;

    const futureExpenses: any[] = [];
    const baseDate = new Date(baseExpense.expenseDate);
    
    // Criar despesas para os próximos 6 meses
    for (let i = 1; i <= 6; i++) {
      const nextDate = new Date(baseDate);
      
      if (baseExpense.recurrenceType === 'monthly') {
        nextDate.setMonth(nextDate.getMonth() + i);
      } else if (baseExpense.recurrenceType === 'yearly') {
        nextDate.setFullYear(nextDate.getFullYear() + i);
        if (i > 1) break; // Para anual, só criar 1 ano à frente
      }

      futureExpenses.push({
        userId: baseExpense.userId,
        description: `${baseExpense.description} (Recorrente)`,
        amount: baseExpense.amount,
        category: baseExpense.category,
        expenseDate: nextDate,
        dueDate: baseExpense.dueDate ? new Date(nextDate.getTime() + (baseExpense.dueDate.getTime() - baseExpense.expenseDate.getTime())) : null,
        isRecurring: true,
        recurrenceType: baseExpense.recurrenceType,
        invoiceUrl: null,
        invoiceData: null,
      });
    }

    if (futureExpenses.length > 0) {
      await prisma.expense.createMany({
        data: futureExpenses,
      });
    }
  }

  /**
   * Lista despesas com filtros e paginação
   */
  static async getExpenses(
    userId: string,
    filters: ExpenseFilters = {},
    page: number = 1,
    limit: number = 50
  ): Promise<{ expenses: Expense[]; total: number; hasMore: boolean }> {
    const where: Prisma.ExpenseWhereInput = {
      userId,
      ...(filters.category && { category: filters.category }),
      ...(filters.isRecurring !== undefined && { isRecurring: filters.isRecurring }),
      ...(filters.recurrenceType && { recurrenceType: filters.recurrenceType }),
      ...(filters.startDate || filters.endDate) && {
        expenseDate: {
          ...(filters.startDate && { gte: filters.startDate }),
          ...(filters.endDate && { lte: filters.endDate }),
        },
      },
    };

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { expenseDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.expense.count({ where }),
    ]);

    return {
      expenses,
      total,
      hasMore: total > page * limit,
    };
  }

  /**
   * Busca uma despesa específica
   */
  static async getExpenseById(userId: string, expenseId: string): Promise<Expense | null> {
    return prisma.expense.findFirst({
      where: {
        id: expenseId,
        userId,
      },
    });
  }

  /**
   * Atualiza uma despesa
   */
  static async updateExpense(
    userId: string,
    expenseId: string,
    data: UpdateExpenseData
  ): Promise<Expense | null> {
    const expense = await this.getExpenseById(userId, expenseId);
    if (!expense) return null;

    // Auto-classificação se categoria não foi fornecida mas descrição mudou
    const category = data.category || 
      (data.description && data.description !== expense.description 
        ? this.classifyExpense(data.description) 
        : expense.category);

    return prisma.expense.update({
      where: { id: expenseId },
      data: {
        ...(data.description && { description: data.description }),
        ...(data.amount && { amount: data.amount }),
        category,
        ...(data.expenseDate && { expenseDate: data.expenseDate }),
        ...(data.dueDate !== undefined && { dueDate: data.dueDate || null }),
        ...(data.isRecurring !== undefined && { isRecurring: data.isRecurring }),
        ...(data.recurrenceType !== undefined && { recurrenceType: data.recurrenceType || null }),
        ...(data.invoiceUrl !== undefined && { invoiceUrl: data.invoiceUrl || null }),
        ...(data.invoiceData !== undefined && { invoiceData: data.invoiceData ? JSON.stringify(data.invoiceData) : null }),
      },
    });
  }

  /**
   * Remove uma despesa
   */
  static async deleteExpense(userId: string, expenseId: string): Promise<boolean> {
    const expense = await this.getExpenseById(userId, expenseId);
    if (!expense) return false;

    await prisma.expense.delete({
      where: { id: expenseId },
    });

    return true;
  }

  /**
   * Obter resumo de despesas por período
   */
  static async getExpenseSummary(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ExpenseSummary> {
    const where: Prisma.ExpenseWhereInput = {
      userId,
      ...(startDate || endDate) && {
        expenseDate: {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lte: endDate }),
        },
      },
    };

    const expenses = await prisma.expense.findMany({
      where,
      select: {
        amount: true,
        category: true,
        isRecurring: true,
      },
    });

    const summary: ExpenseSummary = {
      totalAmount: 0,
      byCategory: {},
      recurringTotal: 0,
      oneTimeTotal: 0,
    };

    expenses.forEach(expense => {
      const amount = expense.amount;
      
      summary.totalAmount += amount;
      summary.byCategory[expense.category] = (summary.byCategory[expense.category] || 0) + amount;
      
      if (expense.isRecurring) {
        summary.recurringTotal += amount;
      } else {
        summary.oneTimeTotal += amount;
      }
    });

    return summary;
  }

  /**
   * Obter categorias disponíveis
   */
  static getAvailableCategories(): { value: string; label: string; keywords: string[] }[] {
    return [
      { value: 'marketing', label: 'Marketing', keywords: this.CATEGORY_KEYWORDS.marketing },
      { value: 'tools', label: 'Ferramentas', keywords: this.CATEGORY_KEYWORDS.tools },
      { value: 'education', label: 'Educação', keywords: this.CATEGORY_KEYWORDS.education },
      { value: 'operational', label: 'Operacional', keywords: this.CATEGORY_KEYWORDS.operational },
      { value: 'taxes', label: 'Tributário', keywords: this.CATEGORY_KEYWORDS.taxes },
    ];
  }

  /**
   * Análise de despesas por categoria (percentual)
   */
  static async getCategoryAnalysis(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{ category: string; amount: number; percentage: number; label: string }[]> {
    const summary = await this.getExpenseSummary(userId, startDate, endDate);
    const categories = this.getAvailableCategories();
    
    return categories
      .map(cat => ({
        category: cat.value,
        label: cat.label,
        amount: summary.byCategory[cat.value] || 0,
        percentage: summary.totalAmount > 0 
          ? Math.round(((summary.byCategory[cat.value] || 0) / summary.totalAmount) * 100)
          : 0,
      }))
      .filter(item => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }

  /**
   * Mock de análise OCR para nota fiscal
   */
  static async processInvoiceOCR(_imageUrl: string): Promise<any> {
    // Simulação de OCR - em produção seria integração com Azure Cognitive Services ou similar
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simula processamento
    
    return {
      confidence: 0.95,
      extractedData: {
        totalAmount: Math.random() * 1000 + 50,
        issueDate: new Date().toISOString().split('T')[0],
        vendor: 'Empresa Exemplo LTDA',
        items: [
          { description: 'Serviço de exemplo', amount: Math.random() * 500 + 25 }
        ],
        taxes: {
          pis: 1.65,
          cofins: 7.6,
          iss: 5.0
        }
      },
      suggestedCategory: 'operational'
    };
  }
}