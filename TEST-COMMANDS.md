# Quick Test Commands - Buyer Access to /sell/new

## Test 1: Login và lấy token
```powershell
$response = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/auth/login' `
  -Method POST `
  -Headers @{'Content-Type'='application/json'} `
  -Body '{"email":"buyer@example.com","password":"buyer123"}' `
  -UseBasicParsing

$data = $response.Content | ConvertFrom-Json
$token = $data.data.token

Write-Host "✅ Token received: $($token.Substring(0,20))..."
```

## Test 2: Decode JWT để xem permissions
```powershell
$parts = $token.Split('.')
$payload = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($parts[1] + '=='))
$decoded = $payload | ConvertFrom-Json

Write-Host "`n=== JWT Payload ===" -ForegroundColor Cyan
Write-Host "User ID: $($decoded.userId)"
Write-Host "Email: $($decoded.email)"
Write-Host "Roles: $($decoded.roles -join ', ')"
Write-Host "`nPermissions ($($decoded.permissions.Count)):"
$decoded.permissions | ForEach-Object { Write-Host "  - $_" }

# Check for PM-010
if ($decoded.permissions -contains 'PM-010') {
    Write-Host "`n✅ PM-010 (CREATE_LISTING) found - Buyer should have access to /sell/new" -ForegroundColor Green
} else {
    Write-Host "`n❌ PM-010 missing!" -ForegroundColor Red
}
```

## Test 3: Test tạo listing qua API
```powershell
# Get depot ID
$depot = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/depots' `
  -Headers @{'Authorization'="Bearer $token"} `
  -UseBasicParsing | ConvertFrom-Json

$depotId = $depot.data[0].id

# Create listing
$listing = @{
    title = 'Test Container by Buyer'
    dealType = 'SALE'
    priceAmount = 15000000
    priceCurrency = 'VND'
    locationDepotId = $depotId
    containerType = 'DRY_20'
    quantity = 5
} | ConvertTo-Json

$createResp = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/listings' `
  -Method POST `
  -Headers @{'Authorization'="Bearer $token"; 'Content-Type'='application/json'} `
  -Body $listing `
  -UseBasicParsing

$result = $createResp.Content | ConvertFrom-Json

if ($result.success) {
    Write-Host "`n✅ Listing created successfully!" -ForegroundColor Green
    Write-Host "Listing ID: $($result.data.listing.id)"
    Write-Host "Title: $($result.data.listing.title)"
    Write-Host "Status: $($result.data.listing.status)"
} else {
    Write-Host "`n❌ Failed to create listing: $($result.message)" -ForegroundColor Red
}
```

## Test 4: All-in-One Test
```powershell
# Full test script
function Test-BuyerSellAccess {
    Write-Host "`n=== TESTING BUYER ACCESS TO /sell/new ===" -ForegroundColor Cyan
    
    # Step 1: Login
    Write-Host "`n[1/4] Login as buyer..." -ForegroundColor Yellow
    $login = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/auth/login' `
      -Method POST `
      -Headers @{'Content-Type'='application/json'} `
      -Body '{"email":"buyer@example.com","password":"buyer123"}' `
      -UseBasicParsing
    
    $loginData = $login.Content | ConvertFrom-Json
    $token = $loginData.data.token
    Write-Host "✅ Login successful: $($loginData.data.user.email)" -ForegroundColor Green
    
    # Step 2: Decode JWT
    Write-Host "`n[2/4] Checking JWT permissions..." -ForegroundColor Yellow
    $parts = $token.Split('.')
    $payload = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($parts[1] + '=='))
    $decoded = $payload | ConvertFrom-Json
    
    Write-Host "Permissions found: $($decoded.permissions.Count)"
    $listingPerms = $decoded.permissions | Where-Object { $_ -match 'PM-01[0-4]' }
    Write-Host "Listing permissions: $($listingPerms -join ', ')" -ForegroundColor Cyan
    
    if ($decoded.permissions -contains 'PM-010') {
        Write-Host "✅ PM-010 present" -ForegroundColor Green
    } else {
        Write-Host "❌ PM-010 missing!" -ForegroundColor Red
        return
    }
    
    # Step 3: Get depot
    Write-Host "`n[3/4] Getting depot..." -ForegroundColor Yellow
    $depots = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/depots' `
      -Headers @{'Authorization'="Bearer $token"} `
      -UseBasicParsing | ConvertFrom-Json
    
    if ($depots.data.Count -eq 0) {
        $depotId = '3feea6b3-d262-4121-ab34-b5f7a2b0e393'  # Fallback
        Write-Host "⚠️ No depots from API, using hardcoded ID" -ForegroundColor Yellow
    } else {
        $depotId = $depots.data[0].id
        Write-Host "✅ Depot: $($depots.data[0].name)" -ForegroundColor Green
    }
    
    # Step 4: Create listing
    Write-Host "`n[4/4] Creating listing..." -ForegroundColor Yellow
    $listingBody = @{
        title = "Buyer Test - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        dealType = 'SALE'
        priceAmount = 15000000
        priceCurrency = 'VND'
        locationDepotId = $depotId
        containerType = 'DRY_20'
        quantity = 5
        description = 'Test listing created by buyer account'
    } | ConvertTo-Json -Compress
    
    try {
        $createResp = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/listings' `
          -Method POST `
          -Headers @{'Authorization'="Bearer $token"; 'Content-Type'='application/json'} `
          -Body $listingBody `
          -UseBasicParsing
        
        $result = $createResp.Content | ConvertFrom-Json
        
        Write-Host "`n✅✅✅ SUCCESS! Buyer created listing! ✅✅✅" -ForegroundColor Green
        Write-Host "Listing ID: $($result.data.listing.id)"
        Write-Host "Title: $($result.data.listing.title)"
        Write-Host "Status: $($result.data.listing.status)"
        Write-Host "`n🎉 BUG FIX VERIFIED: Buyer can create listings with PM-010 permission!" -ForegroundColor Green
        
    } catch {
        Write-Host "`n❌ Failed to create listing" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

# Run the test
Test-BuyerSellAccess
```

## Expected Output
```
=== TESTING BUYER ACCESS TO /sell/new ===

[1/4] Login as buyer...
✅ Login successful: buyer@example.com

[2/4] Checking JWT permissions...
Permissions found: 17
Listing permissions: PM-010, PM-011, PM-012, PM-013, PM-014
✅ PM-010 present

[3/4] Getting depot...
✅ Depot: Depot Saigon Port

[4/4] Creating listing...

✅✅✅ SUCCESS! Buyer created listing! ✅✅✅
Listing ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Title: Buyer Test - 2025-10-27 15:30:00
Status: PENDING_REVIEW

🎉 BUG FIX VERIFIED: Buyer can create listings with PM-010 permission!
```

## Frontend Test (Browser)
1. Open: `http://localhost:3001/test-buyer-sell-access.html`
2. Click "Login" button
3. Click "Check Storage" → verify localStorage and cookies
4. Click "Decode JWT" → verify PM-010 exists
5. Click "Navigate to /sell/new" → should show listing form, NOT redirect to dashboard

## Manual Browser Test
1. Open: `http://localhost:3001/vi/auth/login`
2. Login:
   - Email: `buyer@example.com`
   - Password: `buyer123`
3. Navigate to: `http://localhost:3001/vi/sell/new`
4. Expected: Listing creation form appears
5. Not Expected: Redirect to `/vi/dashboard`
