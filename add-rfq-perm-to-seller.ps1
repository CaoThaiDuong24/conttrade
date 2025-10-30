# Script to add PM-020 (CREATE_RFQ) permission to seller role via Admin RBAC API

Write-Host "=== Adding PM-020 Permission to Seller Role ===" -ForegroundColor Cyan

# Step 1: Login as admin
Write-Host "1. Logging in as admin..." -ForegroundColor Yellow
$loginResp = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/auth/login' `
  -Method POST `
  -Headers @{'Content-Type'='application/json'} `
  -Body '{"email":"admin@example.com","password":"admin123"}' `
  -UseBasicParsing

$loginData = $loginResp.Content | ConvertFrom-Json
$token = $loginData.data.token

if ($token) {
  Write-Host "   Admin login successful" -ForegroundColor Green
} else {
  Write-Host "   Admin login failed" -ForegroundColor Red
  exit 1
}

# Step 2: Check if PM-020 permission exists
Write-Host "2. Checking if PM-020 permission exists..." -ForegroundColor Yellow
try {
  $permsResp = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/admin/rbac/permissions' `
    -Method GET `
    -Headers @{'Authorization'="Bearer $token"} `
    -UseBasicParsing
  
  $permsData = $permsResp.Content | ConvertFrom-Json
  $pm020 = $permsData.data.permissions | Where-Object { $_.code -eq 'PM-020' }
  
  if ($pm020) {
    Write-Host "   Permission PM-020 exists: $($pm020.name)" -ForegroundColor Green
  } else {
    Write-Host "   Error Permission PM-020 NOT found in database!" -ForegroundColor Red
    exit 1
  }
} catch {
  Write-Host "   Error Failed to fetch permissions: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}

# Step 3: Check current seller permissions
Write-Host "3. Checking current seller permissions..." -ForegroundColor Yellow
try {
  $rolesResp = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/admin/rbac/roles' `
    -Method GET `
    -Headers @{'Authorization'="Bearer $token"} `
    -UseBasicParsing
  
  $rolesData = $rolesResp.Content | ConvertFrom-Json
  $sellerRole = $rolesData.data.roles | Where-Object { $_.code -eq 'seller' }
  
  if ($sellerRole) {
    Write-Host "   Success Seller role found" -ForegroundColor Green
    Write-Host "   Current permissions: $($sellerRole.permissions.Count) total" -ForegroundColor Cyan
    
    # Check if already has PM-020
    $hasPM020 = $sellerRole.permissions | Where-Object { $_ -eq 'PM-020' }
    if ($hasPM020) {
      Write-Host "   Warning Seller already has PM-020 permission!" -ForegroundColor Yellow
      Write-Host "   Seller permissions:"
      $sellerRole.permissions | ForEach-Object { Write-Host "      - $_" }
      exit 0
    } else {
      Write-Host "   Seller does NOT have PM-020 yet" -ForegroundColor Yellow
      Write-Host "   Current seller permissions:"
      $sellerRole.permissions | ForEach-Object { Write-Host "      - $_" }
    }
  } else {
    Write-Host "   Error Seller role NOT found!" -ForegroundColor Red
    exit 1
  }
} catch {
  Write-Host "   Error Failed to fetch roles: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}

# Step 4: Add PM-020 permission to seller role
Write-Host "4. Adding PM-020 permission to seller role..." -ForegroundColor Yellow
try {
  $addPermResp = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/admin/rbac/roles/seller/permissions' `
    -Method POST `
    -Headers @{
      'Authorization'="Bearer $token"
      'Content-Type'='application/json'
    } `
    -Body '{"permissionCode":"PM-020"}' `
    -UseBasicParsing
  
  $addPermData = $addPermResp.Content | ConvertFrom-Json
  
  if ($addPermData.success) {
    Write-Host "   Success! Added PM-020 to seller role!" -ForegroundColor Green
    Write-Host "   New permissions count: $($addPermData.data.permissions.Count)" -ForegroundColor Cyan
    Write-Host "   Role version: $($addPermData.data.role_version)" -ForegroundColor Cyan
    
    Write-Host "   Updated seller permissions:"
    $addPermData.data.permissions | ForEach-Object { Write-Host "      - $_" }
    
    Write-Host "SUCCESS! Seller can now access RFQ menu!" -ForegroundColor Green
    Write-Host "Note: Existing seller users need to RE-LOGIN to get updated permissions" -ForegroundColor Yellow
  } else {
    Write-Host "   Error Failed to add permission: $($addPermData.message)" -ForegroundColor Red
  }
} catch {
  Write-Host "   Error Failed to add permission: $($_.Exception.Message)" -ForegroundColor Red
  
  # Try to get error details
  if ($_.Exception.Response) {
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $responseBody = $reader.ReadToEnd()
    Write-Host "   Error details: $responseBody" -ForegroundColor Red
  }
  exit 1
}

Write-Host "=== Script completed ===" -ForegroundColor Cyan
