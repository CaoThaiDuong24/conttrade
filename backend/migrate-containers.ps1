# Run listing_containers migration
$DB_NAME = "icontexchange"
$DB_USER = "postgres"
$DB_PASSWORD = "123456"
$MIGRATION_FILE = "prisma\migrations\20251107_ensure_listing_containers_complete\migration.sql"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "LISTING CONTAINERS MIGRATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $MIGRATION_FILE)) {
    Write-Host "ERROR: Migration file not found: $MIGRATION_FILE" -ForegroundColor Red
    exit 1
}

Write-Host "Database: $DB_NAME" -ForegroundColor White
Write-Host "Migration file: $MIGRATION_FILE" -ForegroundColor White
Write-Host ""

$confirmation = Read-Host "Continue with migration? (Y/N)"
if ($confirmation -ne "Y" -and $confirmation -ne "y") {
    Write-Host "Migration cancelled" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "Running migration..." -ForegroundColor Yellow
Write-Host ""

$env:PGPASSWORD = $DB_PASSWORD

try {
    psql -U $DB_USER -d $DB_NAME -f $MIGRATION_FILE
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "SUCCESS: Migration completed!" -ForegroundColor Green
        Write-Host ""
        
        Write-Host "Verifying table structure..." -ForegroundColor Yellow
        psql -U $DB_USER -d $DB_NAME -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'listing_containers' ORDER BY ordinal_position;"
        
        Write-Host ""
        Write-Host "Checking indexes..." -ForegroundColor Yellow
        psql -U $DB_USER -d $DB_NAME -c "SELECT indexname FROM pg_indexes WHERE tablename = 'listing_containers';"
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "MIGRATION SUCCESSFUL" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "ERROR: Migration failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}
