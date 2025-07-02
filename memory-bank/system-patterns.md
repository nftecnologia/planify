# System Patterns - FinanceInfo Pro

## Technical Architecture

### Architectural Pattern: Microservices na App Platform
```
Digital Ocean App Platform
├── Frontend Service (Next.js 14+)
├── Backend Service (Node.js + Express)
├── Worker Service (Queue Processing)
└── PostgreSQL Managed Database
└── Redis Managed Cache
└── Spaces Storage (S3-compatible)
```

### Design Patterns Aplicados

#### 1. Repository Pattern (Prisma ORM)
```javascript
// User repository com Prisma
class UserRepository {
  async findById(id) {
    return await prisma.user.findUnique({ where: { id } });
  }
  
  async create(userData) {
    return await prisma.user.create({ data: userData });
  }
}
```

#### 2. Event-Driven Architecture (Webhook Processing)
```javascript
// Webhook events processados via Redis Queue
const webhookQueue = new Queue('webhook-processing');

webhookQueue.process(async (job) => {
  const { eventType, eventData } = job.data;
  await processKirvanoEvent(eventType, eventData);
});
```

#### 3. Strategy Pattern (Tax Calculation)
```javascript
// Diferentes estratégias de cálculo tributário
class TaxCalculationStrategy {
  mei: () => calculateMEI(),
  simplesNacional: () => calculateSimplesNacional(),
  lucroPresumido: () => calculateLucroPresumido()
}
```

## Data Flow Architecture

### 1. CSV Import Flow
```
User Upload → Multer/Spaces → CSV Parser → 
Data Validation → Product Matching → Database Insert
```

### 2. Webhook Real-time Flow  
```
Kirvano → Webhook Endpoint → Token Validation → 
Queue Job → Process Event → Update Metrics → 
Notify Frontend (WebSocket)
```

### 3. Report Generation Flow
```
Request → Query Builder → Data Aggregation → 
Chart Generation → PDF Export → Email/Download
```

## System Structure

### Database Schema Patterns
- **UUID Primary Keys** - para todas as tabelas principais
- **Soft Deletes** - manter histórico com `deleted_at`
- **Audit Trails** - `created_at`, `updated_at` obrigatórios
- **JSONB Fields** - para dados flexíveis (raw_data, configurations)

### API Patterns
- **RESTful endpoints** - padrão `/api/resource` 
- **Consistent responses** - sempre `{ success, data, error }`
- **Rate limiting** - por usuário, não global
- **JWT + Refresh tokens** - segurança sem session

### Frontend Patterns
- **Server-side rendering** - Next.js para SEO
- **Static generation** - páginas públicas
- **Client-side state** - Zustand para estado global
- **Component composition** - atomic design principles

## Architectural Decisions

### 1. Database: PostgreSQL vs MongoDB
**✅ Escolhido: PostgreSQL**
- Relacionamentos complexos (vendas → produtos → campanhas)
- ACID compliance para dados financeiros
- JSONB para flexibilidade quando necessário
- Managed Database na DO com backups automáticos

### 2. Queue System: Redis vs RabbitMQ
**✅ Escolhido: Redis**
- Mais simples para MVP
- Managed Redis na DO
- Cache + Queue na mesma ferramenta
- Performance superior para job processing

### 3. File Storage: Local vs Cloud
**✅ Escolhido: DO Spaces**
- S3-compatible API
- CDN integrado
- Backups automáticos
- Escalabilidade sem limites

### 4. Real-time: WebSockets vs Server-Sent Events
**✅ Escolhido: WebSockets (Socket.io)**
- Bidirecional para notificações
- Melhor UX para dashboard em tempo real
- Suporte nativo no Next.js

## Code Conventions

### JavaScript/TypeScript
```javascript
// Naming conventions
const getUserById = async (id) => {};  // camelCase functions
const API_BASE_URL = '';               // SCREAMING_SNAKE_CASE constants
class UserService {}                   // PascalCase classes

// File structure
/pages/api/users/[id].js              // Next.js API routes
/components/ui/Button.jsx             // PascalCase components
/lib/utils/calculations.js            // camelCase utilities
/types/user.types.ts                  // camelCase + .types suffix
```

### Database Conventions
```sql
-- Table names: lowercase + underscore
CREATE TABLE user_settings ();
CREATE TABLE ad_spends ();

-- Column names: snake_case
user_id, created_at, utm_campaign

-- Indexes: descriptive names
CREATE INDEX idx_sales_user_date ON sales(user_id, sale_date);
```

### API Conventions
```javascript
// Response format padronizado
{
  success: true,
  data: { ... },
  pagination: { page, limit, total },
  error: null
}

// Error format padronizado  
{
  success: false,
  data: null,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'User-friendly message',
    details: { field: 'error details' }
  }
}
```

## Performance Patterns

### 1. Database Optimization
- **Indexes estratégicos** em user_id, dates, status
- **Query optimization** com EXPLAIN ANALYZE
- **Connection pooling** via Prisma
- **Read replicas** quando necessário

### 2. Caching Strategy
```javascript
// Multi-layer caching
Redis Cache → Database Query → Result Cache
TTL: 5min (real-time data), 1h (reports), 24h (static)
```

### 3. Frontend Optimization
- **Lazy loading** para componentes pesados
- **Image optimization** via Next.js
- **Bundle splitting** por rota
- **Service worker** para dados offline

## Security Patterns

### Authentication & Authorization
```javascript
// JWT + Refresh token pattern
const accessToken = generateJWT(user, '15m');
const refreshToken = generateJWT(user, '7d');

// Permission-based access
const canAccess = checkPermission(user, 'products:read');
```

### Data Protection
- **Encryption at rest** - database + file storage
- **Encryption in transit** - HTTPS obrigatório  
- **Input validation** - todas as entradas sanitizadas
- **SQL injection prevention** - Prisma ORM only

### Webhook Security
```javascript
// Signature validation pattern
const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(payload)
  .digest('hex');

const isValid = signature === receivedSignature;
```