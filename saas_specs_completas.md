# FinanceInfo Pro - Especificações Técnicas Completas
## SaaS de Gestão Financeira para Infoprodutores

---

## 📋 Visão Geral do Projeto

**Nome:** FinanceInfo Pro  
**Objetivo:** Plataforma completa de gestão financeira especializada para infoprodutores brasileiros  
**Diferencial:** Módulo de anúncios com import CSV + integração Kirvano webhook em tempo real  
**Deploy:** Digital Ocean App Platform (recomendado) + Managed Database + Spaces

## 🚀 **Decisão de Arquitetura: App Platform vs Droplets**

### **✅ RECOMENDAÇÃO: Digital Ocean App Platform**

**Por que App Platform é a melhor escolha:**
- Fully managed, handles infrastructure, runtimes, and everything in between so you can get your solution to market faster
- Built on DigitalOcean Kubernetes, brings the power, scale, and flexibility of Kubernetes without exposing you to any of its complexity
- Out-of-the-box support for popular languages and frameworks like Node.js, Python, Django, Go, PHP, and static sites
- Deploy direto do GitHub com CI/CD automático
- Escala automático baseado na demanda
- SSL e proteção DDoS inclusos
- Costs on the App Platform are significantly lower than on other providers

### **🔧 Suporte MCP Digital Ocean**

**Status atual do MCP:**
- DigitalOcean MCP Server exposes DigitalOcean App Platform functionality through standardized tools
- Available tools: Creates a droplet, Creates a snapshot from a droplet, List all Droplets, Turns a droplet power status either on or off
- **App Platform:** ✅ Suporte completo via MCP oficial
- **Droplets:** ✅ Suporte básico (criar, listar, gerenciar)
- **Managed Database:** ✅ Via API
- **Spaces:** ✅ Via API

**Funcionalidades MCP disponíveis:**
- Deploy a new app straight from a GitHub repository, Make changes to your code and quickly redeploy it with a single prompt
- Get a list of all your apps, inspect them, restart them, or delete them - right from your editor

---

## 🎯 Funcionalidades Principais

### 1. 📊 Dashboard Principal
- **Métricas em tempo real:**
  - Receita mensal (bruta e líquida)
  - Gasto total com anúncios
  - Lucro líquido e margem percentual
  - ROI médio e ROAS
  - Comparativo com mês anterior

- **Gráficos interativos:**
  - Evolução receita vs gastos vs lucro (6 meses)
  - Performance ROI por produto (barras)
  - Distribuição de receita por produto (pizza)

- **Tabelas dinâmicas:**
  - Top 5 produtos do mês
  - Vendas recentes (últimas 10)
  - Campanhas com melhor performance

### 2. 📱 Módulo de Anúncios (CSV Meta Ads)
- **Upload de arquivos:**
  - Interface drag & drop
  - Validação automática de formato CSV
  - Preview dos dados antes de importar
  - Suporte a múltiplos delimitadores

- **Processamento de dados:**
  - Parsing automático das colunas padrão Meta Ads
  - Limpeza e formatação de valores monetários
  - Detecção de duplicatas
  - Agrupamento por campanha/período

- **Sistema de vinculação:**
  - Matching automático por nome da campanha
  - Regras personalizáveis por palavra-chave
  - Vinculação manual para casos específicos
  - Criação automática de produtos não mapeados

- **Dados importados:**
  - Campaign name, Ad set name, Ad name
  - Amount spent, Impressions, Clicks
  - Results, Cost per result
  - Date start, Date stop

### 3. 🎯 Gestão de Produtos
- **Cadastro de produtos:**
  - Nome do produto/curso
  - Preço de venda
  - Meta de faturamento mensal
  - Descrição e categoria
  - Tags para vinculação automática

- **Regras de vinculação:**
  - Campanha contém palavra(s)
  - UTM campaign exata
  - Nome do produto contém
  - Regex personalizado
  - Prioridade de regras

