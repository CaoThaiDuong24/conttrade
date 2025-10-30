# Test all seller menu routes

Write-Host "`n=== TESTING ALL SELLER MENU ROUTES ===" -ForegroundColor Cyan

# Check if backend and frontend are running
Write-Host "`n1. Checking servers..." -ForegroundColor Yellow
$backend = Test-NetConnection -ComputerName localhost -Port 3006 -InformationLevel Quiet -WarningAction SilentlyContinue
$frontend = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -WarningAction SilentlyContinue

Write-Host "Backend (3006): $(if($backend){'✅ Running'}else{'❌ Not running'})" -ForegroundColor $(if($backend){'Green'}else{'Red'})
Write-Host "Frontend (3000): $(if($frontend){'✅ Running'}else{'❌ Not running'})" -ForegroundColor $(if($frontend){'Green'}else{'Red'})

if (-not $backend -or -not $frontend) {
  Write-Host "`n⚠️  Please start both servers before testing" -ForegroundColor Yellow
  Write-Host "Backend: cd backend && npm run dev" -ForegroundColor Gray
  Write-Host "Frontend: cd frontend && npm run dev" -ForegroundColor Gray
  exit 1
}

# Login as seller
Write-Host "`n2. Logging in as seller..." -ForegroundColor Yellow
try {
  $loginResponse = Invoke-WebRequest `
    -Uri 'http://localhost:3006/api/v1/auth/login' `
    -Method POST `
    -Headers @{'Content-Type'='application/json'} `
    -Body '{"email":"seller@example.com","password":"seller123"}' `
    -UseBasicParsing
  
  $loginData = $loginResponse.Content | ConvertFrom-Json
  
  if (-not $loginData.success) {
    Write-Host "❌ Login failed: $($loginData.message)" -ForegroundColor Red
    exit 1
  }
  
  $token = $loginData.data.token
  Write-Host "✅ Login successful" -ForegroundColor Green
  
  # Decode token to verify permissions
  $tokenParts = $token.Split('.')
  $padding = 4 - ($tokenParts[1].Length % 4)
  if ($padding -lt 4) { $tokenParts[1] += "=" * $padding }
  $payloadJson = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($tokenParts[1]))
  $payload = $payloadJson | ConvertFrom-Json
  
  Write-Host "Permissions in token: $($payload.permissions.Count)" -ForegroundColor Gray
  
} catch {
  Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}

# Define seller routes from sidebar
$sellerRoutes = @(
  @{Path='/vi/dashboard'; Name='Dashboard'; Expected='PM-001'},
  @{Path='/vi/listings'; Name='Container'; Expected='PM-001'},
  @{Path='/vi/sell/new'; Name='Đăng tin mới'; Expected='PM-010'},
  @{Path='/vi/sell/my-listings'; Name='Tin đăng của tôi'; Expected='PM-011'},
  @{Path='/vi/rfq'; Name='RFQ'; Expected='PM-020 or PM-021'},
  @{Path='/vi/rfq/received'; Name='RFQ nhận được'; Expected='PM-021'},
  @{Path='/vi/quotes/create'; Name='Tạo báo giá'; Expected='PM-021'},
  @{Path='/vi/quotes/management'; Name='Quản lý báo giá'; Expected='PM-022'},
  @{Path='/vi/orders'; Name='Đơn hàng'; Expected='PM-040'},
  @{Path='/vi/delivery'; Name='Vận chuyển'; Expected='PM-042'},
  @{Path='/vi/reviews'; Name='Đánh giá'; Expected='PM-050'},
  @{Path='/vi/reviews/new'; Name='Tạo đánh giá'; Expected='PM-050'},
  @{Path='/vi/billing'; Name='Hóa đơn'; Expected='PM-090'},
  @{Path='/vi/account/profile'; Name='Hồ sơ'; Expected='PM-001'},
  @{Path='/vi/account/settings'; Name='Cài đặt'; Expected='PM-001'}
)

# Test each route
Write-Host "`n3. Testing routes..." -ForegroundColor Yellow
Write-Host "=" * 80

$passed = 0
$failed = 0
$redirected = 0

foreach ($route in $sellerRoutes) {
  try {
    $response = Invoke-WebRequest `
      -Uri "http://localhost:3000$($route.Path)" `
      -Method GET `
      -Headers @{
        'Cookie' = "accessToken=$token"
      } `
      -MaximumRedirection 0 `
      -UseBasicParsing `
      -ErrorAction Stop
    
    Write-Host "✅ PASS" -ForegroundColor Green -NoNewline
    Write-Host " $($route.Name.PadRight(25)) " -NoNewline
    Write-Host "($($route.Expected))" -ForegroundColor Gray
    $passed++
    
  } catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    
    if ($statusCode -eq 307 -or $statusCode -eq 302) {
      $location = $_.Exception.Response.Headers.Location
      Write-Host "❌ REDIRECT" -ForegroundColor Red -NoNewline
      Write-Host " $($route.Name.PadRight(25)) " -NoNewline
      Write-Host "→ $location" -ForegroundColor Yellow
      $redirected++
      $failed++
    } else {
      Write-Host "⚠️  ERROR $statusCode" -ForegroundColor Yellow -NoNewline
      Write-Host " $($route.Name.PadRight(25))" -NoNewline
      Write-Host " ($($route.Expected))" -ForegroundColor Gray
      $failed++
    }
  }
}

# Summary
Write-Host "`n" + "=" * 80
Write-Host "`n📊 SUMMARY:" -ForegroundColor Cyan
Write-Host "  Total routes: $($sellerRoutes.Count)" -ForegroundColor Gray
Write-Host "  Passed: $passed" -ForegroundColor Green
Write-Host "  Failed: $failed" -ForegroundColor Red
Write-Host "  Redirected: $redirected" -ForegroundColor Yellow

if ($failed -eq 0) {
  Write-Host "`n✅ ALL TESTS PASSED! Seller can access all menu items." -ForegroundColor Green
} else {
  Write-Host "`n❌ SOME TESTS FAILED. Check middleware logs and permissions." -ForegroundColor Red
  Write-Host "`n🔍 Next steps:" -ForegroundColor Yellow
  Write-Host "  1. Check terminal running 'npm run dev' for middleware logs" -ForegroundColor Gray
  Write-Host "  2. Verify seller has required permissions in database" -ForegroundColor Gray
  Write-Host "  3. Clear browser cache and cookies, then login again" -ForegroundColor Gray
}

Write-Host "`n=== TEST COMPLETE ===" -ForegroundColor Cyan
