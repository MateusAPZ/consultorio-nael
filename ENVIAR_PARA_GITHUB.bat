@echo off
chcp 65001 > nul
title Enviar Sistema para o GitHub
cls
echo ====================================================================
echo      🚀 Enviar Consultório Dr. Nael para o GitHub (Nuvem)
echo ====================================================================
echo.
echo Este script vai conectar este projeto ao seu repositório no GitHub.
echo.
echo 1. Crie um repositório no seu GitHub (ex: consultorio-nael).
echo 2. Cole a URL do seu repositório abaixo (ex: https://github.com/seu-usuario/consultorio-nael.git)
echo.
set /p REPO_URL="Cole a URL do GitHub e aperte ENTER: "

if "%REPO_URL%"=="" (
    echo.
    echo Nenhuma URL informada. Operação cancelada.
    pause
    exit /b
)

echo.
echo Conectando ao repositório...
"C:\Program Files\Git\cmd\git.exe" branch -M main
"C:\Program Files\Git\cmd\git.exe" remote remove origin 2>nul
"C:\Program Files\Git\cmd\git.exe" remote add origin %REPO_URL%

echo.
echo Enviando arquivos para o GitHub...
"C:\Program Files\Git\cmd\git.exe" push -u origin main

echo.
echo ====================================================================
echo  Envio concluído com sucesso!
echo  Agora acesse o Render.com e conecte este repositório!
echo ====================================================================
echo.
pause