- **Performance por produto:**
  - Vendas totais e do período
  - Receita bruta e líquida
  - Gasto com anúncios atribuído
  - ROI, ROAS, CPA calculados
  - Progresso vs meta mensal
  - Gráfico de evolução temporal

### 4. 💰 Receitas via Kirvano (Webhook)
- **Configuração webhook:**
  - URL endpoint seguro
  - Token de autenticação
  - Validação de origem
  - Retry automático em caso de falha

- **Eventos processados:**
  - `SALE_APPROVED` (vendas aprovadas)
  - `SALE_REFUNDED` (reembolsos)
  - `SALE_CHARGEBACK` (chargebacks)
  - `SUBSCRIPTION_RENEWED` (renovações)
  - `SUBSCRIPTION_CANCELED` (cancelamentos)
  - `ABANDONED_CART` (carrinho abandonado)
  - `PIX_GENERATED` / `PIX_EXPIRED`
  - `BANK_SLIP_GENERATED` / `BANK_SLIP_EXPIRED`

- **Dados capturados:**
  - Informações completas do cliente
  - Detalhes de pagamento (método, parcelas, bandeira)
  - UTMs para atribuição de origem
  - Produtos vendidos (incluindo order bumps)
  - Dados de assinatura (quando aplicável)
  - Timestamps precisos

- **Processamento em tempo real:**
  - Matching automático por UTM campaign
  - Atribuição de receita aos produtos
  - Cálculo instantâneo de ROI
  - Atualização de métricas
  - Logs detalhados de cada evento

### 5. 💸 Controle de Despesas
- **Categorização automática:**
  - Marketing (Anúncios, Ferramentas)
  - Operacional (Taxas, Comissões)
  - Tributário (Impostos, Contador)
  - Educação (Cursos, Eventos)
  - Pessoal (Pró-labore, Equipe)

- **Tipos de despesa:**
  - Despesas únicas
  - Despesas recorrentes (mensais/anuais)
  - Importação via upload de NF
  - Sincronização bancária

- **Upload de notas fiscais:**
  - OCR automático para extração de dados
  - Suporte: PDF, XML, JPG, PNG
  - Validação de CNPJ emissor
  - Arquivo digital organizado

- **Gestão de recorrentes:**
  - Configuração de periodicidade
  - Lembretes de vencimento
  - Atualização automática de valores
  - Projeções futuras

### 6. 📋 Módulo Tributário
- **Regimes suportados:**
  - MEI (6% ou 11%)
  - Simples Nacional (Anexos I-V)
  - Lucro Presumido
  - Configuração personalizada

- **Cálculos automáticos:**
  - Alíquota baseada no faturamento
  - Progressividade do Simples Nacional
  - Deduções aplicáveis
  - Simulação de cenários

- **Reserva automática:**
  - Separação percentual automática
  - Conta virtual para impostos
  - Projeções de pagamento
  - Alertas de insuficiência

- **Calendário tributário:**
  - Vencimentos DAS/DARF
  - Lembretes automáticos
  - Histórico de pagamentos
  - Multas e juros calculados

- **Relatórios contábeis:**
  - DRE simplificado
  - Balancete mensal
  - Livro caixa
  - Controle de pró-labore
  - Exportação para contador

### 7. 💳 Fluxo de Caixa
- **Visão consolidada:**
  - Saldo atual (todas as contas)
  - Entradas e saídas do período
  - Fluxo líquido
  - Variação percentual

- **Projeções inteligentes:**
  - Baseado em histórico de vendas
  - Sazonalidade detectada automaticamente
  - Tendências de crescimento
  - Despesas recorrentes programadas

- **Cenários múltiplos:**
  - Pessimista (-20% receita)
  - Realista (tendência atual)
  - Otimista (+30% receita)
  - Personalizado (usuário define)

- **Integração bancária:**
  - Open Banking (PIX, TED, DOC)
  - Múltiplas contas (PJ e PF)
  - Conciliação automática
  - Categorização inteligente

- **Alertas inteligentes:**
  - Saldo baixo
  - Gastos acima da média
  - Oportunidades de investimento
  - Vencimentos próximos

