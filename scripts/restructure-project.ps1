# Script PowerShell để tái cấu trúc project
# Chuyển từ: Web/{app,components,lib,...,backend}
# Sang: {frontend,backend}

Write-Host "🔄 Starting project restructure..." -ForegroundColor Blue

# Backup confirmation
Write-Host "⚠️  WARNING: This will restructure your project!" -ForegroundColor Yellow
Write-Host "Make sure you have committed your changes to git." -ForegroundColor Yellow
$confirmation = Read-Host "Continue? (yes/no)"
if ($confirmation -ne "yes") {
    Write-Host "Restructure cancelled." -ForegroundColor Red
    exit
}

# Create frontend directory
Write-Host "Creating frontend directory..." -ForegroundColor Blue
New-Item -ItemType Directory -Force -Path "frontend" | Out-Null

# Move frontend files to frontend/
Write-Host "Moving frontend files..." -ForegroundColor Blue

# Core Next.js directories
$frontendDirs = @("app", "components", "hooks", "lib", "types", "messages", "public", "styles", "i18n")
foreach ($dir in $frontendDirs) {
    if (Test-Path $dir) {
        Write-Host "Moving $dir..." -ForegroundColor Gray
        Move-Item -Path $dir -Destination "frontend\" -Force -ErrorAction SilentlyContinue
    }
}

# Config files to copy
$configFiles = @(
    "package.json",
    "package-lock.json",
    "pnpm-lock.yaml",
    "next.config.mjs",
    "tsconfig.json",
    "postcss.config.mjs",
    "components.json",
    "middleware.ts",
    "next-env.d.ts"
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Write-Host "Copying $file..." -ForegroundColor Gray
        Copy-Item -Path $file -Destination "frontend\" -Force -ErrorAction SilentlyContinue
    }
}

# Environment files
$envFiles = @(".env.example", ".env.production.example", ".env", ".env.local")
foreach ($file in $envFiles) {
    if (Test-Path $file) {
        Write-Host "Copying $file..." -ForegroundColor Gray
        Copy-Item -Path $file -Destination "frontend\" -Force -ErrorAction SilentlyContinue
    }
}

# Update frontend package.json name
$frontendPackageJson = "frontend\package.json"
if (Test-Path $frontendPackageJson) {
    $content = Get-Content $frontendPackageJson -Raw
    $content = $content -replace '"name":\s*"[^"]*"', '"name": "lta-frontend"'
    Set-Content -Path $frontendPackageJson -Value $content
    Write-Host "Updated frontend package.json name" -ForegroundColor Green
}

# Update backend package.json name
$backendPackageJson = "backend\package.json"
if (Test-Path $backendPackageJson) {
    $content = Get-Content $backendPackageJson -Raw
    $content = $content -replace '"name":\s*"[^"]*"', '"name": "lta-backend"'
    Set-Content -Path $backendPackageJson -Value $content
    Write-Host "Updated backend package.json name" -ForegroundColor Green
}

# Create scripts directory if not exists
New-Item -ItemType Directory -Force -Path "scripts\deployment" | Out-Null

Write-Host "`n✅ Restructure completed!" -ForegroundColor Green
Write-Host "`nNew structure:" -ForegroundColor Cyan
Write-Host "  frontend/  - Next.js app"
Write-Host "  backend/   - Fastify API"
Write-Host "  scripts/   - Deployment scripts"
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. cd frontend; npm install"
Write-Host "2. cd backend; npm install"
Write-Host "3. Update import paths if needed"
Write-Host "4. Test both apps:"
Write-Host "   - Frontend: cd frontend; npm run dev"
Write-Host "   - Backend: cd backend; npm run dev"
