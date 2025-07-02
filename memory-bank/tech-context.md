# Tech Context - FinanceInfo Pro

## Technology Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript 5.0+
- **Styling:** Tailwind CSS 3.0+
- **State Management:** Zustand + React Query
- **Charts:** Chart.js ou Recharts
- **Forms:** React Hook Form + Zod validation
- **UI Components:** shadcn/ui ou custom components

### Backend  
- **Runtime:** Node.js 18+ LTS
- **Framework:** Express.js 4.18+
- **Language:** TypeScript 5.0+
- **ORM:** Prisma 5.0+
- **Validation:** Zod ou Joi
- **Authentication:** JWT + bcrypt
- **File Upload:** Multer
- **Queue:** Bull (Redis-based)

### Database & Storage
- **Primary Database:** PostgreSQL 15+ (DO Managed)
- **Cache/Queue:** Redis 7+ (DO Managed)  
- **File Storage:** DigitalOcean Spaces (S3-compatible)
- **Backups:** Automated via DO Managed Database

### Infrastructure
- **Platform:** DigitalOcean App Platform
- **CI/CD:** Built-in App Platform (GitHub integration)
- **Monitoring:** DO built-in + Sentry.io
- **SSL:** Let's Encrypt (automatic)
- **CDN:** DO Spaces CDN

## Development Environment

### Local Development Setup
```bash
# Prerequisites
Node.js 18+
Docker (for local PostgreSQL/Redis)
pnpm ou npm

# Environment structure
/financeinfo-pro
  /frontend          # Next.js app
  /backend           # Express.js API  
  /shared            # Shared types/utils
  /docs              # Documentation
  app.yaml           # DO App Platform config
```

### Environment Variables
```env
# Development
DATABASE_URL="postgresql://user:pass@localhost:5432/financeinfo_dev"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="dev-secret-256-bits"
KIRVANO_WEBHOOK_SECRET="dev-webhook-secret"

# Production (App Platform managed)
DATABASE_URL=${database.DATABASE_URL}
REDIS_URL=${redis.REDIS_URL}
DO_SPACES_KEY=${DO_SPACES_KEY}
DO_SPACES_SECRET=${DO_SPACES_SECRET}
```

### Development Tools
- **IDE:** VS Code + Extensions (Prisma, Tailwind, TypeScript)
- **Version Control:** Git + GitHub
- **Package Manager:** pnpm (faster, efficient)
- **Linting:** ESLint + Prettier
- **Testing:** Jest + React Testing Library
- **Type Checking:** TypeScript strict mode

## Critical Dependencies

### Core Production Dependencies
```json
{
  "next": "^14.0.0",
  "react": "^18.0.0", 
  "express": "^4.18.0",
  "prisma": "^5.0.0",
  "@prisma/client": "^5.0.0",
  "redis": "^4.6.0",
  "bull": "^4.10.0",
  "jsonwebtoken": "^9.0.0",
  "bcryptjs": "^2.4.0",
  "zod": "^3.22.0",
  "multer": "^1.4.0",
  "aws-sdk": "^2.1400.0"
}
```

### Development Dependencies
```json
{
  "@types/node": "^20.0.0",
  "@types/react": "^18.0.0",
  "@types/express": "^4.17.0",
  "typescript": "^5.0.0",
  "eslint": "^8.45.0",
  "prettier": "^3.0.0",
  "jest": "^29.0.0",
  "@testing-library/react": "^13.0.0"
}
```

## Technical Limitations

### DigitalOcean App Platform Constraints
- **Build time:** Máximo 30 minutos
- **Memory limit:** Baseado no plan escolhido  
- **CPU limit:** Compartilhado, não dedicado
- **Concurrent connections:** Limitado por instance
- **File system:** Ephemeral (usar Spaces para persistent)

### Database Limitations
- **PostgreSQL Managed:** 
  - Sem acesso root/shell
  - Extensions limitadas às pré-aprovadas
  - Backup/restore via interface DO apenas
  - Connection pooling gerenciado pela DO

### Redis Limitations
- **Memory-based:** Dados perdidos se restart sem persistence
- **Single instance:** Não há cluster no managed service
- **Backup:** Snapshot manual ou automated

## Performance Considerations

### Expected Load
- **MVP:** 100-500 usuários concorrentes
- **Growth:** 1K-5K usuários concorrentes  
- **Database:** 1M+ registros de vendas/ano
- **File uploads:** 100-500 CSV files/dia
- **Webhook events:** 1K-10K events/dia

### Optimization Strategy
- **Database indexing** em queries frequentes
- **Redis caching** para dados repetitivos  
- **CDN caching** para assets estáticos
- **Lazy loading** para componentes pesados
- **Background jobs** para processamento pesado

## Integration Requirements

### External APIs
- **Kirvano Webhook API:** Receber eventos em tempo real
- **Meta Ads API:** Future integration (Fase 2)
- **Open Banking APIs:** Future integration (Fase 3)
- **Email Service:** SendGrid ou similar
- **Payment Gateway:** Stripe para billing do SaaS

### File Processing
- **CSV parsing:** Papa Parse ou csv-parser
- **PDF generation:** Puppeteer ou jsPDF
- **Image processing:** Sharp para otimização
- **OCR processing:** Tesseract.js ou Google Vision API

## Security Requirements

### Data Protection
- **LGPD Compliance:** Dados pessoais protegidos
- **PCI Compliance:** Não armazenar dados de cartão
- **Encryption:** AES-256 para dados sensíveis
- **HTTPS only:** Certificados SSL obrigatórios

### Access Control
- **Multi-tenant:** Isolamento total entre usuários
- **Role-based:** Admin, User roles
- **API rate limiting:** 100 req/min por usuário
- **Webhook validation:** Signature obrigatória

## Deployment Strategy

### App Platform Configuration
```yaml
name: financeinfo-pro
services:
  - name: frontend
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    
  - name: backend  
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    
workers:
  - name: queue-worker
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
```

### Scaling Plan
- **Phase 1:** Single instance cada service
- **Phase 2:** Horizontal scaling conforme demand
- **Phase 3:** Multiple workers para queue processing
- **Database:** Scale up resources conforme crescimento

## Monitoring & Observability

### Health Checks
- **Application health:** `/api/health` endpoint
- **Database health:** Connection pool status
- **Redis health:** Ping/pong check
- **Queue health:** Failed jobs monitoring

### Logging Strategy
```javascript
// Structured logging
const log = {
  level: 'info',
  timestamp: new Date().toISOString(),
  service: 'backend',
  userId: user.id,
  action: 'csv_import',
  metadata: { filename, rowCount }
};
```

### Error Tracking
- **Sentry.io:** Para tracking de errors
- **Custom alerts:** Webhook failures, queue backlogs
- **Performance monitoring:** Response times, memory usage
- **Business metrics:** Daily signups, MRR, churn rate