# Kill existing node processes
Write-Host "Stopping existing Node processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null
Start-Sleep -Seconds 2

# Start backend server
Write-Host "Starting backend server..." -ForegroundColor Cyan
cd "d:\DiskE\SUKIENLTA\LTA PROJECT NEW\Web\backend"
node --import tsx src/server.ts

# Keep script running
Read-Host "Press Enter to stop server"
