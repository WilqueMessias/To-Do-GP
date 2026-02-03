$ErrorActionPreference = "Continue" # Don't stop on web errors, we want to see them

Write-Host "==============================" -ForegroundColor Cyan
Write-Host "   DIAGNOSTICO DE REDE - API  " -ForegroundColor Cyan
Write-Host "=============================="
Write-Host ""

$port = 8080
$url = "http://localhost:$port/api/tasks"
$maxRetries = 20
$retryDelay = 2

Write-Host "[PASSO 1] Verificando se a porta $port esta ouvindo..." -ForegroundColor White
$portOpen = $false
for ($i = 1; $i -le $maxRetries; $i++) {
    $check = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
    if ($check.TcpTestSucceeded) {
        Write-Host " [SUCESSO] Porta $port detectada!" -ForegroundColor Green
        $portOpen = $true
        break
    }
    Write-Host "." -NoNewline -ForegroundColor Yellow
    Start-Sleep -Seconds $retryDelay
}

if (-not $portOpen) {
    Write-Host "`n [FALHA] Nao detectei nada ouvindo na porta $port." -ForegroundColor Red
    Write-Host "DICA: Olhe a janela 'TM Backend'. Se ela fechou ou parou em erro, o Java caiu." -ForegroundColor White
    exit 1
}

Write-Host "`n[PASSO 2] Testando Saúde do Sistema (/health)..." -ForegroundColor White
try {
    $hRes = Invoke-WebRequest -Uri "http://localhost:8080/health" -Method Get -TimeoutSec 5 -Proxy $null
    Write-Host " [SUCESSO] Sistema respondeu /health!" -ForegroundColor Green
} catch {
    Write-Host " [AVISO] /health falhou. Mas vamos tentar a API..." -ForegroundColor Yellow
}

Write-Host "`n[PASSO 3] Testando requisicao HTTP em $url..." -ForegroundColor White

try {
    # Usando Proxy $null para evitar interferencia de proxies corporativos
    $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 10 -UseBasicParsing -Proxy $null
    Write-Host " [SUCESSO] API respondeu com Status $($response.StatusCode)" -ForegroundColor Green
    $content = $response.Content
    if ($content.Length -gt 50) { $content = $content.Substring(0, 50) + "..." }
    Write-Host " Resposta: $content" -ForegroundColor Gray
    exit 0
} catch {
    if ($_.Exception.Response) {
        $status = [int]$_.Exception.Response.StatusCode
        Write-Host " [ERRO HTTP $status] O servidor respondeu, mas deu erro." -ForegroundColor Red
        
        if ($status -eq 404) {
             Write-Host " [DIAGNOSTICO] Testando Swagger (http://localhost:8080/swagger-ui/index.html)..." -ForegroundColor Cyan
             try {
                 $swag = Invoke-WebRequest -Uri "http://localhost:8080/swagger-ui/index.html" -Method Get -TimeoutSec 5 -Proxy $null
                 Write-Host " [ALERTA] Swagger está ALIVE! O problema é apenas no roteamento do /api." -ForegroundColor Yellow
             } catch {
                 Write-Host " [ERRO] Swagger também deu 404. O app não mapeou nada." -ForegroundColor Red
             }
        }
        Write-Host " DICA: Isso pode ser erro no Banco de Dados ou na logica Java." -ForegroundColor White
    } else {
        Write-Host " [ERRO DE REDE] Nao consegui completar a chamada HTTP." -ForegroundColor Red
        Write-Host " Detalhe: $($_.Exception.Message)" -ForegroundColor DarkGray
        Write-Host " DICA: Verifique se algum Firewall ou Antivirus esta bloqueando a porta 8080." -ForegroundColor Cyan
    }
    exit 1
}
