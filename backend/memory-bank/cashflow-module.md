# Módulo de Fluxo de Caixa - FinanceInfo Pro

## Visão Geral

O módulo de Fluxo de Caixa é o sistema mais avançado do FinanceInfo Pro, fornecendo análises preditivas, projeções de cenários e insights inteligentes para gestão financeira de infoprodutores.

## Características Principais

### 🎯 Engine de Projeções
- **Análise de Tendência**: Regressão linear para identificar padrões de crescimento
- **Detecção de Sazonalidade**: Algoritmo que identifica meses de pico e baixa automaticamente
- **3 Cenários**: Pessimista (-20%), Realista (tendência atual), Otimista (+30%)
- **Projeções Inteligentes**: Baseadas em dados históricos reais ou simulação avançada

### 📊 Algoritmos Implementados

#### 1. Regressão Linear Simples
```typescript
// Calcula tendência de crescimento/declínio
const trend = calculateLinearRegression(data);
// Retorna: slope, intercept, correlation
```

#### 2. Análise de Sazonalidade
```typescript
// Detecta padrões mensais automaticamente
const seasonality = detectSeasonality(historicalData);
// Identifica: peakMonths, lowMonths, hasSeasonality
```

#### 3. Cálculo de Runway
```typescript
// Meses até saldo zero baseado na queima atual
const runway = calculateRunway(balance, burnRate);
```

#### 4. Health Score (0-100)
- **Saldo Positivo**: +20 pontos
- **Receita Crescente**: +15 pontos  
- **Gastos Controlados**: +10 pontos
- **Runway Saudável (6+ meses)**: +15 pontos
- **Lucratividade**: +10 pontos

## Estrutura Técnica

### Service Layer
**Arquivo**: `src/services/cashFlowService.ts`

#### Métodos Principais:
- `getHistoricalData(userId, months)` - Dados históricos consolidados
- `analyzeTrend(data)` - Análise de tendências com regressão linear
- `generateProjections(userId, periods)` - Projeções para 3 cenários
- `generateInsights(userId)` - Insights, alertas e recomendações
- `calculateHealthScore()` - Score de saúde financeira 0-100

### API Endpoints
**Arquivo**: `src/routes/cashflow.ts`

#### Rotas Disponíveis:

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/cashflow/historical` | GET | Dados históricos 6 meses |
| `/api/cashflow/projections` | GET | Projeções 3 cenários |
| `/api/cashflow/insights` | GET | Insights e recomendações |
| `/api/cashflow/trend-analysis` | GET | Análise de tendências |
| `/api/cashflow/dashboard` | GET | Dados consolidados dashboard |
| `/api/cashflow/scenarios/:scenario` | GET | Cenário específico |
| `/api/cashflow/health-score` | GET | Score saúde financeira |

## Integração de Dados

### Fontes de Dados
- **Sales**: Tabela `sales` (vendas aprovadas Kirvano)
- **Expenses**: Tabela `expenses` (despesas diversas)
- **AdSpends**: Tabela `ad_spends` (gastos Meta Ads)

### Consolidação Mensal
```sql
-- Exemplo: Vendas por mês
SELECT 
  DATE_TRUNC('month', sale_date) as month,
  SUM(total_price) as revenue
FROM sales 
WHERE user_id = ? AND status = 'APPROVED'
GROUP BY month
ORDER BY month;
```

## Algoritmos Avançados

### 1. Engine de Projeções

#### Fórmula de Projeção:
```
Próximo Valor = Último Valor + (Tendência × Período) × Multiplicador × Fator Sazonal
```

#### Multiplicadores por Cenário:
- **Pessimista**: 0.8 (-20%)
- **Realista**: 1.0 (tendência atual)  
- **Otimista**: 1.3 (+30%)

### 2. Detecção de Sazonalidade

#### Algoritmo:
1. Calcular média mensal histórica
2. Calcular desvio de cada mês da média
3. Calcular desvio padrão geral
4. Meses com desvio > 50% do σ = sazonais

### 3. Sistema de Alertas Inteligentes

#### Tipos de Alerta:
- **🔴 DANGER**: Saldo < 2 meses operação
- **🟡 WARNING**: Saldo < 6 meses operação
- **🟡 WARNING**: Gastos em crescimento
- **🟡 WARNING**: Receita em queda
- **🔴 DANGER**: Runway ≤ 3 meses

## Dados Mock Inteligentes

Para novos usuários sem dados históricos, o sistema gera:

### Simulação Realística:
- **Saldo Inicial**: R$ 10.000
- **Receita Base**: R$ 15.000 ± R$ 2.500
- **Gastos Base**: R$ 8.000 ± R$ 1.000
- **Variação Mensal**: ±20% para simular realidade

### Mock Health Score: 75
- Saldo positivo ✅
- Runway de 3 meses ⚠️
- Lucratividade positiva ✅

## Recomendações Inteligentes

### Sistema de Recomendações:
1. **Receita Decrescente**: "Considere estratégias para aumentar receita"
2. **Gastos Crescentes**: "Revise gastos recorrentes"  
3. **Sazonalidade**: "Prepare-se para variações sazonais"
4. **Runway Baixo**: "Priorize geração de receita"
5. **Saldo Alto**: "Considere investir em crescimento"

## Performance

### Otimizações Implementadas:
- **Parallel Queries**: Busca dados em paralelo
- **Efficient Grouping**: GROUP BY otimizado no Prisma
- **Smart Caching**: Cálculos reutilizados quando possível
- **Minimal Data Transfer**: Apenas dados necessários

### Tempo de Resposta Esperado:
- **Dashboard Completo**: ~500ms
- **Projeções**: ~200ms  
- **Insights**: ~300ms

## Monitoramento

### Logs Importantes:
- Erro ao buscar dados históricos
- Erro ao gerar projeções
- Erro ao calcular insights
- Performance de queries

### Métricas de Qualidade:
- `dataQuality: 'high' | 'limited'` baseado em períodos históricos
- Correlação das tendências (0-1)
- Precisão das projeções vs realidade

## Próximos Passos

### Melhorias Futuras:
1. **Machine Learning**: Modelos mais sofisticados
2. **Comparação com Mercado**: Benchmarks do setor
3. **Previsão de Impostos**: Integração com módulo fiscal
4. **Dashboard Mobile**: Otimização para dispositivos móveis
5. **Exportação**: Relatórios PDF/Excel

---

**Status**: ✅ Módulo Completo e Funcional  
**Última Atualização**: 27/06/2025  
**Agent**: Agent 4 - Cash Flow Specialist  
**Versão**: 1.0.0