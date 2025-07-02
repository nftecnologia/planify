# 💰 Expense Module API - InfoROI

## Visão Geral

O módulo de despesas do InfoROI oferece gestão completa e inteligente de despesas para infoprodutores, com categorização automática, despesas recorrentes e análises detalhadas.

## 🎯 Funcionalidades Principais

- ✅ **CRUD Completo**: Criar, listar, atualizar e deletar despesas
- ✅ **Categorização Automática**: Sistema inteligente por keywords  
- ✅ **Despesas Recorrentes**: Gestão mensal e anual automatizada
- ✅ **Análises**: Resumos por categoria com percentuais
- ✅ **Filtros Avançados**: Por categoria, período, tipo
- ✅ **Mock OCR**: Processamento de notas fiscais (simulado)

---

## 🔐 Autenticação

Todas as rotas requerem autenticação JWT:

```http
Authorization: Bearer {jwt_token}
```

---

## 📋 Endpoints da API

### 1. Listar Despesas

```http
GET /api/expenses
```

**Query Parameters:**
- `page` (number): Página (padrão: 1)
- `limit` (number): Itens por página (padrão: 50)
- `category` (string): Filtrar por categoria
- `isRecurring` (boolean): Filtrar recorrentes
- `startDate` (string): Data início (YYYY-MM-DD)
- `endDate` (string): Data fim (YYYY-MM-DD)

**Exemplo:**
```http
GET /api/expenses?category=marketing&startDate=2024-12-01&limit=10
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "description": "Meta Ads - Campanha Q4",
      "amount": 1500.00,
      "category": "marketing",
      "expenseDate": "2024-12-01T00:00:00.000Z",
      "isRecurring": true,
      "recurrenceType": "monthly",
      "createdAt": "2024-12-27T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "hasMore": true,
    "totalPages": 3
  }
}
```

### 2. Criar Despesa

```http
POST /api/expenses
```

**Body:**
```json
{
  "description": "Meta Ads - Nova campanha",
  "amount": 1200.00,
  "category": "marketing",
  "expenseDate": "2024-12-27",
  "isRecurring": true,
  "recurrenceType": "monthly",
  "dueDate": "2024-12-31",
  "invoiceUrl": "https://...",
  "invoiceData": {}
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "new-uuid",
    "description": "Meta Ads - Nova campanha",
    "amount": 1200.00,
    "category": "marketing",
    "expenseDate": "2024-12-27T00:00:00.000Z",
    "isRecurring": true,
    "recurrenceType": "monthly"
  },
  "message": "Despesa criada com sucesso"
}
```

### 3. Buscar Despesa por ID

```http
GET /api/expenses/{id}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "description": "GitHub Copilot",
    "amount": 10.00,
    "category": "tools",
    "expenseDate": "2024-12-01T00:00:00.000Z"
  }
}
```

### 4. Atualizar Despesa

```http
PUT /api/expenses/{id}
```

**Body (campos opcionais):**
```json
{
  "description": "GitHub Copilot Pro",
  "amount": 15.00,
  "category": "tools"
}
```

### 5. Deletar Despesa

```http
DELETE /api/expenses/{id}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Despesa removida com sucesso"
}
```

### 6. Resumo Financeiro

```http
GET /api/expenses/summary
```

**Query Parameters:**
- `startDate` (string): Data início
- `endDate` (string): Data fim

**Resposta:**
```json
{
  "success": true,
  "data": {
    "totalAmount": 7559.29,
    "byCategory": {
      "marketing": 5100.00,
      "tools": 192.00,
      "education": 497.00,
      "operational": 380.40,
      "taxes": 1240.45
    },
    "recurringTotal": 6500.00,
    "oneTimeTotal": 1059.29
  }
}
```

### 7. Análise por Categoria

```http
GET /api/expenses/analysis
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "category": "marketing",
      "label": "Marketing",
      "amount": 5100.00,
      "percentage": 67
    },
    {
      "category": "taxes",
      "label": "Tributário", 
      "amount": 1240.45,
      "percentage": 16
    }
  ]
}
```

### 8. Categorias Disponíveis

```http
GET /api/expenses/categories
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "value": "marketing",
      "label": "Marketing",
      "keywords": ["meta", "facebook", "google ads", "tiktok"]
    },
    {
      "value": "tools", 
      "label": "Ferramentas",
      "keywords": ["github", "vercel", "aws", "figma"]
    }
  ]
}
```

### 9. Processamento OCR (Mock)

