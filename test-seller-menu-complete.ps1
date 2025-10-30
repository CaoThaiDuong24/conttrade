# Complete Test: Seller Menu Display

Write-Host "=== COMPLETE SELLER MENU TEST ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clear browser storage (simulate logout)
Write-Host "1. Simulating fresh login (no cached data)..." -ForegroundColor Yellow

# Step 2: Login as seller
$loginResp = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/auth/login' `
  -Method POST `
  -Headers @{'Content-Type'='application/json'} `
  -Body '{"email":"seller@example.com","password":"seller123"}' `
  -UseBasicParsing

$loginData = $loginResp.Content | ConvertFrom-Json

if (-not $loginData.success) {
  Write-Host "   Login failed!" -ForegroundColor Red
  exit 1
}

$token = $loginData.data.token
Write-Host "   Login successful!" -ForegroundColor Green

# Decode token
$tokenParts = $token.Split('.')
$payload = $tokenParts[1]
while ($payload.Length % 4 -ne 0) { $payload += '=' }
$decodedBytes = [Convert]::FromBase64String($payload)
$decodedText = [System.Text.Encoding]::UTF8.GetString($decodedBytes)
$tokenData = $decodedText | ConvertFrom-Json

Write-Host "   Roles: $($tokenData.roles -join ', ')" -ForegroundColor Cyan
Write-Host "   Permissions: $($tokenData.permissions.Count)" -ForegroundColor Cyan

# Check RFQ permissions
$rfqPerms = @('PM-020', 'PM-021', 'PM-022')
$hasAllRfqPerms = $true
foreach ($perm in $rfqPerms) {
  if (-not ($tokenData.permissions -contains $perm)) {
    $hasAllRfqPerms = $false
    Write-Host "   Missing: $perm" -ForegroundColor Red
  }
}

if ($hasAllRfqPerms) {
  Write-Host "   RFQ Permissions: YES (PM-020, PM-021, PM-022)" -ForegroundColor Green
} else {
  Write-Host "   RFQ Permissions: INCOMPLETE" -ForegroundColor Red
}

Write-Host ""

# Step 3: Test access to RFQ routes
Write-Host "2. Testing RFQ route access..." -ForegroundColor Yellow

$rfqRoutes = @(
  @{url='/vi/rfq'; name='RFQ Main'},
  @{url='/vi/rfq/received'; name='RFQ Received'},
  @{url='/vi/quotes/create'; name='Create Quote'},
  @{url='/vi/quotes/management'; name='Manage Quotes'}
)

foreach ($route in $rfqRoutes) {
  try {
    $resp = Invoke-WebRequest -Uri "http://localhost:3001$($route.url)" `
      -Method GET `
      -Headers @{ 'Cookie' = "accessToken=$token" } `
      -MaximumRedirection 0 `
      -UseBasicParsing `
      -ErrorAction SilentlyContinue
    
    if ($resp.StatusCode -eq 200) {
      Write-Host "   $($route.name): OK (200)" -ForegroundColor Green
    } else {
      Write-Host "   $($route.name): Status $($resp.StatusCode)" -ForegroundColor Yellow
    }
  } catch {
    $status = $_.Exception.Response.StatusCode.value__
    if ($status -eq 307 -or $status -eq 302) {
      Write-Host "   $($route.name): REDIRECT ($status) - Permission denied!" -ForegroundColor Red
    } elseif ($status -eq 404) {
      Write-Host "   $($route.name): NOT FOUND (404) - Page missing" -ForegroundColor Yellow
    } else {
      Write-Host "   $($route.name): ERROR ($status)" -ForegroundColor Red
    }
  }
}

Write-Host ""

# Step 4: Check middleware config
Write-Host "3. Checking middleware permission requirements..." -ForegroundColor Yellow
Write-Host "   /rfq should require: PM-020" -ForegroundColor Gray
Write-Host "   /rfq/received should require: PM-022" -ForegroundColor Gray
Write-Host "   /quotes/create should require: PM-022" -ForegroundColor Gray
Write-Host "   /quotes/management should require: PM-022" -ForegroundColor Gray

Write-Host ""

# Step 5: Instructions
Write-Host "=== INSTRUCTIONS ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "If menu still not showing, please:" -ForegroundColor Yellow
Write-Host "1. Open browser at http://localhost:3001" -ForegroundColor White
Write-Host "2. Open DevTools (F12)" -ForegroundColor White
Write-Host "3. Go to Application > Local Storage" -ForegroundColor White
Write-Host "4. Delete 'accessToken' item" -ForegroundColor White
Write-Host "5. Logout and login again as seller@example.com" -ForegroundColor White
Write-Host "6. Check sidebar for 'RFQ & Bao gia' menu" -ForegroundColor White
Write-Host ""
Write-Host "Menu should appear between 'Ban hang' and 'Don hang'" -ForegroundColor Cyan
Write-Host ""
