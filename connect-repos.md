# 🔗 Conectar Repositórios GitHub - Digital Ocean Apps

## ✅ **GitHub Push Concluído!**
- **Repositório**: https://github.com/nftecnologia/planify
- **Branch**: main
- **Arquivos**: 158 arquivos + documentação
- **Status**: ✅ Disponível no GitHub

## 🚀 **Próximo Passo: Conectar Apps**

### **1. Backend App**
**URL**: https://cloud.digitalocean.com/apps/5e0b22ed-405d-4449-b050-7f91a707a8c7

**Passos**:
1. Acesse o link acima
2. Clique em **"Settings"** (menu lateral)
3. Clique em **"Source"**
4. Clique em **"Edit"** ao lado de "Source"
5. Configure:
   - **Repository**: `nftecnologia/planify`
   - **Branch**: `main`
   - **Source Directory**: `/backend`
   - **Autodeploy**: ✅ Habilitado
6. Clique em **"Save"**

### **2. Frontend App**
**URL**: https://cloud.digitalocean.com/apps/eb4b6b87-2274-4636-92ff-6c8a92c3c3cd

**Passos**:
1. Acesse o link acima
2. Clique em **"Settings"** (menu lateral)
3. Clique em **"Source"**
4. Clique em **"Edit"** ao lado de "Source"
5. Configure:
   - **Repository**: `nftecnologia/planify`
   - **Branch**: `main`
   - **Source Directory**: `/frontend`
   - **Autodeploy**: ✅ Habilitado
6. Clique em **"Save"**

## 🔄 **O que Acontecerá Após Conectar**

### **Automático**:
1. Digital Ocean detectará o código
2. Iniciará novos deployments automaticamente
3. Executará `npm install && npm run build`
4. Executará `npm start`
5. Apps ficarão online com código real

### **Monitoramento**:
- O sistema detectará automaticamente os novos deploys
- Logs serão atualizados em tempo real
- Status será monitorado continuamente

## 📊 **Variáveis Já Configuradas**

### **Backend**:
- ✅ `DATABASE_URL`: Neon PostgreSQL
- ✅ `REDIS_URL`: Upstash Redis
- ✅ `JWT_SECRET`: Configurado
- ✅ `PORT`: 8080
- ✅ Todas as variáveis necessárias

### **Frontend**:
- ✅ `NEXT_PUBLIC_API_URL`: URL do backend
- ✅ `NODE_ENV`: production

## 🎯 **URLs Finais**
- **Backend API**: https://planify-backend-5e0b22ed-405d-4449-b050-7f91a707a8c7.ondigitalocean.app
- **Frontend App**: https://planify-frontend-eb4b6b87-2274-4636-92ff-6c8a92c3c3cd.ondigitalocean.app

## ⏱️ **Tempo Estimado**
- **Configuração**: 2-3 minutos por app
- **Build + Deploy**: 5-10 minutos por app
- **Total**: ~15 minutos até estar online

## 🔍 **Verificação**
Após conectar, verifique:
1. Novos deployments iniciaram
2. Build logs mostram sucesso
3. Apps ficam com status "Live"
4. URLs respondem corretamente

**🎉 Pronto! Após conectar os repositórios, o Planify estará 100% online na Digital Ocean!**
