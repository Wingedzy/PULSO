@echo off
echo Iniciando o sistema...
start cmd /k "cd /d "%~dp0" && npm start"
timeout /t 2 >nul
start cmd /k "cd /d "%~dp0client" && npm start"