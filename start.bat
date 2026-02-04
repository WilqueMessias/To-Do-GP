@echo off
if defined TM_DEBUG echo on
setlocal EnableExtensions
pushd "%~dp0"
TITLE Task Manager Kanban - Launcher
CLS

:MENU
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

if not defined choice SET /P choice="Selection [1-4]: "

REM Normalize input (remove spaces)
set "choice=%choice: =%"

IF "%choice%"=="1" GOTO DOCKER
IF "%choice%"=="2" GOTO DEV
IF "%choice%"=="3" GOTO INSTALL
IF "%choice%"=="4" GOTO END

REM Invalid selection: re-display menu
set "choice="
GOTO MENU

:DOCKER
set "choice="
set "IS_HOME="
echo.
echo [0/3] Preflight: Docker Desktop and WSL2 checks...
REM Check Docker CLI availability
where docker >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker CLI not found. Install Docker Desktop:
    echo         https://www.docker.com/products/docker-desktop
    goto DOCKER_FAIL
)

REM Check Docker daemon status
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker daemon not reachable. Please start Docker Desktop and retry.
    goto DOCKER_FAIL
)

REM Detect Windows edition (locale-independent) to guide WSL requirement
set "PRODUCT_NAME="
for /f "tokens=3,*" %%A in ('reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion" /v ProductName 2^>nul ^| findstr /I "ProductName"') do set "PRODUCT_NAME=%%A %%B"

set "EDITION_ID="
for /f "tokens=3" %%A in ('reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion" /v EditionID 2^>nul ^| findstr /I "EditionID"') do set "EDITION_ID=%%A"

if /I "%EDITION_ID:~0,4%"=="Core" set "IS_HOME=1"

echo [INFO] Detected Windows: %PRODUCT_NAME%
if defined IS_HOME (
    echo        Edition: Home - WSL2 required
) else (
    echo        Edition: Pro/Enterprise - WSL2 recommended; Hyper-V optional
)

REM Check WSL presence (recommended; required on Windows Home)
wsl -l -v >nul 2>&1
if errorlevel 1 (
    if defined IS_HOME (
        echo [NOTICE] Windows Home detected and WSL2 not found.
        echo         Enable WSL2 before using Docker Desktop:
        echo         - Command: wsl --install
        echo         - Docs: https://learn.microsoft.com/windows/wsl/install
        goto DOCKER_FAIL
    ) else (
        echo [WARNING] WSL2 not found. On Pro/Enterprise, Hyper-V engine is acceptable; WSL2 recommended.
    )
)

REM Resolve Docker Compose command (v1 vs v2)
set "DCMD="
docker compose version >nul 2>&1
if not errorlevel 1 (
    set "DCMD=docker compose"
    goto COMPOSE_OK
)

docker-compose version >nul 2>&1
if not errorlevel 1 (
    set "DCMD=docker-compose"
    goto COMPOSE_OK
)

echo [ERROR] Docker Compose not found. Update Docker Desktop (Compose v2).
goto DOCKER_FAIL

:COMPOSE_OK
echo [INFO] Compose command: %DCMD%

echo [1/3] Deployment: Synchronizing containers...
%DCMD% up -d --build

if errorlevel 1 (
    echo.
    echo [ERROR] Docker Compose failed during build/up.
    goto DOCKER_FAIL
)

echo [2/3] Stability: Waiting for API health (this may take 30-60s)...
:WAIT_HEALTH
for /f "delims=" %%i in ('%DCMD% ps -q tm-api') do set "TM_API_CID=%%i"
if not defined TM_API_CID goto WAIT_HEALTH
powershell -Command "$status = docker inspect --format='{{.State.Health.Status}}' %TM_API_CID%; if($status -ne 'healthy') { exit 1 } else { exit 0 }" >nul 2>&1
if errorlevel 1 (
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

:DOCKER_FAIL
set "choice="
echo.
echo ===================================================
echo   DOCKER PRECHECK FAILED
echo   Please resolve the issue above and retry.
echo   Tips:
echo     - Start Docker Desktop
echo     - Enable WSL2 (Windows Home)
echo     - Update to Docker Compose v2
echo ===================================================
echo.
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
set "choice="
echo.
echo [OK] Instalando dependencias do Frontend...
cd tm-ui && npm install
echo.
echo Concluido!
pause
GOTO MENU

:END
popd
endlocal
exit /b
