# Auto Test All Menus - Permission Check
# This script tests all menu routes with buyer account

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$ApiUrl = "http://localhost:3006"
)

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Auto Test All Menus" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Login as buyer
Write-Host "1. Logging in as buyer@example.com..." -ForegroundColor Yellow
try {
    $loginResp = Invoke-WebRequest `
        -Uri "$ApiUrl/api/v1/auth/login" `
        -Method POST `
        -Headers @{'Content-Type'='application/json'} `
        -Body '{"email":"buyer@example.com","password":"buyer123"}' `
        -UseBasicParsing
    
    $loginData = $loginResp.Content | ConvertFrom-Json
    $token = $loginData.data.token
    Write-Host "✓ Login successful" -ForegroundColor Green
    
    # Decode JWT to show permissions
    $parts = $token.Split('.')
    $payload = $parts[1]
    $padding = (4 - ($payload.Length % 4)) % 4
    $payload += '=' * $padding
    $bytes = [Convert]::FromBase64String($payload)
    $json = [System.Text.Encoding]::UTF8.GetString($bytes)
    $payloadObj = $json | ConvertFrom-Json
    
    Write-Host ""
    Write-Host "User Info:" -ForegroundColor Cyan
    Write-Host "  Email: $($payloadObj.email)"
    Write-Host "  Roles: $($payloadObj.roles -join ', ')"
    Write-Host "  Permissions: $($payloadObj.permissions.Length) total"
    Write-Host ""
    
} catch {
    Write-Host "✗ Login failed: $_" -ForegroundColor Red
    exit 1
}

# Define test routes
$testRoutes = @(
    # Should ALLOW (buyer has permissions)
    @{ Path = "/vi/dashboard"; Name = "Dashboard"; ShouldAllow = $true },
    @{ Path = "/vi/listings"; Name = "Listings"; ShouldAllow = $true },
    @{ Path = "/vi/sell/new"; Name = "Create Listing"; ShouldAllow = $true },
    @{ Path = "/vi/sell/my-listings"; Name = "My Listings"; ShouldAllow = $true },
    @{ Path = "/vi/rfq/create"; Name = "Create RFQ"; ShouldAllow = $true },
    @{ Path = "/vi/rfq"; Name = "RFQ List"; ShouldAllow = $true },
    @{ Path = "/vi/orders"; Name = "Orders"; ShouldAllow = $true },
    @{ Path = "/vi/account/profile"; Name = "Profile"; ShouldAllow = $true },
    @{ Path = "/vi/account/settings"; Name = "Settings"; ShouldAllow = $true },
    @{ Path = "/vi/payments"; Name = "Payments"; ShouldAllow = $true },
    @{ Path = "/vi/reviews"; Name = "Reviews"; ShouldAllow = $true },
    @{ Path = "/vi/disputes"; Name = "Disputes"; ShouldAllow = $true },
    
    # Should DENY (buyer doesn't have permissions)
    @{ Path = "/vi/admin"; Name = "Admin Dashboard"; ShouldAllow = $false },
    @{ Path = "/vi/admin/users"; Name = "Admin Users"; ShouldAllow = $false },
    @{ Path = "/vi/depot"; Name = "Depot"; ShouldAllow = $false },
    @{ Path = "/vi/depot/stock"; Name = "Depot Stock"; ShouldAllow = $false }
)

Write-Host "2. Testing routes..." -ForegroundColor Yellow
Write-Host "=" * 80
Write-Host ""

$passed = 0
$failed = 0
$results = @()

foreach ($route in $testRoutes) {
    $path = $route.Path
    $name = $route.Name
    $shouldAllow = $route.ShouldAllow
    
    Write-Host "$name ($path)... " -NoNewline
    
    try {
        $resp = Invoke-WebRequest `
            -Uri "$BaseUrl$path" `
            -Method GET `
            -Headers @{'Cookie'="accessToken=$token"} `
            -MaximumRedirection 0 `
            -UseBasicParsing `
            -ErrorAction Stop
        
        # Status 200 = allowed
        if ($shouldAllow) {
            Write-Host "✓ PASS (Allowed)" -ForegroundColor Green
            $passed++
            $results += @{
                Route = $path
                Name = $name
                Status = "PASS"
                Expected = "Allow"
                Actual = "Allowed"
            }
        } else {
            Write-Host "✗ FAIL (Should be denied)" -ForegroundColor Red
            $failed++
            $results += @{
                Route = $path
                Name = $name
                Status = "FAIL"
                Expected = "Deny"
                Actual = "Allowed"
            }
        }
        
    } catch {
        $statusCode = $null
        $location = $null
        
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.Value__
            $location = $_.Exception.Response.Headers.Location
        }
        
        # Redirect = denied
        if ($statusCode -eq 307 -or $statusCode -eq 302) {
            if (-not $shouldAllow) {
                Write-Host "✓ PASS (Denied)" -ForegroundColor Green
                $passed++
                $results += @{
                    Route = $path
                    Name = $name
                    Status = "PASS"
                    Expected = "Deny"
                    Actual = "Denied -> $location"
                }
            } else {
                Write-Host "✗ FAIL (Should be allowed)" -ForegroundColor Red
                $failed++
                $results += @{
                    Route = $path
                    Name = $name
                    Status = "FAIL"
                    Expected = "Allow"
                    Actual = "Denied -> $location"
                }
            }
        } else {
            Write-Host "? ERROR ($statusCode)" -ForegroundColor Yellow
            $results += @{
                Route = $path
                Name = $name
                Status = "ERROR"
                Expected = if ($shouldAllow) { "Allow" } else { "Deny" }
                Actual = "Error: $statusCode"
            }
        }
    }
}

Write-Host ""
Write-Host "=" * 80
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  ✓ Passed: $passed" -ForegroundColor Green
Write-Host "  ✗ Failed: $failed" -ForegroundColor Red
Write-Host ""

if ($failed -gt 0) {
    Write-Host "Failed tests:" -ForegroundColor Red
    foreach ($result in $results) {
        if ($result.Status -eq "FAIL") {
            Write-Host "  ✗ $($result.Name)" -ForegroundColor Red
            Write-Host "    Expected: $($result.Expected)" -ForegroundColor Gray
            Write-Host "    Actual: $($result.Actual)" -ForegroundColor Gray
        }
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
if ($failed -eq 0) {
    Write-Host "✓ ALL TESTS PASSED!" -ForegroundColor Green
} else {
    Write-Host "✗ SOME TESTS FAILED" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Clear browser cache and cookies" -ForegroundColor Gray
    Write-Host "2. Restart frontend server" -ForegroundColor Gray
    Write-Host "3. Login again with buyer@example.com" -ForegroundColor Gray
    Write-Host "4. Check JWT token has permissions (see FIX-FINAL-CLEAR-CACHE.md)" -ForegroundColor Gray
}
Write-Host "================================" -ForegroundColor Cyan
