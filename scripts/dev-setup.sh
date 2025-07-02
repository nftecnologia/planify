#!/bin/bash

# FinanceInfo Pro - Development Environment Setup Script
# This script sets up the complete development environment

set -e

echo "🚀 Configurando ambiente de desenvolvimento FinanceInfo Pro..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker não está rodando. Por favor, inicie o Docker Desktop.${NC}"
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado. Copiando .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Configure o arquivo .env antes de continuar!${NC}"
    echo -e "${BLUE}💡 Dica: As configurações padrão já funcionam para desenvolvimento local.${NC}"
fi

echo -e "${BLUE}📦 Instalando dependências...${NC}"
npm install

echo -e "${BLUE}🐳 Iniciando containers Docker...${NC}"
docker-compose up -d postgres redis

echo -e "${BLUE}⏳ Aguardando banco de dados ficar disponível...${NC}"
npx wait-on tcp:5432 tcp:6379 --timeout 60000

echo -e "${GREEN}✅ Verificando status dos serviços...${NC}"

# Check PostgreSQL
if docker-compose exec postgres pg_isready -U financeinfo_user -d financeinfo_dev > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL está funcionando${NC}"
else
    echo -e "${RED}❌ PostgreSQL não está respondendo${NC}"
    exit 1
fi

# Check Redis
if docker-compose exec redis redis-cli -a dev_redis_password ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis está funcionando${NC}"
else
    echo -e "${RED}❌ Redis não está respondendo${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Ambiente de desenvolvimento configurado com sucesso!${NC}"
echo ""
echo -e "${BLUE}📋 Próximos passos:${NC}"
echo -e "   1. Configure seu arquivo .env se necessário"
echo -e "   2. Execute ${YELLOW}npm run dev:backend${NC} em um terminal"
echo -e "   3. Execute ${YELLOW}npm run dev:frontend${NC} em outro terminal"
echo -e "   4. Acesse http://localhost:3000 para o frontend"
echo -e "   5. Acesse http://localhost:4000 para o backend API"
echo ""
echo -e "${BLUE}🛠️  Ferramentas disponíveis:${NC}"
echo -e "   • pgAdmin: http://localhost:5050 (dev@financeinfo.com / admin123)"
echo -e "   • Redis Commander: http://localhost:8081 (admin / admin123)"
echo -e "   • Execute ${YELLOW}npm run docker:up:tools${NC} para iniciar as ferramentas"
echo ""
echo -e "${BLUE}📚 Comandos úteis:${NC}"
echo -e "   • ${YELLOW}npm run docker:logs${NC} - Ver logs dos containers"
echo -e "   • ${YELLOW}npm run db:psql${NC} - Conectar ao PostgreSQL"
echo -e "   • ${YELLOW}npm run redis:cli${NC} - Conectar ao Redis"
echo -e "   • ${YELLOW}npm run docker:restart${NC} - Reiniciar containers"
echo -e "   • ${YELLOW}npm run health${NC} - Verificar saúde dos serviços"