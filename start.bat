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
echo [OK] Iniciando Backend em uma nova janela...
start cmd /k "cd tm-api && mvn spring-boot:run"
echo [OK] Iniciando Frontend em uma nova janela...
start cmd /k "cd tm-ui && npm run dev"
echo.
echo Aplicacao sendo iniciada!
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5173
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