### 8. 📊 Relatórios Avançados
- **Relatório por produto:**
  - Vendas, receita, ROI, ROAS
  - CPA, ticket médio
  - Evolução temporal
  - Comparativo entre produtos

- **Relatório por campanha:**
  - Performance de anúncios
  - CTR, conversões, CPC
  - Atribuição de receita
  - Análise de funil

- **Relatório financeiro:**
  - DRE detalhado
  - Fluxo de caixa
  - Margem por produto
  - Análise de rentabilidade

- **Relatório tributário:**
  - Impostos pagos vs devidos
  - Economia tributária
  - Projeções anuais
  - Compliance status

- **Formatos de export:**
  - PDF profissional
  - Excel/CSV para análise
  - Envio automático por email
  - Agendamento recorrente

### 9. ⚙️ Configurações do Sistema
- **Perfil do usuário:**
  - Dados pessoais/empresariais
  - CNPJ e informações fiscais
  - Configurações de conta
  - Foto/logo da empresa

- **Integrações ativas:**
  - Status Kirvano webhook
  - Conexões bancárias
  - APIs de terceiros
  - Logs de sincronização

- **Planos e billing:**
  - Plano atual e features
  - Histórico de faturas
  - Métodos de pagamento
  - Upgrade/downgrade

- **Notificações:**
  - Email preferences
  - Push notifications
  - Alertas personalizados
  - Frequência de relatórios

- **Segurança:**
  - Alteração de senha
  - Autenticação 2FA
  - Logs de acesso
  - Sessões ativas

### 10. 📱 Versão Mobile/Responsiva
- **Dashboard móvel:**
  - Métricas principais
  - Gráficos otimizados
  - Cards de resumo
  - Quick actions

- **Funcionalidades mobile:**
  - Upload de CSV via mobile
  - Adição rápida de despesas
  - Visualização de vendas
  - Notificações push

- **Modo offline:**
  - Cache de dados principais
  - Sincronização automática
  - Fallback para dados locais

---

## 🛠 Especificações Técnicas

### Stack Tecnológico
- **Frontend:** React.js + Next.js 14+
- **Backend:** Node.js + Express.js
- **Banco de dados:** PostgreSQL
- **ORM:** Prisma
- **Cache/Queue:** Redis
- **Upload de arquivos:** Multer + DigitalOcean Spaces
- **CSS:** Tailwind CSS
- **Charts:** Chart.js ou Recharts
- **Estado:** Zustand ou React Query

### Arquitetura Digital Ocean App Platform
```
┌─────────────────────────────────────────────────────┐
│                 Load Balancer                       │
│            (App Platform Built-in)                  │
└─────────────────┬───────────────┬───────────────────┘
                  │               │
          ┌───────▼──────┐ ┌──────▼───────┐
          │  Frontend    │ │   Backend    │
          │  App Service │ │  App Service │
          │  (Next.js)   │ │  (Node.js)   │
          └──────────────┘ └──────┬───────┘
                                  │
          ┌─────────────────────────▼─────────────────────────┐
          │         PostgreSQL Managed Database               │
          │       (DO Managed Database - auto backups)       │
          └───────────────────────────────────────────────────┘
          
          ┌─────────────────────────────────────────────────┐
          │              Redis Managed                      │
          │         (DO Managed Redis Cache)                │
          └─────────────────────────────────────────────────┘
          
          ┌─────────────────────────────────────────────────┐
          │              File Storage                       │
          │           (DO Spaces/S3-compatible)             │
          └─────────────────────────────────────────────────┘
```

**Vantagens desta arquitetura:**
- **Zero infrastructure management:** App Platform handles provisioning and managing infrastructure, databases, operating systems, application runtimes
- **Built-in CI/CD:** Automatic deployments whenever you push changes to your codebase
- **Auto-scaling:** Scale apps horizontally (add more instances) and vertically (beef up instances)
- **Integrated services:** Seamlessly integrates with other Digital Ocean services
- **Predictable pricing:** Easy-to-understand pricing that allows you to control costs

