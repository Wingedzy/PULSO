@echo off
cd /d "C:\Users\pedro\OneDrive\Desktop\VERSÃO DE EXPOSIÇÃO"
start cmd /k "node Mentrix/server/index.js"
start cmd /k "cd Mentrix/client && npm start"
