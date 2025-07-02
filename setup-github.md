# 🔗 Setup GitHub Repository - Planify

## 📋 **Passos para Criar o Repositório**

### **1. Criar Repositório no GitHub**
1. Acesse: https://github.com/new
2. **Repository name**: `planify`
3. **Description**: `SaaS de gestão financeira para infoprodutores - Backend Node.js + Frontend Next.js`
4. **Visibility**: Private (recomendado) ou Public
5. **Initialize**: ❌ NÃO marque nenhuma opção (README, .gitignore, license)
6. Clique em **"Create repository"**

### **2. Conectar Repositório Local**
Após criar o repositório, execute os comandos:

```bash
# Remover origin atual (se necessário)
git remote remove origin

# Adicionar o repositório correto (substitua SEU_USUARIO)
git remote add origin https://github.com/SEU_USUARIO/planify.git

# Fazer o push
git push -u origin main
```

### **3. Configurar Digital Ocean Apps**

Após o push, conecte os repositórios nas apps:

**Backend:**
- URL: https://cloud.digitalocean.com/apps/5e0b22ed-405d-4449-b050-7f91a707a8c7
- Settings → Source → Edit
- Repository: `SEU_USUARIO/planify`
- Branch: `main`
- Source Directory: `/backend`

**Frontend:**
- URL: https://cloud.digitalocean.com/apps/eb4b6b87-2274-4636-92ff-6c8a92c3c3cd
- Settings → Source → Edit
- Repository: `SEU_USUARIO/planify`
- Branch: `main`
- Source Directory: `/frontend`

## ✅ **Status Atual**
- ✅ Git inicializado
- ✅ Commit realizado (158 arquivos)
- ✅ Configuração git definida
- ⏳ Aguardando criação do repositório GitHub
- ⏳ Aguardando push para GitHub
- ⏳ Aguardando conexão nas apps Digital Ocean

## 📁 **Arquivos Commitados**
- **Backend completo**: API Node.js + TypeScript + Prisma
- **Frontend completo**: Next.js 15 + React 19 + Tailwind
- **Configurações**: Docker, scripts, testes
- **Deploy**: Documentação e scripts de monitoramento
- **Total**: 158 arquivos, 42.603 linhas

## 🚀 **Após Conectar Repositórios**
1. Digital Ocean detectará o código automaticamente
2. Iniciará builds automáticos
3. Executará `npm install && npm run build`
4. Executará `npm start`
5. Apps ficarão online com código real

## 🔄 **Monitoramento**
O monitoramento continuará ativo e detectará automaticamente quando os novos deploys iniciarem após a conexão dos repositórios.