### Estrutura de Banco de Dados

```sql
-- Usuários
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  company_name VARCHAR(255),
  cnpj VARCHAR(18),
  tax_regime VARCHAR(50) DEFAULT 'simples_nacional',
  password_hash VARCHAR(255),
  plan_type VARCHAR(50) DEFAULT 'starter',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Produtos
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2),
  target_revenue DECIMAL(10,2),
  description TEXT,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Regras de vinculação
CREATE TABLE product_matching_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  rule_type VARCHAR(50), -- 'contains', 'exact', 'starts_with', 'regex'
  rule_value VARCHAR(255),
  keywords TEXT[],
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true
);

-- Vendas (Kirvano)
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  kirvano_sale_id VARCHAR(255) UNIQUE,
  kirvano_checkout_id VARCHAR(255),
  
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_document VARCHAR(20),
  customer_phone VARCHAR(20),
  
  payment_method VARCHAR(50),
  payment_brand VARCHAR(50),
  payment_installments INTEGER,
  
  total_price DECIMAL(10,2),
  sale_type VARCHAR(20), -- 'ONE_TIME', 'RECURRING'
  status VARCHAR(50), -- 'APPROVED', 'REFUNDED', 'CHARGEBACK'
  
  utm_source VARCHAR(255),
  utm_medium VARCHAR(255),
  utm_campaign VARCHAR(255),
  utm_term VARCHAR(255),
  utm_content VARCHAR(255),
  
  sale_date TIMESTAMP,
  finished_at TIMESTAMP,
  refunded_at TIMESTAMP,
  
  raw_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Produtos vendidos
CREATE TABLE sale_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id),
  product_id UUID REFERENCES products(id), -- nullable se não teve match
  
  kirvano_product_id VARCHAR(255),
  product_name VARCHAR(255),
  offer_name VARCHAR(255),
  description TEXT,
  price DECIMAL(10,2),
  is_order_bump BOOLEAN DEFAULT false,
  photo_url VARCHAR(500)
);

-- Gastos com anúncios
CREATE TABLE ad_spends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id), -- nullable
  
  platform VARCHAR(50) DEFAULT 'META', -- 'META', 'GOOGLE', 'TIKTOK'
  campaign_name VARCHAR(255),
  ad_set_name VARCHAR(255),
  ad_name VARCHAR(255),
  
  amount DECIMAL(10,2),
  impressions INTEGER,
  clicks INTEGER,
  results INTEGER,
  cost_per_result DECIMAL(10,2),
  
  date DATE,
  imported_at TIMESTAMP DEFAULT NOW()
);

-- Despesas
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  
  description VARCHAR(255),
  amount DECIMAL(10,2),
  category VARCHAR(50), -- 'marketing', 'tools', 'taxes', 'education', 'operational'
  
  is_recurring BOOLEAN DEFAULT false,
  recurrence_type VARCHAR(20), -- 'monthly', 'yearly'
  
  expense_date DATE,
  due_date DATE,
  
  invoice_url VARCHAR(500),
  invoice_data JSONB, -- dados extraídos por OCR
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Assinaturas
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id),
  user_id UUID REFERENCES users(id),
  
  plan_name VARCHAR(255),
  charge_frequency VARCHAR(20), -- 'MONTHLY', 'ANNUALLY'
  next_charge_date TIMESTAMP,
  status VARCHAR(20), -- 'ACTIVE', 'CANCELED', 'EXPIRED'
  
  canceled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Configurações do usuário
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) UNIQUE,
  
  kirvano_webhook_token VARCHAR(255),
  tax_settings JSONB,
  notification_preferences JSONB,
  integrations_config JSONB,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Logs de webhook
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  
  event_type VARCHAR(50),
  event_data JSONB,
  processing_status VARCHAR(20), -- 'success', 'error', 'pending'
  error_message TEXT,
  
  received_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);
```

### APIs e Endpoints

