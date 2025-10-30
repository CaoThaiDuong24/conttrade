# Test Permission Redirect Fix
# This script tests if permission denied redirects work correctly with toast notifications

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Testing Permission Redirect Fix" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Buyer accessing seller page
Write-Host "Test 1: Buyer trying to access /sell/new" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow

try {
    # Login as buyer
    Write-Host "1. Logging in as buyer@example.com..." -ForegroundColor Gray
    $loginResp = Invoke-WebRequest `
        -Uri 'http://localhost:3006/api/v1/auth/login' `
        -Method POST `
        -Headers @{'Content-Type'='application/json'} `
        -Body '{"email":"buyer@example.com","password":"buyer123"}' `
        -UseBasicParsing
    
    $loginData = $loginResp.Content | ConvertFrom-Json
    $token = $loginData.data.token
    Write-Host "   ✓ Login successful" -ForegroundColor Green
    Write-Host "   Token: $($token.Substring(0, 30))..." -ForegroundColor Gray
    
    # Try to access seller page
    Write-Host ""
    Write-Host "2. Accessing /vi/sell/new..." -ForegroundColor Gray
    
    try {
        $resp = Invoke-WebRequest `
            -Uri 'http://127.0.0.1:3001/vi/sell/new' `
            -Method GET `
            -Headers @{'Cookie'="accessToken=$token"} `
            -MaximumRedirection 0 `
            -UseBasicParsing `
            -ErrorAction Stop
        
        Write-Host "   ✗ FAILED: No redirect occurred (Status: $($resp.StatusCode))" -ForegroundColor Red
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.Value__
        $location = $_.Exception.Response.Headers.Location
        
        if ($statusCode -eq 307 -or $statusCode -eq 302) {
            Write-Host "   ✓ Redirected (Status: $statusCode)" -ForegroundColor Green
            Write-Host "   Location: $location" -ForegroundColor Gray
            
            if ($location -like '*dashboard*') {
                Write-Host "   ✓ Correctly redirected to dashboard" -ForegroundColor Green
                
                if ($location -like '*error=permission_denied*') {
                    Write-Host "   ✓ Error parameter present" -ForegroundColor Green
                } else {
                    Write-Host "   ✗ Missing error parameter" -ForegroundColor Red
                }
                
                if ($location -like '*required=PM-010*') {
                    Write-Host "   ✓ Required permission parameter present (PM-010)" -ForegroundColor Green
                } else {
                    Write-Host "   ✗ Missing required permission parameter" -ForegroundColor Red
                }
                
                if ($location -like '*path=*') {
                    Write-Host "   ✓ Path parameter present" -ForegroundColor Green
                } else {
                    Write-Host "   ✗ Missing path parameter" -ForegroundColor Red
                }
            } else {
                Write-Host "   ✗ Redirected to wrong location" -ForegroundColor Red
            }
        } else {
            Write-Host "   ✗ Unexpected error: $_" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "   ✗ Test failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host ""

# Test 2: Buyer accessing admin page
Write-Host "Test 2: Buyer trying to access /admin/users" -ForegroundColor Yellow
Write-Host "--------------------------------------------" -ForegroundColor Yellow

try {
    # Reuse buyer token from Test 1
    Write-Host "1. Using buyer token from previous test..." -ForegroundColor Gray
    
    # Try to access admin page
    Write-Host ""
    Write-Host "2. Accessing /vi/admin/users..." -ForegroundColor Gray
    
    try {
        $resp = Invoke-WebRequest `
            -Uri 'http://127.0.0.1:3001/vi/admin/users' `
            -Method GET `
            -Headers @{'Cookie'="accessToken=$token"} `
            -MaximumRedirection 0 `
            -UseBasicParsing `
            -ErrorAction Stop
        
        Write-Host "   ✗ FAILED: No redirect occurred (Status: $($resp.StatusCode))" -ForegroundColor Red
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.Value__
        $location = $_.Exception.Response.Headers.Location
        
        if ($statusCode -eq 307 -or $statusCode -eq 302) {
            Write-Host "   ✓ Redirected (Status: $statusCode)" -ForegroundColor Green
            Write-Host "   Location: $location" -ForegroundColor Gray
            
            if ($location -like '*dashboard*' -and $location -like '*error=permission_denied*') {
                Write-Host "   ✓ Correctly redirected to dashboard with error" -ForegroundColor Green
                
                if ($location -like '*required=admin.users*' -or $location -like '*required=admin.access*') {
                    Write-Host "   ✓ Admin permission required" -ForegroundColor Green
                } else {
                    Write-Host "   ⚠ Required permission: $(([uri]$location).Query)" -ForegroundColor Yellow
                }
            }
        }
    }
} catch {
    Write-Host "   ✗ Test failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host ""

# Test 3: Seller accessing seller page (should work)
Write-Host "Test 3: Seller accessing /sell/new (should work)" -ForegroundColor Yellow
Write-Host "-------------------------------------------------" -ForegroundColor Yellow

try {
    # Login as seller
    Write-Host "1. Logging in as seller@example.com..." -ForegroundColor Gray
    $loginResp = Invoke-WebRequest `
        -Uri 'http://localhost:3006/api/v1/auth/login' `
        -Method POST `
        -Headers @{'Content-Type'='application/json'} `
        -Body '{"email":"seller@example.com","password":"seller123"}' `
        -UseBasicParsing
    
    $loginData = $loginResp.Content | ConvertFrom-Json
    $token = $loginData.data.token
    Write-Host "   ✓ Login successful" -ForegroundColor Green
    
    # Try to access seller page
    Write-Host ""
    Write-Host "2. Accessing /vi/sell/new..." -ForegroundColor Gray
    
    try {
        $resp = Invoke-WebRequest `
            -Uri 'http://127.0.0.1:3001/vi/sell/new' `
            -Method GET `
            -Headers @{'Cookie'="accessToken=$token"} `
            -MaximumRedirection 5 `
            -UseBasicParsing `
            -ErrorAction Stop
        
        if ($resp.StatusCode -eq 200) {
            Write-Host "   ✓ Access granted (Status: 200)" -ForegroundColor Green
            
            # Check if it's the actual page (not a redirect)
            if ($resp.Content -like '*Tạo tin đăng*' -or $resp.Content -like '*New Listing*') {
                Write-Host "   ✓ Page loaded correctly" -ForegroundColor Green
            } else {
                Write-Host "   ⚠ Page loaded but content unexpected" -ForegroundColor Yellow
            }
        } else {
            Write-Host "   ⚠ Unexpected status: $($resp.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   ✗ Access denied or error: $_" -ForegroundColor Red
    }
} catch {
    Write-Host "   ✗ Test failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ If all tests passed, the fix is working correctly!" -ForegroundColor Green
Write-Host "✓ Check browser console for middleware logs" -ForegroundColor Yellow
Write-Host "✓ Check dashboard for toast notifications" -ForegroundColor Yellow
Write-Host ""
Write-Host "Manual Testing:" -ForegroundColor Cyan
Write-Host "1. Open browser: http://localhost:3001/vi/auth/login" -ForegroundColor Gray
Write-Host "2. Login as buyer@example.com / buyer123" -ForegroundColor Gray
Write-Host "3. Try to access: http://localhost:3001/vi/sell/new" -ForegroundColor Gray
Write-Host "4. You should see a toast notification with permission error" -ForegroundColor Gray
Write-Host ""
