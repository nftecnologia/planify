'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  FileSpreadsheet, 
  BarChart3, 
  Link, 
  History,
  Download,
  Trash2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { CsvUpload } from "@/components/ads/csv-upload";
import { CampaignsDashboard } from "@/components/ads/campaigns-dashboard";
import { CampaignProductLinking } from "@/components/ads/campaign-product-linking";
import { useAdsData } from "@/hooks/use-ads-data";
import { AdCampaign } from "@/types";

export default function AdsPage() {
  const [activeTab, setActiveTab] = useState<'import' | 'dashboard' | 'linking' | 'history'>('import');
  
  const {
    campaigns,
    products,
    importHistory,
    error,
    addCampaigns,
    clearCampaigns,
    updateCampaign,
    getUnlinkedCampaigns,
    getTopPerformers,
  } = useAdsData();

  const handleUploadComplete = () => {
    // Automaticamente mudar para a aba de dashboard após import
    setActiveTab('dashboard');
  };

  const handleImportCampaigns = (importedCampaigns: AdCampaign[]) => {
    addCampaigns(importedCampaigns);
    setActiveTab('dashboard');
  };

  const handleLinkingComplete = (linkedCampaigns: AdCampaign[]) => {
    // Atualizar campanhas com vinculações
    linkedCampaigns.forEach(campaign => {
      updateCampaign(campaign.id, {
        productId: campaign.productId,
        productName: campaign.productName,
      });
    });
    setActiveTab('dashboard');
  };

  const exportData = () => {
    const csvContent = [
      ['Nome da Campanha', 'Produto', 'Gasto', 'Impressões', 'Cliques', 'CTR', 'ROAS'].join(','),
      ...campaigns.map(campaign => [
        campaign.name,
        campaign.productName || 'Não vinculado',
        campaign.spent.toFixed(2),
        campaign.impressions,
        campaign.clicks,
        campaign.ctr + '%',
        campaign.roas + 'x'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `campanhas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const unlinkedCampaigns = getUnlinkedCampaigns();
  const topPerformers = getTopPerformers('roas');

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Módulo de Anúncios</h1>
          <p className="text-muted-foreground">
            Gestão completa de campanhas do Meta Ads Manager
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {campaigns.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={exportData}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar
              </Button>
              <Button
                variant="outline"
                onClick={() => clearCampaigns()}
                className="flex items-center gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Limpar Dados
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status Cards */}
      {campaigns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Campanhas</p>
                <p className="text-2xl font-bold">{campaigns.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Campanhas Vinculadas</p>
                <p className="text-2xl font-bold">
                  {campaigns.filter(c => c.productId).length}
                </p>
              </div>
              <Link className="h-8 w-8 text-green-600" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gasto Total</p>
                <p className="text-2xl font-bold">
                  R$ {campaigns.reduce((acc, c) => acc + c.spent, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <FileSpreadsheet className="h-8 w-8 text-orange-600" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alertas */}
      {unlinkedCampaigns.length > 0 && campaigns.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Você tem {unlinkedCampaigns.length} campanhas não vinculadas a produtos.{' '}
            <Button
              variant="link"
              className="p-0 h-auto text-primary"
              onClick={() => setActiveTab('linking')}
            >
              Vincular agora
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabs Principal */}
      <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as 'import' | 'dashboard' | 'linking' | 'history')}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Importar
          </TabsTrigger>
          <TabsTrigger value="dashboard" disabled={campaigns.length === 0} className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
            {campaigns.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {campaigns.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="linking" disabled={campaigns.length === 0} className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            Vinculação
            {unlinkedCampaigns.length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {unlinkedCampaigns.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-6">
          <CsvUpload 
            onUploadComplete={handleUploadComplete}
            onCampaignsImported={handleImportCampaigns}
          />
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          <CampaignsDashboard
            campaigns={campaigns}
            onCampaignSelect={(campaign) => console.log('Campaign selected:', campaign)}
          />
        </TabsContent>

        <TabsContent value="linking" className="space-y-6">
          <CampaignProductLinking
            campaigns={campaigns}
            products={products}
            onLinkingComplete={handleLinkingComplete}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de Importações
              </CardTitle>
              <CardDescription>
                Registro de todas as importações de CSV realizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {importHistory.length > 0 ? (
                <div className="space-y-3">
                  {importHistory.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{record.fileName}</p>
                        <p className="text-sm text-muted-foreground">
                          {record.campaignCount} campanhas importadas
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {new Date(record.importedAt).toLocaleString('pt-BR')}
                        </p>
                        <Badge variant="outline" className="mt-1">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Concluído
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <History className="h-12 w-12 mx-auto mb-4" />
                  <p>Nenhuma importação realizada ainda</p>
                  <p className="text-sm">O histórico aparecerá aqui após as importações</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Performers */}
          {topPerformers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Melhores Campanhas (ROAS)</CardTitle>
                <CardDescription>
                  Top 5 campanhas com melhor retorno sobre investimento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPerformers.map((campaign, index) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {campaign.productName || 'Produto não vinculado'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="default">
                          ROAS: {campaign.roas}x
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          R$ {campaign.spent.toFixed(2)} gastos
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}