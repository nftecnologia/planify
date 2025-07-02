import { prisma } from '../lib/prisma';
import { Sale, SaleProduct, Product } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  totalSales: number;
  monthlySales: number;
  averageTicket: number;
  monthlyAverageTicket: number;
  conversionRate: number;
  topProducts: Array<{
    id: string;
    name: string;
    revenue: number;
    sales: number;
    averageTicket: number;
  }>;
  revenueGrowth: {
    currentMonth: number;
    previousMonth: number;
    growth: number;
    growthPercentage: number;
  };
  salesByStatus: {
    approved: number;
    pending: number;
    refunded: number;
    chargeback: number;
  };
  salesByMonth: Array<{
    month: string;
    revenue: number;
    sales: number;
  }>;
}

export interface SaleFilters {
  startDate?: Date;
  endDate?: Date;
  status?: string;
  productId?: string;
  utmSource?: string;
  utmCampaign?: string;
  minValue?: number;
  maxValue?: number;
  paymentMethod?: string;
}

export interface SaleWithProducts extends Sale {
  saleProducts: (SaleProduct & {
    product: Product | null;
  })[];
}

export class RevenueService {
  /**
   * Busca vendas com filtros
   */
  static async getSales(
    userId: string,
    filters: SaleFilters = {},
    page = 1,
    limit = 50
  ): Promise<{
    sales: SaleWithProducts[];
    total: number;
    totalPages: number;
  }> {
    const where: any = {
      userId,
    };

    // Aplicar filtros
    if (filters.startDate || filters.endDate) {
      where.saleDate = {};
      if (filters.startDate) where.saleDate.gte = filters.startDate;
      if (filters.endDate) where.saleDate.lte = filters.endDate;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.utmSource) {
      where.utmSource = { contains: filters.utmSource, mode: 'insensitive' };
    }

    if (filters.utmCampaign) {
      where.utmCampaign = { contains: filters.utmCampaign, mode: 'insensitive' };
    }

    if (filters.minValue || filters.maxValue) {
      where.totalPrice = {};
      if (filters.minValue) where.totalPrice.gte = filters.minValue;
      if (filters.maxValue) where.totalPrice.lte = filters.maxValue;
    }

    if (filters.paymentMethod) {
      where.paymentMethod = filters.paymentMethod;
    }

    // Se filtrar por produto, usar relacionamento
    if (filters.productId) {
      where.saleProducts = {
        some: {
          productId: filters.productId,
        },
      };
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          saleProducts: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          saleDate: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.sale.count({ where }),
    ]);

