@echo off
if defined TM_DEBUG echo on
setlocal EnableExtensions
pushd "%~dp0"
TITLE Task Manager Kanban - Launcher
CLS

:CONFIRM
echo.
set /p "run_docker=Do you want to start the application using Docker Compose? [y/n]: "
if /i "%run_docker%"=="n" goto END
if /i not "%run_docker%"=="y" goto CONFIRM

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

REM Detect Windows edition
set "PRODUCT_NAME="
for /f "tokens=3,*" %%A in ('reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion" /v ProductName 2^>nul ^| findstr /I "ProductName"') do set "PRODUCT_NAME=%%A %%B"
set "EDITION_ID="
for /f "tokens=3" %%A in ('reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion" /v EditionID 2^>nul ^| findstr /I "EditionID"') do set "EDITION_ID=%%A"
if /I "%EDITION_ID:~0,4%"=="Core" set "IS_HOME=1"

echo [INFO] Detected Windows: %PRODUCT_NAME%

REM Resolve Docker Compose command
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
if not defined TM_API_CID (
    timeout /t 2 /nobreak >nul
    goto WAIT_HEALTH
)
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
goto END

:DOCKER_FAIL
echo.
echo ===================================================
echo   DOCKER PRECHECK FAILED
echo   Please ensure Docker Desktop is running and WSL2 is enabled.
echo ===================================================
pause

:END
popd
endlocal
exit /b
