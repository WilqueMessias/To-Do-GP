$ErrorActionPreference = "Stop"

Write-Host "==============================" -ForegroundColor Cyan
Write-Host "   TESTE DE CONEXAO - API     " -ForegroundColor Cyan
Write-Host "=============================="
Write-Host ""

$url = "http://localhost:8080/api/tasks"

$maxRetries = 20
$retryDelay = 2

Write-Host "[TESTE] Conectando ao Backend ($url)..." -NoNewline

for ($i = 1; $i -le $maxRetries; $i++) {
    try {
        $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Host " [SUCESSO]" -ForegroundColor Green
            Write-Host "Codigo HTTP: 200 OK" -ForegroundColor Green
            $contentPreview = $response.Content
            if ($contentPreview.Length -gt 50) { $contentPreview = $contentPreview.Substring(0, 50) + "..." }
            Write-Host "Resposta: $contentPreview" -ForegroundColor Gray
            exit 0
        }
    } catch {
        # Only print a dot to indicate waiting
        Write-Host "." -NoNewline -ForegroundColor Yellow
        Start-Sleep -Seconds $retryDelay
    }
}

Write-Host " [FALHA]" -ForegroundColor Red
Write-Host "O Backend nao respondeu apos $($maxRetries * $retryDelay) segundos." -ForegroundColor Red
Write-Host "FIX: Verifique se a janela do backend apresentou algum erro." -ForegroundColor Output
exit 1
