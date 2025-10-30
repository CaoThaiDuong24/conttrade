# Test Realtime Permission Updates
# Kiểm tra xem user có được cấp quyền ngay lập tức không cần logout/login

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST REALTIME PERMISSION UPDATES" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$backendUrl = "http://localhost:3006"
$frontendUrl = "http://localhost:3000"

# Step 1: Login as buyer
Write-Host "Step 1: Login as buyer@example.com..." -ForegroundColor Yellow
try {
    $loginResp = Invoke-WebRequest -Uri "$backendUrl/api/v1/auth/login" `
        -Method POST `
        -Headers @{'Content-Type'='application/json'} `
        -Body '{"email":"buyer@example.com","password":"buyer123"}' `
        -UseBasicParsing
    
    $loginData = $loginResp.Content | ConvertFrom-Json
    $buyerToken = $loginData.data.token
    
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "   User: $($loginData.data.user.email)" -ForegroundColor Gray
    Write-Host "   Roles: $($loginData.data.user.roles -join ', ')" -ForegroundColor Gray
    Write-Host "   Permissions: $($loginData.data.user.permissions.Count) permissions" -ForegroundColor Gray
    
    # Check if has PM-010 (CREATE_LISTING)
    $hasPM010 = $loginData.data.user.permissions -contains "PM-010"
    Write-Host "   Has PM-010 (CREATE_LISTING): $(if($hasPM010){'✅ YES'}else{'❌ NO'})" -ForegroundColor $(if($hasPM010){'Green'}else{'Red'})
    
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Try to access /sell/new route (should fail without PM-010)
Write-Host "`nStep 2: Access /vi/sell/new without PM-010..." -ForegroundColor Yellow
try {
    $sellResp = Invoke-WebRequest -Uri "$frontendUrl/vi/sell/new" `
        -Method GET `
        -Headers @{'Cookie'="accessToken=$buyerToken"} `
        -MaximumRedirection 0 `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    
    if ($sellResp.StatusCode -eq 200) {
        Write-Host "   ✅ Status 200 - Access granted" -ForegroundColor Green
    } else {
        Write-Host "   Status: $($sellResp.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 307 -or $statusCode -eq 302) {
        Write-Host "   ❌ Status $statusCode - Redirected (no permission as expected)" -ForegroundColor Yellow
    } else {
        Write-Host "   Status: $statusCode" -ForegroundColor Yellow
    }
}

# Step 3: Login as admin and grant PM-010 to buyer
Write-Host "`nStep 3: Login as admin and grant PM-010 to buyer..." -ForegroundColor Yellow
try {
    # Login as admin
    $adminLoginResp = Invoke-WebRequest -Uri "$backendUrl/api/v1/auth/login" `
        -Method POST `
        -Headers @{'Content-Type'='application/json'} `
        -Body '{"email":"admin@example.com","password":"admin123"}' `
        -UseBasicParsing
    
    $adminData = $adminLoginResp.Content | ConvertFrom-Json
    $adminToken = $adminData.data.token
    
    Write-Host "   ✅ Admin login successful" -ForegroundColor Green
    
    # Get buyer user ID
    $buyerUserId = $loginData.data.user.id
    
    # Grant PM-010 permission to buyer via role assignment
    # First, check if seller role exists and assign it
    Write-Host "   Assigning seller role to buyer..." -ForegroundColor Gray
    
    $assignRoleBody = @{
        userId = $buyerUserId
        roleCode = "seller"
    } | ConvertTo-Json
    
    $assignResp = Invoke-WebRequest -Uri "$backendUrl/api/v1/admin/rbac/users/$buyerUserId/roles" `
        -Method POST `
        -Headers @{
            'Authorization'="Bearer $adminToken"
            'Content-Type'='application/json'
        } `
        -Body $assignRoleBody `
        -UseBasicParsing
    
    Write-Host "   ✅ Seller role assigned to buyer!" -ForegroundColor Green
    
} catch {
    Write-Host "   ⚠️ Role assignment result: $($_.Exception.Message)" -ForegroundColor Yellow
    # Continue anyway - role might already be assigned
}

# Step 4: Try to access /sell/new again WITHOUT logout/login
Write-Host "`nStep 4: Access /vi/sell/new again with SAME TOKEN (no logout)..." -ForegroundColor Yellow
Write-Host "   Using same token from Step 1 (before permission grant)" -ForegroundColor Gray

Start-Sleep -Seconds 2  # Give database a moment to update

try {
    $sellResp2 = Invoke-WebRequest -Uri "$frontendUrl/vi/sell/new" `
        -Method GET `
        -Headers @{'Cookie'="accessToken=$buyerToken"} `
        -MaximumRedirection 0 `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    
    if ($sellResp2.StatusCode -eq 200) {
        Write-Host "   ✅✅✅ Status 200 - REALTIME PERMISSION WORKS!" -ForegroundColor Green
        Write-Host "   User can access /sell/new WITHOUT logout/login!" -ForegroundColor Green
    } else {
        Write-Host "   Status: $($sellResp2.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 307 -or $statusCode -eq 302) {
        Write-Host "   ❌ Status $statusCode - Still redirected" -ForegroundColor Red
        Write-Host "   Realtime permission check might not be working" -ForegroundColor Red
    } else {
        Write-Host "   Status: $statusCode" -ForegroundColor Yellow
    }
}

# Step 5: Verify permissions via /auth/me
Write-Host "`nStep 5: Verify current permissions via /auth/me..." -ForegroundColor Yellow
try {
    $meResp = Invoke-WebRequest -Uri "$backendUrl/api/v1/auth/me" `
        -Method GET `
        -Headers @{'Authorization'="Bearer $buyerToken"} `
        -UseBasicParsing
    
    $meData = $meResp.Content | ConvertFrom-Json
    
    Write-Host "   Current User: $($meData.data.user.email)" -ForegroundColor Gray
    Write-Host "   Roles: $($meData.data.user.roles -join ', ')" -ForegroundColor Gray
    Write-Host "   Permissions: $($meData.data.user.permissions.Count) permissions" -ForegroundColor Gray
    
    $hasPM010Now = $meData.data.user.permissions -contains "PM-010"
    Write-Host "   Has PM-010 now: $(if($hasPM010Now){'✅ YES'}else{'❌ NO'})" -ForegroundColor $(if($hasPM010Now){'Green'}else{'Red'})
    
} catch {
    Write-Host "   ❌ Failed to get user info: $_" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST COMPLETED" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
