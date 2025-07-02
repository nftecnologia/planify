'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Download, Upload, Palette, Globe, Database, HardDrive, Trash2, BarChart3 } from 'lucide-react';

interface SystemConfiguration {
  formato: {
    data: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';
    moeda: 'BRL' | 'USD' | 'EUR';
    idioma: 'pt-BR' | 'en-US' | 'es-ES';
    timezone: string;
  };
  dashboard: {
    tema: 'light' | 'dark' | 'auto';
    layout: 'compact' | 'comfortable' | 'spacious';
    graficosAnimados: boolean;
    atualizacaoAutomatica: boolean;
    intervaloAtualizacao: number; // em segundos
  };
  privacidade: {
    compartilharAnalytics: boolean;
    cookiesFuncionais: boolean;
    backupAutomatico: boolean;
    retencaoDados: number; // em meses
  };
  backup: {
    frequencia: 'diario' | 'semanal' | 'mensal';
    horario: string;
    incluirAnexos: boolean;
    compactacao: boolean;
  };
}

export function SystemSettings() {
  const [systemConfig, setSystemConfig] = useState<SystemConfiguration>({
    formato: {
      data: 'dd/mm/yyyy',
      moeda: 'BRL',
      idioma: 'pt-BR',
      timezone: 'America/Sao_Paulo',
    },
    dashboard: {
      tema: 'light',
      layout: 'comfortable',
      graficosAnimados: true,
      atualizacaoAutomatica: true,
      intervaloAtualizacao: 300, // 5 minutos
    },
    privacidade: {
      compartilharAnalytics: true,
      cookiesFuncionais: true,
      backupAutomatico: true,
      retencaoDados: 24, // 2 anos
    },
    backup: {
      frequencia: 'semanal',
      horario: '02:00',
      incluirAnexos: true,
      compactacao: true,
    },
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const handleSave = () => {
    toast({
      title: 'Configurações salvas',
      description: 'As configurações do sistema foram atualizadas com sucesso.',
    });
  };

  const handleExportData = async () => {
    setIsExporting(true);
    setExportProgress(0);

    // Simular processo de exportação
    const steps = [
      'Preparando dados de receitas...',
      'Exportando dados de despesas...',
      'Incluindo dados tributários...',
      'Exportando configurações...',
      'Finalizando arquivo...',
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setExportProgress((i + 1) * 20);
      toast({
        title: steps[i],
        description: `Progresso: ${(i + 1) * 20}%`,
      });
    }

    setIsExporting(false);
    toast({
      title: 'Exportação concluída',
      description: 'Seus dados foram exportados com sucesso.',
    });
  };

  const handleImportData = () => {
    // Aqui você implementaria a lógica de importação
    toast({
      title: 'Importação iniciada',
      description: 'O arquivo será processado em segundo plano.',
    });
  };

  const handleClearCache = () => {
    // Aqui você implementaria a limpeza de cache
    toast({
      title: 'Cache limpo',
      description: 'O cache do sistema foi removido com sucesso.',
    });
  };

  const getStorageUsage = () => {
    // Simulação de uso de armazenamento
    return {
      used: 2.3, // GB
      total: 10, // GB
      percentage: 23,
    };
  };

  const storage = getStorageUsage();

  return (
    <div className="space-y-6">
      {/* Configurações de Formato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Formatos e Localização
          </CardTitle>
          <CardDescription>
            Configure formatos de data, moeda e idioma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="formato-data">Formato de Data</Label>
              <Select
                value={systemConfig.formato.data}
                onValueChange={(value: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd') => setSystemConfig({
                  ...systemConfig,
                  formato: { ...systemConfig.formato, data: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd/mm/yyyy">DD/MM/AAAA (31/12/2024)</SelectItem>
                  <SelectItem value="mm/dd/yyyy">MM/DD/AAAA (12/31/2024)</SelectItem>
                  <SelectItem value="yyyy-mm-dd">AAAA-MM-DD (2024-12-31)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="formato-moeda">Moeda</Label>
              <Select
                value={systemConfig.formato.moeda}
                onValueChange={(value: 'BRL' | 'USD' | 'EUR') => setSystemConfig({
                  ...systemConfig,
                  formato: { ...systemConfig.formato, moeda: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">Real Brasileiro (R$)</SelectItem>
                  <SelectItem value="USD">Dólar Americano ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="idioma">Idioma</Label>
              <Select
                value={systemConfig.formato.idioma}
                onValueChange={(value: 'pt-BR' | 'en-US' | 'es-ES') => setSystemConfig({
                  ...systemConfig,
                  formato: { ...systemConfig.formato, idioma: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="es-ES">Español (España)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Fuso Horário</Label>
              <Select
                value={systemConfig.formato.timezone}
                onValueChange={(value) => setSystemConfig({
                  ...systemConfig,
                  formato: { ...systemConfig.formato, timezone: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                  <SelectItem value="America/New_York">Nova York (GMT-5)</SelectItem>
                  <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Dashboard
          </CardTitle>
          <CardDescription>
            Personalize a aparência e comportamento do dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tema">Tema</Label>
              <Select
                value={systemConfig.dashboard.tema}
                onValueChange={(value: 'light' | 'dark' | 'auto') => setSystemConfig({
                  ...systemConfig,
                  dashboard: { ...systemConfig.dashboard, tema: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="auto">Automático</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="layout">Layout</Label>
              <Select
                value={systemConfig.dashboard.layout}
                onValueChange={(value: 'compact' | 'comfortable' | 'spacious') => setSystemConfig({
                  ...systemConfig,
                  dashboard: { ...systemConfig.dashboard, layout: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compacto</SelectItem>
                  <SelectItem value="comfortable">Confortável</SelectItem>
                  <SelectItem value="spacious">Espaçoso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Gráficos Animados</Label>
                <p className="text-sm text-muted-foreground">
                  Ativar animações nos gráficos e transições
                </p>
              </div>
              <Switch
                checked={systemConfig.dashboard.graficosAnimados}
                onCheckedChange={(checked) =>
                  setSystemConfig({
                    ...systemConfig,
                    dashboard: { ...systemConfig.dashboard, graficosAnimados: checked },
                  })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Atualização Automática</Label>
                <p className="text-sm text-muted-foreground">
                  Atualizar dados automaticamente
                </p>
              </div>
              <Switch
                checked={systemConfig.dashboard.atualizacaoAutomatica}
                onCheckedChange={(checked) =>
                  setSystemConfig({
                    ...systemConfig,
                    dashboard: { ...systemConfig.dashboard, atualizacaoAutomatica: checked },
                  })
                }
              />
            </div>

            {systemConfig.dashboard.atualizacaoAutomatica && (
              <div className="space-y-2">
                <Label htmlFor="intervalo">Intervalo de Atualização (segundos)</Label>
                <Input
                  id="intervalo"
                  type="number"
                  min="60"
                  max="3600"
                  value={systemConfig.dashboard.intervaloAtualizacao}
                  onChange={(e) => setSystemConfig({
                    ...systemConfig,
                    dashboard: {
                      ...systemConfig.dashboard,
                      intervaloAtualizacao: parseInt(e.target.value)
                    }
                  })}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Backup e Exportação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Backup e Exportação
          </CardTitle>
          <CardDescription>
            Gerencie backups e exportação dos seus dados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequencia-backup">Frequência de Backup</Label>
              <Select
                value={systemConfig.backup.frequencia}
                onValueChange={(value: 'diario' | 'semanal' | 'mensal') => setSystemConfig({
                  ...systemConfig,
                  backup: { ...systemConfig.backup, frequencia: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diario">Diário</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="horario-backup">Horário do Backup</Label>
              <Input
                id="horario-backup"
                type="time"
                value={systemConfig.backup.horario}
                onChange={(e) => setSystemConfig({
                  ...systemConfig,
                  backup: { ...systemConfig.backup, horario: e.target.value }
                })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Incluir Anexos</Label>
                <p className="text-sm text-muted-foreground">
                  Incluir arquivos anexados nos backups
                </p>
              </div>
              <Switch
                checked={systemConfig.backup.incluirAnexos}
                onCheckedChange={(checked) =>
                  setSystemConfig({
                    ...systemConfig,
                    backup: { ...systemConfig.backup, incluirAnexos: checked },
                  })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Compactação</Label>
                <p className="text-sm text-muted-foreground">
                  Comprimir arquivos de backup
                </p>
              </div>
              <Switch
                checked={systemConfig.backup.compactacao}
                onCheckedChange={(checked) =>
                  setSystemConfig({
                    ...systemConfig,
                    backup: { ...systemConfig.backup, compactacao: checked },
                  })
                }
              />
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleExportData} disabled={isExporting}>
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exportando...' : 'Exportar Dados'}
            </Button>
            
            <Button variant="outline" onClick={handleImportData}>
              <Upload className="h-4 w-4 mr-2" />
              Importar Dados
            </Button>
          </div>

          {isExporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Exportando dados...</span>
                <span>{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Armazenamento e Privacidade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Armazenamento e Privacidade
          </CardTitle>
          <CardDescription>
            Gerencie o uso de espaço e configurações de privacidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uso de Armazenamento</span>
              <span>{storage.used}GB de {storage.total}GB usados</span>
            </div>
            <Progress value={storage.percentage} />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Compartilhar Analytics</Label>
                <p className="text-sm text-muted-foreground">
                  Ajudar a melhorar o produto compartilhando dados de uso anônimos
                </p>
              </div>
              <Switch
                checked={systemConfig.privacidade.compartilharAnalytics}
                onCheckedChange={(checked) =>
                  setSystemConfig({
                    ...systemConfig,
                    privacidade: { ...systemConfig.privacidade, compartilharAnalytics: checked },
                  })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Cookies Funcionais</Label>
                <p className="text-sm text-muted-foreground">
                  Permitir cookies necessários para o funcionamento
                </p>
              </div>
              <Switch
                checked={systemConfig.privacidade.cookiesFuncionais}
                onCheckedChange={(checked) =>
                  setSystemConfig({
                    ...systemConfig,
                    privacidade: { ...systemConfig.privacidade, cookiesFuncionais: checked },
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="retencao-dados">Retenção de Dados (meses)</Label>
            <Input
              id="retencao-dados"
              type="number"
              min="12"
              max="120"
              value={systemConfig.privacidade.retencaoDados}
              onChange={(e) => setSystemConfig({
                ...systemConfig,
                privacidade: {
                  ...systemConfig.privacidade,
                  retencaoDados: parseInt(e.target.value)
                }
              })}
            />
            <p className="text-sm text-muted-foreground">
              Tempo para manter dados após exclusão da conta
            </p>
          </div>

          <Separator />

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClearCache}>
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Cache
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Todos os Dados
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir Todos os Dados</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação é irreversível. Todos os seus dados serão permanentemente 
                    removidos do sistema, incluindo receitas, despesas, configurações e backups.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground">
                    Excluir Definitivamente
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Botão de Salvar */}
      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Palette className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}