#### Autenticação
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
```

#### Produtos
```
GET    /api/products
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
GET    /api/products/:id/performance
POST   /api/products/:id/matching-rules
```

#### Anúncios
```
POST   /api/ads/upload-csv
GET    /api/ads/preview/:uploadId
POST   /api/ads/import/:uploadId
GET    /api/ads/campaigns
GET    /api/ads/performance
```

#### Kirvano Webhook
```
POST   /api/webhook/kirvano
GET    /api/webhook/logs
POST   /api/webhook/test
GET    /api/webhook/config
PUT    /api/webhook/config
```

#### Dashboard
```
GET    /api/dashboard/metrics
GET    /api/dashboard/charts
GET    /api/dashboard/top-products
GET    /api/dashboard/recent-sales
```

#### Despesas
```
GET    /api/expenses
POST   /api/expenses
PUT    /api/expenses/:id
DELETE /api/expenses/:id
POST   /api/expenses/upload-invoice
GET    /api/expenses/categories
```

#### Tributário
```
GET    /api/tax/calculation
POST   /api/tax/simulate
GET    /api/tax/calendar
GET    /api/tax/reports
PUT    /api/tax/settings
```

#### Relatórios
```
GET    /api/reports/products
GET    /api/reports/campaigns
GET    /api/reports/financial
GET    /api/reports/tax
POST   /api/reports/export
GET    /api/reports/scheduled
```

### Processamento de Jobs (Redis Queue)
```javascript
// Jobs principais
- processKirvanoWebhook
- calculateProductROI
- generateScheduledReports
- processCSVImport
- sendNotifications
- updateMetrics
- syncBankTransactions
- generateTaxReports
```

### Variáveis de Ambiente (App Platform)
```env
# Database (auto-generated via App Platform)
DATABASE_URL=postgresql://user:pass@host:25060/db?sslmode=require

# Redis (managed via App Platform)
REDIS_URL=redis://default:pass@host:25061

# Digital Ocean Spaces
DO_SPACES_KEY=your_spaces_key
DO_SPACES_SECRET=your_spaces_secret
DO_SPACES_BUCKET=financeinfo-uploads
DO_SPACES_REGION=nyc3
DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com

# Kirvano Integration
KIRVANO_WEBHOOK_SECRET=your_webhook_secret

# Email Service
SENDGRID_API_KEY=your_sendgrid_key

# JWT & Security
JWT_SECRET=your_jwt_secret_256_bits
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# App Configuration
NODE_ENV=production
APP_URL=https://financeinfo-pro.ondigitalocean.app
API_URL=https://financeinfo-api.ondigitalocean.app

# Stripe (para billing do SaaS)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_starter_id
STRIPE_PRICE_PROFESSIONAL=price_professional_id
STRIPE_PRICE_ENTERPRISE=price_enterprise_id

# Rate Limiting
RATE_LIMIT_WINDOW=15 # minutos
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Limits
MAX_FILE_SIZE=10MB
ALLOWED_FILE_TYPES=csv,pdf,xml,jpg,png
```

### Segurança
- **Autenticação:** JWT + Refresh Tokens
- **Autorização:** RBAC por usuário
- **Webhook:** Validação de token/signature
- **Upload:** Validação de tipo de arquivo
- **API:** Rate limiting por usuário
- **Database:** Encryption at rest
- **SSL:** Certificados Let's Encrypt

### Deploy Digital Ocean App Platform

#### Configuração via Web Console (Recomendado)
```yaml
# app.yaml - Configuração do App Platform
name: financeinfo-pro
services:
  - name: frontend
    source_dir: /frontend
    github:
      repo: your-username/financeinfo-pro
      branch: main
    run_command: npm start
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    http_port: 3000
    routes:
      - path: /
    envs:
      - key: NEXT_PUBLIC_API_URL
        value: https://financeinfo-api.ondigitalocean.app
  
  - name: backend
    source_dir: /backend
    github:
      repo: your-username/financeinfo-pro
      branch: main
    run_command: npm start
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    http_port: 5000
    routes:
      - path: /api
    envs:
      - key: DATABASE_URL
        value: ${database.DATABASE_URL}
      - key: REDIS_URL
        value: ${redis.REDIS_URL}
      - key: JWT_SECRET
        value: ${JWT_SECRET}
      - key: KIRVANO_WEBHOOK_SECRET
        value: ${KIRVANO_WEBHOOK_SECRET}

