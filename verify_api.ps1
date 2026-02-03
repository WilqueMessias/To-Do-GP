$ErrorActionPreference = "Continue"

Write-Host "==============================" -ForegroundColor Cyan
Write-Host "   DIAGNOSTICO DEFINITIVO     " -ForegroundColor Cyan
Write-Host "=============================="

$baseUrl = "http://127.0.0.1:8080" # Usando IP diretamente para evitar DNS flakiness
$maxRetries = 15
$retryDelay = 2

Write-Host "[1/3] Aguardando Porta 8080..." -NoNewline
for ($i = 1; $i -le $maxRetries; $i++) {
    $check = Test-NetConnection -ComputerName 127.0.0.1 -Port 8080 -WarningAction SilentlyContinue
    if ($check.TcpTestSucceeded) {
        Write-Host " [OK]" -ForegroundColor Green
        break
    }
    Write-Host "." -NoNewline -ForegroundColor Yellow
    Start-Sleep -Seconds $retryDelay
    if ($i -eq $maxRetries) { Write-Host " [FALHA]" -ForegroundColor Red; exit 1 }
}

Write-Host "[2/3] Testando /health..." -NoNewline
try {
    $h = Invoke-WebRequest -Uri "$baseUrl/health" -Method Get -TimeoutSec 5 -Proxy $null -UseBasicParsing
    Write-Host " [OK]" -ForegroundColor Green
} catch {
    Write-Host " [!] Sem resposta no health." -ForegroundColor Yellow
}

Write-Host "[3/3] Testando Endpoint /tasks..." -NoNewline
try {
    # Testamos com /tasks (novo mapeamento simplificado)
    $t = Invoke-WebRequest -Uri "$baseUrl/tasks" -Method Get -TimeoutSec 5 -Proxy $null -UseBasicParsing
    Write-Host " [SUCESSO]" -ForegroundColor Green
    Write-Host ">>> O SISTEMA ESTA VIVO!" -ForegroundColor Green
    exit 0
} catch {
    if ($_.Exception.Response) {
        $st = [int]$_.Exception.Response.StatusCode
        Write-Host " [ERRO $st]" -ForegroundColor Red
        Write-Host "LOG DO SERVIDOR: Olhe a janela 'TM Backend' para ver o 'QA DIAGNOSTIC'." -ForegroundColor Cyan
    } else {
        Write-Host " [ERRO DE REDE]" -ForegroundColor Red
    }
    exit 1
}
