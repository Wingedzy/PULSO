#!/bin/bash

echo "🚀 Iniciando Central de Produtividade..."
echo ""

# Verificar se dependecias estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências do backend..."
    npm install
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Instalando dependências do frontend..."
    cd client && npm install && cd ..
fi

echo ""
echo "🎯 Para iniciar a aplicação:"
echo ""
echo "1. Terminal 1 - Backend:"
echo "   npm start"
echo ""
echo "2. Terminal 2 - Frontend:"
echo "   cd client && npm start"
echo ""
echo "📱 Acesse: http://localhost:3000"
echo "🔧 API: http://localhost:3001"
echo ""