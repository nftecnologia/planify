'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Settings, Zap, CheckCircle, XCircle, TestTube, Trash2, Eye, EyeOff, Webhook } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  status: 'connected' | 'disconnected' | 'error';
  apiKey: string;
  webhookUrl?: string;
  lastSync?: string;
}

export function IntegrationsSettings() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'kirvano',
      name: 'Kirvano',
      description: 'Plataforma de vendas e gestão de produtos',
      status: 'connected',
      apiKey: 'krv_test_1234567890abcdef',
      webhookUrl: 'https://webhook.site/unique-id',
      lastSync: '2024-01-15 14:30:00',
    },
    {
      id: 'meta-ads',
      name: 'Meta Ads',
      description: 'Facebook e Instagram Ads Manager',
      status: 'disconnected',
      apiKey: '',
      webhookUrl: '',
    },
    {
      id: 'google-ads',
      name: 'Google Ads',
      description: 'Google Ads Manager',
      status: 'error',
      apiKey: 'gads_error_key',
      lastSync: '2024-01-10 10:15:00',
    },
  ]);

  const [showApiKeys, setShowApiKeys] = useState<{ [key: string]: boolean }>({});
  const [editingIntegration, setEditingIntegration] = useState<string | null>(null);

  const toggleApiKeyVisibility = (integrationId: string) => {
    setShowApiKeys({
      ...showApiKeys,
      [integrationId]: !showApiKeys[integrationId],
    });
  };

  const handleUpdateIntegration = (integrationId: string, updates: Partial<Integration>) => {
    setIntegrations(integrations.map(integration =>
      integration.id === integrationId
        ? { ...integration, ...updates }
        : integration
    ));
    setEditingIntegration(null);
    toast({
      title: 'Integração atualizada',
      description: 'As configurações foram salvas com sucesso.',
    });
  };

  const handleDeleteIntegration = (integrationId: string) => {
    setIntegrations(integrations.map(integration =>
      integration.id === integrationId
        ? { ...integration, status: 'disconnected' as const, apiKey: '', webhookUrl: '' }
        : integration
    ));
    toast({
      title: 'Integração removida',
      description: 'A integração foi desconectada com sucesso.',
    });
  };

  const handleTestConnection = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration || !integration.apiKey) {
      toast({
        title: 'Erro',
        description: 'API Key não configurada.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Testando conexão...',
      description: 'Verificando a conectividade com a API.',
    });

    // Simular teste de conexão
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% de chance de sucesso
      if (success) {
        setIntegrations(integrations.map(i =>
          i.id === integrationId
            ? { ...i, status: 'connected' as const, lastSync: new Date().toLocaleString('pt-BR') }
            : i
        ));
        toast({
          title: 'Conexão bem-sucedida',
          description: 'A integração está funcionando corretamente.',
        });
      } else {
        setIntegrations(integrations.map(i =>
          i.id === integrationId ? { ...i, status: 'error' as const } : i
        ));
        toast({
          title: 'Erro na conexão',
          description: 'Verifique suas credenciais e tente novamente.',
          variant: 'destructive',
        });
      }
    }, 2000);
  };

  const getStatusBadge = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Conectado</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Erro</Badge>;
      default:
        return <Badge variant="secondary">Desconectado</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">APIs e Integrações</h2>
          <p className="text-sm text-muted-foreground">
            Configure suas conexões com serviços externos
          </p>
        </div>
      </div>

      {integrations.map((integration) => (
        <Card key={integration.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                  <CardDescription>{integration.description}</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(integration.status)}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestConnection(integration.id)}
                  disabled={!integration.apiKey}
                >
                  <TestTube className="h-4 w-4 mr-1" />
                  Testar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {editingIntegration === integration.id ? (
              <EditIntegrationForm
                integration={integration}
                onSave={(updates) => handleUpdateIntegration(integration.id, updates)}
                onCancel={() => setEditingIntegration(null)}
              />
            ) : (
              <ViewIntegrationDetails
                integration={integration}
                showApiKey={showApiKeys[integration.id]}
                onToggleApiKey={() => toggleApiKeyVisibility(integration.id)}
                onEdit={() => setEditingIntegration(integration.id)}
                onDelete={() => handleDeleteIntegration(integration.id)}
              />
            )}
          </CardContent>
        </Card>
      ))}

      {/* Configurações de Webhook Global */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Configurações de Webhook
          </CardTitle>
          <CardDescription>
            Configure URLs de webhook para receber notificações automáticas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="global-webhook">URL do Webhook Global</Label>
            <Input
              id="global-webhook"
              placeholder="https://seu-site.com/webhook"
              defaultValue="https://webhook.site/unique-id"
            />
            <p className="text-sm text-muted-foreground">
              Esta URL receberá notificações de todas as integrações ativas
            </p>
          </div>
          <Button variant="outline">
            <TestTube className="h-4 w-4 mr-2" />
            Testar Webhook
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

interface EditIntegrationFormProps {
  integration: Integration;
  onSave: (updates: Partial<Integration>) => void;
  onCancel: () => void;
}

function EditIntegrationForm({ integration, onSave, onCancel }: EditIntegrationFormProps) {
  const [formData, setFormData] = useState({
    apiKey: integration.apiKey,
    webhookUrl: integration.webhookUrl || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="api-key">API Key</Label>
        <Input
          id="api-key"
          type="password"
          value={formData.apiKey}
          onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
          placeholder="Insira sua API Key"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="webhook-url">URL do Webhook (opcional)</Label>
        <Input
          id="webhook-url"
          type="url"
          value={formData.webhookUrl}
          onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
          placeholder="https://seu-site.com/webhook"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit">Salvar</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

interface ViewIntegrationDetailsProps {
  integration: Integration;
  showApiKey: boolean;
  onToggleApiKey: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function ViewIntegrationDetails({ 
  integration, 
  showApiKey, 
  onToggleApiKey, 
  onEdit, 
  onDelete 
}: ViewIntegrationDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>API Key</Label>
          <div className="flex items-center gap-2">
            <Input
              type={showApiKey ? 'text' : 'password'}
              value={integration.apiKey || 'Não configurado'}
              disabled
            />
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleApiKey}
              disabled={!integration.apiKey}
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Webhook URL</Label>
          <Input
            value={integration.webhookUrl || 'Não configurado'}
            disabled
          />
        </div>
      </div>

      {integration.lastSync && (
        <div className="space-y-2">
          <Label>Última Sincronização</Label>
          <Input value={integration.lastSync} disabled />
        </div>
      )}

      <Separator />

      <div className="flex justify-between">
        <Button variant="outline" onClick={onEdit}>
          <Settings className="h-4 w-4 mr-2" />
          Configurar
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Desconectar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Desconectar Integração</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja desconectar a integração com {integration.name}?
                Esta ação removerá todas as configurações salvas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>
                Desconectar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}