    return {
      sales,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Calcula métricas de receita
   */
  static async getRevenueMetrics(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<RevenueMetrics> {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Filtro geral
    const generalFilter: any = {
      userId,
      status: 'APPROVED',
    };

    if (startDate || endDate) {
      generalFilter.saleDate = {};
      if (startDate) generalFilter.saleDate.gte = startDate;
      if (endDate) generalFilter.saleDate.lte = endDate;
    }

    // Métricas gerais
    const [totalStats, monthlyStats, previousMonthStats] = await Promise.all([
      // Total geral
      prisma.sale.aggregate({
        where: generalFilter,
        _sum: { totalPrice: true },
        _count: { id: true },
        _avg: { totalPrice: true },
      }),
      // Mês atual
      prisma.sale.aggregate({
        where: {
          userId,
          status: 'APPROVED',
          saleDate: { gte: currentMonthStart },
        },
        _sum: { totalPrice: true },
        _count: { id: true },
        _avg: { totalPrice: true },
      }),
      // Mês anterior
      prisma.sale.aggregate({
        where: {
          userId,
          status: 'APPROVED',
          saleDate: {
            gte: previousMonthStart,
            lte: previousMonthEnd,
          },
        },
        _sum: { totalPrice: true },
        _count: { id: true },
      }),
    ]);

    // Top produtos
    const topProducts = await prisma.saleProduct.groupBy({
      by: ['productId'],
      where: {
        sale: generalFilter,
        productId: { not: null },
      },
      _sum: { price: true },
      _count: { id: true },
      _avg: { price: true },
      orderBy: {
        _sum: { price: 'desc' },
      },
      take: 10,
    });

    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId! },
        });
        return {
          id: item.productId!,
          name: product?.name || 'Produto não encontrado',
          revenue: Number(item._sum.price || 0),
          sales: item._count.id,
          averageTicket: Number(item._avg.price || 0),
        };
      })
    );

    // Vendas por status
    const salesByStatus = await prisma.sale.groupBy({
      by: ['status'],
      where: { userId },
      _count: { id: true },
    });

    const statusCounts = {
      approved: 0,
      pending: 0,
      refunded: 0,
      chargeback: 0,
    };

    salesByStatus.forEach((item) => {
      switch (item.status.toLowerCase()) {
        case 'approved':
          statusCounts.approved = item._count.id;
          break;
        case 'pending':
          statusCounts.pending = item._count.id;
          break;
        case 'refunded':
          statusCounts.refunded = item._count.id;
          break;
        case 'chargeback':
          statusCounts.chargeback = item._count.id;
          break;
      }
    });

    // Vendas por mês (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    const monthStart = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth(), 1);

    const salesByMonth = await prisma.$queryRaw<Array<{
      month: string;
      revenue: Decimal;
      sales: bigint;
    }>>`
      SELECT 
        TO_CHAR(sale_date, 'YYYY-MM') as month,
        SUM(total_price) as revenue,
        COUNT(*)::bigint as sales
      FROM sales 
      WHERE user_id = ${userId}::uuid 
        AND status = 'APPROVED'
        AND sale_date >= ${monthStart}
      GROUP BY TO_CHAR(sale_date, 'YYYY-MM')
      ORDER BY month ASC
    `;

    const formattedSalesByMonth = salesByMonth.map((item) => ({
      month: item.month,
      revenue: Number(item.revenue),
      sales: Number(item.sales),
    }));

    // Cálculos finais
    const totalRevenue = Number(totalStats._sum.totalPrice || 0);
    const monthlyRevenue = Number(monthlyStats._sum.totalPrice || 0);
    const previousMonthRevenue = Number(previousMonthStats._sum.totalPrice || 0);
    const totalSales = totalStats._count.id;
    const monthlySales = monthlyStats._count.id;
    const averageTicket = Number(totalStats._avg.totalPrice || 0);
    const monthlyAverageTicket = Number(monthlyStats._avg.totalPrice || 0);

    const revenueGrowth = monthlyRevenue - previousMonthRevenue;
    const revenueGrowthPercentage = previousMonthRevenue > 0 
      ? (revenueGrowth / previousMonthRevenue) * 100 
      : 0;

    return {
      totalRevenue,
      monthlyRevenue,
      totalSales,
      monthlySales,
      averageTicket,
      monthlyAverageTicket,
      conversionRate: 0, // Calculado quando tiver dados de tráfego
      topProducts: topProductsWithDetails,
      revenueGrowth: {
        currentMonth: monthlyRevenue,
        previousMonth: previousMonthRevenue,
        growth: revenueGrowth,
        growthPercentage: revenueGrowthPercentage,
      },
      salesByStatus: statusCounts,
      salesByMonth: formattedSalesByMonth,
    };
  }

  /**
   * Cria uma nova venda (simulação de webhook Kirvano)
   */
  static async createSale(userId: string, saleData: {
    customerName?: string;
    customerEmail?: string;
    customerDocument?: string;
    customerPhone?: string;
    paymentMethod?: string;
    paymentBrand?: string;
    paymentInstallments?: number;
    totalPrice: number;
    saleType: 'ONE_TIME' | 'RECURRING';
    status: 'APPROVED' | 'PENDING' | 'REFUNDED' | 'CHARGEBACK';
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmTerm?: string;
    utmContent?: string;
    saleDate?: Date;
    products: Array<{
      productName: string;
      offerName?: string;
      description?: string;
      price: number;
      isOrderBump?: boolean;
      productId?: string;
    }>;
  }): Promise<Sale> {
    return await prisma.sale.create({
      data: {
        userId,
        customerName: saleData.customerName,
        customerEmail: saleData.customerEmail,
        customerDocument: saleData.customerDocument,
        customerPhone: saleData.customerPhone,
        paymentMethod: saleData.paymentMethod,
        paymentBrand: saleData.paymentBrand,
        paymentInstallments: saleData.paymentInstallments,
        totalPrice: saleData.totalPrice,
        saleType: saleData.saleType,
        status: saleData.status,
        utmSource: saleData.utmSource,
        utmMedium: saleData.utmMedium,
        utmCampaign: saleData.utmCampaign,
        utmTerm: saleData.utmTerm,
        utmContent: saleData.utmContent,
        saleDate: saleData.saleDate || new Date(),
        finishedAt: saleData.status === 'APPROVED' ? new Date() : null,
        saleProducts: {
          create: saleData.products.map((product) => ({
            productId: product.productId || null,
            productName: product.productName,
            offerName: product.offerName || null,
            description: product.description || null,
            price: product.price,
            isOrderBump: product.isOrderBump || false,
          })),
        },
      },
      include: {
        saleProducts: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  /**
   * Atualiza status de uma venda
   */
  static async updateSaleStatus(
    saleId: string,
    userId: string,
    status: 'APPROVED' | 'PENDING' | 'REFUNDED' | 'CHARGEBACK'
  ): Promise<Sale> {
    const updateData: any = { status };
    
    if (status === 'APPROVED') {
      updateData.finishedAt = new Date();
    } else if (status === 'REFUNDED') {
      updateData.refundedAt = new Date();
    }

    return await prisma.sale.update({
      where: {
        id: saleId,
        userId, // Garantir que o usuário só possa atualizar suas próprias vendas
      },
      data: updateData,
    });
  }

  /**
   * Deleta uma venda
   */
  static async deleteSale(saleId: string, userId: string): Promise<void> {
    await prisma.sale.delete({
      where: {
        id: saleId,
        userId,
      },
    });
  }

  /**
   * Gera dados mock para demonstração
   */
  static async generateMockData(userId: string): Promise<void> {
    // Buscar produtos do usuário
    const userProducts = await prisma.product.findMany({
      where: { userId },
    });

    if (userProducts.length === 0) {
      // Criar alguns produtos de exemplo se não existirem
      const mockProducts = await Promise.all([
        prisma.product.create({
          data: {
            userId,
            name: 'Curso de Marketing Digital',
            description: 'Curso completo de marketing digital',
            price: 497,
            category: 'Educação',
            tags: ['marketing', 'digital', 'curso'],
          },
        }),
        prisma.product.create({
          data: {
            userId,
            name: 'Mentoria Individual',
            description: 'Mentoria personalizada 1:1',
            price: 997,
            category: 'Consultoria',
            tags: ['mentoria', 'consultoria'],
          },
        }),
        prisma.product.create({
          data: {
            userId,
            name: 'E-book: Estratégias de Vendas',
            description: 'Guia completo de estratégias de vendas',
            price: 97,
            category: 'Educação',
            tags: ['ebook', 'vendas', 'estrategia'],
          },
        }),
      ]);
      userProducts.push(...mockProducts);
    }

    // Gerar vendas dos últimos 6 meses
    const mockSales = [];
    const now = new Date();
    
    for (let i = 0; i < 180; i++) { // 180 dias
      const saleDate = new Date(now);
      saleDate.setDate(saleDate.getDate() - i);
      
      // Probabilidade de venda varia por dia (mais vendas nos fins de semana)
      const dayOfWeek = saleDate.getDay();
      const salesProbability = dayOfWeek === 0 || dayOfWeek === 6 ? 0.3 : 0.2;
      
      if (Math.random() < salesProbability) {
        const product = userProducts[Math.floor(Math.random() * userProducts.length)];
        const hasOrderBump = Math.random() < 0.3; // 30% chance de order bump
        
        const utmSources = ['google', 'facebook', 'instagram', 'youtube', 'direct', 'email'];
        const utmCampaigns = ['black-friday', 'summer-sale', 'launch', 'retargeting', 'lookalike'];
        const paymentMethods = ['credit_card', 'pix', 'boleto'];
        const paymentBrands = ['visa', 'mastercard', 'elo', 'amex'];
        
        const totalPrice = Number(product.price) + (hasOrderBump ? 197 : 0);
        const status = Math.random() < 0.85 ? 'APPROVED' : 
                     Math.random() < 0.10 ? 'PENDING' : 
                     Math.random() < 0.04 ? 'REFUNDED' : 'CHARGEBACK';

        const saleProducts = [
          {
            productId: product.id,
            productName: product.name,
            offerName: product.name,
            description: product.description || null,
            price: Number(product.price),
            isOrderBump: false,
          },
        ];

        if (hasOrderBump) {
          saleProducts.push({
            productId: undefined,
            productName: 'Bônus Exclusivo',
            offerName: 'Order Bump',
            description: 'Material complementar exclusivo',
            price: 197,
            isOrderBump: true,
          });
        }

        mockSales.push({
          customerName: `Cliente ${Math.floor(Math.random() * 1000)}`,
          customerEmail: `cliente${Math.floor(Math.random() * 1000)}@email.com`,
          paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          paymentBrand: paymentBrands[Math.floor(Math.random() * paymentBrands.length)],
          paymentInstallments: Math.random() < 0.7 ? 1 : Math.floor(Math.random() * 12) + 1,
          totalPrice,
          saleType: 'ONE_TIME' as const,
          status: status as any,
          utmSource: utmSources[Math.floor(Math.random() * utmSources.length)],
          utmMedium: Math.random() < 0.8 ? 'cpc' : 'organic',
          utmCampaign: utmCampaigns[Math.floor(Math.random() * utmCampaigns.length)],
          saleDate,
          products: saleProducts,
        });
      }
    }

    // Criar as vendas em lotes para performance
    for (const saleData of mockSales) {
      await this.createSale(userId, saleData);
    }
  }
}