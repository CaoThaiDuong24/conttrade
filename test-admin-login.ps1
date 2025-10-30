# Test admin login và truy cập RBAC endpoint
Write-Host "`n🧪 TESTING ADMIN LOGIN AND RBAC ACCESS" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

# Step 1: Login as admin
Write-Host "📝 Step 1: Login as admin@example.com" -ForegroundColor Yellow
try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3006/api/v1/auth/login" `
        -Method POST `
        -Headers @{'Content-Type'='application/json'} `
        -Body '{"email":"admin@example.com","password":"admin123"}' `
        -UseBasicParsing
    
    $loginData = $loginResponse.Content | ConvertFrom-Json
    
    if ($loginData.success) {
        $token = $loginData.data.token
        Write-Host "✅ Login successful" -ForegroundColor Green
        Write-Host "   Email: $($loginData.data.user.email)" -ForegroundColor Gray
        Write-Host "   Roles: $($loginData.data.user.roles -join ', ')" -ForegroundColor Gray
        
        # Decode JWT to see details
        $tokenParts = $token.Split('.')
        $payload = $tokenParts[1]
        while ($payload.Length % 4 -ne 0) { $payload += '=' }
        $decodedBytes = [System.Convert]::FromBase64String($payload)
        $decodedJson = [System.Text.Encoding]::UTF8.GetString($decodedBytes)
        $tokenData = $decodedJson | ConvertFrom-Json
        
        Write-Host "   Token issued at: $(Get-Date -Date ((Get-Date '1970-01-01').AddSeconds($tokenData.iat)))" -ForegroundColor Gray
        Write-Host "   Token expires at: $(Get-Date -Date ((Get-Date '1970-01-01').AddSeconds($tokenData.exp)))" -ForegroundColor Gray
    } else {
        Write-Host "❌ Login failed: $($loginData.message)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Login request failed: $_" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Step 2: Test RBAC roles endpoint
Write-Host "`n🔐 Step 2: Test /api/v1/admin/rbac/roles with admin token" -ForegroundColor Yellow
try {
    $headers = @{
        'Authorization' = "Bearer $token"
        'Content-Type' = 'application/json'
    }
    
    $rolesResponse = Invoke-WebRequest -Uri "http://localhost:3006/api/v1/admin/rbac/roles" `
        -Method GET `
        -Headers $headers `
        -UseBasicParsing
    
    if ($rolesResponse.StatusCode -eq 200) {
        $rolesData = $rolesResponse.Content | ConvertFrom-Json
        Write-Host "✅ Successfully accessed RBAC roles" -ForegroundColor Green
        Write-Host "   Found $($rolesData.data.Count) roles" -ForegroundColor Gray
        
        # Show buyer role info
        $buyerRole = $rolesData.data | Where-Object { $_.code -eq 'buyer' }
        if ($buyerRole) {
            Write-Host "`n   Buyer Role:" -ForegroundColor Cyan
            Write-Host "     - ID: $($buyerRole.id)" -ForegroundColor Gray
            Write-Host "     - Name: $($buyerRole.name)" -ForegroundColor Gray
            Write-Host "     - Permissions: $($buyerRole.permissionCount)" -ForegroundColor Gray
            Write-Host "     - Users: $($buyerRole.userCount)" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠️  Status: $($rolesResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ RBAC request failed" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   Status Code: $statusCode" -ForegroundColor Red
        
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Response: $responseBody" -ForegroundColor Red
    } else {
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    exit 1
}

Write-Host "`n📋 SUMMARY" -ForegroundColor Cyan
Write-Host "==========" -ForegroundColor Cyan
Write-Host "✅ Admin can login successfully" -ForegroundColor Green
Write-Host "✅ Admin can access RBAC endpoints" -ForegroundColor Green
Write-Host "`n💡 If your frontend is getting 401 errors:" -ForegroundColor Yellow
Write-Host "   1. Make sure you're logged in as admin" -ForegroundColor White
Write-Host "   2. Check that token is being sent in Authorization header" -ForegroundColor White
Write-Host "   3. Clear browser cookies and login again" -ForegroundColor White
Write-Host ""
