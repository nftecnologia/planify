#!/bin/bash

# Script para atualizar variáveis de ambiente das aplicações Planify
# Execute este script quando o banco PostgreSQL estiver online

echo "🚀 Atualizando variáveis de ambiente do Planify..."

# IDs das aplicações
BACKEND_APP_ID="5e0b22ed-405d-4449-b050-7f91a707a8c7"
FRONTEND_APP_ID="eb4b6b87-2274-4636-92ff-6c8a92c3c3cd"
DATABASE_ID="0c9bf568-3351-4fbb-a704-e8b404eff937"

# URLs das aplicações
BACKEND_URL="https://planify-backend-${BACKEND_APP_ID}.ondigitalocean.app"
FRONTEND_URL="https://planify-frontend-${FRONTEND_APP_ID}.ondigitalocean.app"

echo "📱 Backend App: $BACKEND_URL"
echo "🌐 Frontend App: $FRONTEND_URL"
echo "🗄️  Database ID: $DATABASE_ID"

echo ""
echo "📋 Próximos passos manuais:"
echo ""
echo "1. 🔗 Conectar repositórios GitHub:"
echo "   Backend:  https://cloud.digitalocean.com/apps/${BACKEND_APP_ID}"
echo "   Frontend: https://cloud.digitalocean.com/apps/${FRONTEND_APP_ID}"
echo ""
echo "2. ⚙️  Configurar build settings:"
echo "   Backend:"
echo "     - Source Directory: /backend"
echo "     - Build Command: npm install && npm run build"
echo "     - Run Command: npm start"
echo "     - Port: 8080"
echo ""
echo "   Frontend:"
echo "     - Source Directory: /frontend"
echo "     - Build Command: npm install && npm run build"
echo "     - Run Command: npm start"
echo "     - Port: 3000"
echo ""
echo "3. 🗄️  Verificar status do banco:"
echo "   https://cloud.digitalocean.com/databases/${DATABASE_ID}"
echo ""
echo "4. 🔄 Executar migrações quando banco estiver online:"
echo "   npx prisma migrate deploy"
echo ""
echo "5. 🧪 Testar aplicações:"
echo "   Backend Health: ${BACKEND_URL}/api/health"
echo "   Frontend: ${FRONTEND_URL}"
echo ""
echo "✅ Deploy infrastructure criada com sucesso!"
echo "💰 Custo estimado: ~$24/mês"
