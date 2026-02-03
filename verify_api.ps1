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

try {
    # Usando Proxy $null para evitar interferencia de proxies corporativos
    $response = Invoke-WebRequest -Uri "$baseUrl/tasks" -Method Get -TimeoutSec 10 -UseBasicParsing -Proxy $null
    Write-Host " [SUCESSO]" -ForegroundColor Green
    Write-Host ">>> O SISTEMA ESTA VIVO!" -ForegroundColor Green
    exit 0
} catch {
    if ($_.Exception.Response) {
        $st = [int]$_.Exception.Response.StatusCode
        $errBody = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errBody)
        $text = $reader.ReadToEnd()
        Write-Host " [ERRO $st]" -ForegroundColor Red
        Write-Host " DETALHE DO ERRO: $text" -ForegroundColor Yellow
        
        Write-Host " [DIAGNOSTICO] Verificando se o servidor recebeu o sinal (requests.log)..." -ForegroundColor Cyan
        if (Test-Path "d:\GP\requests.log") {
             $lastLog = Get-Content "d:\GP\requests.log" -Tail 1
             Write-Host " ULTIMA REQUISICAO RECEBIDA: $lastLog" -ForegroundColor White
        } else {
             Write-Host " [AVISO] O servidor nem sequer criou o log. O sinal nao chegou no Java." -ForegroundColor Yellow
        }
        Write-Host " DICA: Olhe a janela 'TM Backend' para ver a lista 'REGISTERED ENDPOINTS'." -ForegroundColor Cyan
    } else {
        Write-Host " [ERRO DE REDE]" -ForegroundColor Red
    }
    exit 1
}
