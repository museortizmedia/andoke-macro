@echo off
title Servidor e Intranet - Parque Andoke
color 0A

:: 1. Guardar la ruta absoluta exacta del directorio padre
set "PADRE_DIR=%~dp0"
if "%PADRE_DIR:~-1%"=="\" set "PADRE_DIR=%PADRE_DIR:~0,-1%"

:: Definir rutas relativas de los proyectos
set "REACT_DIR=%PADRE_DIR%\andoke-macro"
set "DIST_DIR=%REACT_DIR%\dist"
set "API_DIR=%PADRE_DIR%\andoke-api"
set "MQTT_DIR=%PADRE_DIR%\andoke-mqtt"

:: 2. Elevar Privilegios a Administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ADMIN] Solicitando permisos de Administrador...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

:: CONFIGURACIÓN DE PUERTOS
set PUERTO_HTTP=80
set PUERTO_HTTPS=443
set PUERTO_MQTT_TCP=1883
set PUERTO_MQTT_WS=8083

echo ===================================================
echo    INICIANDO DESPLIEGUE EN PRODUCCION - ANDOKE
echo ===================================================
echo.

cd /d "%PADRE_DIR%"

:: 3. Validar compilación del frontend principal
if not exist "%DIST_DIR%" (
    echo [INFO] No se encontro la carpeta 'dist'. Generando build inicial...
    goto EJECUTAR_BUILD
)

echo [1/4] Verificando cambios en Git...
set "GIT_OUTPUT="
for /f "delims=" %%i in ('git pull origin main 2^>^&1') do (
    if not defined GIT_OUTPUT set "GIT_OUTPUT=%%i"
)
echo Respuesta de Git: %GIT_OUTPUT%

echo %GIT_OUTPUT% | findstr /C:"Already up to date" >nul
if %errorlevel% == 0 (
    echo [INFO] Codigo actualizado. Saltando build.
    goto INICIAR_SERVICIOS
)

:EJECUTAR_BUILD
echo.
echo [2/4] Compilando frontend (andoke-macro)...
if not exist "%REACT_DIR%" (
    color 0C
    echo [ERROR] No existe la carpeta %REACT_DIR%
    pause
    exit /b
)
cd /d "%REACT_DIR%"
call npm install
call npm run build

:INICIAR_SERVICIOS
echo.
echo [3/4] Configurando Firewall de Windows...
netsh advfirewall firewall add rule name="Intranet HTTP" dir=in action=allow protocol=TCP localport=%PUERTO_HTTP% >nul 2>&1
netsh advfirewall firewall add rule name="Intranet HTTPS" dir=in action=allow protocol=TCP localport=%PUERTO_HTTPS% >nul 2>&1
netsh advfirewall firewall add rule name="MQTT TCP Nativo" dir=in action=allow protocol=TCP localport=%PUERTO_MQTT_TCP% >nul 2>&1
netsh advfirewall firewall add rule name="MQTT WebSockets" dir=in action=allow protocol=TCP localport=%PUERTO_MQTT_WS% >nul 2>&1

:: 4. Levantar el Broker Mosquitto si está instalado
echo.
echo [4/4] Verificando e Iniciando Broker MQTT Mosquitto...
if exist "C:\Program Files\mosquitto\mosquitto.exe" (
    echo [OK] Iniciando Mosquitto en segundo plano...
    start "Mosquitto Broker" /b "C:\Program Files\mosquitto\mosquitto.exe" -c "C:\Program Files\mosquitto\mosquitto.conf"
) else (
    echo [ADVERTENCIA] Mosquitto no esta instalado en C:\Program Files\mosquitto.
    echo El subdominio mqtt fallara hasta que lo instales.
)

:: 5. Levantar la API si existe un index/servidor Node
if exist "%API_DIR%\server.js" (
    echo Iniciando Servidor API Node.js...
    cd /d "%API_DIR%"
    start "API Backend" /b node server.js
)

:: 6. Servir todo con Caddy
echo.
echo ===================================================
echo Servidores listos de forma SEGURA con Certificado Comodín:
echo - App Principal: https://andoke.com.co
echo - API Gateway:   https://andoke.com.co
echo - MQTT Broker:   https://andoke.com.co
echo ===================================================
echo.

cd /d "%PADRE_DIR%"
if not exist Caddyfile (
    color 0C
    echo [ERROR CRITICO] No se encontro el archivo Caddyfile en: %PADRE_DIR%
    pause
    exit /b
)

caddy.exe run --config Caddyfile

echo.
color 0C
echo ===================================================
echo [ALERTA] Caddy se ha detenido inesperadamente.
echo ===================================================
pause