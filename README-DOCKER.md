# 🐳 FinanceInfo Pro - Ambiente de Desenvolvimento Docker

Este documento descreve como configurar e usar o ambiente de desenvolvimento local com Docker para o FinanceInfo Pro.

## 📋 Pré-requisitos

- **Docker Desktop** instalado e rodando
- **Node.js 18+** instalado
- **Git** instalado
- **4GB RAM** disponível para containers

## 🚀 Configuração Inicial (Setup Rápido)

### 1. Clone e Setup Automático

```bash
# Clone o repositório
git clone <repo-url>
cd financeinfo-pro

# Execute o script de setup automático
chmod +x scripts/dev-setup.sh
./scripts/dev-setup.sh
```

### 2. Setup Manual (se preferir)

```bash
# 1. Copie o arquivo de environment
cp .env.example .env

# 2. Instale dependências
npm install

# 3. Inicie os containers
npm run docker:up

# 4. Verifique se está funcionando
npm run health
```

## 🛠️ Comandos Principais

### Gerenciamento do Ambiente

```bash
# Iniciar ambiente completo
npm run dev

# Iniciar apenas banco de dados e cache
npm run docker:up

# Iniciar com ferramentas de administração
npm run docker:up:tools

# Parar todos os containers
npm run docker:down

# Reiniciar containers
npm run docker:restart

# Ver logs em tempo real
npm run docker:logs

# Limpar volumes e reiniciar do zero
npm run docker:reset
```

### Desenvolvimento

```bash
# Executar frontend e backend simultaneamente
npm run dev:full

# Executar apenas o frontend (Next.js)
npm run dev:frontend

# Executar apenas o backend (Express.js)
npm run dev:backend

# Verificar saúde dos serviços
npm run health
```

### Banco de Dados

```bash
# Conectar ao PostgreSQL via CLI
npm run db:psql

# Verificar status do banco
npm run db:status

# Fazer backup do banco
npm run db:backup

# Restaurar backup
npm run db:restore < backup_file.sql
```

### Redis

```bash
# Conectar ao Redis CLI
npm run redis:cli

# Limpar cache do Redis
npm run redis:flushall
```

## 🌐 Serviços e Portas

| Serviço | Porta | URL | Credenciais |
|---------|-------|-----|------------|
| **Frontend** | 3000 | http://localhost:3000 | - |
| **Backend API** | 4000 | http://localhost:4000 | - |
| **PostgreSQL** | 5432 | localhost:5432 | financeinfo_user / dev_password_123 |
| **Redis** | 6379 | localhost:6379 | Password: dev_redis_password |
| **pgAdmin** | 5050 | http://localhost:5050 | dev@financeinfo.com / admin123 |
| **Redis Commander** | 8081 | http://localhost:8081 | admin / admin123 |
| **Adminer** | 8080 | http://localhost:8080 | - |

## 📁 Estrutura do Projeto

```
financeinfo-pro/
├── docker-compose.yml              # Configuração principal do Docker
├── docker-compose.override.yml     # Overrides para desenvolvimento
├── .env.example                    # Template de variáveis de ambiente
├── package.json                    # Scripts NPM e dependências
├── scripts/
│   └── dev-setup.sh               # Script de configuração automática
├── database/
│   └── init/                      # Scripts de inicialização do banco
├── redis/
│   └── redis.conf                 # Configuração do Redis
├── frontend/                      # Aplicação Next.js
├── backend/                       # API Express.js
└── shared/                        # Tipos e utilitários compartilhados
```

## ⚙️ Configuração Detalhada

### Variáveis de Ambiente

O arquivo `.env.example` contém todas as variáveis necessárias. As principais são:

```env
# Banco de dados
DATABASE_URL="postgresql://financeinfo_user:dev_password_123@localhost:5432/financeinfo_dev"

# Cache
REDIS_URL="redis://:dev_redis_password@localhost:6379"

# Aplicação
NODE_ENV=development
JWT_SECRET="dev-jwt-secret-change-in-production"
```

### Docker Compose Profiles

- **Default**: PostgreSQL + Redis
- **Tools**: Inclui pgAdmin, Redis Commander, Adminer

```bash
# Iniciar apenas os serviços essenciais
docker-compose up -d

# Iniciar com ferramentas de administração
docker-compose --profile tools up -d
```

## 🔧 Solução de Problemas

### Container não inicia

```bash
# Verificar logs
npm run docker:logs

# Verificar status dos containers
docker-compose ps

# Reiniciar do zero
npm run docker:reset
```

### Banco de dados não conecta

```bash
# Verificar se o PostgreSQL está rodando
npm run db:status

# Ver logs do PostgreSQL
npm run docker:logs:postgres

# Testar conexão manual
npm run db:psql
```

### Redis não conecta

```bash
# Verificar Redis
docker-compose exec redis redis-cli -a dev_redis_password ping

# Ver logs do Redis
npm run docker:logs:redis
```

### Limpeza completa

```bash
# Remover containers, volumes e imagens
npm run docker:clean

# Reinstalar dependências
npm run clean:install
```

## 🚦 Health Checks

Os containers incluem health checks automáticos:

```bash
# Verificar saúde de todos os serviços
npm run health

# Verificar individualmente
npm run health:postgres
npm run health:redis
```

## 📊 Monitoramento

### Logs estruturados

```bash
# Logs de todos os containers
npm run docker:logs

# Logs específicos
npm run docker:logs:postgres
npm run docker:logs:redis
```

### Métricas

- **PostgreSQL**: Conexões ativas, queries lentas
- **Redis**: Uso de memória, operações por segundo
- **Aplicação**: Response time, erros HTTP

## 🔐 Segurança

### Credenciais de Desenvolvimento

As credenciais padrão são **apenas para desenvolvimento local**:

- Database: `financeinfo_user / dev_password_123`
- Redis: `dev_redis_password`
- pgAdmin: `dev@financeinfo.com / admin123`

### Produção

Em produção, use:
- Managed Database (DigitalOcean)
- Managed Redis (DigitalOcean)
- Variáveis de ambiente seguras

## 📚 Próximos Passos

1. **Configure seu .env** com suas preferências
2. **Execute `npm run setup`** para configuração inicial
3. **Desenvolva** usando `npm run dev:full`
4. **Monitore** usando as ferramentas web disponíveis
5. **Teste** usando `npm run test`

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs: `npm run docker:logs`
2. Reinicie os containers: `npm run docker:restart`
3. Faça limpeza completa: `npm run docker:reset`
4. Consulte a documentação do Docker Compose

---

**💡 Dica**: Use `npm run docker:up:tools` para acessar pgAdmin e Redis Commander via web browser.