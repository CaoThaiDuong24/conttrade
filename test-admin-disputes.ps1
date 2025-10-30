# Test admin disputes endpoint

Write-Host "=== TEST ADMIN DISPUTES ENDPOINT ===" -ForegroundColor Cyan

# Test 1: Check backend health
Write-Host "`n1. Checking backend health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3006/health" -Method Get
    Write-Host "✅ Backend is running" -ForegroundColor Green
    Write-Host $health | ConvertTo-Json
} catch {
    Write-Host "❌ Backend is not running on port 3006" -ForegroundColor Red
    exit 1
}

# Test 2: Login as admin to get real token
Write-Host "`n2. Logging in as admin..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "admin@conttrade.com"
        password = "Admin@123456"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3006/api/v1/auth/login" `
        -Method Post `
        -Body $loginBody `
        -ContentType "application/json"
    
    if ($loginResponse.success) {
        Write-Host "✅ Login successful" -ForegroundColor Green
        $token = $loginResponse.data.token
        Write-Host "Token: $($token.Substring(0, 30))..." -ForegroundColor Gray
    } else {
        Write-Host "❌ Login failed" -ForegroundColor Red
        Write-Host $loginResponse | ConvertTo-Json
        exit 1
    }
} catch {
    Write-Host "❌ Login error: $_" -ForegroundColor Red
    exit 1
}

# Test 3: Get admin disputes
Write-Host "`n3. Fetching disputes..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    $disputesResponse = Invoke-RestMethod -Uri "http://localhost:3006/api/v1/admin/disputes" `
        -Method Get `
        -Headers $headers
    
    if ($disputesResponse.success) {
        Write-Host "✅ Disputes fetched successfully" -ForegroundColor Green
        $disputeCount = $disputesResponse.data.disputes.Count
        Write-Host "Total disputes: $disputeCount" -ForegroundColor Cyan
        
        if ($disputeCount -eq 0) {
            Write-Host "⚠️  No disputes found in database" -ForegroundColor Yellow
            Write-Host "You need to create some test disputes first" -ForegroundColor Yellow
        } else {
            Write-Host "`nFirst 3 disputes:" -ForegroundColor Cyan
            $disputesResponse.data.disputes | Select-Object -First 3 | ForEach-Object {
                Write-Host "  - ID: $($_.id)" -ForegroundColor Gray
                Write-Host "    Order: $($_.orders.order_number)" -ForegroundColor Gray
                Write-Host "    Status: $($_.status)" -ForegroundColor Gray
                Write-Host "    Reason: $($_.reason)" -ForegroundColor Gray
                Write-Host ""
            }
        }
        
        Write-Host "`nPagination:" -ForegroundColor Cyan
        Write-Host "  Page: $($disputesResponse.data.pagination.page)"
        Write-Host "  Total: $($disputesResponse.data.pagination.total)"
        Write-Host "  Total Pages: $($disputesResponse.data.pagination.totalPages)"
    } else {
        Write-Host "❌ Failed to fetch disputes" -ForegroundColor Red
        Write-Host $disputesResponse | ConvertTo-Json
    }
} catch {
    Write-Host "❌ Error fetching disputes: $_" -ForegroundColor Red
    Write-Host $_.Exception.Response.StatusCode -ForegroundColor Red
}

Write-Host "`n=== TEST COMPLETED ===" -ForegroundColor Cyan
