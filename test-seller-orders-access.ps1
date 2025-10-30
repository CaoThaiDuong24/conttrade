# Test seller access to /orders route

Write-Host "`n=== TESTING SELLER ACCESS TO /ORDERS ===" -ForegroundColor Cyan

# Login as seller
Write-Host "`n1. Login as seller..." -ForegroundColor Yellow
$login = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/auth/login' `
  -Method POST `
  -Headers @{'Content-Type'='application/json'} `
  -Body '{"email":"seller@example.com","password":"seller123"}' `
  -UseBasicParsing

$loginData = $login.Content | ConvertFrom-Json
$token = $loginData.data.token

Write-Host "✅ Login successful" -ForegroundColor Green
Write-Host "Token (first 50 chars): $($token.Substring(0, [Math]::Min(50, $token.Length)))..." -ForegroundColor Gray

# Decode JWT to check permissions
Write-Host "`n2. Decoding JWT token..." -ForegroundColor Yellow
$tokenParts = $token.Split('.')
$payloadJson = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($tokenParts[1] + "=="))
$payload = $payloadJson | ConvertFrom-Json

Write-Host "User: $($payload.email)" -ForegroundColor Gray
Write-Host "Roles: $($payload.roles -join ', ')" -ForegroundColor Gray
Write-Host "Permissions count: $($payload.permissions.Count)" -ForegroundColor Gray
Write-Host "Has PM-040: $($payload.permissions -contains 'PM-040')" -ForegroundColor $(if ($payload.permissions -contains 'PM-040') { 'Green' } else { 'Red' })

# Test access to /orders
Write-Host "`n3. Testing access to /vi/orders..." -ForegroundColor Yellow

try {
  $response = Invoke-WebRequest `
    -Uri 'http://localhost:3000/vi/orders' `
    -Method GET `
    -Headers @{
      'Cookie' = "accessToken=$token"
    } `
    -MaximumRedirection 0 `
    -ErrorAction Stop
  
  Write-Host "✅ Access granted - Status: $($response.StatusCode)" -ForegroundColor Green
  Write-Host "Response length: $($response.Content.Length) bytes" -ForegroundColor Gray
  
} catch {
  $statusCode = $_.Exception.Response.StatusCode.value__
  
  if ($statusCode -eq 307 -or $statusCode -eq 302) {
    $location = $_.Exception.Response.Headers.Location
    Write-Host "❌ REDIRECTED - Status: $statusCode" -ForegroundColor Red
    Write-Host "Redirect to: $location" -ForegroundColor Red
    
    # Check middleware logs
    Write-Host "`n🔍 Check your terminal running 'npm run dev' for middleware logs" -ForegroundColor Yellow
  } else {
    Write-Host "❌ Error - Status: $statusCode" -ForegroundColor Red
  }
}

Write-Host "`n=== TEST COMPLETE ===" -ForegroundColor Cyan
