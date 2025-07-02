# 🚀 Deploy Planify - Digital Ocean

## ✅ **Infraestrutura Criada**

### **PostgreSQL Database**
- **ID**: `0c9bf568-3351-4fbb-a704-e8b404eff937`
- **Nome**: `planify-postgres`
- **Engine**: PostgreSQL 17
- **Região**: nyc1
- **Status**: creating (aguardando ficar online)
- **Connection URI**: `postgresql://doadmin:***@planify-postgres-do-user-23465503-0.e.db.ondigitalocean.com:25060/defaultdb?sslmode=require`

### **Backend App**
- **ID**: `5e0b22ed-405d-4449-b050-7f91a707a8c7`
- **Nome**: `planify-backend`
- **URL**: `https://planify-backend-5e0b22ed-405d-4449-b050-7f91a707a8c7.ondigitalocean.app`
- **Região**: nyc
- **Status**: Placeholder criado (precisa configurar repositório)

### **Frontend App**
- **ID**: `eb4b6b87-2274-4636-92ff-6c8a92c3c3cd`
- **Nome**: `planify-frontend`
- **URL**: `https://planify-frontend-eb4b6b87-2274-4636-92ff-6c8a92c3c3cd.ondigitalocean.app`
- **Região**: nyc
- **Status**: Placeholder criado (precisa configurar repositório)

## 🔧 **Próximos Passos**

### **1. Configurar Repositórios**
Acesse o painel da Digital Ocean e configure os repositórios GitHub:

**Backend**: https://cloud.digitalocean.com/apps/5e0b22ed-405d-4449-b050-7f91a707a8c7
- Source: GitHub repository
- Branch: main
- Source Directory: `/backend`
- Build Command: `npm install && npm run build`
- Run Command: `npm start`

**Frontend**: https://cloud.digitalocean.com/apps/eb4b6b87-2274-4636-92ff-6c8a92c3c3cd
- Source: GitHub repository
- Branch: main
- Source Directory: `/frontend`
- Build Command: `npm install && npm run build`
- Run Command: `npm start`

### **2. Aguardar Database**
O PostgreSQL ainda está sendo criado. Quando estiver online:
- Executar migrações do Prisma
- Criar usuário e banco específico para a aplicação

### **3. Configurar Domínios (Opcional)**
- Backend: `api.planify.com`
- Frontend: `app.planify.com`

## 🔐 **Variáveis de Ambiente Configuradas**

### **Backend**
```env
NODE_ENV=production
PORT=8080
DATABASE_URL=postgresql://doadmin:***@planify-postgres-do-user-23465503-0.e.db.ondigitalocean.com:25060/defaultdb?sslmode=require
REDIS_URL=redis://default:***@equipped-buzzard-28751.upstash.io:6379
JWT_SECRET=***
JWT_REFRESH_SECRET=***
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
WEBHOOK_SECRET=***
```

### **Frontend**
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://planify-backend-5e0b22ed-405d-4449-b050-7f91a707a8c7.ondigitalocean.app/api
```

## 💰 **Custos Estimados**
- PostgreSQL (db-s-1vcpu-2gb): ~$15/mês
- Backend App (apps-s-1vcpu-1gb): ~$6/mês
- Frontend App (apps-s-1vcpu-0.5gb): ~$3/mês
- **Total**: ~$24/mês

## 🔗 **Links Úteis**
- **Projeto Digital Ocean**: https://cloud.digitalocean.com/projects/e52590d3-402e-43d7-b4a9-63366107f1fd/resources
- **Backend App**: https://cloud.digitalocean.com/apps/5e0b22ed-405d-4449-b050-7f91a707a8c7
- **Frontend App**: https://cloud.digitalocean.com/apps/eb4b6b87-2274-4636-92ff-6c8a92c3c3cd
- **Database**: https://cloud.digitalocean.com/databases/0c9bf568-3351-4fbb-a704-e8b404eff937

## 📋 **Checklist de Deploy**
- [x] Criar PostgreSQL Database
- [x] Criar Backend App (placeholder)
- [x] Criar Frontend App (placeholder)
- [x] Configurar variáveis de ambiente
- [ ] Conectar repositório GitHub ao Backend
- [ ] Conectar repositório GitHub ao Frontend
- [ ] Aguardar Database ficar online
- [ ] Executar migrações Prisma
- [ ] Testar aplicações
- [ ] Configurar domínios customizados (opcional)
- [ ] Configurar monitoramento e alertas
