# FinanceInfo Pro - Backend API

Backend API para o FinanceInfo Pro - SaaS de gestão financeira especializado para infoprodutores brasileiros.

## 🚀 Tecnologias

- **Node.js** + **TypeScript** 
- **Express.js** - Framework web
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Bull** - Queue system with Redis
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── middleware/      # Middlewares (auth, validation, error handling)
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── types/           # TypeScript type definitions
│   ├── app.ts           # Express app configuration
│   └── server.ts        # Server entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── dist/                # Compiled JavaScript (generated)
└── package.json
```

## 🛠️ Setup de Desenvolvimento

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Redis (para queues)

### Instalação

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente:**
   ```bash
   cp .env.example .env
   # Editar .env com suas configurações
   ```

3. **Configurar banco de dados:**
   ```bash
   # Gerar cliente Prisma
   npm run db:generate
   
   # Executar migrations
   npm run db:migrate
   
   # (Opcional) Executar seeds
   npm run db:seed
   ```

4. **Iniciar servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

## 🐳 Scripts Disponíveis

- `npm run dev` - Desenvolvimento com hot reload
- `npm run build` - Compilar TypeScript
- `npm run start` - Executar versão compilada
- `npm run db:generate` - Gerar cliente Prisma
- `npm run db:migrate` - Executar migrations
- `npm run db:push` - Push schema para database
- `npm run db:studio` - Abrir Prisma Studio
- `npm run db:seed` - Executar seeds

## 📊 Schema do Banco de Dados

### Tabelas Principais:

- **users** - Usuários do sistema
- **products** - Produtos/cursos dos infoprodutores
- **sales** - Vendas (integração Kirvano)
- **sale_products** - Produtos vendidos (relacionamento)
- **ad_spends** - Gastos com anúncios (CSV Meta Ads)
- **expenses** - Despesas diversas
- **subscriptions** - Assinaturas recorrentes
- **user_settings** - Configurações do usuário
- **webhook_logs** - Logs de webhooks

## 🔐 Autenticação

A API utiliza JWT com refresh tokens:

- **Access Token**: 15 minutos
- **Refresh Token**: 7 dias
- **Header**: `Authorization: Bearer <token>`

## 📡 Principais Endpoints

### Health Check
- `GET /api/health` - Status básico da API
- `GET /api/health/detailed` - Status detalhado do sistema

### Autenticação (Em desenvolvimento)
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Renovar token
- `GET /api/auth/me` - Dados do usuário

### Dashboard (Em desenvolvimento)
- `GET /api/dashboard` - Métricas do dashboard
- `GET /api/dashboard/charts` - Dados para gráficos

### Produtos (Em desenvolvimento)
- `GET /api/products` - Listar produtos
- `POST /api/products` - Criar produto
- `PUT /api/products/:id` - Atualizar produto
- `DELETE /api/products/:id` - Deletar produto

### Anúncios (Em desenvolvimento)
- `POST /api/ads/upload-csv` - Upload CSV Meta Ads
- `GET /api/ads/spends` - Listar gastos com anúncios
- `POST /api/ads/link-product` - Vincular anúncio a produto

### Webhooks (Em desenvolvimento)
- `POST /api/webhooks/kirvano` - Webhook Kirvano

## 🔒 Segurança

- **Helmet** para headers de segurança
- **CORS** configurado para domínios específicos
- **Rate limiting** (será implementado)
- **Input validation** com middlewares customizados
- **JWT** com refresh tokens
- **Environment variables** para configurações sensíveis

## 🚀 Deploy

O backend está configurado para deploy no **Digital Ocean App Platform**:

1. **Configurar variáveis de ambiente** no painel do App Platform
2. **Conectar repositório** GitHub
3. **Configurar build command**: `npm run build`
4. **Configurar run command**: `npm start`
5. **Configurar banco PostgreSQL** Managed Database

## 📈 Monitoramento

- **Health checks** em `/api/health`
- **Error logging** com stack traces
- **Performance metrics** (será implementado)
- **Uptime monitoring** via health checks

## 🧪 Testes

```bash
# Executar testes (em desenvolvimento)
npm test

# Coverage (em desenvolvimento)
npm run test:coverage
```

## 📝 Licença

MIT License - veja arquivo LICENSE para detalhes.

---

**Status**: ✅ Backend inicializado com sucesso  
**Última atualização**: 27/06/2025  
**Agent**: Agent 4 - Backend Architecture Specialist