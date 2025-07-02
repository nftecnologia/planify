'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { 
  Calculator, 
  Wallet, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  DollarSign,
  Info
} from 'lucide-react';

// Tipos
interface TaxSettings {
  regime: 'MEI' | 'SIMPLES_NACIONAL' | 'LUCRO_PRESUMIDO';
  cnpj: string;
  startDate: string;
  isServiceProvider: boolean;
  mensalReservePercentage?: number;
}

interface TaxCalculation {
  regime: string;
  period: string;
  grossRevenue: number;
  taxableRevenue: number;
  taxRate: number;
  taxAmount: number;
  dueDate: string;
  breakdown: {
    irpj?: number;
    csll?: number;
    pis?: number;
    cofins?: number;
    icms?: number;
    iss?: number;
  };
}

interface RegimeComparison {
  regime: string;
  annualTax: number | null;
  effectiveRate: number | null;
  monthlyPayment: number | null;
  pros: string[];
  cons: string[];
}

interface DashboardData {
  configured: boolean;
  regime?: string;
  revenue?: {
    total: number;
    monthly: Array<{ month: number; year: number; revenue: number }>;
  };
  taxes?: {
    calculation: TaxCalculation;
    paid: number;
    pending: number;
    reserve: {
      totalReserved: number;
      totalRequired: number;
      monthlyReserve: number;
      insufficientFunds: boolean;
      nextPaymentAmount: number;
      nextPaymentDate: string;
    };
  };
  alerts?: string[];
}

