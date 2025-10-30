# Script test permissions cho TẤT CẢ các roles
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST PERMISSIONS - ALL ROLES" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$API_URL = "http://localhost:3006/api/v1"
$FRONTEND_URL = "http://localhost:3003"

# Danh sách tất cả tài khoản test
$accounts = @(
    @{ Name = "BUYER"; Email = "buyer@example.com"; Password = "buyer123" },
    @{ Name = "SELLER"; Email = "seller@example.com"; Password = "seller123" },
    @{ Name = "ADMIN"; Email = "admin@example.com"; Password = "admin123" },
    @{ Name = "INSPECTOR"; Email = "inspector@example.com"; Password = "inspector123" },
    @{ Name = "DEPOT STAFF"; Email = "depot-staff@example.com"; Password = "depot123" },
    @{ Name = "DEPOT MANAGER"; Email = "depot-manager@example.com"; Password = "depot123" },
    @{ Name = "FINANCE"; Email = "finance@example.com"; Password = "finance123" },
    @{ Name = "CONFIG MANAGER"; Email = "config@example.com"; Password = "config123" },
    @{ Name = "PRICE MANAGER"; Email = "price@example.com"; Password = "price123" },
    @{ Name = "CUSTOMER SUPPORT"; Email = "support@example.com"; Password = "support123" }
)

# Danh sách routes cần test
$routes = @(
    @{ Path = "/vi/dashboard"; Name = "Dashboard" },
    @{ Path = "/vi/listings"; Name = "Public Listings" },
    @{ Path = "/vi/rfq"; Name = "RFQ List" },
    @{ Path = "/vi/rfq/create"; Name = "Create RFQ" },
    @{ Path = "/vi/orders"; Name = "Orders" },
    @{ Path = "/vi/payments"; Name = "Payments" },
    @{ Path = "/vi/reviews"; Name = "Reviews" },
    @{ Path = "/vi/disputes"; Name = "Disputes" },
    @{ Path = "/vi/sell/new"; Name = "Create Listing" },
    @{ Path = "/vi/sell/my-listings"; Name = "My Listings" },
    @{ Path = "/vi/quotes/create"; Name = "Create Quote" },
    @{ Path = "/vi/inspection/new"; Name = "Schedule Inspection" },
    @{ Path = "/vi/delivery"; Name = "Delivery Tracking" },
    @{ Path = "/vi/account/profile"; Name = "Account Profile" },
    @{ Path = "/vi/depot"; Name = "Depot Dashboard" },
    @{ Path = "/vi/billing"; Name = "Billing" },
    @{ Path = "/vi/admin"; Name = "Admin Panel" }
)

$totalTests = 0
$failedTests = 0
$results = @()

foreach ($account in $accounts) {
    Write-Host "`n┌─────────────────────────────────────────" -ForegroundColor Yellow
    Write-Host "│ Testing: $($account.Name)" -ForegroundColor Yellow
    Write-Host "└─────────────────────────────────────────" -ForegroundColor Yellow
    
    # Login
    try {
        $loginBody = @{
            email = $account.Email
            password = $account.Password
        } | ConvertTo-Json
        
        $loginResp = Invoke-WebRequest -Uri "$API_URL/auth/login" `
            -Method POST `
            -Headers @{'Content-Type'='application/json'} `
            -Body $loginBody `
            -UseBasicParsing
        
        $loginData = $loginResp.Content | ConvertFrom-Json
        $token = $loginData.data.token
        
        # Decode JWT để xem permissions
        $parts = $token.Split('.')
        $payloadJson = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($parts[1] + '=='))
        $payload = $payloadJson | ConvertFrom-Json
        
        Write-Host "  ✓ Login success" -ForegroundColor Green
        Write-Host "  Roles: $($payload.roles -join ', ')" -ForegroundColor Cyan
        Write-Host "  Permissions ($($payload.permissions.Count)): $($payload.permissions -join ', ')" -ForegroundColor Cyan
        
        # Test từng route
        foreach ($route in $routes) {
            $totalTests++
            
            try {
                $resp = Invoke-WebRequest -Uri "$FRONTEND_URL$($route.Path)" `
                    -Method GET `
                    -Headers @{ 'Cookie' = "accessToken=$token" } `
                    -MaximumRedirection 0 `
                    -UseBasicParsing `
                    -ErrorAction Stop
                
                $status = $resp.StatusCode
                if ($status -eq 200) {
                    Write-Host "    ✅ $($route.Name)" -ForegroundColor Green
                    $results += @{
                        Role = $account.Name
                        Route = $route.Name
                        Status = "OK"
                        Color = "Green"
                    }
                } else {
                    Write-Host "    ⚠️  $($route.Name) - Status: $status" -ForegroundColor Yellow
                    $results += @{
                        Role = $account.Name
                        Route = $route.Name
                        Status = "Status $status"
                        Color = "Yellow"
                    }
                }
            } catch {
                $status = $_.Exception.Response.StatusCode.value__
                if ($status -eq 307 -or $status -eq 302) {
                    Write-Host "    ❌ $($route.Name) - REDIRECT" -ForegroundColor Red
                    $failedTests++
                    $results += @{
                        Role = $account.Name
                        Route = $route.Name
                        Status = "REDIRECT"
                        Color = "Red"
                    }
                } elseif ($status -eq 404) {
                    Write-Host "    ⊘  $($route.Name) - NOT FOUND" -ForegroundColor DarkGray
                    $results += @{
                        Role = $account.Name
                        Route = $route.Name
                        Status = "NOT FOUND"
                        Color = "DarkGray"
                    }
                } else {
                    Write-Host "    ⚠️  $($route.Name) - Status: $status" -ForegroundColor Yellow
                    $results += @{
                        Role = $account.Name
                        Route = $route.Name
                        Status = "Status $status"
                        Color = "Yellow"
                    }
                }
            }
            
            Start-Sleep -Milliseconds 100
        }
        
    } catch {
        Write-Host "  ✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "  Skipping this account..." -ForegroundColor Yellow
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total tests: $totalTests" -ForegroundColor White
Write-Host "Failed (Redirects): $failedTests" -ForegroundColor Red
Write-Host "Success rate: $(100 - ($failedTests * 100 / $totalTests))%" -ForegroundColor Green

# Show all REDIRECT cases
$redirectCases = $results | Where-Object { $_.Status -eq "REDIRECT" }
if ($redirectCases.Count -gt 0) {
    Write-Host "`n❌ ROUTES WITH REDIRECT ISSUES:" -ForegroundColor Red
    Write-Host "================================" -ForegroundColor Red
    foreach ($case in $redirectCases) {
        Write-Host "  $($case.Role) -> $($case.Route)" -ForegroundColor Red
    }
    
    Write-Host "`n📋 NEEDS TO FIX:" -ForegroundColor Yellow
    Write-Host "  1. Check ROUTE_PERMISSIONS in middleware.ts" -ForegroundColor Yellow
    Write-Host "  2. Verify permissions in database for each role" -ForegroundColor Yellow
    Write-Host "  3. Update permission codes to match PM-XXX format" -ForegroundColor Yellow
} else {
    Write-Host "`n✅ ALL TESTS PASSED! No redirect issues found." -ForegroundColor Green
}

Write-Host "`n"
