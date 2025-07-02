import { Request } from 'express';

// User types
export interface UserPayload {
  id: string;
  email: string;
  name: string;
  plan: string;
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// Product types
export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  monthlyGoal?: number;
  category?: string;
  tags?: string[];
}

// Sale types
export interface KirvanoWebhookPayload {
  event: string;
  data: {
    sale?: any;
    checkout?: any;
    subscription?: any;
  };
}

// CSV Upload types
export interface CSVAdSpendRow {
  'Campaign name': string;
  'Ad set name': string;
  'Ad name': string;
  'Amount spent': string;
  'Impressions': string;
  'Clicks': string;
  'Results': string;
  'Cost per result': string;
  'Date start': string;
  'Date stop': string;
}

export interface ProcessedAdSpend {
  campaignName: string;
  adSetName: string;
  adName: string;
  amount: number;
  impressions?: number;
  clicks?: number;
  results?: number;
  costPerResult?: number;
  date: Date;
}

// Dashboard types
export interface DashboardMetrics {
  monthlyRevenue: {
    gross: number;
    net: number;
  };
  totalAdSpend: number;
  netProfit: number;
  profitMargin: number;
  averageROI: number;
  averageROAS: number;
  previousMonthComparison: {
    revenue: number;
    adSpend: number;
    profit: number;
  };
}

// Error types
export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Middleware types
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
}

// Queue types
export interface QueueJob<T = any> {
  id: string;
  data: T;
  attempts: number;
  timestamp: number;
}

export interface ProcessCSVJob {
  userId: string;
  filePath: string;
  filename: string;
}

export interface SendEmailJob {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

// Revenue types
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

export interface CreateSaleRequest {
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
}