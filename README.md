# 🚀 FinanceInfo Pro - SaaS Financeiro para Infoprodutores

Sistema completo de gestão financeira especializado para criadores de infoprodutos brasileiros.

## 🚀 Sobre o Projeto

O **FinanceInfo Pro** é uma plataforma SaaS completa desenvolvida especificamente para infoprodutores que precisam de uma solução robusta e intuitiva para gestão financeira. Nossa solução oferece controle total sobre receitas, despesas, fluxo de caixa e análises avançadas para tomada de decisões estratégicas.

## 🏗️ Arquitetura

Este projeto utiliza uma arquitetura **monorepo** com as seguintes tecnologias:

### Stack Tecnológica
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express.js + TypeScript
- **Banco de Dados**: PostgreSQL
- **Deploy**: Digital Ocean App Platform
- **Autenticação**: JWT + OAuth2
- **Pagamentos**: Stripe

### Estrutura do Projeto
```
/
├── frontend/          # Aplicação Next.js
├── backend/           # API Express.js
├── shared/            # Types e utilitários compartilhados
├── docs/              # Documentação do projeto
├── memory-bank/       # Sistema de documentação inteligente
└── README.md
```

## ✨ **Funcionalidades Principais**

### ✅ **8 Páginas Totalmente Funcionais**

1. **💰 Dashboard Inteligente** - 12 KPIs + métricas consolidadas
2. **📊 Gestão de Receitas** - Integração Kirvano + análise de crescimento  
3. **💸 Controle de Despesas** - CRUD completo + categorização automática
4. **📋 Sistema Tributário** - Cálculo MEI/Simples/Lucro + simulador
5. **💳 Fluxo de Caixa** - Score saúde + 3 cenários + recomendações IA
6. **🛍️ Gestão de Produtos** - CRUD + vinculação com campanhas
7. **📈 Anúncios Meta Ads** - Upload CSV + parser + analytics ROI
8. **⚙️ Configurações** - Perfil + integrações + segurança 2FA

### 🎯 **Funcionalidades Únicas**

- ✅ **Sistema de Fallback Inteligente** - Funciona 100% sem backend
- ✅ **Cálculos Tributários Brasileiros** - MEI, Simples, Lucro Presumido
- ✅ **Score de Saúde Financeira** - Análise 0-100 com IA
- ✅ **Projeções de Cenários** - Pessimista/Realista/Otimista
- ✅ **Upload CSV Meta Ads** - Parser inteligente + vinculação automática

## 🛠️ Configuração de Desenvolvimento

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+
- Git

### Instalação
```bash
# Clone o repositório
git clone <repository-url>
cd inforoi

# Instale as dependências do frontend
cd frontend
npm install

# Instale as dependências do backend
cd ../backend
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais
```

### Executando o Projeto
```bash
# Terminal 1 - Frontend (PRINCIPAL)
cd frontend
npm install
npm run dev
# Acesse: http://localhost:3003

# Terminal 2 - Backend (OPCIONAL)
cd backend
npm install
npm run dev
# API: http://localhost:3001
```

### 🔐 Credenciais de Acesso

O sistema usa **autenticação mock** para demonstração:

- **Email:** `admin@teste.com` (qualquer email com @)
- **Senha:** `123` (qualquer senha com 3+ caracteres)

## 📝 Documentação

A documentação completa está disponível no diretório `/docs` e no sistema Memory Bank:
- [Especificações Técnicas](./saas_specs_completas.md)
- [Wireframes](./wireframe_saas_completo.html)
- [Memory Bank](./memory-bank/)

## 🤝 Contribuição

Este projeto é desenvolvido com o apoio da **Claude Code** - utilizando práticas avançadas de desenvolvimento assistido por IA para garantir qualidade e eficiência.

### Workflow de Desenvolvimento
1. Todas as modificações são documentadas no Memory Bank
2. Commits são realizados automaticamente após cada implementação
3. Testes são executados antes de cada deploy
4. Documentação é atualizada em tempo real

## 📄 Licença

Este projeto é propriedade privada. Todos os direitos reservados.

---

**Desenvolvido com ❤️ para infoprodutores brasileiros**

*Última atualização: 27 de junho de 2025*