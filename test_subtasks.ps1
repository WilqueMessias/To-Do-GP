# Test script for Subtask API

$baseUrl = "http://localhost:8080/tasks"

Write-Host "1. Creating task with subtasks..." -ForegroundColor Cyan
$payload = @{
    title = "Backend Integration Test"
    description = "Testing subtask persistence"
    status = "TODO"
    priority = "HIGH"
    dueDate = (Get-Date).AddDays(1).ToString("yyyy-MM-ddTHH:mm:ssZ")
    subtasks = @(
        @{ title = "Subtask 1"; completed = $false },
        @{ title = "Subtask 2"; completed = $true }
    )
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri $baseUrl -Method Post -Body $payload -ContentType "application/json"
$taskId = $response.id
Write-Host "Created Task ID: $taskId" -ForegroundColor Green
Write-Host "Subtasks count: $($response.subtasks.Count)"

Write-Host "`n2. Verifying subtasks in GET response..." -ForegroundColor Cyan
$getTask = Invoke-RestMethod -Uri "$baseUrl/$taskId" -Method Get
if ($getTask.subtasks.Count -eq 2 -and $getTask.subtasks[1].completed -eq $true) {
    Write-Host "Success: Subtasks correctly persisted and retrieved." -ForegroundColor Green
} else {
    Write-Host "Failure: Subtasks mapping issue." -ForegroundColor Red
}

Write-Host "`n3. Updating subtasks (toggling Subtask 1)..." -ForegroundColor Cyan
$getTask.subtasks[0].completed = $true
$updatePayload = $getTask | ConvertTo-Json -Depth 5
$updatedTask = Invoke-RestMethod -Uri "$baseUrl/$taskId" -Method Put -Body $updatePayload -ContentType "application/json"

if ($updatedTask.subtasks[0].completed -eq $true) {
    Write-Host "Success: Subtask updated successfully." -ForegroundColor Green
} else {
    Write-Host "Failure: Subtask update issue." -ForegroundColor Red
}

Write-Host "`n4. Cleaning up (deleting test task)..." -ForegroundColor Cyan
Invoke-RestMethod -Uri "$baseUrl/$taskId" -Method Delete
Write-Host "Test task deleted." -ForegroundColor Green
