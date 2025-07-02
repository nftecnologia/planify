# Project Brief - FinanceInfo Pro

## Visão Geral
**Nome:** FinanceInfo Pro  
**Tipo:** SaaS de gestão financeira especializado para infoprodutores brasileiros  
**Objetivo:** Plataforma completa que integra dados de anúncios Meta Ads (CSV) + webhook Kirvano em tempo real

## Core Requirements
- **Diferencial único:** Módulo de anúncios com import CSV + integração Kirvano webhook
- **Público-alvo:** Infoprodutores brasileiros (courses, ebooks, mentorias)
- **Arquitetura:** Digital Ocean App Platform (fully managed)
- **Stack:** Next.js + Node.js + PostgreSQL + Redis

## Strategic Vision
Ser a ferramenta definitiva para infoprodutores controlarem suas finanças de forma inteligente, com:
- Atribuição automática de receitas via UTMs
- Cálculos precisos de ROI/ROAS por produto
- Gestão tributária automatizada (MEI/Simples Nacional)
- Fluxo de caixa preditivo

## Success Criteria
1. **MVP funcionando** em 3 meses
2. **100 usuários pagantes** em 6 meses  
3. **ROI positivo** para todos os clientes
4. **NPS > 8.5** na experiência do usuário
5. **99.9% uptime** na infraestrutura

## Scope Limitations
- **Fase 1:** Focar apenas Meta Ads (não Google, TikTok)
- **Fase 1:** Kirvano como único gateway de pagamento
- **Fase 1:** Brasil como único mercado
- **Interface:** Português brasileiro obrigatório

## Strategic Decisions Made
- **✅ Digital Ocean App Platform** escolhido vs droplets (managed, CI/CD, auto-scaling)
- **✅ PostgreSQL + Prisma** para ORM e migrations
- **✅ Redis** para cache e job queues
- **✅ Webhook-first** approach para tempo real