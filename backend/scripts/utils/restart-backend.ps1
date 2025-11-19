# PowerShell script to restart backend with new notification code

Write-Host "🔄 Restarting Backend with Notification Support" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# Step 1: Stop existing Node processes
Write-Host "1️⃣ Stopping existing Node.js processes..." -ForegroundColor Yellow
try {
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "   ✅ Stopped Node.js processes`n" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️ No Node.js processes found`n" -ForegroundColor Yellow
}

Start-Sleep -Seconds 2

# Step 2: Navigate to backend directory
Write-Host "2️⃣ Navigating to backend directory..." -ForegroundColor Yellow
Set-Location "d:\DiskE\SUKIENLTA\LTA PROJECT NEW\Web\backend"
Write-Host "   ✅ Current directory: $(Get-Location)`n" -ForegroundColor Green

# Step 3: Build backend
Write-Host "3️⃣ Building backend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Build successful`n" -ForegroundColor Green
} else {
    Write-Host "   ❌ Build failed! Exit code: $LASTEXITCODE`n" -ForegroundColor Red
    exit 1
}

# Step 4: Start backend in development mode
Write-Host "4️⃣ Starting backend server..." -ForegroundColor Yellow
Write-Host "   📝 Watch for these logs:" -ForegroundColor Cyan
Write-Host "      - 'Server listening at http://0.0.0.0:3006'" -ForegroundColor Gray
Write-Host "      - '✅ Sent RFQ notification to seller: xxx'" -ForegroundColor Gray
Write-Host "      - '✅ Sent Quote notification to buyer: xxx'`n" -ForegroundColor Gray

Write-Host "🚀 Starting server..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Yellow

npm run dev
