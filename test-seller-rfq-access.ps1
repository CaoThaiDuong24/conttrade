# Test seller login and check RFQ permissions

Write-Host "=== Testing Seller RFQ Access ===" -ForegroundColor Cyan

# Step 1: Login as seller
Write-Host "1. Logging in as seller..." -ForegroundColor Yellow
try {
  $loginResp = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/auth/login' `
    -Method POST `
    -Headers @{'Content-Type'='application/json'} `
    -Body '{"email":"seller@example.com","password":"seller123"}' `
    -UseBasicParsing
  
  $loginData = $loginResp.Content | ConvertFrom-Json
  
  if ($loginData.success) {
    Write-Host "   Login successful!" -ForegroundColor Green
    
    # Decode JWT token to see permissions
    $token = $loginData.data.token
    $tokenParts = $token.Split('.')
    $payload = $tokenParts[1]
    
    # Add padding if needed
    while ($payload.Length % 4 -ne 0) { $payload += '=' }
    
    # Decode base64
    $decodedBytes = [Convert]::FromBase64String($payload)
    $decodedText = [System.Text.Encoding]::UTF8.GetString($decodedBytes)
    $tokenData = $decodedText | ConvertFrom-Json
    
    Write-Host "   User: $($tokenData.email)" -ForegroundColor Cyan
    Write-Host "   Roles: $($tokenData.roles -join ', ')" -ForegroundColor Cyan
    Write-Host "   Total permissions: $($tokenData.permissions.Count)" -ForegroundColor Cyan
    
    # Check for RFQ permissions
    $rfqPerms = $tokenData.permissions | Where-Object { $_ -match 'PM-020|PM-021|PM-022' }
    Write-Host "   RFQ-related permissions:" -ForegroundColor Yellow
    if ($rfqPerms.Count -gt 0) {
      $rfqPerms | ForEach-Object { Write-Host "      $($_)" -ForegroundColor Green }
    } else {
      Write-Host "      NONE - User needs to RE-LOGIN!" -ForegroundColor Red
    }
    
    # Test access to /rfq route
    Write-Host "`n2. Testing /rfq route access..." -ForegroundColor Yellow
    try {
      $rfqResp = Invoke-WebRequest -Uri 'http://localhost:3001/vi/rfq' `
        -Method GET `
        -Headers @{ 'Cookie' = "accessToken=$token" } `
        -MaximumRedirection 0 `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
      
      if ($rfqResp.StatusCode -eq 200) {
        Write-Host "   Access to /rfq: SUCCESS (200 OK)" -ForegroundColor Green
      }
    } catch {
      $status = $_.Exception.Response.StatusCode.value__
      if ($status -eq 307 -or $status -eq 302) {
        Write-Host "   Access to /rfq: REDIRECT ($status) - Permission denied!" -ForegroundColor Red
      } else {
        Write-Host "   Access to /rfq: ERROR ($status)" -ForegroundColor Red
      }
    }
    
    # Test access to /rfq/received route  
    Write-Host "`n3. Testing /rfq/received route access..." -ForegroundColor Yellow
    try {
      $receivedResp = Invoke-WebRequest -Uri 'http://localhost:3001/vi/rfq/received' `
        -Method GET `
        -Headers @{ 'Cookie' = "accessToken=$token" } `
        -MaximumRedirection 0 `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
      
      if ($receivedResp.StatusCode -eq 200) {
        Write-Host "   Access to /rfq/received: SUCCESS (200 OK)" -ForegroundColor Green
      }
    } catch {
      $status = $_.Exception.Response.StatusCode.value__
      if ($status -eq 307 -or $status -eq 302) {
        Write-Host "   Access to /rfq/received: REDIRECT ($status) - Permission denied!" -ForegroundColor Red
      } else {
        Write-Host "   Access to /rfq/received: ERROR ($status)" -ForegroundColor Red
      }
    }
    
  } else {
    Write-Host "   Login failed: $($loginData.message)" -ForegroundColor Red
  }
} catch {
  Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test completed ===" -ForegroundColor Cyan