databases:
  - name: database
    engine: PG
    version: "15"
    size: basic-xs
    num_nodes: 1

workers:
  - name: queue-worker
    source_dir: /backend
    github:
      repo: your-username/financeinfo-pro
      branch: main
    run_command: npm run worker
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
```

#### Deploy via CLI ou MCP
```bash
# Via doctl (Digital Ocean CLI)
doctl apps create --spec app.yaml

# Via MCP (Claude/Cursor)
# "Create a new app from https://github.com/username/financeinfo-pro with 1GB RAM"
```

### Monitoramento e Performance

#### Built-in App Platform
- **Logs:** App Platform Console + real-time logs
- **Metrics:** CPU, Memory, Response time automático
- **Alerts:** Email/Slack quando app down ou high usage
- **Scaling:** Auto-scaling baseado em CPU/Memory thresholds

#### Ferramentas Externas
- **Error Tracking:** Sentry.io
- **Performance:** New Relic ou DataDog  
- **Uptime:** UptimeRobot ou Pingdom
- **Database:** Built-in PostgreSQL metrics + PgHero

#### Health Checks
```javascript
// /api/health endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    
    // Check Redis
    await redis.ping();
    
    // Check essential services
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        redis: 'up',
        kirvano_webhook: 'configured'
      }
    };
    
    res.json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

---

## 📊 Fórmulas de Cálculo

### ROI (Return on Investment)
```
ROI = ((Receita - Investimento) / Investimento) × 100
```

### ROAS (Return on Ad Spend)
```
ROAS = Receita / Gasto com Anúncios
```

### CPA (Custo Por Aquisição)
```
CPA = Gasto com Anúncios / Número de Conversões
```

### LTV (Lifetime Value)
```
LTV = Ticket Médio × Frequência de Compra × Tempo de Vida
```

### Margem de Lucro
```
Margem = ((Receita - Custos Totais) / Receita) × 100
```

### Churn Rate
```
Churn = (Cancelamentos no Período / Total Assinantes Início) × 100
```

---

## 🚀 Plano de Implementação

### Fase 1 - MVP (3 meses)
1. **Semana 1-2:** Setup Digital Ocean + Database
2. **Semana 3-4:** Autenticação + CRUD produtos
3. **Semana 5-6:** Import CSV Meta Ads
4. **Semana 7-8:** Sistema de vinculação
5. **Semana 9-10:** Kirvano webhook + processamento
6. **Semana 11-12:** Dashboard básico + deploy

### Fase 2 - Growth (2 meses)
1. **Semana 1-2:** Módulo despesas + OCR
2. **Semana 3-4:** Módulo tributário básico
3. **Semana 5-6:** Relatórios + exports
4. **Semana 7-8:** Mobile responsivo + testes

### Fase 3 - Scale (2 meses)
1. **Semana 1-2:** Fluxo de caixa + projeções
2. **Semana 3-4:** Integração bancária
3. **Semana 5-6:** Relatórios avançados
4. **Semana 7-8:** Otimizações + performance

---

## 💰 Estrutura de Preços

### Starter - R$ 49/mês
- Até 3 produtos
- 1 conta de anúncios
- Relatórios básicos
- Suporte email

### Professional - R$ 149/mês
- Produtos ilimitados
- Múltiplas contas anúncios
- Todos os relatórios
- Integração bancária
- Suporte prioritário

### Enterprise - R$ 349/mês
- Múltiplos usuários
- API acesso
- Dashboard personalizado
- Consultoria mensal
- Suporte WhatsApp

---

Este documento serve como especificação completa para implementação do SaaS FinanceInfo Pro na Digital Ocean. Todas as funcionalidades, endpoints, estruturas de dados e configurações estão detalhadas para desenvolvimento.