# Test admin access to RBAC menu
Write-Host "`n=== Testing Admin RBAC Access ===" -ForegroundColor Cyan

# Login as admin
Write-Host "`n1. Logging in as admin..." -ForegroundColor Yellow
$login = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/auth/login' `
    -Method POST `
    -Headers @{'Content-Type'='application/json'} `
    -Body '{"email":"admin@i-contexchange.vn","password":"admin123"}' `
    -UseBasicParsing

$loginData = $login.Content | ConvertFrom-Json
$token = $loginData.data.token
Write-Host "   ✅ Login successful" -ForegroundColor Green
Write-Host "   Token: $($token.Substring(0, 30))..." -ForegroundColor Gray

# Test RBAC routes
Write-Host "`n2. Testing RBAC routes..." -ForegroundColor Yellow

$routes = @(
    '/vi/admin',
    '/vi/admin/rbac',
    '/vi/admin/rbac/roles',
    '/vi/admin/rbac/permissions',
    '/vi/admin/rbac/matrix',
    '/vi/admin/rbac/users'
)

foreach ($route in $routes) {
    try {
        $resp = Invoke-WebRequest -Uri "http://127.0.0.1:3000$route" `
            -Method GET `
            -Headers @{ 'Cookie' = "accessToken=$token" } `
            -MaximumRedirection 0 `
            -UseBasicParsing `
            -ErrorAction Stop
        
        $status = $resp.StatusCode
        if ($status -eq 200) {
            Write-Host "   ✅ $route - OK (200)" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  $route - Status: $status" -ForegroundColor Yellow
        }
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        if ($status -eq 307 -or $status -eq 302) {
            Write-Host "   ❌ $route - REDIRECT ($status)" -ForegroundColor Red
        } elseif ($status -eq 404) {
            Write-Host "   ⚠️  $route - Not Found (404)" -ForegroundColor Yellow
        } else {
            Write-Host "   ❌ $route - Error ($status)" -ForegroundColor Red
        }
    }
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
