$ErrorActionPreference = "Stop"

Write-Host "==============================" -ForegroundColor Cyan
Write-Host "   TESTE DE CONEXAO - API     " -ForegroundColor Cyan
Write-Host "=============================="
Write-Host ""

$url = "http://localhost:8080/api/tasks"

try {
    Write-Host "[TESTE] Conectando ao Backend ($url)..." -NoNewline
    $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 5 -UseBasicParsing
    
    if ($response.StatusCode -eq 200) {
        Write-Host " [SUCESSO]" -ForegroundColor Green
        Write-Host "Codigo HTTP: 200 OK" -ForegroundColor Green
        Write-Host "Resposta (Resumo): $($response.Content.Substring(0, [math]::Min(50, $response.Content.Length))...)" -ForegroundColor Gray
        exit 0
    } else {
        Write-Host " [FALHA]" -ForegroundColor Red
        Write-Host "Codigo HTTP: $($response.StatusCode)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host " [ERRO FATAL]" -ForegroundColor Red
    Write-Host "O Backend nao esta respondendo." -ForegroundColor White
    Write-Host "Detalhe: $($_.Exception.Message)" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "FIX: Rode a Opcao 2 do start.bat e aguarde a janela preta inicializar." -ForegroundColor Yellow
    exit 1
}