export default function TaxPage() {
  // States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settings, setSettings] = useState<TaxSettings | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [calculation, setCalculation] = useState<TaxCalculation | null>(null);
  const [comparison, setComparison] = useState<RegimeComparison[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [calcForm, setCalcForm] = useState({
    revenue: '',
    regime: 'SIMPLES_NACIONAL' as const,
    isServiceProvider: true
  });

  const [settingsForm, setSettingsForm] = useState({
    regime: 'SIMPLES_NACIONAL' as const,
    cnpj: '',
    startDate: '',
    isServiceProvider: true,
    mensalReservePercentage: 15
  });

  const [compareForm, setCompareForm] = useState({
    annualRevenue: '',
    isServiceProvider: true
  });

  // Load inicial
  useEffect(() => {
    loadTaxSettings();
    loadDashboard();
  }, []);

  // Funções de API
  const loadTaxSettings = async () => {
    try {
      const response = await api.get('/tax/settings');
      if (response.data.success && response.data.data) {
        setSettings(response.data.data);
        setSettingsForm({
          ...response.data.data,
          startDate: response.data.data.startDate.split('T')[0] // Format para input date
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const loadDashboard = async () => {
    try {
      const response = await api.get('/tax/dashboard');
      if (response.data.success) {
        setDashboard(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const response = await api.post('/tax/settings', settingsForm);
      if (response.data.success) {
        setSettings(response.data.data);
        loadDashboard(); // Reload dashboard
        alert('Configurações salvas com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const calculateTax = async () => {
    setLoading(true);
    try {
      const response = await api.post('/tax/calculate', {
        revenue: parseFloat(calcForm.revenue),
        regime: calcForm.regime,
        isServiceProvider: calcForm.isServiceProvider
      });
      if (response.data.success) {
        setCalculation(response.data.data);
      }
    } catch (error) {
      console.error('Erro no cálculo:', error);
      alert('Erro no cálculo tributário');
    } finally {
      setLoading(false);
    }
  };

  const compareRegimes = async () => {
    setLoading(true);
    try {
      const response = await api.post('/tax/compare-regimes', {
        annualRevenue: parseFloat(compareForm.annualRevenue),
        isServiceProvider: compareForm.isServiceProvider
      });
      if (response.data.success) {
        setComparison(response.data.data);
      }
    } catch (error) {
      console.error('Erro na comparação:', error);
      alert('Erro na comparação de regimes');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return (value * 100).toFixed(2) + '%';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Módulo Tributário</h1>
          <p className="text-muted-foreground">
            Gerencie seus impostos, calculate DAS e mantenha reservas
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="calculator">Calculadora</TabsTrigger>
          <TabsTrigger value="simulator">Simulador</TabsTrigger>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        {/* Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          {!dashboard?.configured ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Configure suas configurações tributárias para ver o dashboard completo.
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-semibold"
                  onClick={() => setActiveTab('settings')}
                >
                  Configurar agora
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Receita Anual */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Anual</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(dashboard.revenue?.total || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dashboard.regime} - {new Date().getFullYear()}
                  </p>
                </CardContent>
              </Card>

              {/* Impostos Devidos */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Impostos Devidos</CardTitle>
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(dashboard.taxes?.pending || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pendente de pagamento
                  </p>
                </CardContent>
              </Card>

              {/* Reserva Atual */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reserva Atual</CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(dashboard.taxes?.reserve.totalReserved || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dashboard.taxes?.reserve.insufficientFunds ? (
                      <span className="text-red-500">Insuficiente</span>
                    ) : (
                      <span className="text-green-500">Adequada</span>
                    )}
                  </p>
                </CardContent>
              </Card>

              {/* Próximo Pagamento */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Próximo Pagamento</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(dashboard.taxes?.reserve.nextPaymentAmount || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dashboard.taxes?.reserve.nextPaymentDate ? 
                      new Date(dashboard.taxes.reserve.nextPaymentDate).toLocaleDateString('pt-BR')
                      : 'Não definido'
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Alertas */}
          {dashboard?.alerts && dashboard.alerts.length > 0 && (
            <div className="space-y-2">
              {dashboard.alerts.map((alert, index) => (
                <Alert key={index} variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{alert}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Calculadora */}
        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Calculadora de Impostos</CardTitle>
              <CardDescription>
                Calcule os impostos devidos baseado na receita e regime tributário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="calc-revenue">Receita (R$)</Label>
                  <Input
                    id="calc-revenue"
                    type="number"
                    value={calcForm.revenue}
                    onChange={(e) => setCalcForm({...calcForm, revenue: e.target.value})}
                    placeholder="50000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Regime Tributário</Label>
                  <Select value={calcForm.regime} onValueChange={(value: any) => setCalcForm({...calcForm, regime: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEI">MEI</SelectItem>
                      <SelectItem value="SIMPLES_NACIONAL">Simples Nacional</SelectItem>
                      <SelectItem value="LUCRO_PRESUMIDO">Lucro Presumido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Atividade</Label>
                  <Select value={calcForm.isServiceProvider ? 'service' : 'commerce'} onValueChange={(value) => setCalcForm({...calcForm, isServiceProvider: value === 'service'})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service">Serviços</SelectItem>
                      <SelectItem value="commerce">Comércio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={calculateTax} disabled={loading || !calcForm.revenue}>
                {loading ? 'Calculando...' : 'Calcular Impostos'}
              </Button>
            </CardContent>
          </Card>

          {/* Resultado do Cálculo */}
          {calculation && (
            <Card>
              <CardHeader>
                <CardTitle>Resultado do Cálculo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-2">Resumo</h4>
                    <div className="space-y-1 text-sm">
                      <p>Regime: <Badge>{calculation.regime}</Badge></p>
                      <p>Receita Bruta: {formatCurrency(calculation.grossRevenue)}</p>
                      <p>Alíquota Efetiva: {formatPercentage(calculation.taxRate)}</p>
                      <p className="font-semibold text-lg">
                        Imposto Total: {formatCurrency(calculation.taxAmount)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Detalhamento</h4>
                    <div className="space-y-1 text-sm">
                      {calculation.breakdown.irpj && <p>IRPJ: {formatCurrency(calculation.breakdown.irpj)}</p>}
                      {calculation.breakdown.csll && <p>CSLL: {formatCurrency(calculation.breakdown.csll)}</p>}
                      {calculation.breakdown.pis && <p>PIS: {formatCurrency(calculation.breakdown.pis)}</p>}
                      {calculation.breakdown.cofins && <p>COFINS: {formatCurrency(calculation.breakdown.cofins)}</p>}
                      {calculation.breakdown.iss && <p>ISS: {formatCurrency(calculation.breakdown.iss)}</p>}
                      {calculation.breakdown.icms && <p>ICMS: {formatCurrency(calculation.breakdown.icms)}</p>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Simulador */}
        <TabsContent value="simulator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Simulador de Regimes</CardTitle>
              <CardDescription>
                Compare os custos entre diferentes regimes tributários
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="compare-revenue">Receita Anual (R$)</Label>
                  <Input
                    id="compare-revenue"
                    type="number"
                    value={compareForm.annualRevenue}
                    onChange={(e) => setCompareForm({...compareForm, annualRevenue: e.target.value})}
                    placeholder="600000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Atividade</Label>
                  <Select value={compareForm.isServiceProvider ? 'service' : 'commerce'} onValueChange={(value) => setCompareForm({...compareForm, isServiceProvider: value === 'service'})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service">Serviços</SelectItem>
                      <SelectItem value="commerce">Comércio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={compareRegimes} disabled={loading || !compareForm.annualRevenue}>
                {loading ? 'Simulando...' : 'Simular Regimes'}
              </Button>
            </CardContent>
          </Card>

          {/* Comparação de Regimes */}
          {comparison.length > 0 && (
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
              {comparison.map((regime, index) => (
                <Card key={index} className={index === 0 ? 'border-green-500' : ''}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {regime.regime}
                      {index === 0 && <Badge className="bg-green-500">Melhor Opção</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {regime.annualTax !== null ? (
                      <div className="space-y-2">
                        <p className="text-2xl font-bold">
                          {formatCurrency(regime.annualTax)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          por ano ({formatCurrency(regime.monthlyPayment || 0)}/mês)
                        </p>
                        <p className="text-sm">
                          Alíquota: {formatPercentage(regime.effectiveRate || 0)}
                        </p>
                        
                        <div className="pt-2">
                          <h5 className="font-semibold text-sm text-green-600">Vantagens:</h5>
                          <ul className="text-xs space-y-1">
                            {regime.pros.map((pro, i) => (
                              <li key={i} className="flex items-center">
                                <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="font-semibold text-sm text-red-600">Desvantagens:</h5>
                          <ul className="text-xs space-y-1">
                            {regime.cons.map((con, i) => (
                              <li key={i} className="flex items-center">
                                <AlertTriangle className="h-3 w-3 mr-1 text-red-500" />
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-red-500 font-semibold">Não Aplicável</p>
                        <ul className="text-xs space-y-1">
                          {regime.cons.map((con, i) => (
                            <li key={i} className="flex items-center">
                              <AlertTriangle className="h-3 w-3 mr-1 text-red-500" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Calendário */}
        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Calendário de Pagamentos</CardTitle>
              <CardDescription>
                Próximos vencimentos de DAS e DARF
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Calendário será implementado com base nas suas configurações tributárias.
                  Configure primeiro suas informações tributárias.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Tributárias</CardTitle>
              <CardDescription>
                Configure seu regime tributário e preferências
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Regime Tributário</Label>
                  <Select value={settingsForm.regime} onValueChange={(value: any) => setSettingsForm({...settingsForm, regime: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEI">MEI</SelectItem>
                      <SelectItem value="SIMPLES_NACIONAL">Simples Nacional</SelectItem>
                      <SelectItem value="LUCRO_PRESUMIDO">Lucro Presumido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={settingsForm.cnpj}
                    onChange={(e) => setSettingsForm({...settingsForm, cnpj: e.target.value})}
                    placeholder="12345678000190"
                    maxLength={14}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start-date">Data de Início</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={settingsForm.startDate}
                    onChange={(e) => setSettingsForm({...settingsForm, startDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Atividade</Label>
                  <Select value={settingsForm.isServiceProvider ? 'service' : 'commerce'} onValueChange={(value) => setSettingsForm({...settingsForm, isServiceProvider: value === 'service'})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service">Prestação de Serviços</SelectItem>
                      <SelectItem value="commerce">Comércio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reserve-percentage">% Reserva Mensal</Label>
                  <Input
                    id="reserve-percentage"
                    type="number"
                    value={settingsForm.mensalReservePercentage}
                    onChange={(e) => setSettingsForm({...settingsForm, mensalReservePercentage: parseInt(e.target.value) || 0})}
                    placeholder="15"
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-muted-foreground">
                    Percentual da receita a ser reservado automaticamente para impostos
                  </p>
                </div>
              </div>
              <Button onClick={saveSettings} disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}