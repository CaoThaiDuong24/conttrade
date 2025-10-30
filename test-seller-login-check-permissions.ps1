# Test Seller Login and Check Menu Display

Write-Host "=== TESTING SELLER RFQ MENU ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login as seller
Write-Host "1. Login as seller..." -ForegroundColor Yellow
$loginResp = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/auth/login' `
  -Method POST `
  -Headers @{'Content-Type'='application/json'} `
  -Body '{"email":"seller@example.com","password":"seller123"}' `
  -UseBasicParsing

$loginData = $loginResp.Content | ConvertFrom-Json

if ($loginData.success) {
  Write-Host "   Login successful!" -ForegroundColor Green
  
  $token = $loginData.data.token
  $user = $loginData.data.user
  
  Write-Host "   Email: $($user.email)" -ForegroundColor Cyan
  Write-Host "   Roles: $($user.roles -join ', ')" -ForegroundColor Cyan
  
  # Decode JWT token to see permissions
  $tokenParts = $token.Split('.')
  $payload = $tokenParts[1]
  
  # Add padding
  while ($payload.Length % 4 -ne 0) { $payload += '=' }
  
  # Decode
  $decodedBytes = [Convert]::FromBase64String($payload)
  $decodedText = [System.Text.Encoding]::UTF8.GetString($decodedBytes)
  $tokenData = $decodedText | ConvertFrom-Json
  
  Write-Host "   Total permissions in JWT: $($tokenData.permissions.Count)" -ForegroundColor Cyan
  
  # Check RFQ permissions
  $rfqPerms = @('PM-020', 'PM-021', 'PM-022', 'PM-023')
  Write-Host "`n2. Checking RFQ permissions in JWT token:" -ForegroundColor Yellow
  
  foreach ($perm in $rfqPerms) {
    $has = $tokenData.permissions -contains $perm
    if ($has) {
      Write-Host "   $perm - YES" -ForegroundColor Green
    } else {
      Write-Host "   $perm - NO" -ForegroundColor Red
    }
  }
  
  # Show all permissions
  Write-Host "`n3. All permissions in token:" -ForegroundColor Yellow
  $tokenData.permissions | Sort-Object | ForEach-Object { Write-Host "   - $_" -ForegroundColor Gray }
  
} else {
  Write-Host "   Login failed: $($loginData.message)" -ForegroundColor Red
  exit 1
}

Write-Host "`n=== DONE ===" -ForegroundColor Cyan
