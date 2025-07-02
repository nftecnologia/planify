// Tipos principais do sistema
export interface User {
  id: string;
  name: string;
  email: string;
  company?: string;
  cnpj?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  monthlyGoal: number;
  tags: string[];
  salesCount: number;
  revenue: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdCampaign {
  id: string;
  name: string;
  adSetName?: string;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  results?: number;
  productId?: string;
  productName?: string;
  ctr: number;
  cpc: number;
  cpm: number;
  roi: number;
  roas: number;
  dateStart: string;
  dateEnd: string;
  createdAt: string;
  updatedAt: string;
}

export interface CsvImportSession {
  id: string;
  fileName: string;
  totalRows: number;
  processedRows: number;
  successRows: number;
  errorRows: number;
  status: 'processing' | 'completed' | 'error';
  errors: string[];
  createdAt: string;
}

export interface MetaAdsCsvRow {
  campaignName: string;
  adSetName?: string;
  amountSpent: number;
  impressions: number;
  clicks: number;
  results?: number;
  dateStart: string;
  dateEnd: string;
  [key: string]: any;
}

export interface CsvPreviewData {
  headers: string[];
  rows: Record<string, any>[];
  totalRows: number;
  mappedFields: Record<string, string>;
}

export interface Sale {
  id: string;
  customerEmail: string;
  customerName: string;
  productName: string;
  amount: number;
  status: 'approved' | 'pending' | 'refused';
  utmCampaign?: string;
  productId?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  isRecurring: boolean;
  hasInvoice: boolean;
  createdAt: string;
}

export interface DashboardMetrics {
  monthlyRevenue: number;
  adSpent: number;
  netProfit: number;
  avgROI: number;
  revenueGrowth: number;
  profitMargin: number;
}

export interface WebhookEvent {
  id: string;
  type: string;
  saleId: string;
  customerEmail: string;
  amount: number;
  utmCampaign?: string;
  status: string;
  timestamp: string;
}