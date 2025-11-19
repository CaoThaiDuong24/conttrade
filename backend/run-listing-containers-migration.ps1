# Script to run listing_containers migration
# Ensures the table has all required columns and constraints

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "LISTING CONTAINERS MIGRATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "icontexchange"
$DB_USER = "postgres"
$DB_PASSWORD = "123456"

$MIGRATION_FILE = "prisma\migrations\20251107_ensure_listing_containers_complete\migration.sql"

Write-Host "📋 Migration Details:" -ForegroundColor Yellow
Write-Host "   Database: $DB_NAME" -ForegroundColor White
Write-Host "   Host: ${DB_HOST}:${DB_PORT}" -ForegroundColor White
Write-Host "   User: $DB_USER" -ForegroundColor White
Write-Host "   File: $MIGRATION_FILE" -ForegroundColor White
Write-Host ""

# Check if migration file exists
if (-not (Test-Path $MIGRATION_FILE)) {
    Write-Host "❌ Migration file not found: $MIGRATION_FILE" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Migration file found" -ForegroundColor Green
Write-Host ""

# Ask for confirmation
Write-Host "⚠️  This will:" -ForegroundColor Yellow
Write-Host "   1. Create/update listing_containers table" -ForegroundColor White
Write-Host "   2. Add missing columns" -ForegroundColor White
Write-Host "   3. Create ContainerInventoryStatus ENUM" -ForegroundColor White
Write-Host "   4. Add foreign keys and indexes" -ForegroundColor White
Write-Host "   5. Add unique constraint on container_iso_code" -ForegroundColor White
Write-Host ""

$confirmation = Read-Host "Continue? (Y/N)"
if ($confirmation -ne "Y" -and $confirmation -ne "y") {
    Write-Host "❌ Migration cancelled" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🚀 Starting migration..." -ForegroundColor Cyan
Write-Host ""

# Set password environment variable
$env:PGPASSWORD = $DB_PASSWORD

try {
    # Run migration
    Write-Host "📝 Executing SQL migration..." -ForegroundColor Yellow
    
    $result = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $MIGRATION_FILE 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
        Write-Host ""
        
        # Verify table structure
        Write-Host "🔍 Verifying table structure..." -ForegroundColor Yellow
        Write-Host ""
        
        $verifyQuery = "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'listing_containers' ORDER BY ordinal_position;"
        
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $verifyQuery
        
        Write-Host ""
        Write-Host "✅ Table verification complete" -ForegroundColor Green
        Write-Host ""
        
        # Show indexes
        Write-Host "📊 Checking indexes..." -ForegroundColor Yellow
        Write-Host ""
        
        $indexQuery = "SELECT indexname FROM pg_indexes WHERE tablename = 'listing_containers';"
        
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $indexQuery
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "✅ MIGRATION SUCCESSFUL" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Test creating a listing with container IDs" -ForegroundColor White
        Write-Host "2. Verify containers appear in listing detail page" -ForegroundColor White
        Write-Host "3. Check API endpoint: GET /api/v1/listings/:id/containers" -ForegroundColor White
        Write-Host ""
        
    } else {
        Write-Host ""
        Write-Host "❌ Migration failed!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Error output:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        Write-Host ""
        exit 1
    }
    
} catch {
    Write-Host ""
    Write-Host "❌ Error running migration:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    exit 1
} finally {
    # Clear password environment variable
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}
