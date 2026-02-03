@echo off
TITLE Task Manager Kanban - Launcher
CLS

echo ===================================================
echo    ENTERPRISE KANBAN ORCHESTRATOR
echo ===================================================
echo.
echo Please select the system runtime environment:
echo.
echo [1] CONTAINERIZED: Deploy via Docker Compose (Recommended)
echo [2] NATIVE DEVELOPMENT: Local JRE/Node Ecosystem
echo [3] INITIALIZE: Bootstrap Frontend Dependencies
echo [4] EXIT
echo.

SET /P choice="Selection [1-4]: "

IF "%choice%"=="1" GOTO DOCKER
IF "%choice%"=="2" GOTO DEV
IF "%choice%"=="3" GOTO INSTALL
IF "%choice%"=="4" EXIT

:DOCKER
echo.
echo [DEPLOY] Synchronizing containers...
docker-compose up --build
pause
GOTO MENU

:DEV
echo.
echo [PHASE 1/5] Network Readiness: Port Conflict Resolution...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

echo [PHASE 2/5] Infrastructure: Environment Context Configuration...
set "JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.18.8-hotspot"
set "MAVEN_HOME=%~dp0maven\apache-maven-3.9.6"
set "PATH=%JAVA_HOME%\bin;%MAVEN_HOME%\bin;%PATH%"

echo [PHASE 3/5] Lifecycle: Backend Compilation & Runtime Boot...
start "TM Backend" cmd /k "cd tm-api && mvn clean spring-boot:run"

echo [PHASE 4/5] Propagation: Service Health Verification...
powershell -ExecutionPolicy Bypass -File "%~dp0verify_api.ps1"

if %errorlevel% neq 0 (
    echo [WARNING] Backend service health check timed out.
    echo           Please inspect the "TM Backend" process for anomalies.
    echo           Proceeding with UI serve attempt...
    timeout /t 3
)

echo [PHASE 5/5] User Access: UI Asset Serve & Browser Launcher...
start "TM Frontend" cmd /k "cd tm-ui && npm run dev"
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo.
echo ===================================================
echo   ORCHESTRATION SUCCESSFUL: Services Online.
echo   Frontend Entry Point: http://localhost:5173
echo   Backend REST API:     http://localhost:8080
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
