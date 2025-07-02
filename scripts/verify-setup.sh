#!/bin/bash

# FinanceInfo Pro - Verificação de Setup
# Script para verificar se o ambiente está configurado corretamente

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Verificando configuração do ambiente FinanceInfo Pro...${NC}"

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não está instalado. Instale o Docker Desktop.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose não está instalado.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker e Docker Compose estão instalados${NC}"

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker não está rodando. Inicie o Docker Desktop.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker está rodando${NC}"

# Verificar arquivos de configuração
files_to_check=(
    "docker-compose.yml"
    ".env.example"
    "package.json"
    "redis/redis.conf"
    "database/init/01-init.sql"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file encontrado${NC}"
    else
        echo -e "${RED}❌ $file não encontrado${NC}"
        exit 1
    fi
done

# Verificar se .env existe
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env encontrado${NC}"
else
    echo -e "${YELLOW}⚠️  .env não encontrado. Será criado automaticamente.${NC}"
fi

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não está instalado. Instale Node.js 18+.${NC}"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
    echo -e "${GREEN}✅ Node.js $NODE_VERSION está instalado${NC}"
else
    echo -e "${RED}❌ Node.js $NODE_VERSION é muito antigo. Requer 18.0.0+${NC}"
    exit 1
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm não está instalado.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm está instalado${NC}"

# Verificar sintaxe do docker-compose.yml
if docker-compose config > /dev/null 2>&1; then
    echo -e "${GREEN}✅ docker-compose.yml está válido${NC}"
else
    echo -e "${RED}❌ docker-compose.yml possui erros de sintaxe${NC}"
    exit 1
fi

# Verificar se as portas estão livres
ports_to_check=(5432 6379 5050 8081 8080)

for port in "${ports_to_check[@]}"; do
    if lsof -i :$port > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Porta $port está em uso${NC}"
    else
        echo -e "${GREEN}✅ Porta $port está livre${NC}"
    fi
done

echo ""
echo -e "${GREEN}🎉 Verificação concluída com sucesso!${NC}"
echo ""
echo -e "${BLUE}📋 Próximos passos:${NC}"
echo -e "   1. Execute: ${YELLOW}./scripts/dev-setup.sh${NC}"
echo -e "   2. ou: ${YELLOW}npm run setup${NC}"
echo -e "   3. Depois: ${YELLOW}npm run dev${NC}"
echo ""
echo -e "${BLUE}🔧 Comandos de diagnóstico:${NC}"
echo -e "   • ${YELLOW}docker-compose ps${NC} - Status dos containers"
echo -e "   • ${YELLOW}docker-compose logs${NC} - Logs dos containers"
echo -e "   • ${YELLOW}npm run health${NC} - Verificar saúde dos serviços"