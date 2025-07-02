'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { FileText, Calculator, AlertTriangle, Building, Receipt } from 'lucide-react';

interface TaxConfiguration {
  regime: 'mei' | 'simples' | 'lucro-presumido' | 'lucro-real';
  cnpj: string;
  inscricaoEstadual: string;
  inscricaoMunicipal: string;
  contadorEmail: string;
  contadorNome: string;
  alertas: {
    dasVencimento: boolean;
    limiteReceitaMei: boolean;
    prazoDeclaracoes: boolean;
  };
  configuracoesDas: {
    vencimentoDia: number;
    valorFixoMei: number;
    percentualSimples: number;
  };
  dadosContabeis: {
    contabilidade: string;
    responsavelCrc: string;
    enderecoContabilidade: string;
  };
}

export function TaxSettings() {
  const [taxConfig, setTaxConfig] = useState<TaxConfiguration>({
    regime: 'mei',
    cnpj: '12.345.678/0001-00',
    inscricaoEstadual: 'ISENTO',
    inscricaoMunicipal: '123456789',
    contadorEmail: 'contador@contabilidade.com',
    contadorNome: 'Maria Silva',
    alertas: {
      dasVencimento: true,
      limiteReceitaMei: true,
      prazoDeclaracoes: true,
    },
    configuracoesDas: {
      vencimentoDia: 20,
      valorFixoMei: 67.60,
      percentualSimples: 4.5,
    },
    dadosContabeis: {
      contabilidade: 'Contabilidade Silva & Associados',
      responsavelCrc: 'CRC-SP 123456/O-1',
      enderecoContabilidade: 'Rua das Flores, 123 - São Paulo/SP',
    },
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // Aqui você implementaria a lógica para salvar as configurações tributárias
    toast({
      title: 'Configurações salvas',
      description: 'Suas configurações tributárias foram atualizadas com sucesso.',
    });
    setIsEditing(false);
  };

  const getRegimeDescription = (regime: string) => {
    switch (regime) {
      case 'mei':
        return 'Microempreendedor Individual - Limite de R$ 81.000/ano';
      case 'simples':
        return 'Simples Nacional - Empresas com receita até R$ 4.8 milhões/ano';
      case 'lucro-presumido':
        return 'Lucro Presumido - Para empresas com receita até R$ 78 milhões/ano';
      case 'lucro-real':
        return 'Lucro Real - Obrigatório para empresas com receita acima de R$ 78 milhões/ano';
      default:
        return '';
    }
  };

  const getRegimeBadge = (regime: string) => {
    const colors = {
      mei: 'bg-green-100 text-green-800',
      simples: 'bg-blue-100 text-blue-800',
      'lucro-presumido': 'bg-orange-100 text-orange-800',
      'lucro-real': 'bg-red-100 text-red-800',
    };
    
    return (
      <Badge className={colors[regime as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {regime.toUpperCase().replace('-', ' ')}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Regime Tributário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Regime Tributário
          </CardTitle>
          <CardDescription>
            Configure seu enquadramento tributário atual
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {getRegimeBadge(taxConfig.regime)}
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                {getRegimeDescription(taxConfig.regime)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="regime">Regime Tributário</Label>
            <Select
              value={taxConfig.regime}
              onValueChange={(value: 'mei' | 'simples' | 'lucro-presumido' | 'lucro-real') => setTaxConfig({ ...taxConfig, regime: value })}
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mei">MEI - Microempreendedor Individual</SelectItem>
                <SelectItem value="simples">Simples Nacional</SelectItem>
                <SelectItem value="lucro-presumido">Lucro Presumido</SelectItem>
                <SelectItem value="lucro-real">Lucro Real</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={taxConfig.cnpj}
                onChange={(e) => setTaxConfig({ ...taxConfig, cnpj: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ie">Inscrição Estadual</Label>
              <Input
                id="ie"
                value={taxConfig.inscricaoEstadual}
                onChange={(e) => setTaxConfig({ ...taxConfig, inscricaoEstadual: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="im">Inscrição Municipal</Label>
              <Input
                id="im"
                value={taxConfig.inscricaoMunicipal}
                onChange={(e) => setTaxConfig({ ...taxConfig, inscricaoMunicipal: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados Contábeis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Dados Contábeis
          </CardTitle>
          <CardDescription>
            Informações do seu contador ou escritório de contabilidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contador-nome">Nome do Contador</Label>
              <Input
                id="contador-nome"
                value={taxConfig.contadorNome}
                onChange={(e) => setTaxConfig({ ...taxConfig, contadorNome: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contador-email">E-mail do Contador</Label>
              <Input
                id="contador-email"
                type="email"
                value={taxConfig.contadorEmail}
                onChange={(e) => setTaxConfig({ ...taxConfig, contadorEmail: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contabilidade">Escritório de Contabilidade</Label>
            <Input
              id="contabilidade"
              value={taxConfig.dadosContabeis.contabilidade}
              onChange={(e) => setTaxConfig({
                ...taxConfig,
                dadosContabeis: { ...taxConfig.dadosContabeis, contabilidade: e.target.value }
              })}
              disabled={!isEditing}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="crc">CRC do Responsável</Label>
              <Input
                id="crc"
                value={taxConfig.dadosContabeis.responsavelCrc}
                onChange={(e) => setTaxConfig({
                  ...taxConfig,
                  dadosContabeis: { ...taxConfig.dadosContabeis, responsavelCrc: e.target.value }
                })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endereco-contabilidade">Endereço</Label>
              <Input
                id="endereco-contabilidade"
                value={taxConfig.dadosContabeis.enderecoContabilidade}
                onChange={(e) => setTaxConfig({
                  ...taxConfig,
                  dadosContabeis: { ...taxConfig.dadosContabeis, enderecoContabilidade: e.target.value }
                })}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de DAS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Configurações de DAS
          </CardTitle>
          <CardDescription>
            Configure parâmetros para cálculo e lembretes de DAS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vencimento-dia">Dia de Vencimento</Label>
              <Input
                id="vencimento-dia"
                type="number"
                min="1"
                max="31"
                value={taxConfig.configuracoesDas.vencimentoDia}
                onChange={(e) => setTaxConfig({
                  ...taxConfig,
                  configuracoesDas: {
                    ...taxConfig.configuracoesDas,
                    vencimentoDia: parseInt(e.target.value)
                  }
                })}
                disabled={!isEditing}
              />
            </div>
            
            {taxConfig.regime === 'mei' && (
              <div className="space-y-2">
                <Label htmlFor="valor-fixo-mei">Valor Fixo MEI (R$)</Label>
                <Input
                  id="valor-fixo-mei"
                  type="number"
                  step="0.01"
                  value={taxConfig.configuracoesDas.valorFixoMei}
                  onChange={(e) => setTaxConfig({
                    ...taxConfig,
                    configuracoesDas: {
                      ...taxConfig.configuracoesDas,
                      valorFixoMei: parseFloat(e.target.value)
                    }
                  })}
                  disabled={!isEditing}
                />
              </div>
            )}

            {taxConfig.regime === 'simples' && (
              <div className="space-y-2">
                <Label htmlFor="percentual-simples">Percentual Simples (%)</Label>
                <Input
                  id="percentual-simples"
                  type="number"
                  step="0.1"
                  value={taxConfig.configuracoesDas.percentualSimples}
                  onChange={(e) => setTaxConfig({
                    ...taxConfig,
                    configuracoesDas: {
                      ...taxConfig.configuracoesDas,
                      percentualSimples: parseFloat(e.target.value)
                    }
                  })}
                  disabled={!isEditing}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alertas Fiscais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas Fiscais
          </CardTitle>
          <CardDescription>
            Configure lembretes e notificações importantes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Vencimento de DAS</Label>
              <p className="text-sm text-muted-foreground">
                Receber lembrete 5 dias antes do vencimento
              </p>
            </div>
            <Switch
              checked={taxConfig.alertas.dasVencimento}
              onCheckedChange={(checked) =>
                setTaxConfig({
                  ...taxConfig,
                  alertas: { ...taxConfig.alertas, dasVencimento: checked },
                })
              }
              disabled={!isEditing}
            />
          </div>

          <Separator />

          {taxConfig.regime === 'mei' && (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Limite de Receita MEI</Label>
                  <p className="text-sm text-muted-foreground">
                    Alerta quando atingir 80% do limite anual (R$ 64.800)
                  </p>
                </div>
                <Switch
                  checked={taxConfig.alertas.limiteReceitaMei}
                  onCheckedChange={(checked) =>
                    setTaxConfig({
                      ...taxConfig,
                      alertas: { ...taxConfig.alertas, limiteReceitaMei: checked },
                    })
                  }
                  disabled={!isEditing}
                />
              </div>

              <Separator />
            </>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Prazo de Declarações</Label>
              <p className="text-sm text-muted-foreground">
                Lembretes de prazos de declarações anuais
              </p>
            </div>
            <Switch
              checked={taxConfig.alertas.prazoDeclaracoes}
              onCheckedChange={(checked) =>
                setTaxConfig({
                  ...taxConfig,
                  alertas: { ...taxConfig.alertas, prazoDeclaracoes: checked },
                })
              }
              disabled={!isEditing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex gap-2">
        {isEditing ? (
          <>
            <Button onClick={handleSave}>
              <FileText className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)}>
            <Calculator className="h-4 w-4 mr-2" />
            Editar Configurações
          </Button>
        )}
      </div>
    </div>
  );
}