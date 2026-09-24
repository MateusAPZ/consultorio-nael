@echo off
chcp 65001 > nul
title Sistema Odontológico Dr. Nael
cls
echo ====================================================================
echo      🦷 Dr. Nael Odontologia Especializada - Gestão Clínica
echo ====================================================================
echo.
echo [1/2] Iniciando o servidor e banco de dados...
echo [2/2] Abrindo o sistema no seu computador...
echo.
timeout /t 2 /nobreak > nul
start http://localhost:5000
echo.
echo ====================================================================
echo  SISTEMA PRONTO E RODANDO:
echo.
echo  💻 No Computador:            http://localhost:5000
echo  📱 No Smartphone (no Wi-Fi): http://192.168.100.179:5000
echo.
echo  (Para encerrar o sistema no final do dia, basta fechar esta janela)
echo ====================================================================
echo.
node server/server.js
pause
