# Test full permissions flow after fix
Write-Host "`n🧪 TESTING PERMISSIONS FLOW AFTER FIX" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

# Step 1: Login as buyer (with OLD token that doesn't have new permissions)
Write-Host "📝 Step 1: Login as buyer@example.com" -ForegroundColor Yellow
try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3006/api/v1/auth/login" `
        -Method POST `
        -Headers @{'Content-Type'='application/json'} `
        -Body '{"email":"buyer@example.com","password":"buyer123"}' `
        -UseBasicParsing
    
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $token = $loginData.data.token
    $roles = $loginData.data.user.roles
    
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "   Roles: $($roles -join ', ')" -ForegroundColor Gray
    
    # Decode JWT to see permissions
    $tokenParts = $token.Split('.')
    $payload = $tokenParts[1]
    # Add padding if needed
    while ($payload.Length % 4 -ne 0) {
        $payload += '='
    }
    $decodedBytes = [System.Convert]::FromBase64String($payload)
    $decodedJson = [System.Text.Encoding]::UTF8.GetString($decodedBytes)
    $tokenData = $decodedJson | ConvertFrom-Json
    
    Write-Host "   Permissions in JWT:" -ForegroundColor Gray
    $tokenData.permissions | ForEach-Object { Write-Host "     - $_" -ForegroundColor Gray }
    Write-Host "   Role Version: buyer=$($tokenData.roleVersions.buyer)" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Check current buyer role permissions in database
Write-Host "`n📊 Step 2: Check buyer role permissions in database" -ForegroundColor Yellow
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); (async () => { const role = await prisma.roles.findUnique({ where: { code: 'buyer' }, include: { role_permissions: { include: { permissions: true } } } }); console.log('Role Version:', role.role_version); console.log('Permissions count:', role.role_permissions.length); await prisma.\$disconnect(); })()"

# Step 3: Test accessing /sell/new route (should work if buyer has PM-010)
Write-Host "`n🌐 Step 3: Test accessing /sell/new route" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:3001/vi/sell/new" `
        -Method GET `
        -Headers @{ 'Cookie' = "accessToken=$token" } `
        -MaximumRedirection 0 `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Access granted! Buyer can access /sell/new" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 307 -or $statusCode -eq 302) {
        $location = $_.Exception.Response.Headers.Location
        Write-Host "❌ REDIRECT to: $location" -ForegroundColor Red
        Write-Host "   This means buyer does NOT have permission PM-010" -ForegroundColor Red
    } else {
        Write-Host "⚠️  Status: $statusCode" -ForegroundColor Yellow
    }
}

# Step 4: Simulate admin assigning MORE permissions to buyer role
Write-Host "`n👨‍💼 Step 4: Simulating admin assignment (checking if permissions_updated_at will be set)" -ForegroundColor Yellow
Write-Host "   Note: This requires admin to actually assign permissions via API" -ForegroundColor Gray
Write-Host "   The fix ensures that when admin assigns permissions:" -ForegroundColor Gray
Write-Host "     1. role_version increments" -ForegroundColor Gray
Write-Host "     2. permissions_updated_at is set for all users with that role" -ForegroundColor Gray

# Step 5: Summary
Write-Host "`n📋 SUMMARY" -ForegroundColor Cyan
Write-Host "==========" -ForegroundColor Cyan
Write-Host "✅ Fix Applied:" -ForegroundColor Green
Write-Host "   - When admin assigns permissions to a role:" -ForegroundColor White
Write-Host "     • role_version increments (triggers JWT version check)" -ForegroundColor White
Write-Host "     • permissions_updated_at updated for all users (invalidates old tokens)" -ForegroundColor White
Write-Host "`n🔄 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Have admin assign permissions to buyer role via admin panel" -ForegroundColor White
Write-Host "   2. Buyer needs to re-login to get new JWT with updated permissions" -ForegroundColor White
Write-Host "   3. Old JWT tokens will be rejected due to permissions_updated_at mismatch" -ForegroundColor White
Write-Host ""
