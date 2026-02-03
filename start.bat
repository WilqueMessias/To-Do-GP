@echo off
TITLE Task Manager Kanban - Launcher
CLS

echo ===================================================
echo    TASK MANAGER KANBAN - LAUNCHER
echo ===================================================
echo.
echo Escolha como deseja rodar a aplicacao:
echo.
echo [1] Rodar via DOCKER (Recomendado - Requer Docker Desktop)
echo [2] Rodar em modo DESENVOLVIMENTO (Requer Java 17 e Node.js)
echo [3] Apenas instalar dependencias do Frontend (npm install)
echo [4] Sair
echo.

SET /P choice="Digite sua opcao [1-4]: "

IF "%choice%"=="1" GOTO DOCKER
IF "%choice%"=="2" GOTO DEV
IF "%choice%"=="3" GOTO INSTALL
IF "%choice%"=="4" EXIT

:DOCKER
echo.
echo [OK] Iniciando via Docker Compose...
docker-compose up --build
pause
GOTO MENU

:DEV
echo.
echo [1/5] Limpando portas (5173, 8080)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

echo [2/5] Configurando Ambiente...
set "JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.18.8-hotspot"
set "MAVEN_HOME=%~dp0maven\apache-maven-3.9.6"
set "PATH=%JAVA_HOME%\bin;%MAVEN_HOME%\bin;%PATH%"

echo [3/5] Iniciando Backend (Limpando e Compilando)...
start "TM Backend" cmd /k "cd tm-api && mvn clean spring-boot:run"

echo [4/5] Aguardando API (pode levar ate 40s)...
powershell -ExecutionPolicy Bypass -File "%~dp0verify_api.ps1"

if %errorlevel% neq 0 (
    echo [ALERTA] O Backend nao respondeu no tempo limite.
    echo          Verifique a janela "TM Backend" para erros.
    echo          Tentando abrir o frontend mesmo assim...
    timeout /t 3
)

echo [5/5] Iniciando Frontend e Abrindo Navegador...
start "TM Frontend" cmd /k "cd tm-ui && npm run dev"
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo.
echo ===================================================
echo   SISTEMA INICIADO!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8080
echo ===================================================
echo.
pause
EXIT

:INSTALL
echo.
echo [OK] Instalando dependencias do Frontend...
cd tm-ui && npm install
echo.
echo Concluido!
pause
GOTO MENU

:MENU
start.bat
