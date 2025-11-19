# PowerShell script to run backend server with auto-restart
$ErrorActionPreference = "Continue"
$BackendPath = "D:\DiskE\SUKIENLTA\LTA PROJECT NEW\Web\backend"
$Port = 3006

Write-Host "Starting i-ContExchange Backend Server..." -ForegroundColor Green
Set-Location $BackendPath

$env:PORT = $Port
$env:NODE_ENV = "development"

Write-Host "Port: $Port" -ForegroundColor Cyan
Write-Host "Environment: $($env:NODE_ENV)" -ForegroundColor Cyan
Write-Host "Directory: $PWD" -ForegroundColor Cyan

while ($true) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] Starting backend server on port $Port..." -ForegroundColor Yellow
    
    try {
        $process = Start-Process -FilePath "node" -ArgumentList "--import", "tsx", "src/server.ts" -NoNewWindow -PassThru -Wait
        
        if ($process.ExitCode -ne 0) {
            Write-Host "[$timestamp] Server crashed with exit code $($process.ExitCode)" -ForegroundColor Red
            Write-Host "Restarting in 5 seconds..." -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        } else {
            Write-Host "[$timestamp] Server stopped normally" -ForegroundColor Green
            break
        }
    } catch {
        Write-Host "[$timestamp] Error starting server: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Retrying in 5 seconds..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
}

Read-Host "Press Enter to exit"