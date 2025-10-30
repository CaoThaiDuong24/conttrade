# Quick test admin disputes API

Write-Host "Testing Admin Disputes API..." -ForegroundColor Cyan

# Step 1: Login
Write-Host "`n1. Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@conttrade.com"
    password = "Admin@123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3006/api/v1/auth/login" `
        -Method Post `
        -Body $loginBody `
        -ContentType "application/json" `
        -UseBasicParsing

    $loginData = $loginResponse.Content | ConvertFrom-Json
    
    if ($loginData.success) {
        $token = $loginData.data.token
        Write-Host "   ✅ Login OK - Token: $($token.Substring(0, 30))..." -ForegroundColor Green
    } else {
        Write-Host "   ❌ Login failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Get disputes
Write-Host "`n2. Getting disputes..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }

    $disputesResponse = Invoke-WebRequest -Uri "http://localhost:3006/api/v1/admin/disputes" `
        -Method Get `
        -Headers $headers `
        -UseBasicParsing

    $disputesData = $disputesResponse.Content | ConvertFrom-Json
    
    if ($disputesData.success) {
        Write-Host "   ✅ Success!" -ForegroundColor Green
        Write-Host "   📊 Total disputes: $($disputesData.data.disputes.Count)" -ForegroundColor Cyan
        Write-Host "   📄 Page: $($disputesData.data.pagination.page)/$($disputesData.data.pagination.totalPages)" -ForegroundColor Gray
        
        if ($disputesData.data.disputes.Count -gt 0) {
            Write-Host "`n   First dispute:" -ForegroundColor Cyan
            $first = $disputesData.data.disputes[0]
            Write-Host "   - Reason: $($first.reason)" -ForegroundColor Gray
            Write-Host "   - Status: $($first.status)" -ForegroundColor Gray
            Write-Host "   - Order: $($first.orders.order_number)" -ForegroundColor Gray
        } else {
            Write-Host "   ⚠️  No disputes in database" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ❌ Failed: $($disputesData.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Response: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`nDone!" -ForegroundColor Green
