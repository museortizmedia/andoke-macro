@echo off
title Servidor e Intranet - Parque Andoke
color 0A

:: 1. Guardar la ruta absoluta exacta donde se encuentra este archivo .bat
set "PADRE_DIR=%~dp0"
if "%PADRE_DIR:~-1%"=="\" set "PADRE_DIR=%PADRE_DIR:~0,-1%"

:: Definir la ruta exacta del proyecto React (Doble carpeta según tu estructura)
set "REACT_DIR=%PADRE_DIR%\andoke-macro"
set "DIST_DIR=%REACT_DIR%\dist"

:: 2. Elevar Privilegios a Administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ADMIN] Solicitando permisos de Administrador...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

:: ===================================================
:: CONFIGURACIÓN DEL SERVIDOR
:: ===================================================
set PUERTO_HTTP=80
set PUERTO_HTTPS=443
set NOMBRE_REGLA_HTTP="Servidor Intranet Andoke (Puerto %PUERTO_HTTP%)"
set NOMBRE_REGLA_HTTPS="Servidor Intranet Andoke (Puerto %PUERTO_HTTPS%)"

echo ===================================================
echo    INICIANDO DESPLIEGUE EN PRODUCCION - ANDOKE
echo ===================================================
echo.

:: 3. Moverse forzosamente a la carpeta Padre (Donde está Git y el .bat)
echo Regresando a la carpeta raiz: %PADRE_DIR%
cd /d "%PADRE_DIR%"

:: 4. Validar si la carpeta dist NO existe (Fuerza el build inicial)
if not exist "%DIST_DIR%" (
    echo [INFO] No se encontro la carpeta 'dist'. Se procedera con el build inicial...
    goto EJECUTAR_BUILD
)

:: 5. Descargar cambios del repositorio y verificar si hubo actualización
echo.
echo [1/5] Verificando cambios en Git...

set "GIT_OUTPUT="
for /f "delims=" %%i in ('git pull origin main 2^>^&1') do (
    if not defined GIT_OUTPUT set "GIT_OUTPUT=%%i"
)

echo Respuesta de Git: %GIT_OUTPUT%

:: Comparamos la respuesta para ver si ya está actualizado
echo %GIT_OUTPUT% | findstr /C:"Already up to date" >nul
if %errorlevel% == 0 (
    echo.
    echo [INFO] El codigo ya esta actualizado y la carpeta 'dist' existe. Saltando build.
    goto INICIAR_SERVIDOR
)

:EJECUTAR_BUILD
:: 6. Entrar a la subcarpeta interna del proyecto React
echo.
echo [2/5] Entrando a la subcarpeta del proyecto React...
cd /d "%REACT_DIR%"

:: 7. Verificar e instalar dependencias
echo.
echo [3/5] Verificando dependencias de Node...
call npm install

:: 8. Recompilar el proyecto para PRODUCCIÓN
echo.
echo [4/5] Generando compilacion de produccion (Vite Build)...
call npm run build

:INICIAR_SERVIDOR
:: 9. Configurar Firewall de Windows
echo.
echo [5/5] Configurando reglas en Firewall de Windows...
netsh advfirewall firewall show rule name=%NOMBRE_REGLA_HTTP% >nul 2>&1
if %errorlevel% neq 0 (
    netsh advfirewall firewall add rule name=%NOMBRE_REGLA_HTTP% dir=in action=allow protocol=TCP localport=%PUERTO_HTTP%
)
netsh advfirewall firewall show rule name=%NOMBRE_REGLA_HTTPS% >nul 2>&1
if %errorlevel% neq 0 (
    netsh advfirewall firewall add rule name=%NOMBRE_REGLA_HTTPS% dir=in action=allow protocol=TCP localport=%PUERTO_HTTPS%
)

:: 10. Servir la carpeta dist con Caddy
echo.
echo ===================================================
echo Intranet lista y sirviendo con Caddy de forma SEGURA.
echo Apunte los navegadores a: https://andoke.com.co
echo Mantén esta ventana abierta.
echo ===================================================
echo.

:: Regresar a la raíz donde está caddy.exe y el Caddyfile
cd /d "%PADRE_DIR%"

if not exist Caddyfile (
    color 0C
    echo [ERROR CRITICO] No se encontro el archivo Caddyfile en la ruta: %PADRE_DIR%
    echo Por favor, crea el archivo e intenta de nuevo.
    pause
    exit /b
)

:: Ejecutar Caddy (Si falla, la consola se mantendrá abierta para ver el error)
caddy.exe run --config Caddyfile

echo.
color 0C
echo ===================================================
echo [ALERTA] El servidor Caddy se ha detenido inesperadamente.
echo Revisa los mensajes de error superiores para diagnosticar.
echo ===================================================
pause
