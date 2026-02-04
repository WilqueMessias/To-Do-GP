@echo off
pushd "%~dp0"
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
echo [1/3] Deployment: Synchronizing containers...
docker-compose up -d --build

echo [2/3] Stability: Waiting for API health (this may take 30-60s)...
:WAIT_HEALTH
for /f "delims=" %%i in ('docker-compose ps -q tm-api') do set "TM_API_CID=%%i"
if not defined TM_API_CID goto WAIT_HEALTH
powershell -Command "$status = docker inspect --format='{{.State.Health.Status}}' %TM_API_CID%; if($status -ne 'healthy') { exit 1 } else { exit 0 }" >nul 2>&1
if %errorlevel% neq 0 (
    <nul set /p=.
    timeout /t 2 /nobreak >nul
    goto WAIT_HEALTH
)

echo.
echo [3/3] User Access: Launching Production Interface...
timeout /t 2 /nobreak >nul
start http://localhost
echo.
echo ===================================================
echo   DOCKER DEPLOYMENT SUCCESSFUL
echo   Interface: http://localhost
echo   API Docs:  http://localhost:8080/swagger-ui.html
echo ===================================================
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

echo [PHASE 3/5] Lifecycle: Backend Compilation ^& Runtime Boot...

start "TM Backend" cmd /k "cd tm-api && mvn clean spring-boot:run"

echo [PHASE 4/5] Propagation: Service Health Verification...
powershell -ExecutionPolicy Bypass -File "%~dp0verify_api.ps1"

if %errorlevel% neq 0 (
    echo [WARNING] Backend service health check timed out.
    echo           Please inspect the "TM Backend" process for anomalies.
    echo           Proceeding with UI serve attempt...
    timeout /t 3
)

echo [PHASE 5/5] User Access: UI Asset Serve ^& Browser Launcher...

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
popd
call "%~dp0start.bat"