```http
POST /api/expenses/ocr
```

**Body:**
```json
{
  "imageUrl": "https://example.com/invoice.jpg"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "confidence": 0.95,
    "extractedData": {
      "totalAmount": 150.00,
      "issueDate": "2024-12-27",
      "vendor": "Empresa Exemplo LTDA",
      "items": [
        {
          "description": "Serviço de exemplo",
          "amount": 150.00
        }
      ]
    },
    "suggestedCategory": "operational"
  }
}
```

---

## 🏷️ Sistema de Categorização

### Categorias Automáticas

O sistema classifica automaticamente as despesas baseado em keywords:

| Categoria | Label | Keywords |
|-----------|-------|----------|
| `marketing` | Marketing | meta, facebook, google ads, tiktok, ads, publicidade |
| `tools` | Ferramentas | github, vercel, aws, figma, notion, slack, software |
| `education` | Educação | curso, treinamento, udemy, alura, rocketseat, livro |
| `operational` | Operacional | energia, internet, telefone, aluguel, limpeza |
| `taxes` | Tributário | das, imposto, contador, tributario, inss, pis |

### Exemplo de Classificação

```javascript
// Entrada
"Meta Ads - Campanha Black Friday"

// Saída automática
{
  "category": "marketing",
  "confidence": "high"
}
```

---

## 🔄 Sistema de Recorrência

### Tipos Suportados

- **monthly**: Despesa mensal (auto-cria próximos 6 meses)
- **yearly**: Despesa anual (auto-cria próximo ano)

### Comportamento

Quando uma despesa recorrente é criada, o sistema automaticamente:

1. **Cria a despesa principal**
2. **Gera ocorrências futuras** baseada no tipo
3. **Mantém proporções de datas** (vencimento relativo)
4. **Marca como recorrente** todas as ocorrências

---

## 📊 Códigos de Erro

| Código | Descrição |
|--------|-----------|
| `400` | Dados inválidos (validação) |
| `401` | Token JWT inválido ou ausente |
| `404` | Despesa não encontrada |
| `500` | Erro interno do servidor |

### Exemplo de Erro

```json
{
  "success": false,
  "message": "Valor deve ser maior que zero"
}
```

---

## 🧪 Testes

### Dados Mock Disponíveis

O sistema vem com 14 despesas de exemplo:

- **Marketing**: R$ 5.100,00 (Meta Ads, Google Ads, TikTok)
- **Ferramentas**: R$ 192,00 (GitHub, Vercel, Figma, AWS)
- **Educação**: R$ 497,00 (Cursos Rocketseat)
- **Operacional**: R$ 380,40 (Internet, energia)
- **Tributário**: R$ 1.240,45 (DAS, contador)

**Total**: R$ 7.559,29

### Usuário de Teste

```
Email: teste@inforoi.com
Password: 123456
```

---

## 🚀 Exemplos de Uso

### Criar Despesa com Categoria Automática

```bash
curl -X POST /api/expenses \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "GitHub Copilot Pro",
    "amount": 15.00,
    "expenseDate": "2024-12-27"
  }'

# Resultado: category = "tools" (automático)
```

### Listar Despesas de Marketing

```bash
curl -X GET "/api/expenses?category=marketing&limit=5" \
  -H "Authorization: Bearer {token}"
```

### Análise Mensal

```bash
curl -X GET "/api/expenses/analysis?startDate=2024-12-01&endDate=2024-12-31" \
  -H "Authorization: Bearer {token}"
```

---

## 🔗 Integração

### Com CashFlow Module

```javascript
// O módulo de fluxo de caixa usa automaticamente os dados de despesas
const cashflowData = await CashFlowService.getHistoricalData(userId);
// Inclui: expenses, revenue, taxes
```

### Com Tax Module

```javascript
// Despesas dedutíveis são filtradas automaticamente
const deductibleExpenses = await ExpenseService.getExpenses(userId, {
  category: ['operational', 'tools', 'education']
});
```

---

## 🎯 Próximos Passos

1. **Frontend**: Interface React para gestão visual
2. **OCR Real**: Integração com Azure Cognitive Services  
3. **Regras Custom**: Usuário definir suas próprias keywords
4. **Anexos**: Upload de comprovantes
5. **Notificações**: Alertas de vencimento
6. **Relatórios**: Exportação em PDF/Excel

---

**Desenvolvido por**: Agent 2 - Expense Management Specialist  
**Data**: 27/06/2025  
**Status**: ✅ Production Ready