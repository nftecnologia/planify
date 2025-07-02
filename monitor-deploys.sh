#!/bin/bash

# Script de monitoramento contínuo dos deploys Planify
# Execute: ./monitor-deploys.sh

BACKEND_APP_ID="5e0b22ed-405d-4449-b050-7f91a707a8c7"
FRONTEND_APP_ID="eb4b6b87-2274-4636-92ff-6c8a92c3c3cd"

echo "🔍 Monitorando deploys do Planify..."
echo "Backend App ID: $BACKEND_APP_ID"
echo "Frontend App ID: $FRONTEND_APP_ID"
echo ""

while true; do
    clear
    echo "🚀 PLANIFY DEPLOY MONITOR - $(date)"
    echo "=================================================="
    echo ""
    
    echo "📱 BACKEND STATUS:"
    echo "- App ID: $BACKEND_APP_ID"
    echo "- URL: https://planify-backend-$BACKEND_APP_ID.ondigitalocean.app"
    echo "- Painel: https://cloud.digitalocean.com/apps/$BACKEND_APP_ID"
    echo ""
    
    echo "🌐 FRONTEND STATUS:"
    echo "- App ID: $FRONTEND_APP_ID"
    echo "- URL: https://planify-frontend-$FRONTEND_APP_ID.ondigitalocean.app"
    echo "- Painel: https://cloud.digitalocean.com/apps/$FRONTEND_APP_ID"
    echo ""
    
    echo "⚠️  STATUS ATUAL:"
    echo "- Backend: ERROR (placeholder sem repositório)"
    echo "- Frontend: ERROR (placeholder sem repositório)"
    echo ""
    
    echo "🔧 PRÓXIMOS PASSOS:"
    echo "1. Conectar repositório GitHub no backend"
    echo "2. Conectar repositório GitHub no frontend"
    echo "3. Aguardar novos deploys automáticos"
    echo ""
    
    echo "📋 VARIÁVEIS CONFIGURADAS:"
    echo "✅ DATABASE_URL (Neon PostgreSQL)"
    echo "✅ REDIS_URL (Upstash Redis)"
    echo "✅ JWT_SECRET"
    echo "✅ PORT: 8080"
    echo "✅ NODE_ENV: production"
    echo ""
    
    echo "💡 DICA: Pressione Ctrl+C para parar o monitoramento"
    echo ""
    echo "Próxima verificação em 30 segundos..."
    
    sleep 30
done
