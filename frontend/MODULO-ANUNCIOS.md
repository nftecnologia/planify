# 📊 Módulo de Anúncios Meta Ads - Manual de Uso

## 🚀 Visão Geral

O Módulo de Anúncios é um sistema completo para importação, análise e gestão de campanhas do Meta Ads Manager. Permite importar dados via CSV, calcular métricas de performance e vincular campanhas aos produtos da plataforma.

## 📁 Estrutura do Sistema

```
/frontend/
├── app/(dashboard)/ads/page.tsx                    # Página principal
├── components/ads/
│   ├── csv-upload.tsx                             # Upload de CSV
│   ├── campaigns-dashboard.tsx                    # Dashboard analítico
│   └── campaign-product-linking.tsx               # Vinculação produtos
├── hooks/
│   ├── use-csv-upload.ts                         # Gerenciamento upload
│   └── use-ads-data.ts                           # Estado global
└── public/example-meta-ads.csv                   # Exemplo de CSV
```

## 🔧 Funcionalidades Implementadas

### 1. Upload e Processamento de CSV
- **Drag & Drop**: Interface intuitiva para upload
- **Validação**: Verificação automática do formato Meta Ads
- **Preview**: Visualização dos dados antes da importação
- **Progress**: Barra de progresso em tempo real
- **Tratamento de Erros**: Mensagens claras para problemas

### 2. Cálculo de Métricas
- **CTR**: Click-Through Rate (Cliques/Impressões × 100)
- **CPC**: Cost Per Click (Gasto/Cliques)
- **CPM**: Cost Per Mille (Gasto/Impressões × 1000)
- **ROAS**: Return on Ad Spend (estimado baseado em conversões)

### 3. Dashboard Analítico
- **Métricas Gerais**: Cards com totais e médias
- **Gráfico de Performance**: Linha temporal de gastos vs ROAS
- **Distribuição**: Pizza dos top 5 campanhas por gasto
- **Comparativo**: Barras de CTR e impressões por campanha

### 4. Sistema de Vinculação
- **Sugestões Automáticas**: IA identifica produtos relacionados
- **Confiança**: Score de 30-100% para cada sugestão
- **Vinculação Manual**: Interface para correções
- **Busca de Produtos**: Filtro por nome e tags

### 5. Funcionalidades Avançadas
- **Histórico**: Registro de todas as importações
- **Top Performers**: Ranking das melhores campanhas
- **Exportação**: Download dos dados em CSV
- **Alertas**: Notificações para campanhas não vinculadas

## 📊 Formato CSV Suportado

O sistema reconhece os seguintes campos do Meta Ads Manager:

```csv
Campaign name,Ad set name,Amount spent,Impressions,Clicks,Results,Reporting starts,Reporting ends
Campanha Teste,Conjunto 1,500.75,25000,1250,15,2024-06-01,2024-06-27
```

### Campos Obrigatórios:
- **Campaign name**: Nome da campanha
- **Amount spent**: Valor gasto (aceita R$ ou formato numérico)
- **Impressions**: Número de impressões
- **Clicks**: Número de cliques

### Campos Opcionais:
- **Ad set name**: Nome do conjunto de anúncios
- **Results**: Número de conversões/resultados
- **Reporting starts/ends**: Período do relatório

## 🎯 Como Usar

### Passo 1: Acessar o Módulo
1. Faça login na plataforma
2. Navegue para **Dashboard > Anúncios**
3. A aba "Importar" estará ativa por padrão

### Passo 2: Importar Dados
1. **Upload do CSV**:
   - Arraste o arquivo CSV para a área ou clique em "Selecionar Arquivo"
   - Aguarde o processamento automático
   - Revise o preview dos dados

2. **Validação**:
   - Verifique se as colunas foram mapeadas corretamente (✅ verde)
   - Confirme o número total de registros
   - Clique em "Importar X Campanhas"

### Passo 3: Analisar Performance
1. **Acesse a aba "Dashboard"**:
   - Visualize métricas gerais nos cards superiores
   - Explore os gráficos de performance
   - Use os filtros de ordenação (Por Gasto, ROAS, CTR)

2. **Interpretar Métricas**:
   - **ROAS > 3**: Campanha muito rentável (badge verde)
   - **ROAS 1-3**: Campanha moderada (badge amarelo)
   - **ROAS < 1**: Campanha problemática (badge vermelho)

### Passo 4: Vincular Produtos
1. **Acesse a aba "Vinculação"**:
   - Revise sugestões automáticas (se disponíveis)
   - Aplique sugestões confiáveis (>70%) automaticamente
   - Vincule campanhas manualmente quando necessário

2. **Vinculação Manual**:
   - Clique em "Vincular" na campanha desejada
   - Use a busca para encontrar o produto correto
   - Confirme a vinculação

### Passo 5: Exportar e Historiar
1. **Exportação**:
   - Clique em "Exportar" no header
   - Baixe CSV com dados completos e vinculações

2. **Histórico**:
   - Acesse a aba "Histórico"
   - Visualize todas as importações realizadas
   - Confira o ranking dos top performers

## 🔍 Troubleshooting

### Erro: "Dados insuficientes ou inválidos"
- **Causa**: CSV não contém campos obrigatórios
- **Solução**: Verifique se o arquivo contém Campaign name, Amount spent e Impressions

### Erro: "Formato de arquivo não suportado"
- **Causa**: Arquivo não é CSV válido
- **Solução**: Exporte novamente do Meta Ads Manager em formato CSV

### Sugestões de Vinculação Não Aparecem
- **Causa**: Nomes de campanhas muito diferentes dos produtos
- **Solução**: Use vinculação manual ou ajuste nomes das campanhas

### Métricas Estranhas (ROAS muito alto)
- **Causa**: Campo "Results" pode não representar vendas reais
- **Solução**: ROAS é estimado, use apenas como referência comparativa

## 🎨 Customizações Futuras

O sistema foi desenvolvido para ser facilmente extensível:

1. **Novos Campos CSV**: Edite o mapeamento em `META_ADS_FIELD_MAPPINGS`
2. **Métricas Personalizadas**: Adicione cálculos em `calculateMetrics()`
3. **Novos Gráficos**: Expanda os tipos em `CampaignsDashboard`
4. **Integrações**: Conecte com APIs do Meta ou outras fontes

## 💡 Dicas de Performance

1. **Mantenha CSVs < 5MB** para upload rápido
2. **Vincule campanhas aos produtos** para métricas mais precisas
3. **Use sugestões automáticas** quando confiança > 70%
4. **Exporte dados regularmente** para backup
5. **Monitore campanhas com ROAS < 1** para otimização

## 🆘 Suporte

Para problemas ou sugestões:
1. Verifique este manual primeiro
2. Teste com o arquivo exemplo em `/public/example-meta-ads.csv`
3. Consulte logs no console do navegador
4. Documente erros específicos com dados anonimizados

---

**Última atualização**: 27/06/2024  
**Versão do sistema**: 1.0.0  
**Compatibilidade**: Meta Ads Manager CSV Export