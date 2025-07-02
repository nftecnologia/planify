'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  MousePointer, 
  DollarSign, 
  Target,
  BarChart3
} from 'lucide-react';
import { AdCampaign } from '@/types';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface CampaignsDashboardProps {
  campaigns: AdCampaign[];
  onCampaignSelect?: (campaign: AdCampaign) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function CampaignsDashboard({ campaigns, onCampaignSelect }: CampaignsDashboardProps) {
  const [sortBy, setSortBy] = useState<'spent' | 'roas' | 'ctr'>('spent');

  const metrics = useMemo(() => {
    if (!campaigns.length) return null;

    const totalSpent = campaigns.reduce((acc, campaign) => acc + campaign.spent, 0);
    const totalImpressions = campaigns.reduce((acc, campaign) => acc + campaign.impressions, 0);
    const totalClicks = campaigns.reduce((acc, campaign) => acc + campaign.clicks, 0);
    const totalConversions = campaigns.reduce((acc, campaign) => acc + campaign.conversions, 0);

    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const avgCPC = totalClicks > 0 ? totalSpent / totalClicks : 0;
    const avgCPM = totalImpressions > 0 ? (totalSpent / totalImpressions) * 1000 : 0;
    const avgROAS = campaigns.reduce((acc, campaign) => acc + campaign.roas, 0) / campaigns.length;

    return {
      totalSpent,
      totalImpressions,
      totalClicks,
      totalConversions,
      avgCTR: Math.round(avgCTR * 100) / 100,
      avgCPC: Math.round(avgCPC * 100) / 100,
      avgCPM: Math.round(avgCPM * 100) / 100,
      avgROAS: Math.round(avgROAS * 100) / 100,
    };
  }, [campaigns]);

  const chartData = useMemo(() => {
    return campaigns.map((campaign) => ({
      name: campaign.name.length > 20 ? campaign.name.substring(0, 20) + '...' : campaign.name,
      spent: campaign.spent,
      clicks: campaign.clicks,
      impressions: campaign.impressions / 1000, // Para melhor visualização
      roas: campaign.roas,
      ctr: campaign.ctr,
    }));
  }, [campaigns]);

  const pieData = useMemo(() => {
    const topCampaigns = campaigns
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5);
    
    return topCampaigns.map((campaign) => ({
      name: campaign.name.length > 15 ? campaign.name.substring(0, 15) + '...' : campaign.name,
      value: campaign.spent,
    }));
  }, [campaigns]);

  const sortedCampaigns = useMemo(() => {
    return [...campaigns].sort((a, b) => {
      switch (sortBy) {
        case 'spent':
          return b.spent - a.spent;
        case 'roas':
          return b.roas - a.roas;
        case 'ctr':
          return b.ctr - a.ctr;
        default:
          return 0;
      }
    });
  }, [campaigns, sortBy]);

  if (!campaigns.length) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma campanha encontrada</h3>
            <p className="text-muted-foreground">
              Importe um arquivo CSV para ver as análises
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gasto Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {metrics?.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {campaigns.length} campanhas ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impressões</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.totalImpressions.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              CPM médio: R$ {metrics?.avgCPM.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cliques</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.totalClicks.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              CTR médio: {metrics?.avgCTR}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROAS Médio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.avgROAS}x
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.totalConversions} conversões
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="distribution">Distribuição</TabsTrigger>
          <TabsTrigger value="comparison">Comparativo</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance por Campanha</CardTitle>
              <CardDescription>
                Gastos e retorno das principais campanhas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'spent' ? `R$ ${value.toFixed(2)}` : value.toFixed(2),
                      name === 'spent' ? 'Gasto' : name === 'roas' ? 'ROAS' : 'CTR'
                    ]}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="spent" fill="#8884d8" name="Gasto (R$)" />
                  <Line yAxisId="right" type="monotone" dataKey="roas" stroke="#82ca9d" name="ROAS" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Gastos</CardTitle>
              <CardDescription>
                Top 5 campanhas por investimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Gasto']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparativo de Métricas</CardTitle>
              <CardDescription>
                CTR, CPC e impressões por campanha
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ctr" fill="#8884d8" name="CTR (%)" />
                  <Bar dataKey="impressions" fill="#82ca9d" name="Impressões (K)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Lista de Campanhas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Campanhas Detalhadas</CardTitle>
              <CardDescription>
                Lista completa com métricas de performance
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortBy('spent')}
                className={sortBy === 'spent' ? 'bg-primary text-primary-foreground' : ''}
              >
                Por Gasto
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortBy('roas')}
                className={sortBy === 'roas' ? 'bg-primary text-primary-foreground' : ''}
              >
                Por ROAS
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortBy('ctr')}
                className={sortBy === 'ctr' ? 'bg-primary text-primary-foreground' : ''}
              >
                Por CTR
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onCampaignSelect?.(campaign)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{campaign.name}</h3>
                  <Badge variant={campaign.roas > 3 ? 'default' : campaign.roas > 1 ? 'secondary' : 'destructive'}>
                    ROAS: {campaign.roas}x
                  </Badge>
                </div>
                
                {campaign.adSetName && (
                  <p className="text-sm text-muted-foreground mb-2">
                    Conjunto: {campaign.adSetName}
                  </p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Gasto</p>
                    <p className="font-medium">
                      R$ {campaign.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Impressões</p>
                    <p className="font-medium">{campaign.impressions.toLocaleString('pt-BR')}</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Cliques</p>
                    <p className="font-medium">{campaign.clicks.toLocaleString('pt-BR')}</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">CTR</p>
                    <p className="font-medium flex items-center gap-1">
                      {campaign.ctr}%
                      {campaign.ctr > 2 ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : campaign.ctr < 1 ? (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      ) : null}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-2">
                  <div>
                    <p className="text-muted-foreground">CPC</p>
                    <p className="font-medium">R$ {campaign.cpc.toFixed(2)}</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">CPM</p>
                    <p className="font-medium">R$ {campaign.cpm.toFixed(2)}</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Conversões</p>
                    <p className="font-medium">{campaign.conversions}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}