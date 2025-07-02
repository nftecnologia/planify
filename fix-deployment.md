# 🔧 Correção do Deploy - Planify

## ❌ **Problema Identificado**
O deployment está falhando com erro: `DeployContainerExitZero`

**Causa**: O container está usando um comando placeholder que executa e termina imediatamente:
```bash
echo 'Backend placeholder - configure repository via web interface'
```

## ✅ **Solução**

### **Passo 1: Conectar Repositório GitHub**

1. **Acesse o painel do Backend**:
   https://cloud.digitalocean.com/apps/5e0b22ed-405d-4449-b050-7f91a707a8c7

2. **Clique em "Settings" → "App-Level Settings"**

3. **Na seção "Source", clique em "Edit"**

4. **Configure o repositório**:
   - **Source Type**: GitHub
   - **Repository**: Seu repositório do Planify
   - **Branch**: main
   - **Source Directory**: `/backend`
   - **Autodeploy**: Habilitado

5. **Configure Build Settings**:
   - **Build Command**: `npm install && npm run build`
   - **Run Command**: `npm start`
   - **Environment**: Node.js
   - **Node Version**: 18.x

### **Passo 2: Conectar Frontend**

1. **Acesse o painel do Frontend**:
   https://cloud.digitalocean.com/apps/eb4b6b87-2274-4636-92ff-6c8a92c3c3cd

2. **Configure da mesma forma**:
   - **Source Directory**: `/frontend`
   - **Build Command**: `npm install && npm run build`
   - **Run Command**: `npm start`

### **Passo 3: Verificar package.json**

Certifique-se que o `backend/package.json` tem os scripts corretos:

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "ts-node-dev src/server.ts"
  }
}
```

## 🔄 **Variáveis de Ambiente Já Configuradas**

✅ Todas as variáveis estão corretas:
- `DATABASE_URL`: Neon PostgreSQL
- `REDIS_URL`: Upstash Redis  
- `JWT_SECRET`: Configurado
- `PORT`: 8080
- `NODE_ENV`: production

## 📋 **Checklist de Correção**

- [ ] Conectar repositório GitHub no backend
- [ ] Conectar repositório GitHub no frontend
- [ ] Verificar scripts no package.json
- [ ] Aguardar novo deployment
- [ ] Testar endpoints da API
- [ ] Verificar logs se houver erro

## 🔗 **Links Úteis**

- **Backend App**: https://cloud.digitalocean.com/apps/5e0b22ed-405d-4449-b050-7f91a707a8c7
- **Frontend App**: https://cloud.digitalocean.com/apps/eb4b6b87-2274-4636-92ff-6c8a92c3c3cd
- **Backend URL**: https://planify-backend-5e0b22ed-405d-4449-b050-7f91a707a8c7.ondigitalocean.app
- **Frontend URL**: https://planify-frontend-eb4b6b87-2274-4636-92ff-6c8a92c3c3cd.ondigitalocean.app

## 🧪 **Testes Após Correção**

1. **Health Check**: `GET /api/health`
2. **Database**: Verificar conexão com Neon
3. **Redis**: Verificar conexão com Upstash
4. **Frontend**: Verificar se carrega corretamente

---

**Próximo passo**: Conecte os repositórios GitHub e o deploy será executado automaticamente com o código real da aplicação.
