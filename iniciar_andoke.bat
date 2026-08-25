@echo off
title Servidor e Intranet - Parque Andoke
color 0A

:: 1. Guardar la ruta absoluta exacta donde se encuentra este archivo .bat
set "PADRE_DIR=%~dp0"
:: Quitar la barra diagonal final si existe para consistencia
if "%PADRE_DIR:~-1%"=="\" set "PADRE_DIR=%PADRE_DIR:~0,-1%"

:: 2. Elevar Privilegios a Administrador (Windows cambiará la ejecución a System32)
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ADMIN] Solicitando permisos de Administrador...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

:: ===================================================
:: CONFIGURACIÓN DEL SERVIDOR
:: ===================================================
set PUERTO=80
set NOMBRE_REGLA="Servidor Intranet Andoke (Puerto %PUERTO%)"

echo ===================================================
echo    INICIANDO DESPLIEGUE EN PRODUCCION - ANDOKE
echo ===================================================
echo.

:: 3. Moverse forzosamente a la carpeta Padre (donde esta Git y el .bat)
echo Regresando a la carpeta raiz: %PADRE_DIR%
cd /d "%PADRE_DIR%"

:: 4. Descargar cambios del repositorio
echo.
echo [1/5] Descargando ultimos cambios de Git...
git pull origin main

:: 5. Entrar a la subcarpeta del proyecto React
echo.
echo [2/5] Entrando a la subcarpeta del proyecto React...
cd /d "%PADRE_DIR%\andoke-macro"

:: 6. Verificar e instalar dependencias
echo.
echo [3/5] Verificando dependencias de Node...
call npm install

:: 7. Recompilar el proyecto para PRODUCCIÓN (Genera la carpeta dist)
echo.
echo [4/5] Generando compilacion de produccion (Vite Build)...
call npm run build

:: 8. Configurar Firewall de Windows
echo.
echo [5/5] Configurando regla en Firewall de Windows para el puerto %PUERTO%...
netsh advfirewall firewall show rule name=%NOMBRE_REGLA% >nul 2>&1
if %errorlevel% neq 0 (
    echo Creando regla de entrada en el Firewall para el puerto %PUERTO%...
    netsh advfirewall firewall add rule name=%NOMBRE_REGLA% dir=in action=allow protocol=TCP localport=%PUERTO%
    echo Regla creada exitosamente.
) else (
    echo La regla de Firewall para el puerto %PUERTO% ya está activa.
)

:: 9. Servir la carpeta dist de PRODUCCIÓN
echo.
echo ===================================================
echo Intranet lista y sirviendo la carpeta 'dist'.
echo Apunte los móviles/tótems a la IP de la PC en puerto %PUERTO%.
echo Mantén esta ventana abierta.
echo ===================================================
echo.

npx -y serve -s dist -l %PUERTO%