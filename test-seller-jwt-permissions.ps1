# Test seller login and check JWT token permissions

Write-Host "`n=== TESTING SELLER LOGIN & JWT PERMISSIONS ===" -ForegroundColor Cyan

# Step 1: Login as seller
Write-Host "`n1. Logging in as seller..." -ForegroundColor Yellow
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
  
  Write-Host "✅ Login successful" -ForegroundColor Green
  
  $token = $loginData.data.token
  Write-Host "Token (first 80 chars): $($token.Substring(0, [Math]::Min(80, $token.Length)))..." -ForegroundColor Gray
  
} catch {
  Write-Host "❌ Login request failed: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host "Make sure backend is running on port 3006" -ForegroundColor Yellow
  exit 1
}

# Step 2: Decode JWT to check permissions
Write-Host "`n2. Decoding JWT token..." -ForegroundColor Yellow

try {
  $tokenParts = $token.Split('.')
  
  if ($tokenParts.Length -lt 2) {
    Write-Host "❌ Invalid token format" -ForegroundColor Red
    exit 1
  }
  
  # Decode base64 payload
  $payloadBase64 = $tokenParts[1]
  
  # Add padding if needed
  $padding = 4 - ($payloadBase64.Length % 4)
  if ($padding -lt 4) {
    $payloadBase64 += "=" * $padding
  }
  
  $payloadJson = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($payloadBase64))
  $payload = $payloadJson | ConvertFrom-Json
  
  Write-Host "✅ Token decoded successfully" -ForegroundColor Green
  Write-Host "`nToken Payload:" -ForegroundColor Cyan
  Write-Host "  User ID: $($payload.userId)" -ForegroundColor Gray
  Write-Host "  Email: $($payload.email)" -ForegroundColor Gray
  Write-Host "  Roles: $($payload.roles -join ', ')" -ForegroundColor Gray
  
  # Check permissions
  if ($payload.permissions) {
    Write-Host "  Permissions: $($payload.permissions.Count) total" -ForegroundColor Green
    Write-Host "`nPermissions list:" -ForegroundColor Cyan
    $payload.permissions | ForEach-Object { Write-Host "    - $_" -ForegroundColor Gray }
    
    # Check specific permissions
    Write-Host "`n🎯 Key permissions check:" -ForegroundColor Cyan
    Write-Host "  PM-040 (CREATE_ORDER): $(if ($payload.permissions -contains 'PM-040') { '✅ YES' } else { '❌ NO' })" -ForegroundColor $(if ($payload.permissions -contains 'PM-040') { 'Green' } else { 'Red' })
    Write-Host "  PM-020 (CREATE_RFQ): $(if ($payload.permissions -contains 'PM-020') { '✅ YES' } else { '❌ NO' })" -ForegroundColor $(if ($payload.permissions -contains 'PM-020') { 'Green' } else { 'Red' })
    Write-Host "  PM-021 (ISSUE_QUOTE): $(if ($payload.permissions -contains 'PM-021') { '✅ YES' } else { '❌ NO' })" -ForegroundColor $(if ($payload.permissions -contains 'PM-021') { 'Green' } else { 'Red' })
    
  } else {
    Write-Host "  Permissions: ❌ NOT FOUND IN TOKEN!" -ForegroundColor Red
    Write-Host "`n⚠️  WARNING: Token does not contain permissions!" -ForegroundColor Red
    Write-Host "This is the problem! Backend should include permissions in JWT." -ForegroundColor Yellow
  }
  
} catch {
  Write-Host "❌ Failed to decode token: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}

# Step 3: Test access to /orders with this token
Write-Host "`n3. Testing access to /vi/orders..." -ForegroundColor Yellow

# Check if frontend is running
$frontendRunning = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -WarningAction SilentlyContinue

if (-not $frontendRunning) {
  Write-Host "⚠️  Frontend not running on port 3000" -ForegroundColor Yellow
  Write-Host "Start frontend with: npm run dev" -ForegroundColor Gray
} else {
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
    
  } catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    
    if ($statusCode -eq 307 -or $statusCode -eq 302) {
      $location = $_.Exception.Response.Headers.Location
      Write-Host "❌ REDIRECTED - Status: $statusCode" -ForegroundColor Red
      Write-Host "Redirect to: $location" -ForegroundColor Red
      
      Write-Host "`n🔍 Possible causes:" -ForegroundColor Yellow
      Write-Host "  1. Middleware not reading permissions from JWT" -ForegroundColor Gray
      Write-Host "  2. Token not being sent correctly" -ForegroundColor Gray
      Write-Host "  3. Check browser console and server logs" -ForegroundColor Gray
      
    } else {
      Write-Host "❌ Error - Status: $statusCode" -ForegroundColor Red
    }
  }
}

Write-Host "`n=== TEST COMPLETE ===" -ForegroundColor Cyan
