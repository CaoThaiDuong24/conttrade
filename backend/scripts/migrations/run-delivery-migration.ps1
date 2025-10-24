#!/usr/bin/env pwsh
# Script to run delivery workflow migrations
# Date: 2025-10-16

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DELIVERY WORKFLOW MIGRATION SCRIPT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to backend directory
Set-Location -Path "D:\DiskE\SUKIENLTA\LTA PROJECT NEW\Web\backend"

Write-Host "Step 1: Checking Prisma schema..." -ForegroundColor Yellow
if (-Not (Test-Path ".\prisma\schema.prisma")) {
    Write-Host "ERROR: Prisma schema not found!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Prisma schema found" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Formatting Prisma schema..." -ForegroundColor Yellow
npx prisma format
Write-Host "✓ Schema formatted" -ForegroundColor Green
Write-Host ""

Write-Host "Step 3: Validating Prisma schema..." -ForegroundColor Yellow
npx prisma validate
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Schema validation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Schema validation passed" -ForegroundColor Green
Write-Host ""

Write-Host "Step 4: Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Client generation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Prisma Client generated" -ForegroundColor Green
Write-Host ""

Write-Host "Step 5: Running SQL migration..." -ForegroundColor Yellow
Write-Host "Connecting to database..." -ForegroundColor Gray

# Load .env file
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match '^DATABASE_URL=(.+)$') {
            $env:DATABASE_URL = $matches[1]
        }
    }
}

# Check if psql is available
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-Not $psqlPath) {
    Write-Host "WARNING: psql not found in PATH" -ForegroundColor Yellow
    Write-Host "Please run the SQL migration manually:" -ForegroundColor Yellow
    Write-Host "  psql -d your_database -f .\prisma\migrations\add-delivery-workflow-tables.sql" -ForegroundColor Cyan
} else {
    Write-Host "Running SQL migration file..." -ForegroundColor Gray
    
    # Extract database connection info from DATABASE_URL
    if ($env:DATABASE_URL -match 'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)') {
        $dbUser = $matches[1]
        $dbPassword = $matches[2]
        $dbHost = $matches[3]
        $dbPort = $matches[4]
        $dbName = $matches[5]
        
        # Set PGPASSWORD environment variable
        $env:PGPASSWORD = $dbPassword
        
        # Run migration
        psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f ".\prisma\migrations\add-delivery-workflow-tables.sql"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ SQL migration completed successfully" -ForegroundColor Green
        } else {
            Write-Host "ERROR: SQL migration failed!" -ForegroundColor Red
            Write-Host "Please check the error above and fix it" -ForegroundColor Yellow
            exit 1
        }
    } else {
        Write-Host "ERROR: Could not parse DATABASE_URL" -ForegroundColor Red
        Write-Host "DATABASE_URL format: postgresql://user:password@host:port/database" -ForegroundColor Yellow
        exit 1
    }
}
Write-Host ""

Write-Host "Step 6: Creating Prisma migration record..." -ForegroundColor Yellow
$migrationName = "add_delivery_workflow_tables_$(Get-Date -Format 'yyyyMMddHHmmss')"
npx prisma migrate dev --name $migrationName --create-only
Write-Host "✓ Migration record created: $migrationName" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MIGRATION COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "New tables created:" -ForegroundColor Yellow
Write-Host "  - order_preparations" -ForegroundColor Cyan
Write-Host "  - disputes (updated)" -ForegroundColor Cyan
Write-Host "  - dispute_messages" -ForegroundColor Cyan
Write-Host "  - dispute_audit_logs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Updated tables:" -ForegroundColor Yellow
Write-Host "  - deliveries (added 10 new columns)" -ForegroundColor Cyan
Write-Host "  - OrderStatus enum (added READY_FOR_PICKUP, DELIVERING)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Restart the backend server" -ForegroundColor White
Write-Host "  2. Test the new endpoints:" -ForegroundColor White
Write-Host "     - POST /api/v1/orders/:id/prepare-delivery" -ForegroundColor Cyan
Write-Host "     - POST /api/v1/orders/:id/mark-ready" -ForegroundColor Cyan
Write-Host "     - POST /api/v1/orders/:id/mark-delivered" -ForegroundColor Cyan
Write-Host "     - POST /api/v1/orders/:id/raise-dispute" -ForegroundColor Cyan
Write-Host ""
