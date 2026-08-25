@echo off
title Servidor e Intranet - Parque Andoke
color 0A

echo ===================================================
echo   INICIANDO DESPLIEGUE AUTOMATICO DE ANDOKE
echo ===================================================
echo.

:: 1. Ir a la ruta fija del repositorio en Documents
cd /d "C:\Users\Aux Contable y Admin\Documents\Tecnología\andoke-macro"

:: 2. Descargar cambios de Git
echo [1/4] Descargando ultimos cambios de Git...
git pull origin main

:: 3. Entrar a la subcarpeta del proyecto React
echo.
echo Entrando a la subcarpeta del proyecto React...
cd andoke-macro

:: 4. Verificar e instalar dependencias si faltan
echo.
echo [2/4] Verificando dependencias de Node...
call npm install

:: 5. Recompilar el proyecto
echo.
echo [3/4] Generando nueva compilacion (Vite Build)...
call npm run build

:: 6. Levantar el servidor en el puerto 80
echo.
echo [4/4] Iniciando servidor web local en http://192.168.1.200 ...
echo Mantén esta ventana abierta.
echo.

npx -y serve -s dist -l 80