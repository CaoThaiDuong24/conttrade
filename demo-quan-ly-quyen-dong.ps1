# ============================================================
# DEMO: Quản Lý Quyền Động Qua API - KHÔNG CẦN SỬA CODE
# ============================================================

Write-Host "=".PadRight(60, '=') -ForegroundColor Cyan
Write-Host "DEMO: Admin Quan Ly Quyen Dong Qua API" -ForegroundColor Cyan  
Write-Host "=".PadRight(60, '=') -ForegroundColor Cyan
Write-Host ""

# ============================================================
# STEP 1: Login Admin
# ============================================================
Write-Host "Step 1: Login as Admin" -ForegroundColor Yellow
Write-Host "Email: admin@i-contexchange.vn" -ForegroundColor Gray

$loginResp = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/auth/login' `
  -Method POST `
  -Headers @{'Content-Type'='application/json'} `
  -Body '{"email":"admin@i-contexchange.vn","password":"admin123"}' `
  -UseBasicParsing -ErrorAction Stop

$loginData = $loginResp.Content | ConvertFrom-Json
$token = $loginData.data.token

if ($token) {
  Write-Host "Success Admin logged in!" -ForegroundColor Green
  Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} else {
  Write-Host "Error Admin login failed" -ForegroundColor Red
  exit 1
}

Write-Host ""

# ============================================================
# STEP 2: Xem Tất Cả Roles Hiện Tại
# ============================================================
Write-Host "Step 2: Xem Tat Ca Roles Hien Tai" -ForegroundColor Yellow

$rolesResp = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/admin/rbac/roles' `
  -Method GET `
  -Headers @{'Authorization'="Bearer $token"} `
  -UseBasicParsing

$rolesData = $rolesResp.Content | ConvertFrom-Json

if ($rolesData.success) {
  Write-Host "Success Found $($rolesData.data.roles.Count) roles" -ForegroundColor Green
  
  $rolesData.data.roles | ForEach-Object {
    Write-Host "  - $($_.code): $($_.permissions_count) permissions (v$($_.role_version))" -ForegroundColor Cyan
  }
} else {
  Write-Host "Error Failed to fetch roles" -ForegroundColor Red
}

Write-Host ""

# ============================================================
# STEP 3: Xem Permissions Của Seller
# ============================================================
Write-Host "Step 3: Xem Permissions Cua Seller" -ForegroundColor Yellow

$sellerRole = $rolesData.data.roles | Where-Object { $_.code -eq 'seller' }

if ($sellerRole) {
  Write-Host "Seller Role:" -ForegroundColor Cyan
  Write-Host "  Total permissions: $($sellerRole.permissions_count)" -ForegroundColor Gray
  Write-Host "  Role version: $($sellerRole.role_version)" -ForegroundColor Gray
  
  # Check if has RFQ permissions
  $hasRfqPerms = $sellerRole.permissions | Where-Object { $_ -match 'PM-020|PM-021|PM-022' }
  
  if ($hasRfqPerms.Count -gt 0) {
    Write-Host "  RFQ permissions:" -ForegroundColor Green
    $hasRfqPerms | ForEach-Object { Write-Host "    - $_" -ForegroundColor Green }
  } else {
    Write-Host "  No RFQ permissions yet" -ForegroundColor Yellow
  }
} else {
  Write-Host "Error Seller role not found" -ForegroundColor Red
}

Write-Host ""

# ============================================================
# STEP 4: Thêm Quyền PM-023 (MANAGE_QA) Cho Seller
# ============================================================
Write-Host "Step 4: Them Quyen PM-023 (MANAGE_QA) Cho Seller" -ForegroundColor Yellow
Write-Host "Truoc khi them: $($sellerRole.permissions_count) permissions" -ForegroundColor Gray

