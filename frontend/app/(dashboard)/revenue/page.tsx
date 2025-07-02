'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Target,
  Filter,
  Download,
  RefreshCw,
  Plus
} from 'lucide-react';

interface Sale {
  id: string;
  customerName?: string;
  customerEmail?: string;
  paymentMethod?: string;
  paymentBrand?: string;
  paymentInstallments?: number;
  totalPrice: number;
  saleType: string;
  status: string;
  utmSource?: string;
  utmCampaign?: string;
  saleDate?: string;
  finishedAt?: string;
  saleProducts: Array<{
    id: string;
    productName: string;
    offerName?: string;
    price: number;
    isOrderBump: boolean;
    product?: {
      id: string;
      name: string;
    };
  }>;
}

interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  totalSales: number;
  monthlySales: number;
  averageTicket: number;
  monthlyAverageTicket: number;
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

interface SaleFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
  productId?: string;
  utmSource?: string;
  utmCampaign?: string;
  minValue?: number;
  maxValue?: number;
  paymentMethod?: string;
}

export default function RevenuePage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [salesLoading, setSalesLoading] = useState(false);
  const [filters, setFilters] = useState<SaleFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  // Carregar métricas
  const loadMetrics = async () => {
    try {
      const response = await api.get('/revenue/metrics');
      if (response.data.success) {
        setMetrics(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as métricas de receita.',
        variant: 'destructive',
      });
    }
  };

  // Carregar vendas
  const loadSales = async (currentPage = 1, currentFilters = filters) => {
    setSalesLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', '25');

      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/revenue/sales?${params.toString()}`);
      if (response.data.success) {
        setSales(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setPage(currentPage);
      }
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as vendas.',
        variant: 'destructive',
      });
    } finally {
      setSalesLoading(false);
    }
  };

  // Gerar dados mock
  const generateMockData = async () => {
    setLoading(true);
    try {
      await api.post('/revenue/mock-data');
      toast({
        title: 'Sucesso',
        description: 'Dados mock gerados com sucesso!',
      });
      await loadMetrics();
      await loadSales();
    } catch (error) {
      console.error('Erro ao gerar dados mock:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar os dados mock.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  const handleApplyFilters = () => {
    loadSales(1, filters);
  };

  // Limpar filtros
  const handleClearFilters = () => {
    setFilters({});
    loadSales(1, {});
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'APPROVED': 'default',
      'PENDING': 'secondary',
      'REFUNDED': 'destructive',
      'CHARGEBACK': 'destructive',
    };

    const labels: Record<string, string> = {
      'APPROVED': 'Aprovada',
      'PENDING': 'Pendente',
      'REFUNDED': 'Reembolsada',
      'CHARGEBACK': 'Chargeback',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    );
  };

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([loadMetrics(), loadSales()]);
      setLoading(false);
    };

    loadInitialData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Receitas</h1>
          <p className="text-muted-foreground">
            Acompanhe suas vendas e métricas de receita via Kirvano
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={generateMockData}>
            <Plus className="h-4 w-4 mr-2" />
            Gerar Dados Demo
          </Button>
        </div>
      </div>

      {/* Métricas Cards */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                Receita acumulada
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
              {metrics.revenueGrowth.growthPercentage >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.monthlyRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.revenueGrowth.growthPercentage >= 0 ? '+' : ''}
                {metrics.revenueGrowth.growthPercentage.toFixed(1)}% vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalSales}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.monthlySales} vendas este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.averageTicket)}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(metrics.monthlyAverageTicket)} no mês atual
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Produtos */}
      {metrics?.topProducts && metrics.topProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Produtos por Receita</CardTitle>
            <CardDescription>
              Produtos que mais geraram receita
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.topProducts.slice(0, 5).map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.sales} vendas • {formatCurrency(product.averageTicket)} ticket médio
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(product.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros e Tabela de Vendas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Vendas Recentes</CardTitle>
              <CardDescription>
                Lista das suas vendas via Kirvano
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Filtros */}
          {showFilters && (
            <div className="grid gap-4 md:grid-cols-4 pt-4 border-t">
              <Input
                type="date"
                placeholder="Data inicial"
                value={filters.startDate || ''}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
              <Input
                type="date"
                placeholder="Data final"
                value={filters.endDate || ''}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
              <Select
                value={filters.status || ''}
                onValueChange={(value) => setFilters({ ...filters, status: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="APPROVED">Aprovada</SelectItem>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                  <SelectItem value="REFUNDED">Reembolsada</SelectItem>
                  <SelectItem value="CHARGEBACK">Chargeback</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="UTM Source"
                value={filters.utmSource || ''}
                onChange={(e) => setFilters({ ...filters, utmSource: e.target.value })}
              />
              <div className="flex gap-2 md:col-span-4">
                <Button onClick={handleApplyFilters}>
                  Aplicar Filtros
                </Button>
                <Button variant="outline" onClick={handleClearFilters}>
                  Limpar
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {salesLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">Nenhuma venda encontrada</p>
              <p className="text-muted-foreground mb-4">
                Gere alguns dados demo para começar a visualizar suas vendas.
              </p>
              <Button onClick={generateMockData}>
                <Plus className="h-4 w-4 mr-2" />
                Gerar Dados Demo
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>UTM Source</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{sale.customerName || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">{sale.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {sale.saleProducts.map((product, index) => (
                            <div key={product.id}>
                              <p className="font-medium">{product.productName}</p>
                              {product.isOrderBump && (
                                <Badge variant="secondary" className="text-xs">Order Bump</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{formatCurrency(sale.totalPrice)}</p>
                          {sale.paymentInstallments && sale.paymentInstallments > 1 && (
                            <p className="text-sm text-muted-foreground">
                              {sale.paymentInstallments}x
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(sale.status)}</TableCell>
                      <TableCell>
                        <div>
                          <p>{sale.utmSource || 'N/A'}</p>
                          {sale.utmCampaign && (
                            <p className="text-sm text-muted-foreground">{sale.utmCampaign}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {sale.saleDate ? formatDate(new Date(sale.saleDate)) : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Página {page} de {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => loadSales(page - 1)}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => loadSales(page + 1)}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}