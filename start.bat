@echo off
echo 🚀 Iniciando Central de Produtividade...
echo.

REM Verificar se dependências estão instaladas
if not exist "node_modules" (
    echo 📦 Instalando dependências do backend...
    call npm install
)

if not exist "client\node_modules" (
    echo 📦 Instalando dependências do frontend...
    cd client && call npm install && cd ..
)

echo.
echo 🎯 Para iniciar a aplicação:
echo.
echo 1. Terminal 1 - Backend:
echo    npm start
echo.
echo 2. Terminal 2 - Frontend:
echo    cd client ^&^& npm start
echo.
echo 📱 Acesse: http://localhost:3000
echo 🔧 API: http://localhost:3001
echo.
pause