# Get current permissions and add PM-023
$currentPerms = $sellerRole.permissions
if (-not ($currentPerms -contains 'PM-023')) {
  $newPerms = @($currentPerms) + @('PM-023')
  
  $addPermBody = @{
    permissionCodes = $newPerms
  } | ConvertTo-Json
  
  Write-Host "Dang them PM-023..." -ForegroundColor Gray
  
  try {
    $addPermResp = Invoke-WebRequest `
      -Uri 'http://localhost:3006/api/v1/admin/rbac/roles/seller/permissions' `
      -Method POST `
      -Headers @{
        'Authorization'="Bearer $token"
        'Content-Type'='application/json'
      } `
      -Body $addPermBody `
      -UseBasicParsing
    
    $addPermData = $addPermResp.Content | ConvertFrom-Json
    
    if ($addPermData.success) {
      Write-Host "Success Them PM-023 thanh cong!" -ForegroundColor Green
      Write-Host "  New permission count: $($addPermData.data.permissions_count)" -ForegroundColor Cyan
      Write-Host "  New role version: $($addPermData.data.new_role_version)" -ForegroundColor Cyan
      Write-Host "  Users need to RE-LOGIN to get new permissions" -ForegroundColor Yellow
    } else {
      Write-Host "Error $($addPermData.message)" -ForegroundColor Red
    }
  } catch {
    $errorBody = $_.Exception.Message
    Write-Host "Error Failed: $errorBody" -ForegroundColor Red
  }
} else {
  Write-Host "Seller already has PM-023" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================
# STEP 5: Verify - Xem Lại Seller Permissions
# ============================================================
Write-Host "Step 5: Verify - Xem Lai Seller Permissions" -ForegroundColor Yellow

$rolesResp2 = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/admin/rbac/roles' `
  -Method GET `
  -Headers @{'Authorization'="Bearer $token"} `
  -UseBasicParsing

$rolesData2 = $rolesResp2.Content | ConvertFrom-Json
$sellerRole2 = $rolesData2.data.roles | Where-Object { $_.code -eq 'seller' }

if ($sellerRole2) {
  Write-Host "Seller Role (After Update):" -ForegroundColor Cyan
  Write-Host "  Total permissions: $($sellerRole2.permissions_count)" -ForegroundColor Gray
  Write-Host "  Role version: $($sellerRole2.role_version)" -ForegroundColor Gray
  
  # Show RFQ + QA permissions
  $rfqQaPerms = $sellerRole2.permissions | Where-Object { $_ -match 'PM-020|PM-021|PM-022|PM-023' }
  Write-Host "  RFQ/QA permissions:" -ForegroundColor Green
  $rfqQaPerms | ForEach-Object { Write-Host "    - $_" -ForegroundColor Green }
}

Write-Host ""

# ============================================================
# STEP 6: Xóa Quyền PM-023 (Demo Remove)
# ============================================================
Write-Host "Step 6: Xoa Quyen PM-023 (Demo Remove)" -ForegroundColor Yellow

try {
  $removeResp = Invoke-WebRequest `
    -Uri 'http://localhost:3006/api/v1/admin/rbac/roles/seller/permissions/PM-023' `
    -Method DELETE `
    -Headers @{'Authorization'="Bearer $token"} `
    -UseBasicParsing
  
  $removeData = $removeResp.Content | ConvertFrom-Json
  
  if ($removeData.success) {
    Write-Host "Success Xoa PM-023 thanh cong!" -ForegroundColor Green
    Write-Host "  New role version: $($removeData.data.new_role_version)" -ForegroundColor Cyan
  } else {
    Write-Host "Error $($removeData.message)" -ForegroundColor Red
  }
} catch {
  Write-Host "Error Failed to remove: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# ============================================================
# STEP 7: Xem Tất Cả Permissions Có Sẵn
# ============================================================
Write-Host "Step 7: Xem Tat Ca Permissions Co San" -ForegroundColor Yellow

$permsResp = Invoke-WebRequest -Uri 'http://localhost:3006/api/v1/admin/rbac/permissions' `
  -Method GET `
  -Headers @{'Authorization'="Bearer $token"} `
  -UseBasicParsing

$permsData = $permsResp.Content | ConvertFrom-Json

if ($permsData.success) {
  Write-Host "Success Total permissions: $($permsData.data.total)" -ForegroundColor Green
  
  $grouped = $permsData.data.grouped
  Write-Host "Grouped by module:" -ForegroundColor Cyan
  
  $grouped.PSObject.Properties | ForEach-Object {
    $moduleName = $_.Name
    $modulePerms = $_.Value
    Write-Host "  $moduleName ($($modulePerms.Count) permissions)" -ForegroundColor Gray
  }
} else {
  Write-Host "Error Failed to fetch permissions" -ForegroundColor Red
}

Write-Host ""

# ============================================================
# KET LUAN
# ============================================================
Write-Host "=".PadRight(60, '=') -ForegroundColor Cyan
Write-Host "KET LUAN" -ForegroundColor Cyan
Write-Host "=".PadRight(60, '=') -ForegroundColor Cyan
Write-Host ""
Write-Host "Success Admin co the quan ly permissions qua API" -ForegroundColor Green
Write-Host "Success KHONG CAN SUA CODE hay RESEED DATABASE" -ForegroundColor Green
Write-Host "Success Permissions tu dong ap dung khi users re-login" -ForegroundColor Green
Write-Host ""
Write-Host "Documentation: HUONG-DAN-ADMIN-RBAC-API.md" -ForegroundColor Yellow
Write-Host "Admin UI: /admin/rbac/matrix (dang phat trien)" -ForegroundColor Yellow
Write-Host